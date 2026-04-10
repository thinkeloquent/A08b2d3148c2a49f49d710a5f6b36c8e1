/**
 * Tab 2: Structural Data Contract
 * Input schema props, output schema, live JSON schema preview
 */

import { SectionHeader, Field, Input, Textarea, Select, Toggle, AddBtn, RemoveBtn } from "./shared";
import type { EditorState } from "./types";
import { FIELD_TYPES, makeField } from "./types";

interface Props {
  state: EditorState;
  update: (key: string, val: unknown) => void;
}

export function SchemaTab({ state, update }: Props) {
  const updateField = (id: string, key: string, val: unknown) =>
    update("fields", state.fields.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  const addField = () => update("fields", [...state.fields, makeField()]);
  const removeField = (id: string) => update("fields", state.fields.filter((f) => f.id !== id));

  const jsonPreview = JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: state.name || "Component",
      type: "object",
      required: state.fields.filter((f) => f.required).map((f) => f.key).filter(Boolean),
      properties: Object.fromEntries(
        state.fields.filter((f) => f.key).map((f) => [
          f.key,
          {
            type: f.type === "enum" ? "string" : f.type,
            description: f.description || undefined,
            ...(f.type === "enum" && f.constraint
              ? { enum: f.constraint.split("|").map((s) => s.trim()) }
              : {}),
          },
        ]),
      ),
    },
    null,
    2,
  );

  return (
    <div>
      <SectionHeader
        title="Structural Data Contract"
        subtitle="Mathematical boundaries defining exactly what the LLM can inject — preventing hallucinated props"
      />

      <Field label="Input Schema — Props Definition">
        <div className="space-y-2">
          {/* Column headers */}
          {state.fields.length > 0 && (
            <div className="grid grid-cols-12 gap-2 px-1">
              <span className="col-span-3 text-[10px] text-slate-400 font-semibold uppercase">Key</span>
              <span className="col-span-2 text-[10px] text-slate-400 font-semibold uppercase">Type</span>
              <span className="col-span-3 text-[10px] text-slate-400 font-semibold uppercase">Constraint</span>
              <span className="col-span-3 text-[10px] text-slate-400 font-semibold uppercase">Required</span>
              <span className="col-span-1" />
            </div>
          )}

          {state.fields.map((f, i) => (
            <div key={f.id}>
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Input
                    value={f.key}
                    onChange={(v) => updateField(f.id, "key", v)}
                    placeholder={`field_${i + 1}`}
                    mono
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    value={f.type}
                    onChange={(v) => updateField(f.id, "type", v)}
                    options={FIELD_TYPES}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    value={f.constraint}
                    onChange={(v) => updateField(f.id, "constraint", v)}
                    placeholder="enum: a|b, regex, min/max"
                    mono
                  />
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <Toggle
                    checked={f.required}
                    onChange={(v) => updateField(f.id, "required", v)}
                    label="Required"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <RemoveBtn onClick={() => removeField(f.id)} />
                </div>
              </div>
              {/* Description row */}
              <div className="pl-0 mt-0.5 mb-1">
                <input
                  value={f.description}
                  onChange={(e) => updateField(f.id, "description", e.target.value)}
                  placeholder="Field description for the agent..."
                  className="w-full bg-transparent border-b border-slate-100 focus:border-indigo-300 text-[11px] text-slate-400 outline-none py-0.5 px-1 transition-colors placeholder:text-slate-300"
                />
              </div>
            </div>
          ))}
          <AddBtn onClick={addField} label="Add field" />
        </div>
      </Field>

      <Field
        label="Output Schema"
        hint="Shape of the data payload emitted back to the agent upon user interaction"
      >
        <Textarea
          value={state.outputSchema}
          onChange={(v) => update("outputSchema", v)}
          placeholder='{"userId": "string", "token": "string"}'
          rows={4}
          mono
        />
      </Field>

      {/* Live Schema Preview */}
      <Field label="Generated JSON Schema Preview">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto max-h-48">
          <pre className="text-[11px] font-mono text-emerald-600 whitespace-pre">{jsonPreview}</pre>
        </div>
      </Field>
    </div>
  );
}
