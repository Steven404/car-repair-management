import './lib/load-env';
import { createUser } from '@/features/auth/users';
import { normalizePlate } from '@/features/vehicles/utils/plate';
import { normalizeVin } from '@/features/vehicles/utils/vin';
import { db } from '@/lib/db/client';
import {
  loginAttempts,
  repairs,
  sessions,
  users,
  vehicles,
  type Fuel,
  type RichTextDoc,
  type RichTextNode,
} from '@/lib/db/schema';
import { env } from '@/lib/env';
import { ask } from './lib/prompt';
import { runScript } from './lib/run';

// pnpm db:seed — empties the database and fills it with the design's sample
// cars, for development. A local file is seeded straight away; a Turso database
// (the Vercel dev one) only after its name is typed, so a wrong URL in the shell
// can't wipe production:
//   TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… pnpm db:seed
//
// Sign in with:
//   mechanic@example.test / seed-password-1   (Στέφανος Μιχελάκης, 8 cars)
//   other@example.test    / seed-password-2   (a second mechanic: 1 car, the same Golf,
//                                              to check mechanics can't see each other's data)

const MECHANICS = [
  { email: 'mechanic@example.test', password: 'seed-password-1', firstName: 'Στέφανος', lastName: 'Μιχελάκης' },
  { email: 'other@example.test', password: 'seed-password-2', firstName: 'Νίκος', lastName: 'Δημητρίου' },
];

// ── Tiptap documents, built the way the editor stores them ──────────

type Inline = string | RichTextNode;

const text = (value: string, ...marks: string[]): RichTextNode => ({
  type: 'text',
  text: value,
  ...(marks.length > 0 && { marks: marks.map((type) => ({ type })) }),
});
const bold = (value: string) => text(value, 'bold');
const inline = (parts: Inline[]) => parts.map((part) => (typeof part === 'string' ? text(part) : part));
const p = (...parts: Inline[]): RichTextNode => ({ type: 'paragraph', content: inline(parts) });
const list = (type: 'bulletList' | 'orderedList', items: (Inline | Inline[])[]): RichTextNode => ({
  type,
  content: items.map((item) => ({ type: 'listItem', content: [p(...(Array.isArray(item) ? item : [item]))] })),
});
const ul = (...items: (Inline | Inline[])[]) => list('bulletList', items);
const ol = (...items: (Inline | Inline[])[]) => list('orderedList', items);
const doc = (...content: RichTextNode[]): RichTextDoc => ({ type: 'doc', content });

const service = (...items: string[]) => doc(p(bold('Σέρβις')), ul(...items));

// ── Sample data: the cars from the design ───────────────────────────

interface SampleRepair {
  on: string;
  km: number | null;
  notes: RichTextDoc;
}

interface SampleVehicle {
  vin: string;
  plate: string;
  brand: string;
  model: string;
  displacement: string;
  engineName: string;
  fuel: Fuel;
  owner: string;
  repairs: SampleRepair[];
}

const GOLF: SampleVehicle = {
  vin: 'WVWZZZ1KZ6W123456',
  plate: 'ΙΚΥ 4521',
  brand: 'Volkswagen',
  model: 'Golf',
  displacement: '1.6',
  engineName: 'TDI',
  fuel: 'diesel',
  owner: 'Γιώργος Παπαδόπουλος',
  repairs: [
    {
      on: '2026-10-14',
      km: 186400,
      notes: doc(
        p(bold('Σέρβις')),
        ul('Λάδι κινητήρα 5W-30', 'Φίλτρο λαδιού', 'Φίλτρο αέρα', 'Φίλτρο καμπίνας'),
        p(bold('Παρατήρηση:'), ' Φθορά στα πίσω τακάκια — έλεγχος στο επόμενο σέρβις.')
      ),
    },
    {
      on: '2026-06-03',
      km: 179250,
      notes: doc(
        p(bold('Φρένα εμπρός')),
        ol('Αντικατάσταση δισκόπλακων εμπρός', 'Αντικατάσταση τακακιών εμπρός', 'Αλλαγή υγρών φρένων')
      ),
    },
    {
      on: '2026-01-18',
      km: null,
      notes: doc(
        p('Δεν έπαιρνε μπρος το πρωί. Έλεγχος φόρτισης δυναμό — εντάξει.'),
        ul([bold('Νέα μπαταρία'), ' 12V 70Ah'], 'Καθαρισμός πόλων')
      ),
    },
  ],
};

