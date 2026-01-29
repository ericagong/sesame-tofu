import { Badge } from '@/shared/core/badge';
import { Card } from '@/shared/primitives';
import type { Insight } from '@/entities/insight';

type InsightCheckListProps = {
  insights: Insight[];
  label: string;
  variant?: 'checkbox' | 'badge';
  checkedIds?: Set<string>;
  onToggle?: (id: string) => void;
};

const InsightCheckList = ({
  insights,
  label,
  variant = 'checkbox',
  checkedIds,
  onToggle,
}: InsightCheckListProps) => {
  if (insights.length === 0) return null;

  return (
    <Card.Section label={label}>
      <div className="space-y-2">
        {insights.map((insight) =>
          variant === 'checkbox' ? (
            <label
              key={insight.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checkedIds?.has(insight.id) ?? false}
                onChange={() => onToggle?.(insight.id)}
                className="w-4 h-4"
              />
              <span className="text-xs">{insight.block.content}</span>
            </label>
          ) : (
            <div key={insight.id} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {insight.timing}
              </Badge>
              <span className="text-xs">{insight.block.content}</span>
            </div>
          )
        )}
      </div>
    </Card.Section>
  );
};

export default InsightCheckList;
