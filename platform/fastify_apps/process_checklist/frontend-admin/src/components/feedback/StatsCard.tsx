import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  linkTo: string;
  linkText: string;
  color: string;
}

export function StatsCard({
  title,
  value,
  icon,
  linkTo,
  linkText,
  color,
}: StatsCardProps) {
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
