/**
 * Export/Import hooks for rule trees
 */

import { useCallback } from 'react';
import type { RuleGroup } from '../types/rule.types';

export function useExportImport() {
  /**
   * Export rules as JSON file download
   */
  const exportRules = useCallback((rules: RuleGroup, filename = 'rules.json') => {
    const json = JSON.stringify(rules, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Import rules from a file upload event
   * Returns a promise that resolves with the parsed RuleGroup
   */
  const importRules = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): Promise<RuleGroup | null> => {
      return new Promise((resolve) => {
        const file = event.target.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string) as RuleGroup;
            resolve(imported);
          } catch {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(file);

        // Reset input so same file can be re-imported
        event.target.value = '';
      });
    },
    []
  );

  return { exportRules, importRules };
}
