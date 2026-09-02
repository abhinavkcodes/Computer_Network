import Link from "next/link";
import { ArrowRight } from "lucide-react";
import u1 from "@/data/quizzes/unit-1.json";
import u2 from "@/data/quizzes/unit-2.json";
import u3 from "@/data/quizzes/unit-3.json";
import u4 from "@/data/quizzes/unit-4.json";
import u5 from "@/data/quizzes/unit-5.json";

const TOTAL_QUESTIONS = [u1, u2, u3, u4, u5].reduce((sum, bank) => sum + (bank as any[]).length, 0);

const hops = [
  {
    n: 1,
    host: "notes",
    title: "Notes",
    detail: "5 units of study material",
    body: "Faculty PDFs for every unit, viewable inline with fullscreen and keyboard navigation between them.",
    href: "/notes",
  },
  {
    n: 2,
    host: "quiz",
    title: "Quizzes",
    detail: `${TOTAL_QUESTIONS} practice questions`,
    body: "Unit-wise and mixed sets with instant feedback, a live streak, and a review of exactly what you missed.",
    href: "/quiz/mixed",
  },
  {
    n: 3,
    host: "calc",
    title: "Calculator",
    detail: "CIDR + VLSM, step by step",
    body: "Work the subnet math yourself, then check it - every octet-by-octet AND operation shown, not just the answer.",
    href: "/calculator",
  },
];

const categories = [
  { label: "Topologies", items: "Mesh, Star, Bus, Ring, Tree, Hybrid" },
  { label: "Layers", items: "OSI 7-layer model, TCP/IP 5-layer model" },
  { label: "Addressing", items: "IPv4 classes, CIDR, VLSM, NAT" },
  { label: "Switching & Devices", items: "Circuit, packet, and message switching; repeaters, bridges, switches, routers, VLANs" },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <div className="grid lg:grid-cols-5 gap-10 items-start">
        <div className="lg:col-span-3 max-w-lg">
          <h1
            className="text-4xl sm:text-5xl font-bold leading-[1.08]"
            style={{ color: "var(--text-primary)" }}
          >
            Built around how Computer Networks is actually examined
          </h1>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            This lab covers all five units with notes to read, questions to
            test yourself against, and a calculator that shows its work -
            built for the way this course is actually examined.
          </p>
          <Link
            href="/notes"
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            Start with Unit 1
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>

        {/* Traceroute panel - the one deliberate signature element */}
        <div className="lg:col-span-2 rounded-lg overflow-hidden" style={{ background: "var(--bg-dark)" }}>
          <div
            className="px-4 py-2.5 flex items-center gap-1.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="mono ml-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              trace.sh
            </span>
          </div>

          <div className="mono p-5 text-sm leading-7">
            <p className="terminal-line" style={{ animationDelay: "0ms", color: "rgba(255,255,255,0.5)" }}>
              $ trace --learn networking
            </p>
            {hops.map((h, idx) => (
              <p
                key={h.host}
                className="terminal-line"
                style={{ animationDelay: `${(idx + 1) * 120}ms` }}
              >
                <span style={{ color: "var(--accent)" }}>{h.n}</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{"  "}{h.host.padEnd(8, " ")}</span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{h.detail}</span>
              </p>
            ))}
            <p
              className="terminal-line mt-2"
              style={{ animationDelay: `${(hops.length + 1) * 120}ms`, color: "rgba(255,255,255,0.4)" }}
            >
              route resolved in {hops.length} hops
            </p>
          </div>
        </div>
      </div>

      {/* Hops as tools - numbering justified because these ARE the 3 hops above */}
      <div className="grid md:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
        {hops.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            className="feature-card group p-8"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="flex items-baseline gap-2">
              <span className="mono text-sm" style={{ color: "var(--accent)" }}>{h.n}</span>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {h.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {h.body}
            </p>
            <div
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Open
              <ArrowRight size={13} strokeWidth={2} className="feature-arrow transition-transform duration-150" />
            </div>
          </Link>
        ))}
      </div>

      {/* Syllabus, grouped by real category rather than a flat numbered list */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          What's in the syllabus
        </h2>
        <div className="mt-6 space-y-5">
          {categories.map((c) => (
            <div key={c.label} className="grid sm:grid-cols-4 gap-2 sm:gap-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {c.label}
              </p>
              <p className="sm:col-span-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {c.items}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}