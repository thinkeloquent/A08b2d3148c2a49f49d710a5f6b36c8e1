import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useTags';
import { Plus, Trash2, Edit } from 'lucide-react';

export function TagsPage() {
  const { data, isLoading } = useTags();
  const createMut = useCreateTag();
  const deleteMut = useDeleteTag();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createMut.mutateAsync({ name: newName.trim(), color: newColor });
    setNewName('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>

      {/* Create tag */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tag name..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 w-12 border border-gray-300 rounded cursor-pointer" />
          <button onClick={handleCreate} disabled={createMut.isPending || !newName.trim()} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            <Plus className="h-4 w-4" /> Add Tag
          </button>
        </div>
      </div>

      {/* Tags list */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {data?.tags?.length === 0 && !isLoading && <p className="p-6 text-center text-gray-500">No tags yet.</p>}
        <div className="divide-y divide-gray-100">
          {data?.tags?.map(tag => (
            <div key={tag.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color || '#ccc' }} />
                <span className="font-medium text-gray-900">{tag.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Link to={`/tags/${tag.id}/edit`} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                  <Edit className="h-4 w-4 text-gray-500" />
                </Link>
                <button
                  onClick={() => { if (confirm(`Delete tag "${tag.name}"?`)) deleteMut.mutate(tag.id); }}
                  className="p-1.5 rounded hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
