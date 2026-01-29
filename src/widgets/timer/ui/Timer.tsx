import { useEffect } from 'react';

import { useTimerStore } from '@/entities/timer';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Timer = () => {
  const { flowRemaining, isFlowRunning, tickFlow, startFlow } = useTimerStore();

  useEffect(() => {
    if (!isFlowRunning) startFlow();

    const interval = setInterval(() => {
      tickFlow();
    }, 1000);

    return () => clearInterval(interval);
  }, [isFlowRunning, startFlow, tickFlow]);

  return (
    <div className="text-4xl font-mono font-bold text-center py-4">
      {formatTime(flowRemaining)}
    </div>
  );
};

export default Timer;
