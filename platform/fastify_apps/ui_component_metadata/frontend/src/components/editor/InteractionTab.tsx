/**
 * Tab 4: Interactivity & Execution Loop
 * Event triggers with interrupt toggle, tool mapping
 */

import { SectionHeader, Field, Input, Select, Toggle, Textarea, AddBtn, RemoveBtn, Card } from "./shared";
import type { EditorState } from "./types";
import { TRIGGER_EVENTS, makeTrigger } from "./types";

interface Props {
  state: EditorState;
  update: (key: string, val: unknown) => void;
}

export function InteractionTab({ state, update }: Props) {
  const updateTrigger = (id: string, key: string, val: unknown) =>
    update("triggers", state.triggers.map((t) => (t.id === id ? { ...t, [key]: val } : t)));
  const addTrigger = () => update("triggers", [...state.triggers, makeTrigger()]);
  const removeTrigger = (id: string) => update("triggers", state.triggers.filter((t) => t.id !== id));

  return (
    <div>
      <SectionHeader
        title="Interactivity & Execution Loop"
        subtitle="Bidirectional binding — mapping user gestures back into the agent's conversational thread"
      />

      <Field label="Actionable Event Triggers">
        <div className="space-y-3">
          {state.triggers.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start gap-3">
                <div>
                  <Select
                    value={t.event}
                    onChange={(v) => updateTrigger(t.id, "event", v)}
                    options={TRIGGER_EVENTS}
                    className="w-auto"
                  />
                  <div className="mt-2">
                    <Toggle
                      checked={t.interrupt}
                      onChange={(v) => updateTrigger(t.id, "interrupt", v)}
                      label="Interrupt generation"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={t.description}
                    onChange={(v) => updateTrigger(t.id, "description", v)}
                    placeholder="Describe what happens when this event fires..."
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">→ TOOL</span>
                    <Input
                      value={t.toolMapping}
                      onChange={(v) => updateTrigger(t.id, "toolMapping", v)}
                      placeholder="tool_name_to_invoke"
                      mono
                    />
                  </div>
                </div>
                <RemoveBtn onClick={() => removeTrigger(t.id)} />
              </div>
              {t.interrupt && (
                <div className="mt-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-500">
                  This trigger halts LLM generation stream immediately
                </div>
              )}
            </Card>
          ))}
          <AddBtn onClick={addTrigger} label="Add event trigger" />
        </div>
      </Field>
    </div>
  );
}
