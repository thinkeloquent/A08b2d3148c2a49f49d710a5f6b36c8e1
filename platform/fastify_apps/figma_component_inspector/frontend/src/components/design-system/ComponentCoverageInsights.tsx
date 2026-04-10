/**
 * COMPONENT COVERAGE INSIGHTS
 * ===========================
 *
 * Node-specific, actionable insight panels for Figma component coverage.
 * Internal sub-tabs: State Coverage, Property Linter, Scalability, Dev Readiness.
 * Matches the ELEMENT ATLAS / DESIGN COMPLIANCE pill tab pattern.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, Component, GitBranch,
  Boxes, Gauge, Eye, Shield, Zap, Target,
  FileCode2, TestTube2, Layout, Type, ChevronRight,
  XCircle, Info, Wrench, Hash, Copy, Check, X, ImageIcon,
  ExternalLink } from
'lucide-react';
import * as api from '../../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface VariantState {
  name: string;
  props: Record<string, unknown>;
  instances: number;
}

interface VariantDetail {
  instances: number;
  health: number;
  status: 'compliant' | 'partial' | 'detached';
  tokensCovered: number;
  nodeId: string;
  states: VariantState[];
  tokens: string[];
  sizes: string[];
  code: string;
  htmlTag?: string;
  cssProperties?: Record<string, string>;
}

interface AtlasCategory {
  id: string;
  label: string;
  color: string;
  count: number;
  instances: number;
  health: number;
  components: string[];
}

interface AtlasData {
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
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

/** Walk the tree and return the path of node names from root to the target id. */
function findNodePath(root: FigmaNode, targetId: string): string[] | null {
  if (root.id === targetId) return [root.name];
  if (!root.children) return null;
  for (const child of root.children) {
    const path = findNodePath(child, targetId);
    if (path) return [root.name, ...path];
  }
  return null;
}

