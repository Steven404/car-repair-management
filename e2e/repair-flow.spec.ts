import { expect, test } from '@playwright/test';
import { E2E_MECHANIC } from './mechanic';

// The plan's end-to-end flow: sign in, add a car, find it, add a repair with
// mileage and bold text, see it on the car's page, sign out. Found by what a
// person sees and screen readers announce (labels, roles), not by CSS.

test('a mechanic signs in, adds a car and a repair, and signs out', async ({ page }, testInfo) => {
  // Each project (laptop, phone) adds its own car, so they can run side by side
  const n = testInfo.project.name === 'phone' ? 2 : 1;
  const vin = `wvwzzz1kz6w10000${n}`;
  const plate = `ΚΖΗ 100${n}`;

  await test.step('signed out, the app sends you to the login page', async () => {
    await page.goto('/vehicles');
    await expect(page).toHaveURL(/\/login$/);
  });

  await test.step('sign in', async () => {
    await page.getByLabel('Email').fill(E2E_MECHANIC.email);
    await page.getByLabel('Κωδικός').fill(E2E_MECHANIC.password);
    await page.getByRole('button', { name: 'Σύνδεση' }).click();

    await expect(page).toHaveURL(/\/vehicles$/);
    await expect(page.getByRole('banner')).toContainText(`${E2E_MECHANIC.firstName} ${E2E_MECHANIC.lastName}`);
  });

  await test.step('add a car, typed carelessly', async () => {
    await page.getByRole('link', { name: 'Νέο όχημα' }).first().click();
    await expect(page.getByRole('heading', { level: 1, name: 'Νέο όχημα' })).toBeVisible();

    await page.getByLabel('Αριθμός πλαισίου (VIN)').fill(vin); // lowercase
    await page.getByLabel('Πινακίδα').fill(`kzh-100${n}`); // Latin letters, a dash
    await page.getByLabel('Μάρκα').fill('Volkswagen');
    await page.getByLabel('Μοντέλο').fill('Golf');
    await page.getByLabel('Κυβισμός (λίτρα)').fill('1,6'); // a comma
    await page.getByLabel('Ονομασία κινητήρα').fill('TDI');
    await page.getByRole('group', { name: 'Τύπος καυσίμου' }).getByText('Πετρέλαιο').click();
    await page.getByLabel('Ονοματεπώνυμο ιδιοκτήτη').fill('Γιώργος Παπαδόπουλος');
    await page.getByRole('button', { name: 'Αποθήκευση οχήματος' }).click();

    // The car's page, with everything stored tidied up
    await expect(page.getByRole('heading', { level: 1, name: 'Golf' })).toBeVisible();
    const details = page.getByRole('region', { name: 'Στοιχεία οχήματος' });
    await expect(details).toContainText(vin.toUpperCase());
    await expect(details).toContainText(plate);
    await expect(details).toContainText('1.6 TDI');
  });

  await test.step('find it from the list by its plate, in Latin letters', async () => {
    await page.getByRole('link', { name: 'Οχήματα' }).last().click();
    await page.getByRole('searchbox', { name: 'Αναζήτηση' }).fill(`kzh100${n}`);

    const results = page.getByRole('main').getByRole('listitem');
    await expect(results).toHaveCount(1);
    await expect(results.locator('mark')).toHaveText(plate);
    await results.getByRole('link').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Golf' })).toBeVisible();
  });

  await test.step('add a repair with mileage and bold text', async () => {
    await page.getByRole('link', { name: 'Νέα επισκευή' }).first().click();
    await expect(page.getByRole('heading', { level: 1, name: 'Νέα επισκευή' })).toBeVisible();

    await page.getByLabel('Χιλιόμετρα').fill('124500');
    await page.getByRole('textbox', { name: 'Τι έγινε' }).click();
    await page.getByRole('button', { name: 'Έντονα' }).click();
    await page.keyboard.type('Σέρβις');
    await page.getByRole('button', { name: 'Έντονα' }).click();
    await page.keyboard.press('Enter');
    await page.keyboard.type('Λάδι κινητήρα και φίλτρα');
    await page.getByRole('button', { name: 'Αποθήκευση επισκευής' }).click();

    // Back on the car's page, with the repair in its history
    const repair = page.getByRole('article', { name: /^Επισκευή / });
    await expect(repair).toHaveCount(1);
    await expect(repair).toContainText('124.500 km');
    await expect(repair.locator('strong')).toHaveText('Σέρβις');
    await expect(repair).toContainText('Λάδι κινητήρα και φίλτρα');
  });

  await test.step('sign out, and the app is closed again', async () => {
    await page.getByRole('button', { name: 'Αποσύνδεση' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/vehicles');
    await expect(page).toHaveURL(/\/login$/);
  });
});
