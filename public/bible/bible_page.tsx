"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-Client";
import kjvData from "@/public/bible/kjv.json";
import asvData from "@/public/bible/asv.json";
import ampData from "@/public/bible/amp.json";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Version = "kjv" | "asv" | "amp";

interface VersionMeta {
  label: string;
  fullName: string;
  copyright?: string;
}

const VERSIONS: Record<Version, VersionMeta> = {
  kjv: { label: "KJV", fullName: "King James Version" },
  asv: { label: "ASV", fullName: "American Standard Version", copyright: "Public Domain" },
  amp: { label: "AMP", fullName: "Amplified Bible", copyright: "© The Lockman Foundation." },
};

interface BibleVerse {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface ChapterData {
  book_name: string;
  chapter: number;
  verses: BibleVerse[];
}

interface StrongsEntry {
  original: string;
  transliteration: string;
  pronunciation: string;
  definition: string;
}

interface StrongsDictionary {
  [key: string]: StrongsEntry;
}

// ---------------------------------------------------------------------------
// Local JSON Bible cache — avoids re-fetching the same file repeatedly
// ---------------------------------------------------------------------------
const bibleCache: Partial<Record<Version, Record<string, Record<string, { v: number; t: string }[]>>>> = {};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Bible() {
  const [version, setVersion] = useState<Version>("kjv");

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [book, setBook] = useState("John");
  const [chapterNum, setChapterNum] = useState(1);

  const [searchWord, setSearchWord] = useState("");
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const [strongsDict, setStrongsDict] = useState<StrongsDictionary | null>(null);
  const [strongsLoading, setStrongsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Load the local JSON for a given version (with in-memory cache)
  // ---------------------------------------------------------------------------
  const loadBibleData = async (v: Version) => {
    if (bibleCache[v]) return bibleCache[v]!;
    const res = await fetch(`/bible/${v}.json`);
    if (!res.ok) throw new Error(`Could not load ${VERSIONS[v].fullName} data.`);
    const data = await res.json();
    bibleCache[v] = data;
    return data;
  };

  // Load Strong's dictionary once on mount
  useEffect(() => {
    fetch("/strongs.json")
      .then((r) => r.json())
      .then(setStrongsDict)
      .catch(() => console.error("Strong's dictionary not found."))
      .finally(() => setStrongsLoading(false));
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch chapter from local JSON (works offline, no Supabase needed)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchChapter = async () => {
      setChapterLoading(true);
      setChapterError(null);
      setHighlightedVerse(null);
      setNote("");

      try {
        const bibleData = await loadBibleData(version);
        const rawVerses = bibleData?.[book]?.[String(chapterNum)] as { v: number; t: string }[] | undefined;

        if (!rawVerses || rawVerses.length === 0) {
          throw new Error("Chapter not found in local data.");
        }

        const verses: BibleVerse[] = rawVerses.map((v: { v: number; t: string }, i: number) => ({
          id: i,
          book,
          chapter: chapterNum,
          verse: v.v,
          text: v.t,
        }));

        setChapter({ book_name: book, chapter: chapterNum, verses });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load chapter.";
        setChapterError(message);
        setChapter(null);
      } finally {
        setChapterLoading(false);
      }
    };

    fetchChapter();
  }, [book, chapterNum, version]);

  // Reset search when switching version
  useEffect(() => {
    setSearchResults([]);
    setSearchWord("");
  }, [version]);

  // ---------------------------------------------------------------------------
  // Word search — runs locally over bundled JSON (works offline)
  // ---------------------------------------------------------------------------
  const searchBible = async () => {
    if (!searchWord.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);

    try {
      const bibleData = await loadBibleData(version);
      const word = searchWord.trim().toLowerCase();
      const results: BibleVerse[] = [];

      for (const [bookName, chapters] of Object.entries(bibleData) as [
        string,
        Record<string, { v: number; t: string }[]>
      ][]) {
        for (const [chap, verses] of Object.entries(chapters)) {
          for (const v of verses) {
            if (v.t.toLowerCase().includes(word)) {
              results.push({
                id: results.length,
                book: bookName,
                chapter: Number(chap),
                verse: v.v,
                text: v.t,
              });
            }
          }
        }
      }

      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Save verse to favorites (still uses Supabase — needs login)
  // ---------------------------------------------------------------------------
  const saveFavorite = async (verse: BibleVerse) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      alert("Login required to save favorites.");
      return;
    }
    const { error } = await supabase.from("favorite_verses").insert({
      user_id: userData.user.id,
      book: chapter?.book_name,
      chapter: chapter?.chapter,
      verse: verse.verse,
      text: verse.text,
      version,
    });
    if (error) {
      alert("Failed to save verse. It may already be in your favorites.");
    } else {
      alert("⭐ Verse saved to favorites!");
    }
  };

  // ---------------------------------------------------------------------------
  // Save devotional note (still uses Supabase — needs login)
  // ---------------------------------------------------------------------------
  const saveNote = async () => {
    if (!highlightedVerse) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      alert("Login required to save notes.");
      return;
    }
    const { error } = await supabase.from("devotional_notes").insert({
      user_id: userData.user.id,
      book,
      chapter: chapterNum,
      verse: highlightedVerse,
      note,
      version,
    });
    if (error) {
      alert("Failed to save note.");
    } else {
      alert("📝 Note saved!");
      setNote("");
    }
  };

  // ---------------------------------------------------------------------------
  // Render verse text with Strong's tooltips (KJV only)
  // ---------------------------------------------------------------------------
  const renderVerseText = (text: string): React.ReactNode[] => {
    if (!strongsDict || version !== "kjv") return [text];

    const strongsRegex = /([HG]\d+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = strongsRegex.exec(text)) !== null) {
      const strongsKey = match[0];
      const entry = strongsDict[strongsKey];
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

      if (entry) {
        parts.push(
          <span
            key={`${strongsKey}-${match.index}`}
            className="strongs-tooltip"
            style={{ position: "relative", display: "inline-block", borderBottom: "1px dotted #888", cursor: "help" }}
          >
            {strongsKey}
            <span
              className="strongs-tooltip-content"
              style={{
                visibility: "hidden", width: "280px", backgroundColor: "#333", color: "#fff",
                textAlign: "left", borderRadius: "6px", padding: "8px 12px",
                position: "absolute", zIndex: 1, bottom: "125%", left: "50%",
                marginLeft: "-140px", opacity: 0, transition: "opacity 0.2s",
                pointerEvents: "none", fontSize: "0.9rem", lineHeight: "1.4",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <strong>{entry.original}</strong> ({entry.transliteration})
              <br />
              <span style={{ fontSize: "0.8rem", color: "#ccc" }}>[{entry.pronunciation}]</span>
              <br />
              <span style={{ marginTop: "4px", display: "inline-block" }}>{entry.definition}</span>
            </span>
            <style jsx>{`
              .strongs-tooltip:hover .strongs-tooltip-content { visibility: visible; opacity: 1; }
            `}</style>
          </span>
        );
      } else {
        parts.push(strongsKey);
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main style={{ padding: 40, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Bible Reader</h1>
        <Link
          href="/bible/concordance"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 8,
            color: "#374151", textDecoration: "none", fontSize: "0.9rem",
            fontWeight: 500, backgroundColor: "#fff",
          }}
        >
          📖 Strong&apos;s Concordance
        </Link>
      </div>

      {/* Version Switcher */}
      <div style={{ display: "inline-flex", borderRadius: 8, border: "1px solid #ddd", overflow: "hidden", marginBottom: 28 }}>
        {(Object.keys(VERSIONS) as Version[]).map((v) => (
          <button
            key={v}
            onClick={() => setVersion(v)}
            style={{
              padding: "8px 20px", border: "none",
              borderRight: v !== "amp" ? "1px solid #ddd" : "none",
              cursor: "pointer", fontWeight: version === v ? 700 : 400,
              backgroundColor: version === v ? "#1a1a1a" : "#fff",
              color: version === v ? "#fff" : "#333",
              fontSize: "0.9rem", transition: "all 0.15s ease",
            }}
          >
            {VERSIONS[v].label}
          </button>
        ))}
      </div>

      {/* Version name + copyright */}
      <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 24, marginTop: -16 }}>
        {VERSIONS[version].fullName}
        {VERSIONS[version].copyright && (
          <span style={{ marginLeft: 8, color: "#999" }}>· {VERSIONS[version].copyright}</span>
        )}
        {version === "kjv" && (
          <span style={{ marginLeft: 8, color: "#999" }}>
            · Strong&apos;s concordance numbers are interactive — hover to see definitions
          </span>
        )}
      </p>

      {/* Chapter Selection */}
      <div style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={book}
          onChange={(e) => { setBook(e.target.value); setChapterNum(1); }}
          style={{ padding: "8px 12px", minWidth: 160, borderRadius: 6, border: "1px solid #ccc" }}
        >
          {books.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <span style={{ color: "#666", fontSize: "0.9rem" }}>Chapter</span>
        <input
          type="number"
          value={chapterNum}
          onChange={(e) => setChapterNum(Math.max(1, Number(e.target.value)))}
          min={1}
          style={{ padding: "8px 12px", width: 80, borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>

      {version === "kjv" && strongsLoading && (
        <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: 12 }}>Loading Strong&apos;s dictionary...</p>
      )}

      {/* Chapter Content */}
      {chapterLoading && <p style={{ color: "#666" }}>Loading {VERSIONS[version].label}...</p>}

      {!chapterLoading && chapterError && (
        <div style={{ padding: "16px 20px", backgroundColor: "#fff3f3", border: "1px solid #fca5a5", borderRadius: 8, marginBottom: 24 }}>
          <p style={{ margin: 0, color: "#b91c1c", fontWeight: 600 }}>Could not load {VERSIONS[version].fullName}</p>
          <p style={{ margin: "6px 0 0", color: "#7f1d1d", fontSize: "0.9rem" }}>{chapterError}</p>
        </div>
      )}

      {!chapterLoading && !chapterError && chapter && chapter.verses.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 16 }}>
            {chapter.book_name} {chapter.chapter}
            <span style={{ marginLeft: 10, fontSize: "0.75rem", fontWeight: 400, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {VERSIONS[version].label}
            </span>
          </h2>
          {chapter.verses.map((verse) => (
            <p
              key={verse.id ?? verse.verse}
              onClick={() => setHighlightedVerse(verse.verse)}
              style={{
                cursor: "pointer",
                backgroundColor: highlightedVerse === verse.verse ? "#fff3b0" : "transparent",
                padding: "5px 8px", borderRadius: 6,
                transition: "background-color 0.1s ease",
                display: "flex", alignItems: "baseline", gap: 8, lineHeight: 1.7,
              }}
            >
              <strong style={{ minWidth: 20, flexShrink: 0, color: "#888", fontSize: "0.85rem" }}>{verse.verse}</strong>
              <button
                onClick={(e) => { e.stopPropagation(); saveFavorite(verse); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", padding: "0 2px", flexShrink: 0 }}
                title="Save to favorites"
              >⭐</button>
              <span style={{ flex: 1 }}>{renderVerseText(verse.text)}</span>
            </p>
          ))}
        </div>
      )}

      {!chapterLoading && !chapterError && chapter && chapter.verses.length === 0 && (
        <p style={{ color: "#666" }}>No verses found for this chapter.</p>
      )}

      {/* Devotional Note */}
      {highlightedVerse && (
        <div style={{ marginTop: 32, padding: 20, backgroundColor: "#f9f9f9", borderRadius: 8, border: "1px solid #ddd" }}>
          <h3 style={{ marginBottom: 10 }}>
            Note for {book} {chapterNum}:{highlightedVerse}{" "}
            <span style={{ fontWeight: 400, color: "#888", fontSize: "0.9rem" }}>({VERSIONS[version].label})</span>
          </h3>
          <textarea
            placeholder="Write your devotional note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: "100%", height: 100, padding: 10, fontSize: "1rem", borderRadius: 6, border: "1px solid #ccc", marginBottom: 10, boxSizing: "border-box" }}
          />
          <button
            onClick={saveNote}
            style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "1rem" }}
          >
            Save Note
          </button>
        </div>
      )}

      <hr style={{ margin: "48px 0", borderColor: "#eee" }} />

      {/* Word Search */}
      <h2 style={{ marginBottom: 8 }}>Word Search</h2>
      <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: 16 }}>
        Searches the full {VERSIONS[version].label} locally — works offline.
      </p>
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <input
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchBible()}
          placeholder='Search word (e.g. "faith")'
          style={{ padding: "8px 12px", width: 260, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          onClick={searchBible}
          disabled={searchLoading}
          style={{
            padding: "8px 18px", backgroundColor: "#1a1a1a", color: "#fff",
            border: "none", borderRadius: 6,
            cursor: searchLoading ? "not-allowed" : "pointer",
            opacity: searchLoading ? 0.6 : 1,
          }}
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {!searchLoading && searchResults.length > 0 && (
        <>
          <p style={{ marginBottom: 16 }}>
            <strong>
              &ldquo;{searchWord}&rdquo; appears {searchResults.length} time{searchResults.length !== 1 ? "s" : ""} in the {VERSIONS[version].label}
            </strong>
          </p>
          <div>
            {searchResults.map((verse) => (
              <p key={verse.id} style={{ marginBottom: 10, lineHeight: 1.6 }}>
                <strong style={{ color: "#444" }}>{verse.book} {verse.chapter}:{verse.verse}</strong>{" "}
                {verse.text}
              </p>
            ))}
          </div>
        </>
      )}

      {!searchLoading && searchResults.length === 0 && searchWord && (
        <p style={{ color: "#666" }}>No verses found. Try a different word or phrase.</p>
      )}
    </main>
  );
}