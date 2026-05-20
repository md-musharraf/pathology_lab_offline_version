import { AppLayout } from '@/components/AppLayout';

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout title="Results">{children}</AppLayout>;
}
