import { create } from 'zustand';

// RestType: 휴식 종류
export type RestType = 'short' | 'long';

const FLOW_DURATION = 90 * 60; // 90분
const REST_DURATION = {
  short: 10 * 60, // 10분
  long: 20 * 60,  // 20분
};

type TimerStore = {
  // Flow 상태
  flowRemaining: number;
  isFlowRunning: boolean;
  // Rest 상태
  restRemaining: number;
  restType: RestType | null;
  // Flow 액션
  startFlow: () => void;
  pauseFlow: () => void;
  tickFlow: () => void;
  resetFlow: () => void;
  // Rest 액션
  startRest: (type: RestType) => void;
  tickRest: () => void;
  endRest: () => void;
};

export const useTimerStore = create<TimerStore>((set) => ({
  // Flow 초기값
  flowRemaining: FLOW_DURATION,
  isFlowRunning: false,
  // Rest 초기값
  restRemaining: 0,
  restType: null,

  // Flow 액션
  startFlow: () => set({ isFlowRunning: true }),
  pauseFlow: () => set({ isFlowRunning: false }),
  tickFlow: () => set((state) => ({
    flowRemaining: Math.max(0, state.flowRemaining - 1),
  })),
  resetFlow: () => set({
    flowRemaining: FLOW_DURATION,
    isFlowRunning: false,
  }),

  // Rest 액션
  startRest: (type) => set({
    isFlowRunning: false,
    restType: type,
    restRemaining: REST_DURATION[type],
  }),
  tickRest: () => set((state) => ({
    restRemaining: Math.max(0, state.restRemaining - 1),
  })),
  endRest: () => set({
    restType: null,
    restRemaining: 0,
  }),
}));
