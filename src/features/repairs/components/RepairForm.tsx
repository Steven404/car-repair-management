'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { FormCard, FormSection } from '@/components/layout/FormCard';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { TextField } from '@/components/ui/TextField';
import type { Repair, RichTextDoc } from '@/lib/db/schema';
import { SAVE_FAILED_MESSAGE } from '@/lib/forms';
import { createRepairAction, updateRepairAction, type RepairFormState } from '../actions';
import { groupDigits } from '../utils/mileage';
import { RepairEditor } from './RepairEditor';

const EMPTY_NOTES: RichTextDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

interface RepairFormProps {
  vehicleId: string;
  /** The car, shown in the form's header strip (RepairVehicleStrip) */
  vehicleStrip: ReactNode;
  /** The repair being edited; leave out for a new one */
  repair?: Repair;
  /** Today in Athens, worked out on the server, for a new repair */
  defaultDate: string;
}

/** The new and edit repair form: date, optional mileage, and the notes editor. */
export function RepairForm({ vehicleId, vehicleStrip, repair, defaultDate }: RepairFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const notesLabelId = useId();
  const vehicleHref = `/vehicles/${vehicleId}`;

  const initial = {
    performedOn: repair?.performedOn ?? defaultDate,
    mileageKm: repair?.mileageKm != null ? groupDigits(repair.mileageKm) : '',
    notes: repair?.notes ?? EMPTY_NOTES,
  };
  const [performedOn, setPerformedOn] = useState(initial.performedOn);
  const [mileageKm, setMileageKm] = useState(initial.mileageKm);
  const [notes, setNotes] = useState(initial.notes);
  // A new key gives a fresh, empty editor
  const [editorKey, setEditorKey] = useState(0);

  const [state, formAction, pending] = useActionState(async (previous: RepairFormState, formData: FormData) => {
    let next: RepairFormState | undefined;
    try {
      next = repair
        ? await updateRepairAction(vehicleId, repair.id, previous, formData)
        : await createRepairAction(vehicleId, previous, formData);
    } catch {
      return { error: SAVE_FAILED_MESSAGE };
    }
    // Nothing comes back when the action redirected (a session that has expired)
    if (!next) return previous;
    if (next.savedId) {
      // This page stays mounted after we leave it (plan, Forms): start the next repair blank
      if (!repair) {
        setPerformedOn(defaultDate);
        setMileageKm('');
        setNotes(EMPTY_NOTES);
        setEditorKey((key) => key + 1);
      }
      router.push(vehicleHref);
    }
    return next;
  }, {});

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  const errors = state.fieldErrors ?? {};

  return (
    <FormCard
      ref={formRef}
      // By hand rather than action={formAction}, like the vehicle form (plan, Forms)
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      header={
        <>
          {vehicleStrip}
          {state.error && (
            <p role="alert" className="w-full text-[15px] font-medium text-danger">
              {state.error}
            </p>
          )}
        </>
      }
      footer={
        <>
          <ButtonLink href={vehicleHref} variant="secondary">
            Ακύρωση
          </ButtonLink>
          <Button type="submit" pending={pending}>
            {repair ? 'Αποθήκευση αλλαγών' : 'Αποθήκευση επισκευής'}
          </Button>
        </>
      }
    >
      <FormSection className="gap-6">
        <div className="flex flex-wrap gap-[18px]">
          <TextField
            label="Ημερομηνία"
            name="performedOn"
            type="date"
            required
            max={defaultDate}
            value={performedOn}
            onChange={(event) => setPerformedOn(event.target.value)}
            error={errors.performedOn}
            className="flex-[0_1_260px]"
          />
          <TextField
            label="Χιλιόμετρα"
            name="mileageKm"
            optional
            inputMode="numeric"
            autoComplete="off"
            placeholder="π.χ. 124500"
            value={mileageKm}
            onChange={(event) => setMileageKm(event.target.value.replace(/[^\d\s.]/g, ''))}
            error={errors.mileageKm}
            className="flex-[0_1_220px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel as="span" id={notesLabelId} required>
            Τι έγινε
          </FieldLabel>
          <input type="hidden" name="notes" value={JSON.stringify(notes)} />
          <RepairEditor
            key={editorKey}
            labelId={notesLabelId}
            initialContent={initial.notes}
            onChange={setNotes}
            error={errors.notes}
          />
        </div>
      </FormSection>
    </FormCard>
  );
}
