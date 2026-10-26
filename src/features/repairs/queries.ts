import 'server-only';
import { and, desc, eq, getTableColumns } from 'drizzle-orm';
import { cache } from 'react';
import { requireUser } from '@/features/auth/current-user';
import { db } from '@/lib/db/client';
import { repairs, vehicles, type Repair } from '@/lib/db/schema';

// Reads for the signed-in mechanic. A repair is theirs when its car is, so
// every query joins the car and checks its mechanic.

/** One car's repairs, newest first. Empty for a car that isn't the mechanic's. */
export const listRepairs = cache(async (vehicleId: string): Promise<Repair[]> => {
  const user = await requireUser();
  return db
    .select(getTableColumns(repairs))
    .from(repairs)
    .innerJoin(vehicles, eq(vehicles.id, repairs.vehicleId))
    .where(and(eq(repairs.vehicleId, vehicleId), eq(vehicles.mechanicId, user.id)))
    .orderBy(desc(repairs.performedOn), desc(repairs.createdAt));
});

/** One repair of one of the mechanic's cars, or null. */
export const getRepair = cache(async (vehicleId: string, repairId: string): Promise<Repair | null> => {
  const user = await requireUser();
  const [repair] = await db
    .select(getTableColumns(repairs))
    .from(repairs)
    .innerJoin(vehicles, eq(vehicles.id, repairs.vehicleId))
    .where(and(eq(repairs.id, repairId), eq(repairs.vehicleId, vehicleId), eq(vehicles.mechanicId, user.id)));
  return repair ?? null;
});
