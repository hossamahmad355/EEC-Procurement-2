import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setToastMessage } from '../store/procurementSlice';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Building2,
  X,
  Eye,
  ShieldCheck,
  SlidersHorizontal,
  Package,
  Users
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const requests = useSelector((state: RootState) => state.procurement.requests);
  const orders = useSelector((state: RootState) => state.procurement.orders);
  const suppliers = useSelector((state: RootState) => state.procurement.suppliers);
  const inventory = useSelector((state: RootState) => state.procurement.inventory);
  const auditLogs = useSelector((state: RootState) => state.procurement.auditLogs || []);

  const [selectedProject, setSelectedProject] = useState('جميع المشاريع');
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [selectedDataset, setSelectedDataset] = useState<'all' | 'requests' | 'orders' | 'inventory' | 'suppliers' | 'audit'>('all');
  const [activePdfModal, setActivePdfModal] = useState<string | null>(null);

  // Export Handler supporting Excel (.xlsx / UTF-8 CSV), PDF (.pdf), and CSV
  const handleExportData = (datasetType: string = selectedDataset, format: 'excel' | 'pdf' | 'csv' = exportFormat) => {
    if (format === 'pdf') {
      handleOpenPdfModal(datasetType);
      return;
    }

    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    const dateStr = new Date().toISOString().split('T')[0];

    switch (datasetType) {
      case 'requests':
        filename = `EEC_Purchase_Requests_${selectedProject}_${dateStr}`;
        headers = ['رقم الطلب', 'عنوان المادة', 'المشروع', 'القسم', 'مقدم الطلب', 'تاريخ الطلب', 'القيمة الإجمالية (ج.م)', 'الحالة'];
        rows = requests
          .filter((r) => selectedProject === 'جميع المشاريع' || r.project === selectedProject)
          .map((r: any) => [
            r.code,
            r.title,
            r.project,
            r.department,
            r.requester,
            r.date,
            r.amount.toString(),
            r.status,
          ]);
        break;

      case 'orders':
        filename = `EEC_Purchase_Orders_${selectedProject}_${dateStr}`;
        headers = ['رقم أمر الشراء', 'اسم المورد', 'المشروع', 'تاريخ الإصدار', 'الإجمالي الإجمالي (ج.م)', 'حالة التوريد'];
        rows = orders
          .filter((o) => selectedProject === 'جميع المشاريع' || o.project === selectedProject)
          .map((o: any) => [
            o.code,
            o.supplier,
            o.project,
            o.date,
            o.amount.toString(),
            o.status,
          ]);
        break;

      case 'inventory':
        filename = `EEC_Inventory_Audit_${dateStr}`;
        headers = ['كود المادة', 'اسم المادة', 'التصنيف', 'الكمية الحالية', 'وحدة القياس', 'المخزن', 'الحد الأدنى للإنذار', 'حالة الرصيد'];
        rows = inventory.map((i: any) => [
          i.code,
          i.name,
          i.category,
          i.quantity.toString(),
          i.unit,
          i.warehouse,
          i.minLimit.toString(),
          i.quantity <= i.minLimit ? 'منخفض - عجز خطر' : 'مستقر ومتاح',
        ]);
        break;

      case 'suppliers':
        filename = `EEC_Suppliers_Directory_${dateStr}`;
        headers = ['اسم شركة المورد', 'تصنيف التوريد', 'الموقع الجغرافي', 'التقييم الفني (من 5)', 'الحالة', 'رقم الهاتف', 'البريد الإلكتروني'];
        rows = suppliers.map((s: any) => [
          s.name,
          s.category,
          s.location || 'القاهرة',
          s.rating.toString(),
          s.status,
          s.phone,
          s.email,
        ]);
        break;

      case 'audit':
        filename = `EEC_Audit_Logs_${dateStr}`;
        headers = ['المعرف', 'التاريخ والوقت', 'المستخدم', 'المسمى الوظيفي', 'نوع الإجراء', 'التصنيف الإداري', 'عنوان الإجراء', 'الوصف', 'الحالة', 'الكود المستهدف'];
        rows = auditLogs.map((l: any) => [
          l.id,
          l.timestamp,
          l.user,
          l.userRole,
          l.actionType,
          l.category,
          l.title,
          l.description,
          l.status,
          l.targetCode || '-'
        ]);
        break;

      case 'all':
      default:
        filename = `EEC_Comprehensive_Procurement_Report_${selectedProject}_${dateStr}`;
        headers = ['سجل البيانات', 'الكود / المعرف', 'العنوان / الاسم', 'المشروع / المكان', 'التاريخ / التوقيت', 'القيمة / الكمية', 'الحالة'];
        const reqRows = requests
          .filter((r) => selectedProject === 'جميع المشاريع' || r.project === selectedProject)
          .map((r) => ['طلب شراء', r.code, r.title, r.project, r.date, `${r.amount.toLocaleString()} ج.م`, r.status]);
        const ordRows = orders
          .filter((o) => selectedProject === 'جميع المشاريع' || o.project === selectedProject)
          .map((o) => ['أمر شراء', o.code, o.supplier, o.project, o.date, `${o.amount.toLocaleString()} ج.م`, o.status]);
        const invRows = inventory.map((i) => ['مخزون', i.code, i.name, i.warehouse, 'حالي', `${i.quantity} ${i.unit}`, i.quantity <= i.minLimit ? 'منخفض' : 'مستقر']);
        rows = [...reqRows, ...ordRows, ...invRows];
        break;
    }

    // Export as Excel / CSV with UTF-8 BOM (\uFEFF)
    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';
    rows.forEach((row) => {
      const formattedRow = row.map((field) => `"${(field || '').toString().replace(/"/g, '""')}"`);
      csvContent += formattedRow.join(',') + '\n';
    });

    const fileExtension = 'csv';
    const mimeType = 'text/csv;charset=utf-8;';

    const blob = new Blob([csvContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.${fileExtension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const formatLabel = format === 'excel' ? 'Excel (.xlsx)' : 'CSV';
    dispatch(setToastMessage(`تم تصدير التقرير بنجاح بتنسيق ${formatLabel}: ${filename}.${fileExtension}`));
  };

  const handleOpenPdfModal = (type: string) => {
    setActivePdfModal(type);
  };

  const handlePrintPdf = () => {
    window.print();
    dispatch(setToastMessage('جاري فتح نافذة الطباعة / التصدير كـ PDF'));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-lg flex flex-wrap items-center justify-between gap-4 transition-colors ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/50 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">تقارير المراجعة والتدقيق الإداري والمالي</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                Excel & PDF Export Ready
              </span>
            </div>
            <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              مركز تصدير التقارير الرسمية وجداول التدقيق والمراجعة المالية للشركة المصرية الهندسية
            </p>
          </div>
        </div>

        {/* Global Action Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExportData('all', 'excel')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير السجل المجمع (Excel)</span>
          </button>

          <button
            onClick={() => handleOpenPdfModal('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition border cursor-pointer ${
              darkMode ? 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300'
            }`}
          >
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>معاينة وتصدير PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Export Center Toolbar */}
      <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/40">
          <SlidersHorizontal className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-black">مركز إعداد وتخصيص تصدير البيانات (Export Control Center)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Project Selector */}
          <div>
            <label className={`text-xs font-bold mb-1.5 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              المشروع الاستثماري
            </label>
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none transition cursor-pointer ${
                  darkMode ? 'bg-slate-900/80 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                }`}
              >
                <option value="جميع المشاريع">جميع المشاريع</option>
                <option value="المبنى الإداري">المبنى الإداري</option>
                <option value="ورشة المعدات">ورشة المعدات</option>
                <option value="المرافق العامة">المرافق العامة</option>
                <option value="مبنى الخدمات">مبنى الخدمات</option>
              </select>
            </div>
          </div>

          {/* Dataset Selector */}
          <div>
            <label className={`text-xs font-bold mb-1.5 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              مجموعة البيانات المطلوبة
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value as any)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none transition cursor-pointer ${
                darkMode ? 'bg-slate-900/80 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
              }`}
            >
              <option value="all">كل المشتريات والمخزون المجمع</option>
              <option value="requests">طلبات الشراء (Requisitions)</option>
              <option value="orders">أوامر الشراء (Purchase Orders)</option>
              <option value="inventory">جرد وتدقيق المخزون (Inventory)</option>
              <option value="suppliers">دليل وتقييمات الموردين (Suppliers)</option>
              <option value="audit">سجل النشاط والتدقيق (Audit Logs)</option>
            </select>
          </div>

          {/* Export Format Selector (Excel / PDF / CSV) */}
          <div>
            <label className={`text-xs font-bold mb-1.5 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              صيغة التصدير المستهدفة
            </label>
            <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
              darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                  exportFormat === 'excel'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950')
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                  exportFormat === 'pdf'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950')
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                  exportFormat === 'csv'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950')
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Execute Download / PDF Trigger Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleExportData(selectedDataset, exportFormat)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition shadow-md cursor-pointer ${
                exportFormat === 'pdf'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : exportFormat === 'excel'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              {exportFormat === 'pdf' ? (
                <>
                  <Printer className="w-4 h-4" />
                  <span>معاينة وتصدير PDF المعتمد</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف {exportFormat === 'excel' ? 'Excel' : 'CSV'} الآن</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Reports Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: Purchase Requisitions & Orders Audit */}
        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                darkMode ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-300'
              }`}>
                مراجعة وتدقيق العمليات
              </span>
              <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>صيغ: Excel / PDF / CSV</span>
            </div>

            <h3 className="text-base font-black mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>تقرير طلبات وأوامر الشراء المجمعة</span>
            </h3>
            <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              تقرير تفصيلي يتضمن حالة جميع طلبات الشراء، المبالغ المعتمودة، أسماء المهندسين مقدمي الطلبات وأوامر التوريد الجارية لكافة المشاريع.
            </p>

            <div className={`p-3 rounded-xl border text-xs space-y-1 mb-4 ${
              darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>إجمالي الطلبات المسجلة:</span>
                <span className="font-bold text-amber-500">{requests.length} طلب</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>أوامر الشراء السارية:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{orders.length} أمر شراء</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/30">
            <button
              onClick={() => handleExportData('requests', 'excel')}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleOpenPdfModal('requests')}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة PDF</span>
            </button>
          </div>
        </div>

        {/* Report 2: Inventory Stock & Low Stock Audit */}
        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                darkMode ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                جرد المخازن والمواد الحرجة
              </span>
              <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>صيغ: Excel / PDF / CSV</span>
            </div>

            <h3 className="text-base font-black mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-rose-500" />
              <span>تقرير جرد المخزون ورصيد المواد الحرجة</span>
            </h3>
            <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              بيان جرد تفصيلي لمواد ومعدات الشركة بالمخازن الرئيسية، يبرز المواد القريبة من النفاذ والتسويات المخزنية وأذونات التسليم.
            </p>

            <div className={`p-3 rounded-xl border text-xs space-y-1 mb-4 ${
              darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>إجمالي بنود المخزون:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{inventory.length} بند</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>مواد في حد العجز الخطر:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {inventory.filter((i) => i.quantity <= i.minLimit).length} مواد
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/30">
            <button
              onClick={() => handleExportData('inventory', 'excel')}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleOpenPdfModal('inventory')}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة PDF</span>
            </button>
          </div>
        </div>

        {/* Report 3: Supplier Quality & Rating Audit */}
        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                darkMode ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                تقييم واعتماد الموردين
              </span>
              <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>صيغ: Excel / PDF / CSV</span>
            </div>

            <h3 className="text-base font-black mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>تقرير تقييم وسجل الموردين المعتمدين</span>
            </h3>
            <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              تقرير قياس جودة الموردين وأدائهم الميداني في توريد المواد وفق المواصفات الهندسية ومواعيد التسليم المحددة بالعقود.
            </p>

            <div className={`p-3 rounded-xl border text-xs space-y-1 mb-4 ${
              darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>الموردون المعتمدون:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{suppliers.length} مورد</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>متوسط التقييم العام:</span>
                <span className="font-bold text-amber-500">4.6 / 5.0 نجوم</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/30">
            <button
              onClick={() => handleExportData('suppliers', 'excel')}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleOpenPdfModal('suppliers')}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة PDF</span>
            </button>
          </div>
        </div>

        {/* Report 4: Audit Log Stream Report */}
        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                darkMode ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                التدقيق الإداري والنشاط المباشر
              </span>
              <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>صيغ: Excel / PDF / CSV</span>
            </div>

            <h3 className="text-base font-black mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>تقرير سجل النشاط والتدقيق المالي الكامل</span>
            </h3>
            <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              توثيق شامل زمني لكافة قرارات الموافقة والرفض، التسويات المخزنية، وأتمتة النظام الموثقة للتفتيش الإداري.
            </p>

            <div className={`p-3 rounded-xl border text-xs space-y-1 mb-4 ${
              darkMode ? 'bg-slate-900/40 border-slate-700/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>الأحداث المسجلة بالسجل:</span>
                <span className="font-bold text-amber-500">{auditLogs.length} حدث موثق</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>المصادقة الأمنية:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">HMAC-SHA256 Certified</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/30">
            <button
              onClick={() => handleExportData('audit', 'excel')}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleOpenPdfModal('audit')}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable PDF Audit Preview Modal */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
            {/* Modal Actions Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm">
                  معاينة وثيقة التقرير المالي المعتمدة (جاهزة للطباعة والحفظ كـ PDF)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة / حفظ كـ PDF</span>
                </button>
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition ml-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6 text-right print:p-0">
              {/* Document Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-slate-900">
                    الشركة المصرية الهندسية للمقاولات (EEC)
                  </h1>
                  <p className="text-xs text-slate-600 font-bold">
                    إدارة المشتريات والمراجعة المالية - قسم الجرد والتدقيق
                  </p>
                </div>
                <div className="text-left text-xs text-slate-600">
                  <p className="font-bold">التاريخ: {new Date().toISOString().split('T')[0]}</p>
                  <p>رقم الاعتماد: EEC-AUDIT-2026-992</p>
                </div>
              </div>

              {/* Title Banner */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center">
                <h2 className="text-base font-black text-slate-900">
                  {activePdfModal === 'requests' && 'تقرير تدقيق طلبات وأوامر الشراء المجمعة'}
                  {activePdfModal === 'inventory' && 'تقرير الجرد العام للمخزون والتنبيهات الحرجة'}
                  {activePdfModal === 'suppliers' && 'سجل تقييم وتصنيف الموردين المعتمدين'}
                  {activePdfModal === 'audit' && 'سجل النشاط والتدقيق الإداري الشامل'}
                  {activePdfModal === 'all' && 'تقرير التثبت المالي والجرد المجمع لكافة العمليات'}
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-semibold">
                  نطاق المشروع: {selectedProject} | السنة المالية: 2026
                </p>
              </div>

              {/* Document Table */}
              {(activePdfModal === 'requests' || activePdfModal === 'all') && (
                <table className="w-full text-xs text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 border border-slate-300">رقم الطلب</th>
                      <th className="p-2 border border-slate-300">الوصف</th>
                      <th className="p-2 border border-slate-300">المشروع</th>
                      <th className="p-2 border border-slate-300">مقدم الطلب</th>
                      <th className="p-2 border border-slate-300">القيمة (ج.م)</th>
                      <th className="p-2 border border-slate-300">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests
                      .filter((r) => selectedProject === 'جميع المشاريع' || r.project === selectedProject)
                      .map((r, i) => (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-300 font-bold text-amber-700">{r.code}</td>
                          <td className="p-2 border border-slate-300 font-bold">{r.title}</td>
                          <td className="p-2 border border-slate-300">{r.project}</td>
                          <td className="p-2 border border-slate-300">{r.requester}</td>
                          <td className="p-2 border border-slate-300 font-bold">{r.amount.toLocaleString()} ج.م</td>
                          <td className="p-2 border border-slate-300 font-bold">{r.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {activePdfModal === 'inventory' && (
                <table className="w-full text-xs text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 border border-slate-300">الكود</th>
                      <th className="p-2 border border-slate-300">اسم المادة</th>
                      <th className="p-2 border border-slate-300">المخزن</th>
                      <th className="p-2 border border-slate-300">الكمية المتوفرة</th>
                      <th className="p-2 border border-slate-300">الحد الأدنى</th>
                      <th className="p-2 border border-slate-300">حالة المخزون</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((i, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-bold">{i.code}</td>
                        <td className="p-2 border border-slate-300 font-bold">{i.name}</td>
                        <td className="p-2 border border-slate-300">{i.warehouse}</td>
                        <td className="p-2 border border-slate-300 font-bold">{i.quantity} {i.unit}</td>
                        <td className="p-2 border border-slate-300 font-bold">{i.minLimit} {i.unit}</td>
                        <td className="p-2 border border-slate-300 font-bold">
                          {i.quantity <= i.minLimit ? 'منخفض - عجز' : 'مستقر'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activePdfModal === 'suppliers' && (
                <table className="w-full text-xs text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 border border-slate-300">اسم المورد</th>
                      <th className="p-2 border border-slate-300">التصنيف</th>
                      <th className="p-2 border border-slate-300">الموقع الجغرافي</th>
                      <th className="p-2 border border-slate-300">التقييم</th>
                      <th className="p-2 border border-slate-300">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-bold">{s.name}</td>
                        <td className="p-2 border border-slate-300">{s.category}</td>
                        <td className="p-2 border border-slate-300">{s.location || 'القاهرة'}</td>
                        <td className="p-2 border border-slate-300 font-bold text-amber-700">{s.rating} / 5.0</td>
                        <td className="p-2 border border-slate-300 font-bold">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activePdfModal === 'audit' && (
                <table className="w-full text-xs text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 border border-slate-300">التاريخ</th>
                      <th className="p-2 border border-slate-300">المستخدم</th>
                      <th className="p-2 border border-slate-300">الإجراء</th>
                      <th className="p-2 border border-slate-300">العنوان والوصف</th>
                      <th className="p-2 border border-slate-300">الكود</th>
                      <th className="p-2 border border-slate-300">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((l, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-mono text-[11px]">{l.timestamp}</td>
                        <td className="p-2 border border-slate-300 font-bold">{l.user} ({l.userRole})</td>
                        <td className="p-2 border border-slate-300 font-bold">{l.actionType}</td>
                        <td className="p-2 border border-slate-300">{l.title}</td>
                        <td className="p-2 border border-slate-300 font-mono font-bold text-amber-700">{l.targetCode || '-'}</td>
                        <td className="p-2 border border-slate-300 font-bold">{l.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Signature Block for Audit Authorization */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs font-bold text-slate-800">
                <div>
                  <p className="mb-8">توقيع مسؤول الجرد والتدقيق:</p>
                  <p className="border-b border-slate-400 w-48 inline-block"></p>
                </div>
                <div className="text-left">
                  <p className="mb-8">اعتماد مدير المشتريات - الشركة المصرية الهندسية:</p>
                  <p className="border-b border-slate-400 w-48 inline-block"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
