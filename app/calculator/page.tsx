import { SubnetCalculator } from "@/components/visualizations/SubnetCalculator";

export default function CalculatorPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Subnet Calculator
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Work out CIDR notation, subnet masks, and VLSM allocation — with the
          math shown, not just the answer.
        </p>
      </div>

      {/* Calculator */}
      <SubnetCalculator />
    </div>
  );
}