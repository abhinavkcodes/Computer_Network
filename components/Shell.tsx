"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  History,
  MessageSquarePlus,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  ClipboardList,
  Users,
  BookOpen,
  Calculator,
} from "lucide-react";
import { useProgress } from "@/lib/progressStore";
import { FeedbackModal } from "@/components/FeedbackModal";

const studentNavItems = [
  { href: "/", label: "Learning home", icon: BookOpen },
  { href: "/progress", label: "My progress", icon: BarChart3 },
  { href: "/notes", label: "Study notes", icon: BookOpen },
  { href: "/quiz/mixed", label: "Practice quizzes", icon: ClipboardList },
  { href: "/calculator", label: "Subnet calculator", icon: Calculator },
];

const facultyNavItems = [
  { href: "/admin", label: "Faculty overview", icon: BarChart3 },
  { href: "/admin", label: "Student roster", icon: Users },
  { href: "/notes", label: "Course materials", icon: BookOpen },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useProgress();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string; image?: string; role: "student" | "faculty" } | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; body: string; created_at: string }[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const supabase = createClient();
    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      const syncResponse = await fetch("/api/profile/sync", { method: "POST" });
      const syncedProfile = syncResponse.ok ? await syncResponse.json() : null;
      if (!syncResponse.ok) console.error("Profile sync failed. Run the Supabase schema in SQL Editor.");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single();
      setUser({ email: currentUser.email, name: currentUser.user_metadata?.full_name ?? currentUser.email, image: currentUser.user_metadata?.avatar_url ?? currentUser.user_metadata?.picture, role: syncedProfile?.role ?? profile?.role ?? "student" });
    };
    void loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => void loadUser());
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (pathname === "/login") return;
    const loadAnnouncements = async () => {
      const response = await fetch("/api/announcements");
      if (response.ok) setAnnouncements(await response.json());
    };
    void loadAnnouncements();
  }, [pathname]);

  useEffect(() => {
    if (!user || pathname === "/login") return;
    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    });
  }, [user, pathname]);

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  if (pathname === "/login") return <>{children}</>;

  const navItems = user?.role === "faculty" ? facultyNavItems : studentNavItems;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-64 border-r flex flex-col transition-colors"
        style={{ background: "var(--sidebar-bg)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">CN</span>
            <span className="mono text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
              Lab
            </span>
          </Link>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            Computer Networks
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-0.5">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {user?.role === "faculty" ? "Faculty workspace" : "Student workspace"}
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: active ? "var(--sidebar-active)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.65)",
                  borderLeft: active ? "2px solid var(--sidebar-accent)" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--sidebar-hover)";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  }
                }}
              >
                <Icon size={17} strokeWidth={1.8} style={{ color: active ? "var(--sidebar-accent)" : "rgba(255,255,255,0.45)" }} />
                {item.label}
              </Link>
            );
          })}

          <div className="mt-8 px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.35)" }}>
            Connect
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.65)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--sidebar-hover)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.65)";
            }}
            onClick={() => setShowAnnouncements((open) => !open)}
          >
            <Bell size={17} strokeWidth={1.7} />
            Announcements
            <span className="ml-auto rounded border px-2 py-0.5 text-xs" style={{ borderColor: "rgba(255,255,255,0.15)", color: "white" }}>
              {announcements.length}
            </span>
          </button>
          {showAnnouncements && (
            <div className="mt-2 space-y-2 rounded-lg border p-2" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.16)" }}>
              {announcements.length > 0 ? announcements.slice(0, 5).map((announcement) => (
                <article key={announcement.id} className="rounded px-2 py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-xs font-semibold text-white">{announcement.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{announcement.body}</p>
                </article>
              )) : <p className="px-2 py-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>No announcements yet.</p>}
            </div>
          )}
        </nav>

        {/* Account and theme controls */}
        <div className="space-y-3 border-t px-4 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {user && (
            <div>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.05)" }}
                onClick={() => setIsAccountOpen((open) => !open)}
              >
                {user.image && !imageFailed ? (
                  <img src={user.image} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900">
                    {(user.name ?? "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                    <span className="min-w-0 truncate">{user.name ?? "Network learner"}</span>
                    <span className="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-normal" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
                      {user.role === "faculty" ? "Faculty" : "Student"}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{user.email}</span>
                </span>
                {isAccountOpen ? <ChevronUp size={16} style={{ color: "rgba(255,255,255,0.55)" }} /> : <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.55)" }} />}
              </button>
              {isAccountOpen && (
                <div className="mt-2 space-y-1 rounded-lg border p-2" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.16)" }}>
                  <button type="button" className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm" style={{ color: "rgba(255,255,255,0.8)" }} onClick={() => setShowFeedback(true)}>
                    <MessageSquarePlus size={16} />
                    Feedback
                  </button>
                  <button type="button" className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <History size={16} />
                    Changelog
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-end gap-2 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <button type="button" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} title={isDark ? "Light mode" : "Dark mode"} className="flex h-9 w-9 items-center justify-center rounded-md" style={{ color: "rgba(255,255,255,0.7)" }} onClick={() => setTheme(isDark ? "light" : "dark")}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button type="button" aria-label="Sign out" title="Sign out" className="flex h-9 w-9 items-center justify-center rounded-md" style={{ color: "rgba(255,255,255,0.7)" }} onClick={async () => { await createClient().auth.signOut(); window.location.href = "/login"; }}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="ml-64 w-full min-h-screen transition-colors"
        style={{ background: "var(--bg-light)" }}
      >
        <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
      </main>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}