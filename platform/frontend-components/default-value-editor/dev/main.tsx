import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { DefaultValueEditor } from '../src';
import type { KeyValueEntry } from '../src';

let _id = 0;
const uid = () => `demo_${++_id}_${Date.now()}`;

const INITIAL: KeyValueEntry[] = [
  { id: uid(), key: 'Host', value: 'github.com' },
  { id: uid(), key: 'Branch', value: 'main' },
  { id: uid(), key: 'Registry', value: 'npm' },
  { id: uid(), key: 'Organization', value: 'my-org' },
];

function App() {
  const [entries, setEntries] = useState<KeyValueEntry[]>(INITIAL);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-start justify-center p-4 sm:p-8"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-2xl">
        <DefaultValueEditor
          entries={entries}
          onEntriesChange={setEntries}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
