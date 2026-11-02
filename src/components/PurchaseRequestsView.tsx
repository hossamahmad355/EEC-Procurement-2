import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setQuickActionModal,
  updateRequestStatus,
  setRequestStatusFilter,
  setRequestCategoryFilter,
  PurchaseRequest
} from '../store/procurementSlice';
import { ApprovalWorkflowModal } from './ApprovalWorkflowModal';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  X,
  ShieldCheck,
  GitPullRequest
} from 'lucide-react';

export const PurchaseRequestsView: React.FC = () => {
  const dispatch = useDispatch();
  const requests = useSelector((state: RootState) => state.procurement.requests);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const requestStatusFilter = useSelector((state: RootState) => state.procurement.requestStatusFilter);
  const requestCategoryFilter = useSelector((state: RootState) => state.procurement.requestCategoryFilter);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflowRequest, setSelectedWorkflowRequest] = useState<PurchaseRequest | null>(null);

  const filtered = requests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      requestStatusFilter === 'الكل' || req.status === requestStatusFilter;
    const matchesCategory =
      requestCategoryFilter === 'الكل' || req.category === requestCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const isFiltered = requestStatusFilter !== 'الكل' || requestCategoryFilter !== 'الكل';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black">إدارة وسير عمل الاعتماد الثلاثي لطلبات الشراء</h2>
            <p className="text-xs opacity-75">
              اعتماد متعدد المستويات (مدير الموقع ➔ مدير المشتريات ➔ المدير المالي)
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(setQuickActionModal('new_request'))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء طلب شراء جديد</span>
        </button>
      </div>

      {/* Active Filter Notification Badge */}
      {isFiltered && (
        <div className="flex items-center justify-between p-3.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-300">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>
              عرض مفلتر من مؤشرات الأداء:
              {requestStatusFilter !== 'الكل' && ` [الحالة: ${requestStatusFilter}]`}
              {requestCategoryFilter !== 'الكل' && ` [التصنيف: ${requestCategoryFilter}]`}
            </span>
          </div>
          <button
            onClick={() => {
              dispatch(setRequestStatusFilter('الكل'));
              dispatch(setRequestCategoryFilter('الكل'));
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-white transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>إلغاء التصفية</span>
          </button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute right-3.5 top-3 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="البحث برقم الطلب، اسم المادة أو المشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['الكل', 'معتمد', 'قيد المراجعة', 'معلق', 'مرفوض'].map((status) => (
            <button
              key={status}
              onClick={() => dispatch(setRequestStatusFilter(status))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                requestStatusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : darkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className={`rounded-2xl border shadow-md overflow-hidden ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3.5 px-4">رقم الطلب</th>
                <th className="py-3.5 px-4">عنوان المواد والوصف</th>
                <th className="py-3.5 px-4">المشروع</th>
                <th className="py-3.5 px-4">القسم</th>
                <th className="py-3.5 px-4">مقدم الطلب</th>
                <th className="py-3.5 px-4">القيمة التقديرية</th>
                <th className="py-3.5 px-4">مرحلة الاعتماد الحالية</th>
                <th className="py-3.5 px-4 text-center">سير العمل متعدد المستويات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filtered.length > 0 ? (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-bold text-amber-400">{req.code}</td>
                    <td className="py-3.5 px-4 font-bold">{req.title}</td>
                    <td className="py-3.5 px-4 opacity-90">{req.project}</td>
                    <td className="py-3.5 px-4 opacity-75">{req.department}</td>
                    <td className="py-3.5 px-4">{req.requester}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{req.amount.toLocaleString()} ج.م</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        req.status === 'معتمد' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        req.status === 'معتمد من مدير المشتريات' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        req.status === 'معتمد من مدير الموقع' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        req.status === 'قيد المراجعة' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        req.status === 'معلق' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedWorkflowRequest(req)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition shadow inline-flex items-center gap-1.5"
                      >
                        <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
                        <span>اعتماد المستويات الثلاثة</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm opacity-60">
                    لا توجد طلبات شراء تطابق خيارات التصفية المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Level Approval Stepper Modal */}
      {selectedWorkflowRequest && (
        <ApprovalWorkflowModal
          request={requests.find((r) => r.id === selectedWorkflowRequest.id) || selectedWorkflowRequest}
          onClose={() => setSelectedWorkflowRequest(null)}
        />
      )}
    </div>
  );
};
