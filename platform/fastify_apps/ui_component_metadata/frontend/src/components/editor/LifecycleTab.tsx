/**
 * Tab 3: Temporal State & Lifecycle
 * Mount prerequisite, stream mutable, lifecycle phase definitions
 */

import { SectionHeader, Field, Input, Select, Toggle, Textarea, AddBtn, RemoveBtn, Card, Badge } from "./shared";
import type { EditorState } from "./types";
import { LIFECYCLE_EVENTS, MOUNT_PREREQS, makeLifecycle } from "./types";

const PHASE_COLORS: Record<string, string> = {
  onMount: "#10b981",
  onUpdate: "#6366f1",
  onUnmount: "#ef4444",
  onStream: "#f59e0b",
  onResolved: "#22d3ee",
  onError: "#f97316",
};

interface Props {
  state: EditorState;
  update: (key: string, val: unknown) => void;
}

export function LifecycleTab({ state, update }: Props) {
  const updateLC = (id: string, key: string, val: unknown) =>
    update("lifecycles", state.lifecycles.map((l) => (l.id === id ? { ...l, [key]: val } : l)));
  const addLC = () => update("lifecycles", [...state.lifecycles, makeLifecycle()]);
  const removeLC = (id: string) => update("lifecycles", state.lifecycles.filter((l) => l.id !== id));

  return (
    <div>
      <SectionHeader
        title="Temporal State & Lifecycle"
        subtitle="How the component exists in time — mounting prerequisites, streaming behavior, and cleanup protocols"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Mount Prerequisite
          </p>
          <Select
            value={state.mountPrereq}
            onChange={(v) => update("mountPrereq", v)}
            options={MOUNT_PREREQS}
          />
          <p className="text-[11px] text-slate-400 mt-2">What must be ready before this mounts?</p>
        </Card>
        <Card>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Stream Mutable
          </p>
          <Toggle
            checked={state.streamMutable}
            onChange={(v) => update("streamMutable", v)}
            label="Supports SSE partial updates"
          />
          <p className="text-[11px] text-slate-400 mt-2">Can the component update incrementally?</p>
        </Card>
        <Card>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
            ARIA Topography
          </p>
          <Input
            value={state.ariaRole}
            onChange={(v) => update("ariaRole", v)}
            placeholder="form, widget, dialog..."
          />
          <div className="mt-1.5">
            <Input
              value={state.ariaLabel}
              onChange={(v) => update("ariaLabel", v)}
              placeholder="aria-label value"
            />
          </div>
        </Card>
      </div>

      <Field label="Lifecycle Phase Definitions">
        <div className="space-y-3">
          {state.lifecycles.map((l) => {
            const color = PHASE_COLORS[l.phase] ?? "#888";
            return (
              <Card key={l.id}>
                <div className="flex items-start gap-3">
                  <Select
                    value={l.phase}
                    onChange={(v) => updateLC(l.id, "phase", v)}
                    options={LIFECYCLE_EVENTS}
                    className="w-auto"
                  />
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={l.description}
                      onChange={(v) => updateLC(l.id, "description", v)}
                      placeholder="Describe what happens in this phase..."
                      rows={2}
                    />
                    {(l.phase === "onUnmount" || l.phase === "onError") && (
                      <input
                        value={l.cleanup}
                        onChange={(e) => updateLC(l.id, "cleanup", e.target.value)}
                        placeholder="Cleanup: cancel XHR, close WS, clear timer..."
                        className="w-full bg-red-50 border border-dashed border-red-200 rounded-lg px-3 py-1.5 text-[12px] text-red-500 outline-none focus:border-red-400 transition-colors placeholder:text-red-300"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Toggle
                      checked={l.async}
                      onChange={(v) => updateLC(l.id, "async", v)}
                      label="async"
                    />
                    <RemoveBtn onClick={() => removeLC(l.id)} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <code className="text-[11px] font-mono" style={{ color }}>
                    {l.phase}
                  </code>
                  {l.async && <Badge label="ASYNC" color="#6366f1" />}
                </div>
              </Card>
            );
          })}
          <AddBtn onClick={addLC} label="Add lifecycle phase" />
        </div>
      </Field>
    </div>
  );
}
