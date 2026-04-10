import { Icon } from "@/shared/icons";

const Toggle = ({ on, onChange }: {on: boolean;onChange: () => void;}) =>
<button
  onClick={onChange}
  className={`relative w-9 h-5 rounded-full transition-colors duration-300 flex-shrink-0 focus:outline-none ${on ? "bg-indigo-500" : "bg-slate-300"}`}>

    <span
    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${on ? "translate-x-4" : "translate-x-0"}`} />

  </button>;


const Tag = ({ label, onRemove }: {label: string;onRemove: () => void;}) =>
<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium">
    {label}
    <button onClick={onRemove} className="text-indigo-400 hover:text-indigo-700 transition-colors">
      {Icon.x}
    </button>
  </span>;


const StatusBadge = ({ status }: {status: string;}) => {
  const map: Record<string, string> = {
    idle: "bg-slate-100 text-slate-500",
    running: "bg-amber-100 text-amber-600",
    passed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-600"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>);

};

const Avatar = ({ initials, color, sm = false }: {initials: string;color: string;sm?: boolean;}) =>
<div
  className={`${sm ? "w-6 h-6 text-xs" : "w-7 h-7 text-xs"} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
  style={{ background: color }}>

    {initials}
  </div>;


const MiniChart = () => {
  const pts: [number, number][] = [[0, 45], [15, 30], [30, 35], [45, 18], [60, 25], [75, 40], [90, 50], [105, 38], [120, 48]];
  const line = "M " + pts.map(([x, y]) => `${x},${y}`).join(" L ");
  const area = line + " L 120,60 L 0,60 Z";
  return (
    <svg viewBox="0 0 120 62" className="w-full h-16" preserveAspectRatio="none" data-test-id="svg-aa0e32ed">
      <defs>
        <linearGradient id="af2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {["0%", "50%", "100%"].map((l, i) =>
      <text key={i} x="1" y={57 - i * 26} fontSize="7" fill="#94a3b8">{l}</text>
      )}
      <path d={area} fill="url(#af2)" />
      <path d={line} stroke="#6366f1" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="120" cy="48" r="3" fill="#6366f1" />
    </svg>);

};

export { Toggle, Tag, StatusBadge, Avatar, MiniChart };