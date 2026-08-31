"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progressStore";

export function Shell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useProgress();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/progress", label: "Progress" },
    { href: "/notes", label: "Notes" },
    { href: "/quiz/mixed", label: "Quiz" },
    { href: "/calculator", label: "Calculator" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 border-r flex flex-col transition-colors ${
          isDark
            ? "bg-slate-950 border-slate-800 text-white"
            : "bg-slate-900 border-slate-800 text-white"
        }`}
      >
        {/* Logo */}
        <div className={`px-6 py-6 border-b ${isDark ? "border-slate-800" : "border-slate-800"}`}>
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">CN</span>
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Lab
            </span>
          </Link>
          <p className="text-xs text-slate-400 mt-2">
            Computer Networks
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-md text-sm font-500 transition ${
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className={`px-4 py-4 border-t ${isDark ? "border-slate-800" : "border-slate-800"}`}>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-500 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`ml-64 w-full min-h-screen transition-colors ${
          isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
        }`}
      >
        <div className={`mx-auto max-w-6xl px-8 py-10 ${isDark ? "bg-slate-950" : "bg-white"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
