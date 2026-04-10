import { Link } from 'react-router-dom';
import { Figma, Tags, FileText, Plus, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { useFigmaFiles, useTags } from '@/hooks';
import { isApiError } from '@/types/errors';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  linkTo: string;
  linkText: string;
  color: string;
}

function StatCard({ title, value, icon, linkTo, linkText, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
      <Link
        to={linkTo}
        className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        {linkText}
        <span className="ml-1">&rarr;</span>
      </Link>
    </div>
  );
}

export function DashboardPage() {
  const { data: figmaFilesResponse, isLoading: figmaFilesLoading, error: figmaFilesError } = useFigmaFiles();
  const { data: tagsResponse, isLoading: tagsLoading, error: tagsError } = useTags();

  const figmaFiles = figmaFilesResponse?.figmaFiles || [];
  const tags = tagsResponse?.tags || [];

  const trendingCount = figmaFiles.filter((f) => f.trending).length;
  const verifiedCount = figmaFiles.filter((f) => f.verified).length;
  const metadataCount = figmaFiles.reduce(
    (acc, f) => acc + (f.metadata?.length || 0),
    0
  );

  const isLoading = figmaFilesLoading || tagsLoading;
  const error = figmaFilesError || tagsError;

  if (error) {
    const errorMessage = isApiError(error)
      ? error.getUserMessage()
      : 'Failed to load dashboard data';

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of your Figma file management system
          </p>
        </div>
        <Link
          to="/figma-files/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Figma File
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              </div>
              <div className="mt-4 h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Figma Files"
            value={figmaFiles.length}
            icon={<Figma className="w-6 h-6 text-purple-600" />}
            linkTo="/figma-files"
            linkText="View all figma files"
            color="bg-purple-100"
          />
          <StatCard
            title="Tags"
            value={tags.length}
            icon={<Tags className="w-6 h-6 text-blue-600" />}
            linkTo="/tags"
            linkText="Manage tags"
            color="bg-blue-100"
          />
          <StatCard
            title="Metadata Items"
            value={metadataCount}
            icon={<FileText className="w-6 h-6 text-green-600" />}
            linkTo="/metadata"
            linkText="View metadata"
            color="bg-green-100"
          />
          <StatCard
            title="Trending"
            value={trendingCount}
            icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
            linkTo="/figma-files?trending=true"
            linkText="View trending"
            color="bg-orange-100"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Verified Figma Files</span>
              </div>
              <span className="font-semibold text-gray-900">{verifiedCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Figma className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">Design Systems</span>
              </div>
              <span className="font-semibold text-gray-900">
                {figmaFiles.filter((f) => f.type === 1).length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Figma className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Component Libraries</span>
              </div>
              <span className="font-semibold text-gray-900">
                {figmaFiles.filter((f) => f.type === 2).length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Figma className="w-4 h-4 text-pink-500" />
                <span className="text-gray-600">Prototypes</span>
              </div>
              <span className="font-semibold text-gray-900">
                {figmaFiles.filter((f) => f.type === 3).length}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/figma-files/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Figma File</p>
                <p className="text-sm text-gray-500">Create a new Figma file entry</p>
              </div>
            </Link>
            <Link
              to="/tags/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tags className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Tag</p>
                <p className="text-sm text-gray-500">Add a new categorization tag</p>
              </div>
            </Link>
            <Link
              to="/figma-files"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Figma className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse Figma Files</p>
                <p className="text-sm text-gray-500">View and manage all Figma files</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
