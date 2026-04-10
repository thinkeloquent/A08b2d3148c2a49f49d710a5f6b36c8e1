import type { PolicySelectProps } from './types';

const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;

export function PolicySelect({ label, value, onChange, options, disabled, className }: PolicySelectProps) {
  return (
    <div className={['space-y-1.5', className].filter(Boolean).join(' ')}>
      <label className="block text-xs text-gray-400 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={[
          'w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700 cursor-pointer',
        ].join(' ')}
        style={{
          backgroundImage: chevronSvg,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '14px',
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
