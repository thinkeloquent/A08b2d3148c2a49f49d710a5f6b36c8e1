/**
 * Tab 7: Full Metadata Schema Preview
 * JSON preview with syntax highlighting and copy button
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { SectionHeader, Badge } from "./shared";
import type { EditorState } from "./types";
import { ATOM_COLORS } from "./types";

interface Props {
  state: EditorState;
}

export function PreviewTab({ state }: Props) {
  const [copied, setCopied] = useState(false);

  const fullSchema = {
    $id: `ui://components/${state.name || "Component"}`,
    $schema: "https://cognitive-ui.schema/v1",
    semantic: {
      name: state.name,
      atomLevel: state.atomLevel,
      aliases: state.aliases.map((a) => a.value).filter(Boolean),
      semanticDescription: state.semanticDescription,
      fewShots: state.fewShots
        .filter((s) => s.prompt || s.payload)
        .map((s) => ({ prompt: s.prompt, payload: s.payload })),
    },
    structuralContract: {
      inputSchema: {
        required: state.fields.filter((f) => f.required).map((f) => f.key).filter(Boolean),
        properties: Object.fromEntries(
          state.fields.filter((f) => f.key).map((f) => [
            f.key,
            {
              type: f.type,
              description: f.description,
              ...(f.type === "enum" && f.constraint
                ? { enum: f.constraint.split("|").map((s) => s.trim()) }
                : {}),
            },
          ]),
        ),
      },
      outputSchema: state.outputSchema,
    },
    lifecycle: {
      mountPrerequisite: state.mountPrereq,
      streamMutable: state.streamMutable,
      phases: state.lifecycles
        .filter((l) => l.description || l.phase)
        .map((l) => ({
          phase: l.phase,
          async: l.async,
          description: l.description,
          cleanup: l.cleanup || undefined,
        })),
    },
    interactivity: {
      triggers: state.triggers
        .filter((t) => t.event || t.description)
        .map((t) => ({
          event: t.event,
          interrupt: t.interrupt,
          toolMapping: t.toolMapping,
          description: t.description,
        })),
      aria: { role: state.ariaRole, label: state.ariaLabel },
    },
    dependencies: {
      services: state.deps
        .filter((d) => d.operationId || d.endpoint)
        .map((d) => ({
          operationId: d.operationId,
          method: d.method,
          endpoint: d.endpoint,
          authScope: d.authScope || undefined,
          fallback: d.fallback || undefined,
        })),
    },
    spatial: {
      compositionParent: state.compositionParent,
      compositionChildren: state.compositionChildren,
      viewport: state.viewport,
    },
  };

  const json = JSON.stringify(fullSchema, null, 2);

  const highlighted = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"([^"]+)":/g, '<span class="text-sky-600">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-amber-600">"$1"</span>')
    .replace(/: (true|false)/g, ': <span class="text-indigo-600">$1</span>')
    .replace(/: (\d+)/g, ': <span class="text-emerald-600">$1</span>')
    .replace(/: null/g, ': <span class="text-slate-400">null</span>');

  const copy = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <SectionHeader
        title="Full Metadata Schema"
        subtitle="Machine-readable cognitive interface definition — ready for LangChain, Vercel AI SDK, CopilotKit"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <Badge label="JSON Schema" color="#6366f1" />
          <Badge label={state.atomLevel} color={ATOM_COLORS[state.atomLevel]} />
          <Badge label={`${state.fields.length} props`} color="#6366f1" />
          {state.streamMutable && <Badge label="SSE-MUTABLE" color="#10b981" />}
        </div>
        <button
          type="button"
          onClick={copy}
          className={`flex items-center gap-1.5 text-[12px] border rounded-lg px-3 py-1.5 transition-all ${
            copied
              ? "text-emerald-600 border-emerald-200 bg-emerald-50"
              : "text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy Schema"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto max-h-[520px]">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[11px] text-slate-400 font-mono">
            {state.name || "Component"}.meta.json
          </span>
        </div>
        <pre
          className="p-4 text-[11px] font-mono leading-relaxed overflow-auto text-slate-700"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}
