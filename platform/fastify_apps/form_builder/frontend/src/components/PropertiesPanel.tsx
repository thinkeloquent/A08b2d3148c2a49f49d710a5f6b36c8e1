import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import {
  FormElement,
  SelectOption,
  ElementReference,
  AnnotationEntry,
  ANNOTATION_TYPES,
  AnnotationType,
  COMPONENT_LIBRARIES,
  ComponentLibrary,
} from "../types";
import { useFormBuilder } from "../context/FormBuilderContext";
import { X, Plus, Trash2, Layers, Zap } from "lucide-react";
import MetaAttachmentPanel from "./MetaAttachmentPanel";

// Options for react-select
const annotationTypeOptions = ANNOTATION_TYPES.filter(
  (t) => t !== "custom"
).map((type) => ({
  value: type,
  label: type,
}));

// Component library options with labels
const componentLibraryLabels: Record<ComponentLibrary, string> = {
  tailwind: "TailwindCSS",
  "material-ui": "Material-UI",
  shadcn: "shadcn/ui",
};

// Shared styles for CreatableSelect
const creatableSelectStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: "32px",
    fontSize: "12px",
    borderColor: "#e2e8f0",
    boxShadow: "none",
    "&:hover": { borderColor: "#cbd5e1" },
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: "0 8px",
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base: Record<string, unknown>) => ({
    ...base,
    height: "30px",
  }),
  option: (
    base: Record<string, unknown>,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...base,
    fontSize: "12px",
    padding: "6px 12px",
    backgroundColor: state.isSelected
      ? "#6366f1"
      : state.isFocused
        ? "#eef2ff"
        : "white",
    color: state.isSelected ? "white" : "#334155",
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 100,
  }),
};

// Map field types to annotation types
const fieldTypeToAnnotationType: Record<string, string> = {
  text: "string",
  textarea: "string",
  select: "string",
  radio: "string",
  checkbox: "boolean",
  date: "date",
  number: "number",
  upload: "string",
  image: "string",
  color: "string",
  geolocation: "object",
  grid: "array",
};

type TabType = "properties" | "behaviors" | "metadata";

