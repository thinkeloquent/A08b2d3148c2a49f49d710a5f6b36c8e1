import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useAppHealth, useGitHubHealth } from "@/hooks/useHealth";

export function HealthPage() {
  const appHealth = useAppHealth();
  const ghHealth = useGitHubHealth();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Health Status</h1>
        <button
          onClick={() => {
            appHealth.refetch();
            ghHealth.refetch();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {/* App Service Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Application Service
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <div className="flex items-center gap-1.5">
                {appHealth.data?.status === "ok" ? (
                  <CheckCircle2 size={14} className="text-green-500" />
                ) : (
                  <XCircle size={14} className="text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {appHealth.data?.status ?? "unknown"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Version</span>
              <span className="text-sm font-medium">
                {appHealth.data?.version ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Last Check</span>
              <span className="text-sm font-medium">
                {appHealth.data?.timestamp
                  ? new Date(appHealth.data.timestamp).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* GitHub API Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            GitHub API Proxy
          </h2>
          {ghHealth.error ? (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle size={14} />
              <span className="text-sm">
                Unavailable — {(ghHealth.error as Error).message}
              </span>
            </div>
          ) : ghHealth.data ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center gap-1.5">
                  {ghHealth.data.status === "ok" ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <XCircle size={14} className="text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {ghHealth.data.status}
                  </span>
                </div>
              </div>
              {ghHealth.data.rateLimit && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Rate Limit Remaining
                    </span>
                    <span className="text-sm font-medium">
                      {ghHealth.data.rateLimit.remaining} /{" "}
                      {ghHealth.data.rateLimit.limit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        ghHealth.data.rateLimit.remaining /
                          ghHealth.data.rateLimit.limit >
                        0.2
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(ghHealth.data.rateLimit.remaining / ghHealth.data.rateLimit.limit) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Resets At</span>
                    <span className="text-sm font-medium">
                      {new Date(
                        ghHealth.data.rateLimit.reset * 1000,
                      ).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
