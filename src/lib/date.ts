// Dates are stored as 'YYYY-MM-DD' (the day the work was done, no time).
// They're read as midnight UTC and formatted in UTC, so the day can never
// shift by a timezone on the way to the screen.

/**
 * Today in Greece, as 'YYYY-MM-DD'. Not the server's today: Vercel runs on
 * UTC, which is two or three hours behind, so after midnight in Athens it
 * would still say yesterday.
 */
export function todayInAthens(now = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const asDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

const MONTH = new Intl.DateTimeFormat('el-GR', { month: 'short', timeZone: 'UTC' });
const NUMERIC = new Intl.DateTimeFormat('el-GR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-10-14" → { day: "14", month: "Οκτ", year: "2026" }, for the repair card's date block */
export function dateParts(isoDate: string): { day: string; month: string; year: string } {
  const [year, , day] = isoDate.split('-');
  return { day, month: MONTH.format(asDate(isoDate)), year };
}

/** "2026-10-14" → "14/10/2026" */
export function formatDate(isoDate: string): string {
  return NUMERIC.format(asDate(isoDate));
}
