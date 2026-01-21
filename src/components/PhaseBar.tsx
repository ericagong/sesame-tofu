import { useCycleStore } from '@/stores/cycleStore';
import { cn } from '@/lib/utils';

import type { Phase } from '@/types';

const phases: { key: Phase; label: string }[] = [
  { key: 'plan', label: 'Plan' },
  { key: 'execute', label: 'Execute' },
  { key: 'reflect', label: 'Reflect' },
];

export const PhaseBar = () => {
  const { cycle, setPhase } = useCycleStore();
  const currentPhase = cycle.phase;

  const getPhaseIndex = (phase: Phase) => phases.findIndex((p) => p.key === phase);
  const currentIndex = getPhaseIndex(currentPhase);

  // 각 Phase 완료 조건
  const isPhaseCompleted = (phase: Phase): boolean => {
    switch (phase) {
      case 'plan':
        // Plan 완료: 목표 시각화까지 완료 (planStep 4 + 확률 80% 이상)
        return cycle.planStep === 4 && cycle.probability >= 80;
      case 'execute':
        // Execute 완료: 언제든 Reflect로 이동 가능
        return true;
      case 'reflect':
        return false;
      default:
        return false;
    }
  };

  // 해당 Phase 접근 가능 여부
  const canAccessPhase = (phase: Phase): boolean => {
    const phaseIndex = getPhaseIndex(phase);
    if (phaseIndex === 0) return true;

    // 이전 Phase들이 모두 완료되어야 접근 가능
    for (let i = 0; i < phaseIndex; i++) {
      if (!isPhaseCompleted(phases[i].key)) {
        return false;
      }
    }
    return true;
  };

  const handleClick = (phase: Phase) => {
    if (canAccessPhase(phase)) {
      setPhase(phase);
    }
  };

  return (
    <div className="flex items-center justify-center gap-12 py-4">
      {phases.map((phase, index) => {
        const isActive = phase.key === currentPhase;
        const isPast = index < currentIndex;
        const isAccessible = canAccessPhase(phase.key);

        return (
          <button
            key={phase.key}
            onClick={() => handleClick(phase.key)}
            disabled={!isAccessible}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 transition-all',
                (isActive || isPast) && 'bg-primary border-primary',
                !isActive && !isPast && 'border-muted-foreground bg-background'
              )}
            />
            <span
              className={cn(
                'text-sm transition-colors',
                isActive && 'text-foreground font-medium',
                !isActive && 'text-muted-foreground'
              )}
            >
              {phase.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
