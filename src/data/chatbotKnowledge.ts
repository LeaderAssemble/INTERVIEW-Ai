export interface KnowledgeEntry {
  keywords: string[];
  question: string;
  answer: string;
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    keywords: ['what', 'is', 'about', 'platform', 'app', 'interviewai'],
    question: 'What is InterviewAI?',
    answer: 'InterviewAI is a mock interview practice platform. You can practice HR, Technical, and Behavioral questions by voice or text. Feedback is currently rule-based and estimates clarity, relevance, completeness, and confidence from transcript patterns; it is not an AI or vocal-tone assessment.',
  },
  {
    keywords: ['start', 'begin', 'how', 'practice', 'interview'],
    question: 'How do I start a practice interview?',
    answer: 'From the Dashboard, open Practice, choose HR, Technical, or Behavioral, optionally add a target role and experience level, choose the question count, then click Start Interview. You can also choose a speech recognition language on the setup screen.',
  },
  {
    keywords: ['category', 'type', 'hr', 'technical', 'behavioral', 'difference'],
    question: 'What are the interview categories?',
    answer: 'There are three categories: HR interviews focus on questions about yourself, your experience, and career goals. Technical interviews cover system design, coding concepts, and technical problem-solving. Behavioral interviews use the STAR method to assess how you handle past experiences and challenges.',
  },
  {
    keywords: ['voice', 'mic', 'microphone', 'speak', 'talk', 'speech'],
    question: 'How does voice input work?',
    answer: 'Choose English (US), English (India), or Hindi on the practice setup screen. Click the microphone to speak, then review and edit the transcript before submitting. Browser speech recognition may send audio to the browser speech provider; this app stores answer transcripts with your sessions, not raw audio. You can switch to text mode at any time.',
  },
  {
    keywords: ['text', 'type', 'keyboard', 'write', 'typing'],
    question: 'Can I type my answers instead of speaking?',
    answer: 'Yes! On the interview screen, click the Type button to switch to text mode. You will see a text box where you can type your answer, then click Submit Answer. You can switch between voice and text at any time.',
  },
  {
    keywords: ['feedback', 'score', 'rating', 'result', 'review'],
    question: 'How does the feedback work?',
    answer: 'By default, feedback uses transcript-based rules to estimate clarity, relevance, completeness, and confidence. Signed-in users can opt into Gemini AI questions and answer evaluation before starting an interview. Gemini evaluates the transcript only—not vocal tone or delivery—and scores are practice estimates rather than an objective assessment. Demo sessions use rule-based feedback.',
  },
  {
    keywords: ['dashboard', 'stats', 'statistics', 'performance', 'chart', 'trend'],
    question: 'What does the Dashboard show?',
    answer: 'The Dashboard shows your total sessions, average score, average duration, and improvement rate. It also has charts showing your performance trend over your last 7 sessions, a radar chart comparing your scores across categories, and a breakdown of sessions by category. Recent sessions are listed at the bottom.',
  },
  {
    keywords: ['history', 'past', 'previous', 'session', 'record', 'sessions'],
    question: 'How do I see my past sessions?',
    answer: 'Click History in the top navigation bar to see past sessions and expand them for detailed scores. Signed-in sessions are saved to your account; demo sessions stay in this browser. You can download a report or delete sessions from History.',
  },
  {
    keywords: ['download', 'report', 'pdf', 'export'],
    question: 'How do I download a report?',
    answer: 'You can download a PDF report from the session completion screen or by expanding a session in History. The report includes your scores, answers, and rule-based feedback.',
  },
  {
    keywords: ['sign', 'login', 'account', 'register', 'sign up', 'sign in', 'password'],
    question: 'How do I create an account or sign in?',
    answer: 'On the login screen, choose Sign Up or Sign In. Use Forgot password? to request a reset email. You can also try a demo without signing in; demo sessions are stored only in this browser and are separate from account history.',
  },
  {
    keywords: ['skip', 'pass', 'next question'],
    question: 'Can I skip a question?',
    answer: 'Yes! During an interview, there is a Skip button below the question. Clicking it moves you to the next question without submitting an answer. If you are on the last question, skipping ends the session.',
  },
  {
    keywords: ['exit', 'quit', 'leave', 'stop', 'cancel'],
    question: 'How do I exit an interview early?',
    answer: 'Click the Exit button in the top-left corner of the interview screen. This will save your progress if you have answered at least one question and take you back to the Dashboard.',
  },
  {
    keywords: ['question', 'how many', 'number', 'count'],
    question: 'How many questions are in each session?',
    answer: 'You can choose between 3 and 8 questions per session using the slider on the interview setup screen. 3 questions is a quick practice, while 8 gives you a more extended session.',
  },
  {
    keywords: ['theme', 'dark', 'light', 'mode', 'color'],
    question: 'How do I change the theme?',
    answer: 'Click the sun or moon icon in the top-right corner of the page to toggle between dark and light themes. Your preference is remembered for future visits.',
  },
  {
    keywords: ['improve', 'better', 'tips', 'advice', 'how to get better'],
    question: 'How can I improve my interview scores?',
    answer: 'Practice across categories and use the Dashboard’s Next practice focus card to choose a skill to work on. Feedback is rule-based, so use it as a rough guide. For behavioral questions, use Situation, Task, Action, Result (STAR); the session can add one follow-up about a STAR detail not detected in your answer.',
  },
  {
    keywords: ['star', 'method', 'format', 'structure'],
    question: 'What is the STAR method?',
    answer: 'STAR stands for Situation, Task, Action, Result. It is a structured way to answer behavioral interview questions. Describe the Situation you were in, the Task you needed to do, the Action you took, and the Result of your action. This helps you give complete, well-organized answers.',
  },
  {
    keywords: ['streak', 'daily', 'consecutive', 'fire', 'flame', 'days', 'milestone'],
    question: 'How does the daily streak work?',
    answer: 'Your daily streak counts how many consecutive days you have completed at least one interview. When you finish a practice session, your streak increases by one. If you skip a day, the streak resets to zero. The streak card on your Dashboard shows your current streak, your best streak ever, and your total practice days. Practice every day to reach milestones like 7, 14, 30, and 100 days!',
  },
];

export function findAnswer(userInput: string): string | null {
  const input = userInput.toLowerCase().trim();
  if (!input) return null;

  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (input.includes(keyword)) {
        score += keyword.length > 3 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }

  return null;
}

export const defaultResponse = "I'm not sure about that, but I can help with: starting an interview, using voice or text input, understanding your feedback scores, viewing your history, downloading reports, managing your account, changing the theme, or tips to improve. Try asking about any of these!";
