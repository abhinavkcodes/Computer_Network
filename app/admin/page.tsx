import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentProfileModal } from "@/components/admin/StudentProfileModal";
import { UserAvatar } from "@/components/UserAvatar";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { student?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };

  if (profile?.role !== "faculty") {
    redirect("/");
  }

  const { data: profilesData } = await supabase.from("profiles").select("id, email, full_name, avatar_url, created_at, last_seen, role").order("last_seen", { ascending: false });
  const { data: attemptsData } = await supabase.from("quiz_attempts").select("id, user_id, unit, score, total, completed_at, profiles(email, full_name)").order("completed_at", { ascending: false });
  const { data: visitsData } = await supabase.from("site_visits").select("id, user_id, path, visited_at").order("visited_at", { ascending: false });
  const { count: feedbackCount } = await supabase.from("feedback").select("id", { count: "exact", head: true });
  const { data: feedbackData } = await supabase.from("feedback").select("id, user_id, message, created_at, profiles(full_name, email, avatar_url)").order("created_at", { ascending: false });
  const profiles = profilesData ?? [];
  const users = profiles.filter((profile: any) => profile.role === "student");
  const attempts = attemptsData ?? [];
  const visits = visitsData ?? [];
  const feedback = feedbackData ?? [];
  const formatDate = (value: string) => new Date(value).toLocaleString();
  const formatDuration = (minutes: number) => minutes < 1 ? "<1 min" : minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  const averageScore = attempts.length
    ? Math.round(attempts.reduce((sum: number, attempt: any) => sum + (attempt.score / attempt.total) * 100, 0) / attempts.length)
    : 0;
  const activeStudents = new Set(attempts.map((attempt: any) => attempt.user_id)).size;
  const uniqueVisitors = new Set(visits.map((visit: any) => visit.user_id)).size;
  const completionRate = users.length ? Math.round((activeStudents / users.length) * 100) : 0;
  const selectedStudent = searchParams.student;
  const selectedAttempts = selectedStudent
    ? attempts.filter((attempt: any) => attempt.user_id === selectedStudent)
    : [];
  const selectedProfile = users.find((student: any) => student.id === selectedStudent);
  const selectedVisits = selectedStudent
    ? visits.filter((visit: any) => visit.user_id === selectedStudent)
    : [];
  const selectedFeedback = selectedStudent
    ? feedback.filter((item: any) => item.user_id === selectedStudent)
    : [];
  const studentRows = users.map((student: any) => {
    const studentAttempts = attempts.filter((attempt: any) => attempt.user_id === student.id);
    const studentVisits = visits.filter((visit: any) => visit.user_id === student.id);
    const studentFeedback = feedback.filter((item: any) => item.user_id === student.id);
    const timeMinutes = studentVisits.slice(1).reduce((total: number, visit: any, index: number) => {
      const gap = (new Date(studentVisits[index].visited_at).getTime() - new Date(visit.visited_at).getTime()) / 60000;
      return total + (gap > 0 && gap <= 30 ? gap : 0);
    }, 0);
    const average = studentAttempts.length
      ? Math.round(studentAttempts.reduce((sum: number, attempt: any) => sum + (attempt.score / attempt.total) * 100, 0) / studentAttempts.length)
      : 0;
    return {
      ...student,
      attempts: studentAttempts.length,
      average,
      visits: studentVisits.length,
      pages: new Set(studentVisits.map((visit: any) => visit.path)).size,
      feedback: studentFeedback.length,
      timeSpent: formatDuration(Math.round(timeMinutes)),
      lastActivity: studentVisits[0]?.visited_at ?? studentAttempts[0]?.completed_at ?? student.last_seen,
    };
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          Restricted workspace
        </p>
        <h1 className="mt-2 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          Faculty dashboard
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Monitor student participation, quiz performance, and course activity from one protected workspace.
        </p>
      </header>

      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-5" style={{ background: "var(--border)" }}>
        {[
          ["Total visits", visits.length],
          ["Unique visitors", uniqueVisitors],
            ["Logged-in students", users.length],
          ["Quiz attempts", attempts.length],
          ["Average score", `${averageScore}%`],
          ["Quiz participation", `${completionRate}%`],
          ["Feedback received", feedbackCount ?? 0],
        ].map(([label, value]) => (
          <section key={label} className="p-6" style={{ background: "var(--bg-card)" }}>
            <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p>
            <p className="mt-3 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
          </section>
        ))}
      </div>

      <section className="card max-w-2xl p-6">
        <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          Engagement
        </p>
        <p className="mt-3 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {activeStudents} students have attempted a quiz
        </p>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent activity</h2>
        </div>
        {visits.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {visits.slice(0, 10).map((visit: any) => {
              const student = profiles.find((item: any) => item.id === visit.user_id);
              return <div key={visit.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm" style={{ borderColor: "var(--border)" }}><span className="flex min-w-0 items-center gap-3" style={{ color: "var(--text-primary)" }}><UserAvatar src={student?.avatar_url} name={student?.full_name} className="h-8 w-8 shrink-0" /><span className="truncate">{student?.full_name ?? "Student"} <span style={{ color: "var(--text-secondary)" }}>({student?.email ?? "unknown email"})</span> visited <span className="mono text-xs">{visit.path}</span></span></span><span className="shrink-0 text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(visit.visited_at)}</span></div>;
            })}
          </div>
        ) : <p className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>No visits recorded yet.</p>}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent feedback</h2>
        </div>
        {feedback.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {feedback.slice(0, 8).map((item: any) => <article key={item.id} className="px-6 py-4" style={{ borderColor: "var(--border)" }}><div className="flex items-center justify-between gap-4"><p className="flex min-w-0 items-center gap-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}><UserAvatar src={item.profiles?.avatar_url} name={item.profiles?.full_name} className="h-8 w-8 shrink-0" /><span className="truncate">{item.profiles?.full_name ?? "Student"} <span className="font-normal" style={{ color: "var(--text-secondary)" }}>({item.profiles?.email ?? "unknown email"})</span></span></p><time className="shrink-0 text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(item.created_at)}</time></div><p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.message}</p></article>)}
          </div>
        ) : <p className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>No feedback received yet.</p>}
      </section>

      <section id="students" className="scroll-mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Individual analysis</p>
            <h2 className="mt-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Students who have logged in</h2>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{studentRows.length} student{studentRows.length === 1 ? "" : "s"}</p>
        </div>
        {studentRows.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {studentRows.map((student) => (
              <article key={student.id} className="card overflow-hidden">
                <div className="flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: "var(--border)" }}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={student.avatar_url} name={student.full_name} className="h-10 w-10 shrink-0" />
                      <h3 className="truncate text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{student.full_name}</h3>
                    </div>
                    <p className="mt-1 truncate text-sm" style={{ color: "var(--text-secondary)" }}>{student.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: student.attempts ? "var(--accent-light)" : "var(--bg-light)", color: "var(--text-secondary)" }}>{student.attempts ? "Active learner" : "No quiz yet"}</span>
                </div>
                <div className="grid grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
                  {[["Page visits", student.visits], ["Unique pages", student.pages], ["Quiz attempts", student.attempts], ["Average score", student.attempts ? `${student.average}%` : "-"]].map(([label, value]) => <div key={label} className="p-4" style={{ background: "var(--bg-card)" }}><p className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p><p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p></div>)}
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0 text-xs" style={{ color: "var(--text-secondary)" }}><p>Last activity</p><p className="mt-1 truncate font-medium" style={{ color: "var(--text-primary)" }}>{formatDate(student.lastActivity)}</p></div>
                  <StudentProfileModal
                    student={student}
                    attempts={attempts.filter((attempt: any) => attempt.user_id === student.id)}
                    visits={visits.filter((visit: any) => visit.user_id === student.id)}
                    feedback={feedback.filter((item: any) => item.user_id === student.id)}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : <div className="card p-8 text-sm" style={{ color: "var(--text-secondary)" }}>No students have signed in yet.</div>}
      </section>

      {selectedStudent && (
        <section id="student-detail" className="card scroll-mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{selectedProfile?.full_name ?? "Student details"}</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{selectedProfile?.email ?? "Unknown email"}</p>
            </div>
            <a href="/admin" className="text-sm" style={{ color: "var(--accent)" }}>View all students</a>
          </div>
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "var(--border)" }}>
            {[
              ["Joined", selectedProfile ? formatDate(selectedProfile.created_at) : "-"],
              ["Last seen", selectedProfile ? formatDate(selectedProfile.last_seen) : "-"],
              ["Page visits", selectedVisits.length],
              ["Feedback sent", selectedFeedback.length],
            ].map(([label, value]) => <div key={label} className="p-5" style={{ background: "var(--bg-card)" }}><p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p><p className="mt-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p></div>)}
          </div>
          <div className="grid gap-8 p-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Quiz attempts</h3>
              {selectedAttempts.length > 0 ? <div className="mt-3 space-y-2">{selectedAttempts.map((attempt: any) => <div key={attempt.id} className="flex items-center justify-between border-b py-2 text-sm" style={{ borderColor: "var(--border)" }}><span style={{ color: "var(--text-primary)" }}>{attempt.unit === "mixed" ? "Mixed quiz" : `Unit ${attempt.unit}`}</span><span style={{ color: "var(--text-secondary)" }}>{attempt.score}/{attempt.total} ({Math.round((attempt.score / attempt.total) * 100)}%) · {formatDate(attempt.completed_at)}</span></div>)}</div> : <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No quiz attempts yet.</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Visited pages</h3>
              {selectedVisits.length > 0 ? <div className="mt-3 space-y-2">{selectedVisits.slice(0, 20).map((visit: any) => <div key={visit.id} className="flex items-center justify-between border-b py-2 text-sm" style={{ borderColor: "var(--border)" }}><span className="mono" style={{ color: "var(--text-primary)" }}>{visit.path}</span><span style={{ color: "var(--text-secondary)" }}>{formatDate(visit.visited_at)}</span></div>)}</div> : <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No page visits yet.</p>}
            </div>
          </div>
          {selectedFeedback.length > 0 && <div className="border-t px-6 py-5" style={{ borderColor: "var(--border)" }}><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Feedback from this student</h3>{selectedFeedback.map((item: any) => <p key={item.id} className="mt-3 border-b pb-3 text-sm leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>{item.message} <span className="text-xs">({formatDate(item.created_at)})</span></p>)}</div>}
        </section>
      )}
    </div>
  );
}
