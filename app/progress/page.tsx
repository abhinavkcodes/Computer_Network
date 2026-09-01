"use client";
import { useProgress } from "@/lib/progressStore";
import { units } from "@/lib/content";

function SignalBars({ pct }: { pct: number }) {
  const filled = pct >= 90 ? 4 : pct >= 75 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
  return (
    <div className="flex items-end gap-0.5" aria-label={`${pct}% signal`}>
      {[3, 6, 9, 12].map((h, i) => (
        <div
          key={h}
          style={{
            width: 3,
            height: h,
            background: i < filled ? "var(--accent)" : "var(--border)",
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { quizRuns } = useProgress();

  const avgScore =
    quizRuns.length > 0
      ? Math.round(
          (quizRuns.reduce((sum, r) => sum + r.score / r.total, 0) / quizRuns.length) * 100
        )
      : 0;

  const lastAttempt = quizRuns[quizRuns.length - 1];

  const unitStats = units.map((unit) => {
    const unitRuns = quizRuns.filter((r) => r.unit === `${unit}`);
    if (unitRuns.length === 0) return { unit, attempts: 0, best: 0, latest: 0, up: false };
    const best = Math.max(...unitRuns.map((r) => Math.round((r.score / r.total) * 100)));
    const latest = Math.round(
      (unitRuns[unitRuns.length - 1].score / unitRuns[unitRuns.length - 1].total) * 100
    );
    return { unit, attempts: unitRuns.length, best, latest, up: true };
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Progress
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Every unit's link status and your full connection log.
        </p>
      </div>

      {/* Status line — one compact readout instead of three repeated stat cards */}
      <div
        className="mono flex flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4 rounded-lg text-sm"
        style={{ background: "var(--bg-dark)", color: "rgba(255,255,255,0.85)" }}
      >
        <span>
          <span style={{ color: "var(--accent)" }}>{quizRuns.length}</span> attempts logged
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
        <span>
          <span style={{ color: "var(--accent)" }}>{avgScore}%</span> average signal
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
        <span>
          last sync{" "}
          <span style={{ color: "var(--accent)" }}>
            {lastAttempt ? new Date(lastAttempt.at).toLocaleDateString() : "never"}
          </span>
        </span>
      </div>

      {/* Link Status */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Link status
          </h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>State</th>
              <th>Signal</th>
              <th>Attempts</th>
              <th>Latest</th>
            </tr>
          </thead>
          <tbody>
            {unitStats.map((stat) => (
              <tr key={stat.unit}>
                <td className="font-medium">Unit {stat.unit}</td>
                <td>
                  <span
                    className="mono text-xs"
                    style={{ color: stat.up ? "var(--accent)" : "var(--text-secondary)" }}
                  >
                    {stat.up ? "UP" : "DOWN"}
                  </span>
                </td>
                <td>
                  {stat.attempts > 0 ? (
                    <div className="flex items-center gap-2">
                      <SignalBars pct={stat.best} />
                      <span className="mono text-xs" style={{ color: "var(--text-secondary)" }}>
                        {stat.best}%
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: "var(--text-secondary)" }}>—</span>
                  )}
                </td>
                <td>{stat.attempts || "—"}</td>
                <td>{stat.latest > 0 ? `${stat.latest}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Connection Log */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Connection log
          </h2>
        </div>

        {quizRuns.length > 0 ? (
          <div className="mono text-xs sm:text-sm divide-y" style={{ borderColor: "var(--border)" }}>
            {quizRuns
              .slice()
              .reverse()
              .slice(0, 12)
              .map((run, idx) => {
                const pct = Math.round((run.score / run.total) * 100);
                return (
                  <div
                    key={idx}
                    className="px-6 py-3 flex items-center justify-between gap-4"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span style={{ color: "var(--text-secondary)" }}>
                        [{new Date(run.at).toLocaleString()}]
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>unit-{run.unit}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {run.score}/{run.total}
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: pct >= 70 ? "var(--accent)" : pct >= 50 ? "#c77d1a" : "#b3261e" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="p-10 text-center" style={{ color: "var(--text-secondary)" }}>
            <p className="mono text-sm">No connections logged yet.</p>
            <p className="mt-1 text-sm">Take a quiz to open your first link.</p>
          </div>
        )}
      </div>
    </div>
  );
}