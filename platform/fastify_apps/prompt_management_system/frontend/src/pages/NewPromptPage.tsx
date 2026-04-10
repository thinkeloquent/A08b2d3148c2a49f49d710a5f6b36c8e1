import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePrompt } from '../hooks/usePrompts';
import PromptForm from '../components/PromptForm';
import type { PromptFormData } from '../components/PromptForm';

export default function NewPromptPage() {
  const navigate = useNavigate();
  const createPrompt = useCreatePrompt();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: PromptFormData) {
    setError(null);
    try {
      const prompt = await createPrompt.mutateAsync(data);
      navigate(`/prompts/${prompt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">New Prompt</h2>
      <PromptForm
        onSubmit={handleSubmit}
        submitLabel="Create Prompt"
        pendingLabel="Creating..."
        isPending={createPrompt.isPending}
        error={error}
        onCancel={() => navigate('/prompts')}
      />
    </div>
  );
}
