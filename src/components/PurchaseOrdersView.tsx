import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setQuickActionModal,
  setOrderStatusFilter,
  setOrderProjectFilter,
  setToastMessage,
  PurchaseOrder
} from '../store/procurementSlice';
import { ShoppingCart, Plus, Printer, Download, Filter, X, Search, Building2, CheckCircle2, FileText } from 'lucide-react';

export const PurchaseOrdersView: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.procurement.orders);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const orderStatusFilter = useSelector((state: RootState) => state.procurement.orderStatusFilter);
  const orderProjectFilter = useSelector((state: RootState) => state.procurement.orderProjectFilter);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<PurchaseOrder | null>(null);

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      orderStatusFilter === 'الكل' || order.status === orderStatusFilter;
    const matchesProject =
      orderProjectFilter === 'الكل' || order.project === orderProjectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const isFiltered = orderStatusFilter !== 'الكل' || orderProjectFilter !== 'الكل';

  const handleExportExcel = () => {
    const headers = ['رقم أمر الشراء', 'المورد المعتمد', 'المشروع', 'تاريخ الإصدار', 'القيمة الإجمالية (ج.م)', 'حالة الأمر'];
    const rows = filtered.map((o) => [o.code, o.supplier, o.project, o.date, o.amount.toLocaleString(), o.status]);
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EEC_Purchase_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    dispatch(setToastMessage(`تم تصدير (${filtered.length}) أمر شراء إلى ملف Excel بنجاح!`));
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black">إدارة أوامر الشراء</h2>
            <p className="text-xs opacity-75">إصدار ومتابعة عقود أوامر الشراء المعتمدة للموردين</p>
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
            <span>تصدير Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => dispatch(setQuickActionModal('new_order'))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>إصدار أمر شراء جديد</span>
          </button>
        </div>
      </div>

      {/* Active Filter Notification Badge */}
      {isFiltered && (
        <div className="flex items-center justify-between p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>
              عرض مفلتر من مؤشرات الأداء:
              {orderStatusFilter !== 'الكل' && ` [الحالة: ${orderStatusFilter}]`}
              {orderProjectFilter !== 'الكل' && ` [المشروع: ${orderProjectFilter}]`}
            </span>
          </div>
          <button
            onClick={() => {
              dispatch(setOrderStatusFilter('الكل'));
              dispatch(setOrderProjectFilter('الكل'));
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-900 dark:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>إلغاء التصفية</span>
          </button>
        </div>
      )}

      {/* Search and Status Filters Bar */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute right-3.5 top-3 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="البحث برقم الأمر، المورد أو المشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['الكل', 'جاري التنفيذ', 'تم الاستلام', 'قيد التوريد'].map((status) => (
            <button
              key={status}
              onClick={() => dispatch(setOrderStatusFilter(status))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                orderStatusFilter === status
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
                <th className="py-3.5 px-4">رقم أمر الشراء</th>
                <th className="py-3.5 px-4">المورد المعتمد</th>
                <th className="py-3.5 px-4">المشروع</th>
                <th className="py-3.5 px-4">تاريخ الإصدار</th>
                <th className="py-3.5 px-4">إجمالي القيمة</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">طباعة العقد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filtered.length > 0 ? (
                filtered.map((order) => (
                  <tr key={order.id} className={`transition ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="py-3.5 px-4 font-bold text-amber-500">{order.code}</td>
                    <td className="py-3.5 px-4 font-bold">{order.supplier}</td>
                    <td className="py-3.5 px-4 opacity-90">{order.project}</td>
                    <td className="py-3.5 px-4 opacity-75">{order.date}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-500">{order.amount.toLocaleString()} ج.م</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'جاري التنفيذ' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                        order.status === 'تم الاستلام' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrderForPrint(order)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 font-bold transition inline-flex items-center gap-1 cursor-pointer border border-indigo-500/30"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>معاينة وطباعة</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm opacity-60">
                    لا توجد أوامر شراء تطابق التصفية المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Purchase Order Contract Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
            darkMode ? 'bg-slate-900 border-indigo-900 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">نموذج عقد أمر شراء معتمد (PO Contract)</h3>
                  <p className="text-xs text-amber-300">رقم الأمر: {selectedOrderForPrint.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/20">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-amber-500" />
                  <div>
                    <h4 className="font-black text-sm">الشركة المصرية الهندسية للمقاولات (EEC)</h4>
                    <p className="opacity-70">قطاع المشتريات والعقود المركزية - القاهرة</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold">
                  {selectedOrderForPrint.status}
                </span>
              </div>

              <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${
                darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="opacity-60 block mb-0.5">المورد المعتمد</span>
                  <span className="font-black text-sm block">{selectedOrderForPrint.supplier}</span>
                </div>
                <div>
                  <span className="opacity-60 block mb-0.5">المشروع المستفيد</span>
                  <span className="font-black text-sm block">{selectedOrderForPrint.project}</span>
                </div>
                <div>
                  <span className="opacity-60 block mb-0.5">تاريخ الإصدار</span>
                  <span className="font-bold block">{selectedOrderForPrint.date}</span>
                </div>
                <div>
                  <span className="opacity-60 block mb-0.5">القيمة الإجمالية شاملة الضريبة</span>
                  <span className="font-black text-sm text-emerald-500 block">{selectedOrderForPrint.amount.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border text-[11px] space-y-1.5 ${
                darkMode ? 'bg-indigo-950/30 border-indigo-800/40 text-slate-300' : 'bg-indigo-50 border-indigo-200 text-slate-700'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-amber-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>الشروط التعاقدية المعتمدة:</span>
                </div>
                <p>• يلتزم المورد بالتوريد للموقع المحدد وفق المواصفات القياسية المصرية (EOS).</p>
                <p>• يتم صرف المستحقات المالية خلال 15 يوم عمل من تاريخ محضر الفحص والاستلام النهائي.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedOrderForPrint(null)}
                  className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    window.print();
                    dispatch(setToastMessage(`تم إرسال أمر الشراء (${selectedOrderForPrint.code}) للطباعة بنجاح`));
                    setSelectedOrderForPrint(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black transition flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة أمر الشراء الآن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

