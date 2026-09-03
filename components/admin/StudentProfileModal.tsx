"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

type Student = {
  full_name: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
  last_seen: string;
  visits: number;
  pages: number;
  attempts: number;
  average: number;
  feedback: number;
  timeSpent: string;
};

type Attempt = { id: string; unit: string; score: number; total: number; completed_at: string };
type Visit = { id: string; path: string; visited_at: string };
type Feedback = { id: string; message: string; created_at: string };

export function StudentProfileModal({
  student,
  attempts,
  visits,
  feedback,
}: {
  student: Student;
  attempts: Attempt[];
  visits: Visit[];
  feedback: Feedback[];
}) {
  const [open, setOpen] = useState(false);
  const formatDate = (value: string) => new Date(value).toLocaleString();

  return (
    <>
      <button type="button" className="btn shrink-0 text-xs" onClick={() => setOpen(true)}>View full profile</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="student-profile-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border shadow-2xl" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b p-6" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar src={student.avatar_url} name={student.full_name} className="h-12 w-12 shrink-0" />
                <div className="min-w-0"><h2 id="student-profile-title" className="truncate text-xl font-bold" style={{ color: "var(--text-primary)" }}>{student.full_name}</h2><p className="truncate text-sm" style={{ color: "var(--text-secondary)" }}>{student.email}</p></div>
              </div>
              <button type="button" aria-label="Close student profile" title="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md" style={{ color: "var(--text-secondary)" }} onClick={() => setOpen(false)}><X size={18} /></button>
            </header>
            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "var(--border)" }}>
              {[["Estimated time", student.timeSpent], ["Page visits", student.visits], ["Unique pages", student.pages], ["Quiz average", student.attempts ? `${student.average}%` : "-"]].map(([label, value]) => <div key={label} className="p-5" style={{ background: "var(--bg-card)" }}><p className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p><p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p></div>)}
            </div>
            <div className="grid gap-8 p-6 lg:grid-cols-2">
              <div><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Account and engagement</h3><dl className="mt-3 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt style={{ color: "var(--text-secondary)" }}>Joined</dt><dd className="text-right" style={{ color: "var(--text-primary)" }}>{formatDate(student.created_at)}</dd></div><div className="flex justify-between gap-4"><dt style={{ color: "var(--text-secondary)" }}>Last seen</dt><dd className="text-right" style={{ color: "var(--text-primary)" }}>{formatDate(student.last_seen)}</dd></div><div className="flex justify-between gap-4"><dt style={{ color: "var(--text-secondary)" }}>Feedback sent</dt><dd className="text-right" style={{ color: "var(--text-primary)" }}>{student.feedback}</dd></div></dl></div>
              <div><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Visited pages</h3>{visits.length ? <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">{visits.slice(0, 30).map((visit) => <div key={visit.id} className="flex justify-between gap-3 border-b pb-2 text-sm" style={{ borderColor: "var(--border)" }}><span className="mono" style={{ color: "var(--text-primary)" }}>{visit.path}</span><span className="text-right text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(visit.visited_at)}</span></div>)}</div> : <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No page visits yet.</p>}</div>
              <div><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Quiz attempts</h3>{attempts.length ? <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">{attempts.map((attempt) => <div key={attempt.id} className="flex justify-between gap-3 border-b pb-2 text-sm" style={{ borderColor: "var(--border)" }}><span style={{ color: "var(--text-primary)" }}>{attempt.unit === "mixed" ? "Mixed quiz" : `Unit ${attempt.unit}`}</span><span className="text-right text-xs" style={{ color: "var(--text-secondary)" }}>{attempt.score}/{attempt.total} ({Math.round((attempt.score / attempt.total) * 100)}%)</span></div>)}</div> : <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No quiz attempts yet.</p>}</div>
              <div><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Feedback</h3>{feedback.length ? <div className="mt-3 max-h-44 space-y-3 overflow-y-auto">{feedback.map((item) => <div key={item.id} className="border-b pb-2 text-sm" style={{ borderColor: "var(--border)" }}><p style={{ color: "var(--text-primary)" }}>{item.message}</p><p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(item.created_at)}</p></div>)}</div> : <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No feedback yet.</p>}</div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