interface PropertiesPanelProps {
  element: FormElement | null;
  onUpdate: (element: FormElement) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const PropertiesPanel = ({
  element,
  onUpdate,
  onClose,
  onDelete,
}: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("properties");
  const { getElementMetadata, updateElementMetadata, getParentMetaComponents, selectMetaComponent } = useFormBuilder();

  if (!element) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  // Get default annotation type based on element's field type
  const defaultAnnotationType = (fieldTypeToAnnotationType[element.type] ||
    "string") as AnnotationType;

  const metadata = getElementMetadata(element.id) || {
    elementId: element.id,
    annotation: { type: defaultAnnotationType, entries: [] },
    comments: "",
    references: [],
  };

  // Get parent meta-components for this element
  const parentMetaComponents = getParentMetaComponents(element.id);

  const handleChange = (field: keyof FormElement, value: unknown) => {
    onUpdate({ ...element, [field]: value });
  };

  const handleOptionChange = (
    index: number,
    field: keyof SelectOption,
    value: string
  ) => {
    const newOptions = [...(element.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleChange("options", newOptions);
  };

  const addOption = () => {
    const newOptions = [
      ...(element.options || []),
      {
        label: `Option ${(element.options?.length || 0) + 1}`,
        value: `option${(element.options?.length || 0) + 1}`,
      },
    ];
    handleChange("options", newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (element.options || []).filter((_, i) => i !== index);
    handleChange("options", newOptions);
  };

  // Metadata handlers
  const handleAnnotationTypeChange = (
    newValue: { value: string; label: string } | null
  ) => {
    if (!newValue) return;

    const isBuiltIn = ANNOTATION_TYPES.includes(
      newValue.value as AnnotationType
    );
    if (isBuiltIn) {
      updateElementMetadata(element.id, {
        annotation: {
          ...metadata.annotation,
          type: newValue.value as AnnotationType,
          customType: undefined,
        },
      });
    } else {
      // Custom type entered
      updateElementMetadata(element.id, {
        annotation: {
          ...metadata.annotation,
          type: "custom",
          customType: newValue.value,
        },
      });
    }
  };

  // Get current value for react-select
  const getAnnotationTypeValue = () => {
    if (
      metadata.annotation.type === "custom" &&
      metadata.annotation.customType
    ) {
      return {
        value: metadata.annotation.customType,
        label: metadata.annotation.customType,
      };
    }
    return { value: metadata.annotation.type, label: metadata.annotation.type };
  };

  const handleAnnotationEntryChange = (
    index: number,
    field: keyof AnnotationEntry,
    value: string
  ) => {
    const entries = [...(metadata.annotation.entries || [])];
    entries[index] = { ...entries[index], [field]: value };
    updateElementMetadata(element.id, {
      annotation: { ...metadata.annotation, entries },
    });
  };

  const addAnnotationEntry = () => {
    const entries = [
      ...(metadata.annotation.entries || []),
      { key: "", value: "" },
    ];
    updateElementMetadata(element.id, {
      annotation: { ...metadata.annotation, entries },
    });
  };

  const removeAnnotationEntry = (index: number) => {
    const entries = (metadata.annotation.entries || []).filter(
      (_, i) => i !== index
    );
    updateElementMetadata(element.id, {
      annotation: { ...metadata.annotation, entries },
    });
  };

  const handleCommentsChange = (comments: string) => {
    updateElementMetadata(element.id, { comments });
  };

  const handleReferenceChange = (
    index: number,
    field: keyof ElementReference,
    value: string
  ) => {
    const newRefs = [...metadata.references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    updateElementMetadata(element.id, { references: newRefs });
  };

  const addReference = () => {
    const newRefs = [...metadata.references, { key: "", value: "" }];
    updateElementMetadata(element.id, { references: newRefs });
  };

  const removeReference = (index: number) => {
    const newRefs = metadata.references.filter((_, i) => i !== index);
    updateElementMetadata(element.id, { references: newRefs });
  };

  const hasOptions = ["select", "radio", "checkbox"].includes(element.type);
  const hasRows = element.type === "textarea";
  const hasNumberProps = element.type === "number";
  const hasFileProps = ["upload", "image"].includes(element.type);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Properties</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="properties-panel-tabs">
        <button
          className={`properties-panel-tab ${activeTab === "properties" ? "active" : ""}`}
          onClick={() => setActiveTab("properties")}
        >
          Properties
        </button>
        <button
          className={`properties-panel-tab ${activeTab === "behaviors" ? "active" : ""}`}
          onClick={() => setActiveTab("behaviors")}
        >
          <Zap className="w-3 h-3 inline-block mr-1" />
          Behaviors
        </button>
        <button
          className={`properties-panel-tab ${activeTab === "metadata" ? "active" : ""}`}
          onClick={() => setActiveTab("metadata")}
        >
          Metadata
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "properties" ? (
          <>
            {/* Properties Tab Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Component Library
              </label>
              <select
                value={element.componentLibrary || "tailwind"}
                onChange={(e) =>
                  handleChange(
                    "componentLibrary",
                    e.target.value as ComponentLibrary
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {COMPONENT_LIBRARIES.map((lib) => (
                  <option key={lib} value={lib}>
                    {componentLibraryLabels[lib]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <input
                type="text"
                value={element.type}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={element.label}
                onChange={(e) => handleChange("label", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {element.type !== "grid" && element.type !== "geolocation" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={element.placeholder || ""}
                  onChange={(e) => handleChange("placeholder", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={element.required || false}
                onChange={(e) => handleChange("required", e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="required"
                className="text-sm font-medium text-gray-700"
              >
                Required field
              </label>
            </div>

            {hasRows && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  value={element.rows || 4}
                  onChange={(e) =>
                    handleChange("rows", parseInt(e.target.value) || 4)
                  }
                  min={2}
                  max={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            {hasNumberProps && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min
                    </label>
                    <input
                      type="number"
                      value={element.min ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "min",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max
                    </label>
                    <input
                      type="number"
                      value={element.max ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "max",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Step
                    </label>
                    <input
                      type="number"
                      value={element.step ?? 1}
                      onChange={(e) =>
                        handleChange("step", parseFloat(e.target.value) || 1)
                      }
                      min={0.01}
                      step={0.01}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            {hasFileProps && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accepted File Types
                  </label>
                  <input
                    type="text"
                    value={element.accept || "*/*"}
                    onChange={(e) => handleChange("accept", e.target.value)}
                    placeholder="e.g., image/*, .pdf, .doc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="multiple"
                    checked={element.multiple || false}
                    onChange={(e) => handleChange("multiple", e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="multiple"
                    className="text-sm font-medium text-gray-700"
                  >
                    Allow multiple files
                  </label>
                </div>
              </>
            )}

            {hasOptions && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <button
                    onClick={addOption}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {element.options?.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) =>
                          handleOptionChange(index, "label", e.target.value)
                        }
                        placeholder="Label"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={opt.value}
                        onChange={(e) =>
                          handleOptionChange(index, "value", e.target.value)
                        }
                        placeholder="Value"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        disabled={(element.options?.length || 0) <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : activeTab === "behaviors" ? (
          <>
            {/* Behaviors Tab Content */}
            <MetaAttachmentPanel elementId={element.id} />
          </>
        ) : (
          <>
            {/* Metadata Tab Content */}

            {/* Annotation Section */}
            <div className="properties-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="properties-section-title">Annotation</h4>
                <button
                  onClick={addAnnotationEntry}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {/* @Type - always first */}
                <div className="annotation-row">
                  <span className="annotation-key">@type</span>
                  <CreatableSelect
                    value={getAnnotationTypeValue()}
                    onChange={handleAnnotationTypeChange}
                    options={annotationTypeOptions}
                    formatCreateLabel={(inputValue) => `"${inputValue}"`}
                    placeholder="Select or type..."
                    className="annotation-creatable-select"
                    classNamePrefix="annotation-select"
                    isClearable={false}
                    styles={creatableSelectStyles}
                  />
                </div>
                {/* Additional annotation entries */}
                {(metadata.annotation.entries || []).map((entry, index) => (
                  <div key={index} className="annotation-row">
                    <CreatableSelect
                      value={
                        entry.key
                          ? { value: entry.key, label: entry.key }
                          : null
                      }
                      onChange={(newValue) =>
                        handleAnnotationEntryChange(
                          index,
                          "key",
                          newValue?.value || ""
                        )
                      }
                      options={[]}
                      formatCreateLabel={(inputValue) => inputValue}
                      placeholder="key"
                      className="annotation-creatable-key"
                      classNamePrefix="annotation-select"
                      isClearable={false}
                      styles={creatableSelectStyles}
                    />
                    <CreatableSelect
                      value={
                        entry.value
                          ? { value: entry.value, label: entry.value }
                          : null
                      }
                      onChange={(newValue) =>
                        handleAnnotationEntryChange(
                          index,
                          "value",
                          newValue?.value || ""
                        )
                      }
                      options={annotationTypeOptions}
                      formatCreateLabel={(inputValue) => `"${inputValue}"`}
                      placeholder="value"
                      className="annotation-creatable-select"
                      classNamePrefix="annotation-select"
                      isClearable={false}
                      styles={creatableSelectStyles}
                    />
                    <button
                      type="button"
                      onClick={() => removeAnnotationEntry(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="properties-section">
              <h4 className="properties-section-title">Comments</h4>
              <textarea
                value={metadata.comments}
                onChange={(e) => handleCommentsChange(e.target.value)}
                placeholder="Add comments or notes..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* References Section */}
            <div className="properties-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="properties-section-title">References</h4>
                <button
                  onClick={addReference}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {metadata.references.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    No references added
                  </p>
                ) : (
                  metadata.references.map((ref, index) => (
                    <div key={index} className="reference-item">
                      <div className="reference-header">
                        <input
                          type="text"
                          value={ref.key}
                          onChange={(e) =>
                            handleReferenceChange(index, "key", e.target.value)
                          }
                          placeholder="Key"
                          className="reference-key-input"
                        />
                        <button
                          type="button"
                          onClick={() => removeReference(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={ref.value}
                        onChange={(e) =>
                          handleReferenceChange(index, "value", e.target.value)
                        }
                        placeholder="Value"
                        rows={2}
                        className="reference-value-input"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Parent Components Section */}
            <div className="properties-section">
              <h4 className="properties-section-title">Parent Components</h4>
              <p className="text-xs text-gray-500 mb-2">
                Meta-components this element belongs to
              </p>
              <div className="space-y-2">
                {parentMetaComponents.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Not assigned to any component
                  </p>
                ) : (
                  parentMetaComponents.map((meta) => (
                    <button
                      key={meta.id}
                      type="button"
                      onClick={() => selectMetaComponent(meta.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-purple-50 hover:bg-purple-100 transition-colors text-left"
                    >
                      <Layers className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {meta.name}
                        </div>
                        <div className="text-xs text-purple-600 uppercase">
                          {meta.type}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Delete button */}
      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onDelete(element.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Field
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
