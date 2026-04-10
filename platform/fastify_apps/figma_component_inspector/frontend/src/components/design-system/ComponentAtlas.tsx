/**
 * COMPONENT ATLAS
 * ===============
 *
 * Radial visualization of component usage analytics from a Figma file.
 * Dark-themed, data-driven atlas with category nodes, metrics, and drill-down.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as api from '../../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AtlasCategory {
  id: string;
  label: string;
  color: string;
  count: number;
  instances: number;
  health: number;
  components: string[];
}

interface VariantDetail {
  instances: number;
  health: number;
  status: 'compliant' | 'partial' | 'detached';
  tokensCovered: number;
  nodeId: string;
  states: Array<{name: string;props: Record<string, unknown>;instances: number;}>;
  tokens: string[];
  sizes: string[];
  code: string;
}

interface ComponentAtlasData {
  categories: AtlasCategory[];
  variantDetails: Record<string, Record<string, VariantDetail>>;
  totals: {
    activeComponents: number;
    totalInstances: number;
    orphaned: number;
    detached: number;
    designHealth: number;
    totalNodes: number;
    pages: number;
    maxDepth: number;
  };
  governance: {
    tokenCompliance: number;
    namingConvention: number;
    documentation: number;
    devResources: number;
  };
  devResourceLinks: Array<{
    nodeId: string;
    name: string;
    url: string;
    linkType: string;
  }>;
}

interface ComponentAtlasProps {
  fileId: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const COLORS = {
  green: '#16a34a',
  purple: '#7c3aed',
  red: '#dc2626',
  yellow: '#d97706',
  teal: '#0d9488',
  orange: '#ea580c',
  dimText: '#94a3b8',
  mutedText: '#64748b',
  panelBg: '#ffffff',
  cardBg: '#f8fafc',
  borderDim: '#e2e8f0',
  borderActive: 'rgba(124,58,237,0.3)'
} as const;

const STATUS_MAP: Record<string, {label: string;color: string;tooltip: string;description: string;dos: string[];donts: string[];}> = {
  compliant: {
    label: 'COMPLIANT',
    color: COLORS.green,
    tooltip: 'Meets all design system standards',
    description: 'Design Health Score is above 70. This element aligns with the design system.',
    dos: [
    'Continue binding visual properties to design tokens',
    'Keep using descriptive, convention-based naming',
    'Document component purpose and usage guidelines'],

    donts: [
    'Avoid introducing hard-coded values where tokens exist',
    'Avoid renaming to generic labels (e.g. "Frame 1")',
    'Avoid removing token bindings during refactors']

  },
  partial: {
    label: 'PARTIAL',
    color: COLORS.yellow,
    tooltip: 'Mixed use of system tokens and hard-coded values',
    description: 'Design Health Score is between 40 and 70. This element partially follows the design system.',
    dos: [
    'Replace remaining hard-coded values with design tokens',
    'Rename elements to follow naming conventions',
    'Audit which properties are bound vs unbound'],

    donts: [
    'Avoid leaving a mix of tokens and raw values on the same element',
    'Avoid skipping token binding for colors, spacing, or typography',
    'Avoid using auto-generated names without updating them']

  },
  detached: {
    label: 'DETACHED',
    color: COLORS.red,
    tooltip: 'Ignores the design system almost entirely',
    description: 'Design Health Score is below 40. This element has very low alignment with the design system.',
    dos: [
    'Bind visual properties (fills, strokes, spacing) to design tokens',
    'Give the element a meaningful, descriptive name',
    'Review if this element should use an existing component instead'],

    donts: [
    'Avoid leaving all style values hard-coded',
    'Avoid duplicating elements that already exist as components',
    'Avoid ignoring the element — low scores compound across the file']

  }
};

// ── AnimatedNumber ─────────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 800 }: {value: number;duration?: number;}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = display;
    const delta = value - from;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + delta * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// ── Per-gauge guidance ────────────────────────────────────────────────────────

type GaugeKey = 'design' | 'tokens' | 'coverage' | 'docs';

interface GaugeTier {label: string;description: string;dos: string[];donts: string[];}

const GAUGE_GUIDANCE: Record<GaugeKey, {high: GaugeTier;mid: GaugeTier;low: GaugeTier;}> = {
  design: {
    high: {
      label: 'HEALTHY',
      description: 'Overall design health is above 70%. The file has strong alignment with the design system across token usage, naming, and structure.',
      dos: [
      'Continue binding visual properties to design tokens',
      'Keep using descriptive, convention-based naming',
      'Document component purpose and usage guidelines'],

      donts: [
      'Avoid introducing hard-coded values where tokens exist',
      'Avoid renaming to generic labels (e.g. "Frame 1")',
      'Avoid removing token bindings during refactors']

    },
    mid: {
      label: 'NEEDS WORK',
      description: 'Overall design health is between 40–70%. The file partially follows the design system but has gaps in token usage, naming, or documentation.',
      dos: [
      'Audit which categories score lowest and prioritize those',
      'Replace hard-coded values with design tokens',
      'Rename auto-generated element names to meaningful labels'],

      donts: [
      'Avoid leaving a mix of tokens and raw values on the same element',
      'Avoid skipping token binding for colors, spacing, or typography',
      'Avoid adding new elements without following existing conventions']

    },
    low: {
      label: 'AT RISK',
      description: 'Overall design health is below 40%. The file has very low alignment with the design system.',
      dos: [
      'Start by tokenizing the most-used visual properties (fills, spacing)',
      'Give every element a meaningful, descriptive name',
      'Review if elements should use existing components instead'],

      donts: [
      'Avoid leaving all style values hard-coded',
      'Avoid duplicating elements that already exist as components',
      'Avoid ignoring the score — low health compounds across the file']

    }
  },
  tokens: {
    high: {
      label: 'TOKENIZED',
      description: 'Token compliance is above 70%. Most visual properties are bound to design tokens rather than hard-coded.',
      dos: [
      'Keep binding fills, strokes, spacing, and radii to tokens',
      'Use semantic token aliases (e.g. "color-primary") over raw values',
      'Propagate token usage to new elements as they are created'],

      donts: [
      'Avoid overriding token bindings with manual hex/rgb values',
      'Avoid using one-off values when a matching token exists',
      'Avoid detaching instances — this breaks inherited token bindings']

    },
    mid: {
      label: 'PARTIALLY TOKENIZED',
      description: 'Token compliance is between 40–70%. Some properties use tokens, but many still rely on hard-coded values.',
      dos: [
      'Identify the most common hard-coded values and map them to tokens',
      'Prioritize tokenizing fills and typography first',
      'Use Figma\'s "Swap library" to rebind detached styles'],

      donts: [
      'Avoid adding new hard-coded colors alongside existing tokens',
      'Avoid mixing token-bound and raw values on the same component',
      'Avoid ignoring spacing tokens — they are the most impactful']

    },
    low: {
      label: 'HARD-CODED',
      description: 'Token compliance is below 40%. Most visual properties use raw values instead of design tokens.',
      dos: [
      'Create or import a token library (colors, spacing, typography)',
      'Bind fills and strokes to color tokens as a first step',
      'Use variables or styles to replace repeated raw values'],

      donts: [
      'Avoid continuing to add raw hex values to new elements',
      'Avoid duplicating color values — centralize them as tokens',
      'Avoid skipping spacing tokens — inconsistent spacing is highly visible']

    }
  },
  coverage: {
    high: {
      label: 'WELL NAMED',
      description: 'Naming convention score is above 70%. Most elements follow descriptive, structured naming patterns.',
      dos: [
      'Continue using slash-separated names (e.g. "Button/Primary/Large")',
      'Keep names descriptive of purpose, not appearance',
      'Apply consistent naming across variants and states'],

      donts: [
      'Avoid reverting to auto-generated names (e.g. "Frame 42")',
      'Avoid inconsistent casing or delimiters across components',
      'Avoid names that describe color/size instead of function']

    },
    mid: {
      label: 'MIXED NAMING',
      description: 'Naming convention score is between 40–70%. Some elements have meaningful names, but many still use auto-generated or generic labels.',
      dos: [
      'Rename auto-generated "Frame N" / "Group N" labels',
      'Adopt slash-separated naming for component hierarchy',
      'Group related elements under consistent prefixes'],

      donts: [
      'Avoid leaving default names on published components',
      'Avoid mixing naming conventions (camelCase + slash + spaces)',
      'Avoid overly long names — keep them concise but descriptive']

    },
    low: {
      label: 'UNNAMED',
      description: 'Naming convention score is below 40%. Most elements use auto-generated or generic names.',
      dos: [
      'Start renaming the most-used elements and components first',
      'Use a consistent pattern: "Category/Type/Variant"',
      'Name layers by their purpose (e.g. "nav-link" not "Text 3")'],

      donts: [
      'Avoid publishing components with default names',
      'Avoid using numbers as the sole differentiator',
      'Avoid ignoring naming — it directly impacts search and reuse']

    }
  },
  docs: {
    high: {
      label: 'DOCUMENTED',
      description: 'Documentation score is above 70%. Most components have descriptions explaining their purpose and usage.',
      dos: [
      'Keep descriptions up to date when components change',
      'Include usage guidelines and accepted variants',
      'Add links to Storybook or code repositories in descriptions'],

      donts: [
      'Avoid removing descriptions during component refactors',
      'Avoid vague descriptions like "button component"',
      'Avoid documenting visual appearance — focus on when to use it']

    },
    mid: {
      label: 'PARTIALLY DOCUMENTED',
      description: 'Documentation score is between 40–70%. Some components have descriptions, but many are undocumented.',
      dos: [
      'Add descriptions to the most-used components first',
      'Include a one-line purpose statement at minimum',
      'Document any non-obvious variant or state behavior'],

      donts: [
      'Avoid publishing new components without a description',
      'Avoid copy-pasting the same generic description everywhere',
      'Avoid treating documentation as optional — it enables adoption']

    },
    low: {
      label: 'UNDOCUMENTED',
      description: 'Documentation score is below 40%. Most components lack descriptions.',
      dos: [
      'Start by documenting published/shared components',
      'Write a short "what this is and when to use it" for each',
      'Set a team standard: no publish without a description'],

      donts: [
      'Avoid leaving all component descriptions blank',
      'Avoid assuming component names are self-documenting',
      'Avoid deferring documentation — it becomes harder over time']

    }
  }
};

function getGaugeGuidance(gaugeKey: GaugeKey, value: number): GaugeTier {
  const tiers = GAUGE_GUIDANCE[gaugeKey];
  if (value >= 70) return tiers.high;
  if (value >= 40) return tiers.mid;
  return tiers.low;
}

// ── HealthScoreModal ──────────────────────────────────────────────────────────

function HealthScoreModal({
  value,
  label,
  gaugeKey,
  onClose





}: {value: number;label: string;gaugeKey: GaugeKey;onClose: () => void;}) {
  const guidance = getGaugeGuidance(gaugeKey, value);
  const color = value >= 80 ? COLORS.green : value >= 50 ? COLORS.yellow : COLORS.red;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {if (e.key === 'Escape') onClose();};
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}>

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200/80 w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }} />

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {label} — {Math.round(value)}%
              </h3>
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color }}>

                {guidance.label}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" data-test-id="svg-80b61263">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <div className="px-5 pt-4 pb-3">
          <p className="text-xs text-gray-500 leading-relaxed">{guidance.description}</p>
        </div>

        {/* Do's and Don'ts */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          <div className="rounded-lg border border-green-200/80 bg-green-50/50 p-3">
            <div className="text-[10px] uppercase tracking-wider font-bold text-green-700 mb-2 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-test-id="svg-3b1cf94a">
                <path d="M2.5 6.5L5 9L9.5 3.5" />
              </svg>
              Do
            </div>
            <ul className="space-y-1.5">
              {guidance.dos.map((item, i) =>
              <li key={i} className="text-[11px] text-green-800 leading-snug flex gap-1.5">
                  <span className="text-green-500 shrink-0 mt-0.5">{'\u2022'}</span>
                  <span>{item}</span>
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-red-200/80 bg-red-50/50 p-3">
            <div className="text-[10px] uppercase tracking-wider font-bold text-red-700 mb-2 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" data-test-id="svg-fd46d145">
                <line x1="3" y1="3" x2="9" y2="9" /><line x1="9" y1="3" x2="3" y2="9" />
              </svg>
              Don't
            </div>
            <ul className="space-y-1.5">
              {guidance.donts.map((item, i) =>
              <li key={i} className="text-[11px] text-red-800 leading-snug flex gap-1.5">
                  <span className="text-red-400 shrink-0 mt-0.5">{'\u2022'}</span>
                  <span>{item}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>);

}

// ── HealthGauge ────────────────────────────────────────────────────────────────

function HealthGauge({ value, label, gaugeKey = 'design', size = 48 }: {value: number;label: string;gaugeKey?: GaugeKey;size?: number;}) {
  const [modalOpen, setModalOpen] = useState(false);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, value / 100)));
  const color = value >= 80 ? COLORS.green : value >= 50 ? COLORS.yellow : COLORS.red;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex flex-col items-center gap-1 cursor-pointer group"
        title={`Click for ${label} health details`}>

        <svg width={size} height={size} className="transform -rotate-90 group-hover:scale-110 transition-transform" data-test-id="svg-810324f7">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={3} />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />

        </svg>
        <span className="text-[9px] tracking-wider uppercase" style={{ color: COLORS.dimText }}>
          {label}
        </span>
        <span className="text-[10px] font-bold" style={{ color }}>
          {Math.round(value)}%
        </span>
      </button>
      {modalOpen &&
      <HealthScoreModal
        value={value}
        label={label}
        gaugeKey={gaugeKey}
        onClose={() => setModalOpen(false)} />

      }
    </>);

}

