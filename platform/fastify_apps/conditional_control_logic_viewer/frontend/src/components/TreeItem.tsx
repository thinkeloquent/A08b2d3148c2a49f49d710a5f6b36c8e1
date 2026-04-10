import { forwardRef, useState, useMemo } from 'react';
import { SimpleTreeItemWrapper } from 'dnd-kit-sortable-tree';
import Select from 'react-select';
import { ChevronDown, ChevronRight, X, GripVertical } from 'lucide-react';
import { useFieldOptions } from '@/hooks/useDropdownOptions';
import type { FilterTreeItemProps } from '@/types';

interface ExpanderProps {
  value: string;
  onChange: (value: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

function Expander({ value, onChange, expanded, onToggle }: ExpanderProps) {
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
      >
        <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
        <span>{value || 'Click to edit...'}</span>
      </button>

      {expanded && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-slate-200 rounded-md shadow-lg z-20 min-w-[250px]">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter value..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="fixed inset-0 -z-10" onClick={(e) => { e.stopPropagation(); onToggle(); }} />
        </div>
      )}
    </div>
  );
}

export const TreeItem = forwardRef<HTMLDivElement, FilterTreeItemProps>(
  (props, ref) => {
    const { item } = props;
    const fieldOptions = useFieldOptions();

    // State for filter
    const [field, setField] = useState(item.condition?.field || '');
    const [filterValue, setFilterValue] = useState(item.condition?.value || '"emoji test" segment');
    const [isExpanded, setIsExpanded] = useState(false);

    // State for inline text editing (legacy text-based filters)
    const [isEditingText, setIsEditingText] = useState(false);
    const [editText, setEditText] = useState(item.text || '');

    const isGroup = item.type === 'group';

    const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
    const [currentOperator, setCurrentOperator] = useState(item.operator || 'AND');

    // react-select option format
    const selectOptions = useMemo(
      () => fieldOptions.map((o) => ({ value: o.value, label: o.label })),
      [fieldOptions],
    );
    const selectedOption = useMemo(
      () => selectOptions.find((o) => o.value === field) || null,
      [selectOptions, field],
    );

    return (
      <SimpleTreeItemWrapper {...props} ref={ref} showDragHandle={false} hideCollapseButton>
        <div
          className={`
            flex items-center gap-2 px-3 py-2.5 rounded-lg group
            ${isGroup
              ? 'bg-transparent'
              : 'bg-sky-50 border border-sky-200 shadow-sm hover:shadow-md hover:border-sky-300'
            }
            transition-all duration-200
          `}
        >
          {/* Drag Handle - custom handle for all items */}
          <div
            {...props.handleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
          >
            <GripVertical className="w-4 h-4" />
          </div>


          {/* Operator badge dropdown for groups */}
          {isGroup && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOperatorDropdown(!showOperatorDropdown);
                }}
                className={`
                  flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                  transition-all duration-200
                  ${currentOperator === 'AND'
                    ? 'bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
                  }
                `}
              >
                {currentOperator}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showOperatorDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowOperatorDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden min-w-[80px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentOperator('AND');
                        setShowOperatorDropdown(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 ${
                        currentOperator === 'AND' ? 'bg-sky-50 text-sky-700' : 'text-slate-600'
                      }`}
                    >
                      AND
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentOperator('OR');
                        setShowOperatorDropdown(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 ${
                        currentOperator === 'OR' ? 'bg-amber-50 text-amber-700' : 'text-slate-600'
                      }`}
                    >
                      OR
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Filter with selector and expander */}
          {!isGroup && (
            <>
              {/* If item has text (legacy), show text; otherwise show selector + expander */}
              {item.text ? (
                isEditingText ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => setIsEditingText(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingText(false);
                      if (e.key === 'Escape') {
                        setEditText(item.text || '');
                        setIsEditingText(false);
                      }
                    }}
                    autoFocus
                    className="flex-1 text-sm text-slate-600 bg-transparent border-none outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="flex-1 text-sm text-slate-600 whitespace-nowrap cursor-default"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setIsEditingText(true);
                      setEditText(item.text || '');
                    }}
                  >
                    {editText || item.text}
                  </span>
                )
              ) : (
                <div className="flex items-center gap-2 flex-1 flex-nowrap min-w-0">
                  {/* Searchable field selector */}
                  <div
                    className="min-w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Select
                      value={selectedOption}
                      onChange={(opt) => { if (opt) setField(opt.value); }}
                      options={selectOptions}
                      placeholder="Search fields..."
                      isSearchable
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '32px',
                          fontSize: '0.875rem',
                          borderColor: '#e2e8f0',
                          boxShadow: 'none',
                          '&:hover': { borderColor: '#94a3b8' },
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: '0 8px',
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0,
                        }),
                        indicatorSeparator: () => ({ display: 'none' }),
                        dropdownIndicator: (base) => ({
                          ...base,
                          padding: '4px',
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: '0.875rem',
                          backgroundColor: state.isSelected
                            ? '#e0f2fe'
                            : state.isFocused
                              ? '#f1f5f9'
                              : 'white',
                          color: state.isSelected ? '#0369a1' : '#475569',
                          '&:active': { backgroundColor: '#e0f2fe' },
                        }),
                      }}
                    />
                  </div>

                  {/* Expander */}
                  <Expander
                    value={filterValue}
                    onChange={setFilterValue}
                    expanded={isExpanded}
                    onToggle={() => setIsExpanded(!isExpanded)}
                  />
                </div>
              )}

            </>
          )}

          {/* Delete button — for all item types */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onRemove?.();
            }}
            className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-full transition-all"
          >
            <X className="w-4 h-4 text-red-400 hover:text-red-600" />
          </button>

        </div>
      </SimpleTreeItemWrapper>
    );
  }
);

TreeItem.displayName = 'TreeItem';
