import { AppLayout } from '@/components/AppLayout';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout title="Settings">{children}</AppLayout>;
}
