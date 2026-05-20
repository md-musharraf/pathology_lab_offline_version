"use client";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Edit2, FlaskConical, Save, X, Loader2, IndianRupee, Clock, HelpCircle } from 'lucide-react';
import { db } from '@/lib/db';

const testSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").regex(/^[A-Z0-9_-]+$/, "Alphanumeric uppercase, underscores, dashes only").toUpperCase(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortName: z.string().optional().or(z.literal("")),
  categoryId: z.coerce.number().min(1, "Please select a category"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  duration: z.coerce.number().min(0, "TAT duration cannot be negative"),
  sampleType: z.string().min(1, "Sample Type is required"),
  container: z.string().optional().or(z.literal("")),
  volume: z.string().optional().or(z.literal("")),
  instructions: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type TestFormValues = z.infer<typeof testSchema>;

export default function TestsCatalogPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'parameters'>('info');
  
  // Custom test parameters list
  const [testParameters, setTestParameters] = useState<any[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      price: 0,
      duration: 2,
      isActive: true,
    }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const testData = await db.query('test', 'findMany', {
        orderBy: { code: 'asc' },
        include: { category: true }
      });
      setTests(testData || []);

      const catData = await db.query('testCategory', 'findMany', {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      setCategories(catData || []);
    } catch (err) {
      console.error('Failed to load tests catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTest(null);
    setTestParameters([]);
    reset({
      code: '',
      name: '',
      shortName: '',
      categoryId: categories[0]?.id || 0,
      price: 0,
      duration: 2,
      sampleType: 'Whole Blood',
      container: '',
      volume: '',
      instructions: '',
      isActive: true,
    });
    setActiveTab('info');
    setShowModal(true);
  };

  const handleOpenEditModal = async (test: any) => {
    setEditingTest(test);
    reset({
      code: test.code,
      name: test.name,
      shortName: test.shortName || '',
      categoryId: test.categoryId,
      price: test.price,
      duration: test.duration,
      sampleType: test.sampleType,
      container: test.container || '',
      volume: test.volume || '',
      instructions: test.instructions || '',
      isActive: test.isActive,
    });
    
    // Load parameters from DB
    try {
      const params = await db.query('testParameter', 'findMany', {
        where: { testId: test.id },
        include: { refRanges: true }
      });
      
      const formattedParams = (params || []).map((p: any) => {
        const maleRange = p.refRanges?.find((r: any) => r.gender === 'MALE');
        const femaleRange = p.refRanges?.find((r: any) => r.gender === 'FEMALE');
        const bothRange = p.refRanges?.find((r: any) => r.gender === null);
        
        return {
          id: p.id,
          name: p.name,
          unit: p.unit || '',
          type: p.type || 'NUMERIC',
          sortOrder: p.sortOrder || 0,
          genderDependency: maleRange || femaleRange ? 'SPECIFIC' : 'BOTH',
          bothMin: bothRange?.normalMin ?? '',
          bothMax: bothRange?.normalMax ?? '',
          maleMin: maleRange?.normalMin ?? '',
          maleMax: maleRange?.normalMax ?? '',
          femaleMin: femaleRange?.normalMin ?? '',
          femaleMax: femaleRange?.normalMax ?? '',
        };
      });
      setTestParameters(formattedParams);
    } catch (err) {
      console.error("Failed to load parameters:", err);
      setTestParameters([]);
    }
    
    setActiveTab('info');
    setShowModal(true);
  };

  const addParameterRow = () => {
    setTestParameters(prev => [
      ...prev,
      {
        id: null,
        name: '',
        unit: '',
        type: 'NUMERIC',
        genderDependency: 'BOTH',
        bothMin: '',
        bothMax: '',
        maleMin: '',
        maleMax: '',
        femaleMin: '',
        femaleMax: '',
      }
    ]);
  };

  const updateParameterRow = (index: number, fields: Partial<any>) => {
    setTestParameters(prev => prev.map((p, idx) => idx === index ? { ...p, ...fields } : p));
  };

  const removeParameterRow = (index: number) => {
    setTestParameters(prev => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data: TestFormValues) => {
    setIsSaving(true);
    try {
      let testId = editingTest?.id;
      if (editingTest) {
        // Update Test
        await db.query('test', 'update', {
          where: { id: editingTest.id },
          data: {
            code: data.code.toUpperCase(),
            name: data.name,
            shortName: data.shortName || null,
            categoryId: data.categoryId,
            price: data.price,
            duration: data.duration,
            sampleType: data.sampleType,
            container: data.container || null,
            volume: data.volume || null,
            instructions: data.instructions || null,
            isActive: data.isActive,
          }
        });
      } else {
        // Create Test (Verify unique code)
        const existing = tests.find(t => t.code.toUpperCase() === data.code.toUpperCase());
        if (existing) {
          alert(`Test with code "${data.code.toUpperCase()}" already exists!`);
          setIsSaving(false);
          return;
        }

        const newTest = await db.query('test', 'create', {
          data: {
            code: data.code.toUpperCase(),
            name: data.name,
            shortName: data.shortName || null,
            categoryId: data.categoryId,
            price: data.price,
            duration: data.duration,
            sampleType: data.sampleType,
            container: data.container || null,
            volume: data.volume || null,
            instructions: data.instructions || null,
            isActive: data.isActive,
          }
        });
        testId = newTest.id;
      }

      // Parameters Save Logic
      const dbParams = editingTest 
        ? await db.query('testParameter', 'findMany', { where: { testId } }) 
        : [];

      // Find params to delete (in DB but not in state)
      const stateIds = testParameters.filter(p => p.id).map(p => p.id);
      const paramsToDelete = dbParams.filter((p: any) => !stateIds.includes(p.id));
      
      for (const p of paramsToDelete) {
        await db.query('referenceRange', 'deleteMany', { where: { parameterId: p.id } });
        await db.query('testParameter', 'delete', { where: { id: p.id } });
      }

      // Create / Update parameters in state
      for (let index = 0; index < testParameters.length; index++) {
        const p = testParameters[index];
        const paramData = {
          testId,
          name: p.name,
          unit: p.unit || null,
          sortOrder: index + 1,
          type: p.type,
          isHeader: false,
        };

        let paramId = p.id;
        if (p.id) {
          await db.query('testParameter', 'update', {
            where: { id: p.id },
            data: paramData,
          });
          await db.query('referenceRange', 'deleteMany', { where: { parameterId: p.id } });
        } else {
          const newParam = await db.query('testParameter', 'create', {
            data: paramData,
          });
          paramId = newParam.id;
        }

        // Add Reference Ranges
        if (p.type === 'NUMERIC') {
          if (p.genderDependency === 'BOTH') {
            await db.query('referenceRange', 'create', {
              data: {
                parameterId: paramId,
                gender: null,
                normalMin: p.bothMin !== '' ? Number(p.bothMin) : null,
                normalMax: p.bothMax !== '' ? Number(p.bothMax) : null,
              }
            });
          } else {
            // Male
            await db.query('referenceRange', 'create', {
              data: {
                parameterId: paramId,
                gender: 'MALE',
                normalMin: p.maleMin !== '' ? Number(p.maleMin) : null,
                normalMax: p.maleMax !== '' ? Number(p.maleMax) : null,
              }
            });
            // Female
            await db.query('referenceRange', 'create', {
              data: {
                parameterId: paramId,
                gender: 'FEMALE',
                normalMin: p.femaleMin !== '' ? Number(p.femaleMin) : null,
                normalMax: p.femaleMax !== '' ? Number(p.femaleMax) : null,
              }
            });
          }
        }
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to save test catalog entry:', err);
      alert('Failed to save test or parameters. Check database connections.');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = tests.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.sampleType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
            placeholder="Search by code, name, category, or sample..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Test
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sample / Container</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">TAT (Turnaround)</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <FlaskConical className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium text-gray-500">No tests found in catalog.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">{t.code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div>{t.name}</div>
                      {t.shortName && <div className="text-xs text-gray-400 font-normal">{t.shortName}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border">
                        {t.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{t.sampleType}</div>
                      {t.container && <div className="text-xs text-gray-400 font-normal">{t.container} {t.volume && `(${t.volume})`}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">
                      ₹{t.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{t.duration} hrs</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Test Parameters & Reference Ranges"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingTest ? 'Edit Test Catalog Entry' : 'Add New Test to Catalog'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingTest ? `Modifying test code: ${editingTest.code}` : 'Register a manual test and define parameters.'}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-6 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Test Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('parameters')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  activeTab === 'parameters'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Parameters ({testParameters.length})
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              <div className="flex-1 overflow-y-auto p-6">
                
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Code */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Test Code *</label>
                        <input 
                          {...register("code")} 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white uppercase font-mono"
                          placeholder="e.g. CBC001"
                          disabled={!!editingTest}
                        />
                        {errors.code && <p className="mt-1 text-xs text-red-600 font-medium">{errors.code.message}</p>}
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Test Name *</label>
                        <input 
                          {...register("name")} 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                          placeholder="e.g. Complete Blood Count"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Short Name */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Short Name</label>
                        <input 
                          {...register("shortName")} 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                          placeholder="e.g. CBC"
                        />
                      </div>

                      {/* Category Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Category *</label>
                        <select 
                          {...register("categoryId")}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {errors.categoryId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.categoryId.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Price */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Price (INR ₹) *</label>
                        <input 
                          type="number"
                          step="0.01"
                          {...register("price")} 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white font-semibold text-blue-700"
                          placeholder="0.00"
                        />
                        {errors.price && <p className="mt-1 text-xs text-red-600 font-medium">{errors.price.message}</p>}
                      </div>

                      {/* Duration TAT */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Turnaround Time (Hours) *</label>
                        <input 
                          type="number"
                          {...register("duration")} 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                          placeholder="2"
                        />
                        {errors.duration && <p className="mt-1 text-xs text-red-600 font-medium">{errors.duration.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Sample Type */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Sample Type *</label>
                        <select 
                          {...register("sampleType")}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                        >
                          <option value="Whole Blood">Whole Blood</option>
                          <option value="Serum">Serum</option>
                          <option value="Plasma">Plasma</option>
                          <option value="Urine">Urine</option>
                          <option value="Stool">Stool</option>
                          <option value="Sputum">Sputum</option>
                          <option value="Swab">Swab</option>
                          <option value="CSF">CSF (Cerebrospinal Fluid)</option>
                          <option value="Semen">Semen</option>
                        </select>
                        {errors.sampleType && <p className="mt-1 text-xs text-red-600 font-medium">{errors.sampleType.message}</p>}
                      </div>

                      {/* Container */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Tube / Container</label>
                        <input 
                          {...register("container")} 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                          placeholder="e.g. EDTA, Plain Tube, Urine Container"
                        />
                      </div>

                      {/* Volume */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Sample Volume</label>
                        <input 
                          {...register("volume")} 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                          placeholder="e.g. 3ml, 5ml, 20ml"
                        />
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Patient Pre-test Instructions</label>
                      <textarea 
                        {...register("instructions")} 
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                        placeholder="e.g. 10-12 hours fasting required overnight..."
                      />
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center pt-2">
                      <input
                        id="isActive"
                        type="checkbox"
                        {...register("isActive")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm font-semibold text-slate-700">
                        Mark as Active in Catalog
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'parameters' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Parameters and Reference Ranges</h4>
                        <p className="text-xs text-slate-500">Add parameter fields and range bounds for results interpretation.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addParameterRow}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Parameter
                      </button>
                    </div>

                    {testParameters.length === 0 ? (
                      <div className="py-16 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400 bg-white">
                        <FlaskConical className="h-8 w-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                        <p className="text-sm font-semibold text-slate-500">No parameters defined yet.</p>
                        <p className="text-xs mt-1 text-slate-400">Add parameters so values can be entered on the results page.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pr-1">
                        {testParameters.map((param, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-white shadow-sm space-y-3 relative hover:border-slate-300 transition-colors">
                            <button
                              type="button"
                              onClick={() => removeParameterRow(index)}
                              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Remove Parameter"
                            >
                              <X className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                              {/* Parameter Name */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-600">Parameter Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={param.name}
                                  onChange={(e) => updateParameterRow(index, { name: e.target.value })}
                                  placeholder="e.g. Hemoglobin"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs border p-2 bg-white"
                                />
                              </div>

                              {/* Unit */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-600">Unit</label>
                                <input
                                  type="text"
                                  value={param.unit}
                                  onChange={(e) => updateParameterRow(index, { unit: e.target.value })}
                                  placeholder="e.g. g/dL, %"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs border p-2 bg-white"
                                />
                              </div>

                              {/* Type */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-600">Type</label>
                                <select
                                  value={param.type}
                                  onChange={(e) => updateParameterRow(index, { type: e.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs border p-2 bg-white"
                                >
                                  <option value="NUMERIC">Numeric</option>
                                  <option value="TEXT">Text</option>
                                  <option value="DROPDOWN">Dropdown</option>
                                </select>
                              </div>
                            </div>

                            {/* Reference Ranges Section */}
                            {param.type === 'NUMERIC' && (
                              <div className="bg-slate-50/50 p-3 rounded border space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">Reference Ranges</span>
                                  <select
                                    value={param.genderDependency}
                                    onChange={(e) => updateParameterRow(index, { genderDependency: e.target.value })}
                                    className="text-xs rounded border border-slate-300 bg-white p-1 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-600"
                                  >
                                    <option value="BOTH">Same for Both Genders</option>
                                    <option value="SPECIFIC">Gender Specific (Male / Female)</option>
                                  </select>
                                </div>

                                {param.genderDependency === 'BOTH' ? (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-500">Normal Min</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={param.bothMin}
                                        onChange={(e) => updateParameterRow(index, { bothMin: e.target.value })}
                                        placeholder="Min"
                                        className="mt-1 block w-full rounded border-slate-300 text-xs p-1.5 bg-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-500">Normal Max</label>
                                      <input
                                        type="number"
                                        step="any"
                                        value={param.bothMax}
                                        onChange={(e) => updateParameterRow(index, { bothMax: e.target.value })}
                                        placeholder="Max"
                                        className="mt-1 block w-full rounded border-slate-300 text-xs p-1.5 bg-white"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-4 divide-x divide-slate-200">
                                    {/* Male Ranges */}
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-bold text-blue-700 block">Male Range</span>
                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                          type="number"
                                          step="any"
                                          value={param.maleMin}
                                          onChange={(e) => updateParameterRow(index, { maleMin: e.target.value })}
                                          placeholder="Min"
                                          className="rounded border-slate-300 text-xs p-1.5 bg-white"
                                        />
                                        <input
                                          type="number"
                                          step="any"
                                          value={param.maleMax}
                                          onChange={(e) => updateParameterRow(index, { maleMax: e.target.value })}
                                          placeholder="Max"
                                          className="rounded border-slate-300 text-xs p-1.5 bg-white"
                                        />
                                      </div>
                                    </div>

                                    {/* Female Ranges */}
                                    <div className="space-y-1.5 pl-4">
                                      <span className="text-[10px] font-bold text-pink-700 block">Female Range</span>
                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                          type="number"
                                          step="any"
                                          value={param.femaleMin}
                                          onChange={(e) => updateParameterRow(index, { femaleMin: e.target.value })}
                                          placeholder="Min"
                                          className="rounded border-slate-300 text-xs p-1.5 bg-white"
                                        />
                                        <input
                                          type="number"
                                          step="any"
                                          value={param.femaleMax}
                                          onChange={(e) => updateParameterRow(index, { femaleMax: e.target.value })}
                                          placeholder="Max"
                                          className="rounded border-slate-300 text-xs p-1.5 bg-white"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" /> Save Catalog Entry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
