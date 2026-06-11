"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-Client";

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setResources(data || []);
  };

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Resources</h1>

      {resources.length === 0 && <p>No resources available yet.</p>}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {resources.map((r) => (
          <div key={r.id} className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold">{r.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{r.type.toUpperCase()}</p>
            <p className="mb-2">{r.description}</p>

            {r.type === "article" && r.content && (
              <div className="prose prose-sm">{r.content.slice(0, 200)}...</div>
            )}

            {(r.type === "audio" || r.type === "video") && r.file_url && (
              <div className="mt-2">
                {r.type === "audio" ? (
                  <audio controls src={r.file_url} className="w-full" />
                ) : (
                  <video controls src={r.file_url} className="w-full max-h-64" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}