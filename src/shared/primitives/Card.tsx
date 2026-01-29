import * as React from 'react';
import { Card as UICard, CardContent as UICardContent } from '@/shared/core/card';
import { cn } from '@/shared/lib/utils';
import SectionLabel from './SectionLabel';

// ============ Types ============

type CardVariant = 'default' | 'section';

type CardRootProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  isOver?: boolean;
};

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

type CardSectionProps = {
  children: React.ReactNode;
  label?: string;
  className?: string;
  isOver?: boolean;
};

// ============ Components ============

const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>(
  ({ className, variant = 'default', isOver = false, ...props }, ref) => (
    <UICard
      ref={ref}
      className={cn(
        variant === 'section' && 'bg-muted/50 transition-colors',
        variant === 'section' && isOver && 'ring-2 ring-primary',
        className
      )}
      {...props}
    />
  )
);
CardRoot.displayName = 'Card';

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <UICardContent
      ref={ref}
      className={cn(
        variant === 'default' && 'p-6 space-y-6',
        variant === 'section' && 'p-4 space-y-2',
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = 'Card.Content';

const CardSection = ({
  children,
  label,
  className,
  isOver = false,
}: CardSectionProps) => (
  <CardRoot variant="section" isOver={isOver} className={className}>
    <CardContent variant="section">
      {label && <SectionLabel>{label}</SectionLabel>}
      {children}
    </CardContent>
  </CardRoot>
);
CardSection.displayName = 'Card.Section';

// ============ Export ============

const Card = Object.assign(CardRoot, {
  Content: CardContent,
  Section: CardSection,
});

export default Card;
