import { create } from 'zustand';

type Mode = 'flow' | 'rest';

type TimerStore = {
  mode: Mode;
  remaining: number;
  isRunning: boolean;

  start: (mode: Mode) => void; // 모드 바꾸고 처음부터 시작
  reset: () => void;           // 현재 모드로 처음 상태(멈춤)
  resume: () => void;          // remaining 유지하고 재개
  pause: () => void;
  tick: () => void;
};

const FLOW_DURATION = 90 * 60;
const REST_DURATION = 10 * 60;

const getDuration = (mode: Mode) => (mode === 'flow' ? FLOW_DURATION : REST_DURATION);

export const useTimerStore = create<TimerStore>((set) => ({
  mode: 'flow',
  remaining: FLOW_DURATION,
  isRunning: false,

  start: (mode) =>
    set({
      mode,
      remaining: getDuration(mode),
      isRunning: true,
    }),

  reset: () =>
    set((state) => ({
      remaining: getDuration(state.mode),
      isRunning: false,
    })),

  resume: () => set({ isRunning: true }),

  pause: () => set({ isRunning: false }),

  tick: () =>
    set((state) => {
      const next = Math.max(0, state.remaining - 1);
      return {
        remaining: next,
        isRunning: next === 0 ? false : state.isRunning,
      };
    }),
}));
