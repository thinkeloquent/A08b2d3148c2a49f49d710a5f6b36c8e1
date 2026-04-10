import { useState } from 'react';
import { Sparkles } from 'lucide-react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4" data-test-id="div-847f466a">
          <h1 className="text-2xl font-bold text-gray-900">{{ APP_NAME_TITLE }}</h1>
          <p className="text-sm text-gray-600 mt-1">
            React + Vite + Tailwind CSS
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6" data-test-id="div-af0db769">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Welcome!</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Your frontend app is ready. Start building by editing{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">src/App.tsx</code>
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">

              Count: {count}
            </button>
            <span className="text-sm text-gray-500">
              Click to test state management
            </span>
          </div>
        </div>

        {/* Getting Started Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-test-id="div-3d75c363">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900">1. Add your components</h3>
              <p>
                Create components in{' '}
                <code className="bg-gray-100 px-1 rounded">src/components/</code>
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">2. Add services</h3>
              <p>
                Add API clients or services in{' '}
                <code className="bg-gray-100 px-1 rounded">src/services/</code>
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">3. Add utilities</h3>
              <p>
                Helper functions go in{' '}
                <code className="bg-gray-100 px-1 rounded">src/utils/</code>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500" data-test-id="div-086f3049">
          Built with React + Vite + Tailwind CSS
        </div>
      </footer>
    </div>);

}

export default App;