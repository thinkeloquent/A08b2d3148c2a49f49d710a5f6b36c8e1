import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useVersions, useUpdateVersion } from '../hooks/usePrompts';

export default function EditVersionPage() {
  const { id, versionId } = useParams<{ id: string; versionId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useVersions(id || '');
  const updateVersion = useUpdateVersion();
  const [template, setTemplate] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const version = data?.data.find((v) => v.id === versionId);

  useEffect(() => {
    if (!version) return;
    setTemplate(version.template);
    setCommitMessage(version.commit_message ?? '');
  }, [version]);

  if (isLoading) return <div className="text-center text-gray-500 py-8">Loading version...</div>;
  if (!version || !id) return <div className="text-center text-red-500 py-8">Version not found</div>;

  if (version.status !== 'draft') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Version v{version.version_number}</h2>
            <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
              version.status === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {version.status}
            </span>
          </div>
          <Link to={`/prompts/${id}`} className="text-sm text-blue-600 hover:text-blue-800">
            Back to prompt
          </Link>
        </div>
        {version.commit_message && (
          <p className="text-sm text-gray-500 mb-4">{version.commit_message}</p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
            <pre className="text-sm bg-gray-50 border rounded p-4 overflow-auto font-mono whitespace-pre-wrap">{version.template}</pre>
          </div>
          {version.variables && version.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variables</label>
              <div className="flex flex-wrap gap-1">
                {version.variables.map(v => (
                  <span key={v.id} className="inline-flex px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-mono">
                    {`{{${v.key}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  async function saveDraft() {
    if (!id || !version) return;
    setError(null);
    try {
      await updateVersion.mutateAsync({
        promptId: id,
        versionId: version.id,
        data: {
          template,
          commit_message: commitMessage || undefined,
          status: 'draft',
        },
      });
      navigate(`/prompts/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    }
  }

  async function publish() {
    if (!id || !version) return;
    setError(null);
    try {
      await updateVersion.mutateAsync({
        promptId: id,
        versionId: version.id,
        data: {
          template,
          commit_message: commitMessage || undefined,
          status: 'published',
        },
      });
      navigate(`/prompts/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish version');
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Edit Version v{version.version_number}</h2>
        <Link to={`/prompts/${id}`} className="text-sm text-blue-600 hover:text-blue-800">
          Back to prompt
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Status: <span className="font-medium">draft</span>. Publishing is permanent and cannot be undone.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border rounded font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commit Message</label>
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            maxLength={500}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={updateVersion.isPending || template.trim().length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {updateVersion.isPending ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={updateVersion.isPending || template.trim().length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {updateVersion.isPending ? 'Publishing...' : 'Publish (Permanent)'}
          </button>
        </div>
      </div>
    </div>
  );
}
