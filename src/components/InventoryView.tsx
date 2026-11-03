import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setInventoryLowStockFilter,
  setInventoryCategoryFilter,
  setQuickActionModal,
  updateInventoryItemStock,
  sendReorderAlertNotification,
  addPurchaseRequest,
  setToastMessage,
  addAuditLog,
  InventoryItem
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
  Activity,
  ArrowRightLeft,
  BellRing,
  ShoppingCart,
  SlidersHorizontal,
  Minus,
  Plus,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileText
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
  turnoverRate: string;
  trendPercentage: string;
  weeklyUsage: { week: string; count: number }[];
}

export const InventoryView: React.FC = () => {
  const dispatch = useDispatch();
  const inventory = useSelector((state: RootState) => state.procurement.inventory);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const lowStockFilter = useSelector((state: RootState) => state.procurement.inventoryLowStockFilter);
  const categoryFilter = useSelector((state: RootState) => state.procurement.inventoryCategoryFilter);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [autoMonitorEnabled, setAutoMonitorEnabled] = useState<boolean>(true);
  const [showAlertPanel, setShowAlertPanel] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQty, setEditQty] = useState<string>('');
  const [editMinLimit, setEditMinLimit] = useState<string>('');
  const [autoOrderedIds, setAutoOrderedIds] = useState<Record<string, boolean>>({});

  // Track which items have already triggered an automatic alert to detect new drops below Reorder Point
  const alertedItemCodesRef = useRef<Set<string>>(new Set());

  // Compute all items currently below or at Reorder Point (حد الطلب)
  const reorderAlertItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minLimit);
  }, [inventory]);

  // Automatic Reorder Point Alert Engine
  useEffect(() => {
    if (!autoMonitorEnabled) return;

    let hasNewCriticalItem = false;
    reorderAlertItems.forEach((item) => {
      if (!alertedItemCodesRef.current.has(item.code)) {
        alertedItemCodesRef.current.add(item.code);
        hasNewCriticalItem = true;
      }
    });

    // Clean up items that were replenished above Reorder Point
    inventory.forEach((item) => {
      if (item.quantity > item.minLimit && alertedItemCodesRef.current.has(item.code)) {
        alertedItemCodesRef.current.delete(item.code);
      }
    });

    if (hasNewCriticalItem) {
      dispatch(sendReorderAlertNotification({ silentToast: true }));
    }
  }, [inventory, reorderAlertItems, autoMonitorEnabled, dispatch]);

  // Compute Movement Trend Data dynamically synced with current inventory stock & minLimit
  const movementData: InventoryItemMovement[] = useMemo(() => {
    const findInv = (code: string, fallbackStock: number, fallbackMin: number) => {
      const found = inventory.find((i) => i.code === code);
      return {
        remainingStock: found ? found.quantity : fallbackStock,
        minLimit: found ? found.minLimit : fallbackMin,
      };
    };

    const baseMovements: InventoryItemMovement[] = [
      {
        code: 'INV-101',
        name: 'حديد تسليح 12مم',
        category: 'مواد إنشائية',
        unit: 'طن',
        consumedThisMonth: 1420,
        consumedPrevMonth: 1250,
        ...findInv('INV-101', 4500, 1000),
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
        ...findInv('INV-102', 12000, 3000),
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
        ...findInv('INV-103', 3400, 500),
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
        ...findInv('INV-105', 8500, 1500),
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
        ...findInv('INV-106', 25, 100),
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
        ...findInv('INV-107', 12, 30),
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
  }, [selectedCategory, inventory]);

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

  // Handler to auto-create a Purchase Request for an item below Reorder Point
  const handleAutoCreatePurchaseRequest = (item: InventoryItem) => {
    const recommendedOrderQty = Math.max(item.minLimit * 2 - item.quantity, item.minLimit);
    const validCategories = ['مواد إنشائية', 'كهربائية', 'ميكانيكية', 'تشطيبات', 'أخرى'] as const;
    const matchedCat = validCategories.includes(item.category as any)
      ? (item.category as PurchaseRequestCategory)
      : 'أخرى';

    dispatch(
      addPurchaseRequest({
        title: `إعادة تعبئة مخزون (تحت حد الطلب): ${item.name} - كمية (${recommendedOrderQty} ${item.unit})`,
        project: item.warehouse,
        department: 'إدارة المخازن والإمداد الآلي',
        requester: 'نظام تنبيهات حد الطلب الآلي',
        amount: recommendedOrderQty * 1200,
        status: 'قيد المراجعة',
        category: matchedCat,
      })
    );

    setAutoOrderedIds((prev) => ({ ...prev, [item.id]: true }));
  };

  type PurchaseRequestCategory = 'مواد إنشائية' | 'كهربائية' | 'ميكانيكية' | 'تشطيبات' | 'أخرى';

  // Quick stock step adjustment handler
  const handleQuickAdjustStock = (item: InventoryItem, delta: number) => {
    const nextQty = Math.max(0, item.quantity + delta);
    dispatch(
      updateInventoryItemStock({
        id: item.id,
        newQuantity: nextQty,
      })
    );
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditQty(String(item.quantity));
    setEditMinLimit(String(item.minLimit));
  };

  const handleSaveStockEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const parsedQty = Number(editQty);
    const parsedMin = Number(editMinLimit);
    if (isNaN(parsedQty) || isNaN(parsedMin)) return;

    dispatch(
      updateInventoryItemStock({
        id: editingItem.id,
        newQuantity: Math.max(0, parsedQty),
        newMinLimit: Math.max(0, parsedMin),
      })
    );
    setEditingItem(null);
  };

  // Export current or all inventory items to CSV or Excel (.xls)
  const handleExportInventory = (format: 'csv' | 'excel', useFiltered: boolean = true) => {
    const dataToExport = useFiltered ? filtered : inventory;
    const dateStr = new Date().toISOString().split('T')[0];
    const scopeSuffix = useFiltered && (isFiltered || searchTerm.trim() !== '') ? 'Filtered' : 'All';
    const baseFilename = `EEC_Inventory_Report_${scopeSuffix}_${dateStr}`;

    const headers = [
      'كود المادة',
      'اسم المادة',
      'التصنيف',
      'الكمية المتوفرة',
      'الوحدة',
      'المخزن',
      'حد الطلب (Reorder Point)',
      'الفائض / العجز',
      'الكمية المقترحة للطلب',
      'حالة المخزون'
    ];

    const rows = dataToExport.map((item) => {
      const isLow = item.quantity <= item.minLimit;
      const diff = item.quantity - item.minLimit;
      const suggestedOrder = isLow ? Math.max(item.minLimit * 2 - item.quantity, item.minLimit) : 0;
      return [
        item.code,
        item.name,
        item.category,
        String(item.quantity),
        item.unit,
        item.warehouse,
        String(item.minLimit),
        diff >= 0 ? `+${diff}` : String(diff),
        suggestedOrder > 0 ? `${suggestedOrder} ${item.unit}` : 'لا يلزم',
        isLow ? 'تحت حد الطلب - يلزم إعادة التوريد' : 'متوفر وفوق حد الطلب'
      ];
    });

    if (format === 'csv') {
      const csvContent =
        '\uFEFF' +
        [
          headers.join(','),
          ...rows.map((r) => r.map((field) => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseFilename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch(
        setToastMessage(`تم تصدير (${dataToExport.length}) صنف من المخزون إلى ملف CSV بنجاح!`)
      );
    } else {
      const lowCount = dataToExport.filter((i) => i.quantity <= i.minLimit).length;
      const excelHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
            .report-title { font-size: 16pt; font-weight: bold; background-color: #1e1b4b; color: #ffffff; text-align: center; padding: 10px; }
            .report-sub { font-size: 11pt; background-color: #f8fafc; color: #334155; text-align: center; padding: 6px; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; direction: rtl; }
            th { background-color: #f59e0b; color: #0f172a; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: right; }
            td { border: 1px solid #cbd5e1; padding: 7px; text-align: right; }
            .row-low { background-color: #fef2f2; color: #991b1b; font-weight: bold; }
            .row-ok { background-color: #ffffff; color: #0f172a; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="10" class="report-title">الشركة المصرية الهندسية للمقاولات (EEC) - تقرير أرصدة المخزون وحد الطلب</td></tr>
            <tr><td colspan="10" class="report-sub">تاريخ التصدير: ${dateStr} | إجمالي الأصناف المصدرة: ${dataToExport.length} | أصناف تحت حد الطلب: ${lowCount}</td></tr>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows
                .map((r, idx) => {
                  const isLow = dataToExport[idx].quantity <= dataToExport[idx].minLimit;
                  return `<tr class="${isLow ? 'row-low' : 'row-ok'}">${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob(['\uFEFF' + excelHtml], {
        type: 'application/vnd.ms-excel;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseFilename}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch(
        setToastMessage(`تم تصدير (${dataToExport.length}) صنف من المخزون إلى ملف Excel (.xls) بنجاح!`)
      );
    }

    dispatch(
      addAuditLog({
        user: 'فريق المشتريات والمخازن',
        userRole: 'إدارة المشتريات',
        actionType: 'تعديل مخزون',
        category: 'المخزون',
        title: `تصدير بيانات المخزون بصيغة ${format.toUpperCase()}`,
        description: `تم تصدير كشف أرصدة المخزون (${dataToExport.length} صنف) لإعداد التقارير الخارجية`,
        details: `الملف: ${baseFilename}.${format === 'excel' ? 'xls' : 'csv'}`,
        status: 'ناجح',
        targetCode: 'INV-EXPORT'
      })
    );
  };

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
              {isCritical ? 'تحت حد الطلب' : 'مستقر'}
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

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">حد الطلب (Reorder Point):</span>
              <span className="font-bold text-amber-400">
                {data.minLimit.toLocaleString()} {data.unit}
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
            <h2 className="text-lg font-black">مخزون المواد والمعدات ونظام تنبيهات حد الطلب (Reorder Point)</h2>
            <p className="text-xs opacity-75">متابعة أرصدة المخازن الرئيسية والإنذار المبكر التلقائي عند انخفاض الكميات عن حد الطلب الأدنى</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExportInventory('excel', true)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              darkMode
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}
            title="تصدير بيانات المخزون الحالية إلى ملف Excel منسق (.xls)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => handleExportInventory('csv', true)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-100'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
            title="تصدير بيانات المخزون الحالية إلى ملف CSV قياسي (.csv)"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={() => dispatch(sendReorderAlertNotification({ silentToast: false }))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs transition cursor-pointer"
            title="فحص المخزون وإرسال تنبيهات فورية لمركز الإشعارات"
          >
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>فحص وإرسال تنبيهات حد الطلب ({reorderAlertItems.length})</span>
          </button>

          <button
            onClick={() => dispatch(setQuickActionModal('new_request'))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>طلب توريد مواد جديد</span>
          </button>
        </div>
      </div>

      {/* Automatic Reorder Point Alert System Banner & Control Center */}
      <div className={`rounded-2xl border shadow-lg overflow-hidden transition-all ${
        reorderAlertItems.length > 0
          ? darkMode
            ? 'bg-gradient-to-br from-red-950/50 via-slate-900 to-slate-900 border-red-500/40 text-slate-100'
            : 'bg-gradient-to-br from-red-50 via-white to-amber-50/40 border-red-300 text-slate-900'
          : darkMode
            ? 'bg-slate-800/90 border-emerald-500/30 text-slate-100'
            : 'bg-emerald-50/60 border-emerald-200 text-slate-900'
      }`}>
        {/* Top Bar of Reorder Point System */}
        <div className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 border-b border-red-500/20">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
              reorderAlertItems.length > 0
                ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-lg shadow-red-500/10'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-black">
                  نظام التنبيهات التلقائي لحد الطلب (Auto Reorder Point Alert System)
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1.5 border ${
                  autoMonitorEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${autoMonitorEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
                  {autoMonitorEnabled ? 'الرصد الآلي مفعل' : 'الرصد الآلي متوقف'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {reorderAlertItems.length > 0
                  ? `تنبيه عاجل: تم رصد (${reorderAlertItems.length}) أصناف وصلت كميتها إلى أقل من أو يساوي حد الطلب الأدنى (Reorder Point) وتستلزم إعادة التوريد.`
                  : 'جميع أصناف المخزون الحالية أعلى من حد الطلب الأدنى (Reorder Point) ولا توجد نواقص حرجة.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAutoMonitorEnabled(!autoMonitorEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                autoMonitorEnabled
                  ? darkMode
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                  : darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoMonitorEnabled ? 'animate-spin' : ''}`} />
              <span>{autoMonitorEnabled ? 'إيقاف الرصد التلقائي' : 'تفعيل الرصد التلقائي'}</span>
            </button>

            {reorderAlertItems.length > 0 && (
              <button
                onClick={() => setShowAlertPanel(!showAlertPanel)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                {showAlertPanel ? 'طي قائمة التنبيهات' : `عرض التنبيهات (${reorderAlertItems.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Alert Cards Grid for Items Below Reorder Point */}
        {showAlertPanel && reorderAlertItems.length > 0 && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {reorderAlertItems.map((item) => {
              const deficit = Math.max(item.minLimit - item.quantity, 0);
              const suggestedOrder = Math.max(item.minLimit * 2 - item.quantity, item.minLimit);
              const ratioPercent = item.minLimit > 0 ? Math.min(100, Math.round((item.quantity / item.minLimit) * 100)) : 0;
              const isOrdered = !!autoOrderedIds[item.id];

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    darkMode
                      ? 'bg-slate-900/90 border-red-500/30 hover:border-red-500/60'
                      : 'bg-white border-red-200 shadow-sm hover:border-red-400'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-black text-amber-400 block">{item.code}</span>
                        <h4 className="text-sm font-black leading-snug">{item.name}</h4>
                        <span className="text-[11px] opacity-70 block mt-0.5">{item.warehouse}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black shrink-0">
                        تحت حد الطلب
                      </span>
                    </div>

                    {/* Quantity vs Reorder Point Metrics */}
                    <div className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                      darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="opacity-75">الرصيد الحالي:</span>
                        <span className="font-black text-red-400">
                          {item.quantity.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-75">حد الطلب (Reorder Point):</span>
                        <span className="font-black text-amber-400">
                          {item.minLimit.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/20">
                        <span className="opacity-75">العجز عن حد الطلب:</span>
                        <span className="font-black text-rose-400">
                          {deficit > 0 ? `-${deficit.toLocaleString()} ${item.unit}` : 'عند الحد الحرج'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-red-400">نسبة التغطية لحد الطلب</span>
                        <span>{ratioPercent}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${ratioPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions on Alert Card */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => dispatch(sendReorderAlertNotification({ itemId: item.id, silentToast: false }))}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        darkMode
                          ? 'bg-red-500/15 hover:bg-red-500/30 text-red-300 border-red-500/30'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                      }`}
                      title="إرسال إشعار تنبيه فوري في جرس الإشعارات"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>إرسال تنبيه</span>
                    </button>

                    <button
                      onClick={() => handleAutoCreatePurchaseRequest(item)}
                      disabled={isOrdered}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isOrdered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow'
                      }`}
                      title={`إنشاء طلب شراء تلقائي بكمية ${suggestedOrder} ${item.unit}`}
                    >
                      {isOrdered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم طلب التوريد</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>طلب توريد ({suggestedOrder})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                متابعة معدلات سحب الخامات وحجم التداول الشهري مقارنة بحد الطلب الأدنى
              </p>
            </div>
          </div>

          {/* Category Filter Switches */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
              darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <button
                onClick={() => setSelectedCategory('الكل')}
                className={`px-3 py-1 rounded-lg transition font-black cursor-pointer ${
                  selectedCategory === 'الكل'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                كل الأصناف
              </button>
              <button
                onClick={() => setSelectedCategory('مواد إنشائية')}
                className={`px-3 py-1 rounded-lg transition font-black cursor-pointer ${
                  selectedCategory === 'مواد إنشائية'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                إنشائية
              </button>
              <button
                onClick={() => setSelectedCategory('تشطيبات')}
                className={`px-3 py-1 rounded-lg transition font-black cursor-pointer ${
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

          <div
            onClick={() => dispatch(setInventoryLowStockFilter(!lowStockFilter))}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              darkMode ? 'bg-slate-900/50 border-red-900/40 hover:border-red-500/50' : 'bg-red-50/70 border-red-200 hover:border-red-400'
            }`}
            title="اضغط لتصفية المواد التي وصلت لأقل من حد الطلب"
          >
            <div>
              <span className={`text-[11px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                مواد تحت حد الطلب (Reorder Point)
              </span>
              <h4 className="text-xl font-black text-red-400">{reorderAlertItems.length} مواد</h4>
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" />
                تحت حد الطلب الأدنى المعتمد
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
              الاستهلاك الفعلي للمادة هذا الشهر (الأعمدة الحمراء تشير لوصول الرصيد تحت حد الطلب)
            </span>
            <span className="text-[11px] text-indigo-400 font-bold">
              تحديث البيانات: مرتبط مباشرة بحركة السحب وحد الطلب
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
              عرض مفلتر:
              {lowStockFilter && ' [تحديد المواد تحت حد الطلب (Reorder Point) فقط]'}
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => dispatch(setInventoryLowStockFilter(!lowStockFilter))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              lowStockFilter
                ? 'bg-red-500 text-white shadow shadow-red-500/30'
                : darkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>المواد تحت حد الطلب فقط ({reorderAlertItems.length})</span>
          </button>

          <button
            onClick={() => handleExportInventory('excel', true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              darkMode
                ? 'bg-slate-900/60 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
            title="تصدير الجدول المعروض حالياً بصيغة Excel (.xls)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel ({filtered.length})</span>
          </button>

          <button
            onClick={() => handleExportInventory('csv', true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              darkMode
                ? 'bg-slate-900/60 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="تصدير الجدول المعروض حالياً بصيغة CSV (.csv)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table with Live Reorder Point Controls */}
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
                <th className="py-3.5 px-4">الكمية المتوفرة (سحب/إضافة)</th>
                <th className="py-3.5 px-4">الوحدة</th>
                <th className="py-3.5 px-4">المخزن</th>
                <th className="py-3.5 px-4">حد الطلب (Reorder Point)</th>
                <th className="py-3.5 px-4">حالة المخزون والتنبيه الآلي</th>
                <th className="py-3.5 px-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const isLow = item.quantity <= item.minLimit;
                  const stepAmount = Math.max(10, Math.round(item.minLimit * 0.25));

                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isLow
                          ? darkMode
                            ? 'bg-red-950/20 hover:bg-red-950/35'
                            : 'bg-red-50/70 hover:bg-red-100/60'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-amber-400">{item.code}</td>
                      <td className="py-3.5 px-4 font-bold">{item.name}</td>
                      <td className="py-3.5 px-4 opacity-90">{item.category}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickAdjustStock(item, -stepAmount)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition cursor-pointer ${
                              darkMode
                                ? 'bg-slate-900 border-slate-700 hover:bg-red-500/20 hover:border-red-500/40 text-slate-300'
                                : 'bg-slate-100 border-slate-300 hover:bg-red-100 text-slate-700'
                            }`}
                            title={`سحب ${stepAmount} ${item.unit} (تجربة التنبيه التلقائي عند النزول تحت حد الطلب)`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className={`font-black text-sm min-w-[55px] text-center ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                            {item.quantity.toLocaleString()}
                          </span>

                          <button
                            onClick={() => handleQuickAdjustStock(item, stepAmount)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition cursor-pointer ${
                              darkMode
                                ? 'bg-slate-900 border-slate-700 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-slate-300'
                                : 'bg-slate-100 border-slate-300 hover:bg-emerald-100 text-slate-700'
                            }`}
                            title={`إضافة ${stepAmount} ${item.unit}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 opacity-75">{item.unit}</td>
                      <td className="py-3.5 px-4">{item.warehouse}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        {item.minLimit.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isLow
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isLow ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                              <span>تحت حد الطلب - تنبيه نشط</span>
                            </>
                          ) : (
                            <span>متوفر وفوق حد الطلب</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              darkMode
                                ? 'bg-slate-900 border-slate-700 hover:bg-slate-700 text-slate-300'
                                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="تعديل الكمية أو ضبط حد الطلب (Reorder Point)"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {isLow && (
                            <button
                              onClick={() => dispatch(sendReorderAlertNotification({ itemId: item.id, silentToast: false }))}
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition cursor-pointer"
                              title="إرسال تنبيه عاجل لمركز الإشعارات"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm opacity-60">
                    لا توجد مواد في المخزون تطابق معايير التصفية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adjusting Item Stock & Reorder Point (حد الطلب) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
            darkMode ? 'bg-slate-900 border-indigo-900 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">ضبط الرصيد وحد الطلب (Reorder Point)</h3>
                  <p className="text-[11px] text-amber-300">{editingItem.name} ({editingItem.code})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStockEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1.5">
                  الكمية الفعلية المتوفرة بالمخزن ({editingItem.unit})
                </label>
                <input
                  type="number"
                  min={0}
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5">
                  حد الطلب الأدنى - Reorder Point ({editingItem.unit})
                </label>
                <input
                  type="number"
                  min={0}
                  value={editMinLimit}
                  onChange={(e) => setEditMinLimit(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-300 text-amber-700'
                  }`}
                  required
                />
                <p className="text-[11px] opacity-70 mt-1">
                  سيقوم النظام تلقائياً بإرسال إشعار تنبيه فوري بمجرد وصول الكمية المتوفرة إلى أقل من أو يساوي هذا الحد.
                </p>
              </div>

              {Number(editQty) <= Number(editMinLimit) && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>تنبيه: الكمية المدخلة أقل من أو تساوي حد الطلب؛ سيتم إطلاق تنبيه تلقائي فور الحفظ!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition cursor-pointer"
                >
                  حفظ وتطبيق الرصد الآلي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
