import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import u1 from "@/data/quizzes/unit-1.json";
import u2 from "@/data/quizzes/unit-2.json";

const quizzes = [
  { unit: "1", title: "Network Fundamentals", description: "Topologies, network types, and communication basics.", questions: u1.length },
  { unit: "2", title: "Protocols and Models", description: "Layered models, protocols, and network architecture.", questions: u2.length },
];
const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions, 0);

export default function QuizCenter() {
  return (
    <div className="max-w-4xl space-y-10">
      <header>
        <p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Practice center</p>
        <h1 className="mt-2 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>Choose a quiz</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>Pick Unit 1 or Unit 2 to focus your revision, or take a mixed challenge from both available units.</p>
      </header>

      <Link href="/quiz/mixed" className="group block border p-6 transition-colors hover:border-black dark:hover:border-white" style={{ borderColor: "var(--accent)", background: "var(--bg-dark)", color: "white" }}>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div><p className="mono text-xs uppercase tracking-widest" style={{ color: "#aeb2b8" }}>Full course challenge</p><h2 className="mt-2 text-2xl font-bold">All units mixed</h2><p className="mt-2 max-w-lg text-sm" style={{ color: "#bcc0c6" }}>{totalQuestions} questions sampled across all five units.</p></div>
          <span className="flex shrink-0 items-center gap-2 text-sm font-semibold">Start challenge <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>
        </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs" style={{ color: "#d9dade" }}><span className="flex items-center gap-1.5"><Layers3 size={14} />2 units</span></div>
      </Link>

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Unit quizzes</h2><span className="mono text-xs" style={{ color: "var(--text-secondary)" }}>Available now</span></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {quizzes.map((quiz) => <Link key={quiz.unit} href={`/quiz/${quiz.unit}`} className="group border p-5 transition-colors hover:border-black dark:hover:border-white" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}><div className="flex items-start justify-between gap-4"><span className="mono text-sm" style={{ color: "var(--text-secondary)" }}>UNIT {quiz.unit}</span><ArrowRight size={17} style={{ color: "var(--text-secondary)" }} className="transition-transform group-hover:translate-x-1" /></div><h3 className="mt-5 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{quiz.title}</h3><p className="mt-2 min-h-10 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{quiz.description}</p><div className="mt-5 text-xs" style={{ color: "var(--text-secondary)" }}>{quiz.questions} questions</div></Link>)}
        </div>
      </section>
    </div>
  );
}
