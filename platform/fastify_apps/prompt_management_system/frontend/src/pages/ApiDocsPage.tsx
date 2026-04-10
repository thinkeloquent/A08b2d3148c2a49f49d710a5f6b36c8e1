import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePrompt } from '../hooks/usePrompts';
import { buildApiMarkdown } from '../utils/apiDocs';

export default function ApiDocsPage() {
  const { id, versionNumber } = useParams<{id: string;versionNumber: string;}>();
  const { data: prompt, isLoading } = usePrompt(id || '');
  const [copied, setCopied] = useState(false);

  if (isLoading) return <div className="text-center text-gray-500 py-16">Loading...</div>;
  if (!prompt) return <div className="text-center text-red-500 py-16">Prompt not found</div>;

  const vNum = Number(versionNumber);
  const version = prompt.versions?.find((v) => v.version_number === vNum);
  if (!version) return <div className="text-center text-red-500 py-16">Version v{versionNumber} not found</div>;

  const baseUrl = `${window.location.origin}/api/prompt-management-system`;
  const markdown = buildApiMarkdown(prompt, version, baseUrl);
  const vars = version.variables ?? [];

  const sampleVars = vars.reduce<Record<string, string>>((acc, v) => {
    acc[v.key] = v.default_value || `<${v.key}>`;
    return acc;
  }, {});
  const renderBody = JSON.stringify({ environment: 'production', variables: sampleVars }, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to={`/prompts/${prompt.id}`} className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to prompt
          </Link>
          <button onClick={handleCopy} className="px-3 py-1.5 text-xs rounded border bg-white text-gray-700 hover:bg-gray-50">
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
        </div>

        {/* Rendered docs */}
        <article className="space-y-6">
          <div data-test-id="div-3544cf73">
            <h1 className="text-2xl font-bold text-gray-900">
              API Documentation — {prompt.name} v{version.version_number}
            </h1>
            <p className="text-sm text-gray-500 font-mono mt-1">Slug: {prompt.slug}</p>
          </div>

          <hr className="border-gray-200" data-test-id="hr-3885e3c8" />

          {/* Retrieve */}
          <section className="space-y-3" data-test-id="section-c1a13162">
            <h2 className="text-xl font-semibold text-gray-900" data-test-id="h2-724fc686">Retrieve Deployed Prompt</h2>
            <p className="text-sm text-gray-600" data-test-id="p-bf98d402">Returns the deployed version for a given environment.</p>
            <pre className="text-sm bg-gray-50 border rounded p-3 overflow-auto font-mono" data-test-id="pre-54165319">
              GET {baseUrl}/prompts/{prompt.slug}/:environment
            </pre>
            <h3 className="text-base font-medium text-gray-800" data-test-id="h3-d2b925a6">Example</h3>
            <pre className="text-sm bg-gray-900 text-green-400 rounded p-3 overflow-auto font-mono" data-test-id="pre-85cac4cc">
              curl {baseUrl}/prompts/{prompt.slug}/production
            </pre>
          </section>

          <hr className="border-gray-200" data-test-id="hr-0432abe0" />

          {/* Render */}
          <section className="space-y-3" data-test-id="section-9d4eaeb3">
            <h2 className="text-xl font-semibold text-gray-900" data-test-id="h2-805d777d">Render Prompt with Variables</h2>
            <p className="text-sm text-gray-600" data-test-id="p-c8a6fb3f">
              Substitutes <code className="bg-gray-100 px-1 rounded text-sm">{'{{variables}}'}</code> in the template and returns the rendered string.
            </p>
            <pre className="text-sm bg-gray-50 border rounded p-3 overflow-auto font-mono" data-test-id="pre-be573cbc">
              POST {baseUrl}/prompts/{prompt.slug}/render
            </pre>

            <h3 className="text-base font-medium text-gray-800" data-test-id="h3-8f89b85d">Request Body</h3>
            <div className="overflow-auto" data-test-id="div-69255e0e">
              <table className="min-w-full text-sm border rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Field</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 font-mono border-b">environment</td>
                    <td className="px-3 py-2 border-b">string</td>
                    <td className="px-3 py-2 border-b text-gray-600">Target environment (default: <code className="bg-gray-100 px-1 rounded">production</code>)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono border-b">variables</td>
                    <td className="px-3 py-2 border-b">object</td>
                    <td className="px-3 py-2 border-b text-gray-600">Key-value pairs for template substitution</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-medium text-gray-800" data-test-id="h3-d67c25eb">Example</h3>
            <pre className="text-sm bg-gray-900 text-green-400 rounded p-3 overflow-auto font-mono" data-test-id="pre-85b13e49">
              {`curl -X POST ${baseUrl}/prompts/${prompt.slug}/render \\
  -H "Content-Type: application/json" \\
  -d '${renderBody}'`}
            </pre>
          </section>

          {/* Variables table */}
          {vars.length > 0 &&
          <>
              <hr className="border-gray-200" />
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900" data-test-id="h2-da4a78d4">Variables</h2>
                <div className="overflow-auto" data-test-id="div-11a0da23">
                  <table className="min-w-full text-sm border rounded">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Key</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Type</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Required</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Default</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vars.map((v) =>
                    <tr key={v.id}>
                          <td className="px-3 py-2 font-mono border-b">{v.key}</td>
                          <td className="px-3 py-2 border-b">{v.type}</td>
                          <td className="px-3 py-2 border-b">{v.required ? 'Yes' : 'No'}</td>
                          <td className="px-3 py-2 border-b font-mono text-gray-500">{v.default_value ?? '—'}</td>
                          <td className="px-3 py-2 border-b text-gray-600">{v.description ?? '—'}</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          }

          <hr className="border-gray-200" data-test-id="hr-89e8e9ad" />

          <blockquote className="border-l-4 border-gray-300 pl-4 text-sm text-gray-500 italic" data-test-id="blockquote-1bdd3f9c">
            Replace <code className="bg-gray-100 px-1 rounded not-italic">production</code> with your target environment (staging, dev, etc.).
            The prompt must be deployed to the environment before it can be retrieved.
          </blockquote>
        </article>
      </div>
    </div>);

}