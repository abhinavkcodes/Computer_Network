import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizQuestionManager } from "@/components/admin/QuizQuestionManager";

export default async function AdminQuizzesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (profile?.role !== "faculty") redirect("/");
  const { data: questions } = await supabase.from("quiz_questions").select("id, unit, question, options, answer, explanation, enabled, created_at").order("created_at", { ascending: false });
  return <div className="max-w-4xl space-y-8"><header><p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Faculty workspace</p><h1 className="mt-2 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>Quiz manager</h1><p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>Create and maintain custom questions for the available Unit 1 and Unit 2 quizzes.</p></header><QuizQuestionManager initialQuestions={questions ?? []} /></div>;
}