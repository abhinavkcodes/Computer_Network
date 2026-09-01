"use client";
import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/lib/progressStore";
import { Check, X, Flame, RotateCcw, ListChecks } from "lucide-react";
import u1 from "@/data/quizzes/unit-1.json";
import u2 from "@/data/quizzes/unit-2.json";
import u3 from "@/data/quizzes/unit-3.json";
import u4 from "@/data/quizzes/unit-4.json";
import u5 from "@/data/quizzes/unit-5.json";

const bank: any = { unit1: u1, unit2: u2, unit3: u3, unit4: u4, unit5: u5 };

type Answer = { question: string; picked: number; correct: number; isCorrect: boolean; explanation: string; options: string[] };

export function QuizRunner({ unit }: { unit: string }) {
  const add = useProgress((s) => s.addQuiz);
  const qs = useMemo(
    () => (unit === "mixed" ? Object.values(bank).flat() : bank[`unit${unit}`] ?? []),
    [unit]
  );

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showReview, setShowReview] = useState(false);

  const q: any = qs[i];
  const revealed = picked !== null;

  const choose = (n: number) => {
    if (revealed || !q) return;
    setPicked(n);
    const correct = n === q.answer;
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    setAnswers((prev) => [
      ...prev,
      { question: q.question, picked: n, correct: q.answer, isCorrect: correct, explanation: q.explanation, options: q.options },
    ]);
  };

  const next = () => {
    if (!revealed) return;
    if (i === qs.length - 1) {
      add({
        unit,
        score: score,
        total: qs.length,
        at: new Date().toISOString(),
      });
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setI(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setDone(false);
    setPicked(null);
    setAnswers([]);
    setShowReview(false);
  };

  // Keyboard shortcuts: 1-4 to pick, Enter to advance
  useEffect(() => {
    if (done || !q) return;
    const handler = (e: KeyboardEvent) => {
      if (!revealed && ["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < q.options.length) choose(idx);
      } else if (revealed && e.key === "Enter") {
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, q, done]);

  if (!q && !done) return <p style={{ color: "var(--text-secondary)" }}>No quiz found.</p>;

  if (done) {
    const pct = Math.round((score / qs.length) * 100);
    const wrongAnswers = answers.filter((a) => !a.isCorrect);
    const tier = pct >= 90 ? "Excellent" : pct >= 70 ? "Good work" : pct >= 50 ? "Keep practicing" : "Review the notes";

    if (showReview) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Review</h2>
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Back to results
            </button>
          </div>
          {answers.map((a, idx) => (
            <div key={idx} className="card p-6">
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: a.isCorrect ? "var(--accent-light)" : "#fbeceb", color: a.isCorrect ? "var(--accent)" : "#b3261e" }}
                >
                  {a.isCorrect ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2.5} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{a.question}</p>
                  <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Your answer: <span style={{ color: a.isCorrect ? "var(--accent)" : "#b3261e" }}>{a.options[a.picked]}</span>
                  </p>
                  {!a.isCorrect && (
                    <p className="mt-1 text-sm" style={{ color: "var(--accent)" }}>
                      Correct answer: {a.options[a.correct]}
                    </p>
                  )}
                  <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{a.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="card p-8 animate-in">
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            {tier}
          </p>
          <h2 className="mt-4 text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
            {score}/{qs.length}
          </h2>
          <p className="mt-2 text-lg" style={{ color: "var(--text-secondary)" }}>{pct}%</p>

          {bestStreak > 1 && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              <Flame size={14} strokeWidth={2} />
              Best streak: {bestStreak} in a row
            </div>
          )}

          <p className="mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            Your result has been saved to your progress dashboard.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {wrongAnswers.length > 0 && (
              <button type="button" onClick={() => setShowReview(true)} className="btn">
                <ListChecks size={15} strokeWidth={2} />
                Review {wrongAnswers.length} missed question{wrongAnswers.length > 1 ? "s" : ""}
              </button>
            )}
            <button type="button" onClick={restart} className="btn btn-primary">
              <RotateCcw size={15} strokeWidth={2} />
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="mono text-xs" style={{ color: "var(--text-secondary)" }}>
            Question {i + 1} of {qs.length}
          </span>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "#c77d1a" }}>
                <Flame size={13} strokeWidth={2.5} /> {streak}
              </span>
            )}
            <span className="mono text-xs" style={{ color: "var(--text-secondary)" }}>
              Score: {score}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {qs.map((_: any, idx: number) => {
            const answered = answers[idx];
            let bg = "var(--border)";
            if (idx < i) bg = answered?.isCorrect ? "var(--accent)" : "#c86a63";
            else if (idx === i) bg = "var(--accent)";
            return (
              <div
                key={idx}
                className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                style={{ background: bg, opacity: idx === i ? 1 : idx < i ? 1 : 0.5 }}
              />
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div className="card p-8 animate-in" key={i}>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {q.question}
        </h2>

        <div className="mt-8 space-y-3">
          {q.options.map((o: string, n: number) => {
            const isPicked = picked === n;
            const isAnswer = n === q.answer;

            let borderColor = "var(--border)";
            let bg = "var(--bg-card)";
            let textColor = "var(--text-primary)";
            let opacity = 1;

            if (revealed) {
              if (isAnswer) {
                borderColor = "var(--accent)";
                bg = "var(--accent-light)";
              } else if (isPicked) {
                borderColor = "#b3261e";
                bg = "#fbeceb";
                textColor = "#7a1c17";
              } else {
                opacity = 0.5;
              }
            }

            return (
              <button
                type="button"
                key={o}
                onClick={() => choose(n)}
                disabled={revealed}
                className="w-full text-left px-6 py-4 rounded-lg border-2 transition font-medium"
                style={{ borderColor, background: bg, color: textColor, opacity, cursor: revealed ? "default" : "pointer" }}
                onMouseEnter={(e) => { if (!revealed) e.currentTarget.style.borderColor = "var(--accent)"; }}
                onMouseLeave={(e) => { if (!revealed) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="mono flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background: revealed ? (isAnswer ? "var(--accent)" : isPicked ? "#b3261e" : "var(--border)") : "var(--border)",
                      color: revealed && (isAnswer || isPicked) ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {revealed && isAnswer && <Check size={13} strokeWidth={2.5} />}
                    {revealed && !isAnswer && isPicked && <X size={13} strokeWidth={2.5} />}
                    {!revealed && String.fromCharCode(65 + n)}
                  </span>
                  <span className="text-sm">{o}</span>
                  {!revealed && (
                    <span className="mono ml-auto text-[10px]" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
                      {n + 1}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            className="mt-8 p-6 rounded-lg border-l-4 animate-in"
            style={{ background: picked === q.answer ? "var(--accent-light)" : "#fdf3e7", borderColor: picked === q.answer ? "var(--accent)" : "#c77d1a" }}
          >
            <p className="font-semibold text-sm" style={{ color: picked === q.answer ? "#0b6259" : "#8a5313" }}>
              {picked === q.answer ? "Correct" : "Incorrect"}
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{q.explanation}</p>
          </div>
        )}

        <button type="button" onClick={next} disabled={!revealed} className="btn btn-primary mt-8 w-full py-3">
          {i === qs.length - 1 ? "Finish Quiz" : "Next Question"}
          {revealed && <span className="mono text-xs opacity-60 ml-2">(Enter ↵)</span>}
        </button>
      </div>
    </div>
  );
}