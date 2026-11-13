"use client";
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

/** Clear the rendered view before a browser history-cache snapshot is taken. */
export function usePageHideLock(lock: () => void) {
  const latest = useRef(lock); latest.current = lock;
  useEffect(() => {
    const hide = () => { flushSync(() => latest.current()); };
    const show = (event: PageTransitionEvent) => { if (event.persisted) hide(); };
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', show);
    return () => {
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', show);
    };
  }, []);
}
