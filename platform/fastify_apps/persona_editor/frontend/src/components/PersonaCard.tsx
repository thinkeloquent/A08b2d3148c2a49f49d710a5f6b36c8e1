/**
 * PersonaCard Component
 * Displays persona information in a collapsible card format
 */

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Download,
  User,
  Cpu,
  Target,
  Wrench,
  Shield,
  Brain } from
'lucide-react';
import type { Persona } from '../types/persona';

interface PersonaCardProps {
  persona: Persona;
  onEdit?: (persona: Persona) => void;
  onDelete?: (persona: Persona) => void;
  onExport?: (persona: Persona) => void;
}

export function PersonaCard({
  persona,
  onDelete,
  onExport
}: PersonaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpand}>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {persona.name}
              </h3>
              {persona.version &&
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  v{persona.version}
                </span>
              }
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {persona.description}
            </p>

            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {persona.role &&
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  <User className="w-3 h-3" />
                  {persona.role}
                </span>
              }
              {persona.tone &&
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                  {persona.tone}
                </span>
              }
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                <Cpu className="w-3 h-3" />
                {persona.llm_provider}
              </span>
              {persona.llm_temperature !== undefined &&
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                  Temp: {persona.llm_temperature}
                </span>
              }
            </div>
          </div>

          {/* Expand/Collapse icon */}
          <div className="ml-4 text-gray-400">
            {isExpanded ?
            <ChevronUp className="w-5 h-5" /> :

            <ChevronDown className="w-5 h-5" />
            }
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded &&
      <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Goals */}
          {persona.goals && persona.goals.length > 0 &&
        <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Target className="w-4 h-4" data-test-id="target-f3d2932a" />
                Goals
              </h4>
              <div className="flex flex-wrap gap-1">
                {persona.goals.map((goal, idx) =>
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">

                    {goal}
                  </span>
            )}
              </div>
            </div>
        }

          {/* Tools */}
          {persona.tools && persona.tools.length > 0 &&
        <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Wrench className="w-4 h-4" data-test-id="wrench-bf92499e" />
                Tools
              </h4>
              <div className="flex flex-wrap gap-1">
                {persona.tools.map((tool, idx) =>
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">

                    {tool}
                  </span>
            )}
              </div>
            </div>
        }

          {/* Permissions */}
          {persona.permitted_to && persona.permitted_to.length > 0 &&
        <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Shield className="w-4 h-4" data-test-id="shield-21ef8ba9" />
                Permissions
              </h4>
              <div className="flex flex-wrap gap-1">
                {persona.permitted_to.map((perm, idx) =>
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded">

                    {perm}
                  </span>
            )}
              </div>
            </div>
        }

          {/* Memory Configuration */}
          {persona.memory &&
        <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Brain className="w-4 h-4" data-test-id="brain-68b43385" />
                Memory
              </h4>
              <div className="text-sm text-gray-600">
                <span
              className={`px-2 py-1 text-xs rounded ${
              persona.memory.enabled ?
              'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-600'}`
              }>

                  {persona.memory.enabled ? 'Enabled' : 'Disabled'}
                </span>
                {persona.memory.enabled &&
            <>
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {persona.memory.scope}
                    </span>
                    {persona.memory.storage_id &&
              <span className="ml-2 text-xs text-gray-500">
                        Storage: {persona.memory.storage_id}
                      </span>
              }
                  </>
            }
              </div>
            </div>
        }

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <a
            href={`/apps/persona-editor/${persona.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors">

              <Edit className="w-4 h-4" />
              Edit
            </a>
            {onExport &&
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(persona);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors">

                <Download className="w-4 h-4" />
                Export
              </button>
          }
            {onDelete &&
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(persona);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors">

                <Trash2 className="w-4 h-4" />
                Delete
              </button>
          }
          </div>
        </div>
      }
    </div>);

}