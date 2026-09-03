"use client";

import { useState } from "react";
import { ArrowRight, IdCard, UserRound, X } from "lucide-react";

export function ProfileSetupModal({
  initialName,
  initialRegistrationNumber = "",
  canClose = false,
  title = "Complete your profile",
  description = "Add your name and registration number so faculty can identify your work.",
  onClose,
  onComplete,
}: {
  initialName: string;
  initialRegistrationNumber?: string;
  canClose?: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  onComplete: (name: string, registrationNumber: string) => void;
}) {
  const [name, setName] = useState(initialName === "Student" ? "" : initialName);
  const [registrationNumber, setRegistrationNumber] = useState(initialRegistrationNumber);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/profile/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: name, registration_number: registrationNumber }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Could not save your profile.");
      setSaving(false);
      return;
    }
    onComplete(result.full_name, result.registration_number);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="profile-setup-title" className="w-full max-w-md rounded-lg border p-6 shadow-2xl" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="flex items-start justify-between gap-4"><div><p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{canClose ? "Your profile" : "First-time setup"}</p><h2 id="profile-setup-title" className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2></div>{canClose && <button type="button" aria-label="Close profile" title="Close" className="flex h-8 w-8 items-center justify-center" style={{ color: "var(--text-secondary)" }} onClick={onClose}><X size={18} /></button>}</div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{description}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Full name</span><span className="relative block"><UserRound size={16} className="absolute left-3 top-3" style={{ color: "var(--text-secondary)" }} /><input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className="w-full rounded border bg-transparent py-2.5 pl-10 pr-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /></span></label>
          <label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Registration number</span><span className="relative block"><IdCard size={16} className="absolute left-3 top-3" style={{ color: "var(--text-secondary)" }} /><input required value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value.toUpperCase())} placeholder="RA2XXXXXXXXXXXX" pattern="RA2[A-Za-z0-9]{12}" className="w-full rounded border bg-transparent py-2.5 pl-10 pr-3 font-mono text-sm uppercase" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /></span></label>
          {error && <p role="alert" className="text-sm" style={{ color: "#9b3d32" }}>{error}</p>}
          <button type="submit" disabled={saving} className="btn btn-primary w-full justify-between py-3">{saving ? "Saving..." : "Save profile"}{!saving && <ArrowRight size={16} />}</button>
        </form>
      </section>
    </div>
  );
}