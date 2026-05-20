"use client";
import { useState } from 'react';
import { Save, Building2, Phone, Mail, Globe, FileText, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [labName, setLabName] = useState('Offline Lab LIS');
  const [address, setAddress] = useState('123 Main Street, City, State - 400001');
  const [mobile, setMobile] = useState('9876543210');
  const [email, setEmail] = useState('info@offlinelab.com');
  const [website, setWebsite] = useState('www.offlinelab.com');
  const [gstNumber, setGstNumber] = useState('22AAAAA0000A1Z5');
  const [registrationNo, setRegistrationNo] = useState('LAB-REG-2024-001');
  const [doctorName, setDoctorName] = useState('Dr. Admin');
  const [reportFooter, setReportFooter] = useState('This is a computer-generated report. All results are subject to clinical correlation.');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Lab Info */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-blue-600" /> Lab Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
            <input type="text" value={labName} onChange={e => setLabName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration No</label>
            <input type="text" value={registrationNo} onChange={e => setRegistrationNo(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Phone className="h-3.5 w-3.5 mr-1" /> Mobile</label>
            <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Mail className="h-3.5 w-3.5 mr-1" /> Email</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Globe className="h-3.5 w-3.5 mr-1" /> Website</label>
            <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Shield className="h-3.5 w-3.5 mr-1" /> GST Number</label>
            <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Report Settings */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" /> Report Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pathologist Name</label>
            <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Footer Text</label>
            <textarea value={reportFooter} onChange={e => setReportFooter(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="inline-flex items-center px-6 py-2.5 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Save className="-ml-1 mr-2 h-5 w-5" />
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
