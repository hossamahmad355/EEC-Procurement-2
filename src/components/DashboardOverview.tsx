import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setSelectedYear,
  setSelectedProject,
  setSelectedPeriod,
  setQuickActionModal,
  setActiveTab,
  openFilteredView
} from '../store/procurementSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import {
  FileText,
  ShoppingCart,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Award,
  CheckCircle,
  PlusCircle,
  Tag,
  BarChart2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { KeyPerformanceIndicators } from './KeyPerformanceIndicators';
import { PurchaseForecastingWidget } from './PurchaseForecastingWidget';
import { NotificationsModal } from './NotificationsModal';

const monthlyData = [
  { month: 'يناير', actual: 4.2, target: 4.0 },
  { month: 'فبراير', actual: 5.0, target: 4.8 },
  { month: 'مارس', actual: 5.8, target: 5.5 },
  { month: 'أبريل', actual: 6.4, target: 6.0 },
  { month: 'مايو', actual: 7.2, target: 6.8 },
  { month: 'يونيو', actual: 7.0, target: 6.5 },
  { month: 'يوليو', actual: 8.0, target: 7.5 },
  { month: 'أغسطس', actual: 8.8, target: 8.2 },
  { month: 'سبتمبر', actual: 9.4, target: 9.0 },
  { month: 'أكتوبر', actual: 9.2, target: 8.8 },
  { month: 'نوفمبر', actual: 10.1, target: 9.5 },
  { month: 'ديسمبر', actual: 11.5, target: 11.0 },
];

const categoryData = [
  { name: 'مواد إنشائية', value: 40, color: '#8b5cf6', amount: '34,240,000' },
  { name: 'كهربائية', value: 25, color: '#f59e0b', amount: '21,400,000' },
  { name: 'ميكانيكية', value: 15, color: '#3b82f6', amount: '12,840,000' },
  { name: 'تشطيبات', value: 12, color: '#10b981', amount: '10,272,000' },
  { name: 'أخرى', value: 8, color: '#64748b', amount: '6,848,000' },
];

const requestStatusData = [
  { name: 'معتمد', percentage: 49.1, count: 140, color: '#22c55e' },
  { name: 'قيد المراجعة', percentage: 21.8, count: 62, color: '#3b82f6' },
  { name: 'معلق', percentage: 23.8, count: 68, color: '#f59e0b' },
  { name: 'مرفوض', percentage: 5.3, count: 15, color: '#ef4444' },
];


