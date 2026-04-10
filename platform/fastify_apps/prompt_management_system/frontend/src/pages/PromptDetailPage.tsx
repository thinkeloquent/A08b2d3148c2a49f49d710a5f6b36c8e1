import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePrompt, useVersions, useCreateVersion, useUpdateVersionStatus } from '../hooks/usePrompts';
import type { PromptVersion, Prompt } from '../types';

function ExportPanel({ version, prompt }: { version: PromptVersion; prompt: Prompt }) {
  const [copied, setCopied] = useState(false);
  const exportUrl = `${window.location.origin}/api/prompt-management-system/prompts/${prompt.id}/versions/${version.id}/text${version.status === 'draft' ? '?status=draft' : ''}`;

  const exportPayload = JSON.stringify({
    name: prompt.name,
    slug: prompt.slug,
    version: version.version_number,
    status: version.status,
    export_url: exportUrl,
    template: version.template,
    config: version.config,
    input_schema: version.input_schema,
    variables: version.variables?.map(v => ({
      key: v.key,
      type: v.type,
      description: v.description,
      default_value: v.default_value,
      required: v.required,
    })),
  }, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(exportPayload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const blob = new Blob([exportPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.slug}-v${version.version_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-3 border rounded bg-gray-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">Export JSON</span>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="px-2 py-1 text-xs rounded bg-white border text-gray-700 hover:bg-gray-100">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="px-2 py-1 text-xs rounded bg-white border text-gray-700 hover:bg-gray-100">
            Download
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        Export URL: <code className="bg-white border rounded px-1 py-0.5">{exportUrl}</code>
      </p>
      <pre className="text-xs bg-white border rounded p-2 overflow-auto max-h-48 font-mono">{exportPayload}</pre>
    </div>
  );
}

function ApiPanel({ version, prompt }: { version: PromptVersion; prompt: Prompt }) {
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = `${window.location.origin}/api/prompt-management-system`;
  const getEndpoint = `GET ${baseUrl}/prompts/${prompt.slug}/production`;
  const renderEndpoint = `POST ${baseUrl}/prompts/${prompt.slug}/render`;

  const curlGet = `curl ${baseUrl}/prompts/${prompt.slug}/production`;

  const sampleVars = version.variables?.reduce<Record<string, string>>((acc, v) => {
    acc[v.key] = v.default_value || `<${v.key}>`;
    return acc;
  }, {}) ?? {};

  const renderBody = JSON.stringify({ environment: 'production', variables: sampleVars }, null, 2);
  const curlRender = `curl -X POST ${baseUrl}/prompts/${prompt.slug}/render \\
  -H "Content-Type: application/json" \\
  -d '${renderBody}'`;

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const docsUrl = `/prompts/${prompt.id}/v/${version.version_number}/docs/api`;

  return (
    <div className="mt-3 border rounded bg-gray-50 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Consumer REST API</span>
        <a href={`/apps/prompt-management-system${docsUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
          Open full docs &#8599;
        </a>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">Retrieve deployed prompt</p>
          <button onClick={() => copy(curlGet, 'get')} className="px-2 py-1 text-xs rounded bg-white border text-gray-700 hover:bg-gray-100">
            {copied === 'get' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="text-xs bg-white border rounded p-2 overflow-auto font-mono">{getEndpoint}{'\n\n'}{curlGet}</pre>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500">Render with variables</p>
          <button onClick={() => copy(curlRender, 'render')} className="px-2 py-1 text-xs rounded bg-white border text-gray-700 hover:bg-gray-100">
            {copied === 'render' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="text-xs bg-white border rounded p-2 overflow-auto font-mono">{renderEndpoint}{'\n\n'}{curlRender}</pre>
      </div>

      <p className="text-xs text-gray-400">
        Replace <code className="bg-gray-200 px-1 rounded">production</code> with your target environment (staging, dev, etc.).
        The prompt must be deployed to the environment before it can be retrieved.
      </p>
    </div>
  );
}

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: prompt, isLoading } = usePrompt(id || '');
  const { data: versionsData, isLoading: isLoadingVersions } = useVersions(id || '');
  const createVersion = useCreateVersion();
  const updateVersionStatus = useUpdateVersionStatus();
  const [openExport, setOpenExport] = useState<string | null>(null);
  const [openApi, setOpenApi] = useState<string | null>(null);
  const [showAddVersion, setShowAddVersion] = useState(false);
  const [template, setTemplate] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);
  const [cloneSourceVersion, setCloneSourceVersion] = useState<number | null>(null);

  if (isLoading) return <div className="text-center text-gray-500 py-8">Loading prompt...</div>;
  if (!prompt) return <div className="text-center text-red-500 py-8">Prompt not found</div>;
  const versions = versionsData?.data ?? prompt.versions ?? [];

  async function handleCreateVersion(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setCreateError(null);
    try {
      await createVersion.mutateAsync({
        promptId: id,
        data: {
          template,
          commit_message: commitMessage || undefined,
          status: 'draft',
        },
      });
      setTemplate('');
      setCommitMessage('');
      setShowAddVersion(false);
      setCloneSourceVersion(null);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create version');
    }
  }

  async function handleArchiveVersion(versionId: string) {
    if (!id) return;
    setStatusError(null);
    setPendingArchiveId(versionId);
    try {
      await updateVersionStatus.mutateAsync({
        promptId: id,
        versionId,
        status: 'archived',
      });
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to archive version');
    } finally {
      setPendingArchiveId(null);
    }
  }

  function handleCloneVersion(version: PromptVersion) {
    setCreateError(null);
    setShowAddVersion(true);
    setCloneSourceVersion(version.version_number);
    setTemplate(version.template);
    setCommitMessage(`Clone of v${version.version_number}`);
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{prompt.name}</h2>
          <Link to={`/prompts/${prompt.id}/edit`} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-50">
            Edit
          </Link>
        </div>
        <p className="text-sm text-gray-500 font-mono mt-1">{prompt.slug}</p>
        <p className="text-gray-600 mt-2">{prompt.description || 'No description'}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Versions</h3>
          <button
            onClick={() => {
              setCreateError(null);
              setShowAddVersion((v) => !v);
              if (showAddVersion) {
                setCloneSourceVersion(null);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {showAddVersion ? 'Cancel' : 'Add Version'}
          </button>
        </div>
        {showAddVersion && (
          <form onSubmit={handleCreateVersion} className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3">
            {cloneSourceVersion !== null && (
              <p className="text-xs text-blue-700">Cloning from v{cloneSourceVersion}. Update template as needed, then create.</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={8}
                required
                className="w-full px-3 py-2 border rounded font-mono text-sm"
                placeholder="Enter prompt template (example: Hello {{name}})"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commit Message (optional)</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                maxLength={500}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Describe this version"
              />
            </div>
            <p className="text-xs text-gray-500">New versions start as <span className="font-medium">draft</span>. Publish from the draft edit view.</p>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <button
              type="submit"
              disabled={createVersion.isPending || template.trim().length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createVersion.isPending ? 'Creating...' : 'Create Version'}
            </button>
          </form>
        )}
        {statusError && <p className="text-sm text-red-600 mb-3">{statusError}</p>}
        <div className="space-y-3">
          {isLoadingVersions && versions.length === 0 && (
            <div className="text-sm text-gray-500">Loading versions...</div>
          )}
          {!isLoadingVersions && versions.length === 0 && (
            <div className="text-sm text-gray-500">No versions found for this prompt...</div>
          )}
          {versions.map((version) => (
            <div key={version.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">v{version.version_number}</span>
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                    version.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : version.status === 'archived'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {version.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {version.status !== 'draft' && (
                    <button
                      onClick={() => handleCloneVersion(version)}
                      className="px-2.5 py-1 text-xs rounded border bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
                    >
                      Clone
                    </button>
                  )}
                  {version.status === 'published' && (
                    <button
                      onClick={() => handleArchiveVersion(version.id)}
                      disabled={pendingArchiveId === version.id}
                      className="px-2.5 py-1 text-xs rounded border bg-white text-amber-700 border-amber-300 hover:bg-amber-50 disabled:opacity-50"
                    >
                      {pendingArchiveId === version.id ? 'Archiving...' : 'Archive'}
                    </button>
                  )}
                  <Link
                    to={`/prompts/${prompt.id}/versions/${version.id}/edit`}
                    className="px-2.5 py-1 text-xs rounded border bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                  >
                    {version.status === 'draft' ? 'Edit' : 'View'}
                  </Link>
                  <button
                    onClick={() => setOpenExport(openExport === version.id ? null : version.id)}
                    className={`px-2.5 py-1 text-xs rounded border ${openExport === version.id ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setOpenApi(openApi === version.id ? null : version.id)}
                    className={`px-2.5 py-1 text-xs rounded border ${openApi === version.id ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    API
                  </button>
                </div>
              </div>
              {version.commit_message && (
                <p className="text-sm text-gray-500 mb-2">{version.commit_message}</p>
              )}
              {version.status === 'draft' && (
                <>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">{version.template}</pre>
                  {version.variables && version.variables.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {version.variables.map(v => (
                          <span key={v.id} className="inline-flex px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-mono">
                            {`{{${v.key}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {openExport === version.id && <ExportPanel version={version} prompt={prompt} />}
              {openApi === version.id && <ApiPanel version={version} prompt={prompt} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
