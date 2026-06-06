"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseCallAudioOptions {
  loop?: boolean;
  repeatInterval?: number;
  enabled?: boolean;
  vibrate?: boolean;
  vibratePattern?: number | number[];
  onEnded?: () => void;
}

interface UseCallAudioReturn {
  retryPlay: () => void;
}

export function useCallAudio(
  src: string,
  {
    loop = false,
    repeatInterval,
    enabled = true,
    vibrate = false,
    vibratePattern = [400, 200, 400],
    onEnded,
  }: UseCallAudioOptions = {},
): UseCallAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs keep callbacks stable — no new array/boolean reference on each render
  const vibrateRef = useRef(vibrate);
  const vibratePatternRef = useRef(vibratePattern);
  const onEndedRef = useRef(onEnded);
  vibrateRef.current = vibrate;
  vibratePatternRef.current = vibratePattern;
  onEndedRef.current = onEnded;

  const playAudio = useCallback((): HTMLAudioElement => {
    const audio = new Audio(src);
    audio.loop = loop;
    // Vibrate exactly when audio starts — not when play() is called (async gap)
    audio.addEventListener(
      "play",
      () => {
        if (
          vibrateRef.current &&
          typeof navigator !== "undefined" &&
          "vibrate" in navigator
        ) {
          navigator.vibrate(vibratePatternRef.current);
        }
      },
      { once: true },
    );
    if (onEndedRef.current) {
      audio.addEventListener("ended", () => onEndedRef.current?.(), { once: true });
    }
    audio.play().catch(() => {});
    return audio;
  }, [src, loop]);

  useEffect(() => {
    if (!enabled || !src) return;

    const audio = playAudio();
    audioRef.current = audio;

    if (!repeatInterval) {
      return () => {
        audio.pause();
        audio.currentTime = 0;
        audioRef.current = null;
      };
    }

    const interval = setInterval(() => {
      audioRef.current?.pause();
      audioRef.current = playAudio();
    }, repeatInterval);

    return () => {
      clearInterval(interval);
      audioRef.current?.pause();
      audioRef.current = null;
      if (
        vibrateRef.current &&
        typeof navigator !== "undefined" &&
        "vibrate" in navigator
      ) {
        navigator.vibrate(0);
      }
    };
  }, [enabled, src, loop, repeatInterval, playAudio]);

  const retryPlay = useCallback(() => {
    if (!audioRef.current || !audioRef.current.paused) return;
    // Vibration fires via the "play" event listener attached in playAudio
    audioRef.current.play().catch(() => {});
  }, []);

  return { retryPlay };
}
