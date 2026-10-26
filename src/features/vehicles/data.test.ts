import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/client';
import { repairs, vehicles, type User } from '@/lib/db/schema';
import { signInAs } from '@/test/auth';
import { createTestUser, resetDatabase } from '@/test/db';
import { vehicleInput } from '@/test/vehicles';
import { deleteVehicle, insertVehicle, updateVehicle } from './mutations';
import { getVehicle, listVehicles } from './queries';

// The queries and mutations get the mechanic from requireUser(); here it
// returns whoever the test signs in as.
vi.mock('@/features/auth/current-user', () => ({ requireUser: vi.fn(), getCurrentUser: vi.fn() }));

async function addVehicle(overrides: Parameters<typeof vehicleInput>[0] = {}): Promise<string> {
  const result = await insertVehicle(vehicleInput(overrides));
  if (!result.ok) throw new Error(`Could not add the test vehicle: ${result.reason}`);
  return result.id;
}

async function addRepair(vehicleId: string, performedOn: string) {
  await db.insert(repairs).values({ vehicleId, performedOn, notes: { type: 'doc' } });
}

describe('vehicles data', () => {
  let mechanic: User;
  let other: User;

  beforeEach(async () => {
    await resetDatabase();
    mechanic = await createTestUser();
    other = await createTestUser();
    signInAs(mechanic);
  });

  describe('listVehicles', () => {
    it('lists only the signed-in mechanic’s cars, with their repair counts', async () => {
      const golf = await addVehicle();
      await addRepair(golf, '2026-10-14');
      await addRepair(golf, '2026-06-03');
      signInAs(other);
      await addVehicle();

      signInAs(mechanic);
      const list = await listVehicles();
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject({ id: golf, model: 'Golf', plate: 'ΙΚΥ 4521', repairCount: 2 });
    });

    it('puts the most recently serviced first', async () => {
      const golf = await addVehicle();
      const polo = await addVehicle({ vin: 'WVWZZZAWZKU045821', plate: 'ΙΤΗ 9054', model: 'Polo' });
      await addRepair(golf, '2026-01-18');
      await addRepair(polo, '2026-07-29');
      expect((await listVehicles()).map((vehicle) => vehicle.model)).toEqual(['Polo', 'Golf']);
    });
  });

  describe('getVehicle', () => {
    it('gives the mechanic their car, and no one else’s', async () => {
      const golf = await addVehicle();
      expect(await getVehicle(golf)).toMatchObject({ id: golf, repairCount: 0 });

      signInAs(other);
      expect(await getVehicle(golf)).toBeNull();
    });

    it('gives null for an id that doesn’t exist', async () => {
      expect(await getVehicle('no-such-id')).toBeNull();
    });
  });

  describe('insertVehicle', () => {
    it('refuses a second car with the same VIN', async () => {
      await addVehicle();
      const result = await insertVehicle(vehicleInput({ plate: 'ΑΒΓ 1234' }));
      expect(result).toMatchObject({ ok: false, reason: 'conflict', conflict: { field: 'vin' } });
    });

    it('refuses the same plate, however it is typed', async () => {
      await addVehicle();
      const result = await insertVehicle(vehicleInput({ vin: 'WVWZZZ1KZ6W999999', plate: 'iky-4521' }));
      expect(result).toMatchObject({ ok: false, reason: 'conflict', conflict: { field: 'plate' } });
    });

    it('lets two mechanics each have the same car', async () => {
      await addVehicle();
      signInAs(other);
      expect((await insertVehicle(vehicleInput())).ok).toBe(true);
    });
  });

  describe('updateVehicle', () => {
    it('saves changes, keeping its own VIN and plate', async () => {
      const golf = await addVehicle();
      expect(await updateVehicle(golf, vehicleInput({ ownerName: 'Νίκος Αλεξίου' }))).toEqual({ ok: true, id: golf });
      expect((await getVehicle(golf))?.ownerName).toBe('Νίκος Αλεξίου');
    });

    it('refuses a plate another of the mechanic’s cars has', async () => {
      await addVehicle();
      const polo = await addVehicle({ vin: 'WVWZZZAWZKU045821', plate: 'ΙΤΗ 9054' });
      const result = await updateVehicle(polo, vehicleInput({ vin: 'WVWZZZAWZKU045821', plate: 'ΙΚΥ 4521' }));
      expect(result).toMatchObject({ ok: false, reason: 'conflict', conflict: { field: 'plate' } });
    });

    it('won’t touch another mechanic’s car', async () => {
      const golf = await addVehicle();
      signInAs(other);
      expect(await updateVehicle(golf, vehicleInput({ ownerName: 'Κάποιος άλλος' }))).toEqual({
        ok: false,
        reason: 'not-found',
      });
      signInAs(mechanic);
      expect((await getVehicle(golf))?.ownerName).toBe('Γιώργος Παπαδόπουλος');
    });
  });

  describe('deleteVehicle', () => {
    it('deletes the car and its repairs', async () => {
      const golf = await addVehicle();
      await addRepair(golf, '2026-10-14');
      expect(await deleteVehicle(golf)).toBe(true);
      expect(await db.$count(vehicles)).toBe(0);
      expect(await db.$count(repairs, eq(repairs.vehicleId, golf))).toBe(0);
    });

    it('won’t delete another mechanic’s car', async () => {
      const golf = await addVehicle();
      signInAs(other);
      expect(await deleteVehicle(golf)).toBe(false);
      expect(await db.$count(vehicles)).toBe(1);
    });
  });
});
