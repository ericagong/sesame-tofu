import { useState, useEffect, useCallback } from 'react';

type UseVisualizationReturn = {
  isVisualizing: boolean;
  countdown: number;
  startVisualization: () => void;
};

export const useVisualization = (
  onComplete: () => void
): UseVisualizationReturn => {
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const startVisualization = useCallback(() => {
    setIsVisualizing(true);
    setCountdown(30);
  }, []);

  useEffect(() => {
    if (!isVisualizing) return;

    if (countdown <= 0) {
      setIsVisualizing(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisualizing, countdown, onComplete]);

  return {
    isVisualizing,
    countdown,
    startVisualization,
  };
};
