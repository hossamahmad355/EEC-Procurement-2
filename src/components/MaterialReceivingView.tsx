import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setQuickActionModal, setToastMessage } from '../store/procurementSlice';
import { Truck, Plus, Search, Download } from 'lucide-react';

export const MaterialReceivingView: React.FC = () => {
  const dispatch = useDispatch();
  const receipts = useSelector((state: RootState) => state.procurement.receipts);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  const filtered = receipts.filter((rec) => {
    const matchesSearch =
      rec.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.poCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'الكل' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    const headers = ['رقم إذن الاستلام', 'رقم أمر الشراء', 'المورد', 'المشروع', 'تاريخ الاستلام', 'عدد البنود', 'المستلم الفني', 'حالة الفحص'];
    const rows = filtered.map((r) => [r.receiptCode, r.poCode, r.supplier, r.project, r.receivedDate, r.itemsCount, r.receiver, r.status]);
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EEC_Material_Receipts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    dispatch(setToastMessage(`تم تصدير (${filtered.length}) إذن استلام مواد بصيغة Excel بنجاح!`));
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black">إذن استلام المواد والمعدات</h2>
            <p className="text-xs opacity-75">تسجيل فحص واستلام المواد الواردة من الموردين للمشاريع</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-100'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>تصدير Excel</span>
          </button>
          <button
            onClick={() => dispatch(setQuickActionModal('new_receipt'))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>تسجيل استلام مواد جديد</span>
          </button>
        </div>
      </div>

      {/* Search and Status Filters Bar */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute right-3.5 top-3 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="البحث برقم الإذن، أمر الشراء، المورد أو المشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['الكل', 'مطابق', 'تحت الفحص', 'مرفوض جزئياً'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : darkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl border shadow-md overflow-hidden ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3.5 px-4">رقم الإذن</th>
                <th className="py-3.5 px-4">رقم أمر الشراء</th>
                <th className="py-3.5 px-4">المورد</th>
                <th className="py-3.5 px-4">المشروع</th>
                <th className="py-3.5 px-4">تاريخ الاستلام</th>
                <th className="py-3.5 px-4">عدد البنود</th>
                <th className="py-3.5 px-4">المستلم الفني</th>
                <th className="py-3.5 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filtered.length > 0 ? (
                filtered.map((rec) => (
                  <tr key={rec.id} className={`transition ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="py-3.5 px-4 font-bold text-amber-500">{rec.receiptCode}</td>
                    <td className="py-3.5 px-4 font-bold">{rec.poCode}</td>
                    <td className="py-3.5 px-4">{rec.supplier}</td>
                    <td className="py-3.5 px-4 opacity-90">{rec.project}</td>
                    <td className="py-3.5 px-4 opacity-75">{rec.receivedDate}</td>
                    <td className="py-3.5 px-4 font-bold">{rec.itemsCount} بند</td>
                    <td className="py-3.5 px-4">{rec.receiver}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.status === 'مطابق' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        rec.status === 'تحت الفحص' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm opacity-60">
                    لا توجد أذونات استلام تطابق معايير البحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

