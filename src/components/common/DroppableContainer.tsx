import { cn } from '@/lib/utils';

type DroppableContainerProps = {
  children: React.ReactNode;
  setNodeRef: (node: HTMLElement | null) => void;
  isOver: boolean;
  minHeight?: 'default' | 'small';
  className?: string;
  'data-droppable-id'?: string;
};

export const DroppableContainer = ({
  children,
  setNodeRef,
  isOver,
  minHeight = 'default',
  className,
  'data-droppable-id': droppableId,
}: DroppableContainerProps) => {
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'space-y-1 rounded transition-colors',
        minHeight === 'default' ? 'min-h-[40px]' : 'min-h-[32px]',
        isOver && 'bg-accent/50',
        className
      )}
      data-droppable-id={droppableId}
    >
      {children}
    </div>
  );
};
