import { cn } from '@/shared/lib/utils';
import { useFlowStore } from '../model/store';
import type { Phase } from '@/entities/flow';

const PHASES = ['plan', 'execute', 'reflect'] as const satisfies readonly Phase[];

const PHASE_LABEL: Record<Phase, string> = {
  plan: 'Plan',
  execute: 'Execute',
  reflect: 'Reflect',
};

type PhaseMarkerProps = {
  isActive: boolean;
};

type PhaseLabelProps = {
  isActive: boolean;
  label: string;
};

type PhaseItemProps = {
  phase: Phase;
  label: string;
  isActive: boolean;
  isAccessible: boolean;
  onClick: () => void;
};

const PhaseMarker = ({ isActive }: PhaseMarkerProps) => (
  <div
    className={cn(
      'w-4 h-4 rounded-full border-2 transition-all',
      isActive && 'bg-primary border-primary',
      !isActive && 'border-muted-foreground bg-background'
    )}
  />
);

const PhaseLabel = ({ isActive, label }: PhaseLabelProps) => (
  <span
    className={cn(
      'text-sm transition-colors',
      isActive && 'text-foreground font-medium',
      !isActive && 'text-muted-foreground'
    )}
  >
    {label}
  </span>
);

const PhaseItem = ({ phase, label, isActive, isAccessible, onClick }: PhaseItemProps) => (
  <button
    key={phase}
    onClick={onClick}
    disabled={!isAccessible}
    className={cn(
      'flex flex-col items-center gap-2',
      !isAccessible && 'opacity-50 cursor-not-allowed'
    )}
  >
    <PhaseMarker isActive={isActive} />
    <PhaseLabel isActive={isActive} label={label} />
  </button>
);

export const PhaseBar = () => {
  const phase = useFlowStore((s) => s.phase);
  const probability = useFlowStore((s) => s.probability);
  const setPhase = useFlowStore((s) => s.setPhase);

  const isPhaseCompleted = (p: Phase): boolean => {
    switch (p) {
      case 'plan':
        return probability >= 80;
      case 'execute':
        return true;
      case 'reflect':
        return true;
      default:
        return false;
    }
  };

  const canAccessPhase = (targetPhase: Phase): boolean => {
    for (const p of PHASES) {
      if (p === targetPhase) return true;
      if (!isPhaseCompleted(p)) return false;
    }
    return false;
  };

  const handleClick = (targetPhase: Phase) => {
    if (canAccessPhase(targetPhase)) {
      setPhase(targetPhase);
    }
  };

  return (
    <div className="flex items-center justify-center gap-12 py-4">
      {PHASES.map((p) => {
        const isActive = p === phase;
        const isAccessible = canAccessPhase(p);

        return (
          <PhaseItem
            key={p}
            phase={p}
            label={PHASE_LABEL[p]}
            isActive={isActive}
            isAccessible={isAccessible}
            onClick={() => handleClick(p)}
          />
        );
      })}
    </div>
  );
};
