/**
 * Persona Detail Page
 */

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Loader2, AlertCircle } from 'lucide-react';
import { usePersona, usePersonaAuditLogs } from '../../hooks/usePersonas';
import { ACTION_LABELS, ACTION_COLORS } from '../../types/audit-log';

export function PersonaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: persona, isLoading, error } = usePersona(id!);
  const { data: auditLogs } = usePersonaAuditLogs(id!, 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        Persona not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/personas"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{persona.name}</h1>
            <p className="text-sm text-gray-500">{persona.description}</p>
          </div>
        </div>
        <Link
          to={`/personas/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className="text-sm font-medium">{persona.role || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Tone</dt>
              <dd className="text-sm font-medium">{persona.tone || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Version</dt>
              <dd className="text-sm font-medium">{persona.version || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* LLM Config */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">LLM Configuration</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Provider</dt>
              <dd className="text-sm font-medium">{persona.llm_provider}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Temperature</dt>
              <dd className="text-sm font-medium">{persona.llm_temperature ?? '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Goals */}
        {persona.goals && persona.goals.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals</h2>
            <div className="flex flex-wrap gap-2">
              {persona.goals.map((goal, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tools */}
        {persona.tools && persona.tools.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tools</h2>
            <div className="flex flex-wrap gap-2">
              {persona.tools.map((tool, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-sm bg-indigo-100 text-indigo-800 rounded"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs */}
      {auditLogs && auditLogs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Audit History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${ACTION_COLORS[log.action]}`}>
                      {ACTION_LABELS[log.action]}
                    </span>
                    <span className="text-sm text-gray-500">by {log.user_id}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
