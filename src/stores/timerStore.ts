import { create } from 'zustand';

import { FLOW_DURATION, REST_DURATION } from '@/utils';

type TimerStore = {
  remaining: number;
  isRunning: boolean;
  isRest: boolean;
  restDuration: 10 | 20 | null;
  start: () => void;
  pause: () => void;
  tick: () => void;
  startRest: (duration: 10 | 20) => void;
  reset: () => void;
};

export const useTimerStore = create<TimerStore>((set) => ({
  remaining: FLOW_DURATION,
  isRunning: false,
  isRest: false,
  restDuration: null,

  start: () => set({ isRunning: true }),

  pause: () => set({ isRunning: false }),

  tick: () =>
    set((state) => ({
      remaining: Math.max(0, state.remaining - 1),
    })),

  startRest: (duration) =>
    set({
      remaining: duration === 10 ? REST_DURATION.short : REST_DURATION.long,
      isRunning: true,
      isRest: true,
      restDuration: duration,
    }),

  reset: () =>
    set({
      remaining: FLOW_DURATION,
      isRunning: false,
      isRest: false,
      restDuration: null,
    }),
}));
