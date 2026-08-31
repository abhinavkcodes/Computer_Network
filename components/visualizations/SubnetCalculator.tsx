"use client";
import { useState } from "react";
import { cidrInfo, vlsm } from "@/lib/subnetMath";

export function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.10.0");
  const [prefix, setPrefix] = useState(24);
  const [hosts, setHosts] = useState("60,28,12");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  let rows: any[] = [];
  try {
    rows = hosts.trim()
      ? vlsm(ip, prefix, hosts.split(",").map((x) => Number(x.trim())))
      : [cidrInfo(ip, prefix)];
    if (err) setTimeout(() => setErr(""), 0);
  } catch (e: any) {
    rows = [];
    if (!err) setTimeout(() => setErr(e.message), 0);
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const calculateUtilization = (r: any) => {
    return Math.round(
      ((r.hosts + 2) /
        (256 -
          (r.prefix > 24 ? 256 - 2 ** (32 - r.prefix) : 0))) *
        100
    );
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Calculator Input
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-600 text-slate-700 mb-2">
              Network IP Address
            </label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-600 text-slate-700 mb-2">
              CIDR Prefix (/)
            </label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              min="0"
              max="32"
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-600 text-slate-700 mb-2">
              VLSM Host Counts (optional)
            </label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={hosts}
              onChange={(e) => setHosts(e.target.value)}
              placeholder="60,28,12"
            />
          </div>
        </div>
        {err && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-600">
            <p className="text-sm font-600 text-red-900">Error</p>
            <p className="text-sm text-red-800 mt-1">{err}</p>
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
                className="bg-white rounded-lg border border-slate-200 p-6"
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="mono font-bold text-lg text-blue-600">
                      {r.cidr}
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.cidr, `cidr-${idx}`)}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition font-600"
                    >
                      {copied === `cidr-${idx}` ? "✓" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600">
                    Mask:{" "}
                    <span className="mono font-600 text-slate-900">
                      {r.mask}
                    </span>
                  </p>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-slate-200 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Network:</span>
                    <span className="mono font-600 text-slate-900">
                      {r.network}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Broadcast:</span>
                    <span className="mono font-600 text-slate-900">
                      {r.broadcast}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">First Host:</span>
                    <span className="mono font-600 text-slate-900">
                      {r.firstHost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Host:</span>
                    <span className="mono font-600 text-slate-900">
                      {r.lastHost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Usable Hosts:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {r.hosts}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-600 text-slate-600">
                      Utilization
                    </span>
                    <span className="text-xs font-600 text-blue-600">
                      {calculateUtilization(r)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, calculateUtilization(r))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-8">
            <h3 className="font-bold text-slate-900 mb-4">Network Summary</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div>
                <span className="text-green-600 font-bold">✓</span> Total
                Subnets: <b>{rows.length}</b>
              </div>
              <div>
                <span className="text-green-600 font-bold">✓</span> Total Usable
                Hosts: <b>{rows.reduce((sum, r) => sum + r.hosts, 0)}</b>
              </div>
              {rows.length > 1 && (
                <div>
                  <span className="text-green-600 font-bold">✓</span> Addressing
                  Scheme: <b>VLSM</b>
                </div>
              )}
              <div>
                <span className="text-green-600 font-bold">✓</span> IP Version:{" "}
                <b>IPv4</b>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {rows.length === 0 && !err && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">
            Enter values above to calculate subnet information
          </p>
        </div>
      )}
    </div>
  );
}
