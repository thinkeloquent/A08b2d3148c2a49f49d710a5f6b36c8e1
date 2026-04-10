import { StatusBadge } from "@/shared/components";
import { SauceIcon } from "@/shared/brand-icons";

const TestHarness = () => (
  <div className="px-4 py-3">
    <h3 className="text-xs font-bold text-slate-700 mb-3">Test Harness (SauceLabs)</h3>
    {[
      { label: "Unit Tests", s: "passed" },
      { label: "Integration", s: "running" },
      { label: "E2E Tests", s: "idle" },
    ].map(({ label, s }) => (
      <div key={label} className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <StatusBadge status={s} />
      </div>
    ))}
    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
      <SauceIcon s={16} />
      <span className="text-xs text-slate-400">Status: </span>
      <span className="text-xs text-amber-500 font-semibold">● Running</span>
    </div>
  </div>
);

export { TestHarness };
