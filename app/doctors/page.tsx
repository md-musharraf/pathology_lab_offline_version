"use client";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Edit2, Phone, Mail, Stethoscope, Save, X, Loader2, Award, Building } from 'lucide-react';
import { db } from '@/lib/db';

const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  qualification: z.string().optional().or(z.literal("")),
  hospital: z.string().optional().or(z.literal("")),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be a 10-digit number").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  commission: z.coerce.number().min(0, "Commission cannot be negative").max(100, "Commission cannot exceed 100%"),
  isActive: z.boolean().default(true),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      commission: 0,
      isActive: true,
    }
  });

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await db.query('doctor', 'findMany', {
        orderBy: { name: 'asc' }
      });
      setDoctors(data || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    reset({
      name: '',
      qualification: '',
      hospital: '',
      mobile: '',
      email: '',
      commission: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (doctor: any) => {
    setEditingDoctor(doctor);
    reset({
      name: doctor.name,
      qualification: doctor.qualification || '',
      hospital: doctor.hospital || '',
      mobile: doctor.mobile || '',
      email: doctor.email || '',
      commission: doctor.commission,
      isActive: doctor.isActive,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: DoctorFormValues) => {
    setIsSaving(true);
    try {
      if (editingDoctor) {
        // Update
        await db.query('doctor', 'update', {
          where: { id: editingDoctor.id },
          data: {
            name: data.name,
            qualification: data.qualification || null,
            hospital: data.hospital || null,
            mobile: data.mobile || null,
            email: data.email || null,
            commission: data.commission,
            isActive: data.isActive,
          }
        });
      } else {
        // Create
        await db.query('doctor', 'create', {
          data: {
            name: data.name,
            qualification: data.qualification || null,
            hospital: data.hospital || null,
            mobile: data.mobile || null,
            email: data.email || null,
            commission: data.commission,
            isActive: data.isActive,
          }
        });
      }
      setShowModal(false);
      loadDoctors();
    } catch (err) {
      console.error('Failed to save doctor:', err);
      alert('Failed to save doctor. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.hospital?.toLowerCase().includes(search.toLowerCase()) ||
    d.qualification?.toLowerCase().includes(search.toLowerCase()) ||
    d.mobile?.includes(search)
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
            placeholder="Search by name, hospital, qualification, or mobile..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Doctor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-lg border">
              <Stethoscope className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No doctors found.</p>
              <button 
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center px-3.5 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Add Your First Doctor
              </button>
            </div>
          ) : filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-lg border border-teal-100">
                      {doc.name.replace('Dr.', '').trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      {doc.qualification && (
                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                          <Award className="h-3 w-3 mr-1 text-slate-400" /> {doc.qualification}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${doc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {doc.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  {doc.hospital && (
                    <p className="font-medium text-gray-800 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-slate-400" /> {doc.hospital}
                    </p>
                  )}
                  {doc.mobile && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{doc.mobile}</span>
                    </div>
                  )}
                  {doc.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate max-w-[200px]">{doc.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-5">
                <span className="text-xs text-gray-500">
                  Commission: <span className="font-bold text-slate-800">{doc.commission}%</span>
                </span>
                <button 
                  onClick={() => handleOpenEditModal(doc)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit Doctor Details"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDoctor ? 'Edit Doctor Details' : 'Add New Doctor'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Doctor Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Doctor Name *</label>
                <input 
                  {...register("name")} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                  placeholder="e.g. Dr. Jane Smith"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Qualification</label>
                <input 
                  {...register("qualification")} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                  placeholder="e.g. MBBS, MD Pathology"
                />
              </div>

              {/* Hospital / Clinic */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Hospital / Clinic Name</label>
                <input 
                  {...register("hospital")} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                  placeholder="e.g. City General Hospital"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Mobile Number</label>
                  <input 
                    {...register("mobile")} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                    placeholder="e.g. 9876543210"
                  />
                  {errors.mobile && <p className="mt-1 text-xs text-red-600 font-medium">{errors.mobile.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                  <input 
                    {...register("email")} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                    placeholder="e.g. doctor@hospital.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Commission */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Referral Commission (%)</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register("commission")} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2 bg-white"
                    placeholder="0"
                  />
                  {errors.commission && <p className="mt-1 text-xs text-red-600 font-medium">{errors.commission.message}</p>}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center mt-5">
                  <input
                    id="isActive"
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm font-semibold text-slate-700">
                    Mark as Active
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-5 border-t border-slate-200 flex justify-end gap-3">
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
                      <Save className="-ml-1 mr-2 h-4 w-4" /> Save Doctor
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
