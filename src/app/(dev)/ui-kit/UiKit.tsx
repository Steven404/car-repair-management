'use client';

import { useState, type ReactNode } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { BackLink } from '@/components/layout/BackLink';
import { FormCard, FormSection } from '@/components/layout/FormCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Highlight } from '@/components/ui/Highlight';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';

const FUEL_OPTIONS = [
  { value: 'diesel', label: 'Πετρέλαιο' },
  { value: 'petrol', label: 'Βενζίνη' },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-5 p-6">
      <h2 className="text-[13px] font-bold tracking-[0.08em] text-muted uppercase">{title}</h2>
      {children}
    </Card>
  );
}

export function UiKit() {
  const [fuel, setFuel] = useState<'diesel' | 'petrol'>();
  const [vin, setVin] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fakeDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setConfirmOpen(false);
    }, 1200);
  };

  return (
    <PageContainer>
      <PageHeader
        title="UI kit"
        description="Τα κοινά components της εφαρμογής. Μόνο σε development."
        breadcrumbs={[
          { href: '/vehicles', label: 'Οχήματα' },
          { href: '/ui-kit', label: 'Volkswagen Golf · ΙΚΥ 4521' },
        ]}
        actions={
          <>
            <ButtonLink href="/vehicles" variant="secondary">
              <Pencil size={16} aria-hidden="true" />
              Επεξεργασία
            </ButtonLink>
            <ButtonLink href="/vehicles">
              <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
              Νέα επισκευή
            </ButtonLink>
          </>
        }
      />

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Αποθήκευση οχήματος</Button>
          <Button variant="secondary">Ακύρωση</Button>
          <Button variant="danger">Διαγραφή</Button>
          <Button variant="danger-outline">
            <Trash2 size={16} aria-hidden="true" />
            Διαγραφή οχήματος
          </Button>
          <Button pending>Αποθήκευση…</Button>
          <Button disabled>Απενεργοποιημένο</Button>
        </div>
        <div className="flex max-w-[400px] flex-col">
          <Button size="lg">Σύνδεση</Button>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Επεξεργασία επισκευής 14/10/2026">
            <Pencil size={18} aria-hidden="true" />
          </IconButton>
          <IconButton label="Διαγραφή επισκευής 14/10/2026" tone="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={18} aria-hidden="true" />
          </IconButton>
        </div>
      </Section>

      <Section title="Badges, highlight, links">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="solid">Πετρέλαιο</Badge>
          <Badge tone="soft">Βενζίνη</Badge>
        </div>
        <p className="text-[15px]">
          Αναζήτηση «παπαδ ικυ»: <Highlight text="Γιώργος Παπαδόπουλος" ranges={[[8, 13]]} /> ·{' '}
          <Highlight
            text="ΙΚΥ 4521"
            ranges={[
              [0, 3],
              [2, 8],
            ]}
          />
        </p>
        <BackLink href="/vehicles">Οχήματα</BackLink>
      </Section>

      <FormCard
        onSubmit={(e) => e.preventDefault()}
        header={<span className="text-[15px] font-semibold">FormCard με header</span>}
        footer={
          <>
            <ButtonLink href="/vehicles" variant="secondary">
              Ακύρωση
            </ButtonLink>
            <Button type="submit">Αποθήκευση οχήματος</Button>
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
              maxLength={17}
              placeholder="π.χ. WVWZZZ1KZ6W123456"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase().replace(/\s/g, ''))}
              hint={`${vin.length} / 17 χαρακτήρες`}
              className="flex-[2_1_320px]"
            />
            <TextField
              label="Πινακίδα"
              name="plate"
              required
              mono
              placeholder="π.χ. ΙΚΥ 4521"
              error="Υπάρχει ήδη όχημα με αυτή την πινακίδα."
              defaultValue="ΙΚΥ 4521"
              className="flex-[1_1_200px]"
            />
          </div>
        </FormSection>
        <FormSection title="Μοντέλο & μηχανή">
          <div className="flex flex-wrap gap-[18px]">
            <TextField
              label="Χιλιόμετρα"
              name="mileage"
              optional
              inputMode="numeric"
              placeholder="π.χ. 124500"
              className="flex-[1_1_200px]"
            />
            <SegmentedControl
              label="Τύπος καυσίμου"
              name="fuel"
              required
              options={FUEL_OPTIONS}
              value={fuel}
              onChange={setFuel}
              className="flex-[1_1_240px]"
            />
          </div>
        </FormSection>
      </FormCard>

      <EmptyState
        icon={<Search size={24} />}
        title="Δεν βρέθηκαν οχήματα για «octavia»"
        description="Δοκιμάστε άλλη μάρκα, μοντέλο, πινακίδα ή ιδιοκτήτη."
        action={<Button variant="secondary">Καθαρισμός αναζήτησης</Button>}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Διαγραφή επισκευής;"
        confirmLabel="Διαγραφή"
        onConfirm={fakeDelete}
        pending={deleting}
      >
        Η επισκευή της 14/10/2026 θα διαγραφεί οριστικά. Η ενέργεια δεν αναιρείται.
      </ConfirmDialog>
    </PageContainer>
  );
}
