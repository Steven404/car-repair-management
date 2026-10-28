'use client';

import { unstable_rethrow } from 'next/navigation';
import { useId, useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cardClasses } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DELETE_FAILED_MESSAGE } from '@/lib/forms';
import { deleteVehicleAction } from '../actions';

interface DeleteVehicleSectionProps {
  vehicleId: string;
  /** "Volkswagen Golf · ΙΚΥ 4521" */
  title: string;
  repairCount: number;
}

function consequence(title: string, repairCount: number): string {
  if (repairCount === 0) return `Το ${title} θα διαγραφεί οριστικά.`;
  const repairs = repairCount === 1 ? 'η 1 επισκευή του' : `οι ${repairCount} επισκευές του`;
  return `Το ${title} και ${repairs} θα διαγραφούν οριστικά.`;
}

/** Below the edit form: deletes the car and its history, after asking. */
export function DeleteVehicleSection({ vehicleId, title, repairCount }: DeleteVehicleSectionProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      // Redirects to the list when it works, so only a failure comes back
      try {
        const result = await deleteVehicleAction(vehicleId);
        setError(result?.error);
      } catch (error) {
        // The redirect to the list also arrives as a rejection
        unstable_rethrow(error);
        setError(DELETE_FAILED_MESSAGE);
      }
    });

  return (
    <section
      aria-labelledby={titleId}
      className={`${cardClasses} flex flex-wrap items-center justify-between gap-4 p-5 sm:px-7`}
    >
      <div className="flex max-w-xl flex-col gap-1">
        <h2 id={titleId} className="text-[17px] font-bold">
          Διαγραφή οχήματος
        </h2>
        <p className="text-[15px] text-muted">
          Διαγράφει το όχημα και όλο το ιστορικό επισκευών του. Η ενέργεια δεν αναιρείται.
        </p>
      </div>
      <Button variant="danger-outline" onClick={() => setOpen(true)}>
        <Trash2 size={16} aria-hidden="true" />
        Διαγραφή οχήματος
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError(undefined);
        }}
        title="Διαγραφή οχήματος;"
        confirmLabel="Διαγραφή"
        onConfirm={confirm}
        pending={pending}
      >
        <p>{consequence(title, repairCount)} Η ενέργεια δεν αναιρείται.</p>
        {error && (
          <p role="alert" className="mt-3 font-medium text-danger">
            {error}
          </p>
        )}
      </ConfirmDialog>
    </section>
  );
}
