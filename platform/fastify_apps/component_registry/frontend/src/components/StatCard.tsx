import { TrendingUp } from 'lucide-react';
import type { StatCardProps } from '@/types';

const variants = {
  default: 'bg-white border-gray-200',
  highlight: 'bg-indigo-50 border-indigo-100',
  accent: 'bg-violet-50 border-violet-100',
};

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  return (
    <div
      className={`p-5 rounded-lg border transition-colors hover:shadow-sm ${variants[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {value.toLocaleString()}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className={`w-3.5 h-3.5 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}
              />
              <span
                className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {change >= 0 ? '+' : ''}
                {change}% this week
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
}
