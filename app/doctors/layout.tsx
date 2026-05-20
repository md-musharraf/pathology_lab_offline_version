import { AppLayout } from '@/components/AppLayout';

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout title="Doctors">{children}</AppLayout>;
}
