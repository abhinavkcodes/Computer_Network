"use client";
import { useMemo, useState } from "react";
import { useProgress } from "@/lib/progressStore";
import u1 from "@/data/quizzes/unit-1.json";
import u2 from "@/data/quizzes/unit-2.json";
import u3 from "@/data/quizzes/unit-3.json";
import u4 from "@/data/quizzes/unit-4.json";
import u5 from "@/data/quizzes/unit-5.json";

const bank: any = { unit1: u1, unit2: u2, unit3: u3, unit4: u4, unit5: u5 };

export function QuizRunner({ unit }: { unit: string }) {
  const add = useProgress((s) => s.addQuiz);
  const qs = useMemo(
    () =>
      unit === "mixed"
        ? Object.values(bank).flat()
        : bank[`unit${unit}`] ?? [],
    [unit]
  );
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const q: any = qs[i];

  if (!q) return <p className="text-slate-600">No quiz found.</p>;

  if (done) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="text-center">
          <p className="text-sm font-600 text-slate-600 uppercase tracking-wide">
            Quiz Completed
          </p>
          <h2 className="mt-4 text-5xl font-bold text-slate-900">
            {score}/{qs.length}
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            {Math.round((score / qs.length) * 100)}%
          </p>
          <p className="mt-6 text-slate-600">
            Your result has been saved to your progress dashboard.
          </p>
        </div>
      </div>
    );
  }

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (i === qs.length - 1) {
      add({
        unit,
        score: score + (picked === q.answer ? 1 : 0),
        total: qs.length,
        at: new Date().toISOString(),
      });
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-600 text-slate-600">
            Question {i + 1} of {qs.length}
          </span>
          <span className="text-sm font-600 text-slate-600">
            Score: {score}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((i + 1) / qs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900">{q.question}</h2>

        {/* Options */}
        <div className="mt-8 space-y-3">
          {q.options.map((o: string, n: number) => (
            <button
              key={o}
              onClick={() => choose(n)}
              disabled={picked !== null}
              className={`w-full text-left px-6 py-4 rounded-lg border-2 transition font-500 ${
                picked === null
                  ? "border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50 cursor-pointer"
                  : picked === n
                  ? n === q.answer
                    ? "border-green-600 bg-green-50 text-green-900"
                    : "border-red-600 bg-red-50 text-red-900"
                  : n === q.answer
                  ? "border-green-600 bg-green-50 text-green-900"
                  : "border-slate-200 bg-slate-50 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-600 ${
                    picked === null
                      ? "bg-slate-200 text-slate-600"
                      : picked === n
                      ? n === q.answer
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                      : n === q.answer
                      ? "bg-green-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {picked === n && n === q.answer && "✓"}
                  {picked === n && n !== q.answer && "✗"}
                  {picked !== n && n === q.answer && "✓"}
                  {picked === null && String.fromCharCode(65 + n)}
                </span>
                <span>{o}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {picked !== null && (
          <div
            className={`mt-8 p-6 rounded-lg border-l-4 ${
              picked === q.answer
                ? "bg-green-50 border-green-600"
                : "bg-orange-50 border-orange-600"
            }`}
          >
            <p
              className={`font-600 ${
                picked === q.answer ? "text-green-900" : "text-orange-900"
              }`}
            >
              {picked === q.answer ? "Correct!" : "Incorrect"}
            </p>
            <p className="mt-2 text-sm text-slate-700">{q.explanation}</p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={next}
          disabled={picked === null}
          className="mt-8 w-full py-3 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {i === qs.length - 1 ? "Finish Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
