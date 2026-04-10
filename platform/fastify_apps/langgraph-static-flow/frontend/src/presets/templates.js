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
            interruptBehavior: 'before',
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
            handler: 'userFeedbackNode', interruptBehavior: 'before', inputs: {},
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
        entryPoint: 'input_data_source',
      },
      state: {
        messages: { reducer: 'append', default: [] },
        iterations: { reducer: 'replace', default: 0 },
      },
      conditions: {
        hasMoreVulnerabilities: {
          field: 'iterations',
          operator: 'gt',
          value: 0,
          trueResult: 'fetch_file',
          falseResult: '__end__',
        },
      },
      g11n: {
        templates: {
          inputSourceTitle: '## Input Data Source',
          inputSourceDescription: 'Providing mock vulnerability dataset from {source}.',
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
          id: 'input_data_source', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'input_data_source', category: 'Input', label: 'Input Data Source', icon: '📋',
            handler: 'inputDataSourceNode',
            interruptBehavior: 'before',
            interruptType: 'data_source_input',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#fdf4ff', textColor: '#a21caf', borderColor: '#f0abfc', accentColor: '#d946ef', handleColor: '#d946ef', stageBadge: 'bg-fuchsia-100 text-fuchsia-700' },
            g11n: {
              feedback: {
                title: 'Provide Data Source',
                description: 'Paste CSV data or enter an API endpoint URL',
                csvTabLabel: 'Paste CSV',
                apiTabLabel: 'API Endpoint',
                csvPlaceholder: 'package,severity,current_version,fixed_version,repository,file,cve\nlodash,high,4.17.15,4.17.21,acme/web-app,package.json,CVE-2021-23337',
                apiPlaceholder: 'https://api.example.com/vulnerabilities',
                sampleButton: 'Load Sample CSV',
                submitButton: 'Load Data',
              },
            },
          },
        },
        {
          id: 'load_dataset', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'load_dataset', category: 'Processing', label: 'Load Dataset', icon: '📥',
            handler: 'loadDatasetNode',
            interruptBehavior: 'after',
            interruptType: 'schema_mapping',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#eff6ff', textColor: '#1d4ed8', borderColor: '#bfdbfe', accentColor: '#3b82f6', handleColor: '#3b82f6', stageBadge: 'bg-blue-100 text-blue-700' },
            g11n: {
              feedback: {
                title: 'Map Dataset to Schema',
                description: 'Assign each CSV column to the correct schema field',
                submitButton: 'Apply Mapping',
              },
            },
          },
        },
        {
          id: 'validate_schema', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'validate_schema', category: 'Processing', label: 'Validate Schema', icon: '🛡',
            handler: 'validateSchemaNode',
            interruptBehavior: 'after',
            interruptType: 'presentation',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#ecfdf5', textColor: '#065f46', borderColor: '#a7f3d0', accentColor: '#10b981', handleColor: '#10b981', stageBadge: 'bg-emerald-100 text-emerald-700' },
            g11n: {
              feedback: {
                title: 'Schema Validation Results',
                description: 'Review validation before proceeding',
                continueButton: 'Continue',
              },
            },
          },
        },
        {
          id: 'fetch_file', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'fetch_file', category: 'Processing', label: 'Fetch File (GitHub)', icon: '🔍',
            handler: 'fetchFileNode',
            interruptBehavior: 'before',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f5f3ff', textColor: '#6d28d9', borderColor: '#ddd6fe', accentColor: '#8b5cf6', handleColor: '#8b5cf6', stageBadge: 'bg-violet-100 text-violet-700' },
            g11n: {
              feedback: {
                title: 'Fetch Dependency Files',
                description: 'Ready to fetch dependency files from GitHub for all vulnerabilities',
                continueButton: 'Fetch All Files',
              },
            },
          },
        },
        {
          id: 'update_dependency', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'update_dependency', category: 'Processing', label: 'Update Dependency', icon: '🔧',
            handler: 'updateDependencyNode',
            interruptBehavior: 'after',
            interruptType: 'presentation',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#fefce8', textColor: '#a16207', borderColor: '#fde68a', accentColor: '#eab308', handleColor: '#eab308', stageBadge: 'bg-yellow-100 text-yellow-700' },
            g11n: {
              feedback: {
                title: 'Dependency Updates Applied',
                description: 'Review all dependency version bumps before proceeding to review',
                continueButton: 'Continue to Review',
              },
            },
          },
        },
        {
          id: 'review_changes', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'review_changes', category: 'Interaction', label: 'Review Changes', icon: '👀',
            handler: 'reviewChangesNode',
            interruptBehavior: 'before',
            interruptType: 'feedback',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f8fafc', textColor: '#475569', borderColor: '#e2e8f0', accentColor: '#f59e0b', handleColor: '#f59e0b', stageBadge: 'bg-amber-100 text-amber-700' },
            g11n: {
              feedback: {
                title: 'Review Changes',
                description: 'Review the dependency updates before proceeding',
                placeholder: 'Provide feedback on the changes...',
                skipButton: 'Skip',
                submitButton: 'Approve Changes',
              },
            },
          },
        },
        {
          id: 'create_pr', type: 'customNode', position: { x: 0, y: 0 },
          data: {
            nodeType: 'create_pr', category: 'Processing', label: 'Create PR', icon: '🚀',
            handler: 'createPrNode',
            interruptBehavior: 'before',
            interruptType: 'review',
            inputs: {},
            handles: { targets: ['input'], sources: ['output'] },
            style: { bgColor: '#f0fdf4', textColor: '#15803d', borderColor: '#bbf7d0', accentColor: '#22c55e', handleColor: '#22c55e', stageBadge: 'bg-green-100 text-green-700' },
            g11n: {
              feedback: {
                title: 'Review Before Creating PR',
                description: 'Approve or reject the pull request creation',
                placeholder: 'Add review notes (optional)...',
                approveButton: 'Create PR',
                rejectButton: 'Skip PR',
              },
            },
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
          id: 'e-start-input', source: '__start__', sourceHandle: '__start__-output',
          target: 'input_data_source', targetHandle: 'input_data_source-input',
          type: 'smoothstep', data: { color: '#6366f1', animated: true },
        },
        {
          id: 'e-input-load', source: 'input_data_source', sourceHandle: 'input_data_source-output',
          target: 'load_dataset', targetHandle: 'load_dataset-input',
          type: 'smoothstep', data: { color: '#d946ef', animated: true },
        },
        {
          id: 'e-load-validate', source: 'load_dataset', sourceHandle: 'load_dataset-output',
          target: 'validate_schema', targetHandle: 'validate_schema-input',
          type: 'smoothstep', data: { color: '#3b82f6', animated: true },
        },
        // validate_schema → fetch_file (has vulnerabilities to process)
        {
          id: 'e-validate-fetch', source: 'validate_schema', sourceHandle: 'validate_schema-output',
          target: 'fetch_file', targetHandle: 'fetch_file-input',
          type: 'smoothstep',
          data: { color: '#10b981', animated: true, label: 'has vulnerabilities', condition: 'hasMoreVulnerabilities', conditionResult: 'fetch_file' },
        },
        // validate_schema → __end__ (no vulnerabilities)
        {
          id: 'e-validate-end', source: 'validate_schema', sourceHandle: 'validate_schema-output',
          target: '__end__', targetHandle: '__end__-input',
          type: 'smoothstep',
          data: { color: '#16a34a', animated: false, dashArray: '6 3', label: 'no vulnerabilities', condition: 'hasMoreVulnerabilities', conditionResult: '__end__' },
        },
        // fetch_file → update_dependency (direct — batch processing, no loop)
        {
          id: 'e-fetch-update', source: 'fetch_file', sourceHandle: 'fetch_file-output',
          target: 'update_dependency', targetHandle: 'update_dependency-input',
          type: 'smoothstep', data: { color: '#8b5cf6', animated: true },
        },
        // update_dependency → review_changes (direct — all items processed in batch)
        {
          id: 'e-update-review', source: 'update_dependency', sourceHandle: 'update_dependency-output',
          target: 'review_changes', targetHandle: 'review_changes-input',
          type: 'smoothstep', data: { color: '#eab308', animated: true },
        },
        // review_changes → create_pr (direct)
        {
          id: 'e-review-pr', source: 'review_changes', sourceHandle: 'review_changes-output',
          target: 'create_pr', targetHandle: 'create_pr-input',
          type: 'smoothstep', data: { color: '#f59e0b', animated: true },
        },
        // create_pr → __end__ (direct)
        {
          id: 'e-pr-end', source: 'create_pr', sourceHandle: 'create_pr-output',
          target: '__end__', targetHandle: '__end__-input',
          type: 'smoothstep', data: { color: '#22c55e', animated: true },
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