// ── MetricCard ─────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  color,
  blink,
  active,
  onClick







}: {label: string;value: number;color: string;blink?: boolean;active: boolean;onClick: () => void;}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg p-2.5 text-left transition-all duration-200 border bg-white shadow-sm"
      style={{
        borderColor: active ? `${color}55` : COLORS.borderDim,
        borderLeftWidth: 3,
        borderLeftColor: color
      }}>

      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[9px] uppercase tracking-widest font-medium"
          style={{ color: COLORS.dimText }}>

          {label}
        </span>
        {blink &&
        <span
          className="atlas-blink inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: color }} />

        }
      </div>
      <div className="text-lg font-bold font-mono" style={{ color }}>
        <AnimatedNumber value={value} />
      </div>
    </button>);

}

// ── ScoringModal ──────────────────────────────────────────────────────────────

function ScoringModal({ status, onClose }: {status: string;onClose: () => void;}) {
  const config = STATUS_MAP[status] || STATUS_MAP.compliant;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>

      <div
        className="rounded-xl p-5 max-w-sm w-full mx-4 border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-4">
          <span
            className="rounded px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
            style={{
              color: config.color,
              background: `${config.color}12`,
              border: `1px solid ${config.color}25`
            }}>

            {config.label}
          </span>
          <button
            onClick={onClose}
            className="text-[10px] px-2 py-1 rounded transition-colors text-slate-400 hover:text-slate-600">

            ESC
          </button>
        </div>

        <p className="text-[11px] leading-relaxed mb-4 text-slate-500">
          {config.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] font-medium mb-1.5" style={{ color: COLORS.green }}>
              Do
            </div>
            <ul className="space-y-1">
              {config.dos.map((item) =>
              <li key={item} className="text-[10px] leading-relaxed flex gap-1.5 text-slate-500">
                  <span style={{ color: COLORS.green }}>+</span>
                  {item}
                </li>
              )}
            </ul>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] font-medium mb-1.5" style={{ color: COLORS.red }}>
              Don&apos;t
            </div>
            <ul className="space-y-1">
              {config.donts.map((item) =>
              <li key={item} className="text-[10px] leading-relaxed flex gap-1.5 text-slate-500">
                  <span style={{ color: COLORS.red }}>&minus;</span>
                  {item}
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>);

}

