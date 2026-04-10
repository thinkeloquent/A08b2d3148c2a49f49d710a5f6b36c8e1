/**
 * FQDPPath Component
 * Display and copy FQDP paths with truncation
 * Based on: REQ.v002.jsx Section 7 (UX-009)
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FQDPPathProps {
  path: string;
  className?: string;
  maxLength?: number;
}

export function FQDPPath({ path, className, maxLength = 80 }: FQDPPathProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const displayPath = path.length > maxLength ? `${path.slice(0, maxLength)}...` : path;
  const shouldTruncate = path.length > maxLength;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div
        className="group relative flex-1 overflow-hidden rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
        title={shouldTruncate ? path : undefined}
      >
        <code className="font-mono text-sm text-gray-900">{displayPath}</code>

        {shouldTruncate && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-gray-50 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>

      <button
        onClick={handleCopy}
        className={cn(
          'flex items-center justify-center rounded-md border border-gray-300 bg-white p-2',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500',
          'transition-colors',
          copied && 'bg-green-50 border-green-300'
        )}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
        aria-label="Copy FQDP path to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </div>
  );
}
