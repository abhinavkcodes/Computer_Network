import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementComposer } from "@/components/admin/AnnouncementComposer";

export default async function FacultyAnnouncementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (profile?.role !== "faculty") redirect("/");

  const { data: announcementsData } = await supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false });
  const announcements = announcementsData ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          Faculty workspace
        </p>
        <h1 className="mt-2 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          Announcements
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Publish updates that appear in every student&apos;s sidebar.
        </p>
      </header>

      <AnnouncementComposer />

      <section className="card overflow-hidden">
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Published announcements</h2>
        </div>
        {announcements.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {announcements.map((announcement) => (
              <article key={announcement.id} className="px-6 py-5" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>{announcement.title}</h2>
                  <time className="shrink-0 text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(announcement.created_at).toLocaleString()}</time>
                </div>
                <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{announcement.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>No announcements published yet.</p>
        )}
      </section>
    </div>
  );
}
