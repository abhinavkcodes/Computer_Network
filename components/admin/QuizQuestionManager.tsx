"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

type Question = { id: string; unit: "1" | "2"; question: string; options: string[]; answer: number; explanation: string; enabled: boolean; created_at: string };
type Form = { unit: "1" | "2"; question: string; options: string[]; answer: number; explanation: string };
const blank: Form = { unit: "1", question: "", options: ["", "", "", ""], answer: 0, explanation: "" };

export function QuizQuestionManager({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [form, setForm] = useState<Form>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "1" | "2">("all");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setQuestions(initialQuestions); }, [initialQuestions]);
  const visible = filter === "all" ? questions : questions.filter((question) => question.unit === filter);
  const updateOption = (index: number, value: string) => setForm((current) => ({ ...current, options: current.options.map((option, optionIndex) => optionIndex === index ? value : option) }));
  const reset = () => { setForm(blank); setEditingId(null); setError(""); };

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true); setError("");
    const response = await fetch("/api/quiz-questions", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingId ? { ...form, id: editingId } : form) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error ?? "Could not save question."); setSaving(false); return; }
    setQuestions((current) => editingId ? current.map((question) => question.id === editingId ? result : question) : [result, ...current]);
    reset(); setSaving(false);
  }

  async function toggle(question: Question) {
    const response = await fetch("/api/quiz-questions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: question.id, enabled: !question.enabled }) });
    if (response.ok) setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, enabled: !item.enabled } : item));
  }

  async function remove(question: Question) {
    if (!window.confirm("Delete this question?")) return;
    const response = await fetch(`/api/quiz-questions?id=${question.id}`, { method: "DELETE" });
    if (response.ok) setQuestions((current) => current.filter((item) => item.id !== question.id));
  }

  return <div className="space-y-8"><section className="card p-6"><div className="flex items-start justify-between gap-4"><div><p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{editingId ? "Edit question" : "Question editor"}</p><h2 className="mt-1 text-xl font-bold" style={{ color: "var(--text-primary)" }}>{editingId ? "Update question" : "Add a question"}</h2></div>{editingId && <button type="button" className="btn text-xs" onClick={reset}><X size={14} /> Cancel</button>}</div><form onSubmit={save} className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-[9rem_1fr]"><label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Unit</span><select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value as "1" | "2" })} className="w-full rounded border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}><option value="1">Unit 1</option><option value="2">Unit 2</option></select></label><label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Question</span><input required value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} placeholder="Write the question" className="w-full rounded border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /></label></div><div className="grid gap-3 sm:grid-cols-2">{form.options.map((option, index) => <label key={index} className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Option {String.fromCharCode(65 + index)}</span><input required value={option} onChange={(event) => updateOption(index, event.target.value)} className="w-full rounded border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>)}</div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Correct option</span><select value={form.answer} onChange={(event) => setForm({ ...form, answer: Number(event.target.value) })} className="w-full rounded border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>{form.options.map((_, index) => <option key={index} value={index}>Option {String.fromCharCode(65 + index)}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Explanation</span><input required value={form.explanation} onChange={(event) => setForm({ ...form, explanation: event.target.value })} placeholder="Explain the correct answer" className="w-full rounded border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} /></label></div>{error && <p className="text-sm" style={{ color: "#9b3d32" }}>{error}</p>}<button type="submit" disabled={saving} className="btn btn-primary"><Plus size={15} />{saving ? "Saving..." : editingId ? "Save changes" : "Add question"}</button></form></section><section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="mono text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Managed bank</p><h2 className="mt-1 text-xl font-bold" style={{ color: "var(--text-primary)" }}>Custom questions</h2></div><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded border bg-transparent px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}><option value="all">All units</option><option value="1">Unit 1</option><option value="2">Unit 2</option></select></div>{visible.length ? <div className="space-y-3">{visible.map((question) => <article key={question.id} className="card p-5"><div className="flex items-start justify-between gap-4"><div><p className="mono text-xs" style={{ color: "var(--text-secondary)" }}>UNIT {question.unit} · {question.enabled ? "Published" : "Hidden"}</p><h3 className="mt-2 font-semibold" style={{ color: "var(--text-primary)" }}>{question.question}</h3></div><div className="flex shrink-0 gap-1"><button type="button" className="btn px-2.5 py-2" title="Edit question" aria-label="Edit question" onClick={() => { setEditingId(question.id); setForm({ unit: question.unit, question: question.question, options: question.options, answer: question.answer, explanation: question.explanation }); }}><Pencil size={14} /></button><button type="button" className="btn px-2.5 py-2" title={question.enabled ? "Hide question" : "Publish question"} aria-label={question.enabled ? "Hide question" : "Publish question"} onClick={() => void toggle(question)}><Check size={14} /></button><button type="button" className="btn px-2.5 py-2" title="Delete question" aria-label="Delete question" onClick={() => void remove(question)}><Trash2 size={14} /></button></div></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">{question.options.map((option, index) => <p key={option} style={{ color: index === question.answer ? "var(--accent)" : "var(--text-secondary)" }}>{String.fromCharCode(65 + index)}. {option}{index === question.answer && " · correct"}</p>)}</div><p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>{question.explanation}</p></article>)}</div> : <div className="card p-8 text-sm" style={{ color: "var(--text-secondary)" }}>No managed questions yet. Add one above.</div>}</section></div>;
}
