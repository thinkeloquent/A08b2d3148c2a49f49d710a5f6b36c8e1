import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrompt, useUpdatePrompt } from '../hooks/usePrompts';
import PromptForm from '../components/PromptForm';
import type { PromptFormData } from '../components/PromptForm';

export default function EditPromptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: prompt, isLoading } = usePrompt(id || '');
  const updatePrompt = useUpdatePrompt();
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <div className="text-center text-gray-500 py-8">Loading...</div>;
  if (!prompt) return <div className="text-center text-red-500 py-8">Prompt not found</div>;

  async function handleSubmit(data: PromptFormData) {
    setError(null);
    try {
      await updatePrompt.mutateAsync({ id: id!, data });
      navigate(`/prompts/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prompt');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Prompt</h2>
      <PromptForm
        initialValues={{
          project_id: prompt.project_id,
          name: prompt.name,
          description: prompt.description,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        pendingLabel="Saving..."
        isPending={updatePrompt.isPending}
        error={error}
        onCancel={() => navigate(`/prompts/${id}`)}
      />
    </div>
  );
}
