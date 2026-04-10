import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Figma,
  TrendingUp,
  Shield,
  ExternalLink,
  Clock,
  User,
  FileText,
  AlertCircle,
  RefreshCw,
  Layers,
  Component,
  Palette,
} from 'lucide-react';
import { useState } from 'react';
import { useFigmaFile, useDeleteFigmaFile, apiToUiFigmaFile } from '@/hooks';
import { ConfirmDialog } from '@/components/feedback';
import { isApiError } from '@/types/errors';

const typeLabels: Record<string, string> = {
  design_system: 'Design System',
  component_library: 'Component Library',
  prototype: 'Prototype',
  illustration: 'Illustration',
  icon_set: 'Icon Set',
};

export function FigmaFileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: figmaFileResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFigmaFile(id!, {
    include_tags: true,
    include_metadata: true,
    enabled: !!id,
  });

  const deleteFigmaFile = useDeleteFigmaFile();

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteFigmaFile.mutateAsync(id);
      navigate('/figma-files');
    } catch {
      // Error handling
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !figmaFileResponse) {
    const errorMessage = isApiError(error)
      ? error.getUserMessage()
      : 'Failed to load figma file';

    return (
      <div className="max-w-4xl mx-auto">
        <Link
          to="/figma-files"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Figma Files
        </Link>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const figmaFile = apiToUiFigmaFile(figmaFileResponse.figmaFile);

  const statusColors = {
    stable: 'bg-green-100 text-green-800 border-green-200',
    beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    deprecated: 'bg-red-100 text-red-800 border-red-200',
    experimental: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/figma-files"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Figma Files
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Figma className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{figmaFile.name}</h1>
                  {figmaFile.verified && (
                    <Shield className="w-5 h-5 text-blue-500 fill-blue-100" />
                  )}
                  {figmaFile.trending && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1">
                  {typeLabels[figmaFile.type] || figmaFile.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/figma-files/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {figmaFile.description && (
            <p className="mt-4 text-gray-600">{figmaFile.description}</p>
          )}

          <div className="flex items-center gap-4 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[figmaFile.status]}`}
            >
              {figmaFile.status}
            </span>
            {figmaFile.editorType && (
              <span className="text-sm text-gray-500">{figmaFile.editorType}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-blue-500">
              <Layers className="w-5 h-5" />
              <span className="text-2xl font-bold text-gray-900">{figmaFile.pageCount}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Pages</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-purple-500">
              <Component className="w-5 h-5" />
              <span className="text-2xl font-bold text-gray-900">{figmaFile.componentCount}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Components</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-pink-500">
              <Palette className="w-5 h-5" />
              <span className="text-2xl font-bold text-gray-900">{figmaFile.styleCount}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Styles</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          {/* Links */}
          {figmaFile.figmaUrl && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Links
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={figmaFile.figmaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Figma className="w-4 h-4" />
                  Open in Figma
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {figmaFile.lastModifiedBy && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Last Modified By</p>
                    <p className="text-sm font-medium">{figmaFile.lastModifiedBy}</p>
                  </div>
                </div>
              )}
              {figmaFile.figmaFileKey && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">File Key</p>
                    <p className="text-sm font-medium font-mono">{figmaFile.figmaFileKey}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {figmaFile.tags.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {figmaFile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documentation */}
          {figmaFile.documentation.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Documentation ({figmaFile.documentation.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {figmaFile.documentation.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">
                      {doc.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Figma File"
        message={`Are you sure you want to delete "${figmaFile.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteFigmaFile.isPending}
      />
    </div>
  );
}
