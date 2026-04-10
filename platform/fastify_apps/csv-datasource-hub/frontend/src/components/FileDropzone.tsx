import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
}

export function FileDropzone({ onFile, accept = '.csv' }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'
      }`}
    >
      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
      <p className="text-sm text-slate-600 mb-1">Drag & drop a CSV file here, or click to browse</p>
      <input type="file" accept={accept} onChange={handleChange} className="hidden" id="file-input" />
      <label htmlFor="file-input" className="text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
        Choose file
      </label>
    </div>
  );
}
