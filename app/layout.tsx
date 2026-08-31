import "./globals.css";
import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
export const metadata: Metadata = { title: "Computer Networks Lab", description: "Interactive Computer Networks learning platform" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><Shell>{children}</Shell></body></html>;
}
