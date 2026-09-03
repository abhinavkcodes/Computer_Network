import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementComposer } from "@/components/admin/AnnouncementComposer";

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

  const { data: usersData } = await supabase.from("profiles").select("id, email, full_name, avatar_url, created_at, last_seen").eq("role", "student").order("last_seen", { ascending: false });
  const { data: attemptsData } = await supabase.from("quiz_attempts").select("id, user_id, unit, score, total, completed_at, profiles(email, full_name)").order("completed_at", { ascending: false });
  const { data: visitsData } = await supabase.from("site_visits").select("id, user_id, path, visited_at").order("visited_at", { ascending: false });
  const { count: feedbackCount } = await supabase.from("feedback").select("id", { count: "exact", head: true });
  const { data: feedbackData } = await supabase.from("feedback").select("id, message, created_at, profiles(full_name, email)").order("created_at", { ascending: false }).limit(8);
  const users = usersData ?? [];
  const attempts = attemptsData ?? [];
  const visits = visitsData ?? [];
  const feedback = feedbackData ?? [];
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
  const studentRows = users.map((student: any) => {
    const studentAttempts = attempts.filter((attempt: any) => attempt.user_id === student.id);
    const average = studentAttempts.length
      ? Math.round(studentAttempts.reduce((sum: number, attempt: any) => sum + (attempt.score / attempt.total) * 100, 0) / studentAttempts.length)
      : 0;
    return { ...student, attempts: studentAttempts.length, average };
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
          ["Registered users", users.length],
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
              const student = users.find((item: any) => item.id === visit.user_id);
              return <div key={visit.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm" style={{ borderColor: "var(--border)" }}><span style={{ color: "var(--text-primary)" }}>{student?.full_name ?? "Student"} visited <span className="mono text-xs">{visit.path}</span></span><span className="text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(visit.visited_at).toLocaleString()}</span></div>;
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
            {feedback.map((item: any) => <article key={item.id} className="px-6 py-4" style={{ borderColor: "var(--border)" }}><div className="flex items-center justify-between gap-4"><p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.profiles?.full_name ?? "Student"}</p><time className="text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(item.created_at).toLocaleString()}</time></div><p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.message}</p></article>)}
          </div>
        ) : <p className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>No feedback received yet.</p>}
      </section>

      <AnnouncementComposer />

      <section className="card overflow-hidden">
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Students</h2>
        </div>
        {studentRows.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>Student</th><th>Attempts</th><th>Average</th><th>Last seen</th></tr></thead>
            <tbody>{studentRows.map((student) => (
              <tr key={student.id}>
                <td><a href={`/admin?student=${encodeURIComponent(student.id)}`} className="font-medium underline underline-offset-2" style={{ color: "var(--accent)" }}>{student.full_name}</a><p className="text-xs" style={{ color: "var(--text-secondary)" }}>{student.email}</p></td>
                <td>{student.attempts}</td>
                <td>{student.attempts ? `${student.average}%` : "-"}</td>
                <td>{new Date(student.last_seen).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : <p className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>No students have signed in yet.</p>}
      </section>

      {selectedStudent && (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Student quiz history</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Completed quiz attempts</p>
            </div>
            <a href="/admin" className="text-sm" style={{ color: "var(--accent)" }}>View all students</a>
          </div>
          {selectedAttempts.length > 0 ? (
            <table className="data-table">
              <thead><tr><th>Quiz</th><th>Score</th><th>Completed</th></tr></thead>
              <tbody>{selectedAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>{attempt.unit === "mixed" ? "Mixed quiz" : `Unit ${attempt.unit}`}</td>
                  <td>{attempt.score}/{attempt.total} ({Math.round((attempt.score / attempt.total) * 100)}%)</td>
                  <td>{new Date(attempt.completed_at).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <p className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>This student has not completed a quiz yet.</p>}
        </section>
      )}
    </div>
  );
}
