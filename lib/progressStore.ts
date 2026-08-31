"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export type QuizRun = { unit: string; score: number; total: number; at: string };
type Progress = { visited: string[]; quizRuns: QuizRun[]; theme: "light"|"dark"; visit: (id:string)=>void; addQuiz:(r:QuizRun)=>void; setTheme:(t:"light"|"dark")=>void };
export const useProgress = create<Progress>()(persist((set) => ({
  visited: [], quizRuns: [], theme: "light",
  visit: id => set(s => ({ visited: Array.from(new Set([...s.visited, id])) })),
  addQuiz: r => set(s => ({ quizRuns: [...s.quizRuns, r] })),
  setTheme: theme => set({ theme })
}), { name: "cn-progress" }));
