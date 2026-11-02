import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
  setSelectedComparisonId,
  awardQuotationToSupplier,
  SupplierQuoteOffer,
  MaterialComparison
} from '../store/procurementSlice';
import {
  Tag,
  Award,
  Clock,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  Building2,
  Truck,
  Sparkles,
  FileCheck,
  AlertCircle,
  BarChart3,
  ChevronLeft,
  Printer,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SupplierComparisonView: React.FC = () => {
  const dispatch = useDispatch();
  const comparisons = useSelector((state: RootState) => state.procurement.materialComparisons);
  const selectedComparisonId = useSelector((state: RootState) => state.procurement.selectedComparisonId);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);

  const [activeCriterion, setActiveCriterion] = useState<'balanced' | 'price' | 'quality' | 'delivery'>('balanced');
  const [awardConfirmOffer, setAwardConfirmOffer] = useState<SupplierQuoteOffer | null>(null);

  const currentComp = comparisons.find((c: MaterialComparison) => c.id === selectedComparisonId) || comparisons[0];

  if (!currentComp) return null;

  // Find lowest price, fastest delivery, highest quality in current comparison
  const minPrice = Math.min(...currentComp.offers.map((o: SupplierQuoteOffer) => o.totalPrice));
  const minDelivery = Math.min(...currentComp.offers.map((o: SupplierQuoteOffer) => o.deliveryDays));
  const maxQuality = Math.max(...currentComp.offers.map((o: SupplierQuoteOffer) => o.qualityScore));

  const recommendedOffer = currentComp.offers.find((o: SupplierQuoteOffer) => o.isRecommended) || currentComp.offers[0];

  const handleConfirmAward = () => {
    if (awardConfirmOffer) {
      dispatch(awardQuotationToSupplier({ comparisonId: currentComp.id, offer: awardConfirmOffer }));
      setAwardConfirmOffer(null);
    }
  };

  const handlePrintMatrix = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">مقارنة عروض الأسعار الذكية للموردين</h1>
              <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                مصفوفة الترسية الفنية
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              مقارنة فورية جنبًا إلى جنب للأسعار، جودة المواد والمطابقة، ومواعيد التوريد بالموقع لاتخاذ قرار الترسية المالي
            </p>
          </div>
        </div>

        <button
          onClick={handlePrintMatrix}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-500" />
          <span>تصدير/طباعة مصفوفة التحليل</span>
        </button>
      </div>

      {/* Material Requisition Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">اختر المادة والمشروع المطلوب مقارنة عروض أسعاره:</p>
        <div className="flex flex-wrap items-center gap-2">
          {comparisons.map((comp: MaterialComparison) => {
            const isSelected = comp.id === currentComp.id;
            return (
              <button
                key={comp.id}
                onClick={() => dispatch(setSelectedComparisonId(comp.id))}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-500'}`} />
                <span>{comp.materialName}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {comp.offers.length} عروض
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Material Info Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">المادة المطلوبة</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{currentComp.materialName}</p>
          <p className="text-xs text-amber-500 mt-1 font-medium">{currentComp.category}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">المشروع المستهدف</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{currentComp.project}</p>
          <p className="text-xs text-slate-400 mt-1">موقع العمل الرئيسي</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">الكمية المطلوبة</p>
          <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 tabular-nums">{currentComp.requiredQuantity}</p>
          <p className="text-xs text-slate-400 mt-1">حسب طلب الموقع PR</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">الميزانية التقديرية المعتمدة</p>
          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {currentComp.estimatedBudget.toLocaleString('ar-EG')} ج.م
          </p>
          <p className="text-xs text-emerald-500 mt-1 font-medium">مغطاة مالياً</p>
        </div>
      </div>

      {/* Smart AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">توصية محرك التحليل الذكي للترسية</h3>
              <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                أعلى تقييم متكامل
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              يوصى بالترسية على <strong className="text-amber-600 dark:text-amber-400">{recommendedOffer.supplierName}</strong> لكونها توفر أفضل توازن بين السعر التنافسي ({recommendedOffer.totalPrice.toLocaleString('ar-EG')} ج.م)، وسرعة التوريد بالموقع ({recommendedOffer.deliveryDays} أيام)، وأعلى نسبة مطابقة جودة ({recommendedOffer.qualityScore}%).
            </p>
          </div>
        </div>

        <button
          onClick={() => setAwardConfirmOffer(recommendedOffer)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>اعتماد الترسية على {recommendedOffer.supplierName}</span>
        </button>
      </div>

      {/* Main Side-by-Side Comparison Cards Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>عروض أسعار الشركات المقارنة جنبًا إلى جنب</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({currentComp.offers.length} عروض مقدمة)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentComp.offers.map((offer: SupplierQuoteOffer) => {
            const isLowestPrice = offer.totalPrice === minPrice;
            const isFastest = offer.deliveryDays === minDelivery;
            const isBestQuality = offer.qualityScore === maxQuality;
            const savings = currentComp.estimatedBudget - offer.totalPrice;

            return (
              <motion.div
                key={offer.supplierId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden relative ${
                  offer.isRecommended
                    ? 'border-amber-500 ring-2 ring-amber-500/20 dark:ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Recommender Banner Strip if applicable */}
                {offer.isRecommended && (
                  <div className="bg-amber-500 text-slate-950 text-xs font-black py-1 px-4 text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>العرض الفائز والمستحسن آلياً</span>
                  </div>
                )}

                <div className="p-6 space-y-5">
                  {/* Supplier Info Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                        {offer.supplierName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{offer.location}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                        <span>★</span>
                        <span className="tabular-nums">{offer.reliabilityScore}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">تقييم الأداء</span>
                    </div>
                  </div>

                  {/* Highlights Badges Row */}
                  <div className="flex flex-wrap gap-1.5">
                    {isLowestPrice && (
                      <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> أقل سعر منافس
                      </span>
                    )}
                    {isFastest && (
                      <span className="text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" /> أسرع توريد للموقع
                      </span>
                    )}
                    {isBestQuality && (
                      <span className="text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> أعلى مطابقة جودة
                      </span>
                    )}
                  </div>

                  {/* Pricing Matrix Breakdown */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">سعر الوحدة:</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {offer.unitPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">رسوم النقل والتسليم:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {offer.shippingCost === 0 ? 'مجاناً (شامل)' : `${offer.shippingCost.toLocaleString('ar-EG')} ج.م`}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">إجمالي قيمة العرض:</span>
                      <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                        {offer.totalPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    {savings > 0 && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold text-left pt-1">
                        وفر مالي: {savings.toLocaleString('ar-EG')} ج.م عن الميزانية
                      </p>
                    )}
                  </div>

                  {/* Quality & Lead Time Specs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        <span>مستوى جودة المواد:</span>
                        <span className="text-amber-500 font-bold tabular-nums">{offer.qualityScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${offer.qualityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-0.5">زمن التوريد:</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">{offer.deliveryDays} أيام عمل</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-0.5">شهادة الأيزو:</span>
                        <span className={`font-bold ${offer.isoCertified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                          {offer.isoCertified ? 'معتمدة ISO' : 'غير متوفرة'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block mb-0.5">شروط الدفع والتسهيلات:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{offer.paymentTerms}</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block mb-0.5">فترة الضمان:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{offer.warrantyPeriod}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                      "{offer.notes}"
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setAwardConfirmOffer(offer)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      offer.isRecommended
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اختيار الترسية وإصدار أمر الشراء</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Comparative Rating Scale Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">جدول المفاضلة الشامل ومصفوفة النقاط الفنية</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">اسم المورد</th>
                <th className="p-3">إجمالي السعر (ج.م)</th>
                <th className="p-3">سرعة التوريد</th>
                <th className="p-3">درجة الجودة</th>
                <th className="p-3">تسهيلات الدفع</th>
                <th className="p-3">شهادة المطابقة</th>
                <th className="p-3 text-center">القرار والتصنيف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentComp.offers.map((offer: SupplierQuoteOffer) => (
                <tr key={offer.supplierId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {offer.supplierName}
                  </td>
                  <td className="p-3 font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                    {offer.totalPrice.toLocaleString('ar-EG')} ج.م
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {offer.deliveryDays} أيام
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {offer.qualityScore}%
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {offer.paymentTerms}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${offer.isoCertified ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                      {offer.isoCertified ? 'مطابق ISO' : 'عادي'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setAwardConfirmOffer(offer)}
                      className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      ترسية
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Awarding Purchase Order */}
      <AnimatePresence>
        {awardConfirmOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-500 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">تأكيد اعتماد الترسية</h3>
                  <p className="text-xs text-slate-500">إصدار أمر الشراء التلقائي</p>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                هل أنت تأكد من ترسية عملية التوريد الخاصة بـ <strong className="text-slate-900 dark:text-white">{currentComp.materialName}</strong> على المورد:
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <p className="font-extrabold text-base text-slate-900 dark:text-white">{awardConfirmOffer.supplierName}</p>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>إجمالي القيمة:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{awardConfirmOffer.totalPrice.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>زمن التوريد:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{awardConfirmOffer.deliveryDays} أيام عمل</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setAwardConfirmOffer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmAward}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد الترسية وإصدار PO</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
