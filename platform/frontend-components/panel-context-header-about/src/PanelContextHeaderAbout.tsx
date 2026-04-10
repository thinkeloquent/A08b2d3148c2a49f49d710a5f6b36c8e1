import { useState, useEffect, useRef } from 'react';
import type {
  PanelContextHeaderAboutProps,
  BenefitItem,
  StatItem,
  SelectorOption,
} from './types';
import { useCounter } from './useCounter';

// ── Inline SVG icons (defaults — consumers can override via props) ──

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Sub-components ──

function OptionSelector({
  options,
  selected,
  onSelect,
}: {
  options: SelectorOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find((o) => o.id === selected);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        {current?.name}
        <ChevronDownIcon className={['transition-transform duration-200', open ? 'rotate-180' : ''].filter(Boolean).join(' ')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => { onSelect(o.id); setOpen(false); }}
              className={['w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors', selected === o.id ? 'bg-blue-50' : ''].filter(Boolean).join(' ')}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className={['w-1.5 h-1.5 rounded-full', selected === o.id ? 'bg-blue-500' : 'bg-slate-300'].join(' ')} />
                {o.name}
              </span>
              {o.badge && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{o.badge}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBadge({ value, label, suffix = '', active }: StatItem & { active: boolean }) {
  const count = useCounter(value, 900, active);
  return (
    <div className="text-center px-5 py-1">
      <p className="text-lg font-bold text-slate-800 tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function BenefitCard({ icon, title, description, delay }: BenefitItem & { delay: number }) {
  return (
    <div
      className="group flex gap-3.5 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-default animate-fadeSlideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {icon && (
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:from-blue-100 group-hover:to-violet-100 transition-colors">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Main component ──

export function PanelContextHeaderAbout({
  className,
  icon,
  title,
  statusBadge,
  description,
  breadcrumbs,
  selectorOptions,
  selectorValue,
  onSelectorChange,
  stats,
  benefits,
  tags,
  cta,
  sectionLabels,
  accentGradient = 'from-blue-500 via-violet-500 to-blue-400',
  expanded: controlledExpanded,
  onExpandedChange,
  children,
}: PanelContextHeaderAboutProps) {
  // Uncontrolled fallback
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;
  const toggleExpanded = () => {
    const next = !expanded;
    onExpandedChange?.(next);
    if (controlledExpanded === undefined) setInternalExpanded(next);
  };

  // Mount animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const hasExpandedContent = !!(selectorOptions?.length || stats?.length || benefits?.length || tags?.length || cta || children);
  const benefitsLabel = sectionLabels?.benefits ?? 'Key Benefits';
  const tagsLabel = sectionLabels?.tags ?? 'Common Use Cases';
  const benefitsCount = benefits?.length ?? 0;

  return (
    <div className={['panel-context-header-about', className].filter(Boolean).join(' ')}>
      {/* Keyframe injection */}
      <style>{`
        @keyframes pchaFadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideUp {
          animation: pchaFadeSlideUp 0.4s ease-out both;
        }
      `}</style>

      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={['flex items-center gap-1.5 text-xs text-slate-400 mb-5 transition-all duration-500', mounted ? 'opacity-100' : 'opacity-0'].join(' ')}>
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="contents">
              {i > 0 && <span>/</span>}
              {bc.onClick ? (
                <span onClick={bc.onClick} className="hover:text-slate-600 cursor-pointer transition-colors">{bc.label}</span>
              ) : (
                <span className={i === breadcrumbs.length - 1 ? 'text-slate-600 font-medium' : ''}>{bc.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header card */}
      <div className={['rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all duration-700', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'].join(' ')}>
        {/* Accent bar */}
        <div className={['h-1 bg-gradient-to-r', accentGradient].join(' ')} />

        {/* Collapsed state — always visible */}
        <div className="px-8 pt-6 pb-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              {icon && (
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  {icon}
                </div>
              )}
              <div className="min-w-0 pt-0.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                  {statusBadge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {statusBadge}
                    </span>
                  )}
                </div>
                {description && (
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">{description}</p>
                )}
              </div>
            </div>

            {hasExpandedContent && (
              <button
                onClick={toggleExpanded}
                className={[
                  'flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                  expanded
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                {expanded ? 'Less' : 'More details'}
                <ChevronDownIcon className={['transition-transform duration-300', expanded ? 'rotate-180' : ''].filter(Boolean).join(' ')} />
              </button>
            )}
          </div>
        </div>

        {/* Expanded state — progressive disclosure */}
        {hasExpandedContent && (
          <div className={['transition-all duration-500 ease-in-out overflow-hidden', expanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'].join(' ')}>
            <div className="border-t border-slate-100" />
            <div className="px-8 py-6 space-y-6">

              {/* Row 1: Selector + Stats */}
              {(selectorOptions?.length || stats?.length) && (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {selectorOptions && selectorOptions.length > 0 && selectorValue && onSelectorChange && (
                    <OptionSelector options={selectorOptions} selected={selectorValue} onSelect={onSelectorChange} />
                  )}
                  {stats && stats.length > 0 && (
                    <div className="flex items-center divide-x divide-slate-200">
                      {stats.map((s, i) => (
                        <StatBadge key={i} {...s} active={expanded} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Row 2: Benefits */}
              {benefits && benefits.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {sectionLabels?.benefitsIcon}
                    {benefitsLabel}
                  </p>
                  {expanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {benefits.map((b, i) => (
                        <BenefitCard key={i} {...b} delay={i * 70} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Row 3: Tags */}
              {tags && tags.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {sectionLabels?.tagsIcon}
                    {tagsLabel}
                  </p>
                  {expanded && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t, i) => (
                        <span
                          key={i}
                          className={[
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-default hover:shadow-sm transition-all animate-fadeSlideUp',
                            t.colorClass ?? 'bg-slate-50 text-slate-700 border-slate-200',
                          ].join(' ')}
                          style={{ animationDelay: `${(benefitsCount * 70) + (i * 50)}ms` }}
                        >
                          {t.icon ?? <ArrowRightIcon />}
                          {t.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Slot: additional custom content */}
              {children}

              {/* Row 4: CTA */}
              {cta && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-violet-50/80 border border-blue-100/60 animate-fadeSlideUp"
                  style={{ animationDelay: `${(benefitsCount * 70) + ((tags?.length ?? 0) * 50) + 80}ms` }}
                >
                  {cta.icon && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      {cta.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{cta.title}</p>
                    {cta.description && <p className="text-xs text-slate-500">{cta.description}</p>}
                  </div>
                  <CtaButton cta={cta} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CtaButton({ cta }: { cta: NonNullable<PanelContextHeaderAboutProps['cta']> }) {
  const Tag = cta.buttonAs ?? 'button';
  return (
    <Tag
      onClick={cta.onButtonClick}
      className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-colors"
      {...(cta.buttonProps ?? {})}
    >
      {cta.buttonLabel}
      <ArrowRightIcon />
    </Tag>
  );
}
