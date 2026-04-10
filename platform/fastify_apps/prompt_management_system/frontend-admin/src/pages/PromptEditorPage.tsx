import { useParams } from 'react-router-dom';
import { usePrompt, useCreateVersion, useUpdateVersionStatus } from '../hooks/usePrompts';
import { useState, useCallback } from 'react';
import type { PromptVersion } from '../types';

const COPY_RESET_MS = 1500;

export default function PromptEditorPage() {
  const { id } = useParams<{id: string;}>();
  const { data: prompt, isLoading } = usePrompt(id || '');
  const createVersion = useCreateVersion();
  const updateStatus = useUpdateVersionStatus();
  const [template, setTemplate] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [copiedVersionId, setCopiedVersionId] = useState<string | null>(null);

  const handleCopyTextLink = useCallback((e: React.MouseEvent, version: PromptVersion) => {
    e.stopPropagation();
    const textUrl = `${window.location.origin}/api/prompt-management-system/prompts/${id}/versions/${version.id}/text`;
    navigator.clipboard.writeText(textUrl).then(() => {
      setCopiedVersionId(version.id);
      setTimeout(() => setCopiedVersionId(null), COPY_RESET_MS);
    });
  }, [id]);

  if (isLoading) return <div className="text-center text-gray-500 py-8">Loading...</div>;
  if (!prompt) return <div className="text-center text-red-500 py-8">Prompt not found</div>;

  const handleCreateVersion = async () => {
    if (!template.trim()) return;
    await createVersion.mutateAsync({
      promptId: prompt.id,
      data: { template, commit_message: commitMessage }
    });
    setTemplate('');
    setCommitMessage('');
  };

  const handleToggleDisabled = async (e: React.MouseEvent, versionId: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'archived' ? 'draft' : 'archived';
    await updateStatus.mutateAsync({
      promptId: prompt.id,
      versionId,
      status: newStatus
    });
  };

  const handleSelectVersion = (version: PromptVersion) => {
    if (selectedVersion?.id === version.id) {
      setSelectedVersion(null);
    } else {
      setSelectedVersion(version);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{prompt.name}</h2>
        <p className="text-sm text-gray-500 font-mono">{prompt.slug}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Section */}
        <div className="flex-1 min-w-0 bg-white rounded-lg shadow p-6">
          {selectedVersion ?
          <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Version {selectedVersion.version_number}
                </h3>
                <button
                onClick={() => setSelectedVersion(null)}
                className="text-sm text-blue-600 hover:text-blue-800">

                  New Version
                </button>
              </div>
              {selectedVersion.commit_message &&
            <p className="text-sm text-gray-500 mb-3 italic">{selectedVersion.commit_message}</p>
            }
              <pre className="w-full border rounded px-3 py-2 text-sm font-mono h-96 overflow-auto bg-gray-50 whitespace-pre-wrap">{selectedVersion.template}</pre>
            </> :

          <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Version</h3>
              <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm font-mono h-96"
              placeholder="Enter prompt template with {{variables}}..." />

              <input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mt-3"
              placeholder="Commit message (optional)" />

              <button
              onClick={handleCreateVersion}
              disabled={createVersion.isPending || !template.trim()}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">

                {createVersion.isPending ? 'Creating...' : 'Create Version'}
              </button>
            </>
          }
        </div>

        {/* Version History */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Versions</h3>
          <div className="space-y-2 overflow-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            {prompt.versions?.map((version) =>
            <div
              key={version.id}
              onClick={() => handleSelectVersion(version)}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              version.status === 'archived' ?
              'bg-gray-100 border-gray-200 opacity-50' :
              selectedVersion?.id === version.id ?
              'border-blue-500 bg-blue-50' :
              'bg-white hover:border-gray-300'}`
              }>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">v{version.version_number}</span>
                  <div className="flex items-center gap-1">
                    <button
                    onClick={(e) => handleCopyTextLink(e, version)}
                    className={`p-0.5 rounded ${
                    version.status === 'archived' ?
                    'text-gray-400 hover:text-blue-600' :
                    'text-gray-300 hover:text-blue-500'}`
                    }
                    title="Copy text endpoint link">
                      {copiedVersionId === version.id ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                          <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                        </svg>)
                    }
                    </button>
                  <button
                  onClick={(e) => handleToggleDisabled(e, version.id, version.status)}
                  disabled={updateStatus.isPending}
                  className={`p-0.5 rounded ${
                  version.status === 'archived' ?
                  'text-gray-400 hover:text-green-600' :
                  'text-gray-300 hover:text-red-500'}`
                  }
                  title={version.status === 'archived' ? 'Enable' : 'Disable'}>

                    {version.status === 'archived' ? (
                  /* eye-slash icon */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" data-test-id="svg-a30d52a4">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
                        <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 4.09 5.12l2.109 2.11a4 4 0 0 0 4.55 4.7Z" />
                      </svg>) : (

                  /* eye icon */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" data-test-id="svg-f1b79198">
                        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                      </svg>)
                  }
                  </button>
                </div>
                </div>
                <pre className="text-xs bg-gray-50 p-1.5 rounded overflow-auto max-h-16 text-gray-600">{version.template}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}