import { useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import type { RuleGroup, RuleFolder, RuleStructural, RuleItem, RuleCondition } from '../../types/rule.types';
import { operatorsByType, availableFields } from '../../utils/field-config';

interface AsciiTreeViewProps {
  rules: RuleGroup;
}

/** Look up the label for an operator given a dataType + operator value. */
function getOperatorLabel(dataType: string | undefined, operator: string): string {
  const type = dataType || 'string';
  const ops = operatorsByType[type] ?? operatorsByType.string;
  const found = ops.find((o) => o.value === operator);
  return found ? found.label : operator;
}

/** Look up the display label for a field value. */
function getFieldLabel(field: string): string {
  const found = availableFields.find((f) => f.value === field);
  return found ? found.label : field;
}

const NO_VALUE_OPS = ['is_true', 'is_false', 'is_null', 'is_not_null', 'is_today', 'is_yesterday'];

/* ── plain text (for clipboard) ── */

function plainCondition(c: RuleCondition): string {
  const field = getFieldLabel(c.field);
  const op = getOperatorLabel(c.dataType, c.operator);
  const status = c.enabled ? '' : ' (disabled)';
  if (NO_VALUE_OPS.includes(c.operator)) return `${field} ${op}${status}`;
  return `${field} ${op} ${JSON.stringify(c.value)}${status}`;
}

/** Build the inline conditions summary for a group, e.g. "(field op val AND field op val)" */
function plainConditionsSummary(group: RuleGroup): string {
  const conditions = group.conditions.filter((c) => c.type === 'condition') as RuleCondition[];
  if (conditions.length === 0) return '';
  const parts = conditions.map((c) => plainCondition(c));
  const joiner = group.logic ? ` ${group.logic} ` : ', ';
  return ` (${parts.join(joiner)})`;
}

function plainTree(items: RuleItem[], prefix: string): string[] {
  const lines: string[] = [];
  // Sub-groups, folders, and structural nodes become child lines; conditions are inlined on parent
  const containers = items.filter((item) => item.type === 'group' || item.type === 'folder' || item.type === 'structural');
  containers.forEach((item, i) => {
    const isLast = i === containers.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    const status = item.enabled ? '' : ' (disabled)';
    if (item.type === 'folder') {
      const folder = item as RuleFolder;
      lines.push(`${prefix}${connector}[FOLDER] ${folder.name}${status}`);
      lines.push(...plainTree(folder.conditions, childPrefix));
    } else if (item.type === 'structural') {
      const s = item as RuleStructural;
      const vars = s.evaluatedVariables?.length ? ` [${s.evaluatedVariables.join(', ')}]` : '';
      const scope = s.parentScope ? `${s.parentScope} :: ` : '';
      lines.push(`${prefix}${connector}${scope}${s.nodeType || 'scope'}${vars}${status}`);
      lines.push(...plainTree(s.conditions, childPrefix));
    } else {
      const g = item as RuleGroup;
      const summary = plainConditionsSummary(g);
      const logicLabel = g.logic ? ` [${g.logic}]` : '';
      lines.push(`${prefix}${connector}[GROUP] ${g.name}${logicLabel}${status}${summary}`);
      lines.push(...plainTree(g.conditions, childPrefix));
    }
  });
  return lines;
}

function buildPlainText(rules: RuleGroup): string {
  const status = rules.enabled ? '' : ' (disabled)';
  const summary = plainConditionsSummary(rules);
  const logicLabel = rules.logic ? ` [${rules.logic}]` : '';
  const header = `Root: ${rules.name}${logicLabel}${status}${summary}`;
  return [header, ...plainTree(rules.conditions, '')].join('\n');
}

/* ── colorized JSX ── */

const LOGIC_COLOR: Record<string, string> = {
  AND: 'text-blue-600',
  OR: 'text-emerald-600',
  NOT: 'text-red-500',
  XOR: 'text-purple-600',
};

function ColoredCondition({ c }: { c: RuleCondition }) {
  const field = getFieldLabel(c.field);
  const op = getOperatorLabel(c.dataType, c.operator);
  const noValue = NO_VALUE_OPS.includes(c.operator);

  return (
    <>
      <span className="text-cyan-700">{field}</span>
      {' '}
      <span className="text-amber-600">{op}</span>
      {!noValue && (
        <>
          {' '}
          <span className="text-emerald-700">{JSON.stringify(c.value)}</span>
        </>
      )}
      {!c.enabled && <span className="text-slate-400"> (disabled)</span>}
    </>
  );
}

/** Render inline colored conditions summary for a group */
function ColoredConditionsSummary({ group }: { group: RuleGroup }) {
  const conditions = group.conditions.filter((c) => c.type === 'condition') as RuleCondition[];
  if (conditions.length === 0) return null;
  const logicCls = group.logic ? (LOGIC_COLOR[group.logic] || 'text-blue-600') : 'text-slate-400';
  return (
    <>
      <span className="text-slate-400"> (</span>
      {conditions.map((c, i) => (
        <span key={c.id}>
          {i > 0 && <span className={`${logicCls} font-bold`}> {group.logic || ','} </span>}
          <ColoredCondition c={c} />
        </span>
      ))}
      <span className="text-slate-400">)</span>
    </>
  );
}

function coloredTree(items: RuleItem[], prefix: string, keyPrefix: string): ReactNode[] {
  const lines: ReactNode[] = [];
  // Sub-groups, folders, and structural nodes become child lines; conditions are inlined on parent
  const containers = items.filter((item) => item.type === 'group' || item.type === 'folder' || item.type === 'structural');
  containers.forEach((item, i) => {
    const isLast = i === containers.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    const key = `${keyPrefix}-${i}`;

    if (item.type === 'folder') {
      const folder = item as RuleFolder;
      lines.push(
        <div key={key}>
          <span className="text-slate-400">{prefix}{connector}</span>
          <span className="text-indigo-500 font-semibold">[FOLDER]</span>
          {' '}
          <span className="text-slate-700 font-medium">{folder.name}</span>
          {!folder.enabled && <span className="text-slate-400"> (disabled)</span>}
        </div>
      );
      lines.push(...coloredTree(folder.conditions, childPrefix, key));
    } else if (item.type === 'structural') {
      const s = item as RuleStructural;
      const vars = s.evaluatedVariables || [];
      lines.push(
        <div key={key}>
          <span className="text-slate-400">{prefix}{connector}</span>
          {s.parentScope && (
            <>
              <span className="text-violet-600 font-medium">{s.parentScope}</span>
              <span className="text-slate-400"> :: </span>
            </>
          )}
          <span className="text-violet-500 font-semibold">{s.nodeType || 'scope'}</span>
          {vars.length > 0 && (
            <>
              {' '}
              <span className="text-cyan-600">[{vars.join(', ')}]</span>
            </>
          )}
          {!s.enabled && <span className="text-slate-400"> (disabled)</span>}
        </div>
      );
      lines.push(...coloredTree(s.conditions, childPrefix, key));
    } else {
      const g = item as RuleGroup;
      const logicCls = g.logic ? (LOGIC_COLOR[g.logic] || 'text-blue-600') : 'text-slate-400';
      lines.push(
        <div key={key}>
          <span className="text-slate-400">{prefix}{connector}</span>
          <span className="text-slate-500 font-semibold">[GROUP]</span>
          {' '}
          <span className="text-slate-700 font-medium">{g.name}</span>
          {g.logic && (
            <>
              {' '}
              <span className={`font-bold ${logicCls}`}>[{g.logic}]</span>
            </>
          )}
          {!g.enabled && <span className="text-slate-400"> (disabled)</span>}
          <ColoredConditionsSummary group={g} />
        </div>
      );
      lines.push(...coloredTree(g.conditions, childPrefix, key));
    }
  });
  return lines;
}

function ColoredTree({ rules }: { rules: RuleGroup }) {
  const logicCls = rules.logic ? (LOGIC_COLOR[rules.logic] || 'text-blue-600') : 'text-slate-400';
  return (
    <>
      <div>
        <span className="text-slate-500 font-semibold">Root:</span>
        {' '}
        <span className="text-slate-700 font-medium">{rules.name}</span>
        {rules.logic && (
          <>
            {' '}
            <span className={`font-bold ${logicCls}`}>[{rules.logic}]</span>
          </>
        )}
        {!rules.enabled && <span className="text-slate-400"> (disabled)</span>}
        <ColoredConditionsSummary group={rules} />
      </div>
      {coloredTree(rules.conditions, '', 'r')}
    </>
  );
}

/* ── component ── */

export function AsciiTreeView({ rules }: AsciiTreeViewProps) {
  const [copied, setCopied] = useState(false);
  const [scrollMax, setScrollMax] = useState(0);
  const [scrollPos, setScrollPos] = useState(0);
  const skipNextScroll = useRef(false);

  const plainText = useMemo(() => buildPlainText(rules), [rules]);

  // Track page-level horizontal overflow (same approach as the table's HorizontalScrollSlider)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollWidth - window.innerWidth;
      setScrollMax(Math.max(0, max));
      if (!skipNextScroll.current) {
        setScrollPos(window.scrollX);
      }
      skipNextScroll.current = false;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [rules]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [plainText]);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-soft z-10"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy
          </>
        )}
      </button>
      {scrollMax > 0 && (
        <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
          <div className="px-4 py-1.5 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Scroll</span>
            <input
              type="range"
              min={0}
              max={scrollMax}
              value={scrollPos}
              onChange={(e) => {
                const val = Number(e.target.value);
                skipNextScroll.current = true;
                setScrollPos(val);
                window.scrollTo({ left: val });
              }}
              className="w-full h-1.5 rounded-full appearance-none bg-slate-200 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500 [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:hover:bg-accent-600 [&::-webkit-slider-thumb]:cursor-grab
                [&::-webkit-slider-thumb]:active:cursor-grabbing"
            />
          </div>
        </div>
      )}
      <pre className="p-4 pr-24 font-mono text-sm leading-relaxed whitespace-pre">
        <ColoredTree rules={rules} />
      </pre>
    </div>
  );
}
