"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-Client";

// Complete list of Bible books in canonical order
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
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

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

export default function Bible() {
  // Chapter Reader States
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [book, setBook] = useState("John");
  const [chapterNum, setChapterNum] = useState(1);
  const [version] = useState("kjv");

  // Word Search States
  const [searchWord, setSearchWord] = useState("");
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Verse Highlighting & Notes States
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [note, setNote] = useState("");

  // Strong's Dictionary State
  const [strongsDict, setStrongsDict] = useState<StrongsDictionary | null>(null);
  const [strongsLoading, setStrongsLoading] = useState(true);

  // Load Strong's dictionary on mount
  useEffect(() => {
    const loadStrongs = async () => {
      try {
        const response = await fetch("/strongs.json");
        if (!response.ok) {
          throw new Error("Failed to load Strong's dictionary");
        }
        const data = await response.json();
        setStrongsDict(data);
      } catch (error) {
        console.error("Error loading Strong's:", error);
      } finally {
        setStrongsLoading(false);
      }
    };
    loadStrongs();
  }, []);

  // Fetch chapter when book or chapter changes
  useEffect(() => {
    const fetchChapter = async () => {
      setChapterLoading(true);
      setHighlightedVerse(null);
      setNote(""); // Clear note when chapter changes

      const { data, error } = await supabase
        .from("bible_verses")
        .select("*")
        .eq("book", book)
        .eq("chapter", chapterNum)
        .order("verse", { ascending: true });

      if (error) {
        console.error("Error fetching chapter:", error);
        setChapter(null);
      } else {
        setChapter({
          book_name: book,
          chapter: chapterNum,
          verses: data || [],
        });
      }

      setChapterLoading(false);
    };

    fetchChapter();
  }, [book, chapterNum]);

  // Search verses by word/phrase using Supabase ilike
  const searchBible = async () => {
    if (!searchWord.trim()) return;

    setSearchLoading(true);
    setSearchResults([]);

    const { data, error } = await supabase
      .from("bible_verses")
      .select("*")
      .ilike("text", `%${searchWord}%`)
      .order("book")
      .order("chapter")
      .order("verse");

    if (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } else {
      setSearchResults(data || []);
    }

    setSearchLoading(false);
  };

  // Save a verse to favorites (requires authentication)
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
    });

    if (error) {
      console.error("Error saving verse:", error);
      alert("Failed to save verse. It may already be in your favorites.");
    } else {
      alert("⭐ Verse saved to favorites!");
    }
  };

  // Save a devotional note for the highlighted verse
  const saveNote = async () => {
    if (!highlightedVerse) return;

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      alert("Login required to save notes.");
      return;
    }

    const { error } = await supabase.from("devotional_notes").insert({
      user_id: userData.user.id,
      book: book,
      chapter: chapterNum,
      verse: highlightedVerse,
      note: note,
    });

    if (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note.");
    } else {
      alert("📝 Note saved!");
      setNote(""); // Clear textarea after successful save
    }
  };

  /**
   * Parse verse text and replace Strong's numbers (e.g., H7225, G25)
   * with interactive tooltip spans.
   */
  const renderVerseText = (text: string): React.ReactNode[] => {
    if (!strongsDict) {
      return [text];
    }

    const strongsRegex = /([HG]\d+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = strongsRegex.exec(text)) !== null) {
      const strongsKey = match[0];
      const entry = strongsDict[strongsKey];

      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

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

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Bible Reader</h1>

      {/* Chapter Selection */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <select
          value={book}
          onChange={(e) => setBook(e.target.value)}
          style={{ padding: "8px 12px", minWidth: 150 }}
        >
          {books.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={chapterNum}
          onChange={(e) => setChapterNum(Number(e.target.value))}
          min={1}
          style={{ padding: "8px 12px", width: 80 }}
        />
        <button
          onClick={() => {
            setBook(book);
            setChapterNum(chapterNum);
          }}
        >
          Go
        </button>
      </div>

      {/* Strong's loading indicator */}
      {strongsLoading && (
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          Loading Strong's dictionary...
        </p>
      )}

      {/* Chapter Reader Section */}
      {chapterLoading && <p>Loading chapter...</p>}
      {!chapterLoading && chapter && chapter.verses.length > 0 && (
        <div>
          <h2>
            {chapter.book_name} {chapter.chapter}
          </h2>
          {chapter.verses.map((verse) => (
            <p
              key={verse.id}
              onClick={() => setHighlightedVerse(verse.verse)}
              style={{
                cursor: "pointer",
                backgroundColor:
                  highlightedVerse === verse.verse ? "#fff3b0" : "transparent",
                padding: "5px",
                borderRadius: "6px",
                transition: "background-color 0.1s ease",
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
              }}
            >
              <strong style={{ marginRight: "4px" }}>{verse.verse}</strong>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveFavorite(verse);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  padding: "0 4px",
                  marginRight: "8px",
                }}
                title="Save to favorites"
              >
                ⭐
              </button>
              <span style={{ flex: 1 }}>
                {strongsDict ? renderVerseText(verse.text) : verse.text}
              </span>
            </p>
          ))}
        </div>
      )}
      {!chapterLoading && chapter && chapter.verses.length === 0 && (
        <p>No verses found for this chapter.</p>
      )}

      {/* Devotional Note Section (appears when a verse is highlighted) */}
      {highlightedVerse && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            backgroundColor: "#f9f9f9",
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        >
          <h3>
            Note for {book} {chapterNum}:{highlightedVerse}
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

      <hr style={{ margin: "40px 0" }} />

      <h2>Word Search</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          placeholder="Search word (e.g. faith)"
          onKeyDown={(e) => e.key === "Enter" && searchBible()}
          style={{ padding: "8px 12px", width: 250 }}
        />
        <button
          style={{ marginLeft: 10 }}
          onClick={searchBible}
          disabled={searchLoading}
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {searchLoading && <p>Searching database...</p>}

      {!searchLoading && searchResults.length > 0 && (
        <>
          <p>
            <strong>
              "{searchWord}" appears {searchResults.length} time
              {searchResults.length !== 1 ? "s" : ""} in {version.toUpperCase()}
            </strong>
          </p>

          <div style={{ marginTop: 20 }}>
            {searchResults.map((verse) => (
              <p key={verse.id}>
                <strong>
                  {verse.book} {verse.chapter}:{verse.verse}
                </strong>{" "}
                {verse.text}
              </p>
            ))}
          </div>
        </>
      )}

      {!searchLoading && searchResults.length === 0 && searchWord && (
        <p>No verses found. Try a different word or phrase.</p>
      )}
    </main>
  );
}