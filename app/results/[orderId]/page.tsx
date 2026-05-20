"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { interpretResult } from '@/lib/result-interpreter';

import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResultEntryPage() {
  const params = useParams();
  const orderId = Number(params.orderId);
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state maps parameterId to { value, status, isCritical, ... }
  const [results, setResults] = useState<Record<number, any>>({});

  useEffect(() => {
    async function loadOrder() {
      try {
        const orderData = await db.query('testOrder', 'findUnique', {
          where: { id: orderId },
          include: {
            patient: true,
            items: {
              include: {
                test: {
                  include: {
                    parameters: {
                      include: { refRanges: true }
                    }
                  }
                },
                results: true
              }
            }
          }
        });
        
        if (orderData) {
          setOrder(orderData);
          setItems(orderData.items);
          
          // Initialize state with existing results
          const initialResults: Record<number, any> = {};
          orderData.items.forEach((item: any) => {
            item.results?.forEach((r: any) => {
              initialResults[r.parameterId] = {
                value: r.textValue || (r.numericValue !== null ? String(r.numericValue) : ''),
                statusObj: {
                  status: r.status,
                  flag: r.flag,
                  isCritical: r.isCritical,
                  isAbnormal: r.isAbnormal
                }
              };
            });
          });
          setResults(initialResults);
        }
      } catch (error) {
        console.error("Failed to load order", error);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) loadOrder();
  }, [orderId]);

  const handleInputChange = (parameter: any, value: string) => {
    const ageInDays = order.patient.ageUnit === 'YEARS' ? order.patient.age * 365 : 
                      order.patient.ageUnit === 'MONTHS' ? order.patient.age * 30 : order.patient.age;
    
    // Find matching ref range
    const range = parameter.refRanges?.find((r: any) => 
      (r.gender === null || r.gender === order.patient.gender) &&
      (r.ageMin === null || ageInDays >= r.ageMin) &&
      (r.ageMax === null || ageInDays <= r.ageMax)
    );

    const interpretation = interpretResult(value, range || null, ageInDays, order.patient.gender);
    
    setResults(prev => ({
      ...prev,
      [parameter.id]: {
        value,
        statusObj: interpretation
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Loop through items and parameters, save results
      for (const item of items) {
        for (const param of item.test.parameters) {
          if (param.isHeader) continue;
          
          const resultEntry = results[param.id];
          if (!resultEntry || resultEntry.value === '') continue; // Skip empty
          
          const isNumeric = param.type === 'NUMERIC' || param.type === 'CALCULATED';
          const numericValue = isNumeric && !isNaN(Number(resultEntry.value)) ? Number(resultEntry.value) : null;
          const textValue = !isNumeric ? resultEntry.value : null;

          // Check if result already exists
          const existingResult = item.results?.find((r: any) => r.parameterId === param.id);

          if (existingResult) {
            await db.query('testResult', 'update', {
              where: { id: existingResult.id },
              data: {
                numericValue,
                textValue,
                status: resultEntry.statusObj.status,
                flag: resultEntry.statusObj.flag,
                isCritical: resultEntry.statusObj.isCritical,
                isAbnormal: resultEntry.statusObj.isAbnormal
              }
            });
          } else {
            await db.query('testResult', 'create', {
              data: {
                orderItemId: item.id,
                parameterId: param.id,
                numericValue,
                textValue,
                status: resultEntry.statusObj.status,
                flag: resultEntry.statusObj.flag,
                isCritical: resultEntry.statusObj.isCritical,
                isAbnormal: resultEntry.statusObj.isAbnormal,
                enteredBy: 1
              }
            });
          }
        }
        
        // Update item status
        await db.query('testOrderItem', 'update', {
          where: { id: item.id },
          data: { status: 'RESULT_ENTERED' }
        });
      }
      
      // Update order status
      await db.query('testOrder', 'update', {
        where: { id: order.id },
        data: { status: 'RESULT_ENTERED' }
      });

      alert("Results saved successfully!");
      router.push('/dashboard'); // or to verify page
    } catch (error) {
      console.error(error);
      alert("Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-6 text-red-500">Order not found.</div>;

  // Check if any results are critical to show a banner
  const hasCritical = Object.values(results).some(r => r.statusObj?.isCritical);

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 bg-white border rounded-md hover:bg-slate-50">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Result Entry: {order.orderNo}</h2>
              <p className="text-sm text-slate-500">{order.patient.name} ({order.patient.gender}, {order.patient.age} {order.patient.ageUnit})</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="-ml-1 mr-2 h-5 w-5" />
            {saving ? 'Saving...' : 'Save Results'}
          </button>
        </div>

        {hasCritical && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center animate-pulse">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <p className="text-red-800 font-medium text-sm">Critical values detected! Please verify carefully before saving.</p>
          </div>
        )}

        {/* Tests List */}
        <div className="space-y-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-slate-800">{item.test.name}</h3>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Parameter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Reference Range</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {item.test.parameters.sort((a:any, b:any) => a.sortOrder - b.sortOrder).map((param: any) => {
                    
                    if (param.isHeader) {
                      return (
                        <tr key={param.id} className="bg-gray-100">
                          <td colSpan={4} className="px-6 py-2 text-sm font-bold text-gray-700">{param.name}</td>
                        </tr>
                      );
                    }

                    const resultEntry = results[param.id] || { value: '' };
                    const statusObj = resultEntry.statusObj || {};
                    const isAbnormal = statusObj.isAbnormal;
                    const isCritical = statusObj.isCritical;
                    
                    // Simple logic to find range for display
                    const ageInDays = order.patient.ageUnit === 'YEARS' ? order.patient.age * 365 : 
                                      order.patient.ageUnit === 'MONTHS' ? order.patient.age * 30 : order.patient.age;
                    const range = param.refRanges?.find((r: any) => 
                      (r.gender === null || r.gender === order.patient.gender) &&
                      (r.ageMin === null || ageInDays >= r.ageMin) &&
                      (r.ageMax === null || ageInDays <= r.ageMax)
                    );
                    const displayRange = param.type === 'NUMERIC' 
                      ? (range ? `${range.normalMin} - ${range.normalMax}` : '')
                      : (range ? range.textNormal : '');

                    return (
                      <tr key={param.id} className={isCritical ? 'bg-red-50' : isAbnormal ? 'bg-orange-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {param.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {param.type === 'DROPDOWN' ? (
                              <select 
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                value={resultEntry.value}
                                onChange={(e) => handleInputChange(param, e.target.value)}
                              >
                                <option value="">Select...</option>
                                {param.options?.split(',').map((opt: string) => (
                                  <option key={opt} value={opt.trim()}>{opt.trim()}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                className={`block w-full rounded-md shadow-sm sm:text-sm border p-2 focus:ring-blue-500 focus:border-blue-500
                                  ${isCritical ? 'border-red-500 text-red-900 font-bold' : isAbnormal ? 'border-orange-500 text-orange-900 font-bold' : 'border-gray-300'}
                                `}
                                value={resultEntry.value}
                                onChange={(e) => handleInputChange(param, e.target.value)}
                              />
                            )}
                            
                            {statusObj.label && statusObj.label !== 'PENDING' && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusObj.bgColorClass} ${statusObj.colorClass}`}>
                                {statusObj.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {param.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {displayRange}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
