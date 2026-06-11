"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-Client";

interface Booking {
  id: string | number;
  full_name: string;
  email: string; // ← required for client_notes table
  session_date: string;
  session_time: string;
  admin_notes?: string | null;
}

interface NotesModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function NotesModal({ booking, onClose }: NotesModalProps) {
  const [noteText, setNoteText] = useState(booking.admin_notes || "");
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);
  const [progressRating, setProgressRating] = useState<number | undefined>(
    undefined
  );
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);

    const payload = {
      booking_id: booking.id,
      client_email: booking.email,
      session_date: booking.session_date,
      notes: noteText,
      mood_score: moodScore || null,
      progress_rating: progressRating || null,
      session_summary: summary,
    };

    const { error } = await supabase.from("client_notes").upsert(payload, {
      onConflict: "booking_id", // adjust if your table uses a different unique key
    });

    if (error) {
      alert("Error saving notes: " + error.message);
    } else {
      alert("Notes saved successfully.");
      onClose(); // close modal; parent will refresh
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Notes for {booking.full_name}</h2>
        <p className="text-sm text-gray-500 -mt-3">
          {booking.session_date} at {booking.session_time}
        </p>

        {/* Mood Score */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Mood Score (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={moodScore ?? ""}
            onChange={(e) =>
              setMoodScore(e.target.value ? parseInt(e.target.value) : undefined)
            }
            placeholder="1-10"
            className="w-full border rounded p-2"
          />
        </div>

        {/* Progress Rating */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Progress Rating (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={progressRating ?? ""}
            onChange={(e) =>
              setProgressRating(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder="1-10"
            className="w-full border rounded p-2"
          />
        </div>

        {/* Session Summary */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Session Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full border rounded p-2 resize-y"
            placeholder="Brief summary of the session..."
          />
        </div>

        {/* Internal Notes (admin_notes / general notes) */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            className="w-full border rounded p-2 resize-y"
            placeholder="Internal notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={saveNotes}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}