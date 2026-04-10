import { useState, useCallback } from 'react';
import type {
  PanelPropertyDesignGuideProps,
  GuideSettings,
  TypeOption,
  AlignOption,
} from './types';

const DEFAULT_SETTINGS: GuideSettings = {
  type: 'columns',
  count: 12,
  align: 'left',
  width: 65,
  gap: 30,
  margin: 15,
  color: '#0099FF',
};

const DEFAULT_TYPE_OPTIONS: TypeOption[] = [
  { id: 'rows', icon: <span className="font-mono text-lg">{'\u2261'}</span>, label: 'Rows' },
  { id: 'columns', icon: <span className="font-mono text-lg">|||</span>, label: 'Columns' },
  { id: 'grid', icon: <span className="font-mono text-lg">{'\u268F'}</span>, label: 'Grid' },
];

const DEFAULT_ALIGN_OPTIONS: AlignOption[] = [
  { id: 'left', icon: <AlignIcon lines={[16, 12, 14]} />, label: 'Align Left' },
  { id: 'center', icon: <AlignIcon lines={[12, 16, 14]} center />, label: 'Align Center' },
  { id: 'right', icon: <AlignIcon lines={[12, 14, 16]} right />, label: 'Align Right' },
  { id: 'justify', icon: <AlignIcon lines={[16, 16, 16]} />, label: 'Align Justify' },
];

function AlignIcon({ lines, center, right }: { lines: number[]; center?: boolean; right?: boolean }) {
  const align = center ? 'items-center' : right ? 'items-end' : 'items-start';
  return (
    <div className={['flex flex-col gap-0.5 w-4 h-4 justify-center', align].filter(Boolean).join(' ')}>
      {lines.map((w, i) => (
        <div key={i} className="h-px bg-current rounded-full" style={{ width: w }} />
      ))}
    </div>
  );
}

export function PanelPropertyDesignGuide({
  className,
  defaultSettings,
  settings: controlledSettings,
  onSettingsChange,
  defaultOpen = true,
  typeOptions = DEFAULT_TYPE_OPTIONS,
  alignOptions = DEFAULT_ALIGN_OPTIONS,
  title = 'Guides',
  toggleIcon,
  closeIcon,
  decrementIcon,
  incrementIcon,
}: PanelPropertyDesignGuideProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [internalSettings, setInternalSettings] = useState<GuideSettings>({
    ...DEFAULT_SETTINGS,
    ...defaultSettings,
  });

  const isControlled = controlledSettings !== undefined;
  const settings = isControlled ? controlledSettings : internalSettings;

  const updateSetting = useCallback(
    <K extends keyof GuideSettings>(key: K, value: GuideSettings[K]) => {
      const next = { ...settings, [key]: value };
      if (!isControlled) setInternalSettings(next);
      onSettingsChange?.(next);
    },
    [settings, isControlled, onSettingsChange],
  );

  const incrementCount = useCallback(() => {
    updateSetting('count', Math.min(settings.count + 1, 99));
  }, [settings.count, updateSetting]);

  const decrementCount = useCallback(() => {
    updateSetting('count', Math.max(settings.count - 1, 1));
  }, [settings.count, updateSetting]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={[
          'bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-all duration-200',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {toggleIcon ?? <div className="w-6 h-6 border border-white rounded opacity-60" />}
      </button>
    );
  }

  return (
    <div
      className={[
        'w-80 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium text-gray-200">{title}</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          {closeIcon ?? (
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-6">
        {/* Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Type</label>
          <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
            {typeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateSetting('type', option.id)}
                className={[
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
                  settings.type === option.id
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
                ].join(' ')}
                title={option.label}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Count</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.count}
              onChange={(e) => updateSetting('count', Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="99"
            />
            <button
              onClick={decrementCount}
              className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
            >
              {decrementIcon ?? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              )}
            </button>
            <button
              onClick={incrementCount}
              className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
            >
              {incrementIcon ?? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Align */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Align</label>
          <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
            {alignOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateSetting('align', option.id)}
                className={[
                  'flex-1 py-2 px-2 rounded-md transition-all',
                  settings.align === option.id
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
                ].join(' ')}
                title={option.label}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Width Slider */}
        <SliderControl
          label="Width"
          value={settings.width}
          min={10}
          max={100}
          onChange={(v) => updateSetting('width', v)}
        />

        {/* Gap Slider */}
        <SliderControl
          label="Gap"
          value={settings.gap}
          min={0}
          max={50}
          onChange={(v) => updateSetting('gap', v)}
          accent
        />

        {/* Margin Slider */}
        <SliderControl
          label="Margin"
          value={settings.margin}
          min={0}
          max={50}
          onChange={(v) => updateSetting('margin', v)}
        />

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.color}
              onChange={(e) => updateSetting('color', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-600 bg-transparent"
            />
            <input
              type="text"
              value={settings.color.toUpperCase()}
              onChange={(e) => updateSetting('color', e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* Visual Preview */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Preview</div>
        <div
          className="h-20 bg-gray-800 rounded-lg relative overflow-hidden"
          style={{ margin: `${settings.margin}px` }}
        >
          {settings.type === 'columns' && (
            <div className="flex h-full" style={{ gap: `${settings.gap}px` }}>
              {Array.from({ length: Math.min(settings.count, 8) }).map((_, i) => (
                <div
                  key={i}
                  className="h-full opacity-60"
                  style={{
                    backgroundColor: settings.color,
                    width: `${settings.width}%`,
                    flex: settings.align === 'justify' ? '1' : 'none',
                  }}
                />
              ))}
            </div>
          )}
          {settings.type === 'rows' && (
            <div className="flex flex-col h-full" style={{ gap: `${settings.gap}px` }}>
              {Array.from({ length: Math.min(settings.count, 5) }).map((_, i) => (
                <div
                  key={i}
                  className="w-full opacity-60"
                  style={{
                    backgroundColor: settings.color,
                    height: `${settings.width}%`,
                    flex: settings.align === 'justify' ? '1' : 'none',
                  }}
                />
              ))}
            </div>
          )}
          {settings.type === 'grid' && (
            <div
              className="grid h-full opacity-60"
              style={{
                gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(settings.count)), 4)}, 1fr)`,
                gap: `${settings.gap}px`,
              }}
            >
              {Array.from({ length: Math.min(settings.count, 16) }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-full"
                  style={{ backgroundColor: settings.color }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pdg-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .pdg-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .pdg-slider-accent::-webkit-slider-thumb {
          background: #0099FF;
        }
        .pdg-slider-accent::-moz-range-thumb {
          background: #0099FF;
        }
      `}</style>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accent?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm text-gray-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={[
          'w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer pdg-slider',
          accent ? 'pdg-slider-accent' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  );
}
