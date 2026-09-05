import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserAvatar } from "@/components/UserAvatar";
import { StudentDirectory } from "@/components/admin/StudentDirectory";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Users, Eye, LogIn, ClipboardList, Target, Percent, MessageSquare, MapPin } from "lucide-react";

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

  const { data: profilesData } = await supabase.from("profiles").select("id, email, full_name, registration_number, avatar_url, created_at, last_seen, role").order("last_seen", { ascending: false });
  const { data: attemptsData } = await supabase.from("quiz_attempts").select("id, user_id, unit, score, total, completed_at, profiles(email, full_name)").order("completed_at", { ascending: false });
  const { data: visitsData } = await supabase.from("site_visits").select("id, user_id, path, visited_at").order("visited_at", { ascending: false });
  const { count: feedbackCount } = await supabase.from("feedback").select("id", { count: "exact", head: true });
  const { data: feedbackData } = await supabase.from("feedback").select("id, user_id, message, created_at, profiles(full_name, email, avatar_url)").order("created_at", { ascending: false });
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authUsersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = authUsersData?.users ?? [];
  const authById = new Map(authUsers.map((authUser) => [authUser.id, authUser]));
  const profiles = (profilesData ?? []).map((storedProfile: any) => {
    const authUser = authById.get(storedProfile.id);
    return {
      ...storedProfile,
      avatar_url: storedProfile.avatar_url ?? authUser?.user_metadata?.avatar_url ?? authUser?.user_metadata?.picture ?? null,
      full_name: storedProfile.full_name !== "Student" ? storedProfile.full_name : authUser?.user_metadata?.full_name ?? authUser?.user_metadata?.name ?? storedProfile.full_name,
    };
  });
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

  const trafficStats = [
    { label: "Total visits", value: visits.length, icon: Eye, sub: `${uniqueVisitors} unique` },
    { label: "Logged-in students", value: users.length, icon: LogIn, sub: `${uniqueVisitors} visited` },
    { label: "Unique visitors", value: uniqueVisitors, icon: Users, sub: `${users.length} registered` },
  ];

  const outcomeStats = [
    { label: "Quiz attempts", value: attempts.length, icon: ClipboardList, sub: `${activeStudents} students` },
    { label: "Average score", value: attempts.length ? `${averageScore}%` : "—", icon: Target, sub: attempts.length ? "all attempts" : "no data" },
    { label: "Quiz participation", value: users.length ? `${completionRate}%` : "—", icon: Percent, sub: users.length ? `${activeStudents}/${users.length}` : "no data" },
    { label: "Feedback received", value: feedbackCount ?? 0, icon: MessageSquare, sub: (feedbackCount ?? 0) > 0 ? "collected" : "no data" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          Restricted workspace
        </p>
        <h1 className="mt-2 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          Faculty dashboard
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Student activity, quiz performance, and engagement.
        </p>
      </header>

      <div className="space-y-4">
        <p className="mono text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          Traffic
        </p>
        <div className="grid gap-px sm:grid-cols-3" style={{ background: "var(--border)" }}>
          {trafficStats.map(({ label, value, icon: Icon, sub }) => (
            <section key={label} className="p-6" style={{ background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between">
                <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p>
                <Icon size={15} strokeWidth={2} style={{ color: "var(--text-secondary)" }} />
              </div>
              <p className="mt-3 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{sub}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="mono text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          Quiz outcomes
        </p>
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "var(--border)" }}>
          {outcomeStats.map(({ label, value, icon: Icon, sub }) => (
            <section key={label} className="p-6" style={{ background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between">
                <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p>
                <Icon size={15} strokeWidth={2} style={{ color: "var(--text-secondary)" }} />
              </div>
              <p className="mt-3 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{sub}</p>
            </section>
          ))}
        </div>
      </div>

      <section className="card overflow-hidden">
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent activity</h2>
        </div>
        {visits.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {visits.slice(0, 10).map((visit: any) => {
              const student = profiles.find((item: any) => item.id === visit.user_id);
              return (
                <div key={visit.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm" style={{ borderColor: "var(--border)" }}>
                  <span className="flex min-w-0 items-center gap-3" style={{ color: "var(--text-primary)" }}>
                    <UserAvatar src={student?.avatar_url} name={student?.full_name} className="h-8 w-8 shrink-0" />
                    <MapPin size={13} strokeWidth={2} className="shrink-0" style={{ color: "var(--text-secondary)" }} />
                    <span className="truncate">
                      {student?.full_name ?? "Student"} <span style={{ color: "var(--text-secondary)" }}>({student?.email ?? "unknown email"})</span> visited <span className="mono text-xs">{visit.path}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(visit.visited_at)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>No visits yet.</p>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent feedback</h2>
        </div>
        {feedback.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {feedback.slice(0, 8).map((item: any) => (
              <article key={item.id} className="px-6 py-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between gap-4">
                  <p className="flex min-w-0 items-center gap-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    <UserAvatar src={item.profiles?.avatar_url} name={item.profiles?.full_name} className="h-8 w-8 shrink-0" />
                    <span className="truncate">{item.profiles?.full_name ?? "Student"} <span className="font-normal" style={{ color: "var(--text-secondary)" }}>({item.profiles?.email ?? "unknown email"})</span></span>
                  </p>
                  <time className="shrink-0 text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(item.created_at)}</time>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.message}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>No feedback yet.</p>
        )}
      </section>

      <StudentDirectory students={studentRows} attempts={attempts} visits={visits} feedback={feedback} />

      {selectedStudent && (
        <section id="student-detail" className="card scroll-mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{selectedProfile?.full_name ?? "Student details"}</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{selectedProfile?.email ?? "Unknown email"}</p>
            </div>
            <a href="/admin" className="text-sm" style={{ color: "var(--accent)" }}>All students</a>
          </div>
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "var(--border)" }}>
            {[
              ["Joined", selectedProfile ? formatDate(selectedProfile.created_at) : "-"],
              ["Last seen", selectedProfile ? formatDate(selectedProfile.last_seen) : "-"],
              ["Page visits", selectedVisits.length],
              ["Feedback sent", selectedFeedback.length],
            ].map(([label, value]) => (
              <div key={label} className="p-5" style={{ background: "var(--bg-card)" }}>
                <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</p>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-8 p-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Quiz attempts</h3>
              {selectedAttempts.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {selectedAttempts.map((attempt: any) => (
                    <div key={attempt.id} className="flex items-center justify-between border-b py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                      <span style={{ color: "var(--text-primary)" }}>{attempt.unit === "mixed" ? "Mixed quiz" : `Unit ${attempt.unit}`}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{attempt.score}/{attempt.total} ({Math.round((attempt.score / attempt.total) * 100)}%) · {formatDate(attempt.completed_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No quiz attempts yet.</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Visited pages</h3>
              {selectedVisits.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {selectedVisits.slice(0, 20).map((visit: any) => (
                    <div key={visit.id} className="flex items-center justify-between border-b py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                      <span className="mono" style={{ color: "var(--text-primary)" }}>{visit.path}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{formatDate(visit.visited_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>No page visits yet.</p>
              )}
            </div>
          </div>
          {selectedFeedback.length > 0 && (
            <div className="border-t px-6 py-5" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Feedback</h3>
              {selectedFeedback.map((item: any) => (
                <p key={item.id} className="mt-3 border-b pb-3 text-sm leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  {item.message} <span className="text-xs">({formatDate(item.created_at)})</span>
                </p>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}