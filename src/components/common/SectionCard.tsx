import { Card, CardContent } from '@/components/ui/card';
import { SectionLabel } from './SectionLabel';
import { cn } from '@/lib/utils';

type SectionCardProps = {
  children: React.ReactNode;
  label?: string;
  className?: string;
  isOver?: boolean;
};

export const SectionCard = ({
  children,
  label,
  className,
  isOver = false,
}: SectionCardProps) => {
  return (
    <Card
      className={cn(
        'bg-muted/50 transition-colors',
        isOver && 'ring-2 ring-primary',
        className
      )}
    >
      <CardContent className="p-4 space-y-2">
        {label && <SectionLabel>{label}</SectionLabel>}
        {children}
      </CardContent>
    </Card>
  );
};
