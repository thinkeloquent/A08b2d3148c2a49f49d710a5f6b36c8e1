import { CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import { useAppHealth, useGitHubHealth } from "@/hooks/useHealth";

export function DashboardPage() {
  const appHealth = useAppHealth();
  const ghHealth = useGitHubHealth();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* App Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">App Status</h2>
          </div>
          {appHealth.isLoading ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : appHealth.error ? (
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-600">Unavailable</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-sm text-green-600">
                  {appHealth.data?.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                v{appHealth.data?.version}
              </p>
            </div>
          )}
        </div>

        {/* GitHub API Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              GitHub API
            </h2>
          </div>
          {ghHealth.isLoading ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : ghHealth.error ? (
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-600">Unavailable</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-sm text-green-600">
                  {ghHealth.data?.status}
                </span>
              </div>
              {ghHealth.data?.rateLimit && (
                <p className="text-xs text-gray-500">
                  Rate limit: {ghHealth.data.rateLimit.remaining}/
                  {ghHealth.data.rateLimit.limit}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Rate Limit */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Rate Limit</h2>
          </div>
          {ghHealth.data?.rateLimit ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining</span>
                <span className="font-medium text-gray-900">
                  {ghHealth.data.rateLimit.remaining}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Limit</span>
                <span className="font-medium text-gray-900">
                  {ghHealth.data.rateLimit.limit}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${(ghHealth.data.rateLimit.remaining / ghHealth.data.rateLimit.limit) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400">
                Resets:{" "}
                {new Date(
                  ghHealth.data.rateLimit.reset * 1000,
                ).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
