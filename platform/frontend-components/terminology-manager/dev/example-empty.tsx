import { useState } from 'react';
import { TerminologyManager } from '../src';
import type { Term } from '../src';

export default function ExampleEmpty() {
  const [terms, setTerms] = useState<Term[]>([]);

  const handleSave = (term: Term) => {
    setTerms((prev) => {
      const idx = prev.findIndex((x) => x.id === term.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = term;
        return next;
      }
      return [term, ...prev];
    });
  };

  const handleDelete = (id: string) => {
    setTerms((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TerminologyManager
      terms={terms}
      onSave={handleSave}
      onDelete={handleDelete}
      title="Empty Glossary"
      subtitle="No terms yet"
    />
  );
}
