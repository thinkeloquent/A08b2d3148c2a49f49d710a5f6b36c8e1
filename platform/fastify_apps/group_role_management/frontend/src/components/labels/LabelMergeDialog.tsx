/**
 * LabelMergeDialog Component
 * Dialog for merging duplicate labels
 * Based on REQ.v002.md Section 4 (Label System)
 */

import { useState } from 'react';
import { TrendingUp, X, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { getLabelColor } from '@/utils/labelColors';
import type { Label } from '@/types';

interface LabelMergeDialogProps {
  isOpen: boolean;
  sourceLabel: Label | null;
  availableLabels: Label[];
  onConfirm: (sourceLabel: Label, targetLabel: Label) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LabelMergeDialog({
  isOpen,
  sourceLabel,
  availableLabels,
  onConfirm,
  onCancel,
  isLoading = false
}: LabelMergeDialogProps) {
  const [selectedTargetLabel, setSelectedTargetLabel] = useState<Label | null>(null);

  if (!isOpen || !sourceLabel) return null;

  // Filter out the source label and predefined labels from targets
  const targetOptions = availableLabels.filter(
    (label) => label.name !== sourceLabel.name
  );

  const handleMerge = () => {
    if (selectedTargetLabel) {
      onConfirm(sourceLabel, selectedTargetLabel);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 z-10">

          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Merge Labels</h3>
              <p className="text-sm text-gray-600 mt-1">
                Combine duplicate or similar labels into a single label
              </p>
            </div>
          </div>

          {/* Merge Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Source (will be removed)</p>
                <Badge variant={getLabelColor(sourceLabel.name)} size="lg">
                  {sourceLabel.name}
                </Badge>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Target (will keep)</p>
                {selectedTargetLabel ?
                <Badge variant={getLabelColor(selectedTargetLabel.name)} size="lg">
                    {selectedTargetLabel.name}
                  </Badge> :

                <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                    Select target label
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What happens when you merge?</h4>
            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li>All roles using "{sourceLabel.name}" will be updated to use the target label</li>
              <li>The "{sourceLabel.name}" label will be permanently deleted</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          {/* Target Label Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select target label to merge into:
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {targetOptions.length === 0 ?
              <div className="text-center py-8 text-gray-500 text-sm">
                  No other labels available to merge into
                </div> :

              <div className="space-y-2">
                  {targetOptions.map((label) =>
                <button
                  key={label.name}
                  type="button"
                  onClick={() => setSelectedTargetLabel(label)}
                  disabled={isLoading}
                  className={`
                        w-full p-3 rounded-lg border-2 transition-all text-left
                        ${
                  selectedTargetLabel?.name === label.name ?
                  'bg-primary-50 border-primary-300' :
                  'bg-white border-gray-200 hover:bg-gray-50'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `
                  }>

                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant={getLabelColor(label.name)} size="md">
                            {label.name}
                          </Badge>
                          {label.description &&
                      <p className="text-xs text-gray-600 mt-1">{label.description}</p>
                      }
                        </div>
                        {selectedTargetLabel?.name === label.name &&
                    <div className="bg-primary-600 rounded-full p-0.5">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" data-test-id="svg-cd872648">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                    }
                      </div>
                    </button>
                )}
                </div>
              }
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1">

              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleMerge}
              loading={isLoading}
              disabled={!selectedTargetLabel || targetOptions.length === 0}
              className="flex-1">

              <TrendingUp className="w-4 h-4" />
              Merge Labels
            </Button>
          </div>
        </div>
      </div>
    </div>);

}