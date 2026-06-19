"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-Client";

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

// API.Bible book abbreviations (USFM standard)
const BOOK_TO_USFM: Record<string, string> = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
  "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
  "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
  "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA",
  "Jeremiah": "JER", "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN",
  "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA",
  "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB",
  "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
  "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT",
  "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
  "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP",
  "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
  "1 Timothy": "1TI", "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM",
  "Hebrews": "HEB", "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE",
  "1 John": "1JN", "2 John": "2JN", "3 John": "3JN", "Jude": "JUD",
  "Revelation": "REV",
};

// API.Bible Amplified Bible ID
const AMP_BIBLE_ID = "06125adad2d5898a-01";

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
  amp: {
    label: "AMP",
    fullName: "Amplified Bible",
    copyright: "© The Lockman Foundation. Used via API.Bible.",
  },
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
// External API helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a chapter from bible-api.com (supports KJV and ASV, public domain).
 */
async function fetchFromBibleApi(
  book: string,
  chapter: number,
  translation: "asv"
): Promise<BibleVerse[]> {
  const bookSlug = book.toLowerCase().replace(/\s+/g, "+");
  const url = `https://bible-api.com/${bookSlug}+${chapter}?translation=${translation}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`bible-api.com error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return (data.verses || []).map((v: Record<string, unknown>, i: number) => ({
    id: i,
    book: String(v.book_name),
    chapter: Number(v.chapter),
    verse: Number(v.verse),
    text: String(v.text).trim(),
  }));
}

/**
 * Fetch a chapter from API.Bible (Amplified Bible).
 * Requires NEXT_PUBLIC_BIBLE_API_KEY to be set.
 *
 * API.Bible returns plain text with verse numbers as [1], [2], etc.
 * We parse that into individual verse objects.
 */
