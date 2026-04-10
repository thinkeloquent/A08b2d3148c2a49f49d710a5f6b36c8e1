import { useEffect, useRef } from "react";
import type { StepsModalProps, StepStatus, StatusTheme } from "./types";
import { CheckCircleIcon, SpinnerIcon, CircleDotIcon, XCircleIcon, ClockIcon, CloseIcon } from "./icons";

const DEFAULT_STATUS_THEME: Record<StepStatus, StatusTheme> = {
  completed:     { dot: "bg-emerald-500", text: "text-emerald-600", label: "completed" },
  "in-progress": { dot: "bg-amber-400",   text: "text-amber-600",   label: "in progress" },
  pending:       { dot: "bg-slate-300",    text: "text-slate-400",   label: "pending" },
  failed:        { dot: "bg-red-500",      text: "text-red-600",     label: "failed" },
};

function mergeTheme(
  custom?: Partial<Record<StepStatus, Partial<StatusTheme>>>
): Record<StepStatus, StatusTheme> {
  if (!custom) return DEFAULT_STATUS_THEME;
  const merged = { ...DEFAULT_STATUS_THEME };
  for (const key of Object.keys(custom) as StepStatus[]) {
    merged[key] = { ...merged[key], ...custom[key] };
  }
  return merged;
}

const DefaultStepIcon = ({ status, textClass }: { status: StepStatus; textClass: string }) => (
  <span className={textClass}>
    {status === "completed" && <CheckCircleIcon />}
    {status === "in-progress" && <SpinnerIcon />}
    {status === "pending" && <CircleDotIcon />}
    {status === "failed" && <XCircleIcon />}
  </span>
);

export function StepsModal({
  steps,
  open,
  onClose,
  className,
  title = "Execution Steps",
  statusTheme,
  renderStepIcon,
  footer,
}: StepsModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = mergeTheme(statusTheme);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const completed = steps.filter(s => s.status === "completed").length;
  const total = steps.length;

  const panelClass = [
    "bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 backdrop-blur-sm pt-20 px-4">
      <div ref={ref} className={panelClass}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {completed} of {total} steps completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Steps timeline */}
        <div className="px-3 py-3 max-h-[60vh] overflow-y-auto">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const stepTheme = theme[step.status] || theme.pending;
            return (
              <div key={step.id} className="flex items-start gap-3 px-2">
                {/* Timeline column */}
                <div className="flex flex-col items-center pt-1 flex-shrink-0 w-5">
                  {renderStepIcon
                    ? renderStepIcon({ status: step.status })
                    : <DefaultStepIcon status={step.status} textClass={stepTheme.text} />
                  }
                  {!isLast && (
                    <div
                      className={[
                        "w-px flex-1 min-h-[28px] mt-1",
                        step.status === "completed" ? "bg-emerald-200" : "bg-slate-200",
                      ].join(" ")}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "text-sm font-semibold",
                        step.status === "completed"
                          ? "text-slate-800"
                          : step.status === "in-progress"
                          ? "text-amber-700"
                          : "text-slate-400",
                      ].join(" ")}
                    >
                      {step.label}
                    </span>
                    <span
                      className={[
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                        step.status === "completed"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : step.status === "in-progress"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : step.status === "failed"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-slate-50 text-slate-400 border-slate-200",
                      ].join(" ")}
                    >
                      {stepTheme.label}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  )}
                  {step.duration && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
                      <ClockIcon /> {step.duration}
                    </span>
                  )}
                  {step.status === "in-progress" && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden w-full max-w-[200px]">
                        <div
                          className="h-full bg-amber-400 rounded-full animate-pulse"
                          style={{ width: "55%" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {footer !== undefined ? (
          footer && (
            <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-end">
              {footer}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
