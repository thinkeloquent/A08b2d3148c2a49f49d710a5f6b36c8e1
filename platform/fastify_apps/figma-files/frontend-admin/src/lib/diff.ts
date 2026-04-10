import { diffWords, type Change } from 'diff';

export interface FieldChange {
  field: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldValue: unknown;
  newValue: unknown;
}

export function compareValues(oldValue: unknown, newValue: unknown): boolean {
  if (oldValue === newValue) return true;
  if (typeof oldValue !== typeof newValue) return false;

  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    if (oldValue.length !== newValue.length) return false;
    return oldValue.every((v, i) => compareValues(v, newValue[i]));
  }

  if (typeof oldValue === 'object' && oldValue !== null && newValue !== null) {
    const oldKeys = Object.keys(oldValue);
    const newKeys = Object.keys(newValue as object);
    if (oldKeys.length !== newKeys.length) return false;
    return oldKeys.every((key) =>
      compareValues(
        (oldValue as Record<string, unknown>)[key],
        (newValue as Record<string, unknown>)[key]
      )
    );
  }

  return false;
}

export function getFieldChanges<T extends Record<string, unknown>>(
  original: T,
  modified: T,
  fields: (keyof T)[]
): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const field of fields) {
    const oldValue = original[field];
    const newValue = modified[field];

    const isEqual = compareValues(oldValue, newValue);

    if (isEqual) {
      changes.push({
        field: String(field),
        type: 'unchanged',
        oldValue,
        newValue,
      });
    } else if (oldValue === undefined || oldValue === null || oldValue === '') {
      changes.push({
        field: String(field),
        type: 'added',
        oldValue,
        newValue,
      });
    } else if (newValue === undefined || newValue === null || newValue === '') {
      changes.push({
        field: String(field),
        type: 'removed',
        oldValue,
        newValue,
      });
    } else {
      changes.push({
        field: String(field),
        type: 'modified',
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

export function diffStrings(oldStr: string, newStr: string): Change[] {
  return diffWords(oldStr, newStr);
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return value.join(', ') || '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function hasChanges<T extends Record<string, unknown>>(
  original: T,
  modified: T,
  fields: (keyof T)[]
): boolean {
  return getFieldChanges(original, modified, fields).some(
    (change) => change.type !== 'unchanged'
  );
}
