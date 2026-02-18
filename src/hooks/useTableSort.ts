import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useTableSort<T>(items: T[], defaultKey?: string) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: defaultKey || '', direction: null });

  const toggleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: '', direction: null }; // reset
    });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return items;

    return [...items].sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];

      // Handle nulls/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
      }

      return sortConfig.direction === 'desc' ? -cmp : cmp;
    });
  }, [items, sortConfig]);

  return { sortedItems, sortConfig, toggleSort };
}
