import { useEffect } from 'react';
import { useTimerStore } from '../model/store';
import { formatTime } from '@/shared/lib/format';

export const TimerPanel = () => {
  const remaining = useTimerStore((s) => s.remaining);
  const isRunning = useTimerStore((s) => s.isRunning);
  const mode = useTimerStore((s) => s.mode);
  const tick = useTimerStore((s) => s.tick);
  const start = useTimerStore((s) => s.start);

  useEffect(() => {
    if (!isRunning && mode === 'flow') start('flow');

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, start, tick]);

  return (
    <div className="text-4xl font-mono font-bold text-center py-4">
      {formatTime(remaining)}
    </div>
  );
};
