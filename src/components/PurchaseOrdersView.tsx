import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setQuickActionModal,
  setOrderStatusFilter,
  setOrderProjectFilter,
  setToastMessage,
  addPurchaseOrder,
  addAuditLog,
  PurchaseOrder
} from '../store/procurementSlice';
import {
  ShoppingCart,
  Plus,
  Printer,
  Download,
  Filter,
  X,
  Search,
  Building2,
  CheckCircle2,
  FileText,
  TrendingDown,
  TrendingUp,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scale,
  ArrowUpDown,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface MaterialPOPurchaseRecord {
  poCode: string;
  supplier: string;
  project: string;
  date: string;
  quantity: number;
  unitPrice: number;
  qualityScore: number;
  deliveryDays: number;
  paymentTerms: string;
}

interface MaterialPriceVarianceItem {
  id: string;
  materialName: string;
  category: string;
  unit: string;
  standardBatchQty: number;
  purchases: MaterialPOPurchaseRecord[];
}

const INITIAL_VARIANCE_DATA: MaterialPriceVarianceItem[] = [
  {
    id: 'MAT-VAR-01',
    materialName: 'حديد تسليح عالي المقاومة 16مم (B500DWR)',
    category: 'حديد تسليح',
    unit: 'طن',
    standardBatchQty: 50,
    purchases: [
      {
        poCode: 'PR-0268',
        supplier: 'حديد عز - التوزيع المركزي',
        project: 'أبراج العلمين',
        date: '2025-05-12',
        quantity: 50,
        unitPrice: 41800,
        qualityScore: 99,
        deliveryDays: 3,
        paymentTerms: 'تسهيلات 60 يوم'
      },
      {
        poCode: 'PR-0241',
        supplier: 'السويس للصلب',
        project: 'المونوريل',
        date: '2025-04-19',
        quantity: 45,
        unitPrice: 43250,
        qualityScore: 96,
        deliveryDays: 5,
        paymentTerms: 'تسهيلات 45 يوم'
      },
      {
        poCode: 'PR-0218',
        supplier: 'المصرية لتجارة المعادن والتوريدات',
        project: 'محطة العاصمة',
        date: '2025-03-28',
        quantity: 30,
        unitPrice: 45900,
        qualityScore: 92,
        deliveryDays: 7,
        paymentTerms: 'دفعة مقدمة 50%'
      }
    ]
  },
  {
    id: 'MAT-VAR-02',
    materialName: 'كابلات نحاسية مدرعة جهد متوسط 4×50 مم',
    category: 'كابلات كهربائية',
    unit: 'متر طولي',
    standardBatchQty: 1000,
    purchases: [
      {
        poCode: 'PR-0259',
        supplier: 'السويدي إلكتريك للكابلات',
        project: 'محطة العاصمة',
        date: '2025-05-10',
        quantity: 1000,
        unitPrice: 920,
        qualityScore: 99,
        deliveryDays: 4,
        paymentTerms: 'تسهيلات 60 يوم'
      },
      {
        poCode: 'PR-0235',
        supplier: 'الكابلات الكهربائية المصرية',
        project: 'أبراج العلمين',
        date: '2025-04-11',
        quantity: 850,
        unitPrice: 985,
        qualityScore: 95,
        deliveryDays: 6,
        paymentTerms: 'تسهيلات 30 يوم'
      },
      {
        poCode: 'PR-0210',
        supplier: 'النور للتوريدات الكهروميكانيكية',
        project: 'توسعات أكتوبر',
        date: '2025-03-15',
        quantity: 600,
        unitPrice: 1065,
        qualityScore: 90,
        deliveryDays: 8,
        paymentTerms: 'نقدي عند الاستلام'
      }
    ]
  },
  {
    id: 'MAT-VAR-03',
    materialName: 'أسمنت بورتلاندي مقاوم للأملاح والكبريتات (رتبة 42.5)',
    category: 'أسمنت وخرسانة',
    unit: 'طن',
    standardBatchQty: 200,
    purchases: [
      {
        poCode: 'PR-0247',
        supplier: 'لافارج للأسمنت مصر',
        project: 'المونوريل',
        date: '2025-05-07',
        quantity: 200,
        unitPrice: 2350,
        qualityScore: 98,
        deliveryDays: 2,
        paymentTerms: 'تسهيلات 45 يوم'
      },
      {
        poCode: 'PR-0229',
        supplier: 'أسمنت سيناء - التوزيع التجاري',
        project: 'توسعات أكتوبر',
        date: '2025-04-04',
        quantity: 180,
        unitPrice: 2490,
        qualityScore: 95,
        deliveryDays: 3,
        paymentTerms: 'تسهيلات 30 يوم'
      },
      {
        poCode: 'PR-0204',
        supplier: 'الشركة العربية لمواد البناء',
        project: 'أبراج العلمين',
        date: '2025-03-09',
        quantity: 150,
        unitPrice: 2680,
        qualityScore: 91,
        deliveryDays: 5,
        paymentTerms: 'دفعة مقدمة 30%'
      }
    ]
  },
  {
    id: 'MAT-VAR-04',
    materialName: 'مضخات مياه غاطسة للصرف الصناعي 15 حصان ستانلس',
    category: 'معدات ميكانيكية',
    unit: 'وحدة',
    standardBatchQty: 8,
    purchases: [
      {
        poCode: 'PR-0239',
        supplier: 'أوراسكوم للتوريدات الصناعية',
        project: 'توسعات أكتوبر',
        date: '2025-05-03',
        quantity: 8,
        unitPrice: 38750,
        qualityScore: 97,
        deliveryDays: 5,
        paymentTerms: 'تسهيلات 60 يوم + ضمان سنتين'
      },
      {
        poCode: 'PR-0221',
        supplier: 'الدلتا للأنظمة الميكانيكية والطلمبات',
        project: 'محطة العاصمة',
        date: '2025-04-02',
        quantity: 6,
        unitPrice: 42100,
        qualityScore: 94,
        deliveryDays: 7,
        paymentTerms: 'تسهيلات 30 يوم'
      },
      {
        poCode: 'PR-0198',
        supplier: 'المركز الهندسي للمعدات الثقيلة',
        project: 'المونوريل',
        date: '2025-03-01',
        quantity: 4,
        unitPrice: 44600,
        qualityScore: 92,
        deliveryDays: 9,
        paymentTerms: 'دفعة مقدمة 40%'
      }
    ]
  },
  {
    id: 'MAT-VAR-05',
    materialName: 'ألواح عزل حراري ومائي بولي يوريثان كثافة 40 كجم/م3',
    category: 'عزل ومواد كيميائية',
    unit: 'لفة',
    standardBatchQty: 300,
    purchases: [
      {
        poCode: 'PR-0226',
        supplier: 'المقاولون العرب للتوريدات الكيميائية',
        project: 'أبراج العلمين',
        date: '2025-04-28',
        quantity: 300,
        unitPrice: 600,
        qualityScore: 97,
        deliveryDays: 3,
        paymentTerms: 'تسهيلات 45 يوم'
      },
      {
        poCode: 'PR-0212',
        supplier: 'سيكا مصر للكيماويات الإنشائية',
        project: 'محطة العاصمة',
        date: '2025-03-25',
        quantity: 250,
        unitPrice: 645,
        qualityScore: 98,
        deliveryDays: 4,
        paymentTerms: 'تسهيلات 30 يوم'
      },
      {
        poCode: 'PR-0191',
        supplier: 'المتحدة لمواد العزل والتشطيبات',
        project: 'توسعات أكتوبر',
        date: '2025-02-20',
        quantity: 200,
        unitPrice: 710,
        qualityScore: 89,
        deliveryDays: 6,
        paymentTerms: 'نقدي عند التوريد'
      }
    ]
  },
  {
    id: 'MAT-VAR-06',
    materialName: 'بلاط بورسلين 60×60 سم قطع ليزر فرز أول مضاد للبري',
    category: 'تشطيبات معمارية',
    unit: 'متر مربع',
    standardBatchQty: 1500,
    purchases: [
      {
        poCode: 'PR-0264',
        supplier: 'مجموعة كليوباترا للسيراميك والبورسلين',
        project: 'أبراج العلمين',
        date: '2025-05-09',
        quantity: 1500,
        unitPrice: 445,
        qualityScore: 98,
        deliveryDays: 4,
        paymentTerms: 'تسهيلات 60 يوم'
      },
      {
        poCode: 'PR-0244',
        supplier: 'الجوهرة للبورسلين والتوريدات المعمارية',
        project: 'محطة العاصمة',
        date: '2025-04-14',
        quantity: 1200,
        unitPrice: 485,
        qualityScore: 95,
        deliveryDays: 5,
        paymentTerms: 'تسهيلات 30 يوم'
      },
      {
        poCode: 'PR-0219',
        supplier: 'الرواد لتجارة مواد التشطيب',
        project: 'توسعات أكتوبر',
        date: '2025-03-19',
        quantity: 900,
        unitPrice: 530,
        qualityScore: 90,
        deliveryDays: 7,
        paymentTerms: 'دفعة مقدمة 50%'
      }
    ]
  }
];

export const PurchaseOrdersView: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.procurement.orders);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const orderStatusFilter = useSelector((state: RootState) => state.procurement.orderStatusFilter);
  const orderProjectFilter = useSelector((state: RootState) => state.procurement.orderProjectFilter);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<PurchaseOrder | null>(null);

  // Price Variance Analysis Table states
  const [varianceSearch, setVarianceSearch] = useState('');
  const [varianceCategory, setVarianceCategory] = useState('الكل');
  const [varianceSortBy, setVarianceSortBy] = useState<'variance_pct' | 'savings' | 'lowest_price'>('variance_pct');
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>('MAT-VAR-01');
  const [customRecords, setCustomRecords] = useState<Record<string, MaterialPOPurchaseRecord[]>>({});

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

  // Compute enriched variance analysis items
  const analyzedMaterials = useMemo(() => {
    return INITIAL_VARIANCE_DATA.map((item) => {
      const extra = customRecords[item.id] || [];
      const allPurchases = [...extra, ...item.purchases];
      const prices = allPurchases.map((p) => p.unitPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = Math.round(prices.reduce((acc, val) => acc + val, 0) / prices.length);
      const unitSpread = maxPrice - minPrice;
      const variancePct = minPrice > 0 ? Number((((maxPrice - minPrice) / minPrice) * 100).toFixed(1)) : 0;
      const potentialSavings = unitSpread * item.standardBatchQty;

      // Calculate Best Value Score for each PO record:
      // 60% Price Competitiveness + 25% Quality Score + 15% Delivery Speed
      const scoredPurchases = allPurchases.map((p) => {
        const priceRatio = maxPrice > minPrice ? ((maxPrice - p.unitPrice) / (maxPrice - minPrice)) * 100 : 100;
        const deliveryScore = Math.max(50, 100 - (p.deliveryDays - 2) * 7);
        const valueScore = Math.round(priceRatio * 0.6 + p.qualityScore * 0.25 + deliveryScore * 0.15);
        return {
          ...p,
          valueScore
        };
      });

      const bestValueRecord = [...scoredPurchases].sort((a, b) => b.valueScore - a.valueScore || a.unitPrice - b.unitPrice)[0];
      const highestPriceRecord = [...scoredPurchases].sort((a, b) => b.unitPrice - a.unitPrice)[0];

      return {
        ...item,
        purchases: scoredPurchases,
        minPrice,
        maxPrice,
        avgPrice,
        unitSpread,
        variancePct,
        potentialSavings,
        bestValueRecord,
        highestPriceRecord
      };
    });
  }, [customRecords]);

  const filteredVarianceMaterials = useMemo(() => {
    return analyzedMaterials
      .filter((m) => {
        const matchesCat = varianceCategory === 'الكل' || m.category === varianceCategory;
        const q = varianceSearch.trim().toLowerCase();
        const matchesQuery =
          !q ||
          m.materialName.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.bestValueRecord.supplier.toLowerCase().includes(q) ||
          m.purchases.some(
            (p) => p.poCode.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q) || p.project.toLowerCase().includes(q)
          );
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (varianceSortBy === 'variance_pct') return b.variancePct - a.variancePct;
        if (varianceSortBy === 'savings') return b.potentialSavings - a.potentialSavings;
        return a.minPrice - b.minPrice;
      });
  }, [analyzedMaterials, varianceCategory, varianceSearch, varianceSortBy]);

  // Global Variance KPIs
  const totalPotentialSavings = useMemo(
    () => analyzedMaterials.reduce((sum, item) => sum + item.potentialSavings, 0),
    [analyzedMaterials]
  );
  const avgVariancePct = useMemo(
    () =>
      Number(
        (
          analyzedMaterials.reduce((sum, item) => sum + item.variancePct, 0) /
          (analyzedMaterials.length || 1)
        ).toFixed(1)
      ),
    [analyzedMaterials]
  );
  const highestVarianceItem = useMemo(
    () => [...analyzedMaterials].sort((a, b) => b.variancePct - a.variancePct)[0],
    [analyzedMaterials]
  );

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

  const handleExportVarianceReport = () => {
    const headers = [
      'كود التحليل',
      'اسم المادة المشتراة',
      'التصنيف',
      'الوحدة',
      'أقل سعر وحدة (ج.م)',
      'أعلى سعر وحدة (ج.م)',
      'متوسط السعر (ج.م)',
      'فرق السعر للوحدة (ج.م)',
      'نسبة التباين السعري (%)',
      'الوفر المالي للدفعة القياسية (ج.م)',
      'المورد الأفضل قيمة',
      'رقم أمر الشراء المرجعي لأفضل سعر',
      'مؤشر القيمة المتكامل (/100)'
    ];
    const rows = filteredVarianceMaterials.map((item) => [
      item.id,
      item.materialName,
      item.category,
      item.unit,
      item.minPrice,
      item.maxPrice,
      item.avgPrice,
      item.unitSpread,
      `${item.variancePct}%`,
      item.potentialSavings,
      item.bestValueRecord.supplier,
      item.bestValueRecord.poCode,
      item.bestValueRecord.valueScore
    ]);
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EEC_PO_Price_Variance_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    dispatch(setToastMessage(`تم تصدير جدول تحليل تباين الأسعار (${filteredVarianceMaterials.length} مواد) بنجاح!`));
  };

  const handleIssueBestValuePO = (item: (typeof analyzedMaterials)[0]) => {
    const newPoNumber = `PR-0${Math.floor(275 + Math.random() * 700)}`;
    const today = new Date().toISOString().split('T')[0];
    const totalOrderAmount = item.minPrice * item.standardBatchQty;

    dispatch(
      addPurchaseOrder({
        code: newPoNumber,
        supplier: item.bestValueRecord.supplier,
        project: item.bestValueRecord.project,
        date: today,
        amount: totalOrderAmount,
        status: 'جاري التنفيذ'
      })
    );

    const newRecord: MaterialPOPurchaseRecord = {
      poCode: newPoNumber,
      supplier: item.bestValueRecord.supplier,
      project: item.bestValueRecord.project,
      date: today,
      quantity: item.standardBatchQty,
      unitPrice: item.minPrice,
      qualityScore: item.bestValueRecord.qualityScore,
      deliveryDays: item.bestValueRecord.deliveryDays,
      paymentTerms: item.bestValueRecord.paymentTerms
    };

    setCustomRecords((prev) => ({
      ...prev,
      [item.id]: [newRecord, ...(prev[item.id] || [])]
    }));

    dispatch(
      addAuditLog({
        user: 'م. أحمد فؤاد',
        userRole: 'مدير المشتريات المركزية',
        actionType: 'إصدار أمر',
        category: 'أوامر الشراء',
        title: `إصدار أمر شراء بأفضل قيمة (${newPoNumber})`,
        description: `تم إصدار أمر الشراء (${newPoNumber}) للمورد (${item.bestValueRecord.supplier}) لشراء ${item.standardBatchQty} ${item.unit} من (${item.materialName}) بأقل سعر وحدة (${item.minPrice.toLocaleString()} ج.م) وبوفر مالي ${item.potentialSavings.toLocaleString()} ج.م.`,
        status: 'ناجح',
        targetCode: newPoNumber
      })
    );

    dispatch(
      setToastMessage(
        `تم إصدار أمر الشراء (${newPoNumber}) مع "${item.bestValueRecord.supplier}" بأفضل سعر (${item.minPrice.toLocaleString()} ج.م/${item.unit}) وتوفير ${item.potentialSavings.toLocaleString()} ج.م!`
      )
    );
  };

  const categories = ['الكل', 'حديد تسليح', 'كابلات كهربائية', 'أسمنت وخرسانة', 'معدات ميكانيكية', 'تشطيبات معمارية', 'عزل ومواد كيميائية'];

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
            <h2 className="text-lg font-black">إدارة أوامر الشراء وتحليل تباين الأسعار</h2>
            <p className="text-xs opacity-75">إصدار ومتابعة عقود أوامر الشراء ومقارنة تباين أسعار المواد عبر الأوامر لتحديد الموردين الأفضل قيمة</p>
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
            <span>تصدير أوامر الشراء (.csv)</span>
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

      {/* ===================================================================== */}
      {/* PRICE VARIANCE ANALYSIS TABLE SECTION (جدول تحليل تباين الأسعار)        */}
      {/* ===================================================================== */}
      <div className={`p-6 rounded-2xl border shadow-md space-y-5 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black">جدول تحليل تباين الأسعار للمواد المشتراة بين أوامر الشراء المختلفة</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  تحديد الموردين الأفضل قيمة
                </span>
              </div>
              <p className="text-xs opacity-75 mt-0.5">
                رصد ومقارنة فروق أسعار الوحدة لنفس المواد عبر أوامر الشراء المتعددة لحساب نسبة التباين والوفر المالي وتحديد المورد الأعلى كفاءة
              </p>
            </div>
          </div>

          <button
            onClick={handleExportVarianceReport}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              darkMode
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>تصدير تقرير تباين الأسعار (CSV / Excel)</span>
          </button>
        </div>

        {/* Variance Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-900/70 border-emerald-500/25' : 'bg-emerald-50/50 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold opacity-75">إجمالي الوفر المالي المحتمل</span>
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-emerald-500 tabular-nums">
              {totalPotentialSavings.toLocaleString()} ج.م
            </div>
            <p className="text-[11px] opacity-70 mt-1">عند التوحيد على الموردين الأقل سعراً والأعلى قيمة</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-900/70 border-amber-500/25' : 'bg-amber-50/50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold opacity-75">متوسط نسبة تباين الأسعار</span>
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-black text-amber-500 tabular-nums">
              {avgVariancePct}%
            </div>
            <p className="text-[11px] opacity-70 mt-1">متوسط الفجوة بين أقل وأعلى سعر أمر شراء</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-900/70 border-rose-500/25' : 'bg-rose-50/50 border-rose-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold opacity-75">أعلى تباين سعري مرصود</span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-sm font-black text-rose-500 truncate">
              {highestVarianceItem?.materialName}
            </div>
            <p className="text-[11px] opacity-70 mt-1">
              تباين بنسبة <strong className="text-rose-500">{highestVarianceItem?.variancePct}%</strong> بين أوامر الشراء
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-slate-900/70 border-indigo-500/25' : 'bg-indigo-50/50 border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold opacity-75">المواد المشمولة بالتحليل</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-indigo-500 dark:text-indigo-400 tabular-nums">
              {analyzedMaterials.length} مواد رئيسية
            </div>
            <p className="text-[11px] opacity-70 mt-1">
              عبر {analyzedMaterials.reduce((s, m) => s + m.purchases.length, 0)} أمر شراء مقارن بالمشاريع
            </p>
          </div>
        </div>

        {/* Variance Filters & Sorting Bar */}
        <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-900/60 border-slate-700/70' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute right-3 top-2.5 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="ابحث باسم المادة، اسم المورد، المشروع، أو رقم أمر الشراء (مثل PR-0268)..."
              value={varianceSearch}
              onChange={(e) => setVarianceSearch(e.target.value)}
              className={`w-full pr-9 pl-3 py-2 rounded-xl border text-xs focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setVarianceCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  varianceCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : darkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold opacity-75">ترتيب حسب:</span>
            <select
              value={varianceSortBy}
              onChange={(e) => setVarianceSortBy(e.target.value as 'variance_pct' | 'savings' | 'lowest_price')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="variance_pct">الأعلى في نسبة التباين السعري (%)</option>
              <option value="savings">الأعلى في الوفر المالي المحقق (ج.م)</option>
              <option value="lowest_price">الأقل في سعر الوحدة</option>
            </select>
          </div>
        </div>

        {/* Main Price Variance Analysis Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700/20">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className={`border-b ${
                darkMode ? 'bg-slate-900/90 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3.5 px-4">المادة المشتراة والتصنيف</th>
                <th className="py-3.5 px-4">مقارنة أوامر الشراء (سعر الوحدة بكل أمر)</th>
                <th className="py-3.5 px-4">أقل / أعلى سعر وحدة</th>
                <th className="py-3.5 px-4">متوسط السعر</th>
                <th className="py-3.5 px-4">نسبة ومقدار التباين</th>
                <th className="py-3.5 px-4">الوفر المالي للدفعة</th>
                <th className="py-3.5 px-4">المورد الأفضل قيمة (Best Value)</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filteredVarianceMaterials.length > 0 ? (
                filteredVarianceMaterials.map((item) => {
                  const isExpanded = expandedMaterialId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`transition ${
                          isExpanded
                            ? darkMode
                              ? 'bg-indigo-950/30'
                              : 'bg-amber-50/40'
                            : darkMode
                            ? 'hover:bg-white/5'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Material Info */}
                        <td className="py-4 px-4 min-w-[210px]">
                          <div className="font-black text-xs leading-snug">{item.materialName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-bold text-[10px]">
                              {item.category}
                            </span>
                            <span className="text-[11px] opacity-65">
                              الدفعة المرجعية: {item.standardBatchQty} {item.unit}
                            </span>
                          </div>
                        </td>

                        {/* Purchase Orders Price Pills */}
                        <td className="py-4 px-4 min-w-[260px]">
                          <div className="flex flex-col gap-1.5">
                            {item.purchases.slice(0, 3).map((po, idx) => {
                              const isMin = po.unitPrice === item.minPrice;
                              const isMax = po.unitPrice === item.maxPrice && item.minPrice !== item.maxPrice;
                              return (
                                <div
                                  key={`${po.poCode}-${idx}`}
                                  className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg border text-[11px] ${
                                    isMin
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                      : isMax
                                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                                      : darkMode
                                      ? 'bg-slate-900/60 border-slate-700 text-slate-300'
                                      : 'bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-black">{po.poCode}</span>
                                    <span className="opacity-75 truncate max-w-[115px]" title={po.supplier}>
                                      ({po.supplier})
                                    </span>
                                  </div>
                                  <span className="font-black tabular-nums shrink-0">
                                    {po.unitPrice.toLocaleString()} ج.م
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* Min vs Max Unit Price */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-500 font-black tabular-nums">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15">الأقل</span>
                              <span>{item.minPrice.toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-rose-500 font-bold tabular-nums">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15">الأعلى</span>
                              <span>{item.maxPrice.toLocaleString()} ج.م</span>
                            </div>
                          </div>
                        </td>

                        {/* Average Unit Price */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold tabular-nums">{item.avgPrice.toLocaleString()} ج.م</div>
                          <span className="text-[10px] opacity-60">لكل {item.unit}</span>
                        </td>

                        {/* Price Variance % & Spread */}
                        <td className="py-4 px-4 min-w-[140px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums ${
                                item.variancePct >= 15
                                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                                  : item.variancePct >= 10
                                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                              }`}
                            >
                              +{item.variancePct}% تباين
                            </span>
                          </div>
                          <div className="text-[11px] opacity-75 mt-1 tabular-nums">
                            الفرق: <strong>{item.unitSpread.toLocaleString()} ج.م</strong> / {item.unit}
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-700/20 mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.variancePct >= 15
                                  ? 'bg-rose-500'
                                  : item.variancePct >= 10
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, item.variancePct * 4)}%` }}
                            />
                          </div>
                        </td>

                        {/* Potential / Realized Batch Savings */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-black text-sm text-emerald-500 tabular-nums">
                            {item.potentialSavings.toLocaleString()} ج.م
                          </div>
                          <span className="text-[10px] opacity-70 block">
                            وفر لكل {item.standardBatchQty} {item.unit}
                          </span>
                        </td>

                        {/* Best Value Supplier */}
                        <td className="py-4 px-4 min-w-[200px]">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                أفضل قيمة مقابل السعر
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] tabular-nums">
                                {item.bestValueRecord.valueScore}/100
                              </span>
                            </div>
                            <div className="font-black text-xs mt-1">{item.bestValueRecord.supplier}</div>
                            <div className="flex items-center gap-2 text-[10px] opacity-80 mt-1">
                              <span>جودة {item.bestValueRecord.qualityScore}%</span>
                              <span>•</span>
                              <span>{item.bestValueRecord.paymentTerms}</span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={() => handleIssueBestValuePO(item)}
                              className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[11px] shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>شراء بأفضل سعر</span>
                            </button>
                            <button
                              onClick={() => setExpandedMaterialId(isExpanded ? null : item.id)}
                              className={`w-full px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                                darkMode
                                  ? 'bg-slate-900 hover:bg-slate-700 border-slate-700 text-slate-300'
                                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                              }`}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>إخفاء تفاصيل الأوامر</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>مقارنة الأوامر ({item.purchases.length})</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detailed Sub-Table for all POs of this Material */}
                      {isExpanded && (
                        <tr className={darkMode ? 'bg-slate-900/95' : 'bg-slate-50/90'}>
                          <td colSpan={8} className="p-4 border-b border-amber-500/30">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-amber-500" />
                                  <span className="font-black text-xs">
                                    التحليل التفصيلي لأوامر الشراء الخاصة بمادة: {item.materialName}
                                  </span>
                                </div>
                                <span className="text-[11px] text-emerald-500 font-bold">
                                  التوصية: التعاقد مع ({item.bestValueRecord.supplier}) يوفر {item.unitSpread.toLocaleString()} ج.م لكل {item.unit} مقارنة بأعلى أمر شراء ({item.highestPriceRecord.poCode})
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {item.purchases.map((po, index) => {
                                  const isBest = po.poCode === item.bestValueRecord.poCode && po.supplier === item.bestValueRecord.supplier;
                                  const diffFromMin = po.unitPrice - item.minPrice;
                                  const pctFromMin = item.minPrice > 0 ? Number(((diffFromMin / item.minPrice) * 100).toFixed(1)) : 0;

                                  return (
                                    <div
                                      key={`${po.poCode}-detail-${index}`}
                                      className={`p-3.5 rounded-xl border transition ${
                                        isBest
                                          ? 'border-emerald-500/50 bg-emerald-500/10'
                                          : darkMode
                                          ? 'border-slate-800 bg-slate-800/70'
                                          : 'border-slate-200 bg-white'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-700/20">
                                        <div className="flex items-center gap-1.5">
                                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-black text-[11px]">
                                            {po.poCode}
                                          </span>
                                          <span className="text-[11px] opacity-70">{po.date}</span>
                                        </div>
                                        {isBest ? (
                                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            الأفضل قيمة
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 font-bold text-[10px]">
                                            +{pctFromMin}% عن أقل سعر
                                          </span>
                                        )}
                                      </div>

                                      <div className="mt-2.5 space-y-1.5 text-[11px]">
                                        <div className="font-black text-xs">{po.supplier}</div>
                                        <div className="flex justify-between">
                                          <span className="opacity-70">المشروع:</span>
                                          <span className="font-bold">{po.project}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="opacity-70">الكمية المشتراة:</span>
                                          <span className="font-bold tabular-nums">
                                            {po.quantity.toLocaleString()} {item.unit}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="opacity-70">سعر الوحدة بأمر الشراء:</span>
                                          <span className={`font-black tabular-nums ${isBest ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {po.unitPrice.toLocaleString()} ج.م
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="opacity-70">الفرق عن أفضل سعر:</span>
                                          <span className="font-bold tabular-nums">
                                            {diffFromMin === 0 ? '0 ج.م (أقل سعر مرجعي)' : `+${diffFromMin.toLocaleString()} ج.م / ${item.unit}`}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="opacity-70">تقييم الجودة والتوريد:</span>
                                          <span className="font-bold">
                                            جودة {po.qualityScore}% • خلال {po.deliveryDays} أيام
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="opacity-70">شروط الدفع:</span>
                                          <span className="font-bold text-indigo-400">{po.paymentTerms}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm opacity-60">
                    لا توجد مواد مطابقة لمعايير البحث في جدول تحليل تباين الأسعار.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Search and Status Filters Bar for Purchase Orders */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute right-3.5 top-3 w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="البحث في سجل أوامر الشراء برقم الأمر، المورد أو المشروع..."
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

      {/* Purchase Orders Registry Table */}
      <div className={`rounded-2xl border shadow-md overflow-hidden ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
      }`}>
        <div className="px-5 py-3.5 border-b border-slate-700/20 flex items-center justify-between">
          <h3 className="font-black text-sm">سجل عقود وأوامر الشراء الصادرة ({filtered.length})</h3>
          <span className="text-xs opacity-65">يتم تحديث السجل تلقائياً عند إصدار أوامر شراء بأفضل سعر من جدول التباين أعلاه</span>
        </div>
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


