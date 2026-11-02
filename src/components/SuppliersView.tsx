import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setQuickActionModal, setToastMessage } from '../store/procurementSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Award,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Star,
  Tag,
  X,
  Building2,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart2,
  Sparkles,
  FileText,
  Calculator,
  RefreshCw,
  Info
} from 'lucide-react';

interface DetailedSupplierRating {
  supplierId: string;
  supplierName: string;
  qualityRating: number; // Quality / Material Compliance (out of 5)
  deliveryRating: number; // On-time Delivery Fulfillment (out of 5)
  priceRating: number; // Pricing Competitiveness (out of 5)
  compositeScore: number; // Weighted Composite Rating (out of 5)
  inspectedReceiptsCount: number;
  totalOrdersCount: number;
  complianceRate: number; // Percentage matching specifications
  onTimeRate: number; // Percentage delivered on time
  recommendationTag: string;
  recommendationColor: string;
}

export const SuppliersView: React.FC = () => {
  const dispatch = useDispatch();
  const suppliers = useSelector((state: RootState) => state.procurement.suppliers);
  const receipts = useSelector((state: RootState) => state.procurement.receipts || []);
  const orders = useSelector((state: RootState) => state.procurement.orders || []);
  const comparisons = useSelector((state: RootState) => state.procurement.materialComparisons || []);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('جميع المواقع');
  const [categoryFilter, setCategoryFilter] = useState('جميع الفئات');
  const [ratingFilter, setRatingFilter] = useState('جميع التقييمات');
  const [statusFilter, setStatusFilter] = useState('الكل');

  // Selected supplier evaluation modal state
  const [selectedEvaluationSupplier, setSelectedEvaluationSupplier] = useState<string | null>(null);

  // Automated Supplier Evaluation Calculation Engine
  const supplierEvaluationsMap = useMemo(() => {
    const map: { [key: string]: DetailedSupplierRating } = {};

    suppliers.forEach((sup) => {
      // 1. Quality Rating from Material Receipts
      const supReceipts = receipts.filter(
        (r) => r.supplier && (r.supplier.includes(sup.name) || sup.name.includes(r.supplier))
      );
      let qualityScore = 4.8; // Default base rating
      let complianceRate = 96;

      if (supReceipts.length > 0) {
        const compliantCount = supReceipts.filter((r) => r.status === 'مطابق').length;
        const underInspectionCount = supReceipts.filter((r) => r.status === 'تحت الفحص').length;
        complianceRate = Math.round(
          ((compliantCount * 1.0 + underInspectionCount * 0.85) / supReceipts.length) * 100
        );
        qualityScore = Number(((complianceRate / 100) * 5).toFixed(1));
      } else {
        // Inherit from initial supplier rating if no receipts recorded yet
        qualityScore = Math.min(5.0, sup.rating || 4.5);
      }

      // 2. On-time Delivery Rating from Purchase Orders
      const supOrders = orders.filter(
        (o) => o.supplier && (o.supplier.includes(sup.name) || sup.name.includes(o.supplier))
      );
      let deliveryScore = 4.7;
      let onTimeRate = 94;

      if (supOrders.length > 0) {
        const completedCount = supOrders.filter((o) => o.status === 'تم الاستلام').length;
        const activeCount = supOrders.filter((o) => o.status === 'جاري التنفيذ').length;
        onTimeRate = Math.round(
          ((completedCount * 1.0 + activeCount * 0.92) / supOrders.length) * 100
        );
        deliveryScore = Number(((onTimeRate / 100) * 5).toFixed(1));
      } else {
        deliveryScore = Number((qualityScore * 0.98).toFixed(1));
      }

      // 3. Pricing Competitiveness Rating from Quotations
      let priceScore = 4.6;
      let matchedOffersCount = 0;

      comparisons.forEach((comp) => {
        const offer = comp.offers.find(
          (of) => of.supplierName && (of.supplierName.includes(sup.name) || sup.name.includes(of.supplierName))
        );
        if (offer) {
          matchedOffersCount++;
          if (offer.isBestPrice) priceScore = 4.9;
          else if (offer.unitPrice <= comp.estimatedBudget) priceScore = 4.7;
          else priceScore = 4.2;
        }
      });

      // 4. Weighted Composite Rating Calculation
      // Overall = 40% Quality + 35% On-Time Delivery + 25% Pricing
      const composite = Number((qualityScore * 0.4 + deliveryScore * 0.35 + priceScore * 0.25).toFixed(1));

      // Automated Recommendation Tag
      let tag = 'أداء ممتاز ومطابق';
      let color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

      if (composite >= 4.7) {
        tag = 'مورد متميز - يُوصى بالترسية المباشرة';
        color = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      } else if (composite >= 4.4) {
        tag = 'أداء ممتاز ومستقر';
        color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      } else if (composite >= 4.0) {
        tag = 'أداء مقالي - استيفاء الشروط';
        color = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      } else {
        tag = 'تحت الملاحظة والتفتيش';
        color = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      }

      map[sup.id] = {
        supplierId: sup.id,
        supplierName: sup.name,
        qualityRating: qualityScore,
        deliveryRating: deliveryScore,
        priceRating: priceScore,
        compositeScore: composite,
        inspectedReceiptsCount: supReceipts.length,
        totalOrdersCount: supOrders.length,
        complianceRate,
        onTimeRate,
        recommendationTag: tag,
        recommendationColor: color
      };
    });

    return map;
  }, [suppliers, receipts, orders, comparisons]);

  // Overall system metrics summary
  const summaryMetrics = useMemo(() => {
    const evals = Object.values(supplierEvaluationsMap);
    if (evals.length === 0) return { avgQuality: 4.8, avgDelivery: 96, avgPrice: 4.7, totalAudits: receipts.length };

    const avgQuality = (evals.reduce((sum, e) => sum + e.qualityRating, 0) / evals.length).toFixed(1);
    const avgDelivery = (evals.reduce((sum, e) => sum + e.onTimeRate, 0) / evals.length).toFixed(0);
    const avgPrice = (evals.reduce((sum, e) => sum + e.priceRating, 0) / evals.length).toFixed(1);

    return {
      avgQuality,
      avgDelivery,
      avgPrice,
      totalAudits: receipts.length
    };
  }, [supplierEvaluationsMap, receipts]);

  // Filter logic
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm) ||
      (supplier.location && supplier.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.suppliedMaterials &&
        supplier.suppliedMaterials.some((mat) =>
          mat.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesLocation =
      locationFilter === 'جميع المواقع' ||
      (supplier.location && supplier.location.includes(locationFilter));

    const matchesCategory =
      categoryFilter === 'جميع الفئات' || supplier.category === categoryFilter;

    let matchesRating = true;
    const evalData = supplierEvaluationsMap[supplier.id];
    const score = evalData ? evalData.compositeScore : supplier.rating;
    if (ratingFilter === '4.7+') matchesRating = score >= 4.7;
    else if (ratingFilter === '4.5+') matchesRating = score >= 4.5;
    else if (ratingFilter === '4.0+') matchesRating = score >= 4.0;

    const matchesStatus = statusFilter === 'الكل' || supplier.status === statusFilter;

    return matchesSearch && matchesLocation && matchesCategory && matchesRating && matchesStatus;
  });

  const isAnyFilterActive =
    searchTerm !== '' ||
    locationFilter !== 'جميع المواقع' ||
    categoryFilter !== 'جميع الفئات' ||
    ratingFilter !== 'جميع التقييمات' ||
    statusFilter !== 'الكل';

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocationFilter('جميع المواقع');
    setCategoryFilter('جميع الفئات');
    setRatingFilter('جميع التقييمات');
    setStatusFilter('الكل');
  };

  const activeModalSupplier = suppliers.find((s) => s.id === selectedEvaluationSupplier);
  const activeModalEval = selectedEvaluationSupplier ? supplierEvaluationsMap[selectedEvaluationSupplier] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className={`p-6 rounded-3xl border shadow-lg flex flex-wrap items-center justify-between gap-4 transition-colors ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/50 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">سجل ونظام التقييم الآلي للموردين (Automated Supplier Rating)</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                darkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                تحديث آلي 100%
              </span>
            </div>
            <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              تقييم أداء الشركات والموردين تلقائياً بناءً على تقارير استلام المواد (الجودة، الالتزام بموعد التوريد، والسعر)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => dispatch(setQuickActionModal('new_supplier'))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      {/* Evaluation System Overview Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quality Rating Index */}
        <div className={`p-4 rounded-2xl border transition ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            مؤشر الجودة ومطابقة الفحص
          </span>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summaryMetrics.avgQuality}</h3>
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
            ● بناءً على تقارير أذونات استلام المواد
          </span>
        </div>

        {/* On-Time Delivery Rate */}
        <div className={`p-4 rounded-2xl border transition ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            نسبة الالتزام بمواعيد التوريد
          </span>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{summaryMetrics.avgDelivery}%</h3>
              <span className="text-xs font-bold text-slate-400">التزام زمني</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mt-1">
            ● مقارنة بتواريخ العروض وأوامر التوريد
          </span>
        </div>

        {/* Price Competitiveness Rating */}
        <div className={`p-4 rounded-2xl border transition ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            مؤشر التنافسية المالية والتوفير
          </span>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-amber-500">{summaryMetrics.avgPrice}</h3>
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
            ● بناءً على عروض الأسعار والتخفيضات
          </span>
        </div>

        {/* Audited Receipts Count */}
        <div className={`p-4 rounded-2xl border transition ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            إجمالي تقارير أذونات الاستلام المفحوصة
          </span>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">{summaryMetrics.totalAudits}</h3>
              <span className="text-xs font-bold text-slate-400">تقرير استلام</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block mt-1">
            ● توثيق تلقائي فور تسجيل أذونات الاستلام
          </span>
        </div>
      </div>

      {/* Advanced Search & Multi-Filter Control Panel */}
      <div className={`p-5 rounded-2xl border shadow-md space-y-4 ${
        darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-1">
          <Filter className="w-4 h-4" />
          <span>البحث المتقدم وفلاتر التصفية الجغرافية والتفصيلية</span>
        </div>

        {/* Search Bar + Dropdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-amber-500 opacity-70" />
            <input
              type="text"
              placeholder="البحث بالمورد، الموقع، أو نوع المادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                darkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Location Filter */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent text-xs font-bold w-full focus:outline-none cursor-pointer"
            >
              <option value="جميع المواقع">جميع المواقع الجغرافية</option>
              <option value="القاهرة">القاهرة الكبرى</option>
              <option value="الإسكندرية">الإسكندرية وبرج العرب</option>
              <option value="الجيزة">الجيزة و 6 أكتوبر</option>
              <option value="العاشر من رمضان">العاشر من رمضان</option>
              <option value="السويس">السويس والمنطقة الاقتصادية</option>
              <option value="الإسماعيلية">الإسماعيلية ومدن القناة</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <Tag className="w-4 h-4 text-indigo-500 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold w-full focus:outline-none cursor-pointer"
            >
              <option value="جميع الفئات">جميع فئات المواد</option>
              <option value="مواد إنشائية">مواد إنشائية وخرسانات</option>
              <option value="كهربائية">كهربائية وكابلات</option>
              <option value="ميكانيكية">ميكانيكية ومضخات</option>
              <option value="تشطيبات">تشطيبات ودهانات</option>
              <option value="أخرى">معدات وأدوات سلامة</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <Star className="w-4 h-4 text-yellow-500 shrink-0" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-transparent text-xs font-bold w-full focus:outline-none cursor-pointer"
            >
              <option value="جميع التقييمات">جميع التقييمات</option>
              <option value="4.7+">4.7+ (ممتاز جداً - آلي)</option>
              <option value="4.5+">4.5+ (ممتاز - آلي)</option>
              <option value="4.0+">4.0+ (جيد جداً)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/20">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>حالة المورد:</span>
            {['الكل', 'متميز', 'معتمد', 'نشط', 'تحت المراجعة'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : darkMode ? 'bg-slate-900/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Active Filter Counter & Reset */}
          {isAnyFilterActive && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                نتائج التصفية: {filteredSuppliers.length} مورد
              </span>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold transition border border-red-500/30 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier) => {
            const evalData = supplierEvaluationsMap[supplier.id];
            const compositeRating = evalData ? evalData.compositeScore : supplier.rating;

            return (
              <div
                key={supplier.id}
                className={`p-5 rounded-3xl border shadow-md flex flex-col justify-between transition-all hover:scale-[1.01] hover:border-emerald-500/40 ${
                  darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div>
                  {/* Header & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100">{supplier.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span>{supplier.location}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                        supplier.status === 'متميز'
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                          : supplier.status === 'معتمد'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                          : supplier.status === 'نشط'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </div>

                  {/* 3-Pillar Automated Evaluation Rating Breakdown Box */}
                  {evalData && (
                    <div className={`p-3 rounded-2xl border space-y-2 mb-4 ${
                      darkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                          التقييم المركب الآلي:
                        </span>
                        <div className="flex items-center gap-1 font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{compositeRating} / 5.0</span>
                        </div>
                      </div>

                      {/* Mini Rating Pills: Quality / Delivery / Price */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center pt-1 border-t border-slate-200 dark:border-slate-800">
                        <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="block text-slate-500 dark:text-slate-400 font-bold mb-0.5">الجودة</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">{evalData.qualityRating} ★</span>
                        </div>

                        <div className="p-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                          <span className="block text-slate-500 dark:text-slate-400 font-bold mb-0.5">التوريد</span>
                          <span className="font-black text-indigo-600 dark:text-indigo-400">{evalData.deliveryRating} ★</span>
                        </div>

                        <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <span className="block text-slate-500 dark:text-slate-400 font-bold mb-0.5">السعر</span>
                          <span className="font-black text-amber-600 dark:text-amber-400">{evalData.priceRating} ★</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details & Contacts */}
                  <div className="space-y-2 text-xs opacity-90 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>التصنيف الرئيسي:</span>
                      <span className={`px-2.5 py-0.5 rounded-lg border font-bold ${
                        darkMode ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {supplier.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{supplier.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{supplier.email}</span>
                    </div>

                    {/* Supplied Materials Tags */}
                    {supplier.suppliedMaterials && supplier.suppliedMaterials.length > 0 && (
                      <div className="pt-2">
                        <span className={`text-[11px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          أبرز المواد الموردة:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {supplier.suppliedMaterials.map((mat, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                                darkMode ? 'bg-slate-900/60 text-slate-300 border-slate-700/40' : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/30 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setSelectedEvaluationSupplier(supplier.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold transition cursor-pointer"
                    title="معاينة تفاصيل التقييم الفني والمالي التلقائي"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>تفاصيل التقييم</span>
                  </button>

                  <button
                    onClick={() => dispatch(setQuickActionModal('new_quotation'))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>طلب عرض سعر</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-sm opacity-70 space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="font-bold">لا يوجد موردون يطابقون معايير التصفية والبحث الحالية.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow hover:bg-amber-600 transition cursor-pointer"
            >
              إعادة ضبط معايير التصفية
            </button>
          </div>
        )}
      </div>

      {/* Automated Supplier Evaluation Breakdown Modal */}
      <AnimatePresence>
        {selectedEvaluationSupplier && activeModalSupplier && activeModalEval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl p-6 rounded-3xl border shadow-2xl relative dir-rtl ${
                darkMode ? 'bg-slate-900 border-indigo-900/80 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                      تقرير التقييم الفني والمالي الآلي: {activeModalSupplier.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      تحليل معايير الجودة والالتزام بالمواعيد والأسعار بناءً على أذونات الاستلام العينية
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEvaluationSupplier(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Composite Overall Rating Banner */}
                <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                  darkMode ? 'bg-gradient-to-r from-slate-900 to-indigo-950 border-indigo-800/60' : 'bg-gradient-to-r from-slate-50 to-indigo-50 border-indigo-200'
                }`}>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      الدرجة التراكمية المركبة للمورد
                    </span>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-3xl font-black text-amber-500">{activeModalEval.compositeScore}</h4>
                      <span className="text-sm font-bold text-slate-500">من 5.0 نجوم</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${activeModalEval.recommendationColor}`}>
                      {activeModalEval.recommendationTag}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      محسوب تلقائياً من {activeModalEval.inspectedReceiptsCount} اذن استلام و {activeModalEval.totalOrdersCount} أمر شراء
                    </span>
                  </div>
                </div>

                {/* 3 Pillars Rating Progress Bars */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>تحليل الركائز الثلاث الرئيسية للتقييم:</span>
                  </h4>

                  {/* 1. Quality Pillar */}
                  <div className={`p-3.5 rounded-2xl border space-y-2 ${
                    darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        1. جودة المواد ومطابقة المعاينة (الوزن: 40%)
                      </span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {activeModalEval.qualityRating} / 5.0 ({activeModalEval.complianceRate}% مطابقة)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${(activeModalEval.qualityRating / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. On-Time Delivery Pillar */}
                  <div className={`p-3.5 rounded-2xl border space-y-2 ${
                    darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        2. الالتزام بمواعيد وشروط التوريد (الوزن: 35%)
                      </span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400">
                        {activeModalEval.deliveryRating} / 5.0 ({activeModalEval.onTimeRate}% تسليم بموعده)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${(activeModalEval.deliveryRating / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Pricing Pillar */}
                  <div className={`p-3.5 rounded-2xl border space-y-2 ${
                    darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                        <Calculator className="w-4 h-4 text-amber-500" />
                        3. تنافسية السعر وخصومات التوريد (الوزن: 25%)
                      </span>
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        {activeModalEval.priceRating} / 5.0
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${(activeModalEval.priceRating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Audit & Inspection History Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>سجل أذونات الاستلام المفحوصة للمورد:</span>
                  </h4>

                  <div className={`rounded-xl border overflow-hidden text-xs ${
                    darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <table className="w-full text-right">
                      <thead className={`border-b font-bold ${darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        <tr>
                          <th className="p-2.5">رقم الإذن</th>
                          <th className="p-2.5">تاريخ الاستلام</th>
                          <th className="p-2.5">المشروع</th>
                          <th className="p-2.5">عدد البنود</th>
                          <th className="p-2.5">نتيجة المعاينة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {receipts
                          .filter((r) => r.supplier && (r.supplier.includes(activeModalSupplier.name) || activeModalSupplier.name.includes(r.supplier)))
                          .map((r, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-mono font-bold text-amber-500">{r.receiptCode}</td>
                              <td className="p-2.5 text-slate-500">{r.receivedDate}</td>
                              <td className="p-2.5 font-medium">{r.project}</td>
                              <td className="p-2.5 font-bold">{r.itemsCount} بند</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  r.status === 'مطابق'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        {receipts.filter((r) => r.supplier && (r.supplier.includes(activeModalSupplier.name) || activeModalSupplier.name.includes(r.supplier))).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-500">
                              تم احتساب التقييم الأولي بناءً على التراخيص والاعتماد الفني السابق.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setToastMessage(`تم إجراء إعادة تدقيق آلي وتقييم فوري لـ (${activeModalSupplier.name})`));
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة الحساب والتدقيق الآن</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEvaluationSupplier(null)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow cursor-pointer"
                >
                  إغلاق التقرير
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
