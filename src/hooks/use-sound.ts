
'use client';

import { useState, useEffect } from 'react';

export const useSound = (src: string, { volume = 1, playbackRate = 1 } = {}) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const newAudio = new Audio(src);
    newAudio.volume = volume;
    newAudio.playbackRate = playbackRate;
    setAudio(newAudio);

    return () => {
      newAudio.pause();
    };
  }, [src, volume, playbackRate]);

  const play = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error("Audio play failed:", err));
    }
  };

  const pause = () => {
    if (audio) {
      audio.pause();
    }
  };

  return [play, { pause, sound: audio }];
};

