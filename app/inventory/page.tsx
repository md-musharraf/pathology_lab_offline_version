"use client";
import { useState } from 'react';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';

const MOCK_INVENTORY = [
  { id: 1, name: 'EDTA Tubes (3ml)', category: 'Consumables', unit: 'pcs', currentStock: 450, minStock: 100, expiryDate: '2025-12-31', isLow: false },
  { id: 2, name: 'Plain Tubes (5ml)', category: 'Consumables', unit: 'pcs', currentStock: 80, minStock: 100, expiryDate: '2025-11-30', isLow: true },
  { id: 3, name: 'Fluoride Tubes', category: 'Consumables', unit: 'pcs', currentStock: 200, minStock: 50, expiryDate: '2025-10-15', isLow: false },
  { id: 4, name: 'Reagent - CBC', category: 'Reagents', unit: 'liters', currentStock: 5, minStock: 2, expiryDate: '2025-06-30', isLow: false },
  { id: 5, name: 'Reagent - LFT Kit', category: 'Reagents', unit: 'kits', currentStock: 1, minStock: 3, expiryDate: '2025-08-15', isLow: true },
  { id: 6, name: 'Gloves (Latex)', category: 'Safety', unit: 'boxes', currentStock: 25, minStock: 10, expiryDate: '2026-03-01', isLow: false },
  { id: 7, name: 'Alcohol Swabs', category: 'Consumables', unit: 'packs', currentStock: 15, minStock: 20, expiryDate: '2026-01-15', isLow: true },
  { id: 8, name: 'Printer Paper A4', category: 'Stationery', unit: 'reams', currentStock: 8, minStock: 5, expiryDate: null, isLow: false },
];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const lowStockCount = MOCK_INVENTORY.filter(i => i.isLow).length;
  const filtered = MOCK_INVENTORY.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" />
          <p className="text-sm text-amber-800"><span className="font-bold">{lowStockCount} items</span> are below minimum stock level and need restocking.</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Item
        </button>
      </div>

      <div className="bg-white shadow rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><Package className="h-10 w-10 mx-auto text-gray-300 mb-3" /><p>No items found.</p></td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 ${item.isLow ? 'bg-red-50' : ''}`}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                <td className="px-6 py-4 text-sm text-center font-semibold">{item.currentStock} {item.unit}</td>
                <td className="px-6 py-4 text-sm text-center text-gray-500">{item.minStock} {item.unit}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.expiryDate || '—'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isLow ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {item.isLow ? 'Low Stock' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
