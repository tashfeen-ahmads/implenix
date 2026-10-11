'use client';

import { useEffect, useRef, useState } from 'react';

// Play/pause state for an <audio> element that follows what the element
// actually does (not what we asked it to do), plays one recording at a
// time across the page, and reports when playback fails.
export function useAudioToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    const onError = () => {
      setPlaying(false);
      setFailed(true);
    };
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onStop);
    el.addEventListener('ended', onStop);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onStop);
      el.removeEventListener('ended', onStop);
      el.removeEventListener('error', onError);
    };
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      return;
    }
    document.querySelectorAll('audio').forEach((other) => {
      if (other !== el) other.pause();
    });
    setFailed(false);
    el.play().catch(() => {
      setPlaying(false);
      setFailed(true);
    });
  };

  return { audioRef, playing, failed, toggle };
}
