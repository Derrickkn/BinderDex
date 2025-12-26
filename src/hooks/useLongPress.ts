"use client";

import { useCallback, useRef } from "react";

interface LongPressOptions {
  threshold?: number;
  onLongPress: () => void;
  onClick?: () => void;
}

interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

// Debounce period to prevent double-clicks from touch + synthetic mouse events
const DEBOUNCE_MS = 500;

export function useLongPress({
  threshold = 500,
  onLongPress,
  onClick,
}: LongPressOptions): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  // Track the last time we fired a click to debounce
  const lastClickTimeRef = useRef(0);
  // Track if interaction started (mousedown/touchstart occurred)
  const interactionStartedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startInteraction = useCallback(() => {
    interactionStartedRef.current = true;
    isLongPressRef.current = false;

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      interactionStartedRef.current = false;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold]);

  const endInteraction = useCallback((shouldTriggerClick: boolean) => {
    clearTimer();

    if (shouldTriggerClick && interactionStartedRef.current && !isLongPressRef.current && onClick) {
      // Check debounce - prevent double-clicks
      const now = Date.now();
      if (now - lastClickTimeRef.current >= DEBOUNCE_MS) {
        lastClickTimeRef.current = now;
        onClick();
      }
    }

    interactionStartedRef.current = false;
    isLongPressRef.current = false;
  }, [clearTimer, onClick]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      startInteraction();
    },
    [startInteraction]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      endInteraction(true);
    },
    [endInteraction]
  );

  const handleMouseLeave = useCallback(() => {
    endInteraction(false);
  }, [endInteraction]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    startInteraction();
  }, [startInteraction]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    endInteraction(true);
  }, [endInteraction]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      clearTimer();
      interactionStartedRef.current = false;
      isLongPressRef.current = false;
      onLongPress();
    },
    [clearTimer, onLongPress]
  );

  // Block native click events entirely - we handle clicks in mouseUp/touchEnd
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onContextMenu: handleContextMenu,
    onClick: handleClick,
  };
}
