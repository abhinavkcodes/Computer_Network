"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("Sending...");
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      setStatus("Could not send feedback.");
      return;
    }
    setStatus("Feedback sent.");
    setMessage("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <section className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 id="feedback-title" className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Send feedback</h2>
          <button type="button" aria-label="Close feedback" onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={18} /></button>
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Tell the faculty what could make the lab better.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <textarea autoFocus required value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-32 w-full rounded border bg-transparent px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} placeholder="Write your feedback" />
          <div className="flex items-center gap-3">
            <button className="btn btn-primary" type="submit"><Send size={15} /> Send feedback</button>
            {status && <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{status}</span>}
          </div>
        </form>
      </section>
    </div>
  );
}
