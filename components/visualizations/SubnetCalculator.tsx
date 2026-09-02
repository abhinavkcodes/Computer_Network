"use client";
import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Info,
  Network,
  Layers,
} from "lucide-react";
import { cidrInfo, vlsm, type Subnet } from "@/lib/subnetMath";

type Mode = "single" | "vlsm";

const PRESETS: Record<Mode, { label: string; ip: string; prefix: number; hosts?: string }[]> = {
  single: [
    { label: "Class A", ip: "10.0.0.0", prefix: 8 },
    { label: "Class B", ip: "172.16.0.0", prefix: 16 },
    { label: "Class C", ip: "192.168.1.0", prefix: 24 },
  ],
  vlsm: [
    { label: "3-way split (60/28/12)", ip: "192.168.10.0", prefix: 24, hosts: "60,28,12" },
    { label: "5-way split", ip: "10.10.0.0", prefix: 22, hosts: "100,50,25,10,5" },
  ],
};

const FIELD_HELP: Record<string, string> = {
  network: "The first address in the block - identifies the subnet itself, not assignable to a device.",
  broadcast: "The last address in the block - reserved for sending to every device on the subnet.",
  firstHost: "The first address devices can actually use.",
  lastHost: "The last address devices can actually use.",
};

function octets(ip: string) {
  return ip.split(".").map(Number);
}
function toBinaryOctet(n: number) {
  return n.toString(2).padStart(8, "0");
}

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="More info"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex"
        style={{ color: "var(--text-secondary)" }}
      >
        <Info size={12} strokeWidth={2} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-52 text-xs rounded-md px-3 py-2 z-10 shadow-lg"
          style={{ background: "var(--bg-dark)", color: "white" }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

function BinaryWalkthrough({ ip, mask, network }: { ip: string; mask: string; network: string }) {
  const ipO = octets(ip);
  const maskO = octets(mask);
  const netO = octets(network);

  return (
    <div className="mt-4 rounded-lg overflow-hidden animate-in" style={{ border: "1px solid var(--border)" }}>
      <div className="mono grid grid-cols-4 text-center text-xs">
        {ipO.map((_, i) => (
          <div key={i} className="px-2 py-1.5" style={{ background: "var(--bg-light)", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
            Octet {i + 1}
          </div>
        ))}
      </div>
      <div className="mono grid grid-cols-4 text-center text-sm py-2">
        {ipO.map((o, i) => <div key={i} style={{ color: "var(--text-primary)" }}>{toBinaryOctet(o)}</div>)}
      </div>
      <div className="mono grid grid-cols-4 text-center text-[10px] pb-1" style={{ color: "var(--text-secondary)" }}>
        {ipO.map((_, i) => <div key={i}>IP</div>)}
      </div>
      <div className="mono grid grid-cols-4 text-center text-sm py-2" style={{ borderTop: "1px dashed var(--border)" }}>
        {maskO.map((o, i) => <div key={i} style={{ color: "var(--accent)" }}>{toBinaryOctet(o)}</div>)}
      </div>
      <div className="mono grid grid-cols-4 text-center text-[10px] pb-1" style={{ color: "var(--text-secondary)" }}>
        {maskO.map((_, i) => <div key={i}>AND Mask</div>)}
      </div>
      <div className="mono grid grid-cols-4 text-center text-sm py-2 font-bold" style={{ borderTop: "1px solid var(--border)", background: "var(--accent-light)" }}>
        {netO.map((o, i) => <div key={i} style={{ color: "var(--accent)" }}>{toBinaryOctet(o)}</div>)}
      </div>
      <div className="mono grid grid-cols-4 text-center text-[10px] pb-2" style={{ color: "var(--text-secondary)" }}>
        {netO.map((_, i) => <div key={i}>= Network</div>)}
      </div>
    </div>
  );
}

export function SubnetCalculator() {
  const [mode, setMode] = useState<Mode>("single");
  const [ip, setIp] = useState("192.168.10.0");
  const [prefix, setPrefix] = useState(24);
  const [hosts, setHosts] = useState("60,28,12");
  const [copied, setCopied] = useState<string | null>(null);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());

  const ipOctets = ip.split(".");
  const ipValid = ipOctets.length === 4 && ipOctets.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
  const prefixValid = Number.isInteger(prefix) && prefix >= 0 && prefix <= 32;
  const hostList = mode === "vlsm" && hosts.trim() ? hosts.split(",").map((x) => x.trim()) : [];
  const hostsValid = mode === "single" || hostList.every((x) => /^\d+$/.test(x) && Number(x) >= 1);
  const hostsRequired = mode === "vlsm" && hostList.length === 0;

  const { rows, err } = useMemo<{ rows: Subnet[]; err: string }>(() => {
    if (!ipValid) return { rows: [], err: "Enter a valid IPv4 address, e.g. 192.168.1.0" };
    if (!prefixValid) return { rows: [], err: "Prefix must be a number between 0 and 32" };
    if (mode === "vlsm") {
      if (hostsRequired) return { rows: [], err: "Enter at least one host count for VLSM mode" };
      if (!hostsValid) return { rows: [], err: "Host counts must be positive whole numbers, comma-separated" };
    }
    try {
      const result = mode === "vlsm" ? vlsm(ip, prefix, hostList.map(Number)) : [cidrInfo(ip, prefix)];
      return { rows: result, err: "" };
    } catch (e: any) {
      return { rows: [], err: e.message };
    }
  }, [ip, prefix, hosts, mode, ipValid, prefixValid, hostsValid, hostsRequired]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyFullResult = (r: Subnet, idx: number) => {
    const text = [
      `CIDR: ${r.cidr}`, `Mask: ${r.mask}`, `Network: ${r.network}`,
      `Broadcast: ${r.broadcast}`, `First Host: ${r.firstHost}`, `Last Host: ${r.lastHost}`,
      `Usable Hosts: ${r.hosts}`,
    ].join("\n");
    copyToClipboard(text, `full-${idx}`);
  };

  const toggleSteps = (idx: number) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const applyPreset = (p: { ip: string; prefix: number; hosts?: string }) => {
    setIp(p.ip);
    setPrefix(p.prefix);
    if (p.hosts) setHosts(p.hosts);
  };

  const reset = () => {
    setIp("192.168.1.0");
    setPrefix(24);
    setHosts(mode === "vlsm" ? "60,28,12" : "");
    setOpenSteps(new Set());
  };

  const calculateUtilization = (r: Subnet) => {
    const blockSize = 2 ** (32 - r.prefix);
    if (blockSize <= 2) return 0;
    return Math.round((r.hosts / (blockSize - 2)) * 100);
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg font-mono text-sm bg-transparent focus:outline-none focus:ring-2 transition";

  const fieldRow: [string, keyof typeof FIELD_HELP][] = [
    ["Network", "network"],
    ["Broadcast", "broadcast"],
    ["First Host", "firstHost"],
    ["Last Host", "lastHost"],
  ];

  return (
    <div className="space-y-8">
      {/* Mode Tabs */}
      <div className="inline-flex p-1 rounded-lg" style={{ background: "var(--bg-light)", border: "1px solid var(--border)" }}>
        {(["single", "vlsm"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition"
            style={{
              background: mode === m ? "var(--bg-card)" : "transparent",
              color: mode === m ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: mode === m ? "0 1px 2px rgba(12,21,38,0.06)" : "none",
            }}
            aria-pressed={mode === m}
          >
            {m === "single" ? <Network size={14} strokeWidth={2} /> : <Layers size={14} strokeWidth={2} />}
            {m === "single" ? "Single Subnet" : "VLSM Split"}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS[mode].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition hover:opacity-80"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            <Sparkles size={12} strokeWidth={2} />
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition ml-auto"
          style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          <RotateCcw size={12} strokeWidth={2} />
          Reset
        </button>
      </div>

      {/* Input Section */}
      <div className="card p-8">
        <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          {mode === "single" ? "Subnet Details" : "VLSM Allocation"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {mode === "single"
            ? "Enter a network address and prefix to see its full breakdown."
            : "Enter a parent network and the host counts each sub-network needs."}
        </p>

        <div className={`grid gap-6 ${mode === "vlsm" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Network IP Address
            </label>
            <input
              className={inputClass}
              style={{ border: `1px solid ${ip && !ipValid ? "#b3261e" : "var(--border)"}`, color: "var(--text-primary)" }}
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.0.0"
              aria-invalid={!!ip && !ipValid}
            />
            {ip && !ipValid && (
              <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#b3261e" }}>
                <AlertCircle size={12} /> Each octet must be 0–255
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              CIDR Prefix (/)
            </label>
            <input
              className={inputClass}
              style={{ border: `1px solid ${!prefixValid ? "#b3261e" : "var(--border)"}`, color: "var(--text-primary)" }}
              type="number"
              min={0}
              max={32}
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
              aria-invalid={!prefixValid}
            />
            {!prefixValid && (
              <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#b3261e" }}>
                <AlertCircle size={12} /> Must be 0–32
              </p>
            )}
          </div>

          {mode === "vlsm" && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Host Counts Needed
              </label>
              <input
                className={inputClass}
                style={{ border: `1px solid ${hosts.trim() && !hostsValid ? "#b3261e" : "var(--border)"}`, color: "var(--text-primary)" }}
                value={hosts}
                onChange={(e) => setHosts(e.target.value)}
                placeholder="60,28,12"
                aria-invalid={hosts.trim() ? !hostsValid : false}
              />
              {hosts.trim() && !hostsValid && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#b3261e" }}>
                  <AlertCircle size={12} /> Comma-separated positive numbers only
                </p>
              )}
            </div>
          )}
        </div>

        {mode === "vlsm" && !err && rows.length > 1 && (
          <p className="mt-5 text-xs flex items-start gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <Info size={13} className="mt-0.5 flex-shrink-0" />
            Largest host requirement is allocated first to use address space efficiently - subnets below are in allocation order, not input order.
          </p>
        )}

        {err && (
          <div className="mt-6 p-4 rounded-lg border-l-4 flex items-start gap-2" style={{ background: "#fbeceb", borderColor: "#b3261e" }}>
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#b3261e" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#7a1c17" }}>Can't calculate yet</p>
              <p className="text-sm mt-0.5" style={{ color: "#7a1c17" }}>{err}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {rows.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((r, idx) => (
              <div
                key={r.cidr}
                className="card p-6 animate-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="mono font-bold text-lg" style={{ color: "var(--accent)" }}>
                      {r.cidr}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyFullResult(r, idx)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium transition"
                      style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                      aria-label={`Copy details for ${r.cidr}`}
                    >
                      {copied === `full-${idx}` ? (
                        <><Check size={12} strokeWidth={2.5} /> Copied</>
                      ) : (
                        <><Copy size={12} strokeWidth={2} /> Copy</>
                      )}
                    </button>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Mask: <span className="mono font-medium" style={{ color: "var(--text-primary)" }}>{r.mask}</span>
                  </p>
                </div>

                <div className="space-y-3 mb-6 pb-6 text-sm" style={{ borderBottom: "1px solid var(--border)" }}>
                  {fieldRow.map(([label, key]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="inline-flex items-center" style={{ color: "var(--text-secondary)" }}>
                        {label}:
                        <Tooltip text={FIELD_HELP[key]} />
                      </span>
                      <span className="mono font-medium" style={{ color: "var(--text-primary)" }}>
                        {(r as any)[key]}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Usable Hosts:</span>
                    <span className="font-bold text-lg" style={{ color: "var(--accent)" }}>{r.hosts}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between mb-2">
                    <span className="mono text-xs" style={{ color: "var(--text-secondary)" }}>Utilization</span>
                    <span className="mono text-xs font-medium" style={{ color: "var(--accent)" }}>
                      {calculateUtilization(r)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, calculateUtilization(r))}%`, background: "var(--accent)" }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSteps(idx)}
                  className="mt-4 w-full flex items-center justify-between text-xs font-medium py-2"
                  style={{ color: "var(--accent)" }}
                  aria-expanded={openSteps.has(idx)}
                >
                  Show octet-by-octet AND walkthrough
                  {openSteps.has(idx) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSteps.has(idx) && (
                  <BinaryWalkthrough ip={r.network} mask={r.mask} network={r.network} />
                )}
              </div>
            ))}
          </div>

          {/* Summary strip */}
          <div className="card p-6 flex flex-wrap gap-x-10 gap-y-3" style={{ background: "var(--bg-light)" }}>
            {[
              ["Total Subnets", rows.length],
              ["Total Usable Hosts", rows.reduce((sum, r) => sum + r.hosts, 0)],
              ...(mode === "vlsm" ? [["Scheme", "VLSM"]] : []),
              ["IP Version", "IPv4"],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="mono text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--text-secondary)" }}>
                  {label}
                </p>
                <p className="mt-0.5 font-bold text-lg" style={{ color: "var(--text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {rows.length === 0 && !err && (
        <div className="card p-12 text-center" style={{ background: "var(--bg-light)" }}>
          <p style={{ color: "var(--text-secondary)" }}>
            Enter values above to calculate subnet information
          </p>
        </div>
      )}
    </div>
  );
}