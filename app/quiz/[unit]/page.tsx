import { QuizRunner } from "@/components/quiz/QuizRunner";

export default function Quiz({ params }: { params: { unit: string } }) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          {params.unit === "mixed" ? "Mixed Practice Quiz" : `Unit ${params.unit} Quiz`}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Answer at your own pace - press 1–4 to pick, Enter to move on.
        </p>
      </div>
      <QuizRunner unit={params.unit} />
    </div>
  );
}