import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, GitBranch } from 'lucide-react';
import { FormField } from '../components/forms/FormField';
import { Input } from '../components/forms/Input';
import { DiffViewer } from '../components/diff';
import { useToast } from '../components/feedback/Toast';
import { useRuleTree, useSaveRuleTree } from '../hooks/useRuleTrees';
import { useRuleTreeForm } from '../hooks/forms/useRuleTreeForm';
import { GRAPH_TYPE_LABELS, type GraphType, LANGUAGE_LABELS, type Language } from '../types/rule.types';

export function RuleTreeEditPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data, isLoading } = useRuleTree(id);
  const saveRuleTree = useSaveRuleTree();

  const tree = data?.tree;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useRuleTreeForm({
    onSubmit: async (formData) => {
      if (!id) return;
      try {
        await saveRuleTree.mutateAsync({
          id,
          data: {
            name: formData.name,
            description: formData.description,
            graph_type: formData.graph_type,
            language: formData.language,
            repo_url: formData.repo_url,
            branch: formData.branch,
            commit_sha: formData.commit_sha,
            git_tag: formData.git_tag,
          }
        });
        addToast('success', 'Rule tree updated successfully');
        navigate(`/trees/${id}`);
      } catch {
        addToast('error', 'Failed to update rule tree');
      }
    }
  });

  // Reset form when tree data loads
  useEffect(() => {
    if (tree) {
      reset({
        name: tree.name,
        description: tree.description || '',
        graph_type: tree.graphType || 'conditional_logic',
        language: tree.language || '',
        repo_url: tree.repo_url || '',
        branch: tree.branch || '',
        commit_sha: tree.commit_sha || '',
        git_tag: tree.git_tag || '',
      });
    }
  }, [tree, reset]);

  const watchedValues = watch();

  const originalValues = useMemo(() => {
    if (!tree) return { name: '', description: '', graph_type: 'conditional_logic', language: '', repo_url: '', branch: '', commit_sha: '', git_tag: '' };
    return {
      name: tree.name || '',
      description: tree.description || '',
      graph_type: tree.graphType || 'conditional_logic',
      language: tree.language || 'javascript',
      repo_url: tree.repo_url || '',
      branch: tree.branch || '',
      commit_sha: tree.commit_sha || '',
      git_tag: tree.git_tag || '',
    };
  }, [tree]);

  const modifiedValues = useMemo(() => ({
    name: watchedValues.name || '',
    description: watchedValues.description || '',
    graph_type: watchedValues.graph_type || 'conditional_logic',
    language: watchedValues.language || 'javascript',
    repo_url: watchedValues.repo_url || '',
    branch: watchedValues.branch || '',
    commit_sha: watchedValues.commit_sha || '',
    git_tag: watchedValues.git_tag || '',
  }), [watchedValues]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-100 rounded w-1/3 mb-2" />
          <div className="h-4 bg-slate-50 rounded w-1/2" />
        </div>
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      </div>);

  }

  if (!tree) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-base font-medium text-slate-600">Rule tree not found</p>
        <button
          onClick={() => navigate('/trees')}
          className="mt-4 text-accent-600 hover:text-accent-800 text-sm font-medium">

          Back to Rule Trees
        </button>
      </div>);

  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/trees/${id}`)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors">

          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Edit Rule Tree</h1>
          <p className="text-slate-500 mt-1 text-sm">Update rule tree metadata</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Name"
            htmlFor="name"
            required
            error={errors.name?.message} data-test-id="formfield-9039abe3">

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
            error={errors.description?.message} data-test-id="formfield-7d2c7b54">

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

          {/* Changes Preview */}
          <div className="pt-5 border-t border-slate-100" data-test-id="div-53303296">
            <DiffViewer
              original={originalValues}
              modified={modifiedValues}
              fields={['name', 'description', 'graph_type', 'language', 'repo_url', 'branch', 'commit_sha', 'git_tag']}
              labels={{ name: 'Name', description: 'Description', graph_type: 'Graph Type', language: 'Language', repo_url: 'Repository URL', branch: 'Branch', commit_sha: 'Commit SHA', git_tag: 'Git Tag' }} />

          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100" data-test-id="div-5caedd78">
            <button
              type="button"
              onClick={() => navigate(`/trees/${id}`)}
              className="btn-secondary">

              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || saveRuleTree.isPending}
              className="btn-primary disabled:opacity-50">

              {saveRuleTree.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}
