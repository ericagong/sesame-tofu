import { create } from 'zustand';
import { useTimerStore } from '@/features/timer';

export type RestType = 'short' | 'long';

type RestStore = {
  // State
  isResting: boolean;
  restType: RestType | null;

  // Actions
  startRest: (type: RestType) => void;
  endRest: () => void;
};

export const useRestStore = create<RestStore>((set) => ({
  // Initial state
  isResting: false,
  restType: null,

  // Actions
  startRest: (type) => {
    const timer = useTimerStore.getState();
    timer.start('rest');
    set({ isResting: true, restType: type });
  },

  endRest: () => {
    const timer = useTimerStore.getState();
    timer.pause();
    set({ isResting: false, restType: null });
  },
}));
