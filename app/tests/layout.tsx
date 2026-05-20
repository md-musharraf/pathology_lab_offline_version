import { AppLayout } from '@/components/AppLayout';

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout title="Tests Catalog">{children}</AppLayout>;
}
