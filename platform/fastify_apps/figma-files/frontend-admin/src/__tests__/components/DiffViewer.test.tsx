import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiffViewer } from '@/components/diff';

describe('DiffViewer', () => {
  const fields = ['name', 'description', 'status'] as const;

  it('shows no changes message when values are identical', () => {
    const data = { name: 'test', description: 'desc', status: 'active' };
    render(
      <DiffViewer
        original={data}
        modified={data}
        fields={[...fields]}
      />
    );

    expect(screen.getByText('No changes detected')).toBeInTheDocument();
  });

  it('displays modified fields', () => {
    const original = { name: 'old name', description: 'desc', status: 'active' };
    const modified = { name: 'new name', description: 'desc', status: 'active' };

    render(
      <DiffViewer
        original={original}
        modified={modified}
        fields={[...fields]}
      />
    );

    expect(screen.getByText('Changes Preview')).toBeInTheDocument();
    expect(screen.getByText('1 modified')).toBeInTheDocument();
    expect(screen.getByText('old name')).toBeInTheDocument();
    expect(screen.getByText('new name')).toBeInTheDocument();
  });

  it('displays added fields', () => {
    const original = { name: '', description: '', status: '' };
    const modified = { name: 'new value', description: '', status: '' };

    render(
      <DiffViewer
        original={original}
        modified={modified}
        fields={[...fields]}
      />
    );

    expect(screen.getByText('1 added')).toBeInTheDocument();
  });

  it('displays removed fields', () => {
    const original = { name: 'value', description: '', status: '' };
    const modified = { name: '', description: '', status: '' };

    render(
      <DiffViewer
        original={original}
        modified={modified}
        fields={[...fields]}
      />
    );

    expect(screen.getByText('1 removed')).toBeInTheDocument();
  });

  it('uses custom labels when provided', () => {
    const original = { name: 'old', description: '', status: '' };
    const modified = { name: 'new', description: '', status: '' };

    render(
      <DiffViewer
        original={original}
        modified={modified}
        fields={[...fields]}
        labels={{ name: 'Repository Name' }}
      />
    );

    expect(screen.getByText('Repository Name')).toBeInTheDocument();
  });

  it('handles multiple changes', () => {
    const original = { name: 'old', description: 'old desc', status: 'inactive' };
    const modified = { name: 'new', description: 'new desc', status: 'active' };

    render(
      <DiffViewer
        original={original}
        modified={modified}
        fields={[...fields]}
      />
    );

    expect(screen.getByText('3 modified')).toBeInTheDocument();
  });
});
