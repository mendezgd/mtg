import { useCallback, useRef, useState } from 'react';

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const createAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playBeep = useCallback((frequency: number, duration: number) => {
    if (isMuted) return;
    
    try {
      const audioContext = createAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      // Configurar volumen
      const volume = 0.3;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }, [isMuted]);

  const playLifeGain = useCallback(() => {
    playBeep(1000, 0.15); // Beep agudo para ganar vida
  }, [playBeep]);

  const playLifeLoss = useCallback(() => {
    playBeep(500, 0.2); // Beep grave para perder vida
  }, [playBeep]);

  const playReset = useCallback(() => {
    playBeep(750, 0.3); // Beep medio para reset
  }, [playBeep]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playLifeGain,
    playLifeLoss,
    playReset,
    isMuted,
    toggleMute,
  };
}; 