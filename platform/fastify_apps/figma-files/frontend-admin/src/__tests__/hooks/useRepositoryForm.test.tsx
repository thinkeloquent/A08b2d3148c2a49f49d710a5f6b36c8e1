import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFigmaFileForm } from '@/hooks/useRepositoryForm';
import type { ApiFigmaFile } from '@/types/api';

describe('useFigmaFileForm', () => {
  const mockOnSubmit = vi.fn();

  const mockFigmaFile: ApiFigmaFile = {
    id: '1',
    name: 'test-design-system',
    description: 'A test design system',
    type: 1, // design_system
    status: 1, // stable
    figmaUrl: 'https://www.figma.com/file/abc123/test',
    figmaFileKey: 'abc123',
    pageCount: 5,
    componentCount: 100,
    styleCount: 20,
    lastModifiedBy: 'Test User',
    editorType: 'figma',
    trending: false,
    verified: true,
    tags: [{ id: 1, name: 'test-tag' }],
  };

  it('initializes with default values for new figma file', () => {
    const { result } = renderHook(() =>
      useFigmaFileForm({ onSubmit: mockOnSubmit })
    );

    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.getValues('name')).toBe('');
    expect(result.current.form.getValues('type')).toBe('design_system');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('initializes with existing data for editing', () => {
    const { result } = renderHook(() =>
      useFigmaFileForm({
        initialData: mockFigmaFile,
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.isEditing).toBe(true);
    expect(result.current.form.getValues('name')).toBe('test-design-system');
    expect(result.current.form.getValues('type')).toBe('design_system');
    expect(result.current.form.getValues('page_count')).toBe(5);
    expect(result.current.form.getValues('tag_names')).toEqual(['test-tag']);
  });

  it('tracks changes correctly', async () => {
    const { result } = renderHook(() =>
      useFigmaFileForm({
        initialData: mockFigmaFile,
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => {
      result.current.form.setValue('name', 'updated-name');
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.changes.find((c) => c.field === 'name')?.type).toBe(
      'modified'
    );
  });

  it('resets form to original values', () => {
    const { result } = renderHook(() =>
      useFigmaFileForm({
        initialData: mockFigmaFile,
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.form.setValue('name', 'changed-name');
    });

    expect(result.current.form.getValues('name')).toBe('changed-name');

    act(() => {
      result.current.reset();
    });

    expect(result.current.form.getValues('name')).toBe('test-design-system');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('converts API figma file type enum to string', () => {
    const { result } = renderHook(() =>
      useFigmaFileForm({
        initialData: { ...mockFigmaFile, type: 2 }, // component_library
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.form.getValues('type')).toBe('component_library');
  });

  it('converts API figma file status enum to string', () => {
    const { result } = renderHook(() =>
      useFigmaFileForm({
        initialData: { ...mockFigmaFile, status: 2 }, // beta
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.form.getValues('status')).toBe('beta');
  });
});
