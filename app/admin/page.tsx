"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-Client";

export default function Admin() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Notes modal state
  const [notesModal, setNotesModal] = useState<{
    open: boolean;
    session: any | null;
  }>({ open: false, session: null });
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .order("session_date", { ascending: false });

    if (data) setSessions(data);
  };

  // Open the notes modal for a specific session
  const openNotesModal = (session: any) => {
    setNotesModal({ open: true, session });
    setNoteText(session.admin_notes || ""); // pre-fill with existing notes
  };

  // Save the notes to the session
  const saveNotes = async () => {
    if (!notesModal.session) return;

    setLoading(true);
    const { error } = await supabase
      .from("sessions")
      .update({ admin_notes: noteText })
      .eq("id", notesModal.session.id);

    if (error) {
      alert("Error saving notes: " + error.message);
    } else {
      alert("Notes saved.");
      setNotesModal({ open: false, session: null });
      fetchSessions(); // refresh the list to reflect new notes
    }
    setLoading(false);
  };

  // Universal status updater (API route handles the DB update)
  const updateStatus = async (
    id: string,
    status: string,
    sessionData: any
  ) => {
    setLoading(true);

    try {
      const res = await fetch("/api/update-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Update failed");
      }

      if (status === "confirmed") {
        try {
          await fetch("/api/send-confirmation-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: sessionData.email,
              name: sessionData.full_name,
              date: sessionData.session_date,
              time: sessionData.session_time,
            }),
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }

      alert(`Booking ${status === "confirmed" ? "confirmed" : "cancelled"}.`);
      fetchSessions();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin Bookings</h1>

      {sessions.map((session) => (
        <div
          key={session.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p>
            <strong>{session.full_name}</strong>
          </p>
          <p>
            {session.session_date} at {session.session_time}
          </p>
          <p>Status: {session.status}</p>
          <p>Payment: {session.payment_status}</p>

          {/* Show action buttons only for pending sessions */}
          {session.status === "pending" && (
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => updateStatus(session.id, "confirmed", session)}
                disabled={loading}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  marginRight: 10,
                }}
              >
                {loading ? "Processing…" : "Confirm"}
              </button>

              <button
                onClick={() => updateStatus(session.id, "cancelled", session)}
                disabled={loading}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Notes button for confirmed sessions */}
          {session.status === "confirmed" && (
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => openNotesModal(session)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {session.admin_notes
                  ? "View / Edit Notes"
                  : "Add Notes"}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Notes Modal */}
      {notesModal.open && notesModal.session && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 8,
              width: "90%",
              maxWidth: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Notes for {notesModal.session.full_name}
            </h2>
            <p style={{ fontSize: 14, color: "#666" }}>
              {notesModal.session.session_date} at{" "}
              {notesModal.session.session_time}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 12,
                marginBottom: 16,
                borderRadius: 4,
                border: "1px solid #ccc",
                resize: "vertical",
              }}
              placeholder="Enter internal notes about this session..."
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setNotesModal({ open: false, session: null })}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {loading ? "Saving…" : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}