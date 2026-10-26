'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fieldErrors } from '@/lib/forms';
import { vehicleTitle } from './labels';
import { deleteVehicle, insertVehicle, updateVehicle, type SaveVehicleResult } from './mutations';
import { vehicleFormValues, vehicleSchema, type VehicleField } from './validation';

export interface VehicleFormState {
  fieldErrors?: Partial<Record<VehicleField, string>>;
  error?: string;
  /** Set once saved. The form then resets itself and navigates, rather than this redirecting (VehicleForm) */
  savedId?: string;
}

function toFormState(result: SaveVehicleResult): VehicleFormState {
  if (result.ok) {
    revalidatePath('/vehicles', 'layout');
    return { savedId: result.id };
  }
  if (result.reason === 'not-found') {
    return { error: 'Το όχημα δεν βρέθηκε. Μπορεί να έχει διαγραφεί.' };
  }
  const { field, vehicle } = result.conflict;
  const message =
    field === 'vin'
      ? `Υπάρχει ήδη όχημα με αυτόν τον αριθμό πλαισίου: ${vehicleTitle(vehicle)}.`
      : `Υπάρχει ήδη όχημα με αυτή την πινακίδα: ${vehicle.brand} ${vehicle.model}.`;
  return { fieldErrors: { [field]: message } };
}

export async function createVehicleAction(_previous: VehicleFormState, formData: FormData): Promise<VehicleFormState> {
  const parsed = vehicleSchema.safeParse(vehicleFormValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  return toFormState(await insertVehicle(parsed.data));
}

export async function updateVehicleAction(
  id: string,
  _previous: VehicleFormState,
  formData: FormData
): Promise<VehicleFormState> {
  const parsed = vehicleSchema.safeParse(vehicleFormValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  return toFormState(await updateVehicle(id, parsed.data));
}

export async function deleteVehicleAction(id: string): Promise<{ error: string }> {
  const deleted = await deleteVehicle(id);
  revalidatePath('/vehicles', 'layout');
  if (!deleted) return { error: 'Το όχημα δεν βρέθηκε. Μπορεί να έχει ήδη διαγραφεί.' };
  redirect('/vehicles');
}
