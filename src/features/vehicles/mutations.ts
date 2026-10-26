import 'server-only';
import { and, eq, ne, or } from 'drizzle-orm';
import { requireUser } from '@/features/auth/current-user';
import { db } from '@/lib/db/client';
import { repairs, vehicles } from '@/lib/db/schema';
import type { VehicleInput } from './validation';

// Writes for the signed-in mechanic; like queries.ts, each one gets the
// mechanic itself and only ever touches their cars.

/** Another of the mechanic's cars already has this VIN or plate */
export interface VehicleConflict {
  field: 'vin' | 'plate';
  vehicle: { id: string; brand: string; model: string; plate: string };
}

export type SaveVehicleResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'conflict'; conflict: VehicleConflict }
  | { ok: false; reason: 'not-found' };

async function findConflict(mechanicId: string, input: VehicleInput, exceptId?: string) {
  const rows = await db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      plate: vehicles.plate,
      vin: vehicles.vin,
      plateKey: vehicles.plateKey,
    })
    .from(vehicles)
    .where(
      and(
        eq(vehicles.mechanicId, mechanicId),
        or(eq(vehicles.vin, input.vin), eq(vehicles.plateKey, input.plateKey)),
        exceptId ? ne(vehicles.id, exceptId) : undefined
      )
    );

  const sameVin = rows.find((row) => row.vin === input.vin);
  if (sameVin) return { field: 'vin', vehicle: sameVin } satisfies VehicleConflict;
  const samePlate = rows.find((row) => row.plateKey === input.plateKey);
  if (samePlate) return { field: 'plate', vehicle: samePlate } satisfies VehicleConflict;
  return null;
}

export async function insertVehicle(input: VehicleInput): Promise<SaveVehicleResult> {
  const user = await requireUser();
  const conflict = await findConflict(user.id, input);
  if (conflict) return { ok: false, reason: 'conflict', conflict };

  const [row] = await db
    .insert(vehicles)
    .values({ ...input, mechanicId: user.id })
    .returning({ id: vehicles.id });
  return { ok: true, id: row.id };
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<SaveVehicleResult> {
  const user = await requireUser();
  const conflict = await findConflict(user.id, input, id);
  if (conflict) return { ok: false, reason: 'conflict', conflict };

  const updated = await db
    .update(vehicles)
    .set(input)
    .where(and(eq(vehicles.id, id), eq(vehicles.mechanicId, user.id)))
    .returning({ id: vehicles.id });
  return updated.length ? { ok: true, id } : { ok: false, reason: 'not-found' };
}

/** Deletes the car and its repair history. False if it isn't the mechanic's. */
export async function deleteVehicle(id: string): Promise<boolean> {
  const user = await requireUser();
  const owned = await db.query.vehicles.findFirst({
    columns: { id: true },
    where: and(eq(vehicles.id, id), eq(vehicles.mechanicId, user.id)),
  });
  if (!owned) return false;

  // The repairs explicitly, in the same batch, rather than trusting the
  // cascade alone: Turso enforcing foreign keys isn't verified yet (plan, Environments)
  await db.batch([
    db.delete(repairs).where(eq(repairs.vehicleId, id)),
    db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.mechanicId, user.id))),
  ]);
  return true;
}
