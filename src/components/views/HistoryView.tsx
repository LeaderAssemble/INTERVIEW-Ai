import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Download, Calendar, Clock, Target, Code, Users,
  ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { useSession } from '../../contexts/SessionContext';
import { InterviewSession } from '../../types';
import { generateSessionReport } from '../../utils/reportGenerator';

export function HistoryView() {
  const { sessionHistory, clearHistory, deleteSession } = useSession();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  const sessionsByCategory = [
    { name: 'HR', value: sessionHistory.filter(s => s.category === 'hr').length, color: '#3b82f6' },
    { name: 'Technical', value: sessionHistory.filter(s => s.category === 'technical').length, color: '#10b981' },
    { name: 'Behavioral', value: sessionHistory.filter(s => s.category === 'behavioral').length, color: '#f59e0b' },
  ];

  const averageScores = sessionHistory.length > 0 ? {
    hr: sessionHistory.filter(s => s.category === 'hr').reduce((acc, s) => acc + s.overallScore, 0) /
      Math.max(1, sessionHistory.filter(s => s.category === 'hr').length),
    technical: sessionHistory.filter(s => s.category === 'technical').reduce((acc, s) => acc + s.overallScore, 0) /
      Math.max(1, sessionHistory.filter(s => s.category === 'technical').length),
    behavioral: sessionHistory.filter(s => s.category === 'behavioral').reduce((acc, s) => acc + s.overallScore, 0) /
      Math.max(1, sessionHistory.filter(s => s.category === 'behavioral').length),
  } : { hr: 0, technical: 0, behavioral: 0 };

  const handleDownloadReport = async (session: InterviewSession) => {
    setGeneratingPdf(session.id);
    try {
      await generateSessionReport(session);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingPdf(null);
    }
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSession(prev => prev === sessionId ? null : sessionId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session History</h1>
          <p className="text-secondary-400 mt-1">Review your past interview sessions</p>
        </div>
        {sessionHistory.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-ghost flex items-center gap-2 text-error-400 hover:text-error-300"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop flex items-center justify-center"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-warning-500" />
                <h3 className="text-xl font-semibold">Clear Session History</h3>
              </div>
              <p className="text-secondary-400 mb-6">
                Are you sure you want to delete all session history? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearHistory();
                    setShowClearConfirm(false);
                  }}
                  className="px-6 py-3 bg-error-500/20 text-error-400 rounded-xl border border-error-500/30 hover:bg-error-500/30 transition-colors"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {sessionHistory.length > 0 ? (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card col-span-1">
              <h3 className="font-semibold mb-4">Sessions by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sessionsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sessionsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {sessionsByCategory.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-secondary-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card col-span-2 space-y-4">
              <h3 className="font-semibold">Average Scores by Category</h3>
              <div className="space-y-4">
                <ScoreBar label="HR" score={averageScores.hr} color="primary" />
                <ScoreBar label="Technical" score={averageScores.technical} color="accent" />
                <ScoreBar label="Behavioral" score={averageScores.behavioral} color="warning" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">All Sessions</h3>
            <div className="space-y-4">
              {[...sessionHistory].reverse().map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(session.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.category === 'hr' ? 'bg-primary-500/20' :
                        session.category === 'technical' ? 'bg-accent-500/20' : 'bg-warning-500/20'
                      }`}>
                        {session.category === 'hr' ? (
                          <Users className={`w-6 h-6 text-primary-400`} />
                        ) : session.category === 'technical' ? (
                          <Code className="w-6 h-6 text-accent-400" />
                        ) : (
                          <Target className="w-6 h-6 text-warning-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold capitalize">{session.category} Interview</h4>
                        <div className="flex items-center gap-4 text-sm text-secondary-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(session.startedAt), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(session.startedAt), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          session.overallScore >= 85 ? 'text-success-400' :
                          session.overallScore >= 70 ? 'text-primary-400' :
                          session.overallScore >= 55 ? 'text-warning-400' : 'text-error-400'
                        }`}>
                          {session.overallScore}%
                        </div>
                        <p className="text-xs text-secondary-500">
                          {session.answers.length} questions
                        </p>
                      </div>
                      {expandedSession === session.id ? (
                        <ChevronUp className="w-5 h-5 text-secondary-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-secondary-400" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSession === session.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-secondary-800">
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="glass rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-primary-400">
                                {session.feedbacks.length > 0
                                  ? Math.round(session.feedbacks.reduce((acc, f) => acc + f.clarity, 0) / session.feedbacks.length)
                                  : 0}%
                              </div>
                              <p className="text-xs text-secondary-400">Clarity</p>
                            </div>
                            <div className="glass rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-accent-400">
                                {session.feedbacks.length > 0
                                  ? Math.round(session.feedbacks.reduce((acc, f) => acc + f.relevance, 0) / session.feedbacks.length)
                                  : 0}%
                              </div>
                              <p className="text-xs text-secondary-400">Relevance</p>
                            </div>
                            <div className="glass rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-warning-400">
                                {session.feedbacks.length > 0
                                  ? Math.round(session.feedbacks.reduce((acc, f) => acc + f.completeness, 0) / session.feedbacks.length)
                                  : 0}%
                              </div>
                              <p className="text-xs text-secondary-400">Completeness</p>
                            </div>
                            <div className="glass rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-success-400">
                                {session.feedbacks.length > 0
                                  ? Math.round(session.feedbacks.reduce((acc, f) => acc + f.confidence, 0) / session.feedbacks.length)
                                  : 0}%
                              </div>
                              <p className="text-xs text-secondary-400">Confidence (text)</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReport(session);
                              }}
                              disabled={generatingPdf === session.id}
                              className="btn-primary flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              {generatingPdf === session.id ? 'Generating...' : 'Download Report'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                              }}
                              className="btn-secondary text-error-400 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-16"
        >
          <Calendar className="w-16 h-16 mx-auto mb-4 text-secondary-600" />
          <h3 className="text-xl font-semibold mb-2">No Sessions Yet</h3>
          <p className="text-secondary-400 max-w-md mx-auto">
            Start your first practice session to see your interview history here.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-secondary-400">{label}</span>
        <span className={`font-semibold text-${color}-400`}>{Math.round(score)}%</span>
      </div>
      <div className="progress-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-full rounded-full bg-${color}-500`}
        />
      </div>
    </div>
  );
}
