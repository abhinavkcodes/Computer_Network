import { QuizRunner } from "@/components/quiz/QuizRunner";

export default function Quiz({ params }: { params: { unit: string } }) {
  return (
    <div className="-mt-4 max-w-3xl">
      <QuizRunner unit={params.unit} />
    </div>
  );
}