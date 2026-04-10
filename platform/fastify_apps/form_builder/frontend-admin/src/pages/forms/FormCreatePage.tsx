import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type FormInput } from '@/schemas/form';
import { useCreateForm } from '@/hooks/useForms';
import { ArrowLeft } from 'lucide-react';

export function FormCreatePage() {
  const navigate = useNavigate();
  const createMut = useCreateForm();
  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: 'draft', version: '1.0.0' }
  });

  const onSubmit = async (data: FormInput) => {
    await createMut.mutateAsync(data);
    navigate('/forms');
  };

  return (
    <div className="max-w-2xl">
      <Link to="/forms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Forms
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Form</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div data-test-id="div-9d98dc1d">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div data-test-id="div-5f6f3058">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4" data-test-id="div-2ee81c8f">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
            <input {...register('version')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div data-test-id="div-328629d4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
          <input {...register('created_by')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200" data-test-id="div-807a65ac">
          <Link to="/forms" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {createMut.isPending ? 'Creating...' : 'Create Form'}
          </button>
        </div>
      </form>
    </div>);

}