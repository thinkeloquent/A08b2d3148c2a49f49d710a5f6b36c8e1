import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import type { MultiValue } from 'react-select';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

const PMS_API = '/api/prompt-management-system';

interface PromptVersion {
  id: string;
  version_number: number;
  template: string;
  status: 'draft' | 'published' | 'archived' | 'disabled';
}

interface PromptSearchResult {
  id: string;
  name: string;
  description: string | null;
}

interface SelectedPrompt {
  id: string;
  name: string;
  versions: PromptVersion[];
  selectedVersionId: string;
  template: string;
}

interface PromptOption {
  value: string;
  label: string;
  description: string | null;
}

interface PromptTemplateRef {
  id: string;
  name: string;
  selected_version_id: string;
}

interface PromptPickerProps {
  onChange: (templates: string[]) => void;
  onItemsChange?: (refs: PromptTemplateRef[]) => void;
  initialPrompts?: PromptTemplateRef[];
}

/* ── Sortable item ─────────────────────────────────────────── */

function SortableItem({
  item,
  onVersionChange,
  onRemove,
}: {
  item: SelectedPrompt;
  onVersionChange: (promptId: string, versionId: string) => void;
  onRemove: (promptId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded"
    >
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700 truncate">{item.name}</div>
      </div>

      <select
        value={item.selectedVersionId}
        onChange={(e) => onVersionChange(item.id, e.target.value)}
        className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
      >
        {item.versions.map((v) => (
          <option key={v.id} value={v.id}>
            v{v.version_number} ({v.status})
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-1 text-gray-400 hover:text-red-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ── PromptPicker ──────────────────────────────────────────── */

export default function PromptPicker({ onChange, onItemsChange, initialPrompts }: PromptPickerProps) {
  const [items, setItems] = useState<SelectedPrompt[]>([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onItemsChangeRef = useRef(onItemsChange);
  onItemsChangeRef.current = onItemsChange;
  const initializedRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Restore initial prompts from session
  useEffect(() => {
    if (!initialPrompts || initialPrompts.length === 0 || initializedRef.current) return;
    initializedRef.current = true;

    Promise.all(
      initialPrompts.map(async (ref): Promise<SelectedPrompt | null> => {
        try {
          const res = await fetch(`${PMS_API}/prompts/${ref.id}`);
          if (!res.ok) return null;
          const prompt = await res.json();

          const versions: PromptVersion[] = (prompt.versions ?? [])
            .filter((v: PromptVersion) => v.template)
            .sort((a: PromptVersion, b: PromptVersion) => b.version_number - a.version_number);
          if (versions.length === 0) return null;

          const matchedVersion = versions.find((v) => v.id === ref.selected_version_id);
          const defaultVersion = matchedVersion ?? versions.find((v) => v.status === 'published') ?? versions[0];

          return {
            id: prompt.id,
            name: prompt.name,
            versions,
            selectedVersionId: defaultVersion.id,
            template: defaultVersion.template,
          };
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      const valid = results.filter((p): p is SelectedPrompt => p !== null);
      if (valid.length > 0) setItems(valid);
    });
  }, [initialPrompts]);

  // Push ordered templates to parent whenever items change
  useEffect(() => {
    onChangeRef.current(items.map((i) => i.template).filter(Boolean));
    onItemsChangeRef.current?.(
      items.map((i) => ({ id: i.id, name: i.name, selected_version_id: i.selectedVersionId })),
    );
  }, [items]);

  // Search PMS prompts
  const loadOptions = useCallback(async (inputValue: string): Promise<PromptOption[]> => {
    if (inputValue.length < 2) return [];
    try {
      const params = new URLSearchParams({
        search: inputValue,
        limit: '20',
        sort: 'updatedAt',
        order: 'desc',
      });
      const res = await fetch(`${PMS_API}/prompts?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data ?? []).map((p: PromptSearchResult) => ({
        value: p.id,
        label: p.name,
        description: p.description,
      }));
    } catch {
      return [];
    }
  }, []);

  // Handle multi-select changes
  async function handleSelect(selected: MultiValue<PromptOption>) {
    const existingIds = new Set(items.map((i) => i.id));
    const selectedIds = new Set(selected.map((s) => s.value));

    // Keep items that are still selected
    const kept = items.filter((i) => selectedIds.has(i.id));

    // Fetch details for newly added prompts
    const added = selected.filter((s) => !existingIds.has(s.value));
    const fetched = await Promise.all(
      added.map(async (opt): Promise<SelectedPrompt | null> => {
        try {
          const res = await fetch(`${PMS_API}/prompts/${opt.value}`);
          if (!res.ok) return null;
          const prompt = await res.json();

          const versions: PromptVersion[] = (prompt.versions ?? [])
            .filter((v: PromptVersion) => v.template)
            .sort((a: PromptVersion, b: PromptVersion) => b.version_number - a.version_number);
          if (versions.length === 0) return null;

          const published = versions.find((v) => v.status === 'published');
          const defaultVersion = published ?? versions[0];

          return {
            id: prompt.id,
            name: prompt.name,
            versions,
            selectedVersionId: defaultVersion.id,
            template: defaultVersion.template,
          };
        } catch {
          return null;
        }
      }),
    );

    setItems([...kept, ...fetched.filter((p): p is SelectedPrompt => p !== null)]);
  }

  function handleVersionChange(promptId: string, versionId: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== promptId) return item;
        const version = item.versions.find((v) => v.id === versionId);
        return { ...item, selectedVersionId: versionId, template: version?.template ?? '' };
      }),
    );
  }

  function handleRemove(promptId: string) {
    setItems((prev) => prev.filter((i) => i.id !== promptId));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === active.id);
      const newIdx = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  // Keep AsyncSelect value in sync with internal items
  const selectValue: PromptOption[] = items.map((item) => ({
    value: item.id,
    label: item.name,
    description: null,
  }));

  return (
    <div className="mb-3">
      <label className="text-xs text-gray-400 mb-1 block">Prompt Templates</label>

      <AsyncSelect<PromptOption, true>
        isMulti
        classNamePrefix="rs"
        cacheOptions
        loadOptions={loadOptions}
        value={selectValue}
        onChange={handleSelect}
        placeholder="Search prompt templates..."
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 2 ? 'Type at least 2 characters...' : 'No prompts found'
        }
        formatOptionLabel={(opt) => (
          <div>
            <div className="text-sm font-medium">{opt.label}</div>
            {opt.description && <div className="text-xs text-gray-500">{opt.description}</div>}
          </div>
        )}
      />

      {items.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onVersionChange={handleVersionChange}
                  onRemove={handleRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
