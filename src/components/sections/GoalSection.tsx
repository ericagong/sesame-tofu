import type { Block } from '@/types';
import { SectionLabel, DimmedSection } from '@/components/common';

type GoalSectionProps = {
  goal: Block | null;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  readonly?: boolean;
  dimmed?: boolean;
  autoFocus?: boolean;
};

export const GoalSection = ({
  goal,
  onChange,
  onKeyDown,
  readonly = false,
  dimmed = false,
  autoFocus = false,
}: GoalSectionProps) => {
  return (
    <DimmedSection dimmed={dimmed} className="space-y-2">
      <SectionLabel>목표</SectionLabel>
      {readonly ? (
        <p className="text-xs">{goal?.content}</p>
      ) : (
        <input
          type="text"
          value={goal?.content || ''}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="목표가 완성된 상황을 한 문장으로 적어보세요."
          className="w-full py-2 text-xs border-none outline-none focus:ring-0 bg-transparent"
          disabled={readonly}
          autoFocus={autoFocus}
        />
      )}
    </DimmedSection>
  );
};
