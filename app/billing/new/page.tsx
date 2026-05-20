"use client";
import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { ArrowLeft, Search, Plus, Trash2, Receipt } from 'lucide-react';
import Link from 'next/link';


function NewBillingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPatientId = searchParams?.get('patientId');

  const [patient, setPatient] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Billing States
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENT'>('FLAT');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (initialPatientId) {
        const p = await db.query('patient', 'findUnique', { where: { id: initialPatientId } });
        setPatient(p);
      }
      const t = await db.query('test', 'findMany', { where: { isActive: true }, include: { category: true } });
      setTests(t || []);
    }
    loadData();
  }, [initialPatientId]);

  const addTest = (test: any) => {
    if (!selectedTests.find(t => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    }
    setSearch('');
  };

  const removeTest = (id: number) => {
    setSelectedTests(selectedTests.filter(t => t.id !== id));
  };

  // Calculations
  const subtotal = useMemo(() => selectedTests.reduce((acc, t) => acc + t.price, 0), [selectedTests]);
  
  const discountAmount = useMemo(() => {
    if (discountType === 'FLAT') return discountValue;
    return (subtotal * discountValue) / 100;
  }, [subtotal, discountType, discountValue]);

  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  const gstAmount = useMemo(() => {
    return (amountAfterDiscount * gstPercent) / 100;
  }, [amountAfterDiscount, gstPercent]);

  const totalAmount = amountAfterDiscount + gstAmount;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  // Auto-set paid amount to total if empty initially
  useEffect(() => {
    setPaidAmount(totalAmount);
  }, [totalAmount]);

  const filteredTests = search 
    ? tests.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSave = async () => {
    if (!patient) return alert("Please select a patient");
    if (selectedTests.length === 0) return alert("Please select at least one test");
    
    setIsSubmitting(true);
    try {
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
      const billCount = await db.query('bill', 'count') as number;
      const billNo = `BILL-${dateStr}-${String(billCount + 1).padStart(4, '0')}`;
      
      const orderCount = await db.query('testOrder', 'count') as number;
      const orderNo = `ORD-${dateStr}-${String(orderCount + 1).padStart(4, '0')}`;

      // 1. Create Bill
      const bill = await db.query('bill', 'create', {
        data: {
          billNo,
          patientId: patient.id,
          subtotal,
          discountType,
          discountValue,
          discountAmount,
          gstPercent,
          gstAmount,
          totalAmount,
          paidAmount,
          dueAmount,
          paymentMethod,
          paymentStatus: dueAmount <= 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'UNPAID')
        }
      });

      // 2. Create Payment if paid
      if (paidAmount > 0) {
        await db.query('payment', 'create', {
          data: {
            billId: bill.id,
            amount: paidAmount,
            method: paymentMethod,
            receivedBy: 1 // admin
          }
        });
      }

      // 3. Create Order
      const order = await db.query('testOrder', 'create', {
        data: {
          orderNo,
          patientId: patient.id,
          billId: bill.id,
          priority: 'ROUTINE',
          items: {
            create: selectedTests.map(t => ({
              testId: t.id
            }))
          }
        }
      });

      router.push(`/billing/${bill.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create billing and order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* Left Column - Test Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-medium border-b pb-4 mb-4">Patient Information</h3>
            {patient ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.id} • {patient.age} {patient.ageUnit} • {patient.gender}</p>
                </div>
                {!initialPatientId && (
                  <button onClick={() => setPatient(null)} className="text-red-500 text-sm">Change</button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Please implement patient search here...</p>
            )}
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-medium border-b pb-4 mb-4">Select Tests</h3>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search tests by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && filteredTests.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredTests.map((t) => (
                    <li key={t.id} className="text-gray-900 cursor-pointer hover:bg-blue-50 select-none relative py-2 pl-3 pr-9" onClick={() => addTest(t)}>
                      <div className="flex justify-between">
                        <span className="font-medium">{t.name} <span className="text-gray-400 text-xs ml-2">{t.code}</span></span>
                        <span className="text-blue-600 font-medium">₹{t.price}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedTests.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No tests selected</td></tr>
                ) : (
                  selectedTests.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">₹{t.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button onClick={() => removeTest(t.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Billing Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-medium border-b pb-4 mb-4 flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-slate-500" /> Payment Summary
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-4">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Discount</label>
                <div className="flex space-x-2">
                  <select 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-2 py-1 bg-white"
                  >
                    <option value="FLAT">₹ Flat</option>
                    <option value="PERCENT">% Percent</option>
                  </select>
                  <input 
                    type="number" 
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full text-right" 
                  />
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center mt-2 text-green-600">
                    <span>Discount Applied</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-600">GST ({gstPercent}%)</span>
                <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-blue-700">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="border-t border-b py-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Payment Method</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Paid Amount</label>
                  <input 
                    type="number" 
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-bold text-right text-lg text-green-700 bg-green-50"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center font-medium">
                <span className="text-gray-600">Balance Due</span>
                <span className={dueAmount > 0 ? "text-red-600" : "text-gray-900"}>
                  ₹{dueAmount.toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleSave}
                disabled={isSubmitting || !patient || selectedTests.length === 0}
                className="w-full mt-6 py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 font-bold text-lg"
              >
                {isSubmitting ? 'Processing...' : 'Generate Bill & Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NewBillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 font-medium">Loading Billing System...</div>
      </div>
    }>
      <NewBillingPageContent />
    </Suspense>
  );
}
