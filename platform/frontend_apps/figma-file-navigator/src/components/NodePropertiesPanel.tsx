/**
 * Right panel showing styles, variables, and properties for the selected node.
 * Fetches detailed node data from the Figma API /nodes endpoint.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useFileTree } from './FileTreeContext';
import { fetchFigmaFileNodes } from '@/api/figma';
import type { FigmaNode, FigmaColor, FigmaPaint, FigmaEffect } from '@/api/figma';

/* ─── Helpers ─── */

function rgbaToHex(c: FigmaColor): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
}

function rgbaToString(c: FigmaColor): string {
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a.toFixed(2)})`;
}

function round(n: number, d = 1): string {
  return Number(n.toFixed(d)).toString();
}

/* ─── Collapsible section ─── */

function Section({ title, count, children, defaultOpen = true }: {
  title: string;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
      >
        <svg
          width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-150 text-slate-400 ${open ? 'rotate-90' : ''}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{title}</span>
        {count !== undefined && (
          <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
            {count}
          </span>
        )}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

/* ─── Property row ─── */

function PropRow({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1 gap-2">
      <span className="text-[11px] text-slate-400 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        {color && (
          <span
            className="w-3 h-3 rounded-sm border border-slate-200 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="text-[11px] text-slate-700 font-mono truncate">{value}</span>
      </div>
    </div>
  );
}

/* ─── Fill / Stroke renderer ─── */

function PaintList({ paints, label }: { paints: FigmaPaint[]; label: string }) {
  const visible = paints.filter((p) => p.visible !== false);
  if (!visible.length) return null;

  return (
    <Section title={label} count={visible.length}>
      <div className="space-y-2">
        {visible.map((paint, i) => {
          if (paint.type === 'SOLID' && paint.color) {
            const hex = rgbaToHex(paint.color);
            const alpha = paint.opacity ?? paint.color.a;
            return (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded border border-slate-200 flex-shrink-0"
                  style={{ backgroundColor: rgbaToString({ ...paint.color, a: alpha }) }}
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-slate-700">{hex.toUpperCase()}</div>
                  {alpha < 1 && (
                    <div className="text-[10px] text-slate-400">{Math.round(alpha * 100)}% opacity</div>
                  )}
                </div>
              </div>
            );
          }
          if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_ANGULAR') {
            return (
              <div key={i} className="space-y-1">
                <div className="text-[11px] text-slate-500">{paint.type.replace('GRADIENT_', '').toLowerCase()} gradient</div>
                {paint.gradientStops && (
                  <div className="flex gap-0.5 h-4 rounded overflow-hidden border border-slate-200">
                    {paint.gradientStops.map((stop, si) => (
                      <span
                        key={si}
                        className="flex-1"
                        style={{ backgroundColor: rgbaToString(stop.color) }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (paint.type === 'IMAGE') {
            return (
              <div key={i} className="text-[11px] text-slate-500">
                Image fill {paint.scaleMode && <span className="text-slate-400">({paint.scaleMode})</span>}
              </div>
            );
          }
          return <div key={i} className="text-[11px] text-slate-500">{paint.type}</div>;
        })}
      </div>
    </Section>
  );
}

/* ─── Effects renderer ─── */

function EffectList({ effects }: { effects: FigmaEffect[] }) {
  const visible = effects.filter((e) => e.visible !== false);
  if (!visible.length) return null;

  return (
    <Section title="Effects" count={visible.length}>
      <div className="space-y-2">
        {visible.map((effect, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              {effect.color && (
                <span
                  className="w-3 h-3 rounded-sm border border-slate-200 flex-shrink-0"
                  style={{ backgroundColor: rgbaToString(effect.color) }}
                />
              )}
              <span className="text-[11px] text-slate-600 font-medium">
                {effect.type.replace(/_/g, ' ').toLowerCase()}
              </span>
            </div>
            <div className="flex gap-3 text-[10px] text-slate-400">
              {effect.radius !== undefined && <span>radius: {effect.radius}</span>}
              {effect.spread !== undefined && <span>spread: {effect.spread}</span>}
              {effect.offset && <span>offset: {effect.offset.x}, {effect.offset.y}</span>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Layout properties ─── */

function LayoutSection({ node }: { node: FigmaNode }) {
  if (!node.layoutMode) return null;

  return (
    <Section title="Auto Layout">
      <div className="space-y-0.5">
        <PropRow label="Direction" value={node.layoutMode === 'HORIZONTAL' ? 'Row' : 'Column'} />
        {node.itemSpacing !== undefined && <PropRow label="Gap" value={`${node.itemSpacing}px`} />}
        {(node.paddingTop !== undefined || node.paddingLeft !== undefined) && (
          <PropRow
            label="Padding"
            value={`${node.paddingTop ?? 0} ${node.paddingRight ?? 0} ${node.paddingBottom ?? 0} ${node.paddingLeft ?? 0}`}
          />
        )}
        {node.primaryAxisAlignItems && <PropRow label="Main Align" value={node.primaryAxisAlignItems} />}
        {node.counterAxisAlignItems && <PropRow label="Cross Align" value={node.counterAxisAlignItems} />}
        {node.primaryAxisSizingMode && <PropRow label="Main Size" value={node.primaryAxisSizingMode} />}
        {node.counterAxisSizingMode && <PropRow label="Cross Size" value={node.counterAxisSizingMode} />}
      </div>
    </Section>
  );
}

/* ─── Typography ─── */

function TypographySection({ node }: { node: FigmaNode }) {
  if (!node.style) return null;
  const s = node.style;

  return (
    <Section title="Typography">
      <div className="space-y-0.5">
        {s.fontFamily && <PropRow label="Font" value={s.fontFamily} />}
        {s.fontWeight !== undefined && <PropRow label="Weight" value={s.fontWeight} />}
        {s.fontSize !== undefined && <PropRow label="Size" value={`${s.fontSize}px`} />}
        {s.lineHeightPx !== undefined && <PropRow label="Line Height" value={`${round(s.lineHeightPx)}px`} />}
        {s.letterSpacing !== undefined && s.letterSpacing !== 0 && (
          <PropRow label="Letter Spacing" value={`${round(s.letterSpacing)}px`} />
        )}
        {s.textAlignHorizontal && <PropRow label="Align" value={s.textAlignHorizontal} />}
        {s.textDecoration && s.textDecoration !== 'NONE' && <PropRow label="Decoration" value={s.textDecoration} />}
        {s.textCase && s.textCase !== 'ORIGINAL' && <PropRow label="Case" value={s.textCase} />}
      </div>
    </Section>
  );
}

/* ─── Style references ─── */

function StyleRefsSection({ styles }: { styles: Record<string, string> }) {
  const entries = Object.entries(styles);
  if (!entries.length) return null;

  return (
    <Section title="Styles" count={entries.length}>
      <div className="space-y-0.5">
        {entries.map(([key, id]) => (
          <PropRow key={key} label={key} value={id} />
        ))}
      </div>
    </Section>
  );
}

/* ─── Bound variables ─── */

function BoundVariablesSection({ vars }: { vars: Record<string, unknown> }) {
  const entries = Object.entries(vars);
  if (!entries.length) return null;

  return (
    <Section title="Variables" count={entries.length}>
      <div className="space-y-1">
        {entries.map(([prop, binding]) => {
          const bindingObj = binding as any;
          const varId = bindingObj?.id ?? bindingObj?.value?.id ?? JSON.stringify(binding);
          return (
            <div key={prop} className="flex items-start justify-between gap-2 py-0.5">
              <span className="text-[11px] text-slate-400 flex-shrink-0">{prop}</span>
              <span className="text-[11px] text-purple-600 font-mono truncate">{String(varId)}</span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ─── Component properties ─── */

function ComponentPropsSection({ props }: { props: Record<string, { type: string; value: unknown }> }) {
  const entries = Object.entries(props);
  if (!entries.length) return null;

  return (
    <Section title="Component Properties" count={entries.length}>
      <div className="space-y-1">
        {entries.map(([name, prop]) => (
          <div key={name} className="flex items-start justify-between gap-2 py-0.5">
            <div className="min-w-0">
              <div className="text-[11px] text-slate-600 font-medium truncate">{name}</div>
              <div className="text-[10px] text-slate-400">{prop.type}</div>
            </div>
            <span className="text-[11px] text-slate-700 font-mono truncate">{String(prop.value)}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Export settings ─── */

function ExportSection({ exports }: { exports: Array<{ suffix: string; format: string; constraint: { type: string; value: number } }> }) {
  if (!exports.length) return null;

  return (
    <Section title="Export" count={exports.length}>
      <div className="space-y-0.5">
        {exports.map((exp, i) => (
          <PropRow key={i} label={exp.format} value={`${exp.constraint.value}x${exp.suffix ? ` (${exp.suffix})` : ''}`} />
        ))}
      </div>
    </Section>
  );
}

/* ─── Main panel ─── */

export function NodePropertiesPanel() {
  const { fileKey, selected, flat } = useFileTree();
  const [nodeDetail, setNodeDetail] = useState<FigmaNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, FigmaNode>>(new Map());

  const selectedFlat = selected ? flat.find((n) => n.id === selected) : null;

  useEffect(() => {
    if (!selected || !fileKey) {
      setNodeDetail(null);
      setError(null);
      return;
    }

    const cached = cacheRef.current.get(selected);
    if (cached) {
      setNodeDetail(cached);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNodeDetail(null);

    fetchFigmaFileNodes(fileKey, [selected])
      .then((res) => {
        if (cancelled) return;
        const entry = res.nodes?.[selected];
        if (entry?.document) {
          cacheRef.current.set(selected, entry.document);
          setNodeDetail(entry.document);
        } else {
          setError('Node data not available');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load node');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [selected, fileKey]);

  if (!selected || !selectedFlat) return null;

  return (
    <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{selectedFlat.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold uppercase">
            {selectedFlat.figmaType || selectedFlat.type}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{selectedFlat.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {error && !isLoading && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        )}

        {nodeDetail && !isLoading && (
          <>
            {/* Dimensions & position */}
            {nodeDetail.absoluteBoundingBox && (
              <Section title="Layout">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <PropRow label="X" value={`${round(nodeDetail.absoluteBoundingBox.x)}`} />
                  <PropRow label="Y" value={`${round(nodeDetail.absoluteBoundingBox.y)}`} />
                  <PropRow label="W" value={`${round(nodeDetail.absoluteBoundingBox.width)}`} />
                  <PropRow label="H" value={`${round(nodeDetail.absoluteBoundingBox.height)}`} />
                </div>
                {nodeDetail.opacity !== undefined && nodeDetail.opacity < 1 && (
                  <PropRow label="Opacity" value={`${Math.round(nodeDetail.opacity * 100)}%`} />
                )}
                {nodeDetail.cornerRadius !== undefined && (
                  <PropRow label="Radius" value={`${nodeDetail.cornerRadius}px`} />
                )}
                {nodeDetail.rectangleCornerRadii && !nodeDetail.cornerRadius && (
                  <PropRow label="Radius" value={nodeDetail.rectangleCornerRadii.join(' ')} />
                )}
                {nodeDetail.blendMode && nodeDetail.blendMode !== 'PASS_THROUGH' && (
                  <PropRow label="Blend" value={nodeDetail.blendMode} />
                )}
                {nodeDetail.clipsContent !== undefined && (
                  <PropRow label="Clip" value={nodeDetail.clipsContent ? 'Yes' : 'No'} />
                )}
                {nodeDetail.constraints && (
                  <PropRow label="Constraints" value={`${nodeDetail.constraints.horizontal} / ${nodeDetail.constraints.vertical}`} />
                )}
              </Section>
            )}

            {/* Auto-layout */}
            <LayoutSection node={nodeDetail} />

            {/* Fills */}
            {nodeDetail.fills?.length ? <PaintList paints={nodeDetail.fills} label="Fill" /> : null}

            {/* Strokes */}
            {nodeDetail.strokes?.length ? (
              <>
                <PaintList paints={nodeDetail.strokes} label="Stroke" />
                {(nodeDetail.strokeWeight !== undefined || nodeDetail.strokeAlign) && (
                  <div className="px-4 pb-2 space-y-0.5">
                    {nodeDetail.strokeWeight !== undefined && (
                      <PropRow label="Weight" value={`${nodeDetail.strokeWeight}px`} />
                    )}
                    {nodeDetail.strokeAlign && <PropRow label="Align" value={nodeDetail.strokeAlign} />}
                    {nodeDetail.strokeDashes?.length ? (
                      <PropRow label="Dashes" value={nodeDetail.strokeDashes.join(', ')} />
                    ) : null}
                  </div>
                )}
              </>
            ) : null}

            {/* Effects */}
            {nodeDetail.effects?.length ? <EffectList effects={nodeDetail.effects} /> : null}

            {/* Typography */}
            <TypographySection node={nodeDetail} />

            {/* Text content */}
            {nodeDetail.characters && (
              <Section title="Text Content">
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap break-words leading-relaxed bg-slate-50 rounded p-2">
                  {nodeDetail.characters}
                </p>
              </Section>
            )}

            {/* Style references */}
            {nodeDetail.styles && Object.keys(nodeDetail.styles).length > 0 && (
              <StyleRefsSection styles={nodeDetail.styles} />
            )}

            {/* Bound variables */}
            {nodeDetail.boundVariables && Object.keys(nodeDetail.boundVariables).length > 0 && (
              <BoundVariablesSection vars={nodeDetail.boundVariables} />
            )}

            {/* Component properties */}
            {nodeDetail.componentProperties && Object.keys(nodeDetail.componentProperties).length > 0 && (
              <ComponentPropsSection props={nodeDetail.componentProperties} />
            )}

            {/* Exports */}
            {nodeDetail.exportSettings?.length ? <ExportSection exports={nodeDetail.exportSettings} /> : null}

            {/* Layout grids */}
            {nodeDetail.layoutGrids?.length ? (
              <Section title="Layout Grids" count={nodeDetail.layoutGrids.length}>
                <div className="space-y-1">
                  {nodeDetail.layoutGrids.filter((g) => g.visible !== false).map((grid, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-[11px] text-slate-600 font-medium">{grid.pattern.toLowerCase()}</div>
                      <div className="flex gap-3 text-[10px] text-slate-400">
                        <span>size: {grid.sectionSize}</span>
                        {grid.count !== undefined && <span>count: {grid.count}</span>}
                        {grid.gutterSize !== undefined && <span>gutter: {grid.gutterSize}</span>}
                        {grid.offset !== undefined && <span>offset: {grid.offset}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
