import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useTemplate, useUpdateTemplate } from '../../hooks/useTemplates';
import type { UpdateTemplateRequest, Step } from '../../types';

type StepInput = Omit<Step, 'id' | 'createdAt' | 'updatedAt' | 'templateId'>;

function emptyStep(order: number): StepInput {
  return {
    stepId: '',
    order,
    title: '',
    description: '',
    required: true,
    tags: [],
    dependencies: []
  };
}

export function TemplateEditPage() {
  const { templateId } = useParams<{templateId: string;}>();
  const navigate = useNavigate();
  const { data: template, isLoading, error } = useTemplate(templateId!);
  const updateMutation = useUpdateTemplate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [steps, setSteps] = useState<StepInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (template && !initialized) {
      setName(template.name);
      setDescription(template.description ?? '');
      setCategory(template.category);
      setSteps(
        (template.steps || []).
        sort((a, b) => a.order - b.order).
        map((s) => ({
          stepId: s.stepId,
          order: s.order,
          title: s.title,
          description: s.description ?? '',
          required: s.required,
          tags: s.tags,
          dependencies: s.dependencies
        }))
      );
      setInitialized(true);
    }
  }, [template, initialized]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!category.trim()) errs.category = 'Category is required';
    if (steps.length === 0) errs.steps = 'At least one step is required';
    steps.forEach((s, i) => {
      if (!s.stepId.trim()) errs[`step_${i}_stepId`] = 'Step ID is required';
      if (!s.title.trim()) errs[`step_${i}_title`] = 'Step title is required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: UpdateTemplateRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim(),
      steps: steps.map((s, i) => ({ ...s, order: i + 1 }))
    };

    try {
      await updateMutation.mutateAsync({ templateId: templateId!, data });
      navigate(`/templates/${templateId}`);
    } catch {

      // Error displayed via mutation state
    }};

  const addStep = () => {
    setSteps((prev) => [...prev, emptyStep(prev.length + 1)]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof StepInput, value: unknown) => {
    setSteps((prev) =>
    prev.map((s, i) => i === index ? { ...s, [field]: value } : s)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>);

  }

  if (error || !template) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          {error ? 'Failed to load template' : 'Template not found'}
        </p>
        <Link to="/templates" className="text-sm text-blue-600 hover:text-blue-700">
          Back to templates
        </Link>
      </div>);

  }

  return (
    <div className="space-y-6">
      <Link
        to={`/templates/${templateId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">

        <ArrowLeft className="w-4 h-4" />
        Back to Template
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
        <p className="mt-1 text-sm text-gray-500 font-mono">{templateId}</p>
      </div>

      {updateMutation.isError &&
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {(updateMutation.error as Error).message || 'Failed to update template'}
        </div>
      }

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4" data-test-id="div-0491f267">
          <h2 className="text-lg font-semibold text-gray-900">
            Template Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template name"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'}`
                } />

              {errors.name &&
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              }
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. onboarding, deployment"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? 'border-red-300' : 'border-gray-300'}`
                } />

              {errors.category &&
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
              }
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4" data-test-id="div-c38f4c91">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Steps</h2>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">

              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>
          {errors.steps &&
          <p className="text-sm text-red-600">{errors.steps}</p>
          }
          <div className="space-y-4">
            {steps.map((step, index) =>
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Step {index + 1}
                  </span>
                  {steps.length > 1 &&
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors">

                      <Trash2 className="w-4 h-4" />
                    </button>
                }
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Step ID
                    </label>
                    <input
                    type="text"
                    value={step.stepId}
                    onChange={(e) =>
                    updateStep(index, 'stepId', e.target.value)
                    }
                    placeholder="e.g. review-docs"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`step_${index}_stepId`] ?
                    'border-red-300' :
                    'border-gray-300'}`
                    } />

                    {errors[`step_${index}_stepId`] &&
                  <p className="mt-1 text-xs text-red-600">
                        {errors[`step_${index}_stepId`]}
                      </p>
                  }
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Title
                    </label>
                    <input
                    type="text"
                    value={step.title}
                    onChange={(e) =>
                    updateStep(index, 'title', e.target.value)
                    }
                    placeholder="Step title"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`step_${index}_title`] ?
                    'border-red-300' :
                    'border-gray-300'}`
                    } />

                    {errors[`step_${index}_title`] &&
                  <p className="mt-1 text-xs text-red-600">
                        {errors[`step_${index}_title`]}
                      </p>
                  }
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                  value={step.description ?? ''}
                  onChange={(e) =>
                  updateStep(index, 'description', e.target.value)
                  }
                  placeholder="Step description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                    type="checkbox"
                    checked={step.required}
                    onChange={(e) =>
                    updateStep(index, 'required', e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />

                    Required
                  </label>
                  <div className="flex-1">
                    <input
                    type="text"
                    value={step.tags.join(', ')}
                    onChange={(e) =>
                    updateStep(
                      index,
                      'tags',
                      e.target.value.
                      split(',').
                      map((t) => t.trim()).
                      filter(Boolean)
                    )
                    }
                    placeholder="Tags (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3" data-test-id="div-6848dbfa">
          <Link
            to={`/templates/${templateId}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">

            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">

            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>);

}