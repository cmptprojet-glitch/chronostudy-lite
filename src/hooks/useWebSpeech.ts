import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface definitions
interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEventLike) => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function useWebSpeech(defaultLang: 'fr' | 'en' = 'fr') {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

  const startListening = useCallback(
    (onFinalTranscript?: (text: string) => void) => {
      setError(null);
      setTranscript('');
      setInterimTranscript('');

      if (typeof window === 'undefined') return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
        return;
      }

      try {
        // Stop previous instance if any
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition: SpeechRecognitionInstance = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = defaultLang === 'fr' ? 'fr-FR' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let currentFinal = '';
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              currentFinal += result[0].transcript;
            } else {
              currentInterim += result[0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => {
              const updated = (prev ? prev + ' ' : '') + currentFinal.trim();
              if (onFinalTranscript) {
                onFinalTranscript(updated);
              }
              return updated;
            });
            setInterimTranscript('');
          } else {
            setInterimTranscript(currentInterim);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          console.warn('Speech Recognition Error:', event.error);
          if (event.error === 'not-allowed') {
            setError("Accès au microphone refusé. Veuillez autoriser l'accès micro.");
          } else if (event.error !== 'no-speech') {
            setError(`Erreur vocale : ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        setError(err.message || 'Erreur d\'initialisation du micro.');
        setIsListening(false);
      }
    },
    [defaultLang]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        recognitionRef.current.abort();
      }
    }
    setIsListening(false);
  }, []);

  const speakText = useCallback(
    (text: string, customLang?: 'fr' | 'en', onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      try {
        window.speechSynthesis.cancel();

        // Clean markdown symbols for clearer speech
        const cleanText = text
          .replace(/[*_#`~>[\]()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const targetLang = customLang || defaultLang;
        utterance.lang = targetLang === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        // Try to pick a natural voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith(targetLang === 'fr' ? 'fr' : 'en') &&
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speech synthesis error:', err);
        setIsSpeaking(false);
      }
    },
    [defaultLang]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    setTranscript,
  };
}
