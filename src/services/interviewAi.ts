import { apiRequest } from '../lib/api';
import { Feedback, InterviewCategory, Question } from '../types';

interface GenerateQuestionsInput {
  category: InterviewCategory;
  count: number;
  targetRole: string;
  experienceLevel: string;
}

interface EvaluateAnswerInput {
  question: Question;
  transcript: string;
}

interface ChatInput {
  message: string;
}

interface ChatResponse {
  reply: string;
}

export async function generateAiQuestions(input: GenerateQuestionsInput): Promise<Question[]> {
  return apiRequest<Question[]>('/ai/generate-questions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function evaluateAnswerWithAi(input: EvaluateAnswerInput): Promise<Feedback> {
  return apiRequest<Feedback>('/ai/evaluate-answer', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function chatWithAi(input: ChatInput): Promise<ChatResponse> {
  return apiRequest<ChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
