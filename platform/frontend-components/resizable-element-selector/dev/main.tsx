import { createRoot } from 'react-dom/client';
import './styles.css';
import { ResizableElementSelector } from '../src';
import type { ToolbarAction } from '../src';

/* Simple inline SVG icons for the dev harness (no icon library dependency) */
const MoveIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9l4-4 4 4M5 15l4 4 4-4M15 5l4 4-4 4M9 5l-4 4 4 4" />
  </svg>
);

const EditIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CopyIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SAMPLE_ACTIONS: ToolbarAction[] = [
  { id: 'move', icon: MoveIcon, color: 'text-blue-500', tooltip: 'Move' },
  { id: 'edit', icon: EditIcon, color: 'text-green-500', tooltip: 'Edit' },
  { id: 'copy', icon: CopyIcon, color: 'text-indigo-500', tooltip: 'Copy' },
  { id: 'delete', icon: TrashIcon, color: 'text-red-500', tooltip: 'Delete' },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <h1 className="text-2xl font-bold mb-2">ResizableElementSelector Dev</h1>
      <p className="text-gray-600 mb-4">Drag the selector, resize from handles, and use toolbar actions.</p>

      <ResizableElementSelector
        actions={SAMPLE_ACTIONS}
        showDebugPanel
        onToolSelect={(id) => console.log('Tool selected:', id)}
        onPositionChange={(pos) => console.log('Position:', pos)}
        onSizeChange={(sz) => console.log('Size:', sz)}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
