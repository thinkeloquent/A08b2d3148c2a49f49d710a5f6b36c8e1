import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Label {
  key: string;
  value: string;
}

interface LabelEditorProps {
  labels: Label[];
  onChange: (labels: Label[]) => void;
}

export function LabelEditor({ labels, onChange }: LabelEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addLabel = () => {
    if (!newKey.trim()) return;
    onChange([...labels, { key: newKey.trim(), value: newValue.trim() }]);
    setNewKey('');
    setNewValue('');
  };

  const removeLabel = (idx: number) => {
    onChange(labels.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {labels.map((label, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{label.key}</span>
          <span className="text-sm text-slate-700">{label.value}</span>
          <button onClick={() => removeLabel(idx)} className="text-slate-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-32"
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="border rounded px-2 py-1 text-sm flex-1"
          onKeyDown={(e) => e.key === 'Enter' && addLabel()}
        />
        <button onClick={addLabel} className="text-indigo-600 hover:text-indigo-700">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
