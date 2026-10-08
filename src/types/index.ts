export type InterviewCategory = 'hr' | 'technical' | 'behavioral';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type InterviewStatus = 'idle' | 'listening' | 'processing' | 'answering' | 'completed';

export interface Question {
  id: string;
  category: InterviewCategory;
  text: string;
  difficulty: QuestionDifficulty;
  referenceAnswer?: string;
  keywords: string[];
  idealAnswerPoints: string[];
  tips: string[];
}

export interface Answer {
  id: string;
  questionId: string;
  transcript: string;
  duration: number;
  timestamp: Date;
}

export interface Feedback {
  overallScore: number;
  clarity: number;
  relevance: number;
  completeness: number;
  confidence: number;
  relevant?: boolean;
  relevance_score?: number;
  clarity_score?: number;
  completeness_score?: number;
  communication_score?: number;
  total_score?: number;
  evaluation_status?: 'evaluated' | 'empty' | 'timeout' | 'rate_limited' | 'invalid_response' | 'unavailable';
  feedback?: string;
  feedbackMethod?: string;
  strengths: string[];
  improvements: string[];
  keywords_used: string[];
  missed_keywords: string[];
  scoreExplanations?: {
    clarity: string;
    relevance: string;
    completeness: string;
    confidence: string;
  };
}

export interface InterviewSession {
  id: string;
  category: InterviewCategory;
  questions: Question[];
  answers: Answer[];
  feedbacks: Feedback[];
  overallScore: number;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
}

export interface SessionStats {
  totalSessions: number;
  averageScore: number;
  averageDuration: number;
  improvementRate: number;
  categoryScores: {
    hr: number;
    technical: number;
    behavioral: number;
  };
  recentSessions: InterviewSession[];
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PerformanceTrend {
  date: string;
  score: number;
}

export type Theme = 'dark' | 'light';

export type View = 'dashboard' | 'interview' | 'history' | 'settings';
