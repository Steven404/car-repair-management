/** The mechanic the end-to-end tests sign in as; created fresh in e2e.db by prepare-db.ts. Test values only. */
export const E2E_MECHANIC = {
  email: 'e2e.mechanic@example.test',
  password: 'e2e-password-1',
  firstName: 'Στέφανος',
  lastName: 'Μιχελάκης',
};

/** The database the e2e server uses: its own file, never local.db */
export const E2E_DATABASE_URL = 'file:e2e.db';
