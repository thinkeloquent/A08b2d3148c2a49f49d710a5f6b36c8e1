/**
 * Shared UI atoms for the component editor
 * Light theme matching existing app style
 */

import { Plus, Trash2 } from "lucide-react";

/* ── Section Header ─────────────────────────────────────────── */

export function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider">{title}</h3>
      <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

/* ── Field wrapper ──────────────────────────────────────────── */

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {hint && <p className="text-[11px] text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

/* ── Input ──────────────────────────────────────────────────── */

const inputBase =
  "w-full px-3 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-slate-300 transition-all";

export function Input({
  value,
  onChange,
  placeholder,
  mono = false,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputBase} ${mono ? "font-mono text-[12px]" : ""} ${className}`}
    />
  );
}

/* ── Textarea ───────────────────────────────────────────────── */

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputBase} resize-none ${mono ? "font-mono text-[12px]" : ""}`}
    />
  );
}

/* ── Select ─────────────────────────────────────────────────── */

export function Select({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBase} ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

/* ── Toggle ─────────────────────────────────────────────────── */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-8 h-[18px] rounded-full transition-colors relative flex-shrink-0 ${
          checked ? "bg-indigo-500" : "bg-slate-300"
        }`}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all shadow-sm ${
            checked ? "left-[14px]" : "left-[2px]"
          }`}
        />
      </button>
      <span className="text-[12px] text-slate-500 group-hover:text-slate-700">{label}</span>
    </label>
  );
}

/* ── Add Button ─────────────────────────────────────────────── */

export function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[12px] text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-all mt-2 hover:bg-indigo-50"
    >
      <Plus className="w-3 h-3" /> {label}
    </button>
  );
}

/* ── Remove Button ──────────────────────────────────────────── */

export function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

/* ── Card ───────────────────────────────────────────────────── */

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-slate-200 rounded-lg p-4 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/* ── Badge ──────────────────────────────────────────────────── */

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}
      className="text-[10px] font-medium px-2 py-0.5 rounded"
    >
      {label}
    </span>
  );
}
