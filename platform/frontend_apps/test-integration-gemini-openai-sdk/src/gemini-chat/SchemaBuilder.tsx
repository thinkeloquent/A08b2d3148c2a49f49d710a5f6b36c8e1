import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, Code, LayoutGrid, AlertCircle } from 'lucide-react';
import type { SchemaState, SchemaField, SchemaTemplate } from './types';
import { SCHEMA_TEMPLATES } from './templates';

interface SchemaBuilderProps {
  schema: SchemaState;
  onSchemaChange: (schema: SchemaState) => void;
  onExampleSelect?: (example: string) => void;
  error?: string | null;
}

export function SchemaBuilder({ schema, onSchemaChange, onExampleSelect, error }: SchemaBuilderProps) {
  const [mode, setMode] = useState<'visual' | 'json'>('visual');
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [lastSelectedTemplate, setLastSelectedTemplate] = useState<SchemaTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    if (mode === 'json') {
      setJsonValue(visualToJson(schema));
      setJsonError(null);
    }
  }, [mode, schema]);

  const handleTemplateSelect = (template: SchemaTemplate) => {
    const fields: SchemaField[] = Object.entries(template.schema.properties).map(
      ([name, prop]: [string, any], index) => ({
        id: `field-${Date.now()}-${index}`,
        name,
        type: prop.type || 'string',
        description: prop.description || '',
        required: template.schema.required?.includes(name) || false,
      })
    );

    onSchemaChange({
      name: template.schema.name,
      fields,
    });
    setLastSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleExampleSelect = (prompt: string) => {
    if (onExampleSelect) {
      onExampleSelect(prompt);
    }
    setShowExamples(false);
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    setJsonError(null);

    try {
      const parsed = JSON.parse(value);
      if (!parsed.name || !parsed.properties) {
        setJsonError('JSON must include "name" and "properties"');
        return;
      }

      const fields: SchemaField[] = Object.entries(parsed.properties).map(
        ([name, prop]: [string, any], index) => ({
          id: `field-${Date.now()}-${index}`,
          name,
          type: prop.type || 'string',
          description: prop.description || '',
          required: parsed.required?.includes(name) || false,
        })
      );

      onSchemaChange({
        name: parsed.name,
        fields,
      });
    } catch {
      setJsonError('Invalid JSON syntax');
    }
  };

  const handleAddField = () => {
    const newField: SchemaField = {
      id: `field-${Date.now()}`,
      name: '',
      type: 'string',
      description: '',
      required: false,
    };
    onSchemaChange({ ...schema, fields: [...schema.fields, newField] });
  };

  const handleFieldChange = (id: string, updates: Partial<SchemaField>) => {
    onSchemaChange({
      ...schema,
      fields: schema.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const handleRemoveField = (id: string) => {
    onSchemaChange({
      ...schema,
      fields: schema.fields.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Templates and Mode Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <span>Templates</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                {SCHEMA_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Example Selector */}
          {lastSelectedTemplate && lastSelectedTemplate.examples.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
              >
                <span>Examples</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExamples && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border rounded-lg shadow-lg z-10">
                  {lastSelectedTemplate.examples.map((example) => (
                    <button
                      key={example.id}
                      onClick={() => handleExampleSelect(example.prompt)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm">{example.label}</div>
                      <div className="text-xs text-gray-500 truncate">{example.prompt.slice(0, 60)}...</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
          <button
            onClick={() => setMode('visual')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              mode === 'visual' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            Visual
          </button>
          <button
            onClick={() => setMode('json')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              mode === 'json' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="w-3 h-3" />
            JSON
          </button>
        </div>
      </div>

      {/* Error Display */}
      {(error || jsonError) && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error || jsonError}</span>
        </div>
      )}

      {/* Content */}
      {mode === 'visual' ? (
        <div className="space-y-4">
          {/* Schema Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schema Name</label>
            <input
              type="text"
              value={schema.name}
              onChange={(e) => onSchemaChange({ ...schema, name: e.target.value })}
              placeholder="e.g., ContactInfo, ProductDetails"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Fields</label>
              <button
                onClick={handleAddField}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" />
                Add Field
              </button>
            </div>

            {schema.fields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500 text-sm">No fields defined yet.</p>
                <p className="text-gray-400 text-xs mt-1">Click "Add Field" to start building your schema.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schema.fields.map((field) => (
                  <div key={field.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Name</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleFieldChange(field.id, { name: e.target.value })}
                            placeholder="field_name"
                            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => handleFieldChange(field.id, { type: e.target.value as SchemaField['type'] })}
                            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleFieldChange(field.id, { required: e.target.checked })}
                              className="rounded"
                            />
                            Required
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveField(field.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Remove field"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={field.description}
                        onChange={(e) => handleFieldChange(field.id, { description: e.target.value })}
                        placeholder="Brief description of this field"
                        className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <textarea
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='{"name": "SchemaName", "properties": {...}, "required": [...]}'
          />
        </div>
      )}
    </div>
  );
}

function visualToJson(schema: SchemaState): string {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  schema.fields.forEach((field) => {
    properties[field.name] = {
      type: field.type,
      description: field.description,
    };
    if (field.required) {
      required.push(field.name);
    }
  });

  return JSON.stringify(
    {
      name: schema.name || 'Schema',
      properties,
      required: required.length > 0 ? required : undefined,
    },
    null,
    2
  );
}
