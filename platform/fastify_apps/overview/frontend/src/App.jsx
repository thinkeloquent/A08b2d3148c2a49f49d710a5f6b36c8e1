import { useState } from "react";
import {
  LayoutGrid,
  MessageCircle,
  Search,
} from "lucide-react";
import { useApps } from "./hooks/useApps";
import { AppCard } from "./components/AppCard";
import { ChatPanel } from "./components/ChatPanel";

function App() {
  const { apps, loading, error } = useApps();
  const [chatOpen, setChatOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("apps");

  const filtered = apps.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.folder.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between py-4">
              {/* Tabs */}
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("apps")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "apps"
                      ? "bg-slate-800 text-white"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Apps
                </button>
              </nav>

              <div className="flex items-center gap-3">
                {/* Chat toggle */}
                <button
                  onClick={() => setChatOpen((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    chatOpen
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask AI</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        {activeTab === "apps" && (
          <section className="max-w-7xl mx-auto px-6 pt-10 pb-8">
            <div className="mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
                  Explore Our{" "}
                  <span className="text-amber-600">Platform Apps</span>
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  Browse all available applications, view recent updates, and chat with AI to get more details about any tool.
                </p>
              </div>

              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search apps..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Apps Grid */}
            {loading && (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading apps...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-sm text-red-500">Failed to load apps. Is the server running?</p>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-sm text-slate-500">
                  {search ? `No apps matching "${search}"` : "No apps found"}
                </p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Chat Panel */}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Chat overlay backdrop on mobile */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
