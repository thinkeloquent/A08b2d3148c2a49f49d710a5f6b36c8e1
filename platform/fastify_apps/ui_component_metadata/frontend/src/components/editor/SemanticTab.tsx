/**
 * Tab 1: Semantic Identity
 * Name, atom level, aliases, contextual directive, few-shot invocation pairs
 */

import { SectionHeader, Field, Input, Textarea, AddBtn, RemoveBtn, Card } from "./shared";
import type { EditorState } from "./types";
import { ATOM_LEVELS, ATOM_COLORS, makeAlias, makeFewShot } from "./types";

interface Props {
  state: EditorState;
  update: (key: string, val: unknown) => void;
}

export function SemanticTab({ state, update }: Props) {
  const updateAlias = (id: string, val: string) =>
    update("aliases", state.aliases.map((a) => (a.id === id ? { ...a, value: val } : a)));
  const addAlias = () => update("aliases", [...state.aliases, makeAlias()]);
  const removeAlias = (id: string) => update("aliases", state.aliases.filter((a) => a.id !== id));

  const updateShot = (id: string, key: string, val: string) =>
    update("fewShots", state.fewShots.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  const addShot = () => update("fewShots", [...state.fewShots, makeFewShot()]);
  const removeShot = (id: string) => update("fewShots", state.fewShots.filter((s) => s.id !== id));

  return (
    <div>
      <SectionHeader
        title="Semantic Identity"
        subtitle="The cognitive fingerprint of this component — how the agent understands its purpose in the latent space"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Component Name">
          <Input
            value={state.name}
            onChange={(v) => update("name", v)}
            placeholder="UserAuthenticationForm"
          />
        </Field>
        <Field label="Atomic Design Level">
          <div className="flex gap-2 flex-wrap mt-0.5">
            {ATOM_LEVELS.map((l) => {
              const selected = state.atomLevel === l;
              const color = ATOM_COLORS[l];
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => update("atomLevel", l)}
                  style={selected ? { background: `${color}18`, color, borderColor: `${color}88` } : {}}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${
                    selected ? "" : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <Field
        label="Semantic Aliases"
        hint="Natural language synonyms the LLM uses to probabilistically trigger this component"
      >
        <div className="space-y-2">
          {state.aliases.map((a) => (
            <div key={a.id} className="flex gap-2">
              <Input
                value={a.value}
                onChange={(v) => updateAlias(a.id, v)}
                placeholder="SignIn, Login, AuthModal..."
              />
              <RemoveBtn onClick={() => removeAlias(a.id)} />
            </div>
          ))}
          <AddBtn onClick={addAlias} label="Add alias" />
        </div>
      </Field>

      <Field
        label="Contextual Directive"
        hint="Plain-English instructions for the agent: when to use it, when NOT to use it"
      >
        <Textarea
          value={state.semanticDescription}
          onChange={(v) => update("semanticDescription", v)}
          placeholder="Use this component when... Do NOT use for..."
          rows={4}
        />
      </Field>

      <Field
        label="Few-Shot Invocation Pairs"
        hint="Ground the LLM with concrete prompt → payload examples to reduce hallucination"
      >
        <div className="space-y-3">
          {state.fewShots.map((s, i) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-indigo-500 font-semibold uppercase tracking-wider">
                  Example {i + 1}
                </span>
                <RemoveBtn onClick={() => removeShot(s.id)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="User Prompt →">
                  <Textarea
                    value={s.prompt}
                    onChange={(v) => updateShot(s.id, "prompt", v)}
                    placeholder='"Show me the login screen"'
                    rows={2}
                  />
                </Field>
                <Field label="→ Agent Payload">
                  <Textarea
                    value={s.payload}
                    onChange={(v) => updateShot(s.id, "payload", v)}
                    placeholder='{"mode": "standard"}'
                    rows={2}
                    mono
                  />
                </Field>
              </div>
            </Card>
          ))}
          <AddBtn onClick={addShot} label="Add example pair" />
        </div>
      </Field>
    </div>
  );
}
