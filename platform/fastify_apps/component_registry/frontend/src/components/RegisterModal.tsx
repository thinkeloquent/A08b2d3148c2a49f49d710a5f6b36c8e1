import { useState } from 'react';
import { Plus, X, Check, Box } from 'lucide-react';
import { useCategories } from '@/hooks/useComponents';
import { resolveIcon } from '@/data/categories';
import type { RegisterFormData } from '@/types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: RegisterFormData) => void;
}

export function RegisterModal({ isOpen, onClose, onRegister }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    category: '',
    description: '',
    version: '1.0.0',
    branch: '',
    release: '',
    repoLink: '',
    shaCommit: '',
    tags: '',
  });

  const { data: apiCategories = [] } = useCategories();

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      category: '',
      description: '',
      version: '1.0.0',
      branch: '',
      release: '',
      repoLink: '',
      shaCommit: '',
      tags: '',
    });
    onClose();
  };

  const handleSubmit = () => {
    onRegister(formData);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Register New Component
                </h2>
                <p className="text-gray-400 text-sm">
                  Add your component to the registry
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-5">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step >= s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-10 h-0.5 rounded ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Component Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., SuperTable, FormWizard"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {apiCategories.map((cat) => {
                    const Icon = resolveIcon(cat.icon);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, category: cat.slug })
                        }
                        className={`p-3 rounded-lg border transition-colors ${
                          formData.category === cat.slug
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs font-medium">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what your component does..."
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors resize-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    placeholder="1.0.0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    placeholder="main"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Release
                  </label>
                  <input
                    type="text"
                    value={formData.release}
                    onChange={(e) =>
                      setFormData({ ...formData, release: e.target.value })
                    }
                    placeholder="2026.03"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    SHA Commit
                  </label>
                  <input
                    type="text"
                    value={formData.shaCommit}
                    onChange={(e) =>
                      setFormData({ ...formData, shaCommit: e.target.value })
                    }
                    placeholder="e.g., a1b2c3d4"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Repo Link
                  </label>
                  <input
                    type="url"
                    value={formData.repoLink}
                    onChange={(e) =>
                      setFormData({ ...formData, repoLink: e.target.value })
                    }
                    placeholder="https://github.com/org/repo"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="table, sorting, data"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Ready to Register
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Your component details have been collected. Click register to
                add it to the registry.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left max-w-sm mx-auto border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Box className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {formData.name || 'Component Name'}
                    </p>
                    <p className="text-xs text-gray-400">v{formData.version}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {formData.description || 'No description provided'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <button
            onClick={() => (step < 3 ? setStep(step + 1) : handleSubmit())}
            disabled={
              (step === 1 && (!formData.name || !formData.category)) ||
              (step === 2 && !formData.description)
            }
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step < 3 ? 'Continue' : 'Register Component'}
          </button>
        </div>
      </div>
    </div>
  );
}
