import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, SkipForward, Play, Square, ChevronLeft,
  Clock, CheckCircle, AlertTriangle, Volume2, Download, Keyboard
} from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import { useStreak } from '../../contexts/StreakContext';
import { speechLanguages, useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { createId } from '../../lib/ids';
import { Feedback, InterviewCategory, InterviewStatus, View } from '../../types';
import { questions, getRandomQuestions, getDifficultyColor } from '../../data/questions';
import { FeedbackDisplay } from '../interview/FeedbackDisplay';
import { Waveform } from '../interview/Waveform';
import { generateSessionReport } from '../../utils/reportGenerator';
import { getMissingStarElements } from '../../utils/feedbackGenerator';
import { generateAiQuestions } from '../../services/interviewAi';
import { useAuth } from '../../contexts/AuthContext';

interface InterviewViewProps {
  onNavigate: (view: View) => void;
}

export function InterviewView({ onNavigate }: InterviewViewProps) {
  const {
    currentSession,
    startSession,
    submitAnswer,
    endSession,
    clearSession,
    addFollowUpQuestion,
  } = useSession();
  const { user, isDemo } = useAuth();
  const { recordPracticeDay } = useStreak();
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetTranscript,
    editTranscript,
    clearError,
  } = useSpeechRecognition();

  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<InterviewStatus>('idle');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('entry-level');
  const [useGeminiAi, setUseGeminiAi] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const followUpAddedRef = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (status === 'listening' || status === 'answering') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  useEffect(() => {
    if (transcript && isListening) {
      setStatus('answering');
    }
  }, [transcript, isListening]);

  // When speech recognition starts listening, clear any previous error
  useEffect(() => {
    if (speechError) {
      if (isListening) stopListening();
      setStatus('idle');
    }
  }, [speechError, isListening, stopListening]);

  useEffect(() => {
    if (inputMode === 'text' && textInput.trim() && status === 'idle') {
      setStatus('answering');
    } else if (inputMode === 'text' && !textInput.trim() && status === 'answering') {
      setStatus('idle');
    }
  }, [textInput, inputMode, status]);

  useEffect(() => {
    setUseGeminiAi(Boolean(user && !isDemo));
  }, [user, isDemo]);

  const handleStartSession = useCallback(async () => {
    if (!selectedCategory || isStartingSession) return;

    setAiError(null);
    setIsStartingSession(true);
    try {
      const selectedQuestions = useGeminiAi
        ? await generateAiQuestions({
            category: selectedCategory,
            count: questionCount,
            targetRole: targetRole.trim(),
            experienceLevel,
          })
        : getRandomQuestions(selectedCategory, questionCount).map(question => {
            const roleTerms = targetRole.toLowerCase().match(/[a-z0-9]+/g) ?? [];
            const roleKeywords = roleTerms.filter(term => term.length > 2).slice(0, 5);
            return {
              ...question,
              text: targetRole.trim()
                ? `${question.text} (Target context: ${experienceLevel} ${targetRole.trim()} role.)`
                : question.text,
              keywords: [...new Set([...question.keywords, ...roleKeywords])],
              idealAnswerPoints: targetRole.trim()
                ? [...question.idealAnswerPoints, `Connect your answer to the ${experienceLevel} ${targetRole.trim()} role`]
                : question.idealAnswerPoints,
              tips: question.category === 'behavioral'
                ? ['Structure your example with Situation, Task, Action, and Result (STAR).', ...question.tips]
                : question.tips,
            };
          });

      startSession(selectedCategory, selectedQuestions);
      setCurrentQuestionIndex(0);
      setTimeElapsed(0);
      setStatus('idle');
      resetTranscript();
      setTextInput('');
      setInputMode(isSupported ? 'voice' : 'text');
      followUpAddedRef.current = false;
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to start the interview. Please try again.');
    } finally {
      setIsStartingSession(false);
    }
  }, [selectedCategory, questionCount, startSession, resetTranscript, isSupported, targetRole, experienceLevel, useGeminiAi, isStartingSession]);

  const handleStartAnswering = useCallback(() => {
    if (inputMode === 'text') {
      setStatus('answering');
      return;
    }
    clearError();
    setStatus('listening');
    startListening();
  }, [startListening, inputMode, clearError]);



  const handleSubmitAnswer = useCallback(async () => {
    if (!currentSession || status === 'processing') return;

    const finalTranscript = inputMode === 'text' ? textInput.trim() : transcript.trim();
    if (!finalTranscript) return;

    if (inputMode === 'voice') stopListening();
    setAiError(null);
    setStatus('processing');

    const answer = {
      id: createId(),
      questionId: currentSession.questions[currentQuestionIndex].id,
      transcript: finalTranscript,
      duration: timeElapsed,
      timestamp: new Date(),
    };

    let feedback: Feedback;
    try {
      feedback = await submitAnswer(answer, useGeminiAi);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to evaluate your answer. Please try again.');
      setStatus('answering');
      return;
    }
    setCurrentFeedback(feedback);
    setShowFeedback(true);
    setStatus('completed');
    if (currentSession.category === 'behavioral' && !followUpAddedRef.current) {
      const missingElements = getMissingStarElements(finalTranscript);
      if (missingElements.length > 0) {
        const followUpText: Record<string, string> = {
          'the situation': 'What was the specific situation or challenge you were facing?',
          'your task': 'What was your specific responsibility or goal in that situation?',
          'your specific actions': 'What specific actions did you personally take?',
          'the result or impact': 'What was the outcome, and how did you measure your impact?',
        };
        addFollowUpQuestion({
          id: createId(),
          category: 'behavioral',
          text: followUpText[missingElements[0]],
          difficulty: 'medium',
          keywords: ['situation', 'task', 'action', 'result', 'impact'],
          idealAnswerPoints: ['Describe the missing STAR detail with a specific example'],
          tips: ['Keep the follow-up concise and tie it to your previous example.'],
        }, currentQuestionIndex);
        followUpAddedRef.current = true;
      }
    }
  }, [currentSession, transcript, textInput, inputMode, currentQuestionIndex, timeElapsed, stopListening, submitAnswer, addFollowUpQuestion, useGeminiAi, status]);

  const handleNextQuestion = useCallback(() => {
    if (!currentSession) return;

    setShowFeedback(false);
    setCurrentFeedback(null);
    resetTranscript();
    setTextInput('');
    setAiError(null);
    setTimeElapsed(0);

    if (currentQuestionIndex + 1 >= currentSession.questions.length) {
      endSession();
      recordPracticeDay();
      setStatus('completed');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setStatus('idle');
    }
  }, [currentSession, currentQuestionIndex, endSession, resetTranscript, recordPracticeDay]);

  const handleSkipQuestion = useCallback(() => {
    if (!currentSession) return;

    stopListening();
    resetTranscript();
    setTextInput('');
    setAiError(null);
    setTimeElapsed(0);

    if (currentQuestionIndex + 1 >= currentSession.questions.length) {
      endSession();
      recordPracticeDay();
      setStatus('completed');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setStatus('idle');
    }
  }, [currentSession, currentQuestionIndex, stopListening, resetTranscript, endSession, recordPracticeDay]);

  const handleGenerateReport = useCallback(async () => {
    if (!currentSession) return;

    setIsGeneratingPdf(true);
    try {
      await generateSessionReport(
        { ...currentSession, completedAt: new Date() },
        (percent) => console.log(`PDF generation: ${percent}%`)
      );
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [currentSession]);

  const handleExit = useCallback(() => {
    if (isListening) stopListening();
    if (currentSession && currentSession.answers.length > 0) {
      endSession();
      recordPracticeDay();
    }
    clearSession();
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setTimeElapsed(0);
    setStatus('idle');
    setShowFeedback(false);
    setCurrentFeedback(null);
    resetTranscript();
    setTextInput('');
    setAiError(null);
    followUpAddedRef.current = false;
    onNavigate('dashboard');
  }, [isListening, currentSession, stopListening, endSession, clearSession, resetTranscript, onNavigate, recordPracticeDay]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSession) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Start Your <span className="gradient-text">Practice Session</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-secondary-400 max-w-xl mx-auto"
          >
            Choose an interview category and number of questions. Practice with voice input
            and choose built-in or Gemini-powered question and feedback generation.
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card space-y-6"
        >
          <div>
            <label htmlFor="target-role" className="block text-sm font-medium text-secondary-300 mb-2">
              Target role (optional)
            </label>
            <input
              id="target-role"
              maxLength={80}
              value={targetRole}
              onChange={event => setTargetRole(event.target.value)}
              placeholder="e.g. Frontend Developer"
              className="input-field"
            />
            <label htmlFor="experience-level" className="block text-sm font-medium text-secondary-300 mt-4 mb-2">
              Experience level
            </label>
            <select
              id="experience-level"
              value={experienceLevel}
              onChange={event => setExperienceLevel(event.target.value)}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="entry-level">Entry level</option>
              <option value="mid-level">Mid level</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          {isSupported && (
            <div>
              <label htmlFor="speech-language" className="block text-sm font-medium text-secondary-300 mb-2">
                Voice recognition language
              </label>
              <select
                id="speech-language"
                value={language}
                onChange={event => setLanguage(event.target.value)}
                className="input-field"
              >
                {speechLanguages.map(option => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {aiError && currentSession && (
            <div role="alert" className="w-full max-w-2xl rounded-lg border border-error-500/30 bg-error-500/5 p-4 text-sm text-error-300">
              {aiError}
            </div>
          )}

          <div className="rounded-lg border border-secondary-700/60 bg-secondary-900/30 p-4 text-sm text-secondary-400">
            Privacy: browser voice recognition may send audio to your browser's speech provider.
            This app stores the answer transcript with your session, not raw audio. Signed-in
            sessions are saved to your account; demo sessions stay in this browser.
          </div>

          {user && !isDemo ? (
            <label className="flex items-start gap-3 rounded-lg border border-primary-500/30 bg-primary-500/5 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={useGeminiAi}
                onChange={event => setUseGeminiAi(event.target.checked)}
                className="mt-1 accent-primary-500"
              />
              <span>
                <span className="block text-sm font-medium text-secondary-200">
                  Use live Gemini questions and answer feedback
                </span>
                <span className="mt-1 block text-xs text-secondary-400">
                  On by default when signed in. Questions are tailored to your role and varied between sessions. Your answer transcript is sent securely to Gemini for feedback; voice audio is not sent.
                </span>
              </span>
            </label>
          ) : (
            <div className="rounded-lg border border-secondary-700/60 bg-secondary-900/30 p-4 text-sm text-secondary-400">
              Gemini AI is available to signed-in users. Demo sessions use the built-in questions and feedback.
            </div>
          )}

          {aiError && !currentSession && (
            <div role="alert" className="rounded-lg border border-error-500/30 bg-error-500/5 p-4 text-sm text-error-300">
              {aiError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-3">
              Interview Category
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {(['hr', 'technical', 'behavioral'] as InterviewCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-card p-4 text-left ${
                    selectedCategory === category ? 'category-card-selected' : ''
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {category === 'hr' ? '👥' : category === 'technical' ? '💻' : '🎯'}
                  </div>
                  <h3 className="font-semibold capitalize mb-1">{category}</h3>
                  <p className="text-sm text-secondary-400">
                    {questions[category].length} built-in questions
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-3">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min={3}
              max={8}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-sm text-secondary-400 mt-1">
              <span>3 (Quick)</span>
              <span>8 (Extended)</span>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleStartSession}
              disabled={!selectedCategory || isStartingSession}
              className={`btn-primary flex items-center gap-2 ${
                !selectedCategory || isStartingSession ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isStartingSession ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isStartingSession ? 'Generating Questions...' : 'Start Interview'}
            </button>
          </div>
        </motion.div>

        {!isSupported && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card border-warning-500/30 bg-warning-500/5"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-warning-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-warning-400 mb-1">Voice Input Not Available</h4>
                <p className="text-sm text-secondary-400">
                  {!window.isSecureContext
                    ? 'Microphone input requires an HTTPS connection on your phone. You can still type your answers; open the app through a trusted HTTPS address to use voice.'
                    : "Your browser doesn't support voice recognition, but you can still type your answers. For voice input, try Chrome, Edge, or Safari."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  const currentQuestion = currentSession.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentSession.questions.length) * 100;

  if (status === 'completed' && currentQuestionIndex >= currentSession.questions.length - 1 && !showFeedback) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        <div className="card space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          <div>
            <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
            <p className="text-secondary-400">Great job completing your practice session</p>
          </div>

          <div className="glass rounded-xl p-6 max-w-xs mx-auto">
            <div className="text-5xl font-bold gradient-text mb-2">
              {currentSession.overallScore}%
            </div>
            <p className="text-secondary-400">Overall Score</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-400">
                {currentSession.answers.length}
              </div>
              <p className="text-xs text-secondary-400">Questions</p>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-400">
                {formatTime(Math.floor((new Date().getTime() - currentSession.startedAt.getTime()) / 1000))}
              </div>
              <p className="text-xs text-secondary-400">Duration</p>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-2xl font-bold text-warning-400 capitalize">
                {currentSession.category}
              </div>
              <p className="text-xs text-secondary-400">Category</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingPdf}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {isGeneratingPdf ? 'Generating...' : 'Download Report'}
            </button>
            <button onClick={handleExit} className="btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={handleExit}
          className="btn-ghost flex items-center gap-2 text-secondary-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
          Exit
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-secondary-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
          <span className={`badge ${
            currentSession.category === 'hr' ? 'badge-primary' :
            currentSession.category === 'technical' ? 'badge-success' : 'badge-warning'
          }`}>
            {currentSession.category.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-secondary-400">
          <span>Question {currentQuestionIndex + 1} of {currentSession.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showFeedback && currentFeedback ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <FeedbackDisplay
              feedback={currentFeedback}
              questionText={currentQuestion?.text}
            />

            <div className="flex justify-center">
              <button onClick={handleNextQuestion} className="btn-primary flex items-center gap-2">
                {currentQuestionIndex + 1 >= currentSession.questions.length ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Finish Session
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="space-y-6"
          >
            <div className="question-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className={`badge badge-${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-medium leading-relaxed">
                {currentQuestion.text}
              </h2>
              {currentQuestion.tips.length > 0 && (
                <div className="mt-4 pt-4 border-t border-secondary-800">
                  <p className="text-xs text-secondary-500 mb-2">Tip:</p>
                  <p className="text-sm text-secondary-400">{currentQuestion.tips[0]}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  if (inputMode === 'voice') return;
                  setInputMode('voice');
                  setTextInput('');
                  setStatus('idle');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  inputMode === 'voice'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-secondary-400 hover:text-secondary-200 border border-transparent'
                }`}>
                <Mic className="w-4 h-4" />
                Voice
              </button>
              <button
                onClick={() => {
                  if (inputMode === 'text') return;
                  setInputMode('text');
                  if (isListening) stopListening();
                  setStatus('idle');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  inputMode === 'text'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-secondary-400 hover:text-secondary-200 border border-transparent'
                }`}>
                <Keyboard className="w-4 h-4" />
                Type
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 py-8">
              {inputMode === 'voice' && (status === 'idle' || status === 'listening' || status === 'answering') && (
                <>
                  <button
                    onClick={status === 'idle' ? handleStartAnswering : handleSubmitAnswer}
                    disabled={!isSupported}
                    className={`mic-button ${status === 'listening' || status === 'answering' ? 'mic-button-active' : ''} ${
                      !isSupported ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {status === 'listening' || status === 'answering' ? (
                      <Square className="w-8 h-8 text-white" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </button>

                  {status === 'listening' && !isListening && !speechError && (
                    <p className="text-sm text-secondary-400 flex items-center gap-2">
                      <span className="animate-spin rounded-full h-3 w-3 border border-primary-500 border-t-transparent" />
                      Requesting microphone access...
                    </p>
                  )}

                  {(status === 'listening' || status === 'answering') && isListening && (
                    <div className="text-center space-y-4">
                      <Waveform isActive={isListening} />
                      <p className="text-sm text-primary-400">Listening... Click to stop</p>
                    </div>
                  )}

                  {status === 'idle' && (
                    <p className="text-secondary-400">
                      Click the microphone to start answering
                    </p>
                  )}

                  {(transcript || interimTranscript) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full max-w-2xl"
                    >
                      <div className="glass rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Volume2 className="w-4 h-4 text-primary-400" />
                          <span className="text-sm font-medium text-secondary-300">Your Answer</span>
                        </div>
                        <label htmlFor="voice-transcript" className="sr-only">Edit recognized answer</label>
                        <textarea
                          id="voice-transcript"
                          value={transcript}
                          onChange={event => editTranscript(event.target.value)}
                          rows={5}
                          className="w-full bg-transparent text-secondary-100 leading-relaxed resize-y focus:outline-none"
                          aria-label="Edit recognized answer"
                        />
                        {interimTranscript && (
                          <p className="text-secondary-500 mt-2" aria-live="polite">{interimTranscript}</p>
                        )}
                        <p className="text-xs text-secondary-500 mt-2">
                          Review and edit the transcript before submitting.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {inputMode === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-2xl"
                >
                  <div className="glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-secondary-300">Type Your Answer</span>
                    </div>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={8}
                      className="w-full bg-secondary-900/50 border border-secondary-700 rounded-lg p-4 text-secondary-100 placeholder-secondary-500 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={status === 'processing'}
                        className={`btn-primary flex items-center gap-2 ${
                          status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Submit Answer
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {speechError && inputMode === 'voice' && (
                <div className="text-sm max-w-2xl space-y-3">
                  <div className="flex items-start gap-2 text-error-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{speechError}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        clearError();
                        resetTranscript();
                        setStatus('listening');
                        startListening();
                      }}
                      className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        clearError();
                        setInputMode('text');
                        setStatus('idle');
                      }}
                      className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                    >
                      <Keyboard className="w-4 h-4" />
                      Use Text Instead
                    </button>
                  </div>
                </div>
              )}
            </div>

            {status !== 'processing' && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSkipQuestion}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip
                </button>
              </div>
            )}

            {status === 'processing' && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                <span className="text-secondary-400">Analyzing your answer...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
