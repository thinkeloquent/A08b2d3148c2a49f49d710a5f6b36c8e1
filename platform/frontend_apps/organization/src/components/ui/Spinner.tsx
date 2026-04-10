import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-primary-500',
        { 'h-4 w-4': size === 'sm', 'h-8 w-8': size === 'md', 'h-12 w-12': size === 'lg' },
        className
      )}
    />
  );
}
