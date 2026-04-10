import { config } from "@/config";

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Owner
            </label>
            <input
              type="text"
              defaultValue="thinkeloquent"
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Repository
            </label>
            <input
              type="text"
              defaultValue="mta-v800"
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Proxy Base URL
            </label>
            <input
              type="text"
              value={config.githubApiBase}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 font-mono"
            />
            <p className="mt-1 text-xs text-gray-400">
              Read-only — configured by the server
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App API Base URL
            </label>
            <input
              type="text"
              value={config.apiBaseUrl}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
