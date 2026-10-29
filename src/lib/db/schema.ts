import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Random ids, so URLs don't reveal how many vehicles or repairs exist
const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

export const users = sqliteTable('users', {
  id: id(),
  /** Trimmed and lowercased before it is stored or looked up */
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: createdAt(),
});

export const sessions = sqliteTable(
  'sessions',
  {
    /** SHA-256 of the cookie's token, never the token itself */
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)]
);

/**
 * Browsers that have signed a mechanic in before, for rate limiting: a login
 * carrying one is limited per device instead of per email, so a stranger who
 * knows the email can't lock the mechanic out (see rate-limit.ts).
 */
export const trustedDevices = sqliteTable(
  'trusted_devices',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** SHA-256 of the cookie's token, never the token itself */
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index('trusted_devices_user_id_idx').on(table.userId)]
);

/** Login attempts, for rate limiting; a successful login removes its own failures */
export const loginAttempts = sqliteTable(
  'login_attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    ip: text('ip').notNull(),
    /** The trusted device the attempt came from, if it carried a valid cookie for this email's user. No foreign key: rows are short-lived. */
    deviceId: text('device_id'),
    attemptedAt: integer('attempted_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('login_attempts_email_idx').on(table.email, table.attemptedAt),
    index('login_attempts_ip_idx').on(table.ip, table.attemptedAt),
    index('login_attempts_device_idx').on(table.deviceId, table.attemptedAt),
  ]
);

export const FUELS = ['diesel', 'petrol'] as const;
export type Fuel = (typeof FUELS)[number];

export const vehicles = sqliteTable(
  'vehicles',
  {
    id: id(),
    mechanicId: text('mechanic_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    /** Normalised: uppercase, 17 characters, no I, O or Q */
    vin: text('vin').notNull(),
    /** As shown, e.g. "ΙΚΥ 4521" */
    plate: text('plate').notNull(),
    /** For comparing plates: no spaces, Latin lookalike letters turned Greek, e.g. "ΙΚΥ4521" */
    plateKey: text('plate_key').notNull(),
    brand: text('brand').notNull(),
    model: text('model').notNull(),
    /** Litres, normalised to e.g. "1.6" */
    displacement: text('displacement').notNull(),
    /** e.g. "TDI" */
    engineName: text('engine_name').notNull(),
    fuel: text('fuel', { enum: FUELS }).notNull(),
    ownerName: text('owner_name').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  // Unique per mechanic, so two mechanics can both service the same car
  (table) => [
    uniqueIndex('vehicles_mechanic_vin_idx').on(table.mechanicId, table.vin),
    uniqueIndex('vehicles_mechanic_plate_idx').on(table.mechanicId, table.plateKey),
    check('vehicles_fuel_check', sql`${table.fuel} in ('diesel', 'petrol')`),
  ]
);

/** A rich-text node as Tiptap stores it (its `JSONContent`) */
export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

export interface RichTextDoc extends RichTextNode {
  type: 'doc';
}

export const repairs = sqliteTable(
  'repairs',
  {
    id: id(),
    vehicleId: text('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    /** 'YYYY-MM-DD', the day the work was done */
    performedOn: text('performed_on').notNull(),
    mileageKm: integer('mileage_km'),
    notes: text('notes', { mode: 'json' }).$type<RichTextDoc>().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('repairs_vehicle_performed_idx').on(table.vehicleId, table.performedOn)]
);

export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Repair = typeof repairs.$inferSelect;
export type NewRepair = typeof repairs.$inferInsert;
