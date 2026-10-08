import { Feedback, Question } from '../types';

const fillerPhrases = ['you know', 'i mean', 'um', 'uh', 'basically', 'actually', 'literally'];
const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'i', 'in',
  'into', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was',
  'were', 'with',
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+(?:'[a-z0-9]+)*/g) ?? [];
}

function containsPhrase(words: string[], phrase: string): boolean {
  const phraseWords = tokenize(phrase);
  if (phraseWords.length === 0) return false;

  return words.some((_, start) =>
    phraseWords.every((word, offset) => words[start + offset] === word)
  );
}

export function generateFeedback(transcript: string, question: Question): Feedback {
  const words = tokenize(transcript);

  const clarity = calculateClarity(transcript, words);
  const relevance = calculateRelevance(words, question.keywords);
  const completeness = calculateCompleteness(words, question.idealAnswerPoints);
  const confidence = calculateConfidence(transcript, words);

  const keywords_used = question.keywords.filter(kw => containsPhrase(words, kw));
  const missed_keywords = question.keywords.filter(kw => !containsPhrase(words, kw));

  const strengths = identifyStrengths(transcript, { clarity, relevance, completeness, confidence });
  const improvements = identifyImprovements(transcript, { clarity, relevance, completeness, confidence }, missed_keywords);
  const missingStarElements = question.category === 'behavioral'
    ? getMissingStarElements(transcript)
    : [];

  if (question.category === 'behavioral') {
    if (missingStarElements.length === 0) {
      strengths.push('Covers the STAR structure: situation, task, action, and result');
    } else {
      improvements.push(`Add more STAR detail about: ${missingStarElements.join(', ')}`);
    }
  }

  const overallScore = Math.round((clarity + relevance + completeness + confidence) / 4);

  return {
    overallScore,
    clarity,
    relevance,
    completeness,
    confidence,
    feedbackMethod: 'Rule-based transcript analysis',
    strengths,
    improvements,
    keywords_used,
    missed_keywords,
    scoreExplanations: {
      clarity: `${countFillerWords(words)} filler words detected across ${words.length} words.`,
      relevance: question.keywords.length
        ? `${keywords_used.length} of ${question.keywords.length} expected keywords or phrases matched.`
        : 'No keyword rubric is configured for this question.',
      completeness: question.idealAnswerPoints.length
        ? `${countMatchedIdealPoints(words, question.idealAnswerPoints)} of ${question.idealAnswerPoints.length} answer points matched.`
        : 'No answer-point rubric is configured for this question.',
      confidence: 'Estimated from hesitation markers and assertive phrasing only; vocal tone, speech sentiment, and live AI scoring are not assessed.',
    },
  };
}

export function getMissingStarElements(transcript: string): string[] {
  const words = tokenize(transcript);
  const hasAnyPhrase = (phrases: string[]) => phrases.some(phrase => containsPhrase(words, phrase));
  const missing: string[] = [];

  if (!hasAnyPhrase(['when', 'during', 'while', 'at the time'])) missing.push('the situation');
  if (!hasAnyPhrase(['responsible for', 'my task', 'my role', 'our goal', 'needed to'])) missing.push('your task');
  if (!hasAnyPhrase(['i led', 'i created', 'i implemented', 'i organized', 'i analyzed', 'i built', 'i developed', 'i coordinated'])) missing.push('your specific actions');
  if (!hasAnyPhrase(['as a result', 'the result', 'increased', 'reduced', 'improved', 'achieved', 'saved', 'delivered', 'percent'])) missing.push('the result or impact');

  return missing;
}

function countFillerWords(words: string[]): number {
  const fillerTokenLists = fillerPhrases.map(tokenize);
  let count = 0;
  for (let index = 0; index < words.length;) {
    const matchedFiller = fillerTokenLists.find(phrase =>
      phrase.every((word, offset) => words[index + offset] === word)
    );
    if (matchedFiller) {
      count += matchedFiller.length;
      index += matchedFiller.length;
    } else {
      index++;
    }
  }
  return count;
}

function countMatchedIdealPoints(words: string[], idealPoints: string[]): number {
  const answerWords = new Set(words);
  return idealPoints.filter(point => {
    const pointWords = tokenize(point).filter(word => word.length > 2 && !stopWords.has(word));
    if (pointWords.length === 0) return false;
    const matchedWords = pointWords.filter(word => answerWords.has(word)).length;
    return matchedWords >= Math.max(1, Math.ceil(pointWords.length / 2));
  }).length;
}

