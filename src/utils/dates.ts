// Helper to parse 'YYYY-MM-DD' exactly as local midnight
export function parseLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format a Date object into 'YYYY-MM-DD'
export function formatLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Today's date as 'YYYY-MM-DD'
export function getTodayLocal(): string {
  return formatLocal(new Date());
}

export function addDaysLocal(dateString: string, days: number): string {
  const d = parseLocal(dateString);
  d.setDate(d.getDate() + days);
  return formatLocal(d);
}

// Get an array of days for calendar rendering (start to end inclusive)
export function getDaysInRange(start: string, end: string): string[] {
  const days: string[] = [];
  let current = start;
  // safety check to prevent infinite loop
  let i = 0;
  while (current <= end && i < 10000) {
    days.push(current);
    current = addDaysLocal(current, 1);
    i++;
  }
  return days;
}

export function getDiffDaysLocal(start: string, end: string): number {
  const d1 = parseLocal(start);
  const d2 = parseLocal(end);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Check if a date string is before another
export function isBeforeOrEqual(d1: string, d2: string): boolean {
  return d1 <= d2;
}

export function formatDisplayMonth(dateString: string): string {
  const d = parseLocal(dateString);
  return d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
}

export function getMonthStartOffset(dateString: string): number {
  const d = parseLocal(dateString);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  let dayOfWeek = monthStart.getDay(); // 0 is Sunday, 1 is Monday
  // We want Monday = 0, Sunday = 6
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

// Returns the number of days in the month
export function getDaysInMonth(dateString: string): number {
  const d = parseLocal(dateString);
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return nextMonth.getDate();
}
