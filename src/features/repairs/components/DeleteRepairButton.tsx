'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconButton } from '@/components/ui/IconButton';
import { DELETE_FAILED_MESSAGE } from '@/lib/forms';
import { deleteRepairAction } from '../actions';

interface DeleteRepairButtonProps {
  vehicleId: string;
  repairId: string;
  /** "14/10/2026" */
  dateLabel: string;
}

/** The bin on a repair card: asks, then deletes. The vehicle page refreshes without the repair. */
export function DeleteRepairButton({ vehicleId, repairId, dateLabel }: DeleteRepairButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      let result: { error?: string } | undefined;
      try {
        result = await deleteRepairAction(vehicleId, repairId);
      } catch {
        result = { error: DELETE_FAILED_MESSAGE };
      }
      if (result?.error) {
        setError(result.error);
        return;
      }
      // The card goes with this button; FocusAfterDelete then moves focus to the history heading
      setOpen(false);
    });

  return (
    <>
      <IconButton label={`Διαγραφή επισκευής ${dateLabel}`} tone="danger" onClick={() => setOpen(true)}>
        <Trash2 size={18} aria-hidden="true" />
      </IconButton>
      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError(undefined);
        }}
        title="Διαγραφή επισκευής;"
        confirmLabel="Διαγραφή"
        onConfirm={confirm}
        pending={pending}
      >
        <p>Η επισκευή της {dateLabel} θα διαγραφεί οριστικά. Η ενέργεια δεν αναιρείται.</p>
        {error && (
          <p role="alert" className="mt-3 font-medium text-danger">
            {error}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
