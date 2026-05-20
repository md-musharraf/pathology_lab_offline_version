import { AppLayout } from '@/components/AppLayout';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout title="Billing">{children}</AppLayout>;
}
