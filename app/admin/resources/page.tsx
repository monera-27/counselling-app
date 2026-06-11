"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-Client";

export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("article");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    setResources(data || []);
  };

  const handleUpload = async () => {
    if (!title) return alert("Title required");
    setUploading(true);

    let file_url = null;
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("resources")
        .upload(fileName, file);

      if (error) {
        alert("Upload failed");
        setUploading(false);
        return;
      }
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("resources")
        .getPublicUrl(fileName);
      file_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("resources").insert({
      title,
      description,
      type,
      content: type === "article" ? content : null,
      file_url,
      is_published: true,
    });

    if (error) alert("Error saving");
    else {
      alert("Resource added!");
      setTitle("");
      setDescription("");
      setContent("");
      setFile(null);
      fetchResources();
    }
    setUploading(false);
  };

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Resources</h1>

      {/* Upload Form */}
      <div className="space-y-4 mb-8 border p-4 rounded">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded h-24"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="article">Article</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
        </select>

        {type === "article" && (
          <textarea
            placeholder="Article content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border p-2 w-full rounded h-48"
          />
        )}

        {type !== "article" && (
          <input
            type="file"
            accept={type === "audio" ? "audio/*" : "video/*"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 w-full rounded"
          />
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          {uploading ? "Uploading..." : "Add Resource"}
        </button>
      </div>

      {/* Existing Resources */}
      <h2 className="text-xl font-semibold mb-4">Existing Resources</h2>
      {resources.map((r) => (
        <div key={r.id} className="border p-3 mb-2 rounded">
          <p><strong>{r.title}</strong> ({r.type})</p>
          <p className="text-sm text-gray-600">{r.description}</p>
          {r.file_url && (
            <a href={r.file_url} target="_blank" className="text-blue-500 text-sm">
              View file
            </a>
          )}
        </div>
      ))}
    </main>
  );
}