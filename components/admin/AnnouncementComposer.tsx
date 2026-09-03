"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function AnnouncementComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    setStatus("Publishing...");
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    if (!response.ok) {
      setStatus("Could not publish announcement.");
      return;
    }
    setTitle("");
    setBody("");
    setStatus("Announcement published.");
  }

  return (
    <section className="card max-w-2xl p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
          <Send size={16} />
        </div>
        <div>
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Send announcement</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>This message will appear in every student sidebar.</p>
        </div>
      </div>
      <form onSubmit={publish} className="mt-5 space-y-3">
        <input className="w-full rounded border bg-transparent px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} placeholder="Announcement title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <textarea className="min-h-24 w-full rounded border bg-transparent px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} placeholder="Write your message" value={body} onChange={(event) => setBody(event.target.value)} required />
        <div className="flex items-center gap-4">
          <button className="btn btn-primary" type="submit"><Send size={15} /> Publish</button>
          {status && <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{status}</span>}
        </div>
      </form>
    </section>
  );
}
