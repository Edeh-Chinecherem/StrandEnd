export function formatNaira(amount: number): string {
  if (isNaN(amount)) return '₦0';
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function generateOrderNumber(counter: number): string {
  const year = new Date().getFullYear();
  return `SE-${year}-${String(counter).padStart(4, '0')}`;
}

export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

export { formatDate, formatDateTime, getRelativeTimeString } from './dateUtils';
