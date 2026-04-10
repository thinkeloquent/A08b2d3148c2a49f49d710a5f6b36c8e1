/**
 * Tab 5: Ecosystem Dependencies
 * Service bindings (operationId, HTTP method, endpoint, auth scope, fallback)
 */

import { SectionHeader, Field, Input, AddBtn, RemoveBtn, Card } from "./shared";
import type { EditorState } from "./types";
import { HTTP_METHODS, makeDep } from "./types";

const METHOD_COLORS: Record<string, string> = {
  GET: "#10b981",
  POST: "#6366f1",
  PUT: "#f59e0b",
  PATCH: "#22d3ee",
  DELETE: "#ef4444",
};

interface Props {
  state: EditorState;
  update: (key: string, val: unknown) => void;
}

export function DependenciesTab({ state, update }: Props) {
  const updateDep = (id: string, key: string, val: string) =>
    update("deps", state.deps.map((d) => (d.id === id ? { ...d, [key]: val } : d)));
  const addDep = () => update("deps", [...state.deps, makeDep()]);
  const removeDep = (id: string) => update("deps", state.deps.filter((d) => d.id !== id));

  return (
    <div>
      <SectionHeader
        title="Ecosystem Dependencies"
        subtitle="External service bindings the agent must resolve before the component can render"
      />

      <Field label="Service Bindings (OpenAPI Operations)">
        <div className="space-y-3">
          {state.deps.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      value={d.operationId}
                      onChange={(v) => updateDep(d.id, "operationId", v)}
                      placeholder="operationId"
                      mono
                    />
                    <div className="flex gap-2">
                      <select
                        value={d.method}
                        onChange={(e) => updateDep(d.id, "method", e.target.value)}
                        style={{ color: METHOD_COLORS[d.method], borderColor: `${METHOD_COLORS[d.method]}44` }}
                        className="bg-white border rounded-lg px-2 py-1.5 text-[12px] font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-200 flex-shrink-0"
                      >
                        {HTTP_METHODS.map((m) => (
                          <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={d.endpoint}
                        onChange={(v) => updateDep(d.id, "endpoint", v)}
                        placeholder="/api/v1/..."
                        mono
                      />
                    </div>
                    <Input
                      value={d.authScope}
                      onChange={(v) => updateDep(d.id, "authScope", v)}
                      placeholder="OAuth: read:crm"
                      mono
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex-shrink-0">Fallback component:</span>
                    <Input
                      value={d.fallback}
                      onChange={(v) => updateDep(d.id, "fallback", v)}
                      placeholder="StaticFallbackCard"
                      mono
                    />
                  </div>
                </div>
                <RemoveBtn onClick={() => removeDep(d.id)} />
              </div>
            </Card>
          ))}
          <AddBtn onClick={addDep} label="Add service binding" />
        </div>
      </Field>
    </div>
  );
}
