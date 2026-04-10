import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tagSchema, type TagInput } from '@/schemas/tag';
import { useTag, useUpdateTag } from '@/hooks/useTags';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export function TagEditPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const { data } = useTag(id!);
  const updateMut = useUpdateTag();
  const tag = data?.tag;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TagInput>({
    resolver: zodResolver(tagSchema)
  });

  useEffect(() => {
    if (tag) reset({ name: tag.name, color: tag.color });
  }, [tag, reset]);

  const onSubmit = async (data: TagInput) => {
    await updateMut.mutateAsync({ id: id!, data });
    navigate('/tags');
  };

  if (!tag) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-md">
      <Link to="/tags" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Tags
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Tag</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div data-test-id="div-641964aa">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div data-test-id="div-1f89711f">
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input type="color" {...register('color')} className="h-10 w-20 border border-gray-300 rounded cursor-pointer" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200" data-test-id="div-39c978df">
          <Link to="/tags" className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={updateMut.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {updateMut.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>);

}