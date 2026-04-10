import { useState, useCallback } from "react";
import type { TaskProgressBarTrackerWidgetProps, StepStatus, StatusTheme } from "./types";
import { InfoIcon, ExternalLinkIcon } from "./icons";
import { StepsModal } from "./StepsModal";

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

export function TaskProgressBarTrackerWidget({
  steps,
  title,
  className,
  detailsIcon,
  detailsLabel = "Details",
  onDetailsClick,
  renderAction,
  actionAs: ActionElement = "a",
  actionProps,
  actionLabel = "Task Manager",
  statusTheme,
  renderStepIcon,
  modalFooter,
  modalTitle,
  children,
}: TaskProgressBarTrackerWidgetProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const theme = mergeTheme(statusTheme);

  const counts = steps.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const total = steps.length;
  const completed = counts.completed || 0;
  const failed = counts.failed || 0;
  const inProgress = counts["in-progress"] || 0;
  const pending = counts.pending || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const seg = (n: number) => `${(n / total) * 100}%`;

  const handleDetailsClick = onDetailsClick || (() => setModalOpen(true));

  const rootClass = [
    "w-full",
    className,
  ].filter(Boolean).join(" ");

  const legendItems = [
    { label: "pending",     count: pending,    key: "pending" as StepStatus },
    { label: "in progress", count: inProgress, key: "in-progress" as StepStatus },
    { label: "completed",   count: completed,  key: "completed" as StepStatus },
    ...(failed > 0 ? [{ label: "failed", count: failed, key: "failed" as StepStatus }] : []),
  ];

  return (
    <>
      <div className={rootClass}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
          {/* Row 1: label left / actions right */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleDetailsClick}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-indigo-50"
                title="View execution steps"
              >
                {detailsIcon || <InfoIcon />}
                <span className="hidden sm:inline">{detailsLabel}</span>
              </button>
              {title && (
                <span className="text-sm font-semibold text-slate-600 truncate">
                  {title}
                </span>
              )}
              <span
                className="text-sm font-bold text-slate-800 tabular-nums whitespace-nowrap"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {completed} / {total} completed
              </span>
            </div>

            <div className="flex items-center gap-3">
              {renderAction ? (
                renderAction()
              ) : (
                <ActionElement
                  {...actionProps}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {actionLabel} <ExternalLinkIcon />
                </ActionElement>
              )}
              <span
                className="text-sm font-bold text-slate-800 tabular-nums"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {percent}%
              </span>
            </div>
          </div>

          {/* Row 2: Progress bar */}
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
            {completed > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-700 ease-out rounded-l-full"
                style={{ width: seg(completed) }}
              />
            )}
            {inProgress > 0 && (
              <div
                className="bg-amber-400 transition-all duration-700 ease-out"
                style={{ width: seg(inProgress) }}
              />
            )}
            {failed > 0 && (
              <div
                className="bg-red-400 transition-all duration-700 ease-out"
                style={{ width: seg(failed) }}
              />
            )}
          </div>

          {/* Row 3: Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            {legendItems.map(item => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium"
              >
                <span className={["w-2 h-2 rounded-full", theme[item.key].dot].join(" ")} />
                {item.label} ({item.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Built-in modal (only when onDetailsClick is not provided) */}
      {!onDetailsClick && (
        <StepsModal
          steps={steps}
          open={modalOpen}
          onClose={closeModal}
          title={modalTitle}
          statusTheme={statusTheme}
          renderStepIcon={renderStepIcon}
          footer={modalFooter}
        />
      )}

      {children}
    </>
  );
}
