import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileJson, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useBulkCreateRepositories } from '@/hooks';
import type { CreateRepositoryRequest } from '@/types/api';

const exampleJson = `[
  {
    "name": "example-package",
    "type": "npm",
    "description": "An example package",
    "github_url": "https://github.com/example/package",
    "stars": 100,
    "status": "stable",
    "tag_names": ["javascript", "utility"]
  }
]`;

interface ParseResult {
  valid: boolean;
  data?: CreateRepositoryRequest[];
  error?: string;
  count?: number;
}

function parseJsonInput(input: string): ParseResult {
  if (!input.trim()) {
    return { valid: false, error: 'JSON input is empty' };
  }

  try {
    const parsed = JSON.parse(input);

    if (!Array.isArray(parsed)) {
      return { valid: false, error: 'Input must be a JSON array' };
    }

    if (parsed.length === 0) {
      return { valid: false, error: 'Array is empty' };
    }

    // Validate each item has required fields
    const errors: string[] = [];
    const validTypes = ['npm', 'docker', 'python'];

    parsed.forEach((item, index) => {
      if (!item.name || typeof item.name !== 'string') {
        errors.push(`Item ${index + 1}: missing or invalid "name" field`);
      }
      if (!item.type || !validTypes.includes(item.type)) {
        errors.push(`Item ${index + 1}: missing or invalid "type" field (must be npm, docker, or python)`);
      }
    });

    if (errors.length > 0) {
      return { valid: false, error: errors.join('\n') };
    }

    return { valid: true, data: parsed, count: parsed.length };
  } catch (e) {
    return { valid: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function BulkInsertPage() {
  const navigate = useNavigate();
  const bulkCreate = useBulkCreateRepositories();

  const [jsonInput, setJsonInput] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    created: number;
    errors: { index: number; message: string }[];
  } | null>(null);

  const handleInputChange = (value: string) => {
    setJsonInput(value);
    setResult(null);
    if (value.trim()) {
      setParseResult(parseJsonInput(value));
    } else {
      setParseResult(null);
    }
  };

  const handleSubmit = async () => {
    const parsed = parseJsonInput(jsonInput);
    if (!parsed.valid || !parsed.data) {
      setParseResult(parsed);
      return;
    }

    try {
      const response = await bulkCreate.mutateAsync(parsed.data);
      setResult({
        success: true,
        created: response.created.length,
        errors: response.errors || [],
      });
      if (response.created.length > 0 && (!response.errors || response.errors.length === 0)) {
        // Clear input on complete success
        setJsonInput('');
        setParseResult(null);
      }
    } catch (error) {
      setResult({
        success: false,
        created: 0,
        errors: [{ index: -1, message: (error as Error).message }],
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleInputChange(content);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleLoadExample = () => {
    handleInputChange(exampleJson);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bulk Insert</h1>
              <p className="text-gray-500 mt-1">
                Insert multiple repositories at once using JSON array
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                JSON Array Input
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Load example
                </button>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Paste your JSON array here...\n\nExample:\n${exampleJson}`}
              className={`w-full h-80 px-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                parseResult && !parseResult.valid
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />

            {/* Validation Status */}
            {parseResult && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  parseResult.valid
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {parseResult.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      Valid JSON array with {parseResult.count} item
                      {parseResult.count !== 1 ? 's' : ''} ready to insert
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <pre className="text-sm whitespace-pre-wrap">{parseResult.error}</pre>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Result Section */}
          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success && result.errors.length === 0
                  ? 'bg-green-50 border-green-200'
                  : result.created > 0
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {result.success && result.errors.length === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {result.created > 0
                        ? `Successfully created ${result.created} repositor${result.created !== 1 ? 'ies' : 'y'}`
                        : 'No repositories created'}
                    </p>
                    {result.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium">Errors:</p>
                        <ul className="text-sm space-y-1">
                          {result.errors.map((err, idx) => (
                            <li key={idx} className="text-red-600">
                              {err.index >= 0
                                ? `Item ${err.index + 1}: ${err.message}`
                                : err.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {result.created > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/repositories')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View repositories
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Schema Reference */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Field Reference</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2 font-medium">Field</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Required</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="py-1 font-mono text-xs">name</td>
                    <td className="py-1">string</td>
                    <td className="py-1 text-red-600">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-xs">type</td>
                    <td className="py-1">"npm" | "docker" | "python"</td>
                    <td className="py-1 text-red-600">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-xs">description</td>
                    <td className="py-1">string</td>
                    <td className="py-1">No</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-xs">github_url</td>
                    <td className="py-1">string</td>
                    <td className="py-1">No</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-xs">package_url</td>
                    <td className="py-1">string</td>
                    <td className="py-1">No</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-xs">stars, forks</td>
                    <td className="py-1">number</td>
                    <td className="py-1">No</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-xs">status</td>
                    <td className="py-1">"stable" | "beta" | "deprecated" | "experimental"</td>
                    <td className="py-1">No</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-xs">tag_names</td>
                    <td className="py-1">string[]</td>
                    <td className="py-1">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setJsonInput('');
                setParseResult(null);
                setResult(null);
              }}
              className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!parseResult?.valid || bulkCreate.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4" />
              {bulkCreate.isPending ? 'Inserting...' : 'Insert Repositories'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
