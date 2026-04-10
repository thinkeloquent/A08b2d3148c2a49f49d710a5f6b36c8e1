/**
 * React Hook Form + Zod hook for rule tree metadata
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ruleTreeSchema, type RuleTreeFormData } from '../../schemas/rule.schema';

interface UseRuleTreeFormOptions {
  defaultValues?: Partial<RuleTreeFormData>;
  onSubmit?: (data: RuleTreeFormData) => void;
}

export function useRuleTreeForm({ defaultValues, onSubmit }: UseRuleTreeFormOptions = {}) {
  const form = useForm<RuleTreeFormData>({
    resolver: zodResolver(ruleTreeSchema),
    defaultValues: {
      name: '',
      description: '',
      graph_type: 'conditional_logic',
      language: '',
      repo_url: '',
      branch: '',
      commit_sha: '',
      git_tag: '',
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit?.(data);
  });

  return {
    ...form,
    handleSubmit,
  };
}
