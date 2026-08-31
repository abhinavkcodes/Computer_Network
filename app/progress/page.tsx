"use client";
import { useProgress } from "@/lib/progressStore";
import { units } from "@/lib/content";

export default function ProgressPage() {
  const { quizRuns } = useProgress();

  const avgScore =
    quizRuns.length > 0
      ? Math.round(
          (quizRuns.reduce((sum, r) => sum + r.score / r.total, 0) /
            quizRuns.length) *
            100
        )
      : 0;

  const lastAttempt = quizRuns[quizRuns.length - 1];

  const unitStats = units.map((unit) => {
    const unitRuns = quizRuns.filter((r) => r.unit === `${unit}`);
    if (unitRuns.length === 0) return { unit, attempts: 0, best: 0, latest: 0 };
    
    const best = Math.max(...unitRuns.map((r) => Math.round((r.score / r.total) * 100)));
    const latest = Math.round((unitRuns[unitRuns.length - 1].score / unitRuns[unitRuns.length - 1].total) * 100);
    
    return { unit, attempts: unitRuns.length, best, latest };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Progress Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Track your learning progress and quiz performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-slate-600 text-sm font-600 uppercase tracking-wide">
            Quiz Attempts
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">
            {quizRuns.length}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Total assessments completed
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-slate-600 text-sm font-600 uppercase tracking-wide">
            Average Score
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">
            {avgScore}%
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Across all attempts
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-slate-600 text-sm font-600 uppercase tracking-wide">
            Latest Result
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">
            {lastAttempt
              ? `${lastAttempt.score}/${lastAttempt.total}`
              : "—"}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {lastAttempt
              ? new Date(lastAttempt.at).toLocaleDateString()
              : "No attempts yet"}
          </p>
        </div>
      </div>

      {/* Unit Performance */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Unit Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Attempts</th>
                <th>Best Score</th>
                <th>Latest Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {unitStats.map((stat) => (
                <tr key={stat.unit}>
                  <td className="font-600">Unit {stat.unit}</td>
                  <td>{stat.attempts}</td>
                  <td>{stat.best > 0 ? `${stat.best}%` : "—"}</td>
                  <td>{stat.latest > 0 ? `${stat.latest}%` : "—"}</td>
                  <td>
                    {stat.attempts === 0 ? (
                      <span className="text-slate-500 text-sm">Not started</span>
                    ) : stat.best >= 80 ? (
                      <span className="text-green-600 text-sm font-600">
                        ✓ Mastered
                      </span>
                    ) : stat.best >= 60 ? (
                      <span className="text-blue-600 text-sm font-600">
                        → In Progress
                      </span>
                    ) : (
                      <span className="text-orange-600 text-sm font-600">
                        ⚠ Needs Work
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attempts */}
      {quizRuns.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Recent Attempts</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {quizRuns
              .slice()
              .reverse()
              .slice(0, 10)
              .map((run, idx) => (
                <div
                  key={idx}
                  className="px-8 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div>
                    <p className="font-600 text-slate-900">Unit {run.unit}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(run.at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      {run.score}/{run.total}
                    </div>
                    <p className="text-sm text-slate-600">
                      {Math.round((run.score / run.total) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {quizRuns.length === 0 && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">No quiz attempts yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Start with the Notes section and then take a Quiz to begin tracking
            your progress.
          </p>
        </div>
      )}
    </div>
  );
}
