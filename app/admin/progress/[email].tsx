"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-Client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Booking {
  id: string | number;
  full_name: string;
  email: string;
  session_date: string;
  session_time: string;
  admin_notes?: string | null;
}

interface NotesModalProps {
  booking: Booking;
  onClose: () => void;
}

interface ClientNote {
  id: number;
  booking_id: number;
  client_email: string;
  session_date: string;
  notes: string | null;
  mood_score: number | null;
  progress_rating: number | null;
  session_summary: string | null;
}

export default function NotesModal({ booking, onClose }: NotesModalProps) {
  // Existing session fields
  const [noteText, setNoteText] = useState(booking.admin_notes || "");
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);
  const [progressRating, setProgressRating] = useState<number | undefined>(undefined);
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  // Chart data & history
  const [allNotes, setAllNotes] = useState<ClientNote[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch historical notes for this client
  useEffect(() => {
    if (!booking.email) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("client_email", booking.email)
        .order("session_date", { ascending: true });

      if (!error && data) {
        setAllNotes(data);
      }
      setLoadingHistory(false);
    };

    fetchHistory();
  }, [booking.email]);

  // Save current session’s notes
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
      onConflict: "booking_id",
    });

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Notes saved.");
      onClose(); // close & refresh parent
    }
    setSaving(false);
  };

  // Averages & stats
  const totalSessions = allNotes.length;
  const avgMood =
    totalSessions > 0
      ? (
          allNotes.reduce((sum, n) => sum + (n.mood_score || 0), 0) / totalSessions
        ).toFixed(1)
      : "—";
  const avgProgress =
    totalSessions > 0
      ? (
          allNotes.reduce((sum, n) => sum + (n.progress_rating || 0), 0) /
          totalSessions
        ).toFixed(1)
      : "—";

  // Chart data
  const chartData = {
    labels: allNotes.map((n) =>
      new Date(n.session_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Mood Score",
        data: allNotes.map((n) => n.mood_score),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: "Progress Rating",
        data: allNotes.map((n) => n.progress_rating),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.1)",
        tension: 0.3,
        spanGaps: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 10,
        ticks: { stepSize: 1 },
      },
    },
    plugins: {
      legend: { position: "bottom" as const },
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold">Notes for {booking.full_name}</h2>
          <p className="text-sm text-gray-500">
            {booking.session_date} at {booking.session_time}
          </p>
        </div>

        {/* Stats & Trend Chart (only if we have history) */}
        {loadingHistory ? (
          <p className="text-center text-gray-500">Loading history…</p>
        ) : totalSessions > 0 ? (
          <div className="space-y-4">
            {/* Averages */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-3 rounded text-center">
                <p className="text-xs text-indigo-600 font-medium">Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded text-center">
                <p className="text-xs text-indigo-600 font-medium">Avg Mood</p>
                <p className="text-2xl font-bold">{avgMood}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded text-center">
                <p className="text-xs text-indigo-600 font-medium">Avg Progress</p>
                <p className="text-2xl font-bold">{avgProgress}</p>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white border rounded p-3">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No previous session notes yet.</p>
        )}

        {/* Current Session Form */}
        <div className="border-t pt-4 space-y-4">
          <h3 className="font-medium">This Session</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mood Score (1-10)</label>
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
            <div>
              <label className="block text-sm font-medium mb-1">Progress Rating (1-10)</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Session Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full border rounded p-2 resize-y"
              placeholder="Brief summary of the session..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Internal Notes</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full border rounded p-2 resize-y"
              placeholder="Additional internal notes..."
            />
          </div>
        </div>

        {/* Buttons */}
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
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}