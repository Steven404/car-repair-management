import { PageHeader } from '@/components/layout/PageHeader';
import { listVehicles } from '../queries';
import { NewVehicleButton, VehicleList } from './VehicleList';

/** The vehicles page's content. Reads the mechanic's cars: render it inside <Suspense> with VehiclesFallback. */
export async function Vehicles() {
  return <VehicleList vehicles={await listVehicles()} />;
}

/** While the cars load: the page's title and button at once, then grey card outlines. */
export function VehiclesFallback() {
  return (
    <>
      <PageHeader title="Οχήματα" description="&nbsp;" actions={<NewVehicleButton />} />
      <div aria-hidden="true" className="flex flex-col gap-2">
        <span className="h-5 w-24 rounded-[4px] bg-line" />
        <span className="h-[50px] max-w-[560px] rounded-control border border-line bg-surface" />
      </div>
      <div aria-hidden="true" className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex h-[214px] flex-col gap-3 rounded-card border border-line bg-surface p-5">
            <span className="h-3 w-20 rounded-[4px] bg-ground" />
            <span className="h-5 w-32 rounded-[4px] bg-ground" />
            <span className="mt-auto h-[30px] w-28 rounded-plate bg-ground" />
          </div>
        ))}
      </div>
    </>
  );
}
