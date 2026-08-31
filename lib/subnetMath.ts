export type Subnet = { cidr: string; prefix: number; mask: string; network: string; broadcast: string; firstHost: string; lastHost: string; hosts: number; binary: string };
const ipToInt = (ip: string) => ip.split(".").reduce((n, part) => (n << 8) + Number(part), 0) >>> 0;
const intToIp = (n: number) => [24, 16, 8, 0].map(s => (n >>> s) & 255).join(".");
const assertIp = (ip: string) => { const p = ip.split(".").map(Number); if (p.length !== 4 || p.some(x => !Number.isInteger(x) || x < 0 || x > 255)) throw new Error("Invalid IPv4 address"); };
const maskFor = (prefix: number) => prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
export function cidrInfo(ip: string, prefix: number): Subnet {
  assertIp(ip); if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error("Invalid prefix");
  const base = ipToInt(ip), mask = maskFor(prefix), network = (base & mask) >>> 0, size = 2 ** (32 - prefix), broadcast = (network + size - 1) >>> 0;
  const usable = prefix >= 31 ? 0 : Math.max(0, size - 2);
  return { cidr: `${intToIp(network)}/${prefix}`, prefix, mask: intToIp(mask), network: intToIp(network), broadcast: intToIp(broadcast), firstHost: usable ? intToIp(network + 1) : "N/A", lastHost: usable ? intToIp(broadcast - 1) : "N/A", hosts: usable, binary: [24,16,8,0].map(s => ((network >>> s) & 255).toString(2).padStart(8,"0")).join(".") };
}
export function vlsm(ip: string, prefix: number, hostCounts: number[]): Subnet[] {
  const root = cidrInfo(ip, prefix), rootStart = ipToInt(root.network), rootEnd = ipToInt(root.broadcast);
  let cursor = rootStart;
  return [...hostCounts].sort((a,b)=>b-a).map(hosts => {
    if (hosts < 1) throw new Error("Host counts must be positive");
    const bits = Math.ceil(Math.log2(hosts + 2)), p = 32 - bits, block = 2 ** bits;
    const aligned = Math.ceil(cursor / block) * block;
    if (aligned + block - 1 > rootEnd) throw new Error("VLSM requirements exceed parent network");
    cursor = aligned + block;
    return cidrInfo(intToIp(aligned), p);
  });
}
