/**
 * RoleIconPicker Component
 * Icon selector for roles
 * Based on REQ.v002.md Section 2.1 (Role Management)
 */

import { Check } from 'lucide-react';
import { RoleIcon } from '@/utils/icons';
import type { RoleIconType } from '@/types';

interface RoleIconPickerProps {
  selectedIcon: RoleIconType;
  onChange: (icon: RoleIconType) => void;
}

export function RoleIconPicker({ selectedIcon, onChange }: RoleIconPickerProps) {
  const iconOptions: Array<{ icon: RoleIconType; label: string }> = [
    { icon: 'shield', label: 'Shield' },
    { icon: 'lock', label: 'Lock' },
    { icon: 'eye', label: 'Eye' },
    { icon: 'settings', label: 'Settings' },
    { icon: 'file', label: 'File' },
    { icon: 'credit', label: 'Credit Card' },
    { icon: 'code', label: 'Code' },
    { icon: 'chart', label: 'Chart' },
    { icon: 'palette', label: 'Palette' },
    { icon: 'database', label: 'Database' },
    { icon: 'mail', label: 'Mail' },
    { icon: 'sparkles', label: 'Sparkles' },
  ];

  return (
    <div>
      <div className="grid grid-cols-6 gap-3">
        {iconOptions.map(({ icon, label }) => {
          const isSelected = selectedIcon === icon;
          return (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              className={`
                relative p-4 rounded-lg border-2 transition-all hover:scale-105
                ${
                  isSelected
                    ? 'bg-primary-50 border-primary-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
              title={label}
            >
              <RoleIcon
                icon={icon}
                className={`w-6 h-6 mx-auto ${isSelected ? 'text-primary-600' : 'text-gray-600'}`}
              />
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-primary-600 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Select an icon that represents this role
      </p>
    </div>
  );
}
