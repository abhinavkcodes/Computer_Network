"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { StudentProfileModal } from "@/components/admin/StudentProfileModal";
import { UserAvatar } from "@/components/UserAvatar";

type Student = any;

export function StudentDirectory({
  students,
  attempts,
  visits,
  feedback,
}: {
  students: Student[];
  attempts: Student[];
  visits: Student[];
  feedback: Student[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "attempted" | "not-started">("all");
  const [sort, setSort] = useState<"recent" | "name" | "score">("recent");

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return students
      .filter((student) => !normalizedQuery || [student.full_name, student.email, student.registration_number].some((value) => value?.toLowerCase().includes(normalizedQuery)))
      .filter((student) => status === "all" || (status === "attempted" ? student.attempts > 0 : student.attempts === 0))
      .sort((a, b) => sort === "name" ? a.full_name.localeCompare(b.full_name) : sort === "score" ? b.average - a.average : new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }, [query, sort, status, students]);

  return (
    <section id="students" className="scroll-mt-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Individual analysis</p><h2 className="mt-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Students who have logged in</h2></div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{filteredStudents.length} of {students.length}</p>
      </div>
      <div className="card mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-3" style={{ color: "var(--text-secondary)" }} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or registration number" className="w-full rounded border bg-transparent py-2.5 pl-10 pr-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>
        <div className="flex items-center gap-2"><SlidersHorizontal size={15} style={{ color: "var(--text-secondary)" }} /><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}><option value="all">All students</option><option value="attempted">Attempted quiz</option><option value="not-started">No quiz yet</option></select><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}><option value="recent">Most recent</option><option value="name">Name A-Z</option><option value="score">Highest score</option></select></div>
      </div>
      {filteredStudents.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{filteredStudents.map((student) => <article key={student.id} className="card overflow-hidden"><div className="flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: "var(--border)" }}><div className="min-w-0"><div className="flex items-center gap-3"><UserAvatar src={student.avatar_url} name={student.full_name} className="h-10 w-10 shrink-0" /><h3 className="truncate text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{student.full_name}</h3></div><p className="mt-1 truncate text-sm" style={{ color: "var(--text-secondary)" }}>{student.email}</p><p className="mono mt-2 text-xs" style={{ color: "var(--accent)" }}>{student.registration_number ?? "Registration number not added"}</p></div><span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: student.attempts ? "var(--accent-light)" : "var(--bg-light)", color: "var(--text-secondary)" }}>{student.attempts ? "Active learner" : "No quiz yet"}</span></div><div className="grid grid-cols-2 gap-px" style={{ background: "var(--border)" }}>{[["Page visits", student.visits], ["Unique pages", student.pages], ["Quiz attempts", student.attempts], ["Average score", student.attempts ? `${student.average}%` : "-"]].map(([label, value]) => <div key={label} className="p-4" style={{ background: "var(--bg-card)" }}><p className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p><p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p></div>)}</div><div className="flex items-center justify-between gap-4 p-5"><div className="min-w-0 text-xs" style={{ color: "var(--text-secondary)" }}><p>Last activity</p><p className="mt-1 truncate font-medium" style={{ color: "var(--text-primary)" }}>{new Date(student.lastActivity).toLocaleString()}</p></div><StudentProfileModal student={student} attempts={attempts.filter((attempt) => attempt.user_id === student.id)} visits={visits.filter((visit) => visit.user_id === student.id)} feedback={feedback.filter((item) => item.user_id === student.id)} /></div></article>)}</div> : <div className="card p-8 text-sm" style={{ color: "var(--text-secondary)" }}>No students match these filters.</div>}
    </section>
  );
}
