/**
 * Parse Brazilian currency format (BRL) to number
 * Handles formats like:
 * - "1.234,56" -> 1234.56
 * - "1234,56" -> 1234.56
 * - "1.234.567,89" -> 1234567.89
 * - "-1.234,56" -> -1234.56
 * - "R$ 1.234,56" -> 1234.56
 * Also handles US format as fallback:
 * - "1,234.56" -> 1234.56
 */
export function parseBRLCurrency(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Clean up the string
  let cleaned = value.trim();
  
  // Remove currency symbols and spaces
  cleaned = cleaned.replace(/R\$\s*/gi, '');
  cleaned = cleaned.replace(/\s/g, '');
  
  // Check if negative
  const isNegative = cleaned.startsWith('-') || cleaned.startsWith('(');
  cleaned = cleaned.replace(/^[-+(]/, '').replace(/\)$/, '');
  
  // Detect format by analyzing separators
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  
  let result: number;
  
  if (lastComma > lastDot) {
    // Brazilian format: 1.234,56 (comma is decimal separator)
    // Remove thousand separators (dots) and replace comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    result = parseFloat(cleaned);
  } else if (lastDot > lastComma) {
    // US format: 1,234.56 (dot is decimal separator)
    // Remove thousand separators (commas)
    cleaned = cleaned.replace(/,/g, '');
    result = parseFloat(cleaned);
  } else if (lastComma !== -1) {
    // Only comma present - assume Brazilian decimal
    cleaned = cleaned.replace(',', '.');
    result = parseFloat(cleaned);
  } else if (lastDot !== -1) {
    // Only dot present - could be either, but assume decimal
    result = parseFloat(cleaned);
  } else {
    // No separators - just a number
    result = parseFloat(cleaned);
  }
  
  if (isNaN(result)) {
    return 0;
  }
  
  return isNegative ? -Math.abs(result) : result;
}

/**
 * Try to merge adjacent columns that might be split currency values
 * e.g., ["1.234", "56"] should become "1.234,56"
 */
export function tryMergeCurrencyColumns(row: string[], amountIndex: number): string {
  const value = row[amountIndex];
  const nextValue = row[amountIndex + 1];
  
  // If next column exists and looks like cents (1-2 digits)
  if (nextValue && /^\d{1,2}$/.test(nextValue.trim())) {
    // Check if current value ends without decimal
    if (!/[.,]\d{1,2}$/.test(value.trim())) {
      return `${value.trim()},${nextValue.trim()}`;
    }
  }
  
  return value;
}

/**
 * Format number to BRL display format
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format number to display format based on locale
 */
export function formatCurrency(value: number, locale: 'en' | 'pt' = 'pt'): string {
  if (locale === 'pt') {
    return formatBRL(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