async function fetchFromApiBible(
  book: string,
  chapter: number
): Promise<BibleVerse[]> {
  const apiKey = process.env.NEXT_PUBLIC_BIBLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Amplified Bible requires a NEXT_PUBLIC_BIBLE_API_KEY environment variable. " +
      "Get a free key at scripture.api.bible"
    );
  }

  const usfm = BOOK_TO_USFM[book];
  if (!usfm) throw new Error(`Unknown book: ${book}`);

  const chapterId = `${usfm}.${chapter}`;
  const url =
    `https://api.scripture.api.bible/v1/bibles/${AMP_BIBLE_ID}/chapters/${chapterId}` +
    `?content-type=text&include-verse-numbers=true&include-titles=false`;

  const res = await fetch(url, { headers: { "api-key": apiKey } });
  if (!res.ok) throw new Error(`API.Bible error: ${res.status}`);

  const data = await res.json();
  const rawText: string = data?.data?.content ?? "";

  // API.Bible plain-text format: "[ 1 ] In the beginning..."
  // Split on verse markers and reconstruct verse objects
  const versePattern = /\[\s*(\d+)\s*\]/g;
  const verses: BibleVerse[] = [];
  const parts = rawText.split(versePattern);

  // parts alternates: [prefix, verseNum, verseText, verseNum, verseText, ...]
  for (let i = 1; i < parts.length - 1; i += 2) {
    const verseNum = parseInt(parts[i], 10);
    const text = (parts[i + 1] ?? "").replace(/\n+/g, " ").trim();
    if (text) {
      verses.push({ id: verseNum, book, chapter, verse: verseNum, text });
    }
  }

  return verses;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Bible() {
  const [version, setVersion] = useState<Version>("kjv");

  // Chapter reader state
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [book, setBook] = useState("John");
  const [chapterNum, setChapterNum] = useState(1);

  // Word search state (KJV only via Supabase)
  const [searchWord, setSearchWord] = useState("");
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Verse highlighting & notes
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [note, setNote] = useState("");

  // Strong's dictionary (KJV only)
  const [strongsDict, setStrongsDict] = useState<StrongsDictionary | null>(null);
  const [strongsLoading, setStrongsLoading] = useState(true);

  // Load Strong's dictionary once on mount
  useEffect(() => {
    const loadStrongs = async () => {
      try {
        const response = await fetch("/strongs.json");
        if (!response.ok) throw new Error("Failed to load Strong's dictionary");
        setStrongsDict(await response.json());
      } catch (error) {
        console.error("Error loading Strong's:", error);
      } finally {
        setStrongsLoading(false);
      }
    };
    loadStrongs();
  }, []);

  // Fetch chapter whenever book, chapter number, or version changes
  useEffect(() => {
    const fetchChapter = async () => {
      setChapterLoading(true);
      setChapterError(null);
      setHighlightedVerse(null);
      setNote("");

      try {
        let verses: BibleVerse[] = [];

        if (version === "kjv") {
          // Supabase — existing KJV data
          const { data, error } = await supabase
            .from("bible_verses")
            .select("*")
            .eq("book", book)
            .eq("chapter", chapterNum)
            .order("verse", { ascending: true });

          if (error) throw error;
          verses = data || [];
        } else if (version === "asv") {
          // Supabase — ASV data imported from asvs.csv
          const { data, error } = await supabase
            .from("bible_verses")
            .select("*")
            .eq("book", book)
            .eq("chapter", chapterNum)
            .eq("version", "asv")
            .order("verse", { ascending: true });

          if (error) throw error;
          verses = data || [];
        } else if (version === "amp") {
          verses = await fetchFromApiBible(book, chapterNum);
        }

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

  // Reset search results when switching version
  useEffect(() => {
    setSearchResults([]);
    setSearchWord("");
  }, [version]);

  // KJV + ASV word search via Supabase (AMP uses external API so not searchable)
  const searchBible = async () => {
    if (!searchWord.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);

    const { data, error } = await supabase
      .from("bible_verses")
      .select("*")
      .ilike("text", `%${searchWord}%`)
      .eq("version", version === "amp" ? "kjv" : version)
      .order("book")
      .order("chapter")
      .order("verse");

    if (!error) setSearchResults(data || []);
    setSearchLoading(false);
  };

  // Save verse to favorites
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

  // Save devotional note
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

  // Render verse text with Strong's tooltips (KJV only)
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
            style={{
              position: "relative",
              display: "inline-block",
              borderBottom: "1px dotted #888",
              cursor: "help",
            }}
          >
            {strongsKey}
            <span
              className="strongs-tooltip-content"
              style={{
                visibility: "hidden",
                width: "280px",
                backgroundColor: "#333",
                color: "#fff",
                textAlign: "left",
                borderRadius: "6px",
                padding: "8px 12px",
                position: "absolute",
                zIndex: 1,
                bottom: "125%",
                left: "50%",
                marginLeft: "-140px",
                opacity: 0,
                transition: "opacity 0.2s",
                pointerEvents: "none",
                fontSize: "0.9rem",
                lineHeight: "1.4",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <strong>{entry.original}</strong> ({entry.transliteration})
              <br />
              <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                [{entry.pronunciation}]
              </span>
              <br />
              <span style={{ marginTop: "4px", display: "inline-block" }}>
                {entry.definition}
              </span>
            </span>
            <style jsx>{`
              .strongs-tooltip:hover .strongs-tooltip-content {
                visibility: visible;
                opacity: 1;
              }
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
      <h1 style={{ marginBottom: 24 }}>Bible Reader</h1>

      {/* ── Version Switcher ── */}
      <div
        style={{
          display: "inline-flex",
          borderRadius: 8,
          border: "1px solid #ddd",
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        {(Object.keys(VERSIONS) as Version[]).map((v) => (
          <button
            key={v}
            onClick={() => setVersion(v)}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRight: v !== "amp" ? "1px solid #ddd" : "none",
              cursor: "pointer",
              fontWeight: version === v ? 700 : 400,
              backgroundColor: version === v ? "#1a1a1a" : "#fff",
              color: version === v ? "#fff" : "#333",
              fontSize: "0.9rem",
              transition: "all 0.15s ease",
            }}
          >
            {VERSIONS[v].label}
          </button>
        ))}
      </div>

      {/* Version name + copyright notice */}
      <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 24, marginTop: -16 }}>
        {VERSIONS[version].fullName}
        {VERSIONS[version].copyright && (
          <span style={{ marginLeft: 8, color: "#999" }}>
            · {VERSIONS[version].copyright}
          </span>
        )}
        {version === "kjv" && (
          <span style={{ marginLeft: 8, color: "#999" }}>
            · Strong&apos;s concordance numbers are interactive — hover to see definitions
          </span>
        )}
      </p>

      {/* ── Chapter Selection ── */}
      <div style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={book}
          onChange={(e) => { setBook(e.target.value); setChapterNum(1); }}
          style={{ padding: "8px 12px", minWidth: 160, borderRadius: 6, border: "1px solid #ccc" }}
        >
          {books.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
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

      {/* Strong's loading indicator (KJV only) */}
      {version === "kjv" && strongsLoading && (
        <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: 12 }}>
          Loading Strong&apos;s dictionary...
        </p>
      )}

      {/* ── Chapter Content ── */}
      {chapterLoading && (
        <p style={{ color: "#666" }}>Loading {VERSIONS[version].label}...</p>
      )}

      {!chapterLoading && chapterError && (
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "#fff3f3",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <p style={{ margin: 0, color: "#b91c1c", fontWeight: 600 }}>
            Could not load {VERSIONS[version].fullName}
          </p>
          <p style={{ margin: "6px 0 0", color: "#7f1d1d", fontSize: "0.9rem" }}>
            {chapterError}
          </p>
          {version === "amp" && chapterError.includes("NEXT_PUBLIC_BIBLE_API_KEY") && (
            <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "#555" }}>
              To enable the Amplified Bible:
              <ol style={{ margin: "6px 0 0 20px", paddingLeft: 0 }}>
                <li>Get a free API key at{" "}
                  <a href="https://scripture.api.bible" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                    scripture.api.bible
                  </a>
                </li>
                <li>Add <code>NEXT_PUBLIC_BIBLE_API_KEY</code> to your Vercel environment variables</li>
                <li>Redeploy</li>
              </ol>
            </p>
          )}
        </div>
      )}

      {!chapterLoading && !chapterError && chapter && chapter.verses.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 16 }}>
            {chapter.book_name} {chapter.chapter}
            <span style={{
              marginLeft: 10,
              fontSize: "0.75rem",
              fontWeight: 400,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
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
                padding: "5px 8px",
                borderRadius: 6,
                transition: "background-color 0.1s ease",
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ minWidth: 20, flexShrink: 0, color: "#888", fontSize: "0.85rem" }}>
                {verse.verse}
              </strong>
              <button
                onClick={(e) => { e.stopPropagation(); saveFavorite(verse); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "0 2px",
                  flexShrink: 0,
                }}
                title="Save to favorites"
              >
                ⭐
              </button>
              <span style={{ flex: 1 }}>
                {renderVerseText(verse.text)}
              </span>
            </p>
          ))}
        </div>
      )}

      {!chapterLoading && !chapterError && chapter && chapter.verses.length === 0 && (
        <p style={{ color: "#666" }}>No verses found for this chapter.</p>
      )}

      {/* ── Devotional Note ── */}
      {highlightedVerse && (
        <div
          style={{
            marginTop: 32,
            padding: 20,
            backgroundColor: "#f9f9f9",
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        >
          <h3 style={{ marginBottom: 10 }}>
            Note for {book} {chapterNum}:{highlightedVerse}{" "}
            <span style={{ fontWeight: 400, color: "#888", fontSize: "0.9rem" }}>
              ({VERSIONS[version].label})
            </span>
          </h3>
          <textarea
            placeholder="Write your devotional note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: "100%",
              height: 100,
              padding: 10,
              fontSize: "1rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={saveNote}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Save Note
          </button>
        </div>
      )}

      <hr style={{ margin: "48px 0", borderColor: "#eee" }} />

      {/* ── Word Search (KJV + ASV via Supabase; AMP not searchable) ── */}
      <h2 style={{ marginBottom: 8 }}>Word Search</h2>

      {version === "amp" ? (
        <div
          style={{
            padding: "14px 18px",
            backgroundColor: "#f0f4ff",
            borderRadius: 8,
            border: "1px solid #c7d7fd",
            color: "#3730a3",
            fontSize: "0.9rem",
          }}
        >
          Word search is available for <strong>KJV</strong> and <strong>ASV</strong>. Switch versions above to search.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
            <input
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder='Search word (e.g. "faith")'
              onKeyDown={(e) => e.key === "Enter" && searchBible()}
              style={{ padding: "8px 12px", width: 260, borderRadius: 6, border: "1px solid #ccc" }}
            />
            <button
              onClick={searchBible}
              disabled={searchLoading}
              style={{
                padding: "8px 18px",
                backgroundColor: "#1a1a1a",
                color: "#fff",
                border: "none",
                borderRadius: 6,
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
                  &ldquo;{searchWord}&rdquo; appears {searchResults.length} time
                  {searchResults.length !== 1 ? "s" : ""} in the {VERSIONS[version].label}
                </strong>
              </p>
              <div>
                {searchResults.map((verse) => (
                  <p key={verse.id} style={{ marginBottom: 10, lineHeight: 1.6 }}>
                    <strong style={{ color: "#444" }}>
                      {verse.book} {verse.chapter}:{verse.verse}
                    </strong>{" "}
                    {verse.text}
                  </p>
                ))}
              </div>
            </>
          )}

          {!searchLoading && searchResults.length === 0 && searchWord && (
            <p style={{ color: "#666" }}>No verses found. Try a different word or phrase.</p>
          )}
        </>
      )}
    </main>
  );
}