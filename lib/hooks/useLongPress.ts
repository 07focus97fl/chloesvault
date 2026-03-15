import { useCallback, useRef } from "react";

interface UseLongPressOptions {
  threshold?: number;
  moveThreshold?: number;
}

export function useLongPress(
  callback: () => void,
  { threshold = 500, moveThreshold = 10 }: UseLongPressOptions = {}
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (x: number, y: number) => {
      firedRef.current = false;
      startPos.current = { x, y };
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        callback();
      }, threshold);
    },
    [callback, threshold, clear]
  );

  const move = useCallback(
    (x: number, y: number) => {
      if (!startPos.current) return;
      const dx = Math.abs(x - startPos.current.x);
      const dy = Math.abs(y - startPos.current.y);
      if (dx > moveThreshold || dy > moveThreshold) {
        clear();
      }
    },
    [moveThreshold, clear]
  );

  return {
    onTouchStart: useCallback(
      (e: React.TouchEvent) => {
        const touch = e.touches[0];
        start(touch.clientX, touch.clientY);
      },
      [start]
    ),
    onTouchMove: useCallback(
      (e: React.TouchEvent) => {
        const touch = e.touches[0];
        move(touch.clientX, touch.clientY);
      },
      [move]
    ),
    onTouchEnd: clear,
    onMouseDown: useCallback(
      (e: React.MouseEvent) => start(e.clientX, e.clientY),
      [start]
    ),
    onMouseMove: useCallback(
      (e: React.MouseEvent) => move(e.clientX, e.clientY),
      [move]
    ),
    onMouseUp: clear,
    onMouseLeave: clear,
    firedRef,
  };
}
