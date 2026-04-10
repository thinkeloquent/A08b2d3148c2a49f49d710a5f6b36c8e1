import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { FormField } from '../components/forms/FormField';
import { Input } from '../components/forms/Input';
import { useToast } from '../components/feedback/Toast';
import { useRuleTreeForm } from '../hooks/forms/useRuleTreeForm';
import { useCreateRuleTree } from '../hooks/useRuleTrees';
import { GRAPH_TYPE_LABELS, type GraphType, LANGUAGE_LABELS, type Language } from '../types/rule.types';

export function RuleTreeCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const createRuleTree = useCreateRuleTree();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useRuleTreeForm({
    onSubmit: async (data) => {
      try {
        const result = await createRuleTree.mutateAsync(data);
        addToast('success', `Rule tree "${data.name}" created successfully`);
        navigate(`/trees/${result.tree.id}`);
      } catch {
        addToast('error', 'Failed to create rule tree');
      }
    }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/trees')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors">

          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Create Rule Tree</h1>
          <p className="text-slate-500 mt-1 text-sm">Define a new rule tree configuration</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Name"
            htmlFor="name"
            required
            error={errors.name?.message} data-test-id="formfield-d9b620b9">

            <Input
              id="name"
              {...register('name')}
              placeholder="Enter rule tree name"
              error={!!errors.name} />

          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            hint="Optional description for this rule tree"
            error={errors.description?.message} data-test-id="formfield-30fd2688">

            <textarea
              id="description"
              {...register('description')}
              placeholder="Enter description..."
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors" />

          </FormField>

          <FormField
            label="Graph Type"
            htmlFor="graph_type"
            hint="The type of code analysis this tree represents">
            <select
              id="graph_type"
              {...register('graph_type')}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
            >
              {(Object.entries(GRAPH_TYPE_LABELS) as [GraphType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Language"
            htmlFor="language"
            hint="The programming language this tree targets">
            <select
              id="language"
              {...register('language')}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
            >
              <option value="">Select a language...</option>
              {(Object.entries(LANGUAGE_LABELS) as [Language, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          {/* Git Source Metadata */}
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-medium text-slate-700">Source Control</h3>
              <span className="text-xs text-slate-400">Optional</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField
                  label="Repository URL"
                  htmlFor="repo_url"
                  hint="e.g. https://github.com/org/repo"
                  error={errors.repo_url?.message}>
                  <Input
                    id="repo_url"
                    {...register('repo_url')}
                    placeholder="https://github.com/org/repo"
                    error={!!errors.repo_url} />
                </FormField>
              </div>
              <FormField
                label="Branch"
                htmlFor="branch"
                error={errors.branch?.message}>
                <Input
                  id="branch"
                  {...register('branch')}
                  placeholder="main" />
              </FormField>
              <FormField
                label="Git Tag / Version"
                htmlFor="git_tag"
                hint="e.g. v1.0.4"
                error={errors.git_tag?.message}>
                <Input
                  id="git_tag"
                  {...register('git_tag')}
                  placeholder="v1.0.0" />
              </FormField>
              <div className="col-span-2">
                <FormField
                  label="Commit SHA"
                  htmlFor="commit_sha"
                  hint="Exact commit hash for immutability"
                  error={errors.commit_sha?.message}>
                  <Input
                    id="commit_sha"
                    {...register('commit_sha')}
                    placeholder="e.g. a1b2c3d4e5f6..."
                    className="font-mono text-xs"
                    error={!!errors.commit_sha} />
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100" data-test-id="div-faeef5d3">
            <button
              type="button"
              onClick={() => navigate('/trees')}
              className="btn-secondary">

              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createRuleTree.isPending}
              className="btn-primary disabled:opacity-50">

              {createRuleTree.isPending ? 'Creating...' : 'Create Rule Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}
