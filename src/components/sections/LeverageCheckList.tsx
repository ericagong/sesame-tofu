import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/common';
import type { LeverageBlock } from '@/types';

type LeverageCheckListProps = {
  leverages: LeverageBlock[];
  label: string;
  variant?: 'checkbox' | 'badge';
  checkedIds?: Set<string>;
  onToggle?: (id: string) => void;
};

export const LeverageCheckList = ({
  leverages,
  label,
  variant = 'checkbox',
  checkedIds,
  onToggle,
}: LeverageCheckListProps) => {
  if (leverages.length === 0) return null;

  return (
    <SectionCard label={label}>
      <div className="space-y-2">
        {leverages.map((leverage) =>
          variant === 'checkbox' ? (
            <label
              key={leverage.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checkedIds?.has(leverage.id) ?? false}
                onChange={() => onToggle?.(leverage.id)}
                className="w-4 h-4"
              />
              <span className="text-xs">{leverage.block.content}</span>
            </label>
          ) : (
            <div key={leverage.id} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {leverage.source === 'keep' ? 'Keep' : 'Try'}
              </Badge>
              <span className="text-xs">{leverage.block.content}</span>
            </div>
          )
        )}
      </div>
    </SectionCard>
  );
};
