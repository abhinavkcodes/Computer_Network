"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progressStore";

const navItems = [
  { href: "/", label: "Dashboard", tag: "~" },
  { href: "/progress", label: "Progress", tag: "pg" },
  { href: "/notes", label: "Notes", tag: "nt" },
  { href: "/quiz/mixed", label: "Quiz", tag: "qz" },
  { href: "/calculator", label: "Calculator", tag: "cc" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useProgress();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

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
          {navItems.map((item) => {
            const active = isActive(item.href);
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
                <span
                  className="mono text-[11px] w-5 flex-shrink-0"
                  style={{ color: active ? "var(--sidebar-accent)" : "rgba(255,255,255,0.35)" }}
                >
                  {item.tag}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.65)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--sidebar-hover)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.65)";
            }}
          >
            <span>{isDark ? "Dark mode" : "Light mode"}</span>
            <span
              className="relative inline-flex items-center rounded-full transition-colors"
              style={{ width: 34, height: 18, background: isDark ? "var(--accent)" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="absolute rounded-full bg-white transition-transform"
                style={{
                  width: 14,
                  height: 14,
                  top: 2,
                  left: 2,
                  transform: isDark ? "translateX(16px)" : "translateX(0)",
                }}
              />
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="ml-64 w-full min-h-screen transition-colors"
        style={{ background: "var(--bg-light)" }}
      >
        <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}