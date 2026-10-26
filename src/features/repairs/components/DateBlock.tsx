import { dateParts } from '@/lib/date';

/** The stacked day / month / year on a repair card; blue for the newest repair. */
export function DateBlock({ date, latest = false }: { date: string; latest?: boolean }) {
  const { day, month, year } = dateParts(date);
  return (
    <time
      dateTime={date}
      className={`flex w-16 shrink-0 flex-col items-center self-start rounded-control py-2 ${latest ? 'bg-accent-soft text-accent-hover' : 'bg-ground text-fg'}`}
    >
      <span className="text-[26px] leading-none font-bold">{day}</span>
      <span className="mt-1 text-xs font-semibold uppercase">{month}</span>
      <span className="text-xs font-medium">{year}</span>
    </time>
  );
}