const VEHICLES: SampleVehicle[] = [
  GOLF,
  {
    vin: 'VNKKH3D3X0A214587',
    plate: 'ΥΗΒ 7310',
    brand: 'Toyota',
    model: 'Yaris',
    displacement: '1.0',
    engineName: 'VVT-i',
    fuel: 'petrol',
    owner: 'Μαρία Κωνσταντίνου',
    repairs: [{ on: '2026-09-02', km: 64200, notes: service('Λάδι κινητήρα 0W-20', 'Φίλτρο λαδιού', 'Μπουζί') }],
  },
  {
    vin: 'TMBJJ7NE5J0123456',
    plate: 'ΙΟΡ 2288',
    brand: 'Skoda',
    model: 'Octavia',
    displacement: '1.6',
    engineName: 'TDI',
    fuel: 'diesel',
    owner: 'Νίκος Αλεξίου',
    repairs: [
      {
        on: '2026-08-21',
        km: 241300,
        notes: doc(
          p(bold('Ιμάντας χρονισμού')),
          ol('Αντικατάσταση ιμάντα και τεντωτήρα', 'Νέα αντλία νερού', 'Συμπλήρωση αντιψυκτικού')
        ),
      },
      { on: '2026-03-11', km: 232900, notes: service('Λάδι κινητήρα 5W-30', 'Φίλτρο λαδιού', 'Φίλτρο καυσίμου') },
      {
        on: '2025-11-04',
        km: null,
        notes: doc(p('Λαμπάκι κινητήρα αναμμένο. ', bold('Καθαρισμός βαλβίδας EGR'), ', σβήσιμο σφαλμάτων.')),
      },
      {
        on: '2025-06-17',
        km: 221500,
        notes: doc(p(bold('Ελαστικά')), ul('4 νέα ελαστικά 205/55 R16', 'Ζυγοστάθμιση', 'Ευθυγράμμιση')),
      },
      { on: '2025-02-09', km: 213800, notes: service('Λάδι κινητήρα 5W-30', 'Φίλτρο λαδιού', 'Φίλτρο αέρα') },
    ],
  },
  {
    vin: 'WVWZZZAWZKU045821',
    plate: 'ΙΤΗ 9054',
    brand: 'Volkswagen',
    model: 'Polo',
    displacement: '1.0',
    engineName: 'TSI',
    fuel: 'petrol',
    owner: 'Ελένη Γεωργίου',
    repairs: [
      {
        on: '2026-07-29',
        km: 88100,
        notes: doc(p(bold('Κλιματισμός')), ul('Γέμισμα ψυκτικού υγρού', 'Έλεγχος διαρροής — εντάξει')),
      },
      { on: '2025-12-15', km: 82400, notes: service('Λάδι κινητήρα 5W-40', 'Φίλτρο λαδιού') },
    ],
  },
  {
    vin: 'VF3CCHMZ6KT098214',
    plate: 'ΙΝΚ 1173',
    brand: 'Peugeot',
    model: '208',
    displacement: '1.2',
    engineName: 'PureTech',
    fuel: 'petrol',
    owner: 'Δημήτρης Βλάχος',
    repairs: [
      {
        on: '2026-05-06',
        km: 97300,
        notes: doc(p(bold('Αμορτισέρ εμπρός')), p('Αντικατάσταση και των δύο. Θόρυβος στις λακκούβες — λύθηκε.')),
      },
    ],
  },
  {
    vin: 'ZFA31200003592847',
    plate: 'ΥΚΜ 6620',
    brand: 'Fiat',
    model: 'Panda',
    displacement: '1.2',
    engineName: '8V',
    fuel: 'petrol',
    owner: 'Σοφία Μιχαηλίδου',
    repairs: [
      { on: '2026-10-02', km: 152600, notes: service('Λάδι κινητήρα 5W-40', 'Φίλτρο λαδιού', 'Φίλτρο αέρα') },
      { on: '2026-04-22', km: 148900, notes: doc(p(bold('Συμπλέκτης')), ul('Δίσκος', 'Πλατό', 'Ρουλεμάν')) },
      { on: '2025-10-08', km: null, notes: doc(p('Νέα μπαταρία 12V 45Ah.')) },
      { on: '2025-03-30', km: 139700, notes: service('Λάδι κινητήρα 5W-40', 'Φίλτρο λαδιού') },
    ],
  },
  {
    vin: 'NLHBB51CBEZ284716',
    plate: 'ΙΕΖ 3407',
    brand: 'Hyundai',
    model: 'i20',
    displacement: '1.4',
    engineName: 'CRDi',
    fuel: 'diesel',
    owner: 'Κώστας Ραφαηλίδης',
    repairs: [
      {
        on: '2026-09-18',
        km: 173500,
        notes: doc(p(bold('Προθέρμανση')), ul('4 νέα μπουζί προθέρμανσης', 'Έλεγχος ρελέ — εντάξει')),
      },
      { on: '2026-02-25', km: 166200, notes: service('Λάδι κινητήρα 5W-30', 'Φίλτρο λαδιού', 'Φίλτρο καμπίνας') },
    ],
  },
  {
    vin: 'VSSZZZ5FZGR120934',
    plate: 'ΙΜΑ 8126',
    brand: 'Seat',
    model: 'Leon',
    displacement: '1.4',
    engineName: 'TSI',
    fuel: 'petrol',
    owner: 'Αντώνης Λαμπρόπουλος',
    repairs: [],
  },
];

