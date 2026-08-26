import type { Priority } from '@/types';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '';
  return `${formatDate(date)} · ${formatTime(date)}`;
}

export function relativeTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const suffix = diff >= 0 ? 'in' : 'ago';
  if (mins < 1) return 'just now';
  if (mins < 60) return diff >= 0 ? `in ${mins}m` : `${mins}m ago`;
  if (hours < 24) return diff >= 0 ? `in ${hours}h` : `${hours}h ago`;
  return diff >= 0 ? `in ${days}d` : `${days}d ago`;
}

export function isToday(date: string | Date | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function isOverdue(date: string | Date | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return da.getDate() === db.getDate() && da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear();
}

export const priorityRank: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
export const priorityColors: Record<Priority, string> = {
  urgent: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
  high: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
  medium: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  low: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
};
export const priorityDot: Record<Priority, string> = {
  urgent: 'bg-error-500',
  high: 'bg-warning-500',
  medium: 'bg-primary-500',
  low: 'bg-ink-400',
};

export function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function generateId(): string {
  return crypto.randomUUID();
}
