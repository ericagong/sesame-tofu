import { useEffect } from 'react';

import { useTimerStore } from '@/stores/timerStore';
import { formatTime } from '@/utils';

export const Timer = () => {
  const { remaining, isRunning, tick } = useTimerStore();

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  return (
    <div className="text-4xl font-mono font-bold text-center py-4">
      {formatTime(remaining)}
    </div>
  );
};
