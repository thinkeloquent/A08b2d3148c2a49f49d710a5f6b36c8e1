import { Box, Download, Star, User } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Component } from '@/types';

interface ComponentCardProps {
  component: Component;
  onSelect: (component: Component) => void;
}

export function ComponentCard({ component, onSelect }: ComponentCardProps) {
  return (
    <div
      onClick={() => onSelect(component)}
      className="group bg-white rounded-lg border border-gray-200 p-5 transition-all hover:border-indigo-300 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
            <Box className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
              {component.name}
            </h3>
            <p className="text-sm text-gray-400">v{component.version}</p>
          </div>
        </div>
        <StatusBadge status={component.status} />
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {component.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {component.tags.slice(0, 3).map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs border border-gray-100"
          >
            {tag.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            {(component.downloads / 1000).toFixed(1)}k
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {component.stars}
          </span>
        </div>
        <span className="flex items-center gap-1 text-sm text-gray-400">
          <User className="w-3.5 h-3.5" />
          {component.author}
        </span>
      </div>
    </div>
  );
}
