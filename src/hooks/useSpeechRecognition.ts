import { useState, useEffect, useCallback, useRef } from 'react';

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  language: string;
  setLanguage: (language: string) => void;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  editTranscript: (transcript: string) => void;
  clearError: () => void;
}

export const speechLanguages = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi' },
] as const;

function createRecognition(language: string): SpeechRecognition | null {
  const API = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : undefined;
  if (!API) return null;

  const rec = new API();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = language;
  return rec;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('en-US');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSpeechRecognition = typeof window !== 'undefined' &&
    (window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined);
  const isSupported = hasSpeechRecognition && window.isSecureContext;

  const wireRecognition = useCallback((rec: SpeechRecognition) => {
    rec.onstart = () => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
      setIsListening(true);
      setError(null);
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (shouldListenRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Will retry on next onend
            }
          }
        }, 200);
      } else {
        setIsListening(false);
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }

      if (event.error === 'no-speech' || event.error === 'aborted') return;

      shouldListenRef.current = false;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings and try again.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please connect a microphone or use text mode.');
      } else if (event.error === 'network') {
        setError('Voice recognition service is unavailable. This usually happens inside an embedded preview. Open the app in a new browser tab (Chrome or Edge) and try again, or use text mode.');
      } else {
        setError(`Speech recognition error: ${event.error}. Please try again or use text mode.`);
      }
      setIsListening(false);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText + ' ');
      }
      setInterimTranscript(interimText);
    };
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const rec = createRecognition(language);
    if (!rec) return;
    wireRecognition(rec);
    recognitionRef.current = rec;

    return () => {
      shouldListenRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      rec.abort();
    };
  }, [isSupported, wireRecognition, language]);

  const startListening = useCallback(() => {
    if (isListening) return;

    setError(null);
    if (!window.isSecureContext) {
      setError('Microphone input requires a secure HTTPS connection on your phone. Open InterviewAI using its HTTPS address, or use text input.');
      return;
    }
    shouldListenRef.current = true;

    // Recreate a fresh recognition instance on each start attempt.
    // After a network error, the old instance is often in a bad state
    // and will silently fail to restart.
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
    }
    const rec = createRecognition(language);
    if (!rec) {
      shouldListenRef.current = false;
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or switch to text mode.');
      return;
    }
    wireRecognition(rec);
    recognitionRef.current = rec;

    // Start timeout: if onstart doesn't fire within 8 seconds, abort
    // and show an error so the UI doesn't hang on "Requesting access..."
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    startTimeoutRef.current = setTimeout(() => {
      if (shouldListenRef.current && !isListening) {
        shouldListenRef.current = false;
        try { rec.abort(); } catch { /* noop */ }
        setIsListening(false);
        setError('Speech recognition did not start. This can happen inside an embedded preview. Open the app in a new browser tab and try again, or use text mode.');
      }
    }, 8000);

    try {
      rec.start();
    } catch {
      try {
        rec.abort();
        setTimeout(() => {
          if (shouldListenRef.current) {
            try {
              rec.start();
            } catch {
              if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current);
                startTimeoutRef.current = null;
              }
              shouldListenRef.current = false;
              setError('Could not start speech recognition. Please try again or use text mode.');
            }
          }
        }, 200);
      } catch {
        if (startTimeoutRef.current) {
          clearTimeout(startTimeoutRef.current);
          startTimeoutRef.current = null;
        }
        shouldListenRef.current = false;
        setError('Could not start speech recognition. Please try again or use text mode.');
      }
    }
  }, [isListening, wireRecognition, language]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch { /* already stopped */ }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const editTranscript = useCallback((value: string) => {
    setTranscript(value);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    language,
    setLanguage,
    startListening,
    stopListening,
    resetTranscript,
    editTranscript,
    clearError,
  };
}
