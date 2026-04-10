import { Route, Routes, NavLink } from 'react-router-dom';
import { Bot, Settings } from 'lucide-react';
import PersonasPage from './pages/personas/PersonasPage';
import LLMDefaultsPage from './pages/llm-defaults/LLMDefaultsPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-test-id="div-105e69e9">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Ai Ask V2 Admin</h1>
            </div>
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ?
                'bg-indigo-100 text-indigo-700' :
                'text-gray-600 hover:bg-gray-100'}`

                } data-test-id="navlink-8707e15e">

                <Bot className="w-4 h-4" />
                Personas
              </NavLink>
              <NavLink
                to="/llm-defaults"
                className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ?
                'bg-indigo-100 text-indigo-700' :
                'text-gray-600 hover:bg-gray-100'}`

                } data-test-id="navlink-12e88968">

                <Settings className="w-4 h-4" />
                LLM Defaults
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes data-test-id="routes-3cef22e0">
          <Route path="/" element={<PersonasPage />} />
          <Route path="/llm-defaults" element={<LLMDefaultsPage />} />
        </Routes>
      </main>
    </div>);

}

export default App;