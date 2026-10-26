import 'server-only';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/features/auth/current-user';
import { db } from '@/lib/db/client';
import { repairs, vehicles } from '@/lib/db/schema';
import type { RepairInput } from './validation';

// Writes for the signed-in mechanic; each one first checks the car is theirs.

export type SaveRepairResult = { ok: true; id: string } | { ok: false; reason: 'not-found' };

async function ownsVehicle(mechanicId: string, vehicleId: string): Promise<boolean> {
  const vehicle = await db.query.vehicles.findFirst({
    columns: { id: true },
    where: and(eq(vehicles.id, vehicleId), eq(vehicles.mechanicId, mechanicId)),
  });
  return Boolean(vehicle);
}

export async function insertRepair(vehicleId: string, input: RepairInput): Promise<SaveRepairResult> {
  const user = await requireUser();
  if (!(await ownsVehicle(user.id, vehicleId))) return { ok: false, reason: 'not-found' };

  const [row] = await db
    .insert(repairs)
    .values({ ...input, vehicleId })
    .returning({ id: repairs.id });
  return { ok: true, id: row.id };
}

export async function updateRepair(vehicleId: string, repairId: string, input: RepairInput): Promise<SaveRepairResult> {
  const user = await requireUser();
  if (!(await ownsVehicle(user.id, vehicleId))) return { ok: false, reason: 'not-found' };

  const updated = await db
    .update(repairs)
    .set(input)
    .where(and(eq(repairs.id, repairId), eq(repairs.vehicleId, vehicleId)))
    .returning({ id: repairs.id });
  return updated.length ? { ok: true, id: repairId } : { ok: false, reason: 'not-found' };
}

/** False if the repair isn't one of the mechanic's. */
export async function deleteRepair(vehicleId: string, repairId: string): Promise<boolean> {
  const user = await requireUser();
  if (!(await ownsVehicle(user.id, vehicleId))) return false;

  const deleted = await db
    .delete(repairs)
    .where(and(eq(repairs.id, repairId), eq(repairs.vehicleId, vehicleId)))
    .returning({ id: repairs.id });
  return deleted.length > 0;
}
