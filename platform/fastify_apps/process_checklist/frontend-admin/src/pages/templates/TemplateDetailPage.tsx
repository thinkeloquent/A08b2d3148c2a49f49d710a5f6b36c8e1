import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  Tag,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { useState } from 'react';
import { useTemplate, useDeleteTemplate } from '../../hooks/useTemplates';

export function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { data: template, isLoading, error } = useTemplate(templateId!);
  const deleteMutation = useDeleteTemplate();
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(templateId!);
    navigate('/templates');
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
      </div>
    );
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/templates"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Templates
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <p className="mt-1 text-sm text-gray-500 font-mono">
            {template.templateId}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/templates/${templateId}/edit`}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Details
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Category</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Tag className="w-3 h-3" />
                {template.category}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Version</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              v{template.version}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Steps</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {template.steps?.length ?? 0} steps
            </dd>
          </div>
          {template.description && (
            <div className="md:col-span-3">
              <dt className="text-sm text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {template.description}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Created
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(template.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(template.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      {template.steps && template.steps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Steps ({template.steps.length})
          </h2>
          <div className="space-y-3">
            {template.steps
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <div
                  key={step.stepId}
                  className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg"
                >
                  <div className="mt-0.5">
                    {step.required ? (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {step.order}. {step.title}
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {step.stepId}
                      </span>
                      {!step.required && (
                        <span className="text-xs text-gray-400">(optional)</span>
                      )}
                    </div>
                    {step.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {step.description}
                      </p>
                    )}
                    {step.tags.length > 0 && (
                      <div className="mt-1.5 flex gap-1.5">
                        {step.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {step.dependencies.length > 0 && (
                      <p className="mt-1 text-xs text-gray-400">
                        Depends on: {step.dependencies.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Template
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <strong>{template.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
