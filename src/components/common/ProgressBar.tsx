import { cn } from '@/lib/utils';

type ProgressBarProps = {
  label: string;
  value: number;
  color?: 'gray' | 'foreground';
  valueClassName?: string;
};

export const ProgressBar = ({
  label,
  value,
  color = 'gray',
  valueClassName,
}: ProgressBarProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span
          className={cn(
            'text-xs font-bold',
            valueClassName ?? (color === 'foreground' ? 'text-foreground' : 'text-muted-foreground')
          )}
        >
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            color === 'foreground' ? 'bg-foreground' : 'bg-gray-400'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
