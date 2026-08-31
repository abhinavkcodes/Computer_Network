import type { Config } from "tailwindcss";
const config: Config = { darkMode: "class", content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"], theme: { extend: { colors: { ink: "#111827", paper: "#f7f7f4", mint: "#7dd3a8", coral: "#f28b82", steel: "#5b7c99" } } }, plugins: [] };
export default config;
