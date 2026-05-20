import { AppLayout } from '@/components/AppLayout';

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout title="Patients">{children}</AppLayout>;
}
