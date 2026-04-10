import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRepositoryForm } from '@/hooks/useRepositoryForm';
import type { ApiRepository } from '@/types/api';

describe('useRepositoryForm', () => {
  const mockOnSubmit = vi.fn();

  const mockRepository: ApiRepository = {
    id: '1',
    name: 'test-repo',
    description: 'A test repository',
    type: 1, // npm
    status: 1, // stable
    githubUrl: 'https://github.com/test/repo',
    packageUrl: 'https://npmjs.com/package/test',
    stars: 100,
    forks: 20,
    version: '1.0.0',
    maintainer: 'Test User',
    language: 'TypeScript',
    license: 'MIT',
    trending: false,
    verified: true,
    tags: [{ id: 1, name: 'test-tag' }],
  };

  it('initializes with default values for new repository', () => {
    const { result } = renderHook(() =>
      useRepositoryForm({ onSubmit: mockOnSubmit })
    );

    expect(result.current.isEditing).toBe(false);
    expect(result.current.form.getValues('name')).toBe('');
    expect(result.current.form.getValues('type')).toBe('npm');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('initializes with existing data for editing', () => {
    const { result } = renderHook(() =>
      useRepositoryForm({
        initialData: mockRepository,
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.isEditing).toBe(true);
    expect(result.current.form.getValues('name')).toBe('test-repo');
    expect(result.current.form.getValues('type')).toBe('npm');
    expect(result.current.form.getValues('stars')).toBe(100);
    expect(result.current.form.getValues('tag_names')).toEqual(['test-tag']);
  });

  it('tracks changes correctly', async () => {
    const { result } = renderHook(() =>
      useRepositoryForm({
        initialData: mockRepository,
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
      useRepositoryForm({
        initialData: mockRepository,
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

    expect(result.current.form.getValues('name')).toBe('test-repo');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('converts API repository type enum to string', () => {
    const { result } = renderHook(() =>
      useRepositoryForm({
        initialData: { ...mockRepository, type: 2 }, // docker
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.form.getValues('type')).toBe('docker');
  });

  it('converts API repository status enum to string', () => {
    const { result } = renderHook(() =>
      useRepositoryForm({
        initialData: { ...mockRepository, status: 2 }, // beta
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.form.getValues('status')).toBe('beta');
  });
});
