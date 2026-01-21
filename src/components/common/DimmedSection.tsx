import { cn } from '@/lib/utils';

type DimmedSectionProps = {
  children: React.ReactNode;
  dimmed?: boolean;
  className?: string;
};

export const DimmedSection = ({
  children,
  dimmed = true,
  className,
}: DimmedSectionProps) => {
  return (
    <div
      className={cn(
        'transition-opacity',
        dimmed ? 'opacity-50' : 'opacity-100',
        className
      )}
    >
      {children}
    </div>
  );
};
