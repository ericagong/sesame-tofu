import { GripVertical } from 'lucide-react';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { DraggableAttributes } from '@dnd-kit/core';

type DragHandleProps = {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
};

export const DragHandle = ({ attributes, listeners }: DragHandleProps) => {
  return (
    <button
      {...attributes}
      {...listeners}
      className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground transition-opacity"
    >
      <GripVertical className="w-4 h-4" />
    </button>
  );
};
