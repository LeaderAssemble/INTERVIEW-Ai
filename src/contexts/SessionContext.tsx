import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { InterviewSession, SessionStats, Question, Answer, Feedback, InterviewCategory } from '../types';
import { generateFeedback, calculateOverallScore } from '../utils/feedbackGenerator';
import { evaluateAnswerWithAi } from '../services/interviewAi';
import { apiRequest } from '../lib/api';
import { createId } from '../lib/ids';
import { useAuth } from './AuthContext';

const demoSessionsKey = 'interviewSessions:demo';

function readStoredSessions(key: string): InterviewSession[] {
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  const parsed: InterviewSession[] = JSON.parse(stored);
  return parsed.map(session => ({
    ...session,
    startedAt: new Date(session.startedAt),
    completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
    answers: session.answers.map(answer => ({ ...answer, timestamp: new Date(answer.timestamp) })),
  }));
}

function restoreSession(session: InterviewSession): InterviewSession {
  return {
    ...session,
    startedAt: new Date(session.startedAt),
    completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
    answers: session.answers.map(answer => ({ ...answer, timestamp: new Date(answer.timestamp) })),
  };
}

interface SessionContextType {
  currentSession: InterviewSession | null;
  sessionHistory: InterviewSession[];
  sessionStats: SessionStats;
  isLoading: boolean;
  startSession: (category: InterviewCategory, questions: Question[]) => void;
  submitAnswer: (answer: Answer, useAi?: boolean) => Promise<Feedback>;
  endSession: () => Promise<void>;
  clearSession: () => void;
  clearHistory: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  addFollowUpQuestion: (question: Question, afterQuestionIndex: number) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth();
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    if (isDemo) {
      try {
        setSessionHistory(readStoredSessions(demoSessionsKey));
      } catch (error) {
        console.error('Failed to load demo sessions:', error);
        setSessionHistory([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!user) {
      setSessionHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const sessions = await apiRequest<InterviewSession[]>('/sessions');
      setSessionHistory(sessions.map(restoreSession));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      try {
        setSessionHistory(readStoredSessions('interviewSessions'));
      } catch (storageError) {
        console.error('Failed to load locally stored sessions:', storageError);
        setSessionHistory([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isDemo, user]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const sessionStats: SessionStats = {
    totalSessions: sessionHistory.length,
    averageScore: sessionHistory.length > 0
      ? Math.round(sessionHistory.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessionHistory.length)
      : 0,
    averageDuration: sessionHistory.length > 0
      ? Math.round(sessionHistory.reduce((acc, s) => acc + s.duration, 0) / sessionHistory.length)
      : 0,
    improvementRate: calculateImprovementRate(sessionHistory),
    categoryScores: {
      hr: getCategoryAverage(sessionHistory, 'hr'),
      technical: getCategoryAverage(sessionHistory, 'technical'),
      behavioral: getCategoryAverage(sessionHistory, 'behavioral'),
    },
    recentSessions: sessionHistory.slice(-5).reverse(),
  };

  const startSession = useCallback((category: InterviewCategory, questions: Question[]) => {
    const newSession: InterviewSession = {
      id: createId(),
      category,
      questions,
      answers: [],
      feedbacks: [],
      overallScore: 0,
      startedAt: new Date(),
      duration: 0,
    };
    setCurrentSession(newSession);
  }, []);

  const addFollowUpQuestion = useCallback((question: Question, afterQuestionIndex: number) => {
    setCurrentSession(prev => {
      if (!prev || prev.questions.some(existing => existing.id === question.id)) return prev;
      const questions = [...prev.questions];
      questions.splice(afterQuestionIndex + 1, 0, question);
      return { ...prev, questions };
    });
  }, []);

  const submitAnswer = useCallback(async (answer: Answer, useAi = false): Promise<Feedback> => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    const question = currentSession.questions.find(q => q.id === answer.questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const feedback = useAi
      ? await evaluateAnswerWithAi({ question, transcript: answer.transcript })
      : generateFeedback(answer.transcript, question);

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        answers: [...prev.answers, answer],
        feedbacks: [...prev.feedbacks, feedback],
        overallScore: calculateOverallScore([...prev.feedbacks, feedback]),
      };
    });

    return feedback;
  }, [currentSession]);

  const endSession = useCallback(async () => {
    if (!currentSession) return;

    const completedSession: InterviewSession = {
      ...currentSession,
      completedAt: new Date(),
      duration: Math.round(
        (new Date().getTime() - currentSession.startedAt.getTime()) / 1000
      ),
    };

    if (isDemo) {
      const updated = [...sessionHistory, completedSession];
      localStorage.setItem(demoSessionsKey, JSON.stringify(updated));
      setSessionHistory(updated);
      setCurrentSession(completedSession);
      return;
    }

    try {
      await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify(completedSession),
      });
      setSessionHistory(prev => [...prev, completedSession]);
    } catch (error) {
      console.error('Failed to save session:', error);
      setSessionHistory(prev => {
        const updated = [...prev, completedSession];
        localStorage.setItem('interviewSessions', JSON.stringify(updated));
        return updated;
      });
    }

    setCurrentSession(completedSession);
  }, [currentSession, isDemo, sessionHistory]);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const clearHistory = useCallback(async () => {
    if (isDemo) {
      localStorage.removeItem(demoSessionsKey);
      setSessionHistory([]);
      return;
    }

    await apiRequest<void>('/sessions', { method: 'DELETE' });
    setSessionHistory([]);
    localStorage.removeItem('interviewSessions');
  }, [isDemo]);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (isDemo) {
      const updated = sessionHistory.filter(session => session.id !== sessionId);
      localStorage.setItem(demoSessionsKey, JSON.stringify(updated));
      setSessionHistory(updated);
      return;
    }

    await apiRequest<void>(`/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
    setSessionHistory(prev => prev.filter(s => s.id !== sessionId));
  }, [isDemo, sessionHistory]);

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessionHistory,
        sessionStats,
        isLoading,
        startSession,
        submitAnswer,
        endSession,
        clearSession,
        clearHistory,
        deleteSession,
        addFollowUpQuestion,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

function getCategoryAverage(sessions: InterviewSession[], category: InterviewCategory): number {
  const categorySessions = sessions.filter(s => s.category === category);
  if (categorySessions.length === 0) return 0;
  return Math.round(
    categorySessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / categorySessions.length
  );
}

function calculateImprovementRate(sessions: InterviewSession[]): number {
  if (sessions.length < 2) return 0;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  const firstHalf = sortedSessions.slice(0, Math.floor(sortedSessions.length / 2));
  const secondHalf = sortedSessions.slice(Math.floor(sortedSessions.length / 2));

  const firstAvg = firstHalf.reduce((acc, s) => acc + (s.overallScore || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((acc, s) => acc + (s.overallScore || 0), 0) / secondHalf.length;

  if (firstAvg === 0) return 0;
  return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
}
