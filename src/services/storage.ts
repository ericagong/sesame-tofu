import type { CycleState, LeverageBlock } from '@/types';

const KEYS = {
  CYCLE: 'kkedubu_cycle',
  LEVERAGE: 'kkedubu_leverage',
} as const;

// Date 필드 복원을 위한 파서
const reviver = (key: string, value: unknown) => {
  if (key === 'createdAt' || key === 'archivedAt') {
    return value ? new Date(value as string) : value;
  }
  return value;
};

export const storage = {
  // Cycle
  saveCycle: (cycle: CycleState): void => {
    localStorage.setItem(KEYS.CYCLE, JSON.stringify(cycle));
  },

  loadCycle: (): CycleState | null => {
    const data = localStorage.getItem(KEYS.CYCLE);
    if (!data) return null;
    return JSON.parse(data, reviver) as CycleState;
  },

  clearCycle: (): void => {
    localStorage.removeItem(KEYS.CYCLE);
  },

  // Leverage
  saveLeverage: (items: LeverageBlock[]): void => {
    localStorage.setItem(KEYS.LEVERAGE, JSON.stringify(items));
  },

  loadLeverage: (): LeverageBlock[] => {
    const data = localStorage.getItem(KEYS.LEVERAGE);
    if (!data) return [];
    return JSON.parse(data, reviver) as LeverageBlock[];
  },

  clearLeverage: (): void => {
    localStorage.removeItem(KEYS.LEVERAGE);
  },

  // 전체 삭제
  clearAll: (): void => {
    localStorage.removeItem(KEYS.CYCLE);
    localStorage.removeItem(KEYS.LEVERAGE);
  },
};
