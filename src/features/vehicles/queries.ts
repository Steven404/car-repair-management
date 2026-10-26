import 'server-only';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { requireUser } from '@/features/auth/current-user';
import { db } from '@/lib/db/client';
import { repairs, vehicles, type Fuel, type Vehicle } from '@/lib/db/schema';

// Reads for the signed-in mechanic. Each one gets the mechanic itself, so no
// caller can ask for someone else's cars.

export interface VehicleListItem {
  id: string;
  brand: string;
  model: string;
  displacement: string;
  engineName: string;
  fuel: Fuel;
  plate: string;
  ownerName: string;
  repairCount: number;
}

/**
 * All of the mechanic's cars with their repair counts, in one query. Most
 * recent activity first: the latest repair, or when the car was added.
 */
export const listVehicles = cache(async (): Promise<VehicleListItem[]> => {
  const user = await requireUser();
  return db
    .select({
      id: vehicles.id,
      brand: vehicles.brand,
      model: vehicles.model,
      displacement: vehicles.displacement,
      engineName: vehicles.engineName,
      fuel: vehicles.fuel,
      plate: vehicles.plate,
      ownerName: vehicles.ownerName,
      repairCount: count(repairs.id),
    })
    .from(vehicles)
    .leftJoin(repairs, eq(repairs.vehicleId, vehicles.id))
    .where(eq(vehicles.mechanicId, user.id))
    .groupBy(vehicles.id)
    .orderBy(
      desc(sql`coalesce(max(${repairs.performedOn}), date(${vehicles.createdAt} / 1000, 'unixepoch'))`),
      desc(vehicles.createdAt)
    );
});

export type VehicleWithCount = Vehicle & { repairCount: number };

/** One of the mechanic's cars, or null for an id that isn't theirs (or doesn't exist). */
export const getVehicle = cache(async (id: string): Promise<VehicleWithCount | null> => {
  const user = await requireUser();
  const vehicle = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.id, id), eq(vehicles.mechanicId, user.id)),
  });
  if (!vehicle) return null;
  return { ...vehicle, repairCount: await db.$count(repairs, eq(repairs.vehicleId, id)) };
});
