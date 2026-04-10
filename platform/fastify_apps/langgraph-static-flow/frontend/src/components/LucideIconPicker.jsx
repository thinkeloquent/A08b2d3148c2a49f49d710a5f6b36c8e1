import { useState, useMemo, createElement } from 'react';
import Select, { components } from 'react-select';
import { icons } from 'lucide-react';

/**
 * Curated icons shown by default before the user types a search query.
 * Grouped by workflow-relevant categories.
 */
const CURATED_ICONS = [
  // Control flow
  'Play', 'CircleStop', 'SkipForward', 'RotateCcw', 'Flag', 'FlagTriangleRight',
  'CircleCheck', 'CircleX', 'CirclePause', 'Timer',
  // Processing
  'FileText', 'PenLine', 'Sparkles', 'Cpu', 'Cog', 'Workflow', 'Zap',
  'BrainCircuit', 'Bot', 'Wand2', 'Layers', 'GitBranch', 'GitMerge',
  // Analysis
  'Search', 'ScanSearch', 'ChartBar', 'TrendingUp', 'Filter', 'Database',
  'FlaskConical', 'Microscope', 'Gauge', 'Eye',
  // Interaction
  'MessageCircle', 'MessageSquare', 'Mail', 'Bell', 'UserCheck', 'Users',
  'ThumbsUp', 'ThumbsDown', 'HandMetal', 'Send',
  // Data
  'FileInput', 'FileOutput', 'Download', 'Upload', 'FolderOpen', 'Archive',
  'ClipboardList', 'ListChecks', 'Table', 'Sheet',
  // Misc
  'Shield', 'Lock', 'Key', 'Globe', 'Cloud', 'Server',
  'Webhook', 'Cable', 'Plug', 'Settings',
];

/** Convert PascalCase to spaced label: "BrainCircuit" → "Brain Circuit" */
function toLabel(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/** Build a single option object */
function buildOption(name) {
  return { value: name, label: toLabel(name), iconName: name };
}

/** All icon names for search (lazy, built once) */
let _allNames = null;
function getAllNames() {
  if (!_allNames) _allNames = Object.keys(icons);
  return _allNames;
}

const curatedOptions = CURATED_ICONS
  .filter((name) => icons[name])
  .map(buildOption);

/** Filter/search across all 1700+ icons, return max 60 results */
function searchIcons(input) {
  if (!input) return curatedOptions;
  const q = input.toLowerCase();
  const results = [];
  for (const name of getAllNames()) {
    if (name.toLowerCase().includes(q)) {
      results.push(buildOption(name));
      if (results.length >= 60) break;
    }
  }
  return results;
}

// ─── Custom react-select components ─────────────────────────────────────────

function IconOption(props) {
  const { data } = props;
  const IconComponent = icons[data.iconName];
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2.5">
        {IconComponent && createElement(IconComponent, { size: 16, strokeWidth: 1.5 })}
        <span className="text-xs">{data.label}</span>
      </div>
    </components.Option>
  );
}

function IconSingleValue(props) {
  const { data } = props;
  const IconComponent = icons[data.iconName];
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {IconComponent && createElement(IconComponent, { size: 16, strokeWidth: 1.5 })}
        <span className="text-xs">{data.label}</span>
      </div>
    </components.SingleValue>
  );
}

// ─── Styles matching .field-input ───────────────────────────────────────────

export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '34px',
    fontSize: '0.8125rem',
    background: state.isFocused ? '#fff' : '#f8fafc',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#cbd5e1' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '240px',
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    padding: '6px 10px',
    background: state.isFocused ? '#eef2ff' : 'transparent',
    color: state.isFocused ? '#4338ca' : '#334155',
    cursor: 'pointer',
    '&:active': { background: '#e0e7ff' },
  }),
  singleValue: (base) => ({ ...base, color: '#334155' }),
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '0.8125rem' }),
  input: (base) => ({ ...base, color: '#334155', fontSize: '0.8125rem' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: '4px 6px', color: '#94a3b8' }),
};

// ─── Main Component ─────────────────────────────────────────────────────────

/**
 * @param {{ value: string, onChange: (iconName: string) => void }} props
 * value is a lucide icon name (PascalCase) e.g. "FileText"
 */
export default function LucideIconPicker({ value, onChange }) {
  const [filteredOptions, setFilteredOptions] = useState(curatedOptions);

  const selectedOption = useMemo(() => {
    if (!value || !icons[value]) return null;
    return buildOption(value);
  }, [value]);

  const handleInputChange = (input) => {
    setFilteredOptions(searchIcons(input));
  };

  return (
    <Select
      value={selectedOption}
      onChange={(opt) => onChange(opt ? opt.value : '')}
      options={filteredOptions}
      onInputChange={handleInputChange}
      filterOption={null}
      components={{ Option: IconOption, SingleValue: IconSingleValue }}
      styles={selectStyles}
      placeholder="Search icons..."
      isClearable
      isSearchable
      noOptionsMessage={() => 'No icons found'}
    />
  );
}

/**
 * Render a lucide icon by name. Falls back to the raw value (emoji) if not found.
 * Use this everywhere icons are displayed (node cards, lists, previews).
 */
export function RenderIcon({ name, size = 18, strokeWidth = 1.5, className = '' }) {
  if (!name) return null;
  const IconComponent = icons[name];
  if (IconComponent) {
    return createElement(IconComponent, { size, strokeWidth, className });
  }
  // Fallback: render as raw text (emoji or string)
  return <span className={className}>{name}</span>;
}
