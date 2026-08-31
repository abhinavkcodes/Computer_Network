"use client";
import { useState } from "react";
import { units } from "@/lib/content";

export default function Notes() {
  const [u, setU] = useState(1);
  const src = `/notes/unit-${u}.pdf`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Study Notes</h1>
        <p className="mt-2 text-slate-600">
          Comprehensive faculty notes covering computer networking concepts
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Unit Selector */}
        <aside className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Units
          </h2>
          <div className="space-y-2">
            {units.map((n) => (
              <button
                key={n}
                onClick={() => setU(n)}
                className={`w-full px-4 py-3 rounded-lg text-sm font-600 transition ${
                  u === n
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Unit {n}
              </button>
            ))}
          </div>

          {/* Download Button */}
          <div className="pt-4 border-t border-slate-200">
            <a
              href={src}
              download
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-600 text-sm hover:bg-blue-700 transition"
            >
              ⬇ Download
            </a>
          </div>
        </aside>

        {/* PDF Viewer */}
        <div className="col-span-3 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
            <p className="text-sm font-600 text-slate-600 uppercase tracking-wide">
              PDF Preview
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Unit {u} Notes
            </h2>
          </div>
          <object
            data={src}
            type="application/pdf"
            className="w-full"
            style={{ height: "70vh" }}
          >
            <div className="p-8 text-center text-slate-600">
              <p>PDF preview unavailable or file not present yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Please ensure the PDF file is placed at{" "}
                <code className="mono text-slate-400">public/notes/unit-{u}.pdf</code>
              </p>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
