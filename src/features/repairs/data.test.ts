import { beforeEach, describe, expect, it, vi } from 'vitest';
import { insertVehicle } from '@/features/vehicles/mutations';
import { db } from '@/lib/db/client';
import { repairs, type User } from '@/lib/db/schema';
import { signInAs } from '@/test/auth';
import { createTestUser, resetDatabase } from '@/test/db';
import { vehicleInput } from '@/test/vehicles';
import { deleteRepair, insertRepair, updateRepair } from './mutations';
import { getRepair, listRepairs } from './queries';
import type { RepairInput } from './validation';

vi.mock('@/features/auth/current-user', () => ({ requireUser: vi.fn(), getCurrentUser: vi.fn() }));

const repair = (performedOn: string, text = 'Σέρβις'): RepairInput => ({
  performedOn,
  mileageKm: null,
  notes: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
});

async function addRepair(vehicleId: string, input: RepairInput): Promise<string> {
  const result = await insertRepair(vehicleId, input);
  if (!result.ok) throw new Error('Could not add the test repair');
  return result.id;
}

describe('repairs data', () => {
  let mechanic: User;
  let other: User;
  let golf: string;

  beforeEach(async () => {
    await resetDatabase();
    mechanic = await createTestUser();
    other = await createTestUser();
    signInAs(mechanic);
    const result = await insertVehicle(vehicleInput());
    if (!result.ok) throw new Error('Could not add the test vehicle');
    golf = result.id;
  });

  it('lists a car’s repairs newest first', async () => {
    await addRepair(golf, repair('2026-01-18'));
    await addRepair(golf, repair('2026-10-14'));
    await addRepair(golf, repair('2026-06-03'));
    expect((await listRepairs(golf)).map((r) => r.performedOn)).toEqual(['2026-10-14', '2026-06-03', '2026-01-18']);
  });

  it('keeps the mileage and the notes as saved', async () => {
    const id = await addRepair(golf, { ...repair('2026-10-14', 'Λάδι 5W-30'), mileageKm: 186400 });
    expect(await getRepair(golf, id)).toMatchObject({
      mileageKm: 186400,
      notes: { content: [{ content: [{ text: 'Λάδι 5W-30' }] }] },
    });
  });

  it('won’t add a repair to another mechanic’s car', async () => {
    signInAs(other);
    expect(await insertRepair(golf, repair('2026-10-14'))).toEqual({ ok: false, reason: 'not-found' });
    expect(await db.$count(repairs)).toBe(0);
  });

  it('shows another mechanic nothing of the car’s history', async () => {
    const id = await addRepair(golf, repair('2026-10-14'));
    signInAs(other);
    expect(await listRepairs(golf)).toEqual([]);
    expect(await getRepair(golf, id)).toBeNull();
  });

  it('edits a repair, but only the mechanic’s own', async () => {
    const id = await addRepair(golf, repair('2026-10-14'));
    expect(await updateRepair(golf, id, repair('2026-10-13', 'Διόρθωση'))).toEqual({ ok: true, id });
    expect((await getRepair(golf, id))?.performedOn).toBe('2026-10-13');

    signInAs(other);
    expect(await updateRepair(golf, id, repair('2026-01-01'))).toEqual({ ok: false, reason: 'not-found' });
  });

  it('won’t reach a repair through the wrong car', async () => {
    const id = await addRepair(golf, repair('2026-10-14'));
    const polo = await insertVehicle(vehicleInput({ vin: 'WVWZZZAWZKU045821', plate: 'ΙΤΗ 9054' }));
    if (!polo.ok) throw new Error('Could not add the second vehicle');
    expect(await getRepair(polo.id, id)).toBeNull();
    expect(await deleteRepair(polo.id, id)).toBe(false);
  });

  it('deletes a repair, but only the mechanic’s own', async () => {
    const id = await addRepair(golf, repair('2026-10-14'));
    signInAs(other);
    expect(await deleteRepair(golf, id)).toBe(false);

    signInAs(mechanic);
    expect(await deleteRepair(golf, id)).toBe(true);
    expect(await db.$count(repairs)).toBe(0);
  });
});
