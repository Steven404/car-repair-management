'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { CarFront, Plus, SearchX } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchField } from '@/components/ui/SearchField';
import { engineLabel } from '../labels';
import type { VehicleListItem } from '../queries';
import { makeSearchable, search } from '../utils/search';
import { VehicleCard } from './VehicleCard';

export function NewVehicleButton() {
  return (
    <ButtonLink href="/vehicles/new">
      <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
      Νέο όχημα
    </ButtonLink>
  );
}

function countLabel(shown: number, total: number, searching: boolean): string {
  const noun = total === 1 ? 'όχημα' : 'οχήματα';
  return searching ? `${shown} από ${total} ${noun}` : `${total} ${noun}`;
}

/**
 * The vehicles page below the app header: title, search and cards. Search runs
 * here in the browser over every car (see the plan's Search section) and is
 * kept in `?q=`, so back and refresh bring it back.
 */
export function VehicleList({ vehicles }: { vehicles: VehicleListItem[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const searchRef = useRef<HTMLInputElement>(null);

  const searchables = useMemo(() => vehicles.map(makeSearchable), [vehicles]);
  const results = useMemo(() => search(searchables, query), [searchables, query]);
  const searching = query.trim().length > 0;

  const changeQuery = (value: string) => {
    setQuery(value);
    // Next keeps useSearchParams in step with this, without fetching the page again
    const url = value ? `?q=${encodeURIComponent(value)}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  return (
    <>
      <PageHeader
        title="Οχήματα"
        // Announced as the results change while typing
        description={<span aria-live="polite">{countLabel(results.length, vehicles.length, searching)}</span>}
        actions={<NewVehicleButton />}
      />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={<CarFront size={24} />}
          title="Δεν υπάρχουν οχήματα ακόμα"
          description="Προσθέστε το πρώτο όχημα για να κρατάτε το ιστορικό επισκευών του."
          action={<NewVehicleButton />}
        />
      ) : (
        <>
          <SearchField
            inputRef={searchRef}
            label="Αναζήτηση"
            value={query}
            onChange={changeQuery}
            placeholder="π.χ. Golf, ΙΚΥ 4521 ή Παπαδόπουλος"
            hint="Ψάχνει σε μάρκα, μοντέλο, πινακίδα και ιδιοκτήτη."
            className="max-w-[560px]"
          />

          {results.length > 0 ? (
            <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-5 p-0">
              {results.map(({ item, highlights }) => (
                <li key={item.id} className="grid">
                  <VehicleCard
                    href={`/vehicles/${item.id}`}
                    brand={item.brand}
                    model={item.model}
                    engine={engineLabel(item)}
                    fuel={item.fuel}
                    plate={item.plate}
                    ownerName={item.ownerName}
                    repairCount={item.repairCount}
                    highlights={highlights}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<SearchX size={24} />}
              title={`Δεν βρέθηκαν οχήματα για «${query.trim()}»`}
              description="Δοκιμάστε άλλη μάρκα, μοντέλο, πινακίδα ή ιδιοκτήτη."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    changeQuery('');
                    // This button goes with the empty state: carry on from the search field
                    searchRef.current?.focus();
                  }}
                >
                  Καθαρισμός αναζήτησης
                </Button>
              }
            />
          )}
        </>
      )}
    </>
  );
}
