import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to DD/MM/YY.
 * Handles ISO (YYYY-MM-DD), DD/MM/YYYY, MM/DD/YYYY, and other common formats.
 */
export function formatDateDisplay(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  // Try to parse the date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = String(parsed.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }
  // If that fails, try DD/MM/YYYY pattern
  const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3].slice(-2);
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}
