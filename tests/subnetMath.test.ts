import { describe, expect, it } from "vitest";
import { cidrInfo, vlsm } from "@/lib/subnetMath";
describe("subnet math",()=>{it("computes cidr details",()=>{const r=cidrInfo("192.168.10.25",24); expect(r.network).toBe("192.168.10.0"); expect(r.broadcast).toBe("192.168.10.255"); expect(r.firstHost).toBe("192.168.10.1"); expect(r.lastHost).toBe("192.168.10.254"); expect(r.mask).toBe("255.255.255.0")}); it("allocates vlsm largest first",()=>{const r=vlsm("192.168.10.0",24,[60,28,12]); expect(r.map(x=>x.cidr)).toEqual(["192.168.10.0/26","192.168.10.64/27","192.168.10.96/28"])})});
