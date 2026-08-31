import { SubnetCalculator } from "@/components/visualizations/SubnetCalculator";

export default function CalculatorPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-600 text-slate-600 uppercase tracking-wide">
          Tools
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Subnet Calculator
        </h1>
        <p className="mt-2 text-slate-600">
          Calculate CIDR notation, subnet masks, and Variable Length Subnet Mask
          (VLSM) allocation schemes.
        </p>
      </div>

      {/* Calculator */}
      <SubnetCalculator />
    </div>
  );
}
