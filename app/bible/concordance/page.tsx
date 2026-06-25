"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-Client";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrongsEntry {
  id: string;
  original: string;
  transliteration: string;
  pronunciation: string;
  definition: string;
}

interface StrongsDict {
  [key: string]: Omit<StrongsEntry, "id">;
}

interface BibleVerse {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface ConcordanceResult {
  entry: StrongsEntry;
  count: number;
  verses: BibleVerse[] | null;
  versesLoaded: boolean;
  expanded: boolean;
  versesLoading: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the query looks like a Strong's number e.g. H157 or G26 */
const isStrongsNumber = (input: string): boolean =>
  /^[HGhg]\d+$/.test(input.trim());

/** Strip embedded Strong's numbers from verse text for clean display */
const cleanVerseText = (text: string): string =>
  text.replace(/[{]?[HG]\d+[}]?/g, "").replace(/\s{2,}/g, " ").trim();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConcordancePage() {
  const [strongsDict, setStrongsDict] = useState<StrongsDict | null>(null);
  const [dictLoading, setDictLoading] = useState(true);
  const [dictError, setDictError] = useState(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ConcordanceResult[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [totalOccurrences, setTotalOccurrences] = useState(0);
  const [matchedRoots, setMatchedRoots] = useState(0);

  // Load strongs.json dictionary once on mount
  useEffect(() => {
    fetch("/strongs.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        setStrongsDict(data);
        setDictLoading(false);
      })
      .catch(() => {
        setDictError(true);
        setDictLoading(false);
      });
  }, []);

  // ---------------------------------------------------------------------------
  // Count occurrences of a Strong's number in Supabase KJV
  // ---------------------------------------------------------------------------
  const countOccurrences = async (strongsId: string): Promise<number> => {
    const { count, error } = await supabase
      .from("bible_verses")
      .select("*", { count: "exact", head: true })
      .ilike("text", `%${strongsId}%`)
      .eq("version", "kjv");

    if (error) return 0;
    return count ?? 0;
  };

  // ---------------------------------------------------------------------------
  // Load all verses for a specific Strong's number
  // ---------------------------------------------------------------------------
  const fetchVerses = async (strongsId: string): Promise<BibleVerse[]> => {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("id, book, chapter, verse, text")
      .ilike("text", `%${strongsId}%`)
      .eq("version", "kjv")
      .order("book")
      .order("chapter")
      .order("verse");

    if (error) return [];
    return (data as BibleVerse[]) ?? [];
  };

  // ---------------------------------------------------------------------------
  // Main search handler
  // ---------------------------------------------------------------------------
  const handleSearch = async () => {
    if (!query.trim() || !strongsDict || searching) return;

    setSearching(true);
    setResults([]);
    setSearchedQuery(query.trim());
    setTotalOccurrences(0);
    setMatchedRoots(0);

    const trimmed = query.trim();

    if (isStrongsNumber(trimmed)) {
      // ── Single Strong's number lookup ───────────────────────────────────
      const id = trimmed.toUpperCase();
      const dictEntry = strongsDict[id];
      const count = await countOccurrences(id);

      const entry: StrongsEntry = {
        id,
        original: dictEntry?.original ?? "",
        transliteration: dictEntry?.transliteration ?? "",
        pronunciation: dictEntry?.pronunciation ?? "",
        definition: dictEntry?.definition ?? "Definition not found in dictionary.",
      };

      setTotalOccurrences(count);
      setMatchedRoots(1);
      setResults([
        { entry, count, verses: null, versesLoaded: false, expanded: false, versesLoading: false },
      ]);
    } else {
      // ── English word search ─────────────────────────────────────────────
      const word = trimmed.toLowerCase();

      // Filter strongs.json entries whose definition or transliteration contains the word
      const matchingEntries: StrongsEntry[] = [];
      for (const [id, data] of Object.entries(strongsDict)) {
        if (
          data.definition?.toLowerCase().includes(word) ||
          data.transliteration?.toLowerCase().includes(word)
        ) {
          matchingEntries.push({ id, ...data });
        }
      }

      // Cap at 60 to keep the query load reasonable
      const limited = matchingEntries.slice(0, 60);

      // Fetch all counts in parallel
      const counts = await Promise.all(
        limited.map((entry) => countOccurrences(entry.id))
      );

      // Build results, filter out zero-count entries, sort most frequent first
      const withCounts: ConcordanceResult[] = limited
        .map((entry, i) => ({
          entry,
          count: counts[i],
          verses: null,
          versesLoaded: false,
          expanded: false,
          versesLoading: false,
        }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count);

      const total = withCounts.reduce((sum, r) => sum + r.count, 0);
      setTotalOccurrences(total);
      setMatchedRoots(withCounts.length);
      setResults(withCounts);
    }

    setSearching(false);
  };

  // ---------------------------------------------------------------------------
  // Toggle verse list for a result card
  // ---------------------------------------------------------------------------
  const toggleVerses = async (index: number) => {
    const result = results[index];

    if (result.expanded) {
      // Collapse without unloading data
      setResults((prev) =>
        prev.map((r, i) => (i === index ? { ...r, expanded: false } : r))
      );
      return;
    }

    if (result.versesLoaded && result.verses) {
      // Already loaded — just expand
      setResults((prev) =>
        prev.map((r, i) => (i === index ? { ...r, expanded: true } : r))
      );
      return;
    }

    // Load verses for the first time
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, versesLoading: true } : r))
    );

    const verses = await fetchVerses(result.entry.id);

    setResults((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, verses, versesLoaded: true, expanded: true, versesLoading: false }
          : r
      )
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Back link */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/bible"
          style={{ color: "#555", fontSize: "0.9rem", textDecoration: "none" }}
        >
          ← Back to Bible Reader
        </Link>
      </div>

      <h1 style={{ marginBottom: 6 }}>Strong&apos;s Concordance</h1>
      <p style={{ color: "#666", marginBottom: 32, lineHeight: 1.6 }}>
        Search by <strong>English word</strong> to discover every Hebrew and Greek root behind it,
        along with how many times each appears in the KJV. Or search directly by{" "}
        <strong>Strong&apos;s number</strong> (e.g.{" "}
        <button
          onClick={() => setQuery("H157")}
          style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, fontSize: "inherit" }}
        >
          H157
        </button>
        {" "}or{" "}
        <button
          onClick={() => setQuery("G26")}
          style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, fontSize: "inherit" }}
        >
          G26
        </button>
        ) to see every verse it appears in.
      </p>

      {/* Dictionary load error */}
      {dictError && (
        <div style={{
          padding: "14px 18px", backgroundColor: "#fff3f3",
          border: "1px solid #fca5a5", borderRadius: 8, marginBottom: 24,
        }}>
          <p style={{ margin: 0, color: "#b91c1c" }}>
            Could not load Strong&apos;s dictionary. Make sure{" "}
            <code>strongs.json</code> is in your <code>public/</code> folder.
          </p>
        </div>
      )}

      {/* ── Search bar ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder='e.g. "love", "faith", "H157", "G26"'
          disabled={dictLoading || dictError}
          style={{
            padding: "10px 14px", fontSize: "1rem",
            border: "1px solid #d1d5db", borderRadius: 8,
            flex: 1, minWidth: 240,
            outline: "none",
          }}
        />
        <button
          onClick={handleSearch}
          disabled={searching || dictLoading || !query.trim()}
          style={{
            padding: "10px 28px",
            backgroundColor: "#1a1a1a", color: "#fff",
            border: "none", borderRadius: 8,
            cursor: searching || dictLoading ? "not-allowed" : "pointer",
            opacity: searching || dictLoading ? 0.6 : 1,
            fontSize: "1rem", fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {dictLoading ? "Loading dictionary…" : searching ? "Searching…" : "Search"}
        </button>
      </div>

      {/* ── Summary banner ── */}
      {!searching && results.length > 0 && (
        <div style={{
          padding: "14px 20px",
          backgroundColor: "#f0f9ff", border: "1px solid #bae6fd",
          borderRadius: 8, marginBottom: 24,
        }}>
          {isStrongsNumber(searchedQuery) ? (
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              <strong>{searchedQuery.toUpperCase()}</strong> appears{" "}
              <strong style={{ fontSize: "1.1rem" }}>
                {totalOccurrences.toLocaleString()}
              </strong>{" "}
              time{totalOccurrences !== 1 ? "s" : ""} in the KJV Bible.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              <strong>&ldquo;{searchedQuery}&rdquo;</strong> maps to{" "}
              <strong>{matchedRoots} Hebrew/Greek root{matchedRoots !== 1 ? "s" : ""}</strong>{" "}
              with a combined{" "}
              <strong style={{ fontSize: "1.1rem" }}>
                {totalOccurrences.toLocaleString()}
              </strong>{" "}
              occurrence{totalOccurrences !== 1 ? "s" : ""} across the KJV.
            </p>
          )}
        </div>
      )}

      {/* ── Result cards ── */}
      {!searching && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {results.map((result, index) => (
            <div
              key={result.entry.id}
              style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}
            >
              {/* Card header */}
              <div style={{
                padding: "14px 18px", backgroundColor: "#fafafa",
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", gap: 12, flexWrap: "wrap",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    {/* Strong's number badge */}
                    <span style={{
                      fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem",
                      color: "#1e40af", backgroundColor: "#dbeafe",
                      padding: "2px 8px", borderRadius: 4,
                    }}>
                      {result.entry.id}
                    </span>

                    {/* Hebrew / Greek badge */}
                    <span style={{
                      fontSize: "0.75rem", padding: "2px 7px", borderRadius: 4,
                      color: result.entry.id.startsWith("H") ? "#92400e" : "#065f46",
                      backgroundColor: result.entry.id.startsWith("H") ? "#fef3c7" : "#d1fae5",
                    }}>
                      {result.entry.id.startsWith("H") ? "Hebrew" : "Greek"}
                    </span>

                    {/* Original word */}
                    {result.entry.original && (
                      <span style={{ fontSize: "1.1rem", color: "#444" }}>
                        {result.entry.original}
                      </span>
                    )}

                    {/* Transliteration */}
                    {result.entry.transliteration && (
                      <span style={{ fontSize: "0.9rem", color: "#888", fontStyle: "italic" }}>
                        ({result.entry.transliteration})
                      </span>
                    )}
                  </div>

                  {/* Definition */}
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#444", lineHeight: 1.55 }}>
                    {result.entry.definition}
                  </p>
                </div>

                {/* Count + toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1, color: "#111" }}>
                      {result.count.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      verse{result.count !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVerses(index)}
                    disabled={result.versesLoading}
                    style={{
                      padding: "7px 16px",
                      border: "1px solid #d1d5db", borderRadius: 6,
                      backgroundColor: result.expanded ? "#1a1a1a" : "#fff",
                      color: result.expanded ? "#fff" : "#374151",
                      cursor: result.versesLoading ? "wait" : "pointer",
                      fontSize: "0.85rem", fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {result.versesLoading ? "Loading…" : result.expanded ? "Hide verses" : "Show verses"}
                  </button>
                </div>
              </div>

              {/* Verse list */}
              {result.expanded && result.verses && (
                <div style={{ borderTop: "1px solid #e5e7eb" }}>
                  {result.verses.slice(0, 200).map((verse) => (
                    <div
                      key={`${verse.book}-${verse.chapter}-${verse.verse}`}
                      style={{
                        padding: "9px 18px",
                        borderBottom: "1px solid #f3f4f6",
                        fontSize: "0.9rem", lineHeight: 1.6,
                        display: "flex", gap: 10, alignItems: "baseline",
                      }}
                    >
                      <span style={{
                        color: "#1e40af", fontWeight: 600,
                        whiteSpace: "nowrap", flexShrink: 0, minWidth: 140,
                      }}>
                        {verse.book} {verse.chapter}:{verse.verse}
                      </span>
                      <span style={{ color: "#333" }}>
                        {cleanVerseText(verse.text)}
                      </span>
                    </div>
                  ))}

                  {result.verses.length > 200 && (
                    <p style={{
                      padding: "12px 18px", margin: 0,
                      color: "#888", fontSize: "0.85rem", textAlign: "center",
                    }}>
                      Showing first 200 of {result.verses.length.toLocaleString()} verses.
                      Open the{" "}
                      <Link href="/bible" style={{ color: "#2563eb" }}>
                        Bible Reader
                      </Link>{" "}
                      to explore further.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!searching && searchedQuery && results.length === 0 && (
        <div style={{
          padding: "20px 24px", backgroundColor: "#fafafa",
          border: "1px solid #e5e7eb", borderRadius: 8,
        }}>
          <p style={{ margin: 0, color: "#555" }}>
            No results found for <strong>&ldquo;{searchedQuery}&rdquo;</strong>.
          </p>
          <p style={{ margin: "8px 0 0", fontSize: "0.875rem", color: "#888" }}>
            Try a simpler word (e.g. &ldquo;love&rdquo; instead of &ldquo;loving&rdquo;), or
            check that your Strong&apos;s number is correct.
          </p>
        </div>
      )}
    </main>
  );
}