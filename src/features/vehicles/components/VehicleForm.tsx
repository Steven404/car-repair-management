'use client';

import { unstable_rethrow, useRouter } from 'next/navigation';
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { FormCard, FormSection } from '@/components/layout/FormCard';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import type { Fuel, Vehicle } from '@/lib/db/schema';
import { SAVE_FAILED_MESSAGE } from '@/lib/forms';
import { createVehicleAction, updateVehicleAction, type VehicleFormState } from '../actions';
import { COMMON_BRANDS, FUEL_OPTIONS } from '../labels';
import type { VehicleField } from '../validation';
import { normalizeVin, VIN_LENGTH } from '../utils/vin';
import { CardPreview } from './CardPreview';

type Values = Record<VehicleField, string>;

const EMPTY: Values = {
  vin: '',
  plate: '',
  brand: '',
  model: '',
  displacement: '',
  engineName: '',
  fuel: '',
  ownerName: '',
};

// Tidied as typed, like the design: what the mechanic sees is what gets saved
const AS_TYPED: Partial<Record<VehicleField, (value: string) => string>> = {
  vin: (value) => normalizeVin(value).slice(0, VIN_LENGTH),
  plate: (value) => value.toUpperCase(),
  displacement: (value) => value.replace(',', '.'),
};

interface VehicleFormProps {
  /** The car being edited; leave out for a new one */
  vehicle?: Vehicle & { repairCount: number };
  /** Where Ακύρωση goes */
  cancelHref: string;
  /** Under the form, in its column (the delete section when editing) */
  children?: ReactNode;
}

/** The new and edit vehicle form, with the card preview beside it. */
export function VehicleForm({ vehicle, cancelHref, children }: VehicleFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const brandListId = useId();
  const [values, setValues] = useState<Values>(() => (vehicle ? { ...EMPTY, ...pick(vehicle) } : EMPTY));

  const [state, formAction, pending] = useActionState(async (previous: VehicleFormState, formData: FormData) => {
    let next: VehicleFormState | undefined;
    try {
      next = vehicle
        ? await updateVehicleAction(vehicle.id, previous, formData)
        : await createVehicleAction(previous, formData);
    } catch (error) {
      // A redirect (a session that has expired) also arrives as a rejection
      unstable_rethrow(error);
      return { error: SAVE_FAILED_MESSAGE };
    }
    // Nothing comes back when the action redirected (a session that has expired)
    if (!next) return previous;
    if (next.savedId) {
      // Next keeps this page mounted after we leave it; a new-vehicle form
      // should be empty when the mechanic comes back, not show the last car
      if (!vehicle) setValues(EMPTY);
      router.push(`/vehicles/${next.savedId}`);
    }
    return next;
  }, {});

  // After a failed save, put the cursor in the first field with an error
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  const change = (field: VehicleField) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = AS_TYPED[field]?.(event.target.value) ?? event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
  };
  const errors = state.fieldErrors ?? {};

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
        <FormCard
          ref={formRef}
          // Submitted by hand rather than with action={formAction}: React resets a
          // form after its action, which would uncheck the fuel radios while their
          // state still says diesel or petrol
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            startTransition(() => formAction(formData));
          }}
          header={
            state.error && (
              <p role="alert" className="text-[15px] font-medium text-danger">
                {state.error}
              </p>
            )
          }
          footer={
            <>
              <ButtonLink href={cancelHref} variant="secondary">
                Ακύρωση
              </ButtonLink>
              <Button type="submit" pending={pending}>
                {vehicle ? 'Αποθήκευση αλλαγών' : 'Αποθήκευση οχήματος'}
              </Button>
            </>
          }
        >
          <FormSection title="Ταυτότητα οχήματος">
            <div className="flex flex-wrap gap-[18px]">
              <TextField
                label="Αριθμός πλαισίου (VIN)"
                name="vin"
                required
                mono
                maxLength={VIN_LENGTH}
                autoComplete="off"
                spellCheck={false}
                placeholder="π.χ. WVWZZZ1KZ6W123456"
                value={values.vin}
                onChange={change('vin')}
                hint={`${values.vin.length} / ${VIN_LENGTH} χαρακτήρες`}
                error={errors.vin}
                className="flex-[2_1_320px]"
              />
              <TextField
                label="Πινακίδα"
                name="plate"
                required
                mono
                autoComplete="off"
                spellCheck={false}
                placeholder="π.χ. ΙΚΥ 4521"
                value={values.plate}
                onChange={change('plate')}
                error={errors.plate}
                className="flex-[1_1_200px]"
              />
            </div>
          </FormSection>

          <FormSection title="Μοντέλο & μηχανή">
            <div className="flex flex-wrap gap-[18px]">
              <TextField
                label="Μάρκα"
                name="brand"
                required
                list={brandListId}
                autoComplete="off"
                placeholder="π.χ. Volkswagen"
                value={values.brand}
                onChange={change('brand')}
                error={errors.brand}
                className="flex-[1_1_240px]"
              />
              <datalist id={brandListId}>
                {COMMON_BRANDS.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              <TextField
                label="Μοντέλο"
                name="model"
                required
                autoComplete="off"
                placeholder="π.χ. Golf"
                value={values.model}
                onChange={change('model')}
                error={errors.model}
                className="flex-[1_1_240px]"
              />
            </div>
            <div className="flex flex-wrap gap-[18px]">
              <TextField
                label="Κυβισμός (λίτρα)"
                name="displacement"
                required
                inputMode="decimal"
                autoComplete="off"
                placeholder="π.χ. 1.6"
                value={values.displacement}
                onChange={change('displacement')}
                error={errors.displacement}
                className="flex-[1_1_160px]"
              />
              <TextField
                label="Ονομασία κινητήρα"
                name="engineName"
                required
                autoComplete="off"
                placeholder="π.χ. TSI"
                value={values.engineName}
                onChange={change('engineName')}
                error={errors.engineName}
                className="flex-[1_1_200px]"
              />
              <SegmentedControl
                label="Τύπος καυσίμου"
                name="fuel"
                required
                options={FUEL_OPTIONS}
                value={values.fuel as Fuel | ''}
                onChange={(fuel) => setValues((current) => ({ ...current, fuel }))}
                error={errors.fuel}
                className="flex-[1_1_240px]"
              />
            </div>
          </FormSection>

          <FormSection title="Ιδιοκτήτης">
            <TextField
              label="Ονοματεπώνυμο ιδιοκτήτη"
              name="ownerName"
              required
              autoComplete="off"
              placeholder="π.χ. Γιώργος Παπαδόπουλος"
              value={values.ownerName}
              onChange={change('ownerName')}
              error={errors.ownerName}
              className="max-w-[480px]"
            />
          </FormSection>
        </FormCard>
        {children}
      </div>

      <CardPreview values={values} repairCount={vehicle?.repairCount ?? 0} />
    </div>
  );
}

function pick(vehicle: Vehicle): Values {
  return {
    vin: vehicle.vin,
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    displacement: vehicle.displacement,
    engineName: vehicle.engineName,
    fuel: vehicle.fuel,
    ownerName: vehicle.ownerName,
  };
}
