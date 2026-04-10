import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Tag,
  CheckCircle,
  Circle,
  FileText,
} from 'lucide-react';
import { useChecklist } from '../../hooks/useChecklists';

export function ChecklistDetailPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { data: checklist, isLoading, error } = useChecklist(checklistId!);

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

  if (error || !checklist) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          {error ? 'Failed to load checklist' : 'Checklist not found'}
        </p>
        <Link
          to="/checklists"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Back to checklists
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/checklists"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Checklists
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checklist Detail</h1>
        <p className="mt-1 text-sm text-gray-500 font-mono">
          {checklist.checklistId}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-gray-500 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Template
            </dt>
            <dd className="mt-1">
              <Link
                to={`/templates/${checklist.templateRef}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {checklist.templateRef}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Template Version
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              v{checklist.metadata?.templateVersion}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Steps</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {checklist.steps?.length ?? 0} steps
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Generated
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(checklist.generatedAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Created
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(checklist.createdAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {checklist.metadata?.parameters &&
        Object.keys(checklist.metadata.parameters).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Generation Parameters
            </h2>
            <pre className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 overflow-x-auto">
              {JSON.stringify(checklist.metadata.parameters, null, 2)}
            </pre>
          </div>
        )}

      {checklist.steps && checklist.steps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Steps ({checklist.steps.length})
          </h2>
          <div className="space-y-3">
            {checklist.steps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg"
                >
                  <div className="mt-0.5">
                    {step.required ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {step.order}. {step.title}
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
    </div>
  );
}
