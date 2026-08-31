import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Welcome to CN.Lab
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Master computer networking concepts through structured learning and
          practice.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-slate-600 text-sm font-600 uppercase tracking-wide">
            Getting Started
          </div>
          <p className="mt-4 text-slate-700">
            Begin with the comprehensive study notes covering all 5 units of
            computer networks.
          </p>
          <Link
            href="/notes"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 font-500 hover:text-blue-700"
          >
            View Notes →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-slate-600 text-sm font-600 uppercase tracking-wide">
            Self Assessment
          </div>
          <p className="mt-4 text-slate-700">
            Test your knowledge with unit-based quizzes and track your progress.
          </p>
          <Link
            href="/quiz/mixed"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 font-500 hover:text-blue-700"
          >
            Take Quiz →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-slate-600 text-sm font-600 uppercase tracking-wide">
            Practice Calculations
          </div>
          <p className="mt-4 text-slate-700">
            Master subnet calculations with CIDR notation and VLSM allocation.
          </p>
          <Link
            href="/calculator"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 font-500 hover:text-blue-700"
          >
            Open Calculator →
          </Link>
        </div>
      </div>

      {/* Topics Overview */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900">Topics Covered</h2>
        <p className="mt-2 text-slate-600">
          This course lab covers essential computer networking concepts across 5
          units:
        </p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-700">
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Network Topologies & Architectures</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Switching & Forwarding</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>OSI & TCP/IP Layers</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Packet Structure & Flow</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>IP Addressing & Subnetting</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Routing & Network Protocols</span>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900">How to Use This Lab</h2>
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white text-sm font-bold">
                1
              </div>
            </div>
            <div>
              <p className="font-600 text-slate-900">Start with Notes</p>
              <p className="text-sm text-slate-600">
                Read through faculty PDFs to understand key concepts
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white text-sm font-bold">
                2
              </div>
            </div>
            <div>
              <p className="font-600 text-slate-900">Test Your Knowledge</p>
              <p className="text-sm text-slate-600">
                Take quizzes to reinforce learning and identify weak areas
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white text-sm font-bold">
                3
              </div>
            </div>
            <div>
              <p className="font-600 text-slate-900">Master Calculations</p>
              <p className="text-sm text-slate-600">
                Practice subnet math and network calculations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
