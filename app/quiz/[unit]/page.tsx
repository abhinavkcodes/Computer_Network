import { QuizRunner } from "@/components/quiz/QuizRunner";

export default function Quiz({ params }: { params: { unit: string } }) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-sm font-600 text-slate-600 uppercase tracking-wide">
          Assessment
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          {params.unit === "mixed"
            ? "Mixed Practice Quiz"
            : `Unit ${params.unit} Quiz`}
        </h1>
        <p className="mt-2 text-slate-600">
          Test your knowledge and track your progress
        </p>
      </div>
      <QuizRunner unit={params.unit} />
    </div>
  );
}
