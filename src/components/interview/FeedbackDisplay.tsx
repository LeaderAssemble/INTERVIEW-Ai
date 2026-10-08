import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Target, TrendingUp, Lightbulb, XCircle } from 'lucide-react';
import { Feedback } from '../../types';
import { ScoreRing } from './ScoreRing';

interface FeedbackDisplayProps {
  feedback: Feedback;
  questionText?: string;
}

export function FeedbackDisplay({ feedback, questionText }: FeedbackDisplayProps) {
  const isSemanticEvaluation = typeof feedback.total_score === 'number';
  const evaluationUnavailable = isSemanticEvaluation &&
    feedback.evaluation_status !== 'evaluated' &&
    feedback.evaluation_status !== 'empty';
  const categoryScore = (score: number) => isSemanticEvaluation ? score * 10 : score;
  const getCategory = (score: number) => {
    const thresholdScore = categoryScore(score);
    if (thresholdScore >= 85) return { label: 'Excellent', color: 'success', icon: CheckCircle };
    if (thresholdScore >= 70) return { label: 'Good', color: 'primary', icon: Target };
    if (thresholdScore >= 55) return { label: 'Fair', color: 'warning', icon: TrendingUp };
    return { label: 'Needs Work', color: 'error', icon: AlertCircle };
  };

  const overallCategory = getCategory(isSemanticEvaluation ? feedback.total_score! : feedback.overallScore);
  const OverallIcon = overallCategory.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ScoreRing
          score={feedback.overallScore}
          size={100}
          displayScore={isSemanticEvaluation
            ? evaluationUnavailable
              ? 'N/A'
              : `${feedback.total_score!.toFixed(2)} / 10`
            : undefined}
          label={isSemanticEvaluation ? 'Total Score' : 'Score'}
        />

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <OverallIcon className={`w-5 h-5 text-${overallCategory.color}-500`} />
            <span className={`text-lg font-semibold text-${overallCategory.color}-400`}>
              {overallCategory.label}
            </span>
          </div>
          <div className="mb-2 inline-flex items-center rounded-full border border-primary-500/20 bg-primary-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-primary-400">
            {feedback.feedbackMethod ?? 'Rule-based transcript analysis'}
          </div>
          {questionText && (
            <p className="text-secondary-400 text-sm line-clamp-2">{questionText}</p>
          )}
        </div>
      </div>

      {isSemanticEvaluation && feedback.feedback && (
        <p className="rounded-lg border border-secondary-700/60 bg-secondary-900/30 p-4 text-sm text-secondary-200">
          {feedback.feedback}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isSemanticEvaluation ? (
          <>
            <StatItem label="Relevance" value={feedback.relevance_score!} maxScore={10} unavailable={evaluationUnavailable} />
            <StatItem label="Clarity" value={feedback.clarity_score!} maxScore={10} unavailable={evaluationUnavailable} />
            <StatItem label="Completeness" value={feedback.completeness_score!} maxScore={10} unavailable={evaluationUnavailable} />
            <StatItem label="Communication" value={feedback.communication_score!} maxScore={10} unavailable={evaluationUnavailable} />
          </>
        ) : (
          <>
            <StatItem label="Clarity" value={feedback.clarity} explanation={feedback.scoreExplanations?.clarity} />
            <StatItem label="Relevance" value={feedback.relevance} explanation={feedback.scoreExplanations?.relevance} />
            <StatItem label="Completeness" value={feedback.completeness} explanation={feedback.scoreExplanations?.completeness} />
            <StatItem label="Confidence (text)" value={feedback.confidence} explanation={feedback.scoreExplanations?.confidence} />
          </>
        )}
      </div>

      <p className="text-xs text-secondary-500">
        {isSemanticEvaluation
          ? 'Semantic AI assessment based on the question, reference answer when available, and your answer transcript. Communication does not assess vocal tone, accent, or body language.'
          : 'Practice estimate based on transcript keywords, phrasing, and structure—not a live AI assessment. Confidence is estimated from wording patterns only; vocal delivery, speech emotion, and tone are not assessed.'}
      </p>

      {feedback.strengths.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success-500" />
            <h4 className="font-medium text-success-400">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-secondary-300"
              >
                <span className="text-success-500 mt-1">+</span>
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {feedback.improvements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-warning-500" />
            <h4 className="font-medium text-warning-400">Areas for Improvement</h4>
          </div>
          <ul className="space-y-2">
            {feedback.improvements.map((improvement, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-secondary-300"
              >
                <span className="text-warning-500 mt-1">&gt;</span>
                <span>{improvement}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {!isSemanticEvaluation && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="feedback-card feedback-success">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success-500" />
            <span className="text-sm font-medium text-success-400">Keywords Used</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.keywords_used.length > 0 ? (
              feedback.keywords_used.map((kw, idx) => (
                <span key={idx} className="badge-success text-xs">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-secondary-500 text-sm">No key terms detected</span>
            )}
          </div>
        </div>

        <div className="feedback-card border-l-error-500 bg-error-500/5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-error-500" />
            <span className="text-sm font-medium text-error-400">Missing Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.missed_keywords.length > 0 ? (
              feedback.missed_keywords.map((kw, idx) => (
                <span key={idx} className="badge-error text-xs">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-secondary-500 text-sm">All key terms covered</span>
            )}
          </div>
        </div>
      </div>}
    </motion.div>
  );
}

function StatItem({
  label,
  value,
  explanation,
  maxScore = 100,
  unavailable = false,
}: {
  label: string;
  value: number;
  explanation?: string;
  maxScore?: 10 | 100;
  unavailable?: boolean;
}) {
  const getColor = (val: number) => {
    const score = maxScore === 10 ? val * 10 : val;
    if (score >= 85) return 'text-success-500';
    if (score >= 70) return 'text-primary-500';
    if (score >= 55) return 'text-warning-500';
    return 'text-error-500';
  };

  return (
    <div className="glass rounded-lg p-3 text-center" title={explanation}>
      <div className={`text-2xl font-bold ${getColor(value)}`}>{unavailable ? '—' : maxScore === 10 ? value.toFixed(1) : value}</div>
      <div className="text-xs text-secondary-400">{label}</div>
      {explanation && <p className="mt-1 text-[11px] leading-snug text-secondary-500">{explanation}</p>}
    </div>
  );
}
