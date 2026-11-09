'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CanvasCommandAction } from '@/types/canvas-commands';
import type { StandardViseme } from '@/types/avatar';

export interface VoiceCommandResult {
  matched: boolean;
  action?: CanvasCommandAction;
  toolName?: string;
  templateId?: string;
  voiceResponse: string;
}

export interface UseVoiceControllerOptions {
  onCommand?: (result: VoiceCommandResult, transcript: string) => void;
  onInterimTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceController(options: UseVoiceControllerOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<StandardViseme>('sil');

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Check speech synthesis & recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  // Voice synthesis (Avatar speaks back)
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick sleek English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural'))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentViseme('aa');
    };

    utterance.onboundary = (event) => {
      const visemes: StandardViseme[] = ['aa', 'O', 'E', 'I', 'CH', 'SS'];
      const randomViseme = visemes[event.charIndex % visemes.length];
      setCurrentViseme(randomViseme);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentViseme('sil');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentViseme('sil');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Parse natural language voice transcript into Canvas actions
  const parseVoiceCommand = useCallback((text: string): VoiceCommandResult => {
    const lower = text.toLowerCase().trim();

    // 1. Clear / Reset
    if (lower.includes('clear') || lower.includes('reset') || lower.includes('wipe')) {
      return {
        matched: true,
        action: { type: 'CLEAR_CANVAS', payload: { preserveBackground: false } },
        toolName: 'clear_canvas',
        voiceResponse: 'Canvas cleared.',
      };
    }

    // 2. Rollback / Undo
    if (lower.includes('rollback') || lower.includes('undo') || lower.includes('revert')) {
      return {
        matched: true,
        toolName: 'rollback',
        voiceResponse: 'Rolling back last canvas action.',
      };
    }

    // 3. Cyberpunk Matrix Rain
    if (lower.includes('matrix') || lower.includes('rain') || lower.includes('cyberpunk')) {
      return {
        matched: true,
        templateId: 'cyberpunk_city',
        toolName: 'inject_script',
        voiceResponse: 'Initializing Cyberpunk Matrix simulation.',
      };
    }

    // 4. Physics Playground
    if (lower.includes('physics') || lower.includes('gravity') || lower.includes('bounc')) {
      return {
        matched: true,
        templateId: 'physics_playground',
        toolName: 'create_physics_body',
        voiceResponse: 'Spawning 2D physics dynamics playground.',
      };
    }

    // 5. Solar System
    if (lower.includes('solar') || lower.includes('planet') || lower.includes('orbit')) {
      return {
        matched: true,
        templateId: 'solar_system',
        toolName: 'inject_script',
        voiceResponse: 'Rendering orbital planetary solar system.',
      };
    }

    // 6. Cellular Automata / Conway's Game of Life
    if (lower.includes('life') || lower.includes('automata') || lower.includes('cell')) {
      return {
        matched: true,
        templateId: 'cellular_automata',
        toolName: 'inject_script',
        voiceResponse: 'Running procedural cellular automata simulation.',
      };
    }

    // 7. Background changes
    if (lower.includes('background') || lower.includes('backdrop')) {
      let color = '#0f172a';
      if (lower.includes('black') || lower.includes('dark')) color = '#05070d';
      else if (lower.includes('blue')) color = '#0a192f';
      else if (lower.includes('purple')) color = '#1a0b2e';
      else if (lower.includes('red')) color = '#2b0c10';

      return {
        matched: true,
        action: { type: 'SET_BACKGROUND', payload: { mode: 'solid', color } },
        toolName: 'set_background',
        voiceResponse: `Canvas background updated.`,
      };
    }

    // 8. Vector Shapes: Circle, Star, Rectangle, Triangle
    const isCircle = lower.includes('circle') || lower.includes('ball') || lower.includes('sphere');
    const isStar = lower.includes('star');
    const isRectangle = lower.includes('rect') || lower.includes('box') || lower.includes('square');
    const isTriangle = lower.includes('triangle');

    if (isCircle || isStar || isRectangle || isTriangle) {
      let shape: 'circle' | 'star' | 'rectangle' | 'triangle' = 'circle';
      if (isStar) shape = 'star';
      else if (isRectangle) shape = 'rectangle';
      else if (isTriangle) shape = 'triangle';

      let color = '#00f3ff'; // default cyan
      if (lower.includes('red')) color = '#ff0055';
      else if (lower.includes('green') || lower.includes('emerald')) color = '#00ff66';
      else if (lower.includes('purple') || lower.includes('magenta')) color = '#d946ef';
      else if (lower.includes('yellow') || lower.includes('gold')) color = '#eab308';
      else if (lower.includes('blue')) color = '#38bdf8';
      else if (lower.includes('orange')) color = '#f97316';

      const radius = 35 + Math.floor(Math.random() * 30);
      const x = 150 + Math.floor(Math.random() * 400);
      const y = 100 + Math.floor(Math.random() * 300);

      return {
        matched: true,
        action: {
          type: 'DRAW_SHAPE',
          payload: {
            shape,
            color,
            radius,
            width: radius * 2,
            height: radius * 2,
            x,
            y,
            glow: true,
          },
        },
        toolName: 'draw_shape',
        voiceResponse: `Rendering glowing ${shape} on the canvas.`,
      };
    }

    // Default fallback
    return {
      matched: false,
      voiceResponse: `Directive processed: "${text}".`,
    };
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += piece;
          } else {
            interim += piece;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          options.onInterimTranscript?.(interim);
        }

        if (final) {
          const trimmed = final.trim();
          setTranscript(trimmed);
          setInterimTranscript('');

          // Execute recognized voice command
          const result = parseVoiceCommand(trimmed);
          speak(result.voiceResponse);
          options.onCommand?.(result, trimmed);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('SpeechRecognition error:', event.error);
          options.onError?.(event.error);
        }
      };

      recognition.onend = () => {
        // Automatically restart if user hasn't explicitly stopped listening
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      options.onError?.(err?.message || 'Failed to start speech recognition');
    }
  }, [options, parseVoiceCommand, speak]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    isSupported,
    currentViseme,
    startListening,
    stopListening,
    toggleListening,
    speak,
    parseVoiceCommand,
  };
}
