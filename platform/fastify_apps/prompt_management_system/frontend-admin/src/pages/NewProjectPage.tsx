import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProject } from '../hooks/useProjects';
import { projectSchema, type ProjectFormData } from '../schemas/project';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema)
  });

  const onSubmit = async (formData: ProjectFormData) => {
    await createProject.mutateAsync(formData);
    navigate('/projects');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New Project</h2>
        <Link to="/projects" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Projects
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4" data-test-id="div-ba703dfc">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input {...register('name')} className="w-full border rounded px-3 py-2 text-sm" placeholder="Project name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} className="w-full border rounded px-3 py-2 text-sm" rows={3} placeholder="Project description" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createProject.isPending} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </button>
            <Link to="/projects" className="px-4 py-2 border text-gray-700 text-sm rounded hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>);

}