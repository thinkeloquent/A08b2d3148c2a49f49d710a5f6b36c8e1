import { useState, useRef, useEffect } from "react";
import { Icon } from "@/shared/icons";
import { Avatar } from "@/shared/components";

interface TeamMember {name: string;role: string;initials: string;color: string;}

const teamMembers: TeamMember[] = [
{ name: "Alex Rivera", role: "Lead Dev", initials: "AR", color: "#6366f1" },
{ name: "Sasha Kim", role: "Security", initials: "SK", color: "#8b5cf6" },
{ name: "Jordan Lee", role: "QA Eng", initials: "JL", color: "#06b6d4" },
{ name: "Morgan Chen", role: "DevOps", initials: "MC", color: "#10b981" },
{ name: "Casey Park", role: "Architect", initials: "CP", color: "#f59e0b" }];


const reviewTypes = ["Performance", "Security", "Style", "Best Practices"];

const ConfigureCodeReview = () => {
  const [reviewType, setReviewType] = useState("Performance");
  const [rtOpen, setRtOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [outPref, setOutPref] = useState("Summary");
  const [submitted, setSubmitted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setRtOpen(false);
        setTeamOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm" ref={dropRef}>
      <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" data-test-id="svg-270bf289">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        Configure Code Review
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Target Files</label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <span className="text-slate-400">{Icon.search}</span>
            <input className="bg-transparent text-xs text-slate-700 outline-none flex-1 placeholder-slate-400" defaultValue="/src/components/ReviewList.js" />
          </div>
        </div>

        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Assign to Team Member</label>
          <button
            onClick={() => {setTeamOpen(!teamOpen);setRtOpen(false);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            {member ?
            <span className="flex items-center gap-2">
                <Avatar initials={member.initials} color={member.color} sm />
                {member.name}
              </span> :

            <span className="text-slate-400">Select member...</span>
            }
            <span className={`text-slate-400 transition-transform ${teamOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {teamOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {teamMembers.map((m) =>
            <button key={m.name} onClick={() => {setMember(m);setTeamOpen(false);}} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50 transition-colors">
                  <Avatar initials={m.initials} color={m.color} sm />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-700">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.role}</p>
                  </div>
                </button>
            )}
            </div>
          }
        </div>

        <div className="relative">
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Review Type</label>
          <button
            onClick={() => {setRtOpen(!rtOpen);setTeamOpen(false);}}
            className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 hover:border-slate-300 transition-colors">

            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {reviewType}
            </span>
            <span className={`text-slate-400 transition-transform ${rtOpen ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
          </button>
          {rtOpen &&
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {reviewTypes.map((t) =>
            <button key={t} onClick={() => {setReviewType(t);setRtOpen(false);}} className={`w-full text-left px-3 py-2 text-xs transition-colors ${t === reviewType ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                  {t}
                </button>
            )}
            </div>
          }
        </div>

        <div>
          <label className="text-xs text-slate-500 font-semibold mb-1.5 block">Output Preference</label>
          <div className="flex gap-3 mt-1.5">
            {["Summary", "Inline Comments", "Diff"].map((opt) =>
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer group">
                <div
                onClick={() => setOutPref(opt)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${outPref === opt ? "border-indigo-500 bg-indigo-500" : "border-slate-300 group-hover:border-slate-400"}`}>

                  {outPref === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={`text-xs ${outPref === opt ? "text-indigo-700 font-semibold" : "text-slate-500"}`}>{opt}</span>
              </label>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => setSubmitted(!submitted)}
        className={`mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all ${submitted ? "bg-emerald-50 text-emerald-700 border border-emerald-300" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200"}`}>

        {submitted ? "Configuration Submitted" : "Submit Configuration"}
      </button>
    </div>);

};

export { ConfigureCodeReview };