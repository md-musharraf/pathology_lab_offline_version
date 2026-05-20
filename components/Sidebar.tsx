"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  FileText, 
  CreditCard, 
  Settings, 
  Package,
  Stethoscope
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Results Entry', href: '/results', icon: FlaskConical },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Tests Catalog', href: '/tests', icon: FlaskConical },
  { name: 'Doctors', href: '/doctors', icon: Stethoscope },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-800 text-slate-400">
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold text-white tracking-wider">OFFLINE LAB</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-700 text-white" 
                  : "hover:bg-slate-700 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">v1.0.0</div>
      </div>
    </div>
  );
}
