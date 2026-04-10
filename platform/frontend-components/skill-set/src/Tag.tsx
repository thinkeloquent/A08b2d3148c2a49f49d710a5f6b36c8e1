import type { TagProps } from './types';

const defaultColors = {
  bg: '#F3F4F6',
  color: '#4B5563',
  border: '#E5E7EB',
};

export function Tag({ label, colors, sm, className = '' }: TagProps) {
  const c = colors ?? defaultColors;
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap ${
        sm ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-[11px]'
      } ${className}`}
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      {label}
    </span>
  );
}
