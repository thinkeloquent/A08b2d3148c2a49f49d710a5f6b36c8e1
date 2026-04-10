import { Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { personasAPI } from '../../services/api';
import type { Persona } from '../../types';
import PersonaCard from '../../components/PersonaCard';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await personasAPI.list();
      setPersonas(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch personas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this persona?')) return;
    try {
      await personasAPI.delete(id);
      await fetchPersonas();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete persona';
      setError(message);
    }
  };

  const handleExport = (persona: Persona) => {
    const json = JSON.stringify(persona, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${persona.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personas</h2>
          <p className="text-sm text-gray-600 mt-1">Manage AI persona configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPersonas}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Persona
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {loading && personas.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading personas...</div>
        </div>
      ) : personas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No personas found</p>
          <p className="text-sm text-gray-500 mt-1">Create one to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isSelected={selectedId === persona.id}
              onSelect={setSelectedId}
              onEdit={() => {/* TODO: edit modal */}}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