// ── StatusBadge ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: {status: string;}) {
  const [showModal, setShowModal] = useState(false);
  const config = STATUS_MAP[status] || STATUS_MAP.compliant;

  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e: KeyboardEvent) => {if (e.key === 'Escape') setShowModal(false);};
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showModal]);

  return (
    <>
      <span
        className="inline-block rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase cursor-pointer transition-opacity hover:opacity-80"
        style={{
          color: config.color,
          background: `${config.color}10`,
          border: `1px solid ${config.color}20`
        }}
        title={config.tooltip}
        onClick={(e) => {e.stopPropagation();setShowModal(true);}}>

        {config.label}
      </span>
      {showModal && <ScoringModal status={status} onClose={() => setShowModal(false)} />}
    </>);

}

// ── RadialAtlas ────────────────────────────────────────────────────────────────

interface RadialAtlasProps {
  categories: AtlasCategory[];
  activeCategory: string | null;
  totalNodes: number;
  onSelectCategory: (id: string | null) => void;
}

function RadialAtlas({ categories, activeCategory, totalNodes, onSelectCategory }: RadialAtlasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [particles, setParticles] = useState<
    Array<{id: number;cx: number;cy: number;r: number;opacity: number;color: string;}>>(
    []);
  const [rotationAngle, setRotationAngle] = useState(0);
  const animFrameRef = useRef<number>(0);

  const cx = 300;
  const cy = 300;
  const categoryRadius = 200;
  const childRadius = 265;

  const categoryPositions = useMemo(() => {
    return categories.map((cat, i) => {
      const angle = 2 * Math.PI * i / categories.length - Math.PI / 2;
      return {
        ...cat,
        x: cx + categoryRadius * Math.cos(angle),
        y: cy + categoryRadius * Math.sin(angle),
        angle
      };
    });
  }, [categories]);

  // Rotating hub ring animation
  useEffect(() => {
    let running = true;
    let last = performance.now();

    function animate(now: number) {
      if (!running) return;
      const dt = now - last;
      last = now;
      setRotationAngle((prev) => (prev + dt * 0.02) % 360);
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Floating particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const now = Date.now();
        const alive = prev.filter((p) => p.opacity > 0.05).map((p) => ({
          ...p,
          cy: p.cy - 0.3,
          opacity: p.opacity * 0.97
        }));
        if (alive.length < 20 && Math.random() > 0.5) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 100 + Math.random() * 160;
          alive.push({
            id: now + Math.random(),
            cx: cx + dist * Math.cos(angle),
            cy: cy + dist * Math.sin(angle),
            r: 1 + Math.random() * 1.5,
            opacity: 0.15 + Math.random() * 0.15,
            color: categories.length > 0 ?
            categories[Math.floor(Math.random() * categories.length)].color :
            COLORS.purple
          });
        }
        return alive;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [categories]);

  const handleCenterClick = useCallback(() => {
    onSelectCategory(null);
  }, [onSelectCategory]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      className="w-full h-full"
      style={{ maxHeight: '100%' }} data-test-id="svg-3d4527bb">

      <defs>
        {/* Soft shadow filter for nodes */}
        <filter id="atlas-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#64748b" floodOpacity="0.15" />
        </filter>
        <filter id="atlas-glow-strong" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#64748b" floodOpacity="0.2" />
        </filter>
        {/* Category gradients — lighter fills for light theme */}
        {categoryPositions.map((cat) =>
        <radialGradient key={`grad-${cat.id}`} id={`grad-${cat.id}`}>
            <stop offset="0%" stopColor={cat.color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={cat.color} stopOpacity={0.06} />
          </radialGradient>
        )}
      </defs>

      {/* Background grid */}
      <circle cx={cx} cy={cy} r={280} fill="none" stroke="#e2e8f0" strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={200} fill="none" stroke="#cbd5e1" strokeWidth={0.5} strokeDasharray="4 4" />
      <circle cx={cx} cy={cy} r={120} fill="none" stroke="#e2e8f0" strokeWidth={0.5} />

      {/* Floating particles */}
      {particles.map((p) =>
      <circle
        key={p.id}
        cx={p.cx}
        cy={p.cy}
        r={p.r}
        fill={p.color}
        opacity={p.opacity} />

      )}

      {/* Connection lines */}
      {categoryPositions.map((cat) => {
        const isActive = activeCategory === null || activeCategory === cat.id;
        return (
          <line
            key={`line-${cat.id}`}
            x1={cx}
            y1={cy}
            x2={cat.x}
            y2={cat.y}
            stroke={isActive ? cat.color : '#cbd5e1'}
            strokeWidth={isActive ? 1.5 : 0.8}
            strokeDasharray={activeCategory === cat.id ? 'none' : '4 3'}
            opacity={isActive ? 0.5 : 0.3}
            style={{ transition: 'all 0.4s ease' }} />);


      })}

      {/* Child component nodes */}
      {categoryPositions.map((cat) => {
        const isActive = activeCategory === null || activeCategory === cat.id;
        if (!isActive) return null;
        const childCount = Math.min(cat.components.length, 6);
        const spread = Math.PI * 0.3;
        return cat.components.slice(0, childCount).map((comp, ci) => {
          const childAngle = cat.angle - spread / 2 + spread / Math.max(childCount - 1, 1) * ci;
          const childX = cx + childRadius * Math.cos(childAngle);
          const childY = cy + childRadius * Math.sin(childAngle);
          return (
            <g key={`child-${cat.id}-${ci}`} opacity={0.6}>
              <line
                x1={cat.x}
                y1={cat.y}
                x2={childX}
                y2={childY}
                stroke={cat.color}
                strokeWidth={0.5}
                opacity={0.3} />

              <circle cx={childX} cy={childY} r={4} fill={cat.color} opacity={0.5} />
              <text
                x={childX}
                y={childY + 12}
                textAnchor="middle"
                fill="#64748b"
                fontSize={7}
                fontFamily="Inter, system-ui, sans-serif">

                {comp.length > 12 ? comp.slice(0, 11) + '\u2026' : comp}
              </text>
            </g>);

        });
      })}

      {/* Category nodes */}
      {categoryPositions.map((cat) => {
        const isSelected = activeCategory === cat.id;
        const isDimmed = activeCategory !== null && !isSelected;
        const nodeRadius = 28;

        // Health ring
        const healthCirc = 2 * Math.PI * (nodeRadius + 4);
        const healthOffset = healthCirc * (1 - cat.health / 100);

        return (
          <g
            key={`node-${cat.id}`}
            onClick={() => onSelectCategory(isSelected ? null : cat.id)}
            style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
            opacity={isDimmed ? 0.25 : 1}
            filter={isSelected ? 'url(#atlas-glow)' : undefined}>

            {/* Health ring */}
            <circle
              cx={cat.x}
              cy={cat.y}
              r={nodeRadius + 4}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={2} />

            <circle
              cx={cat.x}
              cy={cat.y}
              r={nodeRadius + 4}
              fill="none"
              stroke={cat.color}
              strokeWidth={2}
              strokeDasharray={healthCirc}
              strokeDashoffset={healthOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cat.x} ${cat.y})`}
              opacity={0.7}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }} />

            {/* Main circle */}
            <circle
              cx={cat.x}
              cy={cat.y}
              r={nodeRadius}
              fill={`url(#grad-${cat.id})`}
              stroke={isSelected ? cat.color : '#cbd5e1'}
              strokeWidth={isSelected ? 2 : 1} />

            {/* Label */}
            <text
              x={cat.x}
              y={cat.y - 4}
              textAnchor="middle"
              fill="#1e293b"
              fontSize={8}
              fontWeight="bold"
              fontFamily="Inter, system-ui, sans-serif">

              {cat.label.length > 10 ? cat.label.slice(0, 9) + '\u2026' : cat.label}
            </text>
            {/* Count */}
            <text
              x={cat.x}
              y={cat.y + 9}
              textAnchor="middle"
              fill="#475569"
              fontSize={10}
              fontWeight="bold"
              fontFamily="Inter, system-ui, sans-serif">

              {cat.count}
            </text>
          </g>);

      })}

      {/* Center hub */}
      <g onClick={handleCenterClick} style={{ cursor: 'pointer' }}>
        {/* Animated rotating ring */}
        <circle
          cx={cx}
          cy={cy}
          r={52}
          fill="none"
          stroke={COLORS.purple}
          strokeWidth={1}
          strokeDasharray="8 6"
          opacity={0.25}
          transform={`rotate(${rotationAngle} ${cx} ${cy})`} />

        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={46}
          fill="white"
          stroke={COLORS.purple}
          strokeWidth={1.5}
          opacity={0.9} />

        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={40}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={0.5} />

        {/* Icon */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill={COLORS.purple}
          fontSize={14}>

          {'\u25C8'}
        </text>
        {/* Title */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          fill="#475569"
          fontSize={7}
          fontWeight="bold"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing={1.5}>

          COMPONENT ATLAS
        </text>
        {/* Active count */}
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill={COLORS.purple}
          fontSize={13}
          fontWeight="bold"
          fontFamily="Inter, system-ui, sans-serif">

          {totalNodes.toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 23}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={5}
          fontFamily="Inter, system-ui, sans-serif">

          nodes
        </text>
      </g>
    </svg>);

}

// ── VariantDrillDown ───────────────────────────────────────────────────────────

interface VariantDrillDownProps {
  variantName: string;
  detail: VariantDetail;
  categoryColor: string;
  onBack: () => void;
}

function VariantDrillDown({ variantName, detail, categoryColor, onBack }: VariantDrillDownProps) {
  const [activeTab, setActiveTab] = useState<'states' | 'tokens' | 'code'>('states');
  const [expandedState, setExpandedState] = useState<string | null>(null);

  const tabs = [
  { key: 'states' as const, label: 'Styles' },
  { key: 'tokens' as const, label: 'Tokens' },
  { key: 'code' as const, label: 'Code' }];


  return (
    <div className="atlas-slideIn flex flex-col h-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase mb-3 text-slate-400 hover:text-slate-600 transition-colors">

        <span>{'\u2190'}</span>
        <span>Back to elements</span>
      </button>

      {/* Header card */}
      <div
        className="rounded-lg p-3 mb-3 border bg-white shadow-sm"
        style={{
          borderColor: `${categoryColor}20`,
          borderLeftWidth: 3,
          borderLeftColor: categoryColor
        }}>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold font-mono text-slate-800 truncate mr-2">
            {variantName}
          </span>
          <StatusBadge status={detail.status} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[9px] uppercase text-slate-400">Inst</div>
            <div className="text-sm font-bold font-mono" style={{ color: COLORS.purple }}>
              {detail.instances}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase text-slate-400">Health</div>
            <div
              className="text-sm font-bold font-mono"
              style={{ color: detail.health >= 80 ? COLORS.green : detail.health >= 50 ? COLORS.yellow : COLORS.red }}>

              {detail.health}%
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase text-slate-400">Tokens</div>
            <div className="text-sm font-bold font-mono" style={{ color: COLORS.teal }}>
              {detail.tokensCovered}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 border-b border-slate-200">
        {tabs.map((tab) =>
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className="px-2 py-1.5 text-[9px] uppercase tracking-wider font-medium transition-colors"
          style={{
            color: activeTab === tab.key ? COLORS.purple : '#94a3b8',
            borderBottom: activeTab === tab.key ? `2px solid ${COLORS.purple}` : '2px solid transparent'
          }}>

            {tab.label}
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'states' &&
        <div className="space-y-1.5">
            {detail.states.length === 0 ?
          <div className="text-[10px] py-4 text-center text-slate-400">
                No style properties detected
              </div> :

          detail.states.map((state) =>
          <div key={state.name}>
                  <button
              onClick={() => setExpandedState(expandedState === state.name ? null : state.name)}
              className="w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors border"
              style={{
                background: expandedState === state.name ? `${COLORS.purple}08` : 'transparent',
                borderColor: expandedState === state.name ? `${COLORS.purple}20` : 'transparent'
              }}>

                    <span className="text-[10px] font-mono text-slate-700 truncate">
                      <span className="text-slate-400">{'\u203A'} </span>
                      {state.name}
                    </span>
                    <span className="text-[9px] font-mono ml-2 flex-shrink-0" style={{ color: COLORS.purple }}>
                      {state.instances}x
                    </span>
                  </button>
                  {expandedState === state.name && Object.keys(state.props).length > 0 &&
            <div className="ml-4 mt-1 mb-2 space-y-0.5">
                      {Object.entries(state.props).map(([key, val]) =>
              <div key={key} className="flex items-center gap-2 text-[9px] font-mono">
                          <span className="text-slate-400">{key}:</span>
                          <span style={{ color: COLORS.teal }}>{String(val)}</span>
                        </div>
              )}
                    </div>
            }
                </div>
          )
          }
          </div>
        }

        {activeTab === 'tokens' &&
        <div className="space-y-1.5">
            {detail.tokens.length === 0 ?
          <div className="text-[10px] py-4 text-center text-slate-400">
                No tokens bound
              </div> :

          detail.tokens.map((token) => {
            const isColor = token.toLowerCase().includes('color') || token.toLowerCase().includes('fill');
            return (
              <div
                key={token}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-slate-50">

                    <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{
                    background: isColor ? COLORS.teal : COLORS.purple,
                    opacity: 0.5
                  }} />

                    <span className="text-[10px] font-mono text-slate-700 truncate">{token}</span>
                  </div>);

          })
          }
          </div>
        }

        {activeTab === 'code' &&
        <div>
            {detail.code ?
          <div className="rounded-lg p-3 overflow-x-auto border border-slate-200 bg-slate-50">
                <pre className="text-[10px] font-mono leading-relaxed text-slate-700">
                  <code>{detail.code}</code>
                </pre>
              </div> :

          <div className="text-[10px] py-4 text-center text-slate-400">
                No code mapping available
              </div>
          }
            {detail.nodeId &&
          <div className="mt-2 text-[9px] font-mono text-slate-400">
                Node: {detail.nodeId}
              </div>
          }
            {detail.sizes.length > 0 &&
          <div className="mt-2 flex flex-wrap gap-1">
                {detail.sizes.map((size) =>
            <span
              key={size}
              className="rounded px-1.5 py-0.5 text-[8px] font-mono"
              style={{
                background: `${COLORS.purple}08`,
                color: COLORS.purple,
                border: `1px solid ${COLORS.purple}18`
              }}>

                    {size}
                  </span>
            )}
              </div>
          }
          </div>
        }
      </div>
    </div>);

}

// ── DetailPanel ────────────────────────────────────────────────────────────────

interface DetailPanelProps {
  categories: AtlasCategory[];
  activeCategory: string | null;
  selectedVariant: string | null;
  variantDetails: Record<string, Record<string, VariantDetail>>;
  activeFilter: string | null;
  onSelectVariant: (name: string | null) => void;
}

function DetailPanel({
  categories,
  activeCategory,
  selectedVariant,
  variantDetails,
  activeFilter,
  onSelectVariant
}: DetailPanelProps) {
  const category = useMemo(
    () => categories.find((c) => c.id === activeCategory) || null,
    [categories, activeCategory]
  );

  const variants = useMemo(() => {
    if (!activeCategory || !variantDetails[activeCategory]) return {};
    const raw = variantDetails[activeCategory];
    if (!activeFilter) return raw;

    // Filter variants based on active metric filter
    const filtered: Record<string, VariantDetail> = {};
    for (const [name, detail] of Object.entries(raw)) {
      switch (activeFilter) {
        case 'active':
          if (detail.status === 'compliant' || detail.status === 'partial') filtered[name] = detail;
          break;
        case 'instances':
          if (detail.instances > 0) filtered[name] = detail;
          break;
        case 'orphaned':
          if (detail.instances === 0) filtered[name] = detail;
          break;
        case 'detached':
          if (detail.status === 'detached') filtered[name] = detail;
          break;
        default:
          filtered[name] = detail;
      }
    }
    return filtered;
  }, [activeCategory, variantDetails, activeFilter]);

  // Drill-down view
  if (selectedVariant && activeCategory && variants[selectedVariant]) {
    return (
      <VariantDrillDown
        variantName={selectedVariant}
        detail={variants[selectedVariant]}
        categoryColor={category?.color || COLORS.purple}
        onBack={() => onSelectVariant(null)} />);


  }

  // No selection
  if (!activeCategory || !category) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="text-2xl mb-3 text-slate-300">{'\u2B21'}</div>
        <div className="text-[10px] leading-relaxed text-slate-400">
          Select a node type to explore elements
        </div>
      </div>);

  }

  const variantEntries = Object.entries(variants);

  return (
    <div className="atlas-fadeIn flex flex-col h-full">
      {/* Category header */}
      <div
        className="rounded-lg p-3 mb-3 border bg-white shadow-sm"
        style={{
          borderColor: '#e2e8f0',
          borderLeftWidth: 3,
          borderLeftColor: category.color
        }}>

        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: category.color }} />

          <span className="text-xs font-bold font-mono text-slate-800 truncate">
            {category.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              Nodes
            </div>
            <div className="text-base font-bold font-mono" style={{ color: category.color }}>
              {category.count.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              Unique Names
            </div>
            <div className="text-base font-bold font-mono" style={{ color: COLORS.purple }}>
              {category.components.length}
            </div>
          </div>
        </div>
        {/* Health bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">
              Health
            </span>
            <span
              className="text-[9px] font-mono font-bold"
              style={{
                color: category.health >= 80 ? COLORS.green : category.health >= 50 ? COLORS.yellow : COLORS.red
              }}>

              {category.health}%
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${category.health}%`,
                background: category.health >= 80 ? COLORS.green : category.health >= 50 ? COLORS.yellow : COLORS.red
              }} />

          </div>
        </div>
      </div>

      {/* Variant list */}
      <div className="text-[9px] uppercase tracking-wider mb-2 font-medium text-slate-400">
        Elements ({variantEntries.length})
        {activeFilter &&
        <span className="ml-1" style={{ color: COLORS.purple }}>
            {'\u00B7'} filtered
          </span>
        }
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {variantEntries.length === 0 ?
        <div className="text-[10px] py-4 text-center text-slate-400">
            No variants match the current filter
          </div> :

        variantEntries.map(([name, detail]) =>
        <button
          key={name}
          onClick={() => onSelectVariant(name)}
          className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left transition-all border border-slate-200/80 bg-white shadow-sm hover:border-slate-300">

              <div className="flex-1 min-w-0 mr-2">
                <div className="text-[10px] font-mono text-slate-700 truncate">{name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] font-mono" style={{ color: COLORS.purple }}>
                    {detail.instances}x
                  </span>
                  <StatusBadge status={detail.status} />
                </div>
              </div>
              <span className="text-[10px] flex-shrink-0 text-slate-300">
                {'\u203A'}
              </span>
            </button>
        )
        }
      </div>
    </div>);

}

// ── ComponentAtlas (main) ──────────────────────────────────────────────────────

export default function ComponentAtlas({ fileId }: ComponentAtlasProps) {
  const [data, setData] = useState<ComponentAtlasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'atlas' | 'governance'>('atlas');

  const fetchData = useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    setError(null);
    try {
      const response = (await api.getComponentAtlas(fileId)) as ComponentAtlasData;
      setData(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load component atlas data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset drill-down when category changes
  useEffect(() => {
    setSelectedVariant(null);
  }, [activeCategory]);

  const handleFilterToggle = useCallback((filter: string) => {
    setActiveFilter((prev) => prev === filter ? null : filter);
  }, []);

  const handleSelectCategory = useCallback((id: string | null) => {
    setActiveCategory(id);
  }, []);

  const topTabs = [
  { key: 'atlas' as const, label: 'Element Atlas' },
  { key: 'governance' as const, label: 'Design Compliance' }];


  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="atlas-spin w-10 h-10 rounded-full border-2 border-slate-200" style={{ borderTopColor: COLORS.purple, borderRightColor: COLORS.purple }} />
          <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400">
            Analyzing file structure...
          </span>
        </div>
      </div>);

  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center px-8">
          <span className="text-2xl">{'\u26A0'}</span>
          <span className="text-xs text-red-600">{error}</span>
          <button
            onClick={fetchData}
            className="mt-2 px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors border border-slate-200 bg-white shadow-sm text-slate-600 hover:border-slate-300">

            Retry
          </button>
        </div>
      </div>);

  }

  // ── Empty ──
  if (!data || data.categories.length === 0 && (!data.totals || data.totals.totalNodes === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center px-8">
          <span className="text-2xl text-slate-300">{'\u25C8'}</span>
          <span className="text-xs text-slate-400">
            No nodes found in this file
          </span>
        </div>
      </div>);

  }

  const { totals, governance, categories, variantDetails, devResourceLinks } = data;
  const selectedCat = categories.find((c) => c.id === activeCategory);

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col border border-slate-200/80 bg-white shadow-sm"
      style={{
        minHeight: 520
      }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-1">
          {topTabs.map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider transition-colors"
            style={{
              color: activeTab === tab.key ? COLORS.purple : '#94a3b8',
              background: activeTab === tab.key ? `${COLORS.purple}08` : 'transparent',
              fontWeight: activeTab === tab.key ? 600 : 500
            }}>

              {tab.label}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      {activeTab === 'atlas' &&
      <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div
          className="w-52 flex-shrink-0 flex flex-col p-3 overflow-y-auto custom-scrollbar border-r border-slate-200/80 bg-slate-50/30">

            <div className="space-y-1.5 mb-4">
              <MetricCard
              label="Nodes"
              value={totals.totalNodes}
              color={COLORS.green}
              active={activeFilter === 'active'}
              onClick={() => handleFilterToggle('active')} />

              <MetricCard
              label="Types"
              value={categories.length}
              color={COLORS.purple}
              active={activeFilter === 'instances'}
              onClick={() => handleFilterToggle('instances')} />

              <MetricCard
              label="Pages"
              value={totals.pages}
              color={COLORS.teal}
              active={false}
              onClick={() => {}} />

              <MetricCard
              label="Depth"
              value={totals.maxDepth}
              color={COLORS.orange}
              active={false}
              onClick={() => {}} />

            </div>

            {/* Design Health Score */}
            <div className="text-[9px] uppercase tracking-[0.15em] font-medium mb-3 text-slate-400">
              Design Health Score
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HealthGauge value={totals.designHealth} label="Design" gaugeKey="design" />
              <HealthGauge value={governance.tokenCompliance} label="Tokens" gaugeKey="tokens" />
              <HealthGauge value={governance.namingConvention} label="Coverage" gaugeKey="coverage" />
              <HealthGauge value={governance.documentation} label="Docs" gaugeKey="docs" />
            </div>
          </div>

          {/* Center: Radial Atlas */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Info bar */}
            <div className="flex items-center justify-center px-3 py-1.5 text-[9px] border-b border-slate-200/80 text-slate-400 bg-slate-50/50">
              {activeCategory && selectedCat ?
            <span>
                  <span style={{ color: selectedCat.color }}>{'\u25CF'}</span>{' '}
                  <span className="text-slate-700">{selectedCat.label}</span>
                  {' \u00B7 '}
                  {selectedCat.count} nodes {'\u00B7'} {selectedCat.health}% health
                </span> :

            <span>
                  {totals.totalNodes.toLocaleString()} nodes {'\u00B7'} {categories.length} types {'\u00B7'} {totals.pages} page{totals.pages !== 1 ? 's' : ''}
                  {activeFilter &&
              <>
                      {' \u00B7 '}
                      <span style={{ color: COLORS.purple }}>filter: {activeFilter}</span>
                    </>
              }
                </span>
            }
            </div>
            <div className="flex-1 p-3 flex items-center justify-center overflow-hidden">
              <RadialAtlas
              categories={categories}
              activeCategory={activeCategory}
              totalNodes={totals.totalNodes}
              onSelectCategory={handleSelectCategory} />

            </div>
          </div>

          {/* Right panel */}
          <div
          className="w-64 flex-shrink-0 flex flex-col p-3 overflow-hidden border-l border-slate-200/80">

            <DetailPanel
            categories={categories}
            activeCategory={activeCategory}
            selectedVariant={selectedVariant}
            variantDetails={variantDetails}
            activeFilter={activeFilter}
            onSelectVariant={setSelectedVariant} />

          </div>
        </div>
      }

      {/* Governance tab */}
      {activeTab === 'governance' &&
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center mb-6">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1 text-slate-400">
                Design Compliance
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: COLORS.purple }}>
                <AnimatedNumber value={Math.round((governance.tokenCompliance + governance.namingConvention + governance.documentation + governance.devResources) / 4)} />%
              </div>
              <div className="text-[9px] mt-1 text-slate-400">Overall Score</div>
            </div>
            {[
          { label: 'Token Compliance', value: governance.tokenCompliance, color: COLORS.teal },
          { label: 'Naming Convention', value: governance.namingConvention, color: COLORS.purple },
          { label: 'Documentation', value: governance.documentation, color: COLORS.orange },
          { label: 'Dev Resources', value: governance.devResources, color: '#4D9EFF' }].
          map((item) =>
          <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100">
                  <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${item.value}%`,
                  background: item.color
                }} />

                </div>
              </div>
          )}

            {/* Dev Resource Links */}
            {devResourceLinks.length > 0 &&
          <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.15em] font-medium mb-3 text-slate-400">
                  Attached Dev Resources ({devResourceLinks.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-auto custom-scrollbar">
                  {devResourceLinks.map((link, i) =>
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group">

                      <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider" style={{
                  color: link.linkType === 'storybook' ? '#FF4785' :
                  link.linkType === 'repository' ? '#6e5494' :
                  link.linkType === 'documentation' ? COLORS.teal :
                  link.linkType === 'package' ? COLORS.red :
                  COLORS.mutedText,
                  background: link.linkType === 'storybook' ? '#FF478510' :
                  link.linkType === 'repository' ? '#6e549410' :
                  link.linkType === 'documentation' ? '#0d948810' :
                  link.linkType === 'package' ? '#dc262610' :
                  '#64748b10'
                }}>
                        {link.linkType === 'storybook' ? 'SB' :
                  link.linkType === 'repository' ? 'GIT' :
                  link.linkType === 'documentation' ? 'DOC' :
                  link.linkType === 'package' ? 'PKG' :
                  link.linkType === 'figma' ? 'FIG' : 'URL'}
                      </span>
                      <span className="text-[11px] text-slate-600 group-hover:text-blue-600 truncate min-w-0">
                        {link.name}
                      </span>
                      <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-400 shrink-0 ml-auto" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" data-test-id="svg-4fb1ceed">
                        <path d="M3.5 2H10V8.5M10 2L2 10" />
                      </svg>
                    </a>
              )}
                </div>
              </div>
          }
            {devResourceLinks.length === 0 &&
          <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.15em] font-medium mb-2 text-slate-400">
                  Dev Resources
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed px-3 py-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/30">
                  No dev resource links attached. Add Storybook, GitHub, or documentation links to components in Figma to improve this score.
                </div>
              </div>
          }
          </div>
        </div>
      }


      {/* CSS Animations */}
      <style>{`
        @keyframes atlas-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes atlas-slideIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes atlas-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes atlas-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .atlas-fadeIn { animation: atlas-fadeIn 0.3s ease-out; }
        .atlas-slideIn { animation: atlas-slideIn 0.3s ease-out; }
        .atlas-spin { animation: atlas-spin 1s linear infinite; }
        .atlas-blink { animation: atlas-blink 1.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>);

}