import { useState } from 'react';
import { Plus, Trash2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ValidationMetaComponent, GuardrailRule } from '../../types';
import { MetaComponentEditor } from '../types';

// Generate unique ID
const generateRuleId = () => `guard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create default guardrail rule
const createDefaultRule = (targetElementIds: string[]): GuardrailRule => ({
  id: generateRuleId(),
  label: 'New Rule',
  message: 'Validation failed',
  level: 'error',
  ruleExpression: '',
  targetElementIds,
});

// Level icons and colors
const LEVEL_CONFIG = {
  error: { icon: AlertCircle, color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  warning: { icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  info: { icon: Info, color: '#059669', bg: '#f0fdf4', border: '#86efac' },
};

// Rule expression templates
const EXPRESSION_TEMPLATES = [
  { label: 'Required', expression: "value !== null && value !== ''" },
  { label: 'Min Length', expression: 'value.length >= 3' },
  { label: 'Max Length', expression: 'value.length <= 100' },
  { label: 'Email Format', expression: '/^[^@]+@[^@]+\\.[^@]+$/.test(value)' },
  { label: 'Numeric', expression: '!isNaN(Number(value))' },
  { label: 'Positive Number', expression: 'Number(value) > 0' },
  { label: 'Date in Future', expression: 'new Date(value) > new Date()' },
  { label: 'Custom', expression: '' },
];

// Guardrail rule item component
interface RuleItemProps {
  rule: GuardrailRule;
  availableElements: Array<{ id: string; label: string; type: string }>;
  onUpdate: (rule: GuardrailRule) => void;
  onRemove: () => void;
}

const RuleItem = ({
  rule,
  availableElements,
  onUpdate,
  onRemove,
}: RuleItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const levelConfig = LEVEL_CONFIG[rule.level];
  const LevelIcon = levelConfig.icon;

  return (
    <div
      className="border rounded-md bg-white"
      style={{ borderColor: levelConfig.border }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: levelConfig.bg }}
      >
        <LevelIcon className="h-4 w-4 flex-shrink-0" style={{ color: levelConfig.color }} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900">{rule.label}</span>
        </div>
        <span
          className="text-xs px-1.5 py-0.5 rounded capitalize"
          style={{ background: levelConfig.color + '20', color: levelConfig.color }}
        >
          {rule.level}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t p-3 space-y-3" style={{ borderColor: levelConfig.border }}>
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rule Label</label>
            <input
              type="text"
              value={rule.label}
              onChange={(e) => onUpdate({ ...rule, label: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="e.g., Email Required"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
            <div className="flex gap-2">
              {(['error', 'warning', 'info'] as const).map((level) => {
                const config = LEVEL_CONFIG[level];
                const Icon = config.icon;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onUpdate({ ...rule, level })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md border text-xs font-medium capitalize transition-colors ${
                      rule.level === level
                        ? 'border-2'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: rule.level === level ? config.color : undefined,
                      background: rule.level === level ? config.bg : undefined,
                      color: rule.level === level ? config.color : '#6b7280',
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Error Message</label>
            <input
              type="text"
              value={rule.message}
              onChange={(e) => onUpdate({ ...rule, message: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="Message shown when validation fails"
            />
          </div>

          {/* Expression Template */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expression Template</label>
            <select
              onChange={(e) => {
                const template = EXPRESSION_TEMPLATES.find(t => t.label === e.target.value);
                if (template) {
                  onUpdate({ ...rule, ruleExpression: template.expression });
                }
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              defaultValue=""
            >
              <option value="" disabled>Select a template...</option>
              {EXPRESSION_TEMPLATES.map((t) => (
                <option key={t.label} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Rule Expression */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rule Expression</label>
            <textarea
              value={rule.ruleExpression}
              onChange={(e) => onUpdate({ ...rule, ruleExpression: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono"
              rows={2}
              placeholder="e.g., value !== null && value !== ''"
            />
            <p className="mt-1 text-xs text-gray-500">
              JavaScript expression. Use <code className="bg-gray-100 px-1 rounded">value</code> to reference element value.
            </p>
          </div>

          {/* Rule Targets */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Apply to Elements ({rule.targetElementIds.length})
            </label>
            <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded p-1">
              {availableElements.map((el) => {
                const isTarget = rule.targetElementIds.includes(el.id);
                return (
                  <label key={el.id} className="flex items-center gap-2 p-1 text-xs">
                    <input
                      type="checkbox"
                      checked={isTarget}
                      onChange={(e) => {
                        const newTargets = e.target.checked
                          ? [...rule.targetElementIds, el.id]
                          : rule.targetElementIds.filter((id) => id !== el.id);
                        onUpdate({ ...rule, targetElementIds: newTargets });
                      }}
                      className="h-3 w-3 text-emerald-600 border-gray-300 rounded"
                    />
                    <span className="text-gray-600">{el.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GuardrailEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const validation = meta as ValidationMetaComponent;
  const guardrails = validation.guardrails ?? [];

  // Add rule
  const handleAddRule = () => {
    const newRule = createDefaultRule(validation.targetElementIds);
    onUpdate({
      ...validation,
      guardrails: [...guardrails, newRule],
    });
  };

  // Update rule
  const handleUpdateRule = (index: number, updated: GuardrailRule) => {
    const newRules = [...guardrails];
    newRules[index] = updated;
    onUpdate({ ...validation, guardrails: newRules });
  };

  // Remove rule
  const handleRemoveRule = (index: number) => {
    onUpdate({
      ...validation,
      guardrails: guardrails.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={validation.name}
          onChange={(e) => onUpdate({ ...validation, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        />
      </div>

      {/* Status Summary */}
      <div className="bg-emerald-50 rounded-md p-3">
        <div className="text-sm font-medium text-emerald-900 mb-1">Guardrail Status</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-emerald-600">Total Rules:</span>{' '}
            <span className="font-medium">{guardrails.length}</span>
          </div>
          <div>
            <span className="text-red-600">Errors:</span>{' '}
            <span className="font-medium">{guardrails.filter(g => g.level === 'error').length}</span>
          </div>
          <div>
            <span className="text-amber-600">Warnings:</span>{' '}
            <span className="font-medium">{guardrails.filter(g => g.level === 'warning').length}</span>
          </div>
        </div>
      </div>

      {/* Guardrail Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Guardrail Rules ({guardrails.length})
          </label>
          <button
            type="button"
            onClick={handleAddRule}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200"
          >
            <Plus className="h-3 w-3" />
            Add Rule
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {guardrails.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No guardrail rules defined. Add rules to validate form data.
              </p>
            </div>
          ) : (
            guardrails.map((rule, index) => (
              <RuleItem
                key={rule.id}
                rule={rule}
                availableElements={availableElements}
                onUpdate={(updated) => handleUpdateRule(index, updated)}
                onRemove={() => handleRemoveRule(index)}
              />
            ))
          )}
        </div>
      </div>

      {/* Global Targets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Global Targets ({validation.targetElementIds.length})
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Default elements for new rules
        </p>
        <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
          {availableElements.map((el) => {
            const isTarget = validation.targetElementIds.includes(el.id);
            return (
              <label key={el.id} className="flex items-center gap-2 p-1">
                <input
                  type="checkbox"
                  checked={isTarget}
                  onChange={(e) => {
                    const newTargets = e.target.checked
                      ? [...validation.targetElementIds, el.id]
                      : validation.targetElementIds.filter((id) => id !== el.id);
                    onUpdate({ ...validation, targetElementIds: newTargets });
                  }}
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {el.label} <span className="text-gray-400">({el.type})</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
