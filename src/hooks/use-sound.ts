
'use client';

import { useState, useEffect, useCallback } from 'react';

type Options = {
  volume?: number;
  playbackRate?: number;
};

type ReturnedValue = [(() => void) | null, { sound: HTMLAudioElement | null; pause: (() => void) | null }];

export const useSound = (src: string, { volume = 1, playbackRate = 1 }: Options = {}): ReturnedValue => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && src) {
      const newAudio = new Audio(src);
      newAudio.volume = volume;
      newAudio.playbackRate = playbackRate;
      setAudio(newAudio);

      return () => {
        newAudio.pause();
      };
    }
  }, [src, volume, playbackRate]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error("Audio play failed:", err));
    }
  }, [audio]);

  const pause = useCallback(() => {
    if (audio) {
      audio.pause();
    }
  }, [audio]);

  return [play, { sound: audio, pause }];
};
