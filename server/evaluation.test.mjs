import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEvaluationPrompt,
  calculateWeightedScore,
  evaluateAnswer,
} from './evaluation.mjs';

const technicalQuestion = {
  id: 'tech-1',
  category: 'technical',
  text: 'What is inheritance in object-oriented programming?',
  idealAnswerPoints: ['A class can derive from another class and reuse or extend its behavior.'],
  keywords: ['class', 'inheritance', 'reuse'],
};

function validEvaluation(overrides = {}) {
  return {
    relevant: true,
    relevance_score: 8,
    clarity_score: 7,
    completeness_score: 6,
    communication_score: 8,
    total_score: 7.25,
    feedback: 'Good conceptual explanation.',
    strengths: ['Explains the relationship between classes.'],
    improvements: ['Add a practical example.'],
    ...overrides,
  };
}

function stubGenerate(value) {
  return async () => value;
}

test('correct detailed answer gets high semantic scores and a deterministic weighted total', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'Inheritance lets a child class acquire behavior from a parent class and extend it. For example, a SavingsAccount can reuse Account operations and add interest calculation.',
    generate: stubGenerate(validEvaluation({
      relevance_score: 9.5,
      clarity_score: 9,
      completeness_score: 9,
      communication_score: 9,
      total_score: 1,
    })),
  });

  assert.equal(evaluation.evaluation_status, 'evaluated');
  assert.equal(evaluation.total_score, 9.15);
  assert.equal(evaluation.relevant, true);
});

test('short but conceptually correct answer is not automatically zeroed', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'A child class reuses and extends a parent class.',
    generate: stubGenerate(validEvaluation({
      relevance_score: 9,
      clarity_score: 9,
      completeness_score: 5,
      communication_score: 8,
      total_score: 7.8,
    })),
  });

  assert.equal(evaluation.total_score, 7.8);
  assert.ok(evaluation.relevance_score >= 8);
});

test('partially correct answer receives weighted partial credit', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'A subclass gets some behavior from another class.',
    generate: stubGenerate(validEvaluation({
      relevance_score: 5,
      clarity_score: 7,
      completeness_score: 4,
      communication_score: 6,
      total_score: 5.45,
    })),
  });

  assert.equal(evaluation.total_score, 5.45);
});

test('incorrect but related answer receives low partial credit rather than false perfection', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'Inheritance means a class stores its information in a database.',
    generate: stubGenerate(validEvaluation({
      relevance_score: 2,
      clarity_score: 5,
      completeness_score: 1,
      communication_score: 6,
      total_score: 3.3,
    })),
  });

  assert.equal(evaluation.relevant, true);
  assert.equal(evaluation.total_score, 3.3);
});

test('completely unrelated answer scores zero even if the model returns inflated scores', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'I like playing cricket on weekends.',
    generate: stubGenerate(validEvaluation({
      relevant: false,
      relevance_score: 0,
      clarity_score: 10,
      completeness_score: 10,
      communication_score: 10,
      total_score: 8,
    })),
  });

  assert.equal(evaluation.total_score, 0);
  assert.equal(evaluation.clarity_score, 0);
});

test('empty answer returns explicit zero feedback without making a Gemini request', async () => {
  let called = false;
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: '   ',
    generate: async () => { called = true; },
  });

  assert.equal(called, false);
  assert.equal(evaluation.evaluation_status, 'empty');
  assert.equal(evaluation.total_score, 0);
  assert.match(evaluation.feedback, /No answer was provided/);
});

test('grammatically poor but understandable answer can retain semantic credit', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'Child class take methods parent and can add own things.',
    generate: stubGenerate(validEvaluation({
      relevance_score: 8,
      clarity_score: 5,
      completeness_score: 6,
      communication_score: 6,
      total_score: 6.35,
    })),
  });

  assert.equal(evaluation.relevant, true);
  assert.ok(evaluation.relevance_score > evaluation.clarity_score);
  assert.equal(evaluation.total_score, 6.35);
});

test('keyword-stuffed irrelevant answer cannot earn marks', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'Inheritance class reuse class inheritance. Cricket class inheritance reuse.',
    generate: stubGenerate(validEvaluation({
      relevant: false,
      relevance_score: 0,
      clarity_score: 9,
      completeness_score: 9,
      communication_score: 9,
      total_score: 7,
    })),
  });

  assert.equal(evaluation.total_score, 0);
  assert.equal(evaluation.relevant, false);
});

test('missing reference answer is allowed and explicitly handled in the evaluator prompt', () => {
  const prompt = buildEvaluationPrompt({
    question: { category: 'technical', text: 'Explain a stack.' },
    answer: 'A stack is last in, first out.',
  });

  assert.match(prompt, /No reference answer was supplied/);
  assert.match(prompt, /semantic meaning and conceptual correctness/);
});

test('missing question is a client validation error and does not invoke Gemini', async () => {
  let called = false;
  await assert.rejects(
    evaluateAnswer({
      question: null,
      answer: 'Some answer',
      generate: async () => { called = true; },
    }),
    error => error.status === 400,
  );
  assert.equal(called, false);
});

test('invalid Gemini response produces safe fallback feedback instead of throwing', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'A child class can extend a parent class.',
    generate: stubGenerate({ relevant: true, relevance_score: 12 }),
  });

  assert.equal(evaluation.evaluation_status, 'invalid_response');
  assert.equal(evaluation.total_score, 0);
  assert.match(evaluation.feedback, /unreadable format/);
});

test('Gemini timeout produces explicit fallback feedback instead of throwing', async () => {
  const evaluation = await evaluateAnswer({
    question: technicalQuestion,
    answer: 'A child class can extend a parent class.',
    generate: async () => {
      const error = new Error('request timed out');
      error.name = 'TimeoutError';
      throw error;
    },
  });

  assert.equal(evaluation.evaluation_status, 'timeout');
  assert.match(evaluation.feedback, /timed out/);
});

test('weighted score uses the configured category weights', () => {
  assert.equal(calculateWeightedScore({
    relevance_score: 8,
    clarity_score: 7,
    completeness_score: 6,
    communication_score: 8,
  }), 7.25);
});

test('missing question data in prompt generation falls back safely instead of crashing', () => {
  const prompt = buildEvaluationPrompt({
    question: null,
    referenceAnswer: '  A class can inherit behavior from another class.  ',
    answer: 'It is about inheritance.',
  });

  assert.match(prompt, /The question category is general/);
  assert.match(prompt, /A class can inherit behavior from another class/);
});

test('weighted score gracefully ignores missing or invalid values', () => {
  assert.equal(calculateWeightedScore({}), 0);
  assert.equal(calculateWeightedScore({ relevance_score: undefined, clarity_score: null }), 0);
});