export const DashboardOverview: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const selectedYear = useSelector((state: RootState) => state.procurement.selectedYear);
  const selectedProject = useSelector((state: RootState) => state.procurement.selectedProject);
  const selectedPeriod = useSelector((state: RootState) => state.procurement.selectedPeriod);
  const orders = useSelector((state: RootState) => state.procurement.orders);
  const auditLogs = useSelector((state: RootState) => state.procurement.auditLogs || []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Filters Bar */}
      <div className={`p-4 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 transition-colors ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/50 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black">لوحة تحكم إدارة المشتريات</h2>
            <p className="text-xs opacity-75">متابعة مؤشرات الأداء وأوامر الشراء وحركة الموردين</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/10 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/30">
            <span className="text-xs font-bold opacity-75">السنة المالية</span>
            <select
              value={selectedYear}
              onChange={(e) => dispatch(setSelectedYear(e.target.value))}
              className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026" className="bg-slate-900 text-white">2026</option>
              <option value="2025" className="bg-slate-900 text-white">2025</option>
              <option value="2024" className="bg-slate-900 text-white">2024</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/10 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/30">
            <span className="text-xs font-bold opacity-75">المشروع</span>
            <select
              value={selectedProject}
              onChange={(e) => dispatch(setSelectedProject(e.target.value))}
              className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
            >
              <option value="جميع المشاريع" className="bg-slate-900 text-white">جميع المشاريع</option>
              <option value="المبنى الإداري" className="bg-slate-900 text-white">المبنى الإداري</option>
              <option value="ورشة المعدات" className="bg-slate-900 text-white">ورشة المعدات</option>
              <option value="المرافق العامة" className="bg-slate-900 text-white">المرافق العامة</option>
              <option value="مبنى الخدمات" className="bg-slate-900 text-white">مبنى الخدمات</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/10 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/30">
            <span className="text-xs font-bold opacity-75">الفترة</span>
            <select
              value={selectedPeriod}
              onChange={(e) => dispatch(setSelectedPeriod(e.target.value))}
              className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
            >
              <option value="من بداية العام" className="bg-slate-900 text-white">من بداية العام</option>
              <option value="الربع الأخير" className="bg-slate-900 text-white">الربع الأخير</option>
              <option value="الشهر الحالي" className="bg-slate-900 text-white">الشهر الحالي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Embedded Key Performance Indicators Component */}
      <KeyPerformanceIndicators />

      {/* Purchase Cost Forecasting Widget */}
      <PurchaseForecastingWidget />

      {/* Embedded Notifications Center Section (Target of Bell button smooth scroll) */}
      <NotificationsModal />

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: الطلبات المعلقة */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md flex items-center justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">الطلبات المعلقة</span>
            <h3 className="text-2xl font-black text-amber-500">18</h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">طلب قيد المتابعة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: التوفير المحقق */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md flex items-center justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">التوفير المحقق</span>
            <h3 className="text-xl font-black text-emerald-500">4,850,000</h3>
            <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">5.7% ج.م</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: قيمة المشتريات */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md flex items-center justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">قيمة المشتريات</span>
            <h3 className="text-lg font-black text-indigo-400">85,600,000</h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">ج.م إجمالي العام</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: المواد المستلمة */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md flex items-center justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">المواد المستلمة</span>
            <h3 className="text-2xl font-black text-emerald-400">225</h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">إذن استلام معتمد</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 5: أوامر الشراء */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md flex items-center justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">أوامر الشراء</span>
            <h3 className="text-2xl font-black text-amber-400">240</h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">أمر شراء ساري</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 6: طلبات الشراء */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md flex items-center justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">طلبات الشراء</span>
            <h3 className="text-2xl font-black text-purple-400">285</h3>
            <span className="text-[11px] text-slate-400 block mt-0.5">إجمالي الطلبات</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: 3 Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: قيمة المشتريات الشهرية (Bar + Line Chart) */}
        <div className={`p-5 rounded-2xl border shadow-md flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold">قيمة المشتريات الشهرية</h3>
            </div>
            <span className="text-xs text-slate-400">مليون ج.م</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    borderColor: '#475569',
                    borderRadius: '12px',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    direction: 'rtl'
                  }}
                />
                <Bar dataKey="actual" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="قيمة المشتريات الفعلية" />
                <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="المستهدف" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-700/20 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
              <span>قيمة المشتريات الفعلية</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span>المستهدف</span>
            </div>
          </div>
        </div>

        {/* Panel 2: توزيع المشتريات حسب التصنيف (Donut / Category Breakdown) */}
        <div className={`p-5 rounded-2xl border shadow-md flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold">توزيع المشتريات حسب التصنيف</h3>
            </div>
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 my-auto">
            {/* Donut representation */}
            <div className="relative w-44 h-44 rounded-full flex items-center justify-center border-8 border-indigo-500/20 shadow-inner bg-gradient-to-tr from-indigo-950 to-purple-900 text-white">
              <div className="text-center">
                <span className="text-[11px] text-amber-300 font-bold block">إجمالي</span>
                <span className="text-lg font-black block">85,600,000</span>
                <span className="text-[10px] text-slate-300 block">ج.م</span>
              </div>
            </div>

            {/* Legend items */}
            <div className="space-y-2 text-xs w-full md:w-auto">
              {categoryData.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    dispatch(
                      openFilteredView({
                        tab: 'purchase-requests',
                        requestCategory: cat.name,
                        toastMsg: `تصفية طلبات الشراء لتصنيف: (${cat.name})`,
                      })
                    )
                  }
                  className="flex items-center justify-between gap-4 p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer group"
                  title={`انقر لتصفية طلبات التوريد لتصنيف ${cat.name}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-medium group-hover:text-amber-400 transition">{cat.name}</span>
                  </div>
                  <span className="font-bold">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: أداء الموردين وموقف طلبات الشراء */}
        <div className="grid grid-cols-1 gap-6">
          {/* Supplier Performance Box */}
          <div className={`p-5 rounded-2xl border shadow-md ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">أداء الموردين</h3>
              </div>
              <button 
                onClick={() => dispatch(setActiveTab('suppliers'))}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[11px] opacity-75 block">الموردون المعتمدون</span>
                  <span className="text-lg font-black text-emerald-500">56</span>
                </div>
                <Users className="w-6 h-6 text-emerald-500/60" />
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[11px] opacity-75 block">الموردون النشطون</span>
                  <span className="text-lg font-black text-amber-500">48</span>
                </div>
                <CheckCircle className="w-6 h-6 text-amber-500/60" />
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[11px] opacity-75 block">تقييم متوسط الموردين</span>
                  <span className="text-lg font-black text-amber-500">4.6 / 5</span>
                </div>
                <Award className="w-6 h-6 text-amber-500/60" />
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[11px] opacity-75 block">الموردون المتميزون</span>
                  <span className="text-lg font-black text-purple-500">12</span>
                </div>
                <Award className="w-6 h-6 text-purple-500/60" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Purchase Requisition Status & Current Purchase Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Orders Table (Spans 2 cols) */}
        <div className={`p-5 rounded-2xl border shadow-md lg:col-span-2 ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold">أهم أوامر الشراء الحالية</h3>
            </div>
            <button
              onClick={() => dispatch(setActiveTab('purchase-orders'))}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>جميع أوامر الشراء</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3">رقم الأمر</th>
                  <th className="py-3 px-3">المورد</th>
                  <th className="py-3 px-3">المشروع</th>
                  <th className="py-3 px-3">القيمة (ج.م)</th>
                  <th className="py-3 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className={`hover:bg-white/5 transition`}>
                    <td className="py-3 px-3 font-bold text-amber-400">{order.code}</td>
                    <td className="py-3 px-3 font-semibold">{order.supplier}</td>
                    <td className="py-3 px-3 opacity-80">{order.project}</td>
                    <td className="py-3 px-3 font-bold">{order.amount.toLocaleString()} ج.م</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'جاري التنفيذ' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        order.status === 'تم الاستلام' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requisition Status Donut breakdown */}
        <div className={`p-5 rounded-2xl border shadow-md flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold">موقف طلبات الشراء</h3>
            </div>
            <span className="text-xs text-slate-400">إجمالي 285 طلب</span>
          </div>

          <div className="flex items-center justify-center my-2">
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-6 border-emerald-500/30 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow">
              <div className="text-center">
                <span className="text-[10px] text-amber-300 font-bold block">إجمالي</span>
                <span className="text-base font-black block">285</span>
                <span className="text-[9px] text-slate-300 block">طلب</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {requestStatusData.map((item, idx) => (
              <div
                key={idx}
                onClick={() =>
                  dispatch(
                    openFilteredView({
                      tab: 'purchase-requests',
                      requestStatus: item.name,
                      toastMsg: `تصفية طلبات الشراء بحسب الحالة: (${item.name})`,
                    })
                  )
                }
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer group"
                title={`انقر لتصفية الطلبات بحالة ${item.name}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="font-medium group-hover:text-amber-400 transition">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{item.count}</span>
                  <span className="opacity-75">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Audit Log Stream Widget */}
      <div
        className={`p-5 rounded-2xl border shadow-md space-y-4 ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>سجل النشاط المباشر (Live Audit Log)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">آخر الإجراءات الموثقة في نظام المشتريات والمخازن</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setActiveTab('audit-log'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
          >
            <span>عرض السجل الكامل ({auditLogs.length})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {auditLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              onClick={() => dispatch(setActiveTab('audit-log'))}
              className={`p-3.5 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-700/60 text-slate-100 hover:border-amber-500/50'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  {log.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{log.timestamp}</span>
              </div>
              <h4 className={`text-xs font-bold mb-1 line-clamp-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{log.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">{log.description}</p>
              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${
                darkMode ? 'border-slate-700/30 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>بواسطة: {log.user}</span>
                <span
                  className={`font-bold ${
                    log.status === 'ناجح' ? 'text-emerald-500' : log.status === 'مرفوض' ? 'text-rose-500' : 'text-amber-500'
                  }`}
                >
                  ● {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Quick Action Bar matching reference image */}
      <div className={`p-4 rounded-2xl border shadow-lg flex flex-wrap items-center justify-between gap-3 ${
        darkMode ? 'bg-[#1a1533] border-indigo-900/60' : 'bg-[#1e1b4b] border-indigo-900 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow">
            <ZapIcon className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-white">إجراءات سريعة</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => dispatch(setQuickActionModal('new_request'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span>إنشاء طلب شراء</span>
          </button>

          <button
            onClick={() => dispatch(setQuickActionModal('new_order'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>إنشاء أمر شراء</span>
          </button>

          <button
            onClick={() => dispatch(setQuickActionModal('new_receipt'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>تسجيل استلام مواد</span>
          </button>

          <button
            onClick={() => dispatch(setQuickActionModal('new_supplier'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>إضافة مورد جديد</span>
          </button>

          <button
            onClick={() => dispatch(setActiveTab('quotations'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15 cursor-pointer"
          >
            <Tag className="w-4 h-4 text-purple-400" />
            <span>مقارنة عروض الأسعار</span>
          </button>

          <button
            onClick={() => dispatch(setActiveTab('reports'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>تقرير المشتريات</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function ZapIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );
}
