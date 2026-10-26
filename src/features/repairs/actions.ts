'use server';

import { revalidatePath } from 'next/cache';
import { fieldErrors } from '@/lib/forms';
import { deleteRepair, insertRepair, updateRepair, type SaveRepairResult } from './mutations';
import { repairFormValues, repairSchema, type RepairField } from './validation';

export interface RepairFormState {
  fieldErrors?: Partial<Record<RepairField, string>>;
  error?: string;
  /** Set once saved; the form then resets itself and goes back to the car (see the plan's Forms section) */
  savedId?: string;
}

function toFormState(result: SaveRepairResult): RepairFormState {
  if (!result.ok) return { error: 'Η επισκευή ή το όχημα δεν βρέθηκε. Μπορεί να έχει διαγραφεί.' };
  revalidatePath('/vehicles', 'layout');
  return { savedId: result.id };
}

export async function createRepairAction(
  vehicleId: string,
  _previous: RepairFormState,
  formData: FormData
): Promise<RepairFormState> {
  const parsed = repairSchema.safeParse(repairFormValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  return toFormState(await insertRepair(vehicleId, parsed.data));
}

export async function updateRepairAction(
  vehicleId: string,
  repairId: string,
  _previous: RepairFormState,
  formData: FormData
): Promise<RepairFormState> {
  const parsed = repairSchema.safeParse(repairFormValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  return toFormState(await updateRepair(vehicleId, repairId, parsed.data));
}

/** Deletes and refreshes the vehicle page, which stays open. Only a failure comes back. */
export async function deleteRepairAction(vehicleId: string, repairId: string): Promise<{ error?: string }> {
  const deleted = await deleteRepair(vehicleId, repairId);
  revalidatePath('/vehicles', 'layout');
  return deleted ? {} : { error: 'Η επισκευή δεν βρέθηκε. Μπορεί να έχει ήδη διαγραφεί.' };
}
