import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { SortDirection } from '@/hooks/useTableSort';

interface SortableColumnHeaderProps {
  label: string;
  sortKey: string;
  currentKey: string;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: 'left' | 'right';
}

export function SortableColumnHeader({ label, sortKey, currentKey, direction, onSort, align = 'left' }: SortableColumnHeaderProps) {
  const isActive = currentKey === sortKey && direction !== null;

  return (
    <th
      className={`py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </span>
    </th>
  );
}
