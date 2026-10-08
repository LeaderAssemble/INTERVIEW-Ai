import { Question, InterviewCategory, QuestionDifficulty } from '../types';

export const questions: Record<InterviewCategory, Question[]> = {
  hr: [
    {
      id: 'hr-1',
      category: 'hr',
      text: 'Tell me about yourself and what makes you a great fit for this role.',
      difficulty: 'easy',
      keywords: ['experience', 'skills', 'achievements', 'relevant', 'passion'],
      idealAnswerPoints: [
        'Start with a brief professional summary',
        'Highlight relevant experience and achievements',
        'Connect your skills to the job requirements',
        'Show enthusiasm for the role and company',
        'Keep it concise (1-2 minutes)',
      ],
      tips: [
        'Tailor your response to the specific role',
        'Use the present-past-future structure',
        'Include quantifiable achievements when possible',
        'Practice but avoid sounding scripted',
      ],
    },
    {
      id: 'hr-2',
      category: 'hr',
      text: 'What are your greatest strengths and how have they helped you in your career?',
      difficulty: 'easy',
      keywords: ['strengths', 'examples', 'impact', 'growth', 'success'],
      idealAnswerPoints: [
        'Identify 2-3 key strengths relevant to the role',
        'Provide specific examples of using these strengths',
        'Explain the positive impact or results',
        'Show self-awareness and authenticity',
      ],
      tips: [
        'Choose strengths that align with job requirements',
        'Use the STAR method for your examples',
        'Be genuine but strategic in your selection',
      ],
    },
    {
      id: 'hr-3',
      category: 'hr',
      text: 'Why are you leaving your current position?',
      difficulty: 'medium',
      keywords: ['growth', 'opportunity', 'career', 'goals', 'challenge'],
      idealAnswerPoints: [
        'Focus on positive reasons for moving forward',
        'Emphasize growth and new opportunities',
        'Avoid negative comments about current employer',
        'Connect to long-term career goals',
      ],
      tips: [
        'Keep the tone positive and professional',
        'Focus on what attracts you to the new role',
        'Brief and honest is best',
      ],
    },
    {
      id: 'hr-4',
      category: 'hr',
      text: 'Where do you see yourself in 5 years?',
      difficulty: 'medium',
      keywords: ['growth', 'goals', 'development', 'leadership', 'impact'],
      idealAnswerPoints: [
        'Show ambition with realistic expectations',
        'Align your goals with company growth',
        'Express desire for skill development',
        'Mention interest in leadership or expertise roles',
      ],
      tips: [
        'Research typical career paths at the company',
        'Balance ambition with commitment to the role',
        'Focus on contributions, not just titles',
      ],
    },
    {
      id: 'hr-5',
      category: 'hr',
      text: 'What is your expected salary range for this position?',
      difficulty: 'hard',
      keywords: ['market', 'research', 'flexible', 'negotiable', 'range'],
      idealAnswerPoints: [
        'Show research into market rates',
        'Provide a reasonable range',
        'Express flexibility and openness',
        'Consider total compensation package',
      ],
      tips: [
        'Research industry standards beforehand',
        'Consider benefits, equity, and growth',
        'Avoid giving a single number if possible',
      ],
    },
    {
      id: 'hr-6',
      category: 'hr',
      text: 'How do you handle conflicts with coworkers or supervisors?',
      difficulty: 'medium',
      keywords: ['communication', 'resolution', 'professional', 'compromise', 'understanding'],
      idealAnswerPoints: [
        'Emphasize direct communication',
        'Show empathy and active listening',
        'Focus on understanding different perspectives',
        'Aim for win-win solutions',
      ],
      tips: [
        'Use a specific example if possible',
        'Never blame others in your answer',
        'Show you value relationships over being right',
      ],
    },
    {
      id: 'hr-7',
      category: 'hr',
      text: 'What motivates you in your work, and what demotivates you?',
      difficulty: 'medium',
      keywords: ['motivation', 'purpose', 'achievement', 'impact', 'growth'],
      idealAnswerPoints: [
        'Identify intrinsic motivators (learning, impact)',
        'Connect to the role and company mission',
        'Be honest but professional about demotivators',
        'Show self-awareness',
      ],
      tips: [
        'Tailor motivators to the company culture',
        'Frame demotivators constructively',
        'Show how you overcome demotivation',
      ],
    },
    {
      id: 'hr-8',
      category: 'hr',
      text: 'Describe your ideal work environment and management style.',
      difficulty: 'medium',
      keywords: ['environment', 'collaboration', 'autonomy', 'communication', 'support'],
      idealAnswerPoints: [
        'Describe preferences positively',
        'Show adaptability to different styles',
        'Connect to company culture',
        'Balance independence and collaboration',
      ],
      tips: [
        'Research the company culture beforehand',
        'Be honest but show flexibility',
        'Focus on productivity, not just comfort',
      ],
    },
  ],
  technical: [
    {
      id: 'tech-1',
      category: 'technical',
      text: 'Explain the difference between REST and GraphQL APIs. When would you choose one over the other?',
      difficulty: 'medium',
      keywords: ['REST', 'GraphQL', 'endpoints', 'query', 'flexibility', 'performance'],
      idealAnswerPoints: [
        'Explain REST architecture and resources',
        'Describe GraphQL schema and query flexibility',
        'Discuss when REST is preferable (caching, simplicity)',
        'Discuss when GraphQL is preferable (complex data needs)',
      ],
      tips: [
        'Use concrete examples from your experience',
        'Consider performance implications',
        'Mention real-world trade-offs',
      ],
    },
    {
      id: 'tech-2',
      category: 'technical',
      text: 'How would you design a scalable architecture for a real-time chat application?',
      difficulty: 'hard',
      keywords: ['WebSocket', 'scaling', 'database', 'cache', 'load balancing', 'microservices'],
      idealAnswerPoints: [
        'Discuss WebSocket or real-time protocols',
        'Address horizontal scaling strategies',
        'Consider database choices (NoSQL vs SQL)',
        'Implement caching and message queuing',
      ],
      tips: [
        'Think about both front and back end',
        'Consider edge cases and offline handling',
        'Discuss security and authentication',
      ],
    },
    {
      id: 'tech-3',
      category: 'technical',
      text: 'Explain how garbage collection works in modern programming languages.',
      difficulty: 'medium',
      keywords: ['memory', 'garbage collection', 'heap', 'allocation', 'reference', 'optimization'],
      idealAnswerPoints: [
        'Explain memory allocation basics',
        'Describe reference counting or tracing',
        'Discuss generational collection',
        'Mention performance implications',
      ],
      tips: [
        'Use specific language examples if possible',
        'Discuss memory leaks and prevention',
        'Connect to practical coding decisions',
      ],
    },
    {
      id: 'tech-4',
      category: 'technical',
      text: 'What strategies would you use to optimize a slow-loading web application?',
      difficulty: 'medium',
      keywords: ['performance', 'caching', 'lazy loading', 'bundling', 'CDN', 'optimization'],
      idealAnswerPoints: [
        'Code splitting and lazy loading',
        'Asset optimization and CDN usage',
        'Server-side rendering considerations',
        'Caching strategies',
      ],
      tips: [
        'Discuss profiling and measurement tools',
        'Balance initial load vs runtime performance',
        'Consider both network and compute bottlenecks',
      ],
    },
    {
      id: 'tech-5',
      category: 'technical',
      text: 'Describe your process for debugging a production issue. Walk through a specific example.',
      difficulty: 'medium',
      keywords: ['logging', 'monitoring', 'reproduction', 'analysis', 'root cause', 'resolution'],
      idealAnswerPoints: [
        'Systematic approach to isolating the issue',
        'Use of monitoring and logging tools',
        'Steps to reproduce in staging',
        'Root cause analysis and fix verification',
      ],
      tips: [
        'Emphasize communication with stakeholders',
        'Show calm under pressure',
        'Discuss post-incident review process',
      ],
    },
    {
      id: 'tech-6',
      category: 'technical',
      text: 'Explain database indexing. How do you decide what indexes to create?',
      difficulty: 'hard',
      keywords: ['index', 'query', 'performance', 'B-tree', 'optimization', 'trade-offs'],
      idealAnswerPoints: [
        'Explain how indexes accelerate queries',
        'Discuss different index types',
        'Mention query plan analysis',
        'Address write vs read trade-offs',
      ],
      tips: [
        'Give real examples from your experience',
        'Discuss monitoring index usage',
        'Mention maintenance considerations',
      ],
    },
    {
      id: 'tech-7',
      category: 'technical',
      text: 'How would you implement authentication and authorization in a microservices architecture?',
      difficulty: 'hard',
      keywords: ['JWT', 'OAuth', 'authentication', 'authorization', 'security', 'tokens'],
      idealAnswerPoints: [
        'Discuss central auth service pattern',
        'Explain token-based authentication (JWT)',
        'Address service-to-service auth',
        'Cover refresh token strategies',
      ],
      tips: [
        'Consider security best practices',
        'Discuss token revocation challenges',
        'Address compliance requirements if relevant',
      ],
    },
    {
      id: 'tech-8',
      category: 'technical',
      text: 'What is your approach to writing testable code? How do you balance speed and coverage?',
      difficulty: 'medium',
      keywords: ['testing', 'unit tests', 'integration', 'coverage', 'TDD', 'quality'],
      idealAnswerPoints: [
        'Emphasize dependency injection',
        'Discuss unit vs integration testing balance',
        'Address mocking strategies',
        'Consider code design for testability',
      ],
      tips: [
        'Share specific testing patterns you use',
        'Discuss the ROI of different test types',
        'Address CI/CD integration',
      ],
    },
  ],
  behavioral: [
    {
      id: 'beh-1',
      category: 'behavioral',
      text: 'Tell me about a time you had to adapt quickly to a major change at work. How did you handle it?',
      difficulty: 'medium',
      keywords: ['adaptability', 'change', 'flexibility', 'learning', 'positive', 'outcome'],
      idealAnswerPoints: [
        'Describe the change and its impact',
        'Explain your initial reaction',
        'Detail steps taken to adapt',
        'Share positive outcomes',
      ],
      tips: [
        'Show positive attitude toward change',
        'Emphasize quick learning and flexibility',
        'Include measurable results if possible',
      ],
    },
    {
      id: 'beh-2',
      category: 'behavioral',
      text: 'Describe a situation where you had to work with a difficult team member. How did you handle it?',
      difficulty: 'medium',
      keywords: ['teamwork', 'communication', 'conflict', 'resolution', 'empathy', 'professional'],
      idealAnswerPoints: [
        'Describe the situation objectively',
        'Show empathy and understanding',
        'Explain communication approach',
        'Share positive resolution',
      ],
      tips: [
        'Never badmouth the difficult person',
        'Focus on your actions, not their behavior',
        'Show professional maturity',
      ],
    },
    {
      id: 'beh-3',
      category: 'behavioral',
      text: 'Give me an example of a project where you took initiative beyond your assigned responsibilities.',
      difficulty: 'easy',
      keywords: ['initiative', 'leadership', 'proactive', 'impact', 'ownership', 'success'],
      idealAnswerPoints: [
        'Describe what you identified as needed',
        'Explain why you took initiative',
        'Detail the extra work you did',
        'Share positive impact and results',
      ],
      tips: [
        'Show proactive problem-solving',
        'Demonstrate ownership mentality',
        'Quantify the impact if possible',
      ],
    },
    {
      id: 'beh-4',
      category: 'behavioral',
      text: 'Tell me about a time you failed at something. What did you learn from it?',
      difficulty: 'hard',
      keywords: ['failure', 'learning', 'growth', 'reflection', 'resilience', 'improvement'],
      idealAnswerPoints: [
        'Choose a genuine failure (not a hidden success)',
        'Take responsibility for your role',
        'Share what you learned',
        'Explain how you applied the lesson',
      ],
      tips: [
        'Be honest and vulnerable',
        'Focus on growth, not the failure',
        'Show you can accept feedback',
      ],
    },
    {
      id: 'beh-5',
      category: 'behavioral',
      text: 'Describe a time when you had to prioritize multiple competing deadlines. How did you decide what to focus on?',
      difficulty: 'medium',
      keywords: ['prioritization', 'time management', 'deadline', 'communication', 'decision', 'impact'],
      idealAnswerPoints: [
        'Describe the competing priorities',
        'Explain your prioritization framework',
        'Discuss stakeholder communication',
        'Share the outcome',
      ],
      tips: [
        'Show structured thinking',
        'Demonstrate communication skills',
        'Highlight successful delivery',
      ],
    },
    {
      id: 'beh-6',
      category: 'behavioral',
      text: 'Tell me about a time you had to persuade someone to see your point of view.',
      difficulty: 'medium',
      keywords: ['persuasion', 'influence', 'communication', 'evidence', 'compromise', 'success'],
      idealAnswerPoints: [
        'Describe the disagreement',
        'Explain your approach to persuasion',
        'Show use of data or evidence',
        'Share the outcome',
      ],
      tips: [
        'Focus on understanding their perspective',
        'Use collaborative rather than confrontational approach',
        'Show flexibility when needed',
      ],
    },
    {
      id: 'beh-7',
      category: 'behavioral',
      text: 'Give me an example of when you went above and beyond for a customer or client.',
      difficulty: 'easy',
      keywords: ['customer service', 'extra', 'satisfaction', 'problem solving', 'impact', 'dedication'],
      idealAnswerPoints: [
        'Describe the customer need',
        'Explain what extra you did',
        'Show customer focus mindset',
        'Share positive outcome',
      ],
      tips: [
        'Demonstrate genuine care for customers',
        'Show creative problem-solving',
        'Include any recognition received',
      ],
    },
    {
      id: 'beh-8',
      category: 'behavioral',
      text: 'Describe a situation where you had to learn a new skill quickly to complete a project.',
      difficulty: 'medium',
      keywords: ['learning', 'adaptability', 'challenge', 'success', 'growth', 'skill'],
      idealAnswerPoints: [
        'Describe the skill needed',
        'Explain your learning approach',
        'Share how you applied it',
        'Discuss successful completion',
      ],
      tips: [
        'Show growth mindset',
        'Demonstrate efficient learning strategies',
        'Connect to ongoing use of the skill',
      ],
    },
  ],
};

export function getRandomQuestions(
  category: InterviewCategory,
  count: number = 5
): Question[] {
  const categoryQuestions = [...questions[category]];
  const shuffled = categoryQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getDifficultyColor(difficulty: QuestionDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'error';
    default:
      return 'primary';
  }
}
