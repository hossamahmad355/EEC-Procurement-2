import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setActiveTab, setQuickActionModal, openFilteredView } from '../store/procurementSlice';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ShoppingCart,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  PackageCheck,
  Zap,
  Filter,
  CheckCircle2,
  ChevronLeft,
  MousePointerClick
} from 'lucide-react';

export const KeyPerformanceIndicators: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const orders = useSelector((state: RootState) => state.procurement.orders);
  const requests = useSelector((state: RootState) => state.procurement.requests);
  const inventory = useSelector((state: RootState) => state.procurement.inventory);

  const [timeFilter, setTimeFilter] = useState<'all' | 'q4' | 'month'>('all');

  // 1. Calculate Active PO Metrics
  const activeOrders = orders.filter(
    (o) => o.status === 'جاري التنفيذ' || o.status === 'قيد التوريد'
  );
  const activeOrdersCount = activeOrders.length;
  const totalActiveValue = activeOrders.reduce((sum, o) => sum + o.amount, 0);

  // Group active orders by project for Recharts
  const ordersByProjectMap = activeOrders.reduce((acc, order) => {
    acc[order.project] = (acc[order.project] || 0) + order.amount / 1000000;
    return acc;
  }, {} as Record<string, number>);

  const ordersByProjectData = Object.keys(ordersByProjectMap).map((proj) => ({
    project: proj,
    val: Number(ordersByProjectMap[proj].toFixed(2)),
  }));

  // Sparkline data for POs trend
  const poTrendData = [
    { m: 'مايو', count: 18, amount: 42 },
    { m: 'يونيو', count: 22, amount: 55 },
    { m: 'يوليو', count: 25, amount: 61 },
    { m: 'أغسطس', count: 21, amount: 58 },
    { m: 'سبتمبر', count: 28, amount: 72 },
    { m: 'أكتوبر', count: activeOrdersCount, amount: Number((totalActiveValue / 1000000).toFixed(1)) },
  ];

  // 2. Calculate Pending Requests Metrics
  const pendingRequests = requests.filter(
    (r) => r.status === 'قيد المراجعة' || r.status === 'معلق'
  );
  const pendingRequestsCount = pendingRequests.length;
  const totalPendingValue = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

  // Breakdown of pending requests by category
  const pendingByCategoryMap = pendingRequests.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, string> = {
    'مواد إنشائية': '#8b5cf6',
    'كهربائية': '#f59e0b',
    'ميكانيكية': '#3b82f6',
    'تشطيبات': '#10b981',
    'أخرى': '#64748b',
  };

  const pendingPieData = Object.keys(pendingByCategoryMap).map((cat) => ({
    name: cat,
    value: pendingByCategoryMap[cat],
    color: categoryColors[cat] || '#82ca9d',
  }));

  // 3. Calculate Low Stock Items
  const lowStockItems = inventory.filter((item) => item.quantity <= item.minLimit);
  const lowStockCount = lowStockItems.length;

  // Comparison data for Recharts (Current Qty vs Min Threshold)
  const lowStockChartData = lowStockItems.map((item) => ({
    name: item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name,
    fullName: item.name,
    current: item.quantity,
    minThreshold: item.minLimit,
    deficit: Math.max(0, item.minLimit - item.quantity),
    unit: item.unit,
    warehouse: item.warehouse,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black">مؤشرات الأداء الرئيسية (KPIs)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <MousePointerClick className="w-3 h-3" />
                <span>القطاعات تفاعلية للمعاينة</span>
              </span>
            </div>
            <p className="text-xs opacity-75">
              انقر على أي رسم بياني أو بطاقة للانتقال المباشر وتصفية البيانات المرتبطة
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-900/10 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/30 text-xs">
          <Filter className="w-3.5 h-3.5 opacity-60 ml-1" />
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              timeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setTimeFilter('q4')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              timeFilter === 'q4'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            الربع الحالي
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              timeFilter === 'month'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            هذا الشهر
          </button>
        </div>
      </div>

      {/* 3 Main KPI Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Card 1: Active POs */}
        <div
          onClick={() =>
            dispatch(
              openFilteredView({
                tab: 'purchase-orders',
                orderStatus: 'جاري التنفيذ',
                toastMsg: 'عرض أوامر الشراء جارية التنفيذ',
              })
            )
          }
          className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between transition-all hover:border-amber-500 hover:scale-[1.01] cursor-pointer group ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
          }`}
          title="انقر لتصفية أوامر الشراء النشطة"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                أوامر الشراء النشطة (اضغط للتصفية)
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div>
                <h3 className="text-3xl font-black text-amber-400">{activeOrdersCount}</h3>
                <span className="text-xs opacity-75 font-medium block mt-0.5">
                  أمر شراء ساري التنفيذ
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-400 block">الإجمالي المالي</span>
                <span className="text-sm font-black text-emerald-400">
                  {(totalActiveValue / 1000000).toFixed(2)} مليون ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Recharts Mini Area Chart for Trend */}
          <div className="h-24 w-full mt-4 pt-2 border-t border-slate-700/20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={poTrendData}>
                <defs>
                  <linearGradient id="poColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: '#f59e0b',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f59e0b',
                  }}
                  formatter={(val: any) => [`${val} أمر شراء (اضغط للعرض)`, 'عدد الأوامر']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#poColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] opacity-75">
            <span>معدل التنفيذ النموذجي: 92%</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% هذا الشهر
            </span>
          </div>
        </div>

        {/* KPI Card 2: Pending Approval Requests */}
        <div
          onClick={() =>
            dispatch(
              openFilteredView({
                tab: 'purchase-requests',
                requestStatus: 'قيد المراجعة',
                toastMsg: 'عرض طلبات الشراء قيد المراجعة',
              })
            )
          }
          className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between transition-all hover:border-indigo-500 hover:scale-[1.01] cursor-pointer group ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
          }`}
          title="انقر لتصفية طلبات الشراء قيد المراجعة والتعميد"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition">
                طلبات قيد الاعتماد (اضغط للتصفية)
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div>
                <h3 className="text-3xl font-black text-indigo-400">{pendingRequestsCount}</h3>
                <span className="text-xs opacity-75 font-medium block mt-0.5">
                  طلب بحاجة للتعميد والمراجعة
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-400 block">القيمة التقديرية</span>
                <span className="text-sm font-black text-amber-300">
                  {(totalPendingValue / 1000000).toFixed(2)} مليون ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Recharts Pie / Donut Chart for Categories */}
          <div className="h-24 w-full mt-4 pt-2 border-t border-slate-700/20 flex items-center justify-center">
            {pendingPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pendingPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={38}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(entry) => {
                      dispatch(
                        openFilteredView({
                          tab: 'purchase-requests',
                          requestStatus: 'قيد المراجعة',
                          requestCategory: entry.name,
                          toastMsg: `تصفية طلبات الشراء للتصنيف: ${entry.name}`,
                        })
                      );
                    }}
                  >
                    {pendingPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="cursor-pointer hover:opacity-80 transition"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderColor: '#6366f1',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [`${val} طلبات (انقر للتصفية)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs opacity-50">لا توجد طلبات معلقة حالياً</span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] opacity-75">
            <span>انقر على القطاع للتصفية</span>
            <span className="text-indigo-400 font-bold">جاهز للاعتماد الفوري</span>
          </div>
        </div>

        {/* KPI Card 3: Low-Stock Items */}
        <div
          onClick={() =>
            dispatch(
              openFilteredView({
                tab: 'inventory',
                inventoryLowStock: true,
                toastMsg: 'عرض مواد المخزون الحرجة المنخفضة',
              })
            )
          }
          className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between transition-all hover:border-red-500 hover:scale-[1.01] cursor-pointer group ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
          }`}
          title="انقر لتصفية عناصر المخزون المنخفضة"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 flex items-center gap-1 group-hover:bg-red-500 group-hover:text-white transition">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>المخزون المنخفض (اضغط للتصفية)</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div>
                <h3 className="text-3xl font-black text-red-500">{lowStockCount}</h3>
                <span className="text-xs opacity-75 font-medium block mt-0.5">
                  عناصر تجاوزت الحد الأدنى
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setQuickActionModal('new_request'));
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition shadow flex items-center gap-1"
              >
                <span>طلب توريد عاجل</span>
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart comparing low stock */}
          <div className="h-24 w-full mt-4 pt-2 border-t border-slate-700/20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lowStockChartData.slice(0, 4)}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: '#ef4444',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any, name: any) => [
                    `${val} (انقر للتصفية)`,
                    name === 'current' ? 'الكمية الحالية' : 'الحد الأدنى',
                  ]}
                />
                <Bar
                  dataKey="current"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="الكمية الحالية"
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="minThreshold"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  name="الحد الأدنى"
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-red-400 font-bold">حالة المخازن: يتطلب تدخل عاجل</span>
            <span className="opacity-70">اضغط لعرض التفاصيل</span>
          </div>
        </div>
      </div>

      {/* Detailed KPI Analytical Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active POs distribution by Project */}
        <div className={`p-5 rounded-2xl border shadow-md flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold">توزيع أوامر الشراء النشطة حسب المشروع</h3>
            </div>
            <span className="text-xs opacity-75">انقر على الشريط للتصفية</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ordersByProjectData}
                layout="vertical"
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    const proj = data.activePayload[0].payload.project;
                    dispatch(
                      openFilteredView({
                        tab: 'purchase-orders',
                        orderProject: proj,
                        toastMsg: `تصفية أوامر الشراء لمشروع: (${proj})`,
                      })
                    );
                  }
                }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="project" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    borderColor: '#f59e0b',
                    borderRadius: '12px',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    direction: 'rtl',
                  }}
                  formatter={(val: any) => [`${val} مليون ج.م (اضغط للتصفية)`, 'القيمة الإجمالية']}
                />
                <Bar
                  dataKey="val"
                  fill="#f59e0b"
                  radius={[0, 8, 8, 0]}
                  name="القيمة"
                  className="cursor-pointer hover:opacity-80 transition"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Items Detailed Comparison Chart */}
        <div className={`p-5 rounded-2xl border shadow-md flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold">مقارنة الكمية الحالية بالحد الأدنى للمخزون</h3>
            </div>
            <span className="text-xs text-red-400 font-bold">انقر للتصفية</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lowStockChartData}
                onClick={() => {
                  dispatch(
                    openFilteredView({
                      tab: 'inventory',
                      inventoryLowStock: true,
                      toastMsg: 'عرض وتصفية مواد المخزون المنخفضة',
                    })
                  );
                }}
              >
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    borderColor: '#ef4444',
                    borderRadius: '12px',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    direction: 'rtl',
                  }}
                  formatter={(val: any) => [`${val} (اضغط لتصفية المخزون)`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar
                  dataKey="current"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  name="الكمية المتوفرة حالياً"
                  className="cursor-pointer hover:opacity-80 transition"
                />
                <Bar
                  dataKey="minThreshold"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  name="حد الطلب الأدنى"
                  className="cursor-pointer hover:opacity-80 transition"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low-Stock Critical Action Items Table */}
      <div className={`p-5 rounded-2xl border shadow-md ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold">جدول تنبيهات إعادة طلب المواد الحرجة</h3>
          </div>
          <button
            onClick={() =>
              dispatch(
                openFilteredView({
                  tab: 'inventory',
                  inventoryLowStock: true,
                  toastMsg: 'تصفية جميع عناصر المخزون الحرجة المنخفضة',
                })
              )
            }
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>تصفية جميع المواد المنخفضة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-3">الكود</th>
                <th className="py-3 px-3">اسم المادة</th>
                <th className="py-3 px-3">المخزن</th>
                <th className="py-3 px-3">الكمية الحالية</th>
                <th className="py-3 px-3">الحد الأدنى</th>
                <th className="py-3 px-3">مستوى العجز</th>
                <th className="py-3 px-3 text-center">إجراء سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {lowStockItems.map((item) => {
                const deficit = item.minLimit - item.quantity;
                const percentLeft = Math.round((item.quantity / item.minLimit) * 100);
                return (
                  <tr
                    key={item.id}
                    onClick={() =>
                      dispatch(
                        openFilteredView({
                          tab: 'inventory',
                          inventoryLowStock: true,
                          toastMsg: `معاينة وتصفية المادة (${item.name}) في المخزون`,
                        })
                      )
                    }
                    className="hover:bg-white/5 transition cursor-pointer"
                  >
                    <td className="py-3 px-3 font-bold text-amber-400">{item.code}</td>
                    <td className="py-3 px-3 font-bold">{item.name}</td>
                    <td className="py-3 px-3 opacity-80">{item.warehouse}</td>
                    <td className="py-3 px-3 font-black text-red-400">
                      {item.quantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-bold">{item.minLimit.toLocaleString()} {item.unit}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, percentLeft)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-red-400 font-bold">
                          عجز {deficit.toLocaleString()} {item.unit}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => dispatch(setQuickActionModal('new_request'))}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold transition shadow inline-flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>طلب توريد فوري</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
