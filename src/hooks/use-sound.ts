
'use client';

import { useState, useEffect, useCallback } from 'react';

type Options = {
  volume?: number;
  playbackRate?: number;
};

type ReturnedValue = [() => void, { sound: HTMLAudioElement | null; pause: () => void }];

export const useSound = (src: string, { volume = 1, playbackRate = 1 }: Options = {}): ReturnedValue => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    if (!src) {
        // If src is not provided, don't create the audio element yet.
        return;
    }

    const newAudio = new Audio(src);
    newAudio.volume = volume;
    newAudio.playbackRate = playbackRate;
    setAudio(newAudio);

    return () => {
      newAudio.pause();
    };
  }, [src, volume, playbackRate]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error("Audio play failed:", err));
    } else if (src && typeof window !== 'undefined') {
        // If audio is not initialized yet, create it on the fly
        const newAudio = new Audio(src);
        newAudio.volume = volume;
        newAudio.playbackRate = playbackRate;
        setAudio(newAudio);
        newAudio.currentTime = 0;
        newAudio.play().catch(err => console.error("Audio play on-demand failed:", err));
    }
  }, [audio, src, volume, playbackRate]);

  const pause = useCallback(() => {
    if (audio) {
      audio.pause();
    }
  }, [audio]);

  return [play, { sound: audio, pause }];
};
