import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toggleDarkMode, setToastMessage } from '../store/procurementSlice';
import { Settings, Moon, Sun, Shield, Database, Bell, Download, RotateCcw, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.procurement);
  const darkMode = state.darkMode;

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [workflowAlerts, setWorkflowAlerts] = useState(true);

  const handleSaveNotifications = () => {
    dispatch(
      setToastMessage('تم حفظ وتحديث تفضيلات الإشعارات والتنبيهات الآلية بنجاح!')
    );
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      company: 'الشركة المصرية الهندسية للمقاولات (EEC)',
      requests: state.requests,
      orders: state.orders,
      suppliers: state.suppliers,
      receipts: state.receipts,
      inventory: state.inventory,
      auditLogs: state.auditLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EEC_Procurement_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch(setToastMessage('تم تحميل نسخة احتياطية كاملة لقاعدة بيانات المنظومة (JSON) بنجاح!'));
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('eec_procurement_state');
    dispatch(setToastMessage('تمت استعادة البيانات الافتراضية! جاري تحديث المنظومة...'));
    setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border shadow-md flex items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-800/90 border-indigo-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black">إعدادات النظام والتفضيلات</h2>
            <p className="text-xs opacity-75">إدارة تفضيلات العرض والتخزين المحلي وإشعارات نظام المشتريات</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className={`p-6 rounded-2xl border shadow-md flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sun className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base">مظهر الواجهة والوضع الليلي</h3>
            </div>
            <p className="text-xs opacity-75 mb-6 leading-relaxed">
              يمكنك التبديل الفوري بين الوضع الداكن والوضع الفاتح بحسب تفضيلك لضمان وضوح الجداول والرسوم البيانية.
            </p>
          </div>
          <button
            onClick={() => {
              dispatch(toggleDarkMode());
              dispatch(setToastMessage(darkMode ? 'تم التحول إلى الوضع الفاتح' : 'تم التحول إلى الوضع الداكن'));
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow transition hover:from-amber-600 hover:to-amber-700 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{darkMode ? 'التحول إلى الوضع الفاتح' : 'التحول إلى الوضع الداكن'}</span>
          </button>
        </div>

        {/* Local Storage Auto-save & Backup Settings */}
        <div className={`p-6 rounded-2xl border shadow-md flex flex-col justify-between ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base">الحفظ التلقائي والنسخ الاحتياطي</h3>
            </div>
            <p className="text-xs opacity-75 mb-4 leading-relaxed">
              جميع البيانات والطلبات وأوامر الشراء يتم حفظها تلقائياً في متصفحك (LocalStorage). يمكنك تصدير نسخة احتياطية أو استعادة البيانات القياسية.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 mb-4">
              <Shield className="w-4 h-4" />
              <span>الحفظ التلقائي مفعل ونشط ({state.requests.length} طلب • {state.orders.length} أمر شراء)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل نسخة احتياطية (JSON)</span>
            </button>
            <button
              onClick={handleResetDemoData}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 font-bold text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط البيانات</span>
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className={`p-6 rounded-2xl border shadow-md md:col-span-2 ${
          darkMode ? 'bg-slate-800/80 border-indigo-900/40' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="font-bold text-base">إشعارات النظام والمنظومة الرقابية</h3>
                <p className="text-xs opacity-75">تخصيص التنبيهات الفورية عند اعتماد طلبات الشراء أو انخفاض المخزون</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="font-bold text-xs block">تنبيهات الاعتماد الثلاثي</span>
                <span className="text-[11px] opacity-70">إشعار عند انتقال الطلب بين المستويات</span>
              </div>
              <input
                type="checkbox"
                checked={workflowAlerts}
                onChange={(e) => setWorkflowAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>

            <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="font-bold text-xs block">تنبيهات الحد الحرج للمخزون</span>
                <span className="text-[11px] opacity-70">تحذير آلي عند نقص أرصدة المواد</span>
              </div>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>

            <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="font-bold text-xs block">تقارير البريد الإلكتروني</span>
                <span className="text-[11px] opacity-70">إرسال ملخص أسبوعي للإدارة العليا</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>
          </div>

          <button
            onClick={handleSaveNotifications}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow inline-flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>حفظ وتحديث تفضيلات الإشعارات</span>
          </button>
        </div>
      </div>
    </div>
  );
};