interface ComponentCoverageInsightsProps {
  fileId: string;
  onViewNode?: (nodeId: string) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const COLORS = {
  purple: '#7c3aed',
  dimText: '#94a3b8'
};

const INTERACTIVE_STATES = new Set([
'hover', 'pressed', 'active', 'focused', 'focus', 'disabled',
'loading', 'error', 'selected', 'checked', 'open', 'closed',
'expanded', 'collapsed', 'dragging', 'drag']
);

const EXPECTED_STATES = ['default', 'hover', 'focused', 'disabled', 'error', 'loading'];

type SubTab = 'state-coverage' | 'property-linter' | 'scalability' | 'dev-readiness';

const SUB_TABS: Array<{key: SubTab;label: string;}> = [
{ key: 'state-coverage', label: 'State Coverage' },
{ key: 'property-linter', label: 'Property Linter' },
{ key: 'scalability', label: 'Scalability' },
{ key: 'dev-readiness', label: 'Dev Readiness' }];


// ── Severity helpers ───────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'notice' | 'good';

function severityDot(s: Severity) {
  const cls = {
    critical: 'bg-red-500',
    warning: 'bg-amber-400',
    notice: 'bg-blue-400',
    good: 'bg-green-500'
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${cls[s]}`} />;
}

function severityLabel(s: Severity) {
  const cls = {
    critical: 'text-red-700 bg-red-50',
    warning: 'text-amber-700 bg-amber-50',
    notice: 'text-blue-700 bg-blue-50',
    good: 'text-green-700 bg-green-50'
  };
  const label = { critical: 'Critical', warning: 'Warning', notice: 'Notice', good: 'Good' };
  return <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${cls[s]}`}>{label[s]}</span>;
}

function severityBorder(s: Severity) {
  return {
    critical: 'border-l-red-500',
    warning: 'border-l-amber-400',
    notice: 'border-l-blue-400',
    good: 'border-l-green-500'
  }[s];
}

// ── Finding types ──────────────────────────────────────────────────────────────

interface Finding {
  severity: Severity;
  componentName: string;
  componentIcon?: string;
  nodeId: string;
  categoryLabel: string;
  title: string;
  description: string;
  recommendation: string;
  details?: string[];
  dos?: string[];
  donts?: string[];
}

// ── Analysis engine ────────────────────────────────────────────────────────────

function analyzeStateCoverage(data: AtlasData): Finding[] {
  const findings: Finding[] = [];

  for (const cat of data.categories) {
    const variants = data.variantDetails[cat.id] || {};
    for (const [name, detail] of Object.entries(variants)) {
      const stateNames = new Set(detail.states.map((s) => s.name.toLowerCase()));
      const missing = EXPECTED_STATES.filter((s) => !stateNames.has(s));
      const interactiveFound = detail.states.filter((s) => INTERACTIVE_STATES.has(s.name.toLowerCase()));

      if (missing.length >= 3) {
        findings.push({
          severity: 'critical',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Missing ${missing.length} interactive states`,
          description: `This component is missing critical interactive states that users expect.`,
          recommendation: `Add the missing states in Figma to ensure a complete interaction model.`,
          details: missing.map((s) => `[:${s}]`)
        });
      } else if (missing.length > 0) {
        findings.push({
          severity: 'warning',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Missing specific state${missing.length > 1 ? 's' : ''} ${missing.map((s) => `[:${s}]`).join(' ')}`,
          description: `${missing.length} interactive state${missing.length > 1 ? 's are' : ' is'} not defined for this component.`,
          recommendation: `Define the missing state${missing.length > 1 ? 's' : ''} as variant${missing.length > 1 ? 's' : ''} in the component set.`,
          details: missing.map((s) => `[:${s}]`)
        });
      }

      // Check for mutually exclusive state conflicts
      const hasLoading = stateNames.has('loading');
      const hasDisabled = stateNames.has('disabled');
      if (hasLoading && hasDisabled) {
        findings.push({
          severity: 'notice',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: 'Review mutual exclusivity: Loading + Disabled',
          description: 'Both loading and disabled states exist. Clarify if they can coexist or are mutually exclusive.',
          recommendation: 'Document the state machine transitions. If mutually exclusive, enforce in the component API.'
        });
      }

      // Detached components
      if (detail.status === 'detached') {
        findings.push({
          severity: 'critical',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: 'Detached from main component',
          description: 'This element is detached from its source component, meaning updates to the master will not propagate.',
          recommendation: 'Re-link to the main component or merge changes back to the master.'
        });
      }
    }
  }

  return findings.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}

function analyzePropertyLinter(data: AtlasData): Finding[] {
  const findings: Finding[] = [];

  for (const cat of data.categories) {
    const variants = data.variantDetails[cat.id] || {};
    for (const [name, detail] of Object.entries(variants)) {
      const propMap = new Map<string, Set<string>>();
      for (const state of detail.states) {
        for (const [key, val] of Object.entries(state.props)) {
          if (!propMap.has(key)) propMap.set(key, new Set());
          propMap.get(key)!.add(String(val));
        }
      }

      for (const [propName, values] of propMap) {
        const valArr = [...values];
        // Boolean anti-pattern: Yes/No instead of True/False
        if (valArr.length === 2) {
          const sorted = valArr.map((v) => v.toLowerCase()).sort();
          if (sorted[0] === 'no' && sorted[1] === 'yes' || sorted[0] === 'off' && sorted[1] === 'on') {
            findings.push({
              severity: 'critical',
              componentName: name,
              nodeId: detail.nodeId,
              categoryLabel: cat.label,
              title: `Property "${propName}" use string values [${valArr.map((v) => `'${v}'`).join(', ')}]`,
              description: `Boolean-like property "${propName}" is using string values instead of native boolean. This creates API confusion and prop type mismatches in code.`,
              recommendation: 'Convert to Boolean property (True/False) in Figma.'
            });
          }
        }

        // Naming inconsistency: mixed case styles in values
        if (valArr.length > 2) {
          const hasCamel = valArr.some((v) => /^[a-z]+[A-Z]/.test(v));
          const hasSnake = valArr.some((v) => v.includes('_'));
          const hasKebab = valArr.some((v) => v.includes('-'));
          const mixedStyles = [hasCamel, hasSnake, hasKebab].filter(Boolean).length;
          if (mixedStyles > 1) {
            findings.push({
              severity: 'warning',
              componentName: name,
              nodeId: detail.nodeId,
              categoryLabel: cat.label,
              title: `Property "${propName}" mixes naming conventions`,
              description: `Values use mixed naming styles (${[hasCamel && 'camelCase', hasSnake && 'snake_case', hasKebab && 'kebab-case'].filter(Boolean).join(', ')}). Inconsistent naming makes token mapping harder.`,
              recommendation: 'Standardize on a single naming convention across all property values.',
              details: valArr.slice(0, 5).map((v) => `'${v}'`)
            });
          }
        }

        // Variant nomenclature: check for semantic misalignment
        const lower = propName.toLowerCase();
        if (lower === 'variant' || lower === 'type' || lower === 'kind') {
          findings.push({
            severity: 'notice',
            componentName: name,
            nodeId: detail.nodeId,
            categoryLabel: cat.label,
            title: `Property "${propName}" nomenclature: [${valArr.slice(0, 4).map((v) => `'${v}'`).join(', ')}${valArr.length > 4 ? ', ...' : ''}]`,
            description: `Check consistency with design tokens. Ensure variant values map to a documented token taxonomy.`,
            recommendation: 'Cross-reference values against the design system token palette.',
            details: valArr
          });
        }
      }

      // Token compliance per component
      if (detail.tokensCovered < 3 && detail.instances > 1) {
        findings.push({
          severity: 'warning',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Low token binding (${detail.tokensCovered} tokens)`,
          description: `This component has ${detail.instances} instances but only ${detail.tokensCovered} bound tokens. Hard-coded values risk visual drift.`,
          recommendation: 'Bind visual properties (fills, strokes, spacing) to design tokens.'
        });
      }
    }
  }

  return findings.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}

function analyzeScalability(data: AtlasData): Finding[] {
  const findings: Finding[] = [];

  for (const cat of data.categories) {
    const variants = data.variantDetails[cat.id] || {};
    const variantCount = Object.keys(variants).length;

    // Category-level explosion check
    if (cat.count > 100) {
      findings.push({
        severity: 'critical',
        componentName: cat.label,
        nodeId: '',
        categoryLabel: cat.label,
        title: `${cat.count} nodes — variant explosion`,
        description: `This component group has ${cat.count} nodes, far exceeding the recommended threshold. This bloats the file and slows rendering.`,
        recommendation: 'Refactor into smaller composable base components using nested instance-swap properties.'
      });
    } else if (cat.count > 50) {
      findings.push({
        severity: 'warning',
        componentName: cat.label,
        nodeId: '',
        categoryLabel: cat.label,
        title: `${cat.count} nodes — approaching complexity threshold`,
        description: `This group is growing large. Review if variants can be simplified with base component composition.`,
        recommendation: 'Consider splitting into base + composed components to reduce the matrix.'
      });
    }

    for (const [name, detail] of Object.entries(variants)) {
      // Per-component variant matrix
      const propMap = new Map<string, Set<string>>();
      for (const state of detail.states) {
        for (const [key, val] of Object.entries(state.props)) {
          if (!propMap.has(key)) propMap.set(key, new Set());
          propMap.get(key)!.add(String(val));
        }
      }
      const properties = [...propMap.entries()].map(([n, vals]) => ({ name: n, count: vals.size }));
      const matrix = properties.reduce((t, p) => t * Math.max(p.count, 1), 1);

      if (matrix > 100) {
        findings.push({
          severity: 'critical',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Variant matrix: ${matrix} combinations`,
          description: `${properties.map((p) => `${p.name}(${p.count})`).join(' x ')} = ${matrix} variants. This exceeds the ${'>'}100 threshold for maintainability.`,
          recommendation: 'Split into progressive delivery: base component first, complex variants as fast-follows.',
          details: properties.map((p) => `${p.name}: ${p.count} values`)
        });
      } else if (matrix > 48) {
        findings.push({
          severity: 'warning',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Variant matrix: ${matrix} combinations`,
          description: `${properties.map((p) => `${p.name}(${p.count})`).join(' x ')} = ${matrix}. Growing complex — plan for staged QA.`,
          recommendation: 'Prioritize core variants for Sprint 1, defer edge-case variants.',
          details: properties.map((p) => `${p.name}: ${p.count} values`)
        });
      }

      // QA surface area
      if (matrix > 24 && detail.instances > 3) {
        findings.push({
          severity: 'notice',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `${matrix} test cases x ${detail.instances} instances`,
          description: `High-reuse component with a large variant matrix. Each property combination requires testing across all instances.`,
          recommendation: `Generate automated visual regression suite. Priority: ${detail.instances} instances make this high-impact.`
        });
      }
    }
  }

  return findings.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}

function analyzeDevReadiness(data: AtlasData): Finding[] {
  const findings: Finding[] = [];

  for (const cat of data.categories) {
    const variants = data.variantDetails[cat.id] || {};
    for (const [name, detail] of Object.entries(variants)) {
      // ── Diagnose health gaps ──────────────────────────────────────────────
      const stateNames = new Set(detail.states.map((s) => s.name.toLowerCase()));
      const missingStates = EXPECTED_STATES.filter((s) => !stateNames.has(s));
      const hasTokens = detail.tokensCovered >= 3;
      const hasStates = missingStates.length === 0;
      const isLinked = detail.status !== 'detached';
      const hasSizes = detail.sizes.length > 0;
      const propMap = new Map<string, Set<string>>();
      for (const state of detail.states) {
        for (const [key, val] of Object.entries(state.props)) {
          if (!propMap.has(key)) propMap.set(key, new Set());
          propMap.get(key)!.add(String(val));
        }
      }
      const hasProps = propMap.size > 0;

      // Build actionable gap list
      const gaps: string[] = [];
      if (!hasTokens) gaps.push(`Bind design tokens (${detail.tokensCovered}/3 minimum)`);
      if (missingStates.length > 0) gaps.push(`Add missing states: ${missingStates.map((s) => `[:${s}]`).join(', ')}`);
      if (!isLinked) gaps.push('Re-link to main component (currently detached)');
      if (!hasSizes) gaps.push('Define size variants (S/M/L or equivalent)');
      if (!hasProps) gaps.push('Define variant properties for prop mapping');

      // Health-based readiness
      if (detail.health >= 70) {
        findings.push({
          severity: 'good',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Ready for engineering (${detail.health}% health)`,
          description: `Component is well-defined with ${detail.instances} instances. Variant properties map directly to frontend props.`,
          recommendation: 'Add to engineering backlog. Generate TypeScript interface from variant props.',
          details: detail.states.length > 0 ?
          detail.states.slice(0, 3).map((s) => {
            const props = Object.entries(s.props).slice(0, 3).map(([k, v]) => `${k}="${v}"`).join(' ');
            return `${s.name}: ${props || 'no props'}`;
          }) :
          undefined,
          dos: [
          'Generate TypeScript interface from variant props',
          'Write unit tests covering each variant state',
          'Map CSS properties to Tailwind utilities or design tokens',
          ...(detail.instances > 5 ? ['Prioritize — high reuse component with ' + detail.instances + ' instances'] : [])],

          donts: [
          'Don\'t hard-code colors or spacing — use bound tokens',
          'Don\'t skip visual regression tests for this component',
          'Don\'t add new props without updating the Figma source first']

        });
      } else if (detail.health >= 40) {
        findings.push({
          severity: 'warning',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Partial readiness (${detail.health}% health) — ${gaps.length} gap${gaps.length !== 1 ? 's' : ''} to fix`,
          description: `Component needs additional design work before handoff. Address the gaps below to reach 70%+ health.`,
          recommendation: `Fix ${gaps.length} gap${gaps.length !== 1 ? 's' : ''}: ${gaps.join('; ')}.`,
          details: gaps,
          dos: [
          ...(missingStates.length > 0 ? [`Add the ${missingStates.length} missing interactive state${missingStates.length > 1 ? 's' : ''} in Figma`] : []),
          ...(!hasTokens ? [`Bind at least 3 visual properties (fills, strokes, spacing) to design tokens`] : []),
          ...(!isLinked ? ['Re-link this instance to the source component'] : []),
          'Validate against design spec before engineering pickup',
          'Document any intentional deviations from the base component'],

          donts: [
          'Don\'t hand off to engineering until gaps are resolved',
          'Don\'t start coding against partial specs — rework cost is high',
          'Don\'t create one-off variants — extend the component set instead',
          ...(!hasTokens ? ['Don\'t use hard-coded hex values — bind to tokens'] : [])]

        });
      } else {
        // Points-to-green breakdown
        const pointsNeeded = 40 - detail.health;
        const actionPlan: string[] = [];
        if (!hasTokens) actionPlan.push(`+15 pts: Bind ${3 - detail.tokensCovered} more design tokens (fills, borders, spacing)`);
        if (missingStates.length >= 3) actionPlan.push(`+20 pts: Add ${missingStates.length} missing states — ${missingStates.slice(0, 4).map((s) => `[:${s}]`).join(', ')}`);else
        if (missingStates.length > 0) actionPlan.push(`+10 pts: Add ${missingStates.length} missing state${missingStates.length > 1 ? 's' : ''} — ${missingStates.map((s) => `[:${s}]`).join(', ')}`);
        if (!isLinked) actionPlan.push('+10 pts: Re-link to main component (currently detached)');
        if (!hasSizes) actionPlan.push('+5 pts: Define size variants (S/M/L)');
        if (!hasProps) actionPlan.push('+10 pts: Define variant properties for prop mapping');
        if (detail.instances <= 1) actionPlan.push('+5 pts: Add at least 2 instances to validate reuse');

        findings.push({
          severity: 'critical',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `Not ready (${detail.health}% health) — need ${pointsNeeded}+ pts to reach 40%`,
          description: `Component health is below the minimum threshold. Follow the action plan below to unblock engineering handoff.`,
          recommendation: `Complete the top actions to reach 40% (warning) then 70% (green). Start with token bindings and missing states.`,
          details: actionPlan,
          dos: [
          ...(!hasTokens ? ['Bind fills, strokes, and spacing to design tokens (biggest health boost)'] : []),
          ...(missingStates.length > 0 ? [`Add interactive states: ${missingStates.join(', ')}`] : []),
          ...(!isLinked ? ['Re-link to the source component — detached instances block updates'] : []),
          ...(!hasProps ? ['Define variant properties so engineers can map to component props'] : []),
          'Review with design lead before re-submitting for readiness'],

          donts: [
          'Don\'t hand off to engineering — high rework risk at this health level',
          'Don\'t skip token bindings — hard-coded values cause visual drift across themes',
          'Don\'t create engineering tickets until health reaches at least 40%',
          'Don\'t duplicate the component — fix the source instead of creating a fork',
          ...(!isLinked ? ['Don\'t leave detached — upstream fixes won\'t propagate'] : [])]

        });
      }

      // Prop-to-TypeScript mapping
      const tsPropMap = new Map<string, Set<string>>();
      for (const state of detail.states) {
        for (const [key, val] of Object.entries(state.props)) {
          if (!tsPropMap.has(key)) tsPropMap.set(key, new Set());
          tsPropMap.get(key)!.add(String(val));
        }
      }
      if (tsPropMap.size > 0) {
        const tsProps = [...tsPropMap.entries()].map(([pName, vals]) => {
          const valArr = [...vals];
          const sorted = valArr.map((v) => v.toLowerCase()).sort();
          if (valArr.length === 2 && (sorted[0] === 'false' && sorted[1] === 'true' || sorted[0] === 'no' && sorted[1] === 'yes')) {
            return `${pName}?: boolean`;
          }
          return `${pName}: ${valArr.map((v) => `'${v}'`).join(' | ')}`;
        });
        findings.push({
          severity: 'notice',
          componentName: name,
          nodeId: detail.nodeId,
          categoryLabel: cat.label,
          title: `TypeScript prop interface (${propMap.size} props)`,
          description: `Variant properties translate to: ${detail.htmlTag ? `<${detail.htmlTag}>` : 'Component'}`,
          recommendation: 'Use as baseline for component prop types.',
          details: tsProps
        });
      }

      // CSS architecture hints
      if (detail.cssProperties && Object.keys(detail.cssProperties).length > 0) {
        const cssProps = Object.entries(detail.cssProperties);
        const hasLayout = cssProps.some(([k]) => k === 'display' || k === 'flexDirection');
        const hasBorder = cssProps.some(([k]) => k === 'borderRadius' || k === 'borderWidth');
        const hints: string[] = [];
        if (hasLayout) hints.push('Flex/Grid layout detected — plan responsive breakpoints');
        if (hasBorder) hints.push('Border styling present — ensure token binding for radius/width');
        if (cssProps.length > 8) hints.push(`${cssProps.length} CSS properties — consider utility class mapping`);

        if (hints.length > 0) {
          findings.push({
            severity: 'notice',
            componentName: name,
            nodeId: detail.nodeId,
            categoryLabel: cat.label,
            title: 'CSS architecture hints',
            description: `${cssProps.length} style properties extracted for defensive styling.`,
            recommendation: 'Map to Tailwind utilities or CSS custom properties.',
            details: hints
          });
        }
      }
    }
  }

  return findings.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}

function severityOrder(s: Severity): number {
  return { critical: 0, warning: 1, notice: 2, good: 3 }[s];
}

// ── Summary stats ──────────────────────────────────────────────────────────────

function computeSummary(findings: Finding[]) {
  const critical = findings.filter((f) => f.severity === 'critical').length;
  const warning = findings.filter((f) => f.severity === 'warning').length;
  const notice = findings.filter((f) => f.severity === 'notice').length;
  const good = findings.filter((f) => f.severity === 'good').length;
  return { critical, warning, notice, good, total: findings.length };
}

// ── UI Components ──────────────────────────────────────────────────────────────

function SummaryBar({ findings }: {findings: Finding[];}) {
  const { critical, warning, notice, good, total } = computeSummary(findings);
  const overallHealth = total > 0 ? Math.round((good + notice * 0.5) / total * 100) : 100;

  return (
    <div className="flex items-center gap-6 px-5 py-3 border-b border-slate-200/80 bg-slate-50/30">
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90" data-test-id="svg-124fc9db">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={overallHealth >= 70 ? '#16a34a' : overallHealth >= 40 ? '#d97706' : '#dc2626'}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${overallHealth * 0.94} 100`} />

          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700">{overallHealth}%</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[12px]">
        {critical > 0 &&
        <span className="flex items-center gap-1.5">
            {severityDot('critical')}
            <span className="font-semibold text-red-700">{critical}</span>
            <span className="text-gray-400">Critical</span>
          </span>
        }
        {warning > 0 &&
        <span className="flex items-center gap-1.5">
            {severityDot('warning')}
            <span className="font-semibold text-amber-700">{warning}</span>
            <span className="text-gray-400">Warning</span>
          </span>
        }
        {notice > 0 &&
        <span className="flex items-center gap-1.5">
            {severityDot('notice')}
            <span className="font-semibold text-blue-700">{notice}</span>
            <span className="text-gray-400">Notice</span>
          </span>
        }
        {good > 0 &&
        <span className="flex items-center gap-1.5">
            {severityDot('good')}
            <span className="font-semibold text-green-700">{good}</span>
            <span className="text-gray-400">Good</span>
          </span>
        }
      </div>
      <div className="ml-auto text-[11px] text-gray-400">
        {total} findings across {new Set(findings.map((f) => f.componentName)).size} components
      </div>
    </div>);

}

/** Modal overlay for previewing a node image. */
function PreviewModal({ fileId, nodeId, nodeName, onClose }: {fileId: string;nodeId: string;nodeName: string;onClose: () => void;}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [decoding, setDecoding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setIsPlaceholder(false);
      setLoadError(false);
      setDecoding(false);
      try {
        const result = await api.loadImageSrc(fileId, nodeId);
        if (!cancelled) {
          setImageSrc(result.src);
          setIsPlaceholder(result.isPlaceholder);
          if (result.src && !result.isPlaceholder) setDecoding(true);
        }
      } catch {
        if (!cancelled) {setImageSrc(null);setLoadError(true);}
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {cancelled = true;};
  }, [fileId, nodeId]);

  const showFallback = isPlaceholder || loadError || !loading && !imageSrc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-[80vw] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-slate-50/80">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-gray-800 truncate">{nodeName}</span>
            <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">{nodeId}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="relative p-8 overflow-auto max-h-[calc(80vh-52px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          {loading ?
          <div className="text-center py-16 px-24">
              <div className="w-10 h-10 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading preview...</p>
            </div> :
          showFallback ?
          <div className="text-center py-16 px-24">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No preview available</p>
              <p className="text-xs text-gray-300 mt-1">
                {loadError ? 'Image failed to load' : 'This node type cannot be rendered'}
              </p>
            </div> :

          <>
              {decoding &&
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg z-10">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Rendering...</p>
                  </div>
                </div>
            }
              <img
              src={imageSrc!}
              alt={nodeName}
              className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
              onLoad={() => setDecoding(false)}
              onError={() => {setDecoding(false);setLoadError(true);}} />

            </>
          }
        </div>
      </div>
    </div>);

}

function FindingRow({
  finding,
  fileId,
  nodePath,
  onViewNode,
  onPreview






}: {finding: Finding;fileId: string;nodePath?: string | null;onViewNode?: (nodeId: string) => void;onPreview?: (nodeId: string, nodeName: string) => void;}) {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const structureUrl = finding.nodeId ?
  `/apps/figma_component_inspector/load/file/${encodeURIComponent(fileId)}/structure?node=${encodeURIComponent(finding.nodeId)}` :
  null;

  const handleCopyNodeId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(finding.nodeId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    });
  };

  return (
    <div className={`border-l-[3px] ${severityBorder(finding.severity)} rounded-lg border border-gray-200/80 bg-white shadow-sm transition-all hover:shadow-md`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-start gap-3">

        <div className="mt-0.5 flex-shrink-0">
          {severityDot(finding.severity)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold text-gray-800">{finding.componentName}</span>
            <span className="text-[10px] text-gray-400">{finding.categoryLabel}</span>
          </div>
          <div className="text-[12px] text-gray-600 mt-0.5 leading-relaxed">
            {finding.title}
            {finding.details && !expanded && finding.details.length > 0 &&
            <span className="ml-2 inline-flex gap-1">
                {finding.details.slice(0, 3).map((d, i) =>
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">{d}</span>
              )}
                {finding.details.length > 3 &&
              <span className="text-[10px] text-gray-400">+{finding.details.length - 3}</span>
              }
              </span>
            }
          </div>
          {/* Node ID + Path row */}
          {finding.nodeId &&
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                <Hash className="w-2.5 h-2.5" />
                {finding.nodeId}
                <button onClick={handleCopyNodeId} className="ml-0.5 hover:text-gray-600 transition-colors" title="Copy Node ID">
                  {copiedId ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
              </span>
              {nodePath &&
            <span className="text-[10px] text-gray-400 truncate max-w-xs" title={nodePath}>
                  {nodePath}
                </span>
            }
            </div>
          }
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {finding.nodeId && onPreview &&
          <button
            onClick={(e) => {e.stopPropagation();onPreview(finding.nodeId, finding.componentName);}}
            className="text-[10px] text-gray-500 hover:text-purple-700 flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-purple-50 transition-colors"
            title="Preview image">

              <ImageIcon className="w-3 h-3" />
            </button>
          }
          {structureUrl &&
          <a
            href={structureUrl}
            onClick={(e) => {e.stopPropagation();if (onViewNode) {e.preventDefault();onViewNode(finding.nodeId);}}}
            className="text-[10px] text-purple-600 hover:text-purple-800 flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-purple-50 transition-colors"
            title="View in Structure tab">

              <Eye className="w-3 h-3" /> View
              {!onViewNode && <ExternalLink className="w-2.5 h-2.5 ml-0.5" />}
            </a>
          }
          <ChevronRight className={`w-3.5 h-3.5 text-gray-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {expanded &&
      <div className="px-4 pb-3 pt-0 border-t border-gray-100 mx-4 mt-0 space-y-2">
          <p className="text-[11px] text-gray-500 leading-relaxed">{finding.description}</p>
          <div className="flex items-start gap-2 rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2">
            <Wrench className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
            <span className="text-[11px] text-purple-800 font-medium">{finding.recommendation}</span>
          </div>
          {finding.details && finding.details.length > 0 &&
        <div className="flex flex-wrap gap-1.5 mt-1">
              {finding.details.map((d, i) =>
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-600 font-mono">{d}</span>
          )}
            </div>
        }
          {/* Do's and Don'ts */}
          {(finding.dos || finding.donts) &&
        <div className="grid grid-cols-2 gap-2 mt-2">
              {finding.dos && finding.dos.length > 0 &&
          <div className="rounded-md border border-green-200 bg-green-50/50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 mb-1.5">Do</p>
                  <ul className="space-y-1">
                    {finding.dos.map((d, i) =>
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-green-800 leading-snug">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{d}</span>
                      </li>
              )}
                  </ul>
                </div>
          }
              {finding.donts && finding.donts.length > 0 &&
          <div className="rounded-md border border-red-200 bg-red-50/50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1.5">Don't</p>
                  <ul className="space-y-1">
                    {finding.donts.map((d, i) =>
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-red-800 leading-snug">
                        <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{d}</span>
                      </li>
              )}
                  </ul>
                </div>
          }
            </div>
        }
        </div>
      }
    </div>);

}

// ── Dev Readiness Health Breakdown (top-level panel) ─────────────────────────

interface HealthSignal {
  label: string;
  passed: boolean;
  weight: number;
  action: string;
}

function computeHealthSignals(data: AtlasData): {signals: HealthSignal[];score: number;total: number;readyCount: number;notReadyCount: number;partialCount: number;} {
  let readyCount = 0;
  let notReadyCount = 0;
  let partialCount = 0;

  // Aggregate across all components
  let tokenPass = 0,tokenTotal = 0;
  let statePass = 0,stateTotal = 0;
  let linkPass = 0,linkTotal = 0;
  let propPass = 0,propTotal = 0;
  let sizePass = 0,sizeTotal = 0;

  for (const cat of data.categories) {
    const variants = data.variantDetails[cat.id] || {};
    for (const [, detail] of Object.entries(variants)) {
      tokenTotal++;
      stateTotal++;
      linkTotal++;
      propTotal++;
      sizeTotal++;

      if (detail.health >= 70) readyCount++;else
      if (detail.health >= 40) partialCount++;else
      notReadyCount++;

      if (detail.tokensCovered >= 3) tokenPass++;
      const stateNames = new Set(detail.states.map((s) => s.name.toLowerCase()));
      const missingStates = EXPECTED_STATES.filter((s) => !stateNames.has(s));
      if (missingStates.length === 0) statePass++;
      if (detail.status !== 'detached') linkPass++;
      // props
      const hasProps = detail.states.some((s) => Object.keys(s.props).length > 0);
      if (hasProps) propPass++;
      if (detail.sizes.length > 0) sizePass++;
    }
  }

  const total = tokenTotal || 1; // avoid division by 0
  const signals: HealthSignal[] = [
  {
    label: 'Token Bindings',
    passed: tokenPass === tokenTotal,
    weight: Math.round(tokenPass / total * 100),
    action: tokenPass === tokenTotal ?
    `All ${tokenTotal} components have 3+ token bindings` :
    `${tokenTotal - tokenPass} of ${tokenTotal} components need more token bindings (fills, strokes, spacing)`
  },
  {
    label: 'Interactive States',
    passed: statePass === stateTotal,
    weight: Math.round(statePass / total * 100),
    action: statePass === stateTotal ?
    `All components define the expected interactive states` :
    `${stateTotal - statePass} components are missing states (hover, focused, disabled, error, loading)`
  },
  {
    label: 'Component Linkage',
    passed: linkPass === linkTotal,
    weight: Math.round(linkPass / total * 100),
    action: linkPass === linkTotal ?
    `All components are linked to their source` :
    `${linkTotal - linkPass} detached — re-link so upstream updates propagate`
  },
  {
    label: 'Variant Properties',
    passed: propPass === propTotal,
    weight: Math.round(propPass / total * 100),
    action: propPass === propTotal ?
    `All components define variant properties for prop mapping` :
    `${propTotal - propPass} components lack variant properties — engineers can't map to props`
  },
  {
    label: 'Size Variants',
    passed: sizePass === sizeTotal,
    weight: Math.round(sizePass / total * 100),
    action: sizePass === sizeTotal ?
    `All components have size variants defined` :
    `${sizeTotal - sizePass} components have no size variants (S/M/L)`
  }];


  const score = Math.round(signals.reduce((s, sig) => s + sig.weight, 0) / signals.length);

  return { signals, score, total: tokenTotal, readyCount, notReadyCount, partialCount };
}

function DevReadinessSummaryPanel({ data }: {data: AtlasData;}) {
  const { signals, score, total, readyCount, notReadyCount, partialCount } = useMemo(
    () => computeHealthSignals(data), [data]
  );

  const barColor = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="mx-5 mt-4 mb-2 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header row with overall score */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9">
            <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90" data-test-id="svg-0e2a2ebd">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke={barColor}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${score * 0.94} 100`} />

            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700">{score}%</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-gray-800">Dev Readiness Score</p>
            <p className="text-[10px] text-gray-400">{total} components evaluated</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-medium text-green-700">{readyCount}</span>
            <span className="text-gray-400">Ready</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-medium text-amber-700">{partialCount}</span>
            <span className="text-gray-400">Partial</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-medium text-red-700">{notReadyCount}</span>
            <span className="text-gray-400">Blocked</span>
          </span>
        </div>
      </div>

      {/* Segmented health bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 gap-px">
          {signals.map((sig, i) =>
          <div
            key={i}
            className="transition-all"
            style={{
              flex: 1,
              backgroundColor: sig.passed ? '#16a34a' : sig.weight >= 50 ? '#d97706' : '#dc2626',
              borderRadius: i === 0 ? '9999px 0 0 9999px' : i === signals.length - 1 ? '0 9999px 9999px 0' : '0'
            }}
            title={`${sig.label}: ${sig.weight}%`} />

          )}
        </div>
        <div className="flex justify-between mt-1">
          {signals.map((sig, i) =>
          <span key={i} className="text-[8px] text-gray-400 text-center" style={{ flex: 1 }}>{sig.label}</span>
          )}
        </div>
      </div>

      {/* Signal rows */}
      <div className="px-4 py-2 space-y-1">
        {signals.map((sig, i) =>
        <div key={i} className="flex items-start gap-2 py-1.5">
            {sig.passed ?
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> :
          <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
          }
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-700">{sig.label}</span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${sig.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {sig.weight}%
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">{sig.action}</p>
            </div>
          </div>
        )}
      </div>

      {/* Do / Don't columns */}
      <div className="grid grid-cols-2 gap-0 border-t border-slate-100">
        <div className="px-4 py-3 border-r border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 mb-2">Do</p>
          <ul className="space-y-1.5">
            {signals.filter((s) => !s.passed).length > 0 ?
            <>
                {signals.filter((s) => !s.passed).map((sig, i) =>
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-green-800 leading-snug">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Fix {sig.label.toLowerCase()}: {sig.action.split('—')[0].trim().toLowerCase()}</span>
                  </li>
              )}
                <li className="flex items-start gap-1.5 text-[11px] text-green-800 leading-snug">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Review each critical finding and apply its action plan</span>
                </li>
              </> :

            <>
                <li className="flex items-start gap-1.5 text-[11px] text-green-800 leading-snug">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Generate TypeScript interfaces from variant props</span>
                </li>
                <li className="flex items-start gap-1.5 text-[11px] text-green-800 leading-snug">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Add components to engineering backlog</span>
                </li>
                <li className="flex items-start gap-1.5 text-[11px] text-green-800 leading-snug">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Set up visual regression tests for high-reuse components</span>
                </li>
              </>
            }
          </ul>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-2">Don't</p>
          <ul className="space-y-1.5">
            {notReadyCount > 0 &&
            <li className="flex items-start gap-1.5 text-[11px] text-red-800 leading-snug">
                <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Don't hand off the {notReadyCount} blocked component{notReadyCount > 1 ? 's' : ''} to engineering</span>
              </li>
            }
            <li className="flex items-start gap-1.5 text-[11px] text-red-800 leading-snug">
              <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
              <span>Don't hard-code colors or spacing — always bind to design tokens</span>
            </li>
            <li className="flex items-start gap-1.5 text-[11px] text-red-800 leading-snug">
              <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
              <span>Don't fork components — fix the source component instead</span>
            </li>
            <li className="flex items-start gap-1.5 text-[11px] text-red-800 leading-snug">
              <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
              <span>Don't skip states — missing hover/disabled/error causes rework</span>
            </li>
          </ul>
        </div>
      </div>
    </div>);

}

function FindingsList({
  findings,
  fileId,
  nodePathMap,
  onViewNode,
  onPreview






}: {findings: Finding[];fileId: string;nodePathMap: Map<string, string>;onViewNode?: (nodeId: string) => void;onPreview?: (nodeId: string, nodeName: string) => void;}) {
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [filterComponent, setFilterComponent] = useState<string>('');

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
      if (filterComponent && !f.componentName.toLowerCase().includes(filterComponent.toLowerCase())) return false;
      return true;
    });
  }, [findings, filterSeverity, filterComponent]);

  const summary = computeSummary(findings);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-1">
          {(['all', 'critical', 'warning', 'notice', 'good'] as const).map((s) => {
            const count = s === 'all' ? summary.total : summary[s];
            const isActive = filterSeverity === s;
            return (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-colors ${
                isActive ?
                'bg-purple-50 text-purple-700 border border-purple-200' :
                'text-gray-400 hover:text-gray-600 border border-transparent'}`
                }>

                {s === 'all' ? 'All' : s} ({count})
              </button>);

          })}
        </div>
        <input
          type="text"
          placeholder="Filter by component..."
          value={filterComponent}
          onChange={(e) => setFilterComponent(e.target.value)}
          className="ml-auto text-[11px] px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-200 w-48" />

      </div>

      {/* Findings list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2">
        {filtered.length === 0 ?
        <div className="text-center py-12">
            <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No findings match your filters.</p>
          </div> :

        filtered.map((f, i) =>
        <FindingRow
          key={`${f.nodeId}-${f.title}-${i}`}
          finding={f}
          fileId={fileId}
          nodePath={f.nodeId ? nodePathMap.get(f.nodeId) ?? null : null}
          onViewNode={onViewNode}
          onPreview={onPreview} />

        )
        }
      </div>
    </div>);

}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ComponentCoverageInsights({ fileId, onViewNode }: ComponentCoverageInsightsProps) {
  const [data, setData] = useState<AtlasData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<SubTab>('state-coverage');
  const [documentTree, setDocumentTree] = useState<FigmaNode | null>(null);
  const [previewTarget, setPreviewTarget] = useState<{nodeId: string;nodeName: string;} | null>(null);

  const fetchData = useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    setError('');
    try {
      const [response, fileData] = await Promise.all([
      api.getComponentAtlas(fileId) as Promise<AtlasData>,
      api.getFigmaFile(fileId) as Promise<{document: FigmaNode;}>]
      );
      setData(response);
      if (fileData?.document) setDocumentTree(fileData.document);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load component data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const findings = useMemo(() => {
    if (!data) return [];
    switch (activeTab) {
      case 'state-coverage':return analyzeStateCoverage(data);
      case 'property-linter':return analyzePropertyLinter(data);
      case 'scalability':return analyzeScalability(data);
      case 'dev-readiness':return analyzeDevReadiness(data);
      default:return [];
    }
  }, [data, activeTab]);

  // Build a map of nodeId → "Page / Group / Component" path strings
  const nodePathMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!documentTree || !findings.length) return map;
    const nodeIds = new Set(findings.map((f) => f.nodeId).filter(Boolean));
    for (const nid of nodeIds) {
      const path = findNodePath(documentTree, nid);
      if (path) {
        // Skip the document root name, join remaining with " / "
        map.set(nid, path.slice(1).join(' / '));
      }
    }
    return map;
  }, [documentTree, findings]);

  const handlePreview = useCallback((nodeId: string, nodeName: string) => {
    setPreviewTarget({ nodeId, nodeName });
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden flex flex-col border border-slate-200/80 bg-white shadow-sm" style={{ minHeight: 520 }}>
        <div className="flex items-center gap-1 px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/50">
          {SUB_TABS.map((t) =>
          <div key={t.key} className="px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider text-slate-300">{t.label}</div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-3 text-center">
            <div className="h-6 w-48 rounded bg-gray-200 mx-auto" />
            <div className="h-4 w-64 rounded bg-gray-100 mx-auto" />
          </div>
        </div>
      </div>);

  }

  if (error) {
    return (
      <div className="rounded-xl overflow-hidden flex flex-col border border-slate-200/80 bg-white shadow-sm p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={fetchData} className="ml-3 text-red-600 underline hover:text-red-800">Retry</button>
        </div>
      </div>);

  }

  if (!data || data.categories.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden flex flex-col border border-slate-200/80 bg-white shadow-sm">
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <Component className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No component data found in this file.</p>
          </div>
        </div>
      </div>);

  }

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col border border-slate-200/80 bg-white shadow-sm"
      style={{ minHeight: 520 }}>

      {/* Tab bar — matches ELEMENT ATLAS / DESIGN COMPLIANCE style */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-1">
          {SUB_TABS.map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider transition-colors"
            style={{
              color: activeTab === tab.key ? COLORS.purple : COLORS.dimText,
              background: activeTab === tab.key ? `${COLORS.purple}08` : 'transparent',
              fontWeight: activeTab === tab.key ? 600 : 500
            }}>

              {tab.label}
            </button>
          )}
        </div>
        <span className="text-[10px] text-gray-400">
          {data.categories.length} groups / {data.totals.totalNodes.toLocaleString()} nodes
        </span>
      </div>

      {/* Summary bar */}
      <SummaryBar findings={findings} />

      {/* Dev Readiness health breakdown (only on dev-readiness tab) */}
      {activeTab === 'dev-readiness' &&
      <DevReadinessSummaryPanel data={data} />
      }

      {/* Findings */}
      <FindingsList
        findings={findings}
        fileId={fileId}
        nodePathMap={nodePathMap}
        onViewNode={onViewNode}
        onPreview={handlePreview} />


      {/* Preview image modal */}
      {previewTarget &&
      <PreviewModal
        fileId={fileId}
        nodeId={previewTarget.nodeId}
        nodeName={previewTarget.nodeName}
        onClose={() => setPreviewTarget(null)} />

      }
    </div>);

}

export default ComponentCoverageInsights;