import { useState } from 'react';
import {
  X,
  Download,
  Star,
  Eye,
  Heart,
  GitBranch,
  Copy,
  ExternalLink,
  Check,
  Box,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Component } from '@/types';

interface ComponentDetailPanelProps {
  component: Component | null;
  onClose: () => void;
}

export function ComponentDetailPanel({
  component,
  onClose,
}: ComponentDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!component) return null;

  const installCommand = `npm install @registry/${component.name.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-lg border-l border-gray-200 z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {component.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-400">
                  v{component.version}
                </span>
                <span className="text-gray-300">·</span>
                <StatusBadge status={component.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            Install
          </button>
          <button className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Description
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{component.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <Download className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-base font-semibold text-gray-800">
              {(component.downloads / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-400">Downloads</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-1" />
            <p className="text-base font-semibold text-gray-800">{component.stars}</p>
            <p className="text-xs text-gray-400">Stars</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <GitBranch className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-base font-semibold text-gray-800">47</p>
            <p className="text-xs text-gray-400">Forks</p>
          </div>
        </div>

        {/* Install Command */}
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Installation
          </h3>
          <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
            <div className="flex items-center justify-between">
              <code className="text-indigo-300">{installCommand}</code>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {component.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs border border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Author */}
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Author</h3>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
              {component.author[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{component.author}</p>
              <p className="text-xs text-gray-400">Component Publisher</p>
            </div>
            <button className="p-1.5 hover:bg-gray-200 rounded-md transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
