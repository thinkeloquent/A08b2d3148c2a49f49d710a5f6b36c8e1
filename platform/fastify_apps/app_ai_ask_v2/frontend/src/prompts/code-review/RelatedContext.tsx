import { JiraIcon, ConfluenceIcon } from "@/shared/brand-icons";

const RelatedContext = () => (
  <div className="px-4 py-3 border-b border-slate-100">
    <h3 className="text-xs font-bold text-slate-700 mb-3">Related Context</h3>
    {[
      { I: JiraIcon, title: "Jira ticket (5 tickets)", sub: "/src/components/reviewList.js" },
      { I: ConfluenceIcon, title: "Confluence documentation", sub: "https://confluence/documentations..." },
    ].map(({ I, title, sub }, idx) => (
      <div key={idx} className="flex items-start gap-2 mb-2">
        <I s={18} />
        <div>
          <p className="text-xs text-slate-700 font-semibold">{title}</p>
          <p className="text-xs text-indigo-500 font-mono truncate">{sub}</p>
        </div>
      </div>
    ))}
  </div>
);

export { RelatedContext };
