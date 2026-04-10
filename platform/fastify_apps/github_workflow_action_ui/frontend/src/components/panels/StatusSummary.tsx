import { useMemo } from "react";
import type { WorkflowJob } from "@/types";
import { Spinner } from "@/components/common";

interface StatusSummaryProps {
  jobs: WorkflowJob[];
  isLoading: boolean;
}

export function StatusSummary({ jobs, isLoading }: StatusSummaryProps) {
  const stats = useMemo(() => {
    const t = jobs.length;
    const p = jobs.filter((j) => j.conclusion === "success").length;
    const f = jobs.filter((j) => j.conclusion === "failure").length;
    const s = jobs.filter((j) => j.conclusion === "skipped").length;
    const o = t - p - f - s;
    return {
      total: t,
      passed: p,
      failed: f,
      skipped: s,
      other: o,
      rate: t > 0 ? Math.round((p / t) * 100) : 0,
    };
  }, [jobs]);

  const cards = [
    {
      l: "Total",
      v: stats.total,
      color: "text-gray-900",
      bg: "bg-gray-50",
      border: "border-gray-200",
    },
    {
      l: "Passed",
      v: stats.passed,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      l: "Failed",
      v: stats.failed,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      l: "Pass Rate",
      v: `${stats.rate}%`,
      color:
        stats.rate >= 100
          ? "text-green-600"
          : stats.rate >= 80
            ? "text-yellow-600"
            : "text-red-600",
      bg:
        stats.rate >= 100
          ? "bg-green-50"
          : stats.rate >= 80
            ? "bg-yellow-50"
            : "bg-red-50",
      border:
        stats.rate >= 100
          ? "border-green-200"
          : stats.rate >= 80
            ? "border-yellow-200"
            : "border-red-200",
    },
  ];

  return (
    <div className="px-6 pt-5 pb-4 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Statuses</h3>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {cards.map((c) => (
              <div
                key={c.l}
                className={`rounded-xl border p-3 ${c.bg} ${c.border}`}
              >
                <p className={`text-lg font-bold ${c.color}`}>{c.v}</p>
                <p className="text-[11px] text-gray-400">{c.l}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {stats.total > 0 && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex mb-1">
              {stats.passed > 0 && (
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(stats.passed / stats.total) * 100}%`,
                  }}
                />
              )}
              {stats.failed > 0 && (
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(stats.failed / stats.total) * 100}%`,
                  }}
                />
              )}
              {stats.skipped + stats.other > 0 && (
                <div
                  className="bg-gray-300"
                  style={{
                    width: `${((stats.skipped + stats.other) / stats.total) * 100}%`,
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
