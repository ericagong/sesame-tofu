import { cn } from '@/lib/utils';

type AddItemButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'muted';
};

export const AddItemButton = ({
  children,
  onClick,
  variant = 'default',
}: AddItemButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-2 py-1 text-xs transition-colors',
        variant === 'default'
          ? 'text-muted-foreground hover:text-foreground'
          : 'text-muted-foreground/50 hover:text-muted-foreground'
      )}
    >
      {children}
    </button>
  );
};
