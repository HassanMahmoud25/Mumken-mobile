import type { Comment, Locale } from './types';

export function roots(comments: readonly Comment[]) {
  return comments.filter(c => c.parentId === null).reverse().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function replies(comments: readonly Comment[], parentId: string) {
  return comments.filter(c => c.parentId === parentId).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}
export function formatDate(value: string, locale: Locale, timeZone?: string) {
  if (!Number.isFinite(Date.parse(value))) return '';
  // Hermes/iOS may ignore the calendar option with dateStyle; specify it in
  // the locale as well so Arabic uses the same Gregorian instants as English.
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US-u-ca-gregory', {
    dateStyle: 'medium', timeStyle: 'short', calendar: 'gregory', timeZone,
  }).format(new Date(value));
}
