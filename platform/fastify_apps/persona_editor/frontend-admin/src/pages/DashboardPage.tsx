/**
 * Dashboard Page
 * Overview of personas and recent activity
 */

import { Link } from 'react-router-dom';
import { Users, Settings, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { usePersonas } from '../hooks/usePersonas';
import { useLLMDefaults } from '../hooks/useLLMDefaults';

export function DashboardPage() {
  const { data: personas, isLoading: personasLoading } = usePersonas();
  const { data: defaults, isLoading: defaultsLoading } = useLLMDefaults();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/personas/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Persona
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Personas Count */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Personas</p>
              {personasLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {personas?.length ?? 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* LLM Defaults Count */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">LLM Defaults</p>
              {defaultsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {defaults?.length ?? 0}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-4 grid gap-4 md:grid-cols-2">
          <Link
            to="/personas"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Manage Personas</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            to="/llm-defaults"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Configure Defaults</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Recent Personas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Personas</h2>
          <Link
            to="/personas"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {personasLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : personas && personas.length > 0 ? (
            personas.slice(0, 5).map((persona) => (
              <Link
                key={persona.id}
                to={`/personas/${persona.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{persona.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {persona.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No personas yet. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
