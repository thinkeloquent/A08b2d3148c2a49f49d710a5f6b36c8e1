import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { useUploadInstance } from '../hooks/queries';

interface Props {
  datasourceId: string;
  onBack: () => void;
  onSuccess: (instanceId: string) => void;
}

export function UploadPage({ datasourceId, onBack, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [instanceDate, setInstanceDate] = useState('');
  const [preview, setPreview] = useState<string[][]>([]);
  const uploadMutation = useUploadInstance();

  const handleFile = (f: File) => {
    setFile(f);
    // Parse preview (first 6 lines)
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').slice(0, 6).map((l) => l.split(',').map((v) => v.trim()));
      setPreview(lines);
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    const result = await uploadMutation.mutateAsync({
      datasourceId,
      file,
      label: label || undefined,
      instanceDate: instanceDate || undefined,
    });
    onSuccess(result.id);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload CSV</h1>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <FileDropzone onFile={handleFile} />

        {file && (
          <>
            <p className="text-sm text-slate-600">
              Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
            </p>

            {preview.length > 0 && (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {preview[0]?.map((h, i) => (
                        <th key={i} className="px-2 py-1 text-left font-medium text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-2 py-1 text-slate-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., March 2026 Scan"
                  className="border rounded-lg px-3 py-2 w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instance Date (optional)</label>
                <input
                  type="date"
                  value={instanceDate}
                  onChange={(e) => setInstanceDate(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Upload & Process
            </button>
          </>
        )}
      </div>
    </div>
  );
}
