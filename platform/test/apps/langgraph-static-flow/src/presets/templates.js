/**
 * Preset workflow templates.
 *
 * Each template is a complete graph-workflow definition that can be
 * loaded into the graph builder. The "reflection-studio" template
 * mirrors the original graph-workflow.json.
 */

export const PRESET_TEMPLATES = [
  {
    id: 'reflection-studio',
    label: 'Reflection Studio',
    description: 'Iterative report generation with reflection and user feedback',
    template: {
      name: 'LangGraph Reflection Studio',
      description: 'Iterative report generation with reflection and user feedback',
      config: {
        maxIterations: 3,
        entryPoint: 'generate',
        interruptBefore: ['user_feedback'],
      },
      state: {
        messages: { reducer: 'append', default: [] },
        iterations: { reducer: 'replace', default: 0 },
      },
      conditions: {
        shouldContinue: {
          field: 'iterations',
          operator: 'gte',
          value: 'config.maxIterations',
          trueResult: '__end__',
          falseResult: 'reflect',
        },
      },
      g11n: {
        templates: {
          reportTitle: '# Report: {topic} (Draft {iteration})',
          executiveSummary: '## Executive Summary\nThis report examines {topic} through multiple analytical lenses. This is iteration {iteration} of the reflective writing process, incorporating feedback to improve depth and accuracy.',
          backgroundContext: '## Background & Context\n{topic} has become increasingly significant in recent years. Understanding its implications requires examining historical trends, current developments, and future projections. Stakeholders across multiple domains are affected by evolving dynamics in this area.',
          keyFindings: '## Key Findings\n1. **Trend Analysis**: Current data suggests significant shifts in how {topic} impacts various sectors.\n2. **Stakeholder Impact**: Multiple groups are affected differently by developments in {topic}.\n3. **Future Outlook**: Projections indicate continued evolution with both opportunities and challenges.',
          revisionsHeader: '## Revisions Based on Feedback',
          feedbackItem: '- **Feedback {index}**: Addressed \u2014 "{feedback}"',
          revisionsFooter: 'The report has been revised {count} time(s) based on reviewer and user feedback to improve clarity, depth, and accuracy.',
          methodology: '## Methodology\nThis analysis uses a multi-iteration reflective approach where each draft is reviewed for content accuracy, structural coherence, analytical depth, and stylistic clarity before revision.',
          conclusions: '## Conclusions\nBased on the analysis, {topic} presents a complex landscape requiring nuanced understanding. Continued monitoring and adaptive strategies are recommended for all stakeholders.',
          draftFooter: '---\n*Draft {iteration} \u2014 Generated via LangGraph Reflection Studio (client-side)*',
          reflectionTitle: '## Review of Draft {iteration}: {topic}',
          contentAccuracy: '### Content Accuracy\nThe report covers key aspects of the topic. However, some claims could benefit from more specific data points or examples. Consider adding quantitative evidence where available.',
          structureEarly: '### Structure & Organization\nThe current structure follows a logical flow from context through findings to conclusions. The executive summary could be more concise.',
          structureLater: '### Structure & Organization\nThe current structure follows a logical flow from context through findings to conclusions. Structure has improved since the previous draft.',
          depthEarly: '### Analytical Depth\nThe analysis remains somewhat surface-level. Deeper exploration of causal relationships and second-order effects would strengthen the report.',
          depthLater: '### Analytical Depth\nThe analytical depth has improved with each iteration. Consider exploring contrarian viewpoints for a more balanced perspective.',
          suggestionsHeader: '### Suggestions for Improvement',
          suggestion1: '1. Add specific examples or case studies related to {topic}',
          suggestion2: '2. Include data-driven evidence to support key claims',
          suggestion3: '3. Expand the conclusions with actionable recommendations',
          suggestion4Early: '4. Consider adding a risks/limitations section',
          suggestion4Later: '4. Refine the executive summary to reflect accumulated improvements',
          reflectionFooter: '*Reviewed draft {iteration} \u2014 awaiting user feedback before next revision.*',
        },
        langgraph_placeholders: {
          controlsDefaultTopic: 'The Impact of Artificial Intelligence on Modern Healthcare',
          controlsTopicPlaceholder: 'Enter report topic...',
        },
      },
      nodes: [
        {
          id: '__start__',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'start',
            category: 'Control',
            label: 'Start',
            icon: '\u25b6',
            inputs: {},
            handles: { sources: ['output'] },
            style: {
              bgColor: '#f8fafc', textColor: '#475569',
              borderColor: '#e2e8f0', accentColor: '#6366f1', handleColor: '#6366f1',
            },
          },
        },
        {
          id: 'generate',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'generate',
            category: 'Processing',
            label: 'Generate Report',
            icon: '\ud83d\udcdd',
            handler: 'generationNode',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: {
              bgColor: '#eff6ff', textColor: '#1d4ed8',
              borderColor: '#bfdbfe', accentColor: '#3b82f6', handleColor: '#3b82f6',
              stageBadge: 'bg-blue-100 text-blue-700',
            },
            g11n: { timeline: { itemTitle: 'Generated Report: {stage.id}' } },
          },
        },
        {
          id: 'reflect',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'reflect',
            category: 'Processing',
            label: 'Reflect & Critique',
            icon: '\ud83d\udd0d',
            handler: 'reflectionNode',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: {
              bgColor: '#f5f3ff', textColor: '#6d28d9',
              borderColor: '#ddd6fe', accentColor: '#8b5cf6', handleColor: '#8b5cf6',
              stageBadge: 'bg-violet-100 text-violet-700',
            },
            g11n: {
              timeline: { itemTitle: 'Reflection: {stage.id}' },
              feedback: { title: 'Paused for Feedback: {stage.label}' },
            },
          },
        },
        {
          id: 'user_feedback',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'user_feedback',
            category: 'Interaction',
            label: 'User Feedback',
            icon: '\ud83d\udcac',
            handler: 'userFeedbackNode',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: {
              bgColor: '#f8fafc', textColor: '#475569',
              borderColor: '#e2e8f0', accentColor: '#f59e0b', handleColor: '#f59e0b',
              activeBgColor: '#fffbeb', activeTextColor: '#b45309',
              activeBorderColor: '#fcd34d', stageBadge: 'bg-amber-100 text-amber-700',
            },
            g11n: {
              timeline: { itemTitle: 'User Feedback: {stage.id}' },
              feedback: { description: 'The graph is paused \u2014 provide input to continue' },
            },
          },
        },
        {
          id: '__end__',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'end',
            category: 'Control',
            label: 'Final Report',
            icon: '\u2705',
            inputs: {},
            handles: { targets: ['input'] },
            style: {
              bgColor: '#f8fafc', textColor: '#475569',
              borderColor: '#e2e8f0', accentColor: '#22c55e', handleColor: '#22c55e',
              activeBgColor: '#f0fdf4', activeTextColor: '#15803d',
              activeBorderColor: '#86efac', stageBadge: 'bg-green-100 text-green-700',
            },
            g11n: { timeline: { completeLabel: 'Report Finalized' } },
          },
        },
      ],
      edges: [
        {
          id: 'e-start-gen', source: '__start__', sourceHandle: '__start__-output',
          target: 'generate', targetHandle: 'generate-input',
          type: 'smoothstep', data: { color: '#6366f1', animated: true },
        },
        {
          id: 'e-gen-reflect', source: 'generate', sourceHandle: 'generate-output',
          target: 'reflect', targetHandle: 'reflect-input',
          type: 'smoothstep',
          data: { color: '#3b82f6', animated: true, label: 'iterations < max', condition: 'shouldContinue', conditionResult: 'reflect' },
        },
        {
          id: 'e-reflect-fb', source: 'reflect', sourceHandle: 'reflect-output',
          target: 'user_feedback', targetHandle: 'user_feedback-input',
          type: 'smoothstep', data: { color: '#8b5cf6', animated: true },
        },
        {
          id: 'e-fb-gen', source: 'user_feedback', sourceHandle: 'user_feedback-output',
          target: 'generate', targetHandle: 'generate-input',
          type: 'smoothstep', data: { color: '#d97706', animated: true },
        },
        {
          id: 'e-gen-end', source: 'generate', sourceHandle: 'generate-output',
          target: '__end__', targetHandle: '__end__-input',
          type: 'smoothstep',
          data: { color: '#16a34a', animated: false, dashArray: '6 3', label: 'iterations >= max', condition: 'shouldContinue', conditionResult: '__end__' },
        },
      ],
    },
  },
  {
    id: 'simple-pipeline',
    label: 'Simple Pipeline',
    description: 'Linear generate-to-end pipeline with no feedback loop',
    template: {
      name: 'Simple Pipeline',
      description: 'Linear generate-to-end pipeline with no feedback loop',
      config: {
        maxIterations: 1,
        entryPoint: 'generate',
        interruptBefore: [],
      },
      state: {
        messages: { reducer: 'append', default: [] },
        iterations: { reducer: 'replace', default: 0 },
      },
      conditions: {},
      g11n: {
        templates: {
          reportTitle: '# Report: {topic}',
          executiveSummary: '## Executive Summary\nA concise analysis of {topic}.',
          backgroundContext: '## Background\n{topic} is an important area of study with broad implications.',
          keyFindings: '## Key Findings\n1. Primary finding regarding {topic}.\n2. Secondary observation.\n3. Supporting evidence.',
          methodology: '## Methodology\nSingle-pass analysis without iterative refinement.',
          conclusions: '## Conclusions\n{topic} warrants further investigation. Key takeaways are summarized above.',
          draftFooter: '---\n*Generated via Simple Pipeline (client-side)*',
        },
        langgraph_placeholders: {
          controlsDefaultTopic: 'Introduction to Machine Learning',
          controlsTopicPlaceholder: 'Enter topic...',
        },
      },
      nodes: [
        {
          id: '__start__',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'start', category: 'Control', label: 'Start', icon: '\u25b6',
            inputs: {}, handles: { sources: ['output'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#6366f1', handleColor: '#6366f1' },
          },
        },
        {
          id: 'generate',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'generate', category: 'Processing', label: 'Generate', icon: '\ud83d\udcdd',
            handler: 'generationNode', inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#eff6ff', textColor: '#1d4ed8', borderColor: '#bfdbfe', accentColor: '#3b82f6', handleColor: '#3b82f6', stageBadge: 'bg-blue-100 text-blue-700' },
          },
        },
        {
          id: '__end__',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'end', category: 'Control', label: 'Done', icon: '\u2705',
            inputs: {}, handles: { targets: ['input'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#22c55e', handleColor: '#22c55e', stageBadge: 'bg-green-100 text-green-700' },
          },
        },
      ],
      edges: [
        {
          id: 'e-start-gen', source: '__start__', sourceHandle: '__start__-output',
          target: 'generate', targetHandle: 'generate-input',
          type: 'smoothstep', data: { color: '#6366f1', animated: true },
        },
        {
          id: 'e-gen-end', source: 'generate', sourceHandle: 'generate-output',
          target: '__end__', targetHandle: '__end__-input',
          type: 'smoothstep', data: { color: '#16a34a', animated: true },
        },
      ],
    },
  },
  {
    id: 'dual-review',
    label: 'Dual Review',
    description: 'Generate with two feedback checkpoints before finalizing',
    template: {
      name: 'Dual Review Pipeline',
      description: 'Generate with two feedback checkpoints before finalizing',
      config: {
        maxIterations: 2,
        entryPoint: 'generate',
        interruptBefore: ['user_feedback'],
      },
      state: {
        messages: { reducer: 'append', default: [] },
        iterations: { reducer: 'replace', default: 0 },
      },
      conditions: {
        shouldContinue: {
          field: 'iterations',
          operator: 'gte',
          value: 'config.maxIterations',
          trueResult: '__end__',
          falseResult: 'reflect',
        },
      },
      g11n: {
        templates: {
          reportTitle: '# Analysis: {topic} (Revision {iteration})',
          executiveSummary: '## Summary\nDual-review analysis of {topic}, revision {iteration}.',
          backgroundContext: '## Context\n{topic} requires careful examination from multiple perspectives.',
          keyFindings: '## Findings\n1. Key insight about {topic}.\n2. Supporting detail.\n3. Implication for stakeholders.',
          revisionsHeader: '## Applied Revisions',
          feedbackItem: '- Revision {index}: "{feedback}"',
          revisionsFooter: 'Applied {count} revision(s).',
          methodology: '## Approach\nDual-pass review with human-in-the-loop feedback at each stage.',
          conclusions: '## Conclusions\nAfter dual review, {topic} analysis is refined and validated.',
          draftFooter: '---\n*Revision {iteration} \u2014 Dual Review Pipeline*',
          reflectionTitle: '## Review {iteration}: {topic}',
          contentAccuracy: '### Accuracy\nContent reviewed for factual correctness.',
          structureEarly: '### Structure\nInitial structure assessment.',
          structureLater: '### Structure\nStructure improved from prior revision.',
          depthEarly: '### Depth\nInitial depth assessment \u2014 needs expansion.',
          depthLater: '### Depth\nDepth improved with iterative refinement.',
          suggestionsHeader: '### Suggestions',
          suggestion1: '1. Strengthen evidence for {topic}',
          suggestion2: '2. Add quantitative data',
          suggestion3: '3. Expand conclusions',
          suggestion4Early: '4. Add risk analysis',
          suggestion4Later: '4. Polish executive summary',
          reflectionFooter: '*Review {iteration} complete.*',
        },
        langgraph_placeholders: {
          controlsDefaultTopic: 'Cloud Migration Strategies for Enterprise',
          controlsTopicPlaceholder: 'Enter analysis topic...',
        },
      },
      nodes: [
        {
          id: '__start__', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'start', category: 'Control', label: 'Start', icon: '\u25b6',
            inputs: {}, handles: { sources: ['output'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#6366f1', handleColor: '#6366f1' },
          },
        },
        {
          id: 'generate', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'generate', category: 'Processing', label: 'Draft', icon: '\ud83d\udcdd',
            handler: 'generationNode', inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#eff6ff', textColor: '#1d4ed8', borderColor: '#bfdbfe', accentColor: '#3b82f6', handleColor: '#3b82f6', stageBadge: 'bg-blue-100 text-blue-700' },
          },
        },
        {
          id: 'reflect', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'reflect', category: 'Processing', label: 'Review', icon: '\ud83d\udd0d',
            handler: 'reflectionNode', inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f5f3ff', textColor: '#6d28d9', borderColor: '#ddd6fe', accentColor: '#8b5cf6', handleColor: '#8b5cf6', stageBadge: 'bg-violet-100 text-violet-700' },
          },
        },
        {
          id: 'user_feedback', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'user_feedback', category: 'Interaction', label: 'Feedback', icon: '\ud83d\udcac',
            handler: 'userFeedbackNode', inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#f59e0b', handleColor: '#f59e0b', stageBadge: 'bg-amber-100 text-amber-700' },
          },
        },
        {
          id: '__end__', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'end', category: 'Control', label: 'Final', icon: '\u2705',
            inputs: {}, handles: { targets: ['input'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#22c55e', handleColor: '#22c55e', stageBadge: 'bg-green-100 text-green-700' },
          },
        },
      ],
      edges: [
        { id: 'e-start-gen', source: '__start__', sourceHandle: '__start__-output', target: 'generate', targetHandle: 'generate-input', type: 'smoothstep', data: { color: '#6366f1', animated: true } },
        { id: 'e-gen-reflect', source: 'generate', sourceHandle: 'generate-output', target: 'reflect', targetHandle: 'reflect-input', type: 'smoothstep', data: { color: '#3b82f6', animated: true, label: 'iterations < max', condition: 'shouldContinue', conditionResult: 'reflect' } },
        { id: 'e-reflect-fb', source: 'reflect', sourceHandle: 'reflect-output', target: 'user_feedback', targetHandle: 'user_feedback-input', type: 'smoothstep', data: { color: '#8b5cf6', animated: true } },
        { id: 'e-fb-gen', source: 'user_feedback', sourceHandle: 'user_feedback-output', target: 'generate', targetHandle: 'generate-input', type: 'smoothstep', data: { color: '#d97706', animated: true } },
        { id: 'e-gen-end', source: 'generate', sourceHandle: 'generate-output', target: '__end__', targetHandle: '__end__-input', type: 'smoothstep', data: { color: '#16a34a', animated: false, dashArray: '6 3', label: 'iterations >= max', condition: 'shouldContinue', conditionResult: '__end__' } },
      ],
    },
  },
  {
    id: 'vuln-resolver',
    label: 'Vulnerability Resolver via GitHub API',
    description: 'Resolve vulnerable package dependencies by loading a dataset, fetching files via GitHub API, updating versions, and creating PRs',
    template: {
      name: 'Vulnerability Resolver via GitHub API',
      description: 'Batch-resolve vulnerable package dependencies from a dataset (CSV/API), update dependency files via GitHub API, and create PRs',
      config: {
        maxIterations: 3,
        entryPoint: 'load_dataset',
        interruptBefore: ['review_changes'],
      },
      state: {
        messages: { reducer: 'append', default: [] },
        iterations: { reducer: 'replace', default: 0 },
      },
      conditions: {
        hasMoreVulnerabilities: {
          field: 'iterations',
          operator: 'gte',
          value: 'config.maxIterations',
          trueResult: '__end__',
          falseResult: 'fetch_file',
        },
      },
      g11n: {
        templates: {
          loadTitle: '## Loading Vulnerability Dataset',
          loadDescription: 'Ingesting vulnerability records from {source} — {count} entries found.',
          fetchTitle: '## Fetching Dependency File',
          fetchDescription: 'Pulling `{filePath}` from `{repo}` via GitHub API for vulnerability {index}/{total}.',
          updateTitle: '## Updating Dependency',
          updateDescription: 'Upgrading `{package}` from `{fromVersion}` to `{toVersion}` in `{filePath}`.',
          prTitle: '## Creating Pull Request',
          prDescription: 'Opening PR on `{repo}`: fix({package}): bump {package} {fromVersion} → {toVersion}',
          completeTitle: '## Batch Complete',
          completeDescription: 'Processed {processed}/{total} vulnerabilities. {prCount} PRs created.',
        },
        langgraph_placeholders: {
          controlsDefaultTopic: 'Resolve vulnerable dependencies',
          controlsTopicPlaceholder: 'Enter dataset source or description...',
        },
      },
      nodes: [
        {
          id: '__start__', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'start', category: 'Control', label: 'Start', icon: '▶',
            inputs: {}, handles: { sources: ['output'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#6366f1', handleColor: '#6366f1' },
          },
        },
        {
          id: 'load_dataset', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'load_dataset', category: 'Processing', label: 'Load Dataset', icon: '📥',
            handler: 'loadDatasetNode',
            inputs: {
              source: { type: 'string', default: 'csv', description: 'Data source: csv or api' },
              url: { type: 'string', default: '', description: 'CSV file path or API endpoint URL' },
            },
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#eff6ff', textColor: '#1d4ed8', borderColor: '#bfdbfe', accentColor: '#3b82f6', handleColor: '#3b82f6', stageBadge: 'bg-blue-100 text-blue-700' },
          },
        },
        {
          id: 'fetch_file', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'fetch_file', category: 'Processing', label: 'Fetch File (GitHub)', icon: '🔍',
            handler: 'fetchFileNode',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f5f3ff', textColor: '#6d28d9', borderColor: '#ddd6fe', accentColor: '#8b5cf6', handleColor: '#8b5cf6', stageBadge: 'bg-violet-100 text-violet-700' },
          },
        },
        {
          id: 'update_dependency', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'update_dependency', category: 'Processing', label: 'Update Dependency', icon: '🔧',
            handler: 'updateDependencyNode',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#fefce8', textColor: '#a16207', borderColor: '#fde68a', accentColor: '#eab308', handleColor: '#eab308', stageBadge: 'bg-yellow-100 text-yellow-700' },
          },
        },
        {
          id: 'review_changes', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'review_changes', category: 'Interaction', label: 'Review Changes', icon: '👀',
            handler: 'reviewChangesNode',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#f59e0b', handleColor: '#f59e0b', stageBadge: 'bg-amber-100 text-amber-700' },
          },
        },
        {
          id: 'create_pr', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'create_pr', category: 'Processing', label: 'Create PR', icon: '🚀',
            handler: 'createPrNode',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f0fdf4', textColor: '#15803d', borderColor: '#bbf7d0', accentColor: '#22c55e', handleColor: '#22c55e', stageBadge: 'bg-green-100 text-green-700' },
          },
        },
        {
          id: '__end__', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'end', category: 'Control', label: 'Completed', icon: '✅',
            inputs: {}, handles: { targets: ['input'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#22c55e', handleColor: '#22c55e', stageBadge: 'bg-green-100 text-green-700' },
          },
        },
      ],
      edges: [
        {
          id: 'e-start-load', source: '__start__', sourceHandle: '__start__-output',
          target: 'load_dataset', targetHandle: 'load_dataset-input',
          type: 'smoothstep', data: { color: '#6366f1', animated: true },
        },
        {
          id: 'e-load-fetch', source: 'load_dataset', sourceHandle: 'load_dataset-output',
          target: 'fetch_file', targetHandle: 'fetch_file-input',
          type: 'smoothstep',
          data: { color: '#3b82f6', animated: true, label: 'has vulnerabilities', condition: 'hasMoreVulnerabilities', conditionResult: 'fetch_file' },
        },
        {
          id: 'e-fetch-update', source: 'fetch_file', sourceHandle: 'fetch_file-output',
          target: 'update_dependency', targetHandle: 'update_dependency-input',
          type: 'smoothstep', data: { color: '#8b5cf6', animated: true },
        },
        {
          id: 'e-update-review', source: 'update_dependency', sourceHandle: 'update_dependency-output',
          target: 'review_changes', targetHandle: 'review_changes-input',
          type: 'smoothstep', data: { color: '#eab308', animated: true },
        },
        {
          id: 'e-review-pr', source: 'review_changes', sourceHandle: 'review_changes-output',
          target: 'create_pr', targetHandle: 'create_pr-input',
          type: 'smoothstep', data: { color: '#f59e0b', animated: true },
        },
        {
          id: 'e-pr-fetch', source: 'create_pr', sourceHandle: 'create_pr-output',
          target: 'fetch_file', targetHandle: 'fetch_file-input',
          type: 'smoothstep',
          data: { color: '#22c55e', animated: true, label: 'next vulnerability', condition: 'hasMoreVulnerabilities', conditionResult: 'fetch_file' },
        },
        {
          id: 'e-load-end', source: 'load_dataset', sourceHandle: 'load_dataset-output',
          target: '__end__', targetHandle: '__end__-input',
          type: 'smoothstep',
          data: { color: '#16a34a', animated: false, dashArray: '6 3', label: 'no vulnerabilities', condition: 'hasMoreVulnerabilities', conditionResult: '__end__' },
        },
        {
          id: 'e-pr-end', source: 'create_pr', sourceHandle: 'create_pr-output',
          target: '__end__', targetHandle: '__end__-input',
          type: 'smoothstep',
          data: { color: '#16a34a', animated: false, dashArray: '6 3', label: 'all processed', condition: 'hasMoreVulnerabilities', conditionResult: '__end__' },
        },
      ],
    },
  },
];

/**
 * Get a preset template by ID.
 */
export function getPresetById(id) {
  return PRESET_TEMPLATES.find((p) => p.id === id) ?? null;
}
