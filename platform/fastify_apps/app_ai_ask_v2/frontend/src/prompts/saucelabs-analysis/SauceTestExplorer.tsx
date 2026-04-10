import { useState } from "react";
import { SauceIcon } from "@/shared/brand-icons";
import { Icon } from "@/shared/icons";

interface TestRun {
  name: string;
  status: "passed" | "failed" | "error" | "running";
  duration: string;
  browser?: string;
  device?: string;
}

interface TestSuite {
  name: string;
  framework: string;
  platform: "web" | "mobile";
  runs: TestRun[];
}

interface TestProject {
  name: string;
  suites: TestSuite[];
}

const statusColor: Record<string, string> = {
  passed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  error: "bg-orange-100 text-orange-700",
  running: "bg-blue-100 text-blue-700"
};

const statusDot: Record<string, string> = {
  passed: "bg-emerald-500",
  failed: "bg-red-500",
  error: "bg-orange-500",
  running: "bg-blue-500 animate-pulse"
};

const mockProjects: TestProject[] = [
{
  name: "Platform Web",
  suites: [
  {
    name: "E2E Smoke Tests",
    framework: "Playwright",
    platform: "web",
    runs: [
    { name: "Login flow", status: "passed", duration: "1m 12s", browser: "Chrome 121" },
    { name: "Dashboard render", status: "passed", duration: "0m 48s", browser: "Firefox 122" },
    { name: "Checkout flow", status: "failed", duration: "2m 03s", browser: "Safari 17" }]

  },
  {
    name: "Cross-Browser Visual",
    framework: "Cypress",
    platform: "web",
    runs: [
    { name: "Homepage layout", status: "passed", duration: "0m 32s", browser: "Edge 121" },
    { name: "Settings page", status: "error", duration: "0m 15s", browser: "Chrome 121" }]

  }]

},
{
  name: "Mobile App",
  suites: [
  {
    name: "iOS Regression",
    framework: "XCUITest",
    platform: "mobile",
    runs: [
    { name: "Onboarding", status: "passed", duration: "1m 45s", device: "iPhone 15 Pro" },
    { name: "Push notifications", status: "running", duration: "0m 38s", device: "iPhone 14" },
    { name: "Camera capture", status: "failed", duration: "1m 22s", device: "iPad Air" }]

  },
  {
    name: "Android Smoke",
    framework: "Espresso",
    platform: "mobile",
    runs: [
    { name: "Login biometrics", status: "passed", duration: "0m 55s", device: "Pixel 8" },
    { name: "Deep link routing", status: "passed", duration: "0m 42s", device: "Galaxy S24" }]

  }]

}];


const SauceTestExplorer = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>("Platform Web");
  const [expandedSuite, setExpandedSuite] = useState<string | null>("E2E Smoke Tests");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "web" | "mobile">("all");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <SauceIcon s={18} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Test Suites</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all mb-2">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search tests..." />

        </div>
        <div className="flex gap-1">
          {(["all", "web", "mobile"] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
            filter === f ?
            "bg-red-600 text-white" :
            "bg-slate-50 text-slate-500 hover:bg-slate-100"}`
            }>

              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {mockProjects.map((project) => {
          const filteredSuites = filter === "all" ? project.suites : project.suites.filter((s) => s.platform === filter);
          if (filteredSuites.length === 0) return null;

          return (
            <div key={project.name} className="mb-1">
              <button
                onClick={() => setExpandedProject(expandedProject === project.name ? null : project.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                <span className={`text-slate-400 transition-transform ${expandedProject === project.name ? "rotate-90" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-eef4c052">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
                <SauceIcon s={14} />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{project.name}</p>
                  <p className="text-xs text-slate-400">{filteredSuites.length} suites</p>
                </div>
              </button>

              {expandedProject === project.name &&
              <div className="ml-4">
                  {filteredSuites.map((suite) =>
                <div key={suite.name} className="mb-0.5">
                      <button
                    onClick={() => setExpandedSuite(expandedSuite === suite.name ? null : suite.name)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                        <span className={`text-slate-400 transition-transform ${expandedSuite === suite.name ? "rotate-90" : ""}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-ebd5d3b0">
                            <polyline points="9 6 15 12 9 18" />
                          </svg>
                        </span>
                        <span className="text-slate-400">{Icon.list}</span>
                        <span className="text-xs font-medium text-slate-600 flex-1 text-left truncate">{suite.name}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{suite.framework}</span>
                      </button>

                      {expandedSuite === suite.name &&
                  <div className="ml-5">
                          {suite.runs.map((run) =>
                    <button
                      key={run.name}
                      onClick={() => setSelectedItem(selectedItem === run.name ? null : run.name)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                      selectedItem === run.name ?
                      "bg-red-50 border border-red-200" :
                      "hover:bg-slate-50"}`
                      }>

                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[run.status]}`} />
                              <div className="text-left flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${
                        selectedItem === run.name ? "text-red-700" : "text-slate-700"}`
                        }>
                                  {run.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {run.browser || run.device} &middot; {run.duration}
                                </p>
                              </div>
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${statusColor[run.status]}`}>
                                {run.status}
                              </span>
                            </button>
                    )}
                        </div>
                  }
                    </div>
                )}
                </div>
              }
            </div>);

        })}
      </div>

      {selectedItem &&
      <div className="px-3 py-2.5 border-t border-slate-100 bg-red-50/50">
          <div className="flex items-center gap-2">
            <SauceIcon s={16} />
            <span className="text-xs text-red-700 font-medium flex-1 truncate">{selectedItem}</span>
            <span className="text-xs text-red-600 bg-white border border-red-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { SauceTestExplorer };