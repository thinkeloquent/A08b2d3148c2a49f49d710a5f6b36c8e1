import { useState, type ReactNode } from 'react';
import type {
  ProjectLinearVerticalTimelineProps,
  TimelineHeaderProps,
  TimelineItem,
} from './types';

/* ------------------------------------------------------------------ */
/*  Default icons (inline SVGs — no icon library imports)              */
/* ------------------------------------------------------------------ */

const DefaultCheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const DefaultPendingIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const DefaultAddIcon = () => (
  <svg
    className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const DefaultAlertIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500">
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const DefaultTagIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  TimelineCard (internal)                                            */
/* ------------------------------------------------------------------ */

interface TimelineCardProps {
  item: TimelineItem;
  isLast: boolean;
  statusDoneIcon?: ReactNode;
  statusPendingIcon?: ReactNode;
}

function TimelineCard({ item, isLast, statusDoneIcon, statusPendingIcon }: TimelineCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDone = item.status.type === 'done';

  const resolvedStatusIcon =
    item.status.icon ?? (isDone ? (statusDoneIcon ?? <DefaultCheckIcon />) : (statusPendingIcon ?? <DefaultPendingIcon />));

  return (
    <div className="relative flex gap-4">
      {/* Timeline dot + connector */}
      <div className="flex flex-col items-center">
        <div
          className={[
            'w-3 h-3 rounded-full border-2 transition-all duration-300',
            isDone
              ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'bg-white border-slate-300',
            isHovered ? 'scale-125' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-slate-100 min-h-[120px]" />
        )}
      </div>

      {/* Card */}
      <div
        className={[
          'flex-1 mb-6 bg-white rounded-2xl border transition-all duration-300 overflow-hidden',
          isHovered
            ? 'shadow-xl shadow-slate-200/50 border-slate-200 -translate-y-0.5'
            : 'shadow-md shadow-slate-100/50 border-slate-100',
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              {/* Date block */}
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {item.dateLabel}
                </div>
                <div className="text-3xl font-light text-slate-700 -mt-1">{item.dateValue}</div>
              </div>

              {/* Info columns */}
              {item.columns.length > 0 && (
                <div
                  className="grid gap-8"
                  style={{ gridTemplateColumns: `repeat(${item.columns.length}, minmax(0, 1fr))` }}
                >
                  {item.columns.map((col, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                        {col.label}
                      </div>
                      <div className="text-sm font-medium text-slate-700">{col.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status badge */}
            <div
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300',
                isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
                isHovered ? 'scale-105' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {resolvedStatusIcon}
              <span>{item.status.label}</span>
            </div>
          </div>
        </div>

        {/* Banner */}
        {item.banner && (
          <div className="px-5 py-2.5 bg-amber-50/50 border-y border-amber-100/50 flex items-center gap-2">
            {item.banner.icon ?? <DefaultAlertIcon />}
            <span className="text-xs text-amber-700">{item.banner.message}</span>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100">
            <div className="flex flex-wrap gap-3">
              {item.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm"
                >
                  {tag.icon ?? <DefaultTagIcon />}
                  <span className="text-xs text-slate-600">{tag.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TimelineHeader (internal)                                          */
/* ------------------------------------------------------------------ */

function TimelineHeader({ icon, badge, title, subtitle, className }: TimelineHeaderProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 mb-8 overflow-hidden relative',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/20 to-teal-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

      <div className="relative flex items-center gap-4">
        {icon && (
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/25">
            {icon}
          </div>
        )}

        <div className="flex items-center gap-3">
          {badge && (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-lg">
              {badge}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProjectLinearVerticalTimeline (main export)                        */
/* ------------------------------------------------------------------ */

export function ProjectLinearVerticalTimeline({
  items,
  header,
  onAddClick,
  addButtonLabel = 'Add Record',
  addButtonIcon,
  statusDoneIcon,
  statusPendingIcon,
  className,
  children,
}: ProjectLinearVerticalTimelineProps) {
  return (
    <div className={['max-w-3xl mx-auto', className].filter(Boolean).join(' ')}>
      {header && <TimelineHeader {...header} />}

      <div className="pl-2">
        {items.map((item, index) => (
          <TimelineCard
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
            statusDoneIcon={statusDoneIcon}
            statusPendingIcon={statusPendingIcon}
          />
        ))}
      </div>

      {onAddClick && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onAddClick}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-cyan-400 hover:text-cyan-600 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-100/50"
          >
            {addButtonIcon ?? <DefaultAddIcon />}
            <span className="text-sm font-medium">{addButtonLabel}</span>
          </button>
        </div>
      )}

      {children}
    </div>
  );
}
