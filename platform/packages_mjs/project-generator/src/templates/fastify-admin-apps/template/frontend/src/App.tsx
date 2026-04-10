import { BrowserRouter, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4" data-test-id="div-37389d2c">
          <h1 className="text-2xl font-bold text-gray-900">{{ APP_NAME_TITLE }}</h1>
          <p className="text-sm text-gray-600 mt-1">
            A Fastify application with React frontend
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-test-id="div-4b67566c">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome</h2>
          <p className="text-gray-600">
            This is the user-facing frontend for <strong>{{ APP_NAME }}</strong>.
            Start building your application here.
          </p>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-test-id="div-fed7dae9">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Endpoints</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">
                GET /api/{{ APP_NAME }}
              </code>{' '}
              — Health check
            </li>
          </ul>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500" data-test-id="div-fc503954">
          Built with Fastify + React + Tailwind CSS
        </div>
      </footer>
    </div>);

}

function App() {
  return (
    <BrowserRouter basename="/apps/{{APP_NAME}}">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>);

}

export default App;