import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Volume2, VolumeX, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { findAnswer, defaultResponse } from '../../data/chatbotKnowledge';
import { useAuth } from '../../contexts/AuthContext';
import { createId } from '../../lib/ids';
import { chatWithAi } from '../../services/interviewAi';
import { SpeechRecognition, SpeechRecognitionErrorEvent, SpeechRecognitionEvent } from '../../hooks/useSpeechRecognition';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const suggestions = [
  'How do I start an interview?',
  'How does voice input work?',
  'What is the STAR method?',
  'How do I improve my scores?',
];

export function Chatbot() {
  const { user, isDemo } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hi! I'm your InterviewAI assistant. I can help you navigate the platform, understand features, and give you tips for better interviews. Ask me anything or pick a question below!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakResponses, setSpeakResponses] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (!speakResponses || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  }, [speakResponses]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const sendMessage = useCallback(async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: createId(),
      role: 'user',
      text: trimmed,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsListening(false);
    setIsSending(true);

    if (!isOpen) setUnreadCount(prev => prev + 1);

    let answer: string;
    try {
      if (user && !isDemo) {
        const response = await chatWithAi({ message: trimmed });
        answer = response.reply;
      } else {
        answer = findAnswer(trimmed) ?? defaultResponse;
      }
    } catch (error) {
      answer = error instanceof Error
        ? `I couldn't reach the AI assistant: ${error.message}`
        : 'I could not reach the AI assistant. Please try again.';
    } finally {
      setIsSending(false);
    }

    setMessages(prev => [...prev, { id: createId(), role: 'bot', text: answer }]);
    setTimeout(() => speak(answer), 300);
  }, [isDemo, isOpen, isSending, speak, user]);

  const startListening = useCallback(() => {
    if (!window.isSecureContext) {
      setMessages(prev => [...prev, {
        id: createId(),
        role: 'bot',
        text: 'Microphone input on phones requires opening InterviewAI over HTTPS. You can type your question for now.',
      }]);
      return;
    }
    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechAPI) {
      setMessages(prev => [...prev, {
        id: createId(),
        role: 'bot',
        text: 'Voice input is not supported in this browser. Please type your question instead.',
      }]);
      return;
    }

    stopSpeaking();
    setInput('');

    const recognition = new SpeechAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      shouldListenRef.current = false;
      if (event.error === 'not-allowed') {
        setMessages(prev => [...prev, {
          id: createId(),
          role: 'bot',
          text: 'Microphone access was denied. Please allow microphone permissions and try again, or type your question.',
        }]);
      } else if (event.error === 'no-speech') {
        // Silent — just stop
      } else {
        setMessages(prev => [...prev, {
          id: createId(),
          role: 'bot',
          text: 'Voice input could not start. Please type your question instead.',
        }]);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      shouldListenRef.current = false;
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim());
      }
    };

    shouldListenRef.current = true;
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      shouldListenRef.current = false;
    }
  }, [sendMessage, stopSpeaking]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* noop */ }
    }
    setIsListening(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* noop */ }
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={togglePanel}
        className="fixed bottom-20 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:scale-105 transition-all duration-300 flex items-center justify-center group"
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
        <span className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping opacity-0 group-hover:opacity-100" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-36 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] glass rounded-2xl border border-white/15 shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary-600/20 to-accent-600/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-secondary-100">AI Assistant</h3>
                  <p className="text-xs text-secondary-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
                    {user && !isDemo ? 'Gemini AI assistant' : 'Quick help (demo)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSpeakResponses(prev => !prev)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={speakResponses ? 'Mute voice responses' : 'Enable voice responses'}
              >
                {speakResponses ? (
                  <Volume2 className="w-4 h-4 text-primary-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-secondary-400" />
                )}
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 hide-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'bot'
                      ? 'bg-gradient-to-br from-primary-500 to-accent-500'
                      : 'bg-secondary-700'
                  }`}>
                    {msg.role === 'bot' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-secondary-300" />
                    )}
                  </div>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'bot'
                      ? 'bg-white/5 text-secondary-100 rounded-tl-md border border-white/5'
                      : 'bg-primary-600/30 text-secondary-50 rounded-tr-md border border-primary-500/20'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-secondary-400" role="status">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
                  Gemini is thinking...
                </div>
              )}

              {/* Quick suggestions (only on first load) */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 pt-2"
                >
                  <p className="text-xs text-secondary-500 px-1">Quick questions:</p>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      disabled={isSending}
                      className="w-full text-left px-3 py-2 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-sm text-primary-300 transition-all hover:scale-[1.02] flex items-center gap-2 group"
                    >
                      <Sparkles className="w-3 h-3 text-primary-400 opacity-60 group-hover:opacity-100" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/10 bg-black/10">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg bg-error-500/10 border border-error-500/20"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1 h-3 bg-error-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-error-300">Listening... speak your question</span>
                </motion.div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                    isListening
                      ? 'bg-error-500/30 text-error-400 border border-error-500/30 animate-pulse'
                      : 'bg-secondary-800/50 text-secondary-400 hover:text-primary-400 hover:bg-primary-500/10 border border-secondary-700/50'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak your question'}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type or speak your question..."
                  className="flex-1 bg-secondary-800/50 text-secondary-100 text-sm rounded-xl px-3 py-2.5 border border-secondary-700/50 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 outline-none transition-all placeholder:text-secondary-500"
                  disabled={isSending}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isSending}
                  className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                    input.trim()
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-500/30'
                      : 'bg-secondary-800/30 text-secondary-600 cursor-not-allowed'
                  }`}
                  title="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
