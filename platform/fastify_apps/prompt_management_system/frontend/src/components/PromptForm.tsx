import { useState, useEffect } from 'react';
import slugify from 'slugify';
import { useProjects } from '../hooks/useProjects';

export interface PromptFormData {
  project_id: string;
  name: string;
  description?: string;
}

interface PromptFormProps {
  initialValues?: {project_id: string;name: string;description: string | null;};
  onSubmit: (data: PromptFormData) => Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  error: string | null;
  onCancel: () => void;
}

function toSlug(value: string) {
  return slugify(value, { lower: true, replacement: '_', strict: true });
}

export default function PromptForm({ initialValues, onSubmit, submitLabel, pendingLabel, isPending, error, onCancel }: PromptFormProps) {
  const { data: projectsData, isLoading: projectsLoading } = useProjects();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [projectId, setProjectId] = useState(initialValues?.project_id ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setProjectId(initialValues.project_id);
      setDescription(initialValues.description ?? '');
    }
  }, [initialValues?.name, initialValues?.project_id, initialValues?.description]);

  const slug = toSlug(name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      project_id: projectId,
      name,
      description: description || undefined
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-xl space-y-4">
      {error &&
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      }

      <div data-test-id="div-b5692138">
        <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
        <select
          id="project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required>

          <option value="">Select a project...</option>
          {projectsLoading && <option disabled>Loading...</option>}
          {projectsData?.data.map((p) =>
          <option key={p.id} value={p.id}>{p.name}</option>
          )}
        </select>
      </div>

      <div data-test-id="div-5f5fdb90">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="My New Prompt"
          required
          maxLength={100} />

      </div>

      <div data-test-id="div-91ad05b7">
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <div className="w-full border rounded px-3 py-2 text-sm font-mono bg-gray-50 text-gray-500 min-h-[38px]">
          {slug || <span className="text-gray-300">auto-generated from name</span>}
        </div>
      </div>

      <div data-test-id="div-68d4bb34">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Optional description..."
          maxLength={500} />

      </div>

      <div className="flex gap-3 pt-2" data-test-id="div-73f953f4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">

          {isPending ? pendingLabel : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-50">

          Cancel
        </button>
      </div>
    </form>);

}