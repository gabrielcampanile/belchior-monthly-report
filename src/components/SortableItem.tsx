import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableItemProps {
  id: string;
  children: ReactNode;
  as?: 'div' | 'tr';
}

export function SortableItem({ id, children, as = 'div' }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  if (as === 'tr') {
    return (
      <tr ref={setNodeRef} style={style} {...attributes} className="group">
        <td className="py-3 px-1 w-8">
          <button
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </td>
        {children}
      </tr>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2">
      <button
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
