import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatPrice(amount: number): string {
  return `${amount.toFixed(0)} MAD`;
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE d MMMM yyyy', { locale: fr });
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy', { locale: fr });
}

export function formatPhone(phone: string): string {
  // +212612345678 → 06 12 34 56 78
  const local = phone.replace('+212', '0');
  return local.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
