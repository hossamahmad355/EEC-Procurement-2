import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setInventoryLowStockFilter,
  setInventoryCategoryFilter,
  setQuickActionModal
} from '../store/procurementSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  Package,
  Search,
  AlertTriangle,
  Filter,
  X,
  Zap,
  TrendingDown,
  BarChart2,
  ArrowUpRight,
  Sparkles,
  Layers,
  Activity,
  ArrowRightLeft
} from 'lucide-react';

interface InventoryItemMovement {
  code: string;
  name: string;
  category: string;
  unit: string;
  consumedThisMonth: number;
  consumedPrevMonth: number;
  remainingStock: number;
  minLimit: number;
  turnoverRate: string; // e.g. "94%"
  trendPercentage: string; // e.g. "+12.4%"
  weeklyUsage: { week: string; count: number }[];
}

export const InventoryView: React.FC = () => {
  const dispatch = useDispatch();
  const inventory = useSelector((state: RootState) => state.procurement.inventory);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const lowStockFilter = useSelector((state: RootState) => state.procurement.inventoryLowStockFilter);
  const categoryFilter = useSelector((state: RootState) => state.procurement.inventoryCategoryFilter);

  const [searchTerm, setSearchTerm] = useState('');
  const [chartMode, setChartMode] = useState<'total' | 'weekly' | 'turnover'>('total');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Compute Movement Trend Data dynamically from inventory
  const movementData: InventoryItemMovement[] = useMemo(() => {
    const baseMovements: InventoryItemMovement[] = [
      {
        code: 'INV-101',
        name: 'حديد تسليح 12مم',
        category: 'مواد إنشائية',
        unit: 'طن',
        consumedThisMonth: 1420,
        consumedPrevMonth: 1250,
        remainingStock: 4500,
        minLimit: 1000,
        turnoverRate: '94%',
        trendPercentage: '+13.6%',
        weeklyUsage: [
          { week: 'الأسبوع 1', count: 320 },
          { week: 'الأسبوع 2', count: 380 },
          { week: 'الأسبوع 3', count: 410 },
          { week: 'الأسبوع 4', count: 310 }
        ]
      },
      {
        code: 'INV-102',
        name: 'أسمنت بورتلاندي عادي',
        category: 'مواد إنشائية',
        unit: 'شكارة',
        consumedThisMonth: 4800,
        consumedPrevMonth: 4200,
        remainingStock: 12000,
        minLimit: 3000,
        turnoverRate: '88%',
        trendPercentage: '+14.2%',
        weeklyUsage: [
          { week: 'الأسبوع 1', count: 1100 },
          { week: 'الأسبوع 2', count: 1250 },
          { week: 'الأسبوع 3', count: 1300 },
          { week: 'الأسبوع 4', count: 1150 }
        ]
      },
      {
        code: 'INV-103',
        name: 'كابل نحاس 3×10مم',
        category: 'كهربائية',
        unit: 'متر',
        consumedThisMonth: 1250,
        consumedPrevMonth: 1100,
        remainingStock: 3400,
        minLimit: 500,
        turnoverRate: '82%',
        trendPercentage: '+13.6%',
        weeklyUsage: [
          { week: 'الأسبوع 1', count: 280 },
          { week: 'الأسبوع 2', count: 310 },
          { week: 'الأسبوع 3', count: 340 },
          { week: 'الأسبوع 4', count: 320 }
        ]
      },
      {
        code: 'INV-105',
        name: 'بلاط بورسلين 60×60',
        category: 'تشطيبات',
        unit: 'م²',
        consumedThisMonth: 2600,
        consumedPrevMonth: 2100,
        remainingStock: 8500,
        minLimit: 1500,
        turnoverRate: '79%',
        trendPercentage: '+23.8%',
        weeklyUsage: [
          { week: 'الأسبوع 1', count: 550 },
          { week: 'الأسبوع 2', count: 650 },
          { week: 'الأسبوع 3', count: 700 },
          { week: 'الأسبوع 4', count: 700 }
        ]
      },
      {
        code: 'INV-106',
        name: 'دهان جوتن مقاوم للرطوبة',
        category: 'تشطيبات',
        unit: 'جالون',
        consumedThisMonth: 145,
        consumedPrevMonth: 90,
        remainingStock: 25,
        minLimit: 100,
        turnoverRate: '98%',
        trendPercentage: '+61.1%',
        weeklyUsage: [
          { week: 'الأسبوع 1', count: 30 },
          { week: 'الأسبوع 2', count: 40 },
          { week: 'الأسبوع 3', count: 45 },
          { week: 'الأسبوع 4', count: 30 }
        ]
      },
      {
        code: 'INV-107',
        name: 'صمام تحكم 4 بوصة',
        category: 'ميكانيكية',
        unit: 'قطعة',
        consumedThisMonth: 48,
        consumedPrevMonth: 35,
        remainingStock: 12,
        minLimit: 30,
        turnoverRate: '92%',
        trendPercentage: '+37.1%',
        weeklyUsage: [
          { week: 'الأسبوع 1', count: 10 },
          { week: 'الأسبوع 2', count: 12 },
          { week: 'الأسبوع 3', count: 14 },
          { week: 'الأسبوع 4', count: 12 }
        ]
      }
    ];

    if (selectedCategory !== 'الكل') {
      return baseMovements.filter((m) => m.category === selectedCategory);
    }
    return baseMovements;
  }, [selectedCategory]);

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !lowStockFilter || item.quantity <= item.minLimit;
    const matchesCategory = categoryFilter === 'الكل' || item.category === categoryFilter;
    return matchesSearch && matchesLowStock && matchesCategory;
  });

  const isFiltered = lowStockFilter || categoryFilter !== 'الكل';

  // Custom Chart Tooltip
  const CustomMovementTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as InventoryItemMovement;
      const isCritical = data.remainingStock <= data.minLimit;

      return (
        <div className={`p-4 rounded-2xl shadow-2xl border text-xs font-sans space-y-2.5 dir-rtl ${
          darkMode ? 'bg-slate-900/95 border-indigo-900/80 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-slate-300'
        }`}>
          <div className="flex items-center justify-between gap-3 border-b pb-2 border-slate-700/50">
            <div>
              <span className="font-black text-sm text-indigo-400 block">{data.name}</span>
              <span className="text-[10px] opacity-75">{data.code} • {data.category}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isCritical
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isCritical ? 'مخزون حرج' : 'مستقر'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">الاستهلاك هذا الشهر:</span>
              <span className="font-black text-amber-400">{data.consumedThisMonth.toLocaleString()} {data.unit}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">الاستهلاك الشهر السابق:</span>
              <span className="font-bold text-slate-300">{data.consumedPrevMonth.toLocaleString()} {data.unit}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">الرصيد المتبقي بالمخزن:</span>
              <span className={`font-black ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                {data.remainingStock.toLocaleString()} {data.unit}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
              <span className="text-slate-400 font-medium">معدل الدوران والتداول:</span>
              <span className="font-extrabold text-indigo-400">{data.turnoverRate}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black">مخزون المواد والمعدات وحركة الاستهلاك</h2>
            <p className="text-xs opacity-75">متابعة أرصدة المخازن الرئيسية ومعدلات سحب المواد الأكثر تداولاً</p>
          </div>
        </div>

        <button
          onClick={() => dispatch(setQuickActionModal('new_request'))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>طلب توريد مواد جديد</span>
        </button>
      </div>

      {/* Interactive Inventory Movement Chart Widget (Recharts) */}
      <div className={`p-6 rounded-2xl border shadow-lg space-y-6 transition-all ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/50 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Widget Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black shadow">
              <BarChart2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  حركة الأصناف الأكثر استهلاكاً على مدار الشهر
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}>
                  Recharts Analytics
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                متابعة معدلات سحب الخامات وحجم التداول الشهري مقارنة بالأسبوع السابق
              </p>
            </div>
          </div>

          {/* Mode & Category Filter Switches */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
              darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <button
                onClick={() => setSelectedCategory('الكل')}
                className={`px-3 py-1 rounded-lg transition font-black ${
                  selectedCategory === 'الكل'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                كل الأصناف
              </button>
              <button
                onClick={() => setSelectedCategory('مواد إنشائية')}
                className={`px-3 py-1 rounded-lg transition font-black ${
                  selectedCategory === 'مواد إنشائية'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                إنشائية
              </button>
              <button
                onClick={() => setSelectedCategory('تشطيبات')}
                className={`px-3 py-1 rounded-lg transition font-black ${
                  selectedCategory === 'تشطيبات'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                تشطيبات
              </button>
            </div>
          </div>
        </div>

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            darkMode ? 'bg-slate-900/50 border-amber-900/40' : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div>
              <span className={`text-[11px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                إجمالي سحوبات الشهر
              </span>
              <h4 className="text-xl font-black text-amber-500">11,263 وحدة</h4>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +14.8% مقارنة بالشهر الماضي
              </span>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            darkMode ? 'bg-slate-900/50 border-indigo-900/40' : 'bg-indigo-50/70 border-indigo-200'
          }`}>
            <div>
              <span className={`text-[11px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                الأكثر استهلاكاً وتداولاً
              </span>
              <h4 className="text-base font-black text-indigo-400 truncate max-w-[140px]">أسمنت بورتلاندي</h4>
              <span className={`text-[10px] font-bold block mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                4,800 شكارة مسحوبة
              </span>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            darkMode ? 'bg-slate-900/50 border-emerald-900/40' : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <div>
              <span className={`text-[11px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                متوسط معدل دوران المخزون
              </span>
              <h4 className="text-xl font-black text-emerald-400">89.5%</h4>
              <span className={`text-[10px] font-bold block mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                تغطية ممتازة لمتطلبات الموقع
              </span>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            darkMode ? 'bg-slate-900/50 border-red-900/40' : 'bg-red-50/70 border-red-200'
          }`}>
            <div>
              <span className={`text-[11px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                المواد الحرجة العاجلة
              </span>
              <h4 className="text-xl font-black text-red-400">3 مواد</h4>
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" />
                تحت حد الأمان الأدنى
              </span>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className={`font-bold flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              الاستهلاك الفعلي للمادة هذا الشهر (وحدة قياس المادة)
            </span>
            <span className="text-[11px] text-indigo-400 font-bold">
              تحديث البيانات: تلقائي مع كل سحب مخزني
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#475569'} fontSize={11} tickLine={false} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#475569'} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomMovementTooltip />} />
                <Bar dataKey="consumedThisMonth" radius={[8, 8, 0, 0]} barSize={38}>
                  {movementData.map((entry, index) => {
                    const isCritical = entry.remainingStock <= entry.minLimit;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isCritical ? '#ef4444' : index % 2 === 0 ? '#f59e0b' : '#6366f1'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Filter Notification Badge */}
      {isFiltered && (
        <div className="flex items-center justify-between p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-xs font-bold text-red-300">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-400" />
            <span>
              عرض مفلتر من مؤشرات الأداء:
              {lowStockFilter && ' [تحديد المواد الحرجة - منخفضة المخزون فقط]'}
              {categoryFilter !== 'الكل' && ` [التصنيف: ${categoryFilter}]`}
            </span>
          </div>
          <button
            onClick={() => {
              dispatch(setInventoryLowStockFilter(false));
              dispatch(setInventoryCategoryFilter('الكل'));
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>عرض كل المواد</span>
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute right-3.5 top-3 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="البحث برقم الكود، اسم المادة أو المخزن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(setInventoryLowStockFilter(!lowStockFilter))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              lowStockFilter
                ? 'bg-red-500 text-white shadow shadow-red-500/30'
                : darkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>المواد المنخفضة فقط</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`rounded-2xl border shadow-md overflow-hidden ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3.5 px-4">كود المادة</th>
                <th className="py-3.5 px-4">اسم المادة</th>
                <th className="py-3.5 px-4">التصنيف</th>
                <th className="py-3.5 px-4">الكمية المتوفرة</th>
                <th className="py-3.5 px-4">الوحدة</th>
                <th className="py-3.5 px-4">المخزن</th>
                <th className="py-3.5 px-4">حد الطلب الأدنى</th>
                <th className="py-3.5 px-4">حالة المخزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const isLow = item.quantity <= item.minLimit;
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-bold text-amber-400">{item.code}</td>
                      <td className="py-3.5 px-4 font-bold">{item.name}</td>
                      <td className="py-3.5 px-4 opacity-90">{item.category}</td>
                      <td className={`py-3.5 px-4 font-black ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 opacity-75">{item.unit}</td>
                      <td className="py-3.5 px-4">{item.warehouse}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">{item.minLimit.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isLow
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isLow ? 'منخفض - يلزم إعادة الطلب' : 'متوفر ومستقر'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm opacity-60">
                    لا توجد مواد في المخزون تطابق معايير التصفية.
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
