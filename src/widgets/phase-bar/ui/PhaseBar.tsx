import { usePomodoroStore, type Phase } from '@/entities/pomodoro';
import { cn } from '@/shared/lib/utils';

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
    className="flex flex-col items-center gap-2"
  >
    <PhaseMarker isActive={isActive} />
    <PhaseLabel isActive={isActive} label={label} />
  </button>
);

// TODO REFACTOR 로직을 외부에서 주입받고, 형태만 가져가게 수정
const PhaseBar = () => {
  const { pomodoro, setPhase } = usePomodoroStore();
  const currentPhase = pomodoro.phase;

  // TODO 로직 체크
  const isPhaseCompleted = (phase: Phase): boolean => {
    switch (phase) {
      case 'plan':
        // Plan 완료: 실행 가능성 80% 이상
        return pomodoro.probability >= 80;
      case 'execute':
        return true;
      case 'reflect':
        return true;
      default:
        return false;
    }
  };

  const canAccessPhase = (phase: Phase): boolean => {
    for (const p of PHASES) {
      if (p === phase) return true;
      if (!isPhaseCompleted(p)) return false;
    }
    return false;
  };

  const handleClick = (phase: Phase) => {
    if (canAccessPhase(phase)) {
      setPhase(phase);
    }
  };

  return (
    <div className="flex items-center justify-center gap-12 py-4">
      {PHASES.map((phase) => {
        const isActive = phase === currentPhase;
        const isAccessible = canAccessPhase(phase);

        return (
          <PhaseItem
            key={phase}
            phase={phase}
            label={PHASE_LABEL[phase]}
            isActive={isActive}
            isAccessible={isAccessible}
            onClick={() => handleClick(phase)}
          />
        );
      })}
    </div>
  );
};

export default PhaseBar;
