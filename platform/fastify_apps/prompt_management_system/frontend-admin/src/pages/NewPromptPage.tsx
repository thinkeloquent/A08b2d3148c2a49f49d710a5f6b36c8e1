import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePrompt } from '../hooks/usePrompts';
import { useProjects } from '../hooks/useProjects';
import { promptSchema, type PromptFormData } from '../schemas/prompt';

export default function NewPromptPage() {
  const navigate = useNavigate();
  const { data: projectsData } = useProjects();
  const createPrompt = useCreatePrompt();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema)
  });

  const nameValue = watch('name');
  useEffect(() => {
    if (nameValue) {
      setValue('slug', nameValue.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    } else {
      setValue('slug', '');
    }
  }, [nameValue, setValue]);

  const onSubmit = async (formData: PromptFormData) => {
    const prompt = await createPrompt.mutateAsync(formData);
    navigate(`/prompts/${prompt.id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New Prompt</h2>
        <Link to="/prompts" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Prompts
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4" data-test-id="div-f7fa4fde">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <select {...register('project_id')} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Select a label...</option>
              {projectsData?.data.map((project) =>
              <option key={project.id} value={project.id}>{project.name}</option>
              )}
            </select>
            {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input {...register('name')} className="w-full border rounded px-3 py-2 text-sm" placeholder="Prompt name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input {...register('slug')} readOnly className="w-full border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" placeholder="Auto-generated from name" />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} className="w-full border rounded px-3 py-2 text-sm" rows={3} placeholder="Prompt description" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createPrompt.isPending} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">
              {createPrompt.isPending ? 'Creating...' : 'Create Prompt'}
            </button>
            <Link to="/prompts" className="px-4 py-2 border text-gray-700 text-sm rounded hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>);

}