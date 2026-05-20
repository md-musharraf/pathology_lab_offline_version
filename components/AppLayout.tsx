import { Sidebar } from '@/components/Sidebar';

export function AppLayout({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="text-xl font-semibold text-slate-800">{title}</div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">Admin User</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
