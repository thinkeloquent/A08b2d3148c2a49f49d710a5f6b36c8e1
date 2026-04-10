import type { DocsViewProps, CliCommand } from './types';
import { TermIcon, ChevIcon } from './icons';

const DEFAULT_CLI: CliCommand[] = [
  { cmd: 'skillset list', desc: 'List all available skills' },
  { cmd: 'skillset install <ns>/<name>', desc: 'Install a skill' },
  { cmd: 'skillset remove <ns>/<name>', desc: 'Uninstall a skill' },
  { cmd: 'skillset info <ns>/<name>', desc: 'Show skill details' },
  { cmd: 'skillset update', desc: 'Update all installed skills' },
];

const DEFAULT_SCHEMA = `interface Skill {
  id: string;
  name: string;          // kebab-case
  ns: string;            // namespace scope
  version: string;       // semver
  desc: string;
  triggers: string[];    // activation phrases
  sys: string[];         // system deps
  tools: string[];       // agent tools
  tags: string[];
  dl: number;
  stars: number;
  status: "stable"|"beta";
  updated: string;
}`;

export function DocsView({ cliCommands, schemaText, className = '' }: DocsViewProps) {
  const cmds = cliCommands ?? DEFAULT_CLI;
  const schema = schemaText ?? DEFAULT_SCHEMA;

  return (
    <div className={`flex-1 overflow-y-auto bg-[var(--bg)] p-6 ${className}`}>
      <div className="mx-auto max-w-2xl">
        {/* Title */}
        <h2 className="mb-1 text-lg font-semibold text-[var(--text-1)]">Documentation</h2>
        <p className="mb-6 text-[13px] text-[var(--text-2)]">
          CLI reference and skill schema for the SkillSet registry.
        </p>

        {/* CLI Commands */}
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[var(--text-1)]">
            <TermIcon size={14} />
            CLI Commands
          </div>
          <div className="flex flex-col gap-1.5">
            {cmds.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <ChevIcon size={8} className="text-[var(--accent)]" />
                <code className="font-mono text-[12px] font-medium text-[var(--text-1)]">
                  {c.cmd}
                </code>
                <span className="ml-auto text-[11px] text-[var(--text-3)]">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schema */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 text-[13px] font-semibold text-[var(--text-1)]">Skill Schema</div>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-[12px] leading-relaxed text-green-400">
            {schema}
          </pre>
        </div>
      </div>
    </div>
  );
}
