"use client";
import Link from 'next/link';
import { Plus, CreditCard } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-800">Billing & Invoices</h2>
        <Link
          href="/billing/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Bill
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <div className="px-6 py-12 text-center text-gray-500">
          <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p>No bills found yet.</p>
          <p className="text-sm mt-2">
            <Link href="/billing/new" className="text-blue-600 hover:text-blue-800 font-medium">
              Create your first bill →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
