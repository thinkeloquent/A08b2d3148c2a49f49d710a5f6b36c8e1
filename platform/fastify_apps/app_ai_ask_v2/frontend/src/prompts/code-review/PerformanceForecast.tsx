import { MiniChart } from "@/shared/components";

const PerformanceForecast = () => (
  <div className="px-4 py-3 border-b border-slate-100">
    <h3 className="text-xs font-bold text-slate-700 mb-1">Performance Forecast</h3>
    <p className="text-xs text-slate-400 mb-2">Powered by Statsig</p>
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-xs text-slate-500 mb-1 font-medium">Performance Impact</p>
      <MiniChart />
    </div>
  </div>
);

export { PerformanceForecast };
