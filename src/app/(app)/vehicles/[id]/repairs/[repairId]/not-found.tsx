import { NotFoundState } from '@/components/layout/NotFoundState';
import { PageContainer } from '@/components/layout/PageContainer';

export default function RepairNotFound() {
  return (
    <PageContainer width="narrow" className="sm:pt-10">
      <NotFoundState
        title="Η επισκευή δεν βρέθηκε"
        description="Ο σύνδεσμος μπορεί να είναι λάθος ή η επισκευή να έχει διαγραφεί."
      />
    </PageContainer>
  );
}