async function insertVehicle(mechanicId: string, vehicle: SampleVehicle) {
  const [row] = await db
    .insert(vehicles)
    .values({
      mechanicId,
      vin: normalizeVin(vehicle.vin),
      ...normalizePlate(vehicle.plate),
      brand: vehicle.brand,
      model: vehicle.model,
      displacement: vehicle.displacement,
      engineName: vehicle.engineName,
      fuel: vehicle.fuel,
      ownerName: vehicle.owner,
    })
    .returning({ id: vehicles.id });

  if (vehicle.repairs.length > 0) {
    await db.insert(repairs).values(
      vehicle.repairs.map((repair) => ({
        vehicleId: row.id,
        performedOn: repair.on,
        mileageKm: repair.km,
        notes: repair.notes,
      }))
    );
  }
}

/** The first part of a Turso host: car-repair-dev-myorg in libsql://car-repair-dev-myorg.aws-eu-west-1.turso.io */
function remoteName(url: string) {
  return new URL(url).hostname.split('.')[0];
}

runScript('Seed the database', async () => {
  if (!env.TURSO_DATABASE_URL.startsWith('file:')) {
    const name = remoteName(env.TURSO_DATABASE_URL);
    const answer = await ask(`This deletes everything in ${name}. Type ${name} to continue: `);
    if (answer !== name) throw new Error('Not confirmed. Nothing was changed.');
  }

  // Children first, so no foreign key is left pointing at a deleted row
  for (const table of [repairs, vehicles, sessions, loginAttempts, users]) await db.delete(table);

  const [mechanic, other] = await Promise.all(MECHANICS.map((mechanic) => createUser(mechanic)));
  for (const vehicle of VEHICLES) await insertVehicle(mechanic.id, vehicle);
  await insertVehicle(other.id, { ...GOLF, owner: 'Παναγιώτης Σταύρου', repairs: GOLF.repairs.slice(0, 1) });

  const repairCount = VEHICLES.reduce((sum, vehicle) => sum + vehicle.repairs.length, 0) + 1;
  console.log(`✓ ${MECHANICS.length} mechanics, ${VEHICLES.length + 1} vehicles, ${repairCount} repairs`);
});
