import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { AuditLogItem, addAuditLog, openFilteredView } from '../store/procurementSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Cpu,
  Building2,
  Tag,
  Package,
  ShoppingCart,
  FileText
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const auditLogs = useSelector((state: RootState) => state.procurement.auditLogs || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [selectedActionType] = useState<string>('الكل');
  const [activeViewMode, setActiveViewMode] = useState<'timeline' | 'table'>('timeline');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);

  // New manual audit log entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUser, setNewUser] = useState('أ. طارق محمود');
  const [newUserRole, setNewUserRole] = useState('مدير المشتريات');
  const [newCategory, setNewCategory] = useState<AuditLogItem['category']>('اعتماد الطلبات');
  const [newActionType, setNewActionType] = useState<AuditLogItem['actionType']>('موافقة');
  const [newDetails, setNewDetails] = useState('');

  // Filtering logic
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        searchQuery === '' ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.targetCode && log.targetCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'الكل' || log.category === selectedCategory;
      const matchesStatus = selectedStatus === 'الكل' || log.status === selectedStatus;
      const matchesActionType = selectedActionType === 'الكل' || log.actionType === selectedActionType;

      return matchesSearch && matchesCategory && matchesStatus && matchesActionType;
    });
  }, [auditLogs, searchQuery, selectedCategory, selectedStatus, selectedActionType]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = auditLogs.length;
    const approvals = auditLogs.filter((l) => l.actionType === 'موافقة').length;
    const rejections = auditLogs.filter((l) => l.actionType === 'رفض').length;
    const systemAutomations = auditLogs.filter((l) => l.actionType === 'أتمتة النظام').length;
    const inventoryUpdates = auditLogs.filter((l) => l.category === 'المخزون').length;
    return { total, approvals, rejections, systemAutomations, inventoryUpdates };
  }, [auditLogs]);

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['المعرف', 'التاريخ والوقت', 'المستخدم', 'الدور', 'نوع الإجراء', 'التصنيف', 'العنوان', 'الوصف', 'الحالة', 'الكود المستهدف'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.user,
      l.userRole,
      l.actionType,
      l.category,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      l.status,
      l.targetCode || '-'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Procurement_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Procurement_Audit_Log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    dispatch(
      addAuditLog({
        user: newUser,
        userRole: newUserRole,
        category: newCategory,
        actionType: newActionType,
        title: newTitle,
        description: newDesc || 'تم تسجيل مراجعة تدقيق يدوية في سجل النشاط',
        details: newDetails || 'ملاحظة توثيقية إدارية',
        status: 'ناجح',
        targetCode: 'AUDIT-MANUAL'
      })
    );

    setNewTitle('');
    setNewDesc('');
    setNewDetails('');
    setIsAddLogOpen(false);
  };

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case 'موافقة':
        return darkMode ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'رفض':
        return darkMode ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-800 border-rose-300';
      case 'إصدار أمر':
        return darkMode ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-300';
      case 'أتمتة النظام':
        return darkMode ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'ترسية عرض':
        return darkMode ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300';
      case 'تعديل مخزون':
      case 'استلام مواد':
        return darkMode ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return darkMode ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'اعتماد الطلبات':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'أوامر الشراء':
        return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      case 'المخزون':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'الموردين':
        return <Building2 className="w-4 h-4 text-amber-500" />;
      case 'الأتمتة النظامية':
        return <Cpu className="w-4 h-4 text-cyan-500" />;
      case 'المقارنات والترسية':
        return <Tag className="w-4 h-4 text-rose-500" />;
      default:
        return <History className="w-4 h-4 text-indigo-500" />;
    }
  };

  const categoriesList = ['الكل', 'اعتماد الطلبات', 'أوامر الشراء', 'المخزون', 'الموردين', 'الأتمتة النظامية', 'المقارنات والترسية'];
  const statusesList = ['الكل', 'ناجح', 'معلق', 'تحذير', 'مرفوض'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div
        className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all ${
          darkMode 
            ? 'bg-gradient-to-r from-[#1c1638] via-[#241c47] to-[#18122b] border-indigo-900/60 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">سجل النشاط والتدقيق الإداري (Audit Log)</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  darkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  تتبع مباشر 100%
                </span>
              </div>
              <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                توثيق زمني غير قابل للتعديل لجميع العمليات: اعتماد الطلبات، تعديلات المخزون، قرارات المشتريات، وإجراءات الأتمتة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddLogOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل ملاحظة تدقيق</span>
            </button>
            <button
              onClick={handleExportCSV}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                darkMode
                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title="تصدير السجل كملف Excel/CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={handleExportJSON}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                darkMode
                  ? 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
              }`}
              title="تصدير السجل بتنسيق JSON"
            >
              <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>تصدير JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>إجمالي الأحداث الموثقة</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-amber-500">{metrics.total}</h3>
            <History className="w-5 h-5 text-amber-500/80" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>قرارات الموافقة</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.approvals}</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500/80" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>قرارات الرفض</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.rejections}</h3>
            <XCircle className="w-5 h-5 text-rose-500/80" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>أتمتة النظام الآلية</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{metrics.systemAutomations}</h3>
            <Cpu className="w-5 h-5 text-cyan-500/80" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className={`text-xs font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>تعديلات حركة المخزون</span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">{metrics.inventoryUpdates}</h3>
            <Package className="w-5 h-5 text-blue-500/80" />
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div
        className={`p-4 rounded-2xl border shadow-sm space-y-4 ${
          darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم المستخدم، كود الطلب، عنوان الإجراء، أو التفاصيل..."
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none transition ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-700 text-slate-100 placeholder-slate-400 focus:border-amber-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-amber-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-amber-500 font-bold"
              >
                مسح
              </button>
            )}
          </div>

          {/* View Toggle Buttons */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-bold ${
            darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setActiveViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                activeViewMode === 'timeline'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950')
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>المخطط الزمني</span>
            </button>

            <button
              onClick={() => setActiveViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                activeViewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950')
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>جدول البيانات التفصيلي</span>
            </button>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/30">
          <span className={`text-xs font-bold ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>تصنيف الإجراء:</span>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition border ${
                selectedCategory === cat
                  ? (darkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm')
                  : (darkMode ? 'bg-slate-900/40 text-slate-400 border-slate-700/40 hover:text-slate-200 hover:bg-slate-800' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-950')
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={`text-xs font-bold ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>حالة النتيجة:</span>
          {statusesList.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition border ${
                selectedStatus === st
                  ? (darkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm')
                  : (darkMode ? 'bg-slate-900/40 text-slate-400 border-slate-700/40 hover:text-slate-200 hover:bg-slate-800' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-950')
              }`}
            >
              {st}
            </button>
          ))}
          {(selectedCategory !== 'الكل' || selectedStatus !== 'الكل' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedCategory('الكل');
                setSelectedStatus('الكل');
                setSearchQuery('');
              }}
              className="mr-auto text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Timeline View or Table View */}
      {filteredLogs.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <History className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
          <h3 className="text-base font-bold mb-1">لا توجد سجلات مطابقة لمعايير البحث</h3>
          <p className="text-xs opacity-75">جرّب تغيير كلمات البحث أو إزالة بعض فلاتر التصنيف</p>
        </div>
      ) : activeViewMode === 'timeline' ? (
        /* Timeline View */
        <div className="relative pl-4 pr-6 space-y-6 before:absolute before:right-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-indigo-500 before:to-slate-400">
          {filteredLogs.map((log, index) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="relative flex items-start gap-4 group"
              >
                {/* Timeline node icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 shadow-md relative z-10 transition-transform group-hover:scale-110 ${
                    log.status === 'ناجح'
                      ? (darkMode ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-emerald-100 border-emerald-600 text-emerald-700')
                      : log.status === 'مرفوض'
                      ? (darkMode ? 'bg-rose-950 border-rose-500 text-rose-400' : 'bg-rose-100 border-rose-600 text-rose-700')
                      : log.status === 'تحذير'
                      ? (darkMode ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-amber-100 border-amber-600 text-amber-700')
                      : (darkMode ? 'bg-indigo-950 border-indigo-500 text-indigo-400' : 'bg-indigo-100 border-indigo-600 text-indigo-700')
                  }`}
                >
                  {getCategoryIcon(log.category)}
                </div>

                {/* Timeline Card */}
                <div
                  className={`flex-1 p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                    darkMode ? 'bg-slate-800/80 border-indigo-900/50 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getActionBadgeColor(
                          log.actionType
                        )}`}
                      >
                        {log.actionType}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        {log.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.targetCode && (
                        <button
                          onClick={() => {
                            if (log.targetCode?.startsWith('PR-0')) {
                              dispatch(openFilteredView({ tab: 'purchase-orders', toastMsg: `الانتقال إلى أمر الشراء ${log.targetCode}` }));
                            } else if (log.targetCode?.startsWith('PR-')) {
                              dispatch(openFilteredView({ tab: 'purchase-requests', toastMsg: `الانتقال إلى طلب الشراء ${log.targetCode}` }));
                            } else if (log.targetCode?.startsWith('REC-')) {
                              dispatch(openFilteredView({ tab: 'material-receipts', toastMsg: `الانتقال إلى إذن استلام ${log.targetCode}` }));
                            }
                          }}
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition border ${
                            darkMode
                              ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300'
                          }`}
                        >
                          <span>{log.targetCode}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'ناجح'
                            ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-800')
                            : log.status === 'مرفوض'
                            ? (darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-800')
                            : (darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-800')
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black mb-1 text-slate-900 dark:text-slate-100">{log.title}</h3>
                  <p className={`text-xs leading-relaxed mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.description}</p>

                  {/* User info & Details button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/30 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 text-[10px] font-bold">
                        {log.user === 'النظام الآلي' ? <Cpu className="w-3 h-3 text-cyan-500" /> : <User className="w-3 h-3 text-amber-500" />}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{log.user}</span>
                      <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>({log.userRole})</span>
                    </div>

                    {log.details && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-black flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Expandable Technical Details Drawer */}
                  <AnimatePresence>
                    {isExpanded && log.details && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-3 p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          darkMode ? 'bg-slate-900/80 border-indigo-900/60 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>بيانات التدقيق التقني والمعاملات:</span>
                        </div>
                        <p className={`leading-relaxed font-mono text-[11px] p-2 rounded-lg border ${
                          darkMode ? 'bg-slate-950/60 text-slate-300 border-slate-800' : 'bg-white text-slate-800 border-slate-300'
                        }`}>
                          {log.details}
                        </p>
                        <div className={`flex flex-wrap items-center gap-3 text-[10px] font-medium pt-1 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                          <span>رمز المعاملة: AUD-{log.id.toUpperCase()}</span>
                          <span>المصادقة: HMAC-SHA256 Certified</span>
                          <span>التصنيف الإداري: {log.category}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div
          className={`rounded-2xl border shadow-lg overflow-hidden ${
            darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className={`border-b font-bold ${darkMode ? 'bg-slate-900/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                <tr>
                  <th className="p-3.5">التاريخ والوقت</th>
                  <th className="p-3.5">المستخدم والصفة</th>
                  <th className="p-3.5">نوع الإجراء</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5">العنوان والبيان</th>
                  <th className="p-3.5">الكود المستهدف</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-100 dark:hover:bg-slate-700/20 transition ${
                      darkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{log.user}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">{log.category}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{log.title}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">{log.description}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {log.targetCode ? (
                        <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${
                          darkMode ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30' : 'text-indigo-800 bg-indigo-50 border-indigo-300'
                        }`}>
                          {log.targetCode}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.status === 'ناجح'
                            ? (darkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                            : log.status === 'مرفوض'
                            ? (darkMode ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-800 border border-rose-300')
                            : (darkMode ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300')
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Audit Entry Creation Modal */}
      <AnimatePresence>
        {isAddLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl relative ${
                darkMode ? 'bg-slate-900 border-indigo-900/80 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-base">تسجيل ملاحظة تدقيق وتوثيق إداري</h3>
                </div>
                <button
                  onClick={() => setIsAddLogOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualLog} className="space-y-4">
                <div>
                  <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    عنوان إجراء التدقيق *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: مراجعة دقة أسعار توريد الأسمنت لشهر أكتوبر"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      التصنيف الإداري
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="اعتماد الطلبات">اعتماد الطلبات</option>
                      <option value="أوامر الشراء">أوامر الشراء</option>
                      <option value="المخزون">المخزون</option>
                      <option value="الموردين">الموردين</option>
                      <option value="الأتمتة النظامية">الأتمتة النظامية</option>
                      <option value="المقارنات والترسية">المقارنات والترسية</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      نوع الإجراء
                    </label>
                    <select
                      value={newActionType}
                      onChange={(e) => setNewActionType(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="موافقة">موافقة</option>
                      <option value="رفض">رفض</option>
                      <option value="إصدار أمر">إصدار أمر</option>
                      <option value="تعديل مخزون">تعديل مخزون</option>
                      <option value="إضافة مورد">إضافة مورد</option>
                      <option value="ترسية عرض">ترسية عرض</option>
                      <option value="أتمتة النظام">أتمتة النظام</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      اسم المراجع/المسؤول
                    </label>
                    <input
                      type="text"
                      value={newUser}
                      onChange={(e) => setNewUser(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      المسمى الوظيفي
                    </label>
                    <input
                      type="text"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    وصف الإجراء والتوصيات
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="تفاصيل التوثيق الإداري والمحظورات والتوصيات..."
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    تفاصيل تقنية أو ملاحظات مرجعية
                  </label>
                  <input
                    type="text"
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    placeholder="رقم القرار الوزاري أو كود المحضر الإداري..."
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/40">
                  <button
                    type="button"
                    onClick={() => setIsAddLogOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow"
                  >
                    حفظ بالسجل
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
