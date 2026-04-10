/**
 * Tab 6: Spatial & Topological Mapping
 * Composition parent/children, viewport constraints, ARIA summary
 */

import { SectionHeader, Field, Input, Textarea, Card } from "./shared";
import type { EditorState } from "./types";
import { ATOM_COLORS } from "./types";

interface Props {
  state: EditorState;
  update: (key: string, val: unknown) => void;
}

export function SpatialTab({ state, update }: Props) {
  return (
    <div>
      <SectionHeader
        title="Spatial & Topological Mapping"
        subtitle="Composition constraints and ARIA topography for deterministic layout orchestration"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Allowed Parent Contexts" hint="Components that can contain this one">
          <Textarea
            value={state.compositionParent}
            onChange={(v) => update("compositionParent", v)}
            placeholder="ModalOrganism, PageTemplate, ..."
            rows={3}
            mono
          />
        </Field>
        <Field label="Expected Children Components" hint="Sub-components this organism orchestrates">
          <Textarea
            value={state.compositionChildren}
            onChange={(v) => update("compositionChildren", v)}
            placeholder="EmailInput, PasswordInput, SubmitButton..."
            rows={3}
            mono
          />
        </Field>
      </div>

      <Field label="Viewport Constraints">
        <Input
          value={state.viewport}
          onChange={(v) => update("viewport", v)}
          placeholder="e.g. max-width: 480px, full-screen mobile, sticky header"
        />
      </Field>

      <Field label="ARIA Topography Summary">
        <Card>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <code className="text-[11px] text-slate-400 w-28 flex-shrink-0 font-mono">role</code>
              <code className="text-[12px] text-indigo-600 font-mono">
                "{state.ariaRole || "—"}"
              </code>
            </div>
            <div className="flex gap-3 items-center">
              <code className="text-[11px] text-slate-400 w-28 flex-shrink-0 font-mono">aria-label</code>
              <code className="text-[12px] text-indigo-600 font-mono">
                "{state.ariaLabel || "—"}"
              </code>
            </div>
            <div className="flex gap-3 items-center">
              <code className="text-[11px] text-slate-400 w-28 flex-shrink-0 font-mono">atom-level</code>
              <code className="text-[12px] font-mono" style={{ color: ATOM_COLORS[state.atomLevel] }}>
                "{state.atomLevel}"
              </code>
            </div>
          </div>
        </Card>
      </Field>
    </div>
  );
}