function calculateClarity(transcript: string, words: string[]): number {
  if (words.length === 0) return 20;

  let score = 75;
  const fillerCount = countFillerWords(words);

  const fillerRatio = fillerCount / words.length;
  if (fillerRatio < 0.02) score += 10;
  else if (fillerRatio < 0.05) score += 5;
  else if (fillerRatio > 0.1) score -= 15;
  else if (fillerRatio > 0.08) score -= 8;

  const sentenceCount = (transcript.match(/[.!?]+/g) || []).length || 1;
  const avgSentenceLength = words.length / sentenceCount;
  if (avgSentenceLength > 35) score -= 10;

  return Math.max(20, Math.min(100, score));
}

function calculateRelevance(words: string[], keywords: string[]): number {
  if (keywords.length === 0) return 70;

  const matchedKeywords = keywords.filter(kw => containsPhrase(words, kw));
  const ratio = matchedKeywords.length / keywords.length;
  return Math.round(40 + ratio * 55);
}

function calculateCompleteness(words: string[], idealPoints: string[]): number {
  const pointWords = idealPoints
    .map(point => tokenize(point).filter(word => word.length > 2 && !stopWords.has(word)))
    .filter(point => point.length > 0);
  if (pointWords.length === 0) return 70;

  const matchedPoints = countMatchedIdealPoints(words, idealPoints);
  return Math.round(40 + (matchedPoints / pointWords.length) * 55);
}

function calculateConfidence(transcript: string, words: string[]): number {
  if (words.length === 0) return 30;
  let score = 60;

  const hesitations = (transcript.match(/\.\.\.|—/g) || []).length;
  if (hesitations < 3) score += 10;
  else if (hesitations > 5) score -= 10;

  const confidentPhrases = ['i believe', 'in my experience', 'i have', 'i achieved', 'i led', 'i managed', 'i developed'];
  const confidentCount = confidentPhrases.reduce((acc, phrase) =>
    acc + (containsPhrase(words, phrase) ? 1 : 0), 0
  );
  score += Math.min(confidentCount * 5, 20);

  return Math.max(20, Math.min(100, score));
}

function identifyStrengths(
  transcript: string,
  scores: { clarity: number; relevance: number; completeness: number; confidence: number }
): string[] {
  const strengths: string[] = [];

  if (scores.clarity >= 80) {
    strengths.push('Few filler words detected');
  }
  if (scores.relevance >= 85) {
    strengths.push('Strong alignment with key concepts');
  }
  if (scores.completeness >= 85) {
    strengths.push('Comprehensive response covering main points');
  }
  if (scores.confidence >= 80) {
    strengths.push('Uses assertive first-person language');
  }

  const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 80 && wordCount <= 200) {
    strengths.push('Appropriate response length');
  }

  return strengths.length > 0 ? strengths : ['Good effort in addressing the question'];
}

function identifyImprovements(
  transcript: string,
  scores: { clarity: number; relevance: number; completeness: number; confidence: number },
  missedKeywords: string[]
): string[] {
  const improvements: string[] = [];

  if (scores.clarity < 65) {
    improvements.push('Reduce filler words for clearer delivery');
  }

  if (scores.relevance < 70) {
    improvements.push('Focus more directly on the question asked');
  }

  if (scores.completeness < 70) {
    improvements.push('Provide more detailed examples and context');
  }

  if (scores.confidence < 65) {
    improvements.push('Try ownership-focused language such as "I led" or "I achieved"');
  }

  if (missedKeywords.length > 2) {
    improvements.push(`Consider incorporating: ${missedKeywords.slice(0, 3).join(', ')}`);
  }

  const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 30) {
    improvements.push('Expand your answer with more details');
  } else if (wordCount > 300) {
    improvements.push('Consider being more concise');
  }

  return improvements.length > 0 ? improvements : ['Keep practicing to maintain consistency'];
}

export function calculateOverallScore(feedbacks: Feedback[]): number {
  if (feedbacks.length === 0) return 0;

  const avgScore = feedbacks.reduce((acc, f) => acc + f.overallScore, 0) / feedbacks.length;
  return Math.round(avgScore);
}

export function getScoreCategory(score: number): 'excellent' | 'good' | 'fair' | 'needs_improvement' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  return 'needs_improvement';
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 55) return 'warning';
  return 'error';
}
