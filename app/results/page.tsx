"use client";
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { FlaskConical, Search } from 'lucide-react';

export default function ResultsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await db.query('testOrder', 'findMany', {
          orderBy: { createdAt: 'desc' },
          include: { patient: true },
          take: 50
        });
        setOrders(data || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o =>
    o.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
    o.patient?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by order number or patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FlaskConical className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p>No test orders found.</p>
            <p className="text-sm mt-2">Register patients and create billing orders to see them here.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.orderNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.patient?.name || 'N/A'}
                    <span className="text-gray-500 ml-2 text-xs">
                      ({order.patient?.gender}, {order.patient?.age} {order.patient?.ageUnit})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'RESULT_ENTERED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/results/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Enter Results →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
