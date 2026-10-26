import { cardClasses } from '@/components/ui/Card';

// Grey outlines shown while a vehicle loads, roughly the shape of what's coming.

const bar = 'rounded-[4px] bg-ground';

export function VehiclePageFallback() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className={`${cardClasses} flex h-[148px] flex-col justify-center gap-3 p-7`}>
        <span className={`${bar} h-3 w-24`} />
        <span className={`${bar} h-8 w-40`} />
        <span className={`${bar} h-4 w-28`} />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <div className={`${cardClasses} h-[380px]`} />
        <div className="flex flex-col gap-4">
          <span className={`${bar} h-6 w-48`} />
          <div className={`${cardClasses} h-40`} />
        </div>
      </div>
    </div>
  );
}

export function VehicleFormFallback() {
  return <div aria-hidden="true" className={`${cardClasses} h-[620px] max-w-[840px]`} />;
}
