"use client";
import { useEffect, useState } from 'react';
import { FileText, Download, Printer, Search, Calendar, Filter, Eye, CheckCircle, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { generateReportPDF } from '@/lib/report-pdf';
import { db } from '@/lib/db';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-800 border border-orange-200',
  RESULT_ENTERED: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border border-green-200',
  DELIVERED: 'bg-blue-100 text-blue-800 border border-blue-200',
  CANCELLED: 'bg-red-100 text-red-800 border border-red-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending Results',
  RESULT_ENTERED: 'Pending Approval',
  APPROVED: 'Approved',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<any>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await db.query('testOrder', 'findMany', {
        orderBy: { createdAt: 'desc' },
        include: {
          patient: true,
          referredDoctor: true,
          items: {
            include: {
              test: true
            }
          }
        }
      });
      setReports(data || []);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const buildRealReportData = async (orderId: number) => {
    const orderData = await db.query('testOrder', 'findUnique', {
      where: { id: orderId },
      include: {
        patient: true,
        referredDoctor: true,
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

    if (!orderData) throw new Error("Order not found");

    const tests = orderData.items.map((item: any) => {
      const parameters = item.test.parameters
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((param: any) => {
          const res = item.results?.find((r: any) => r.parameterId === param.id);
          const valueStr = res
            ? (res.textValue || (res.numericValue !== null ? String(res.numericValue) : ''))
            : '';
          
          const ageInDays = orderData.patient.ageUnit === 'YEARS' ? orderData.patient.age * 365 : 
                            orderData.patient.ageUnit === 'MONTHS' ? orderData.patient.age * 30 : orderData.patient.age;
          const range = param.refRanges?.find((r: any) => 
            (r.gender === null || r.gender === orderData.patient.gender) &&
            (r.ageMin === null || ageInDays >= r.ageMin) &&
            (r.ageMax === null || ageInDays <= r.ageMax)
          );
          
          const displayRange = param.type === 'NUMERIC' 
            ? (range ? `${range.normalMin} - ${range.normalMax}` : '')
            : (range ? range.textNormal : '');

          return {
            name: param.name,
            value: valueStr,
            unit: param.unit || '',
            refRange: displayRange || '',
            flag: res?.flag || null,
            isHeader: param.isHeader,
          };
        });

      return {
        testName: item.test.name,
        parameters,
      };
    });

    return {
      orderNo: orderData.orderNo,
      patientName: orderData.patient.name,
      patientId: orderData.patient.id,
      age: `${orderData.patient.age} ${orderData.patient.ageUnit.toLowerCase()}`,
      gender: orderData.patient.gender,
      date: new Date(orderData.createdAt).toLocaleDateString(),
      referredBy: orderData.referredDoctor?.name || 'Self',
      tests,
      labName: 'Offline Lab LIS',
      labAddress: '123 Main Street, City, State - 400001',
      labMobile: '9876543210',
      approvedBy: orderData.status === 'APPROVED' || orderData.status === 'DELIVERED' ? 'Dr. Admin, MD (Pathology)' : 'Pending Approval',
    };
  };

  // Generate and download PDF
  const handleDownload = async (report: any) => {
    setLoadingId(report.id);
    try {
      const reportData = await buildRealReportData(report.id);
      const pdfBytes = await generateReportPDF(reportData);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Report_${report.patient?.name?.replace(/\s+/g, '_')}_${report.orderNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF report.');
    } finally {
      setLoadingId(null);
    }
  };

  // Generate and print PDF
  const handlePrint = async (report: any) => {
    setLoadingId(report.id);
    try {
      const reportData = await buildRealReportData(report.id);
      const pdfBytes = await generateReportPDF(reportData);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (err) {
      console.error('Failed to print:', err);
      alert('Failed to print report.');
    } finally {
      setLoadingId(null);
    }
  };

  // Preview PDF in modal
  const handlePreview = async (report: any) => {
    setLoadingId(report.id);
    try {
      const reportData = await buildRealReportData(report.id);
      const pdfBytes = await generateReportPDF(reportData);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewReport(report);
    } catch (err) {
      console.error('Failed to preview:', err);
      alert('Failed to generate preview.');
    } finally {
      setLoadingId(null);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewReport(null);
  };

  // Approve report
  const handleApprove = async (reportId: number) => {
    setLoadingId(reportId);
    try {
      await db.query('testOrder', 'update', {
        where: { id: reportId },
        data: { status: 'APPROVED' }
      });
      await loadReports();
    } catch (err) {
      console.error('Failed to approve report:', err);
      alert('Failed to approve report.');
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = reports.filter(r => {
    const patientName = r.patient?.name || '';
    const orderNo = r.orderNo || '';
    const patientId = r.patient?.id || '';

    const matchesSearch = search === '' ||
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      orderNo.toLowerCase().includes(search.toLowerCase()) ||
      patientId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
            placeholder="Search by patient name, order no, or ID..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Results</option>
            <option value="RESULT_ENTERED">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending Results', color: 'orange', count: reports.filter(r => r.status === 'PENDING').length },
          { label: 'Pending Approval', color: 'yellow', count: reports.filter(r => r.status === 'RESULT_ENTERED').length },
          { label: 'Approved', color: 'green', count: reports.filter(r => r.status === 'APPROVED').length },
          { label: 'Total Orders', color: 'purple', count: reports.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-4 flex items-center space-x-3 shadow-sm">
            <div className={`p-2.5 rounded-full ${
              stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
              stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
              stat.color === 'green' ? 'bg-green-50 text-green-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg border">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-sm text-gray-500 font-medium">Loading reports and orders...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tests Ordered</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved By</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-semibold">No orders or reports found.</p>
                    <p className="text-xs text-gray-400 mt-1">Try creating new patients or entering test results.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((report) => {
                  const isLoading = loadingId === report.id;
                  const testsList = report.items?.map((i: any) => i.test?.name).join(', ') || 'None';
                  return (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-600">
                        {report.orderNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{report.patient?.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{report.patient?.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={testsList}>
                        {testsList}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[report.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[report.status] || report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {report.status === 'APPROVED' || report.status === 'DELIVERED' ? (
                          'Dr. Admin, MD'
                        ) : (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          ) : (
                            <>
                              {report.status === 'PENDING' && (
                                <Link 
                                  href={`/results/${report.id}`}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-semibold rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                  <Play className="h-3 w-3 mr-1" /> Enter Values
                                </Link>
                              )}

                              {report.status === 'RESULT_ENTERED' && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(report.id)} 
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-bold rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                                    title="Approve Report"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                                  </button>
                                  <button 
                                    onClick={() => handlePreview(report)} 
                                    className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors" 
                                    title="Preview Draft PDF"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </>
                              )}

                              {(report.status === 'APPROVED' || report.status === 'DELIVERED') && (
                                <>
                                  <button 
                                    onClick={() => handlePreview(report)} 
                                    className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors" 
                                    title="Preview Approved PDF"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDownload(report)} 
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                                    title="Download PDF"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handlePrint(report)} 
                                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" 
                                    title="Print Report"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={closePreview}>
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-4xl h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Report Preview</h3>
                <p className="text-sm text-gray-500">{previewReport?.patient?.name} — {previewReport?.orderNo}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleDownload(previewReport)} 
                  className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1.5" /> Download
                </button>
                <button 
                  onClick={() => handlePrint(previewReport)} 
                  className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <Printer className="h-4 w-4 mr-1.5" /> Print
                </button>
                <button 
                  onClick={closePreview} 
                  className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full border-0" title="Report Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
