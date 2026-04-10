/**
 * TemplateSelector Component
 * Select from predefined role templates
 * Based on REQ.v002.md Section 5.2 (Role Templates)
 */

import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { RoleIcon } from '@/utils/icons';
import { getLabelColor } from '@/utils/labelColors';
import { roleTemplates, templateCategories, type RoleTemplate } from '@/utils/roleTemplates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: RoleTemplate) => void;
  onSkip: () => void;
}

export function TemplateSelector({ onSelectTemplate, onSkip }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);

  const filteredTemplates = selectedCategory === 'all'
    ? roleTemplates
    : roleTemplates.filter(t => t.category === selectedCategory);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-full">
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Start with a Template
        </h3>
        <p className="text-gray-600">
          Choose a predefined template to quickly create a role, or start from scratch
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center gap-2">
        {templateCategories.map(category => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                selectedCategory === category.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.map(template => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'bg-primary-50 border-primary-300 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-primary-600 rounded-full p-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <RoleIcon icon={template.icon} className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{template.name}</h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>

              {/* Labels Preview */}
              <div className="flex flex-wrap gap-1">
                {template.labels.slice(0, 2).map(label => (
                  <Badge key={label} variant={getLabelColor(label)} size="sm">
                    {label}
                  </Badge>
                ))}
                {template.labels.length > 2 && (
                  <Badge variant="gray" size="sm">
                    +{template.labels.length - 2}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" size="md" onClick={onSkip} className="flex-1">
          Start from Scratch
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSelect}
          disabled={!selectedTemplate}
          className="flex-1"
        >
          <Sparkles className="w-4 h-4" />
          Use Template
        </Button>
      </div>
    </div>
  );
}
