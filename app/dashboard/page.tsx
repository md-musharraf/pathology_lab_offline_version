"use client";
import { Users, FileText, IndianRupee, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm flex items-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 rounded-full text-blue-700">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500">Patients Today</p>
            <p className="text-2xl font-semibold text-slate-900">45</p>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm flex items-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-100 rounded-full text-orange-700">
            <FileText className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500">Pending Results</p>
            <p className="text-2xl font-semibold text-slate-900">12</p>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm flex items-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 rounded-full text-green-700">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500">Revenue Today</p>
            <p className="text-2xl font-semibold text-slate-900">₹ 24,500</p>
          </div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm flex items-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-200 rounded-full text-red-800 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-red-800">Critical Cases</p>
            <p className="text-2xl font-semibold text-red-900">3</p>
          </div>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Daily Pipeline</h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col items-center">
            <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-medium">45</span>
            <span className="mt-2 text-slate-500">Registered</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
          <div className="flex flex-col items-center">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">42</span>
            <span className="mt-2 text-slate-500">Collected</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
          <div className="flex flex-col items-center">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">12</span>
            <span className="mt-2 text-slate-500">Processing</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
          <div className="flex flex-col items-center">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">28</span>
            <span className="mt-2 text-slate-500">Approved</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
          <div className="flex flex-col items-center">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">20</span>
            <span className="mt-2 text-slate-500">Delivered</span>
          </div>
        </div>
      </div>

      {/* Recent Patients Table Placeholder */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Recent Patients</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">LAB-2024-00001</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Doe (45/M)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">CBC, LFT</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Approved
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
