/**
 * Badge Component
 * Based on REQ.v002.md Label System
 */

import { type ReactNode, type HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import type { LabelColor } from '@/types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: LabelColor;
  removable?: boolean;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  children,
  variant = 'gray',
  removable = false,
  onRemove,
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const colorMap: Record<LabelColor, string> = {
    red: 'bg-red-100 text-red-700 border-red-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    pink: 'bg-pink-100 text-pink-700 border-pink-300',
  };

  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${colorMap[variant]}
        ${sizeMap[size]}
        ${className}
      `}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
