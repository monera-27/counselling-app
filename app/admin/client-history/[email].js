"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-Client";

export default function ClientHistoryPage() {
  const params = useParams();
  const email = decodeURIComponent(params.email);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;

    const fetchHistory = async () => {
      const { data } = await supabase
        .from("client_notes")
        .select("*")
        .eq("client_email", email)
        .order("session_date", { ascending: false });

      setNotes(data || []);
      setLoading(false);
    };

    fetchHistory();
  }, [email]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading history...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Session History</h1>
      <p className="text-gray-400 text-sm mb-8">{email}</p>

      {notes.length === 0 ? (
        <p className="text-gray-400">No session notes found for this client.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-700">
                  {note.session_date
                    ? new Date(note.session_date).toLocaleDateString("en-CA")
                    : "Date not set"}
                </span>
                {note.session_type && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {note.session_type}
                  </span>
                )}
              </div>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {note.notes}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Required for Next.js static export (output: 'export').
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  return [];
}

export const dynamic = "force-static";