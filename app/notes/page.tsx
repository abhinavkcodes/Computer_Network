"use client";
import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, FileWarning, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { units } from "@/lib/content";

export default function Notes() {
  const [u, setU] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // #view=Fit tells the browser's built-in PDF viewer to fit the ENTIRE
  // page (both width and height) inside the visible area, so page 1 is
  // fully visible without needing to scroll. #zoom=page-width only fit
  // the width, which is why the page was taller than the box before.
  const rawSrc = `/notes/Unit-${u}.pdf`;
  const viewSrc = `${rawSrc}#view=Fit`;

  useEffect(() => {
    setLoaded(false);
  }, [u]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const idx = units.indexOf(u);
      if (e.key === "ArrowRight" && idx < units.length - 1) setU(units[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) setU(units[idx - 1]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [u]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      viewerRef.current.requestFullscreen().catch(() => {
            // Fullscreen API can be blocked by browser settings/permissions -
        // fail silently rather than throwing an unhandled error.
      });
    }
  };

  const idx = units.indexOf(u);

  return (
    <div className="-mt-5 space-y-2 lg:h-[calc(100vh-4.5rem)] lg:overflow-hidden">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Study Notes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Comprehensive faculty notes covering computer networking concepts
          </p>
        </div>
        <p className="mono text-xs" style={{ color: "var(--text-secondary)" }}>
            {units.length} units available · Use ← → to switch
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100%-4rem)] lg:grid-cols-4">
        {/* Unit Selector */}
        <aside className="lg:col-span-1">
          <div className="space-y-3 lg:sticky lg:top-0">
            <h2 className="mono text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "var(--text-secondary)" }}>
              Units
            </h2>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
              {units.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setU(n)}
                  className="flex-shrink-0 lg:w-full px-4 py-3 rounded-lg text-sm font-medium transition text-left"
                  style={{
                    background: u === n ? "var(--accent)" : "var(--bg-card)",
                    color: u === n ? "white" : "var(--text-primary)",
                    border: u === n ? "1px solid var(--accent)" : "1px solid var(--border)",
                  }}
                >
                  <span className="flex items-center justify-between gap-3"><span>Unit {n}</span><span className="mono text-[10px]" style={{ color: u === n ? "rgba(255,255,255,0.65)" : "var(--text-secondary)" }}>PDF</span></span>
                </button>
              ))}
            </div>

            {/* Prev/Next */}
            <div className="hidden lg:flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => idx > 0 && setU(units[idx - 1])}
                disabled={idx === 0}
                className="btn flex-1 py-2 text-xs"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                type="button"
                onClick={() => idx < units.length - 1 && setU(units[idx + 1])}
                disabled={idx === units.length - 1}
                className="btn flex-1 py-2 text-xs"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
              <a href={rawSrc} download className="btn btn-primary w-full">
                <Download size={15} strokeWidth={2} />
                Download
              </a>
              <a href={rawSrc} target="_blank" rel="noopener noreferrer" className="btn w-full">
                <ExternalLink size={15} strokeWidth={2} />
                Open in new tab
              </a>
            </div>
          </div>
        </aside>

        {/* PDF Viewer */}
        <div className="card animate-in overflow-hidden lg:col-span-3" key={u}>
          <div className="px-6 py-3.5 border-b flex items-center justify-between gap-3" style={{ background: "var(--bg-light)", borderColor: "var(--border)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              <span>Unit {u} Notes</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="mono text-xs hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
                {idx + 1} of {units.length}
              </span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="btn py-2 px-3 text-xs"
                aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
              >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
              </button>
            </div>
          </div>

          <div ref={viewerRef} className="notes-viewer relative" style={{ height: isFullscreen ? "100vh" : "calc(100vh - 140px)", minHeight: isFullscreen ? undefined : "420px", background: "var(--bg-card)" }}>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--bg-card)" }}>
                <div className="text-center">
                  <div
                    className="mx-auto w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
                  />
                  <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>Opening Unit {u} notes...</p>
                </div>
              </div>
            )}
            <object
              data={viewSrc}
              type="application/pdf"
              className="w-full h-full block"
              onLoad={() => setLoaded(true)}
            >
              <div className="p-8 text-center h-full flex flex-col items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                <FileWarning size={28} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
                <p className="mt-3 font-medium" style={{ color: "var(--text-primary)" }}>
                  PDF preview unavailable
                </p>
                <p className="mt-1 text-sm max-w-sm">
                  The file may not be present yet, or your browser can't preview PDFs inline.
                  Make sure it's placed at{" "}
                  <code className="mono" style={{ color: "var(--accent)" }}>public/notes/Unit-{u}.pdf</code>
                </p>
                <a href={rawSrc} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">
                  <ExternalLink size={14} />
                  Try opening directly
                </a>
              </div>
            </object>
          </div>
        </div>
      </div>
    </div>
  );
}