import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm as useRHF } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type FormInput } from '@/schemas/form';
import { useForm, useUpdateForm } from '@/hooks/useForms';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export function FormEditPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const { data } = useForm(id!);
  const updateMut = useUpdateForm();
  const form = data?.formDefinition;

  const { register, handleSubmit, reset, formState: { errors } } = useRHF<FormInput>({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    if (form) {
      reset({
        name: form.name,
        description: form.description,
        version: form.version,
        status: form.status,
        created_by: form.created_by,
        tag_names: form.tags?.map((t) => t.name) ?? []
      });
    }
  }, [form, reset]);

  const onSubmit = async (data: FormInput) => {
    await updateMut.mutateAsync({ id: id!, data });
    navigate(`/forms/${id}`);
  };

  if (!form) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <Link to={`/forms/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Form
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Form</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div data-test-id="div-4e39093f">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div data-test-id="div-92aee32c">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4" data-test-id="div-3fd7abcf">
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
        <div data-test-id="div-d252c06e">
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
          <input {...register('created_by')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200" data-test-id="div-acc1a4ef">
          <Link to={`/forms/${id}`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={updateMut.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {updateMut.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>);

}