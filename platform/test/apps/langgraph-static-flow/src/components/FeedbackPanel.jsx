import { useState } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { resolveG11n, buildStageContext } from '../graph/g11n.js';

export default function FeedbackPanel() {
  const isPaused = useGraphStore((s) => s.isPaused);
  const submitFeedback = useGraphStore((s) => s.submitFeedback);
  const skipFeedback = useGraphStore((s) => s.skipFeedback);
  const currentStage = useGraphStore((s) => s.currentStage);
  const graphDef = useGraphStore((s) => s.graphDef);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pausedAtStage = currentStage;

  if (!isPaused || !graphDef) return null;

  // Build context from the stage where the graph is paused
  const pausedNodeDef = graphDef.nodes.find((n) => n.id === pausedAtStage);
  const ctx = buildStageContext(pausedNodeDef);

  const t = (key) => resolveG11n(graphDef, pausedAtStage, 'feedback', key, ctx);

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitFeedback(feedback);
    setFeedback('');
    setSubmitting(false);
  };

  const handleSkip = async () => {
    setSubmitting(true);
    await skipFeedback();
    setFeedback('');
    setSubmitting(false);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[90vw] animate-fade-in">
      <div className="bg-white border border-amber-300 rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-500 text-lg">💬</span>
          <h3 className="text-sm font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
            {t('title')}
          </h3>
          <span className="ml-auto text-xs text-slate-400">
            {t('description')}
          </span>
        </div>

        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t('placeholder')}
          disabled={submitting}
          className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:bg-white"
        />

        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors disabled:opacity-50 hover:bg-slate-50"
          >
            {t('skipButton')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? t('submittingButton') : t('submitButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
