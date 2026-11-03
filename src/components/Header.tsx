import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toggleDarkMode, setQuickActionModal, setActiveTab, setToastMessage } from '../store/procurementSlice';
import { ShoppingCart, Bell, HelpCircle, User, Moon, Sun, Camera, X, CheckCircle2, Sparkles, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const notificationsCount = useSelector((state: RootState) => state.procurement.notificationsCount);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className={`h-20 px-6 flex items-center justify-between border-b transition-colors duration-300 shadow-md z-30 relative ${
        darkMode 
          ? 'bg-[#1a1533] border-indigo-900/50 text-slate-100' 
          : 'bg-[#1e1b4b] border-indigo-900 text-slate-100'
      }`}>
        {/* Right side: Company Logo & Branding */}
        <div
          onClick={() => dispatch(setActiveTab('dashboard'))}
          className="flex items-center gap-4 cursor-pointer group"
          title="الانتقال إلى لوحة التحكم الرئيسية"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg border-2 border-amber-300 group-hover:scale-105 transition-transform">
            <span className="text-slate-950 font-black text-lg tracking-wider">EEC</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide group-hover:text-amber-300 transition-colors">الشركة المصرية الهندسية للمقاولات</h1>
            <p className="text-xs text-amber-300 font-medium">Egyptian Engineering Company (EEC)</p>
          </div>
        </div>

        {/* Center: Department Title & Cart Icon */}
        <div
          onClick={() => dispatch(setActiveTab('purchase-orders'))}
          className="hidden md:flex items-center gap-3 bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md cursor-pointer transition"
        >
          <ShoppingCart className="w-6 h-6 text-amber-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white">إدارة المشتريات والعقود</h2>
            <p className="text-xs text-slate-300">Procurement & Supply Chain</p>
          </div>
        </div>

        {/* Left side: Controls, Document Scanner, Notifications Dropdown & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Camera Document Scanner Button */}
          <button
            onClick={() => dispatch(setQuickActionModal('scanner'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition border border-amber-400/50 shadow cursor-pointer"
            title="مسح الفواتير وإيصالات الشراء بالكاميرا (AI OCR)"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">مسح الفواتير</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              dispatch(toggleDarkMode());
              dispatch(setToastMessage(darkMode ? 'تم تفعيل الوضع الفاتح للواجهة' : 'تم تفعيل الوضع الداكن للواجهة'));
            }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 transition-all border border-white/10 cursor-pointer"
            title={darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Facebook-style Notifications Popover Bell Button */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2.5 rounded-xl transition-all relative border cursor-pointer ${
                isNotificationsOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
              }`}
              title="فتح قائمة الإشعارات"
            >
              <Bell className={`w-5 h-5 ${isNotificationsOpen ? 'text-slate-950' : 'text-amber-400'}`} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow animate-pulse">
                  {notificationsCount}
                </span>
              )}
            </button>

            {/* Scrollable Floating Flyout Popover (Facebook Style) */}
            <NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Help */}
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all border border-white/10 hidden sm:flex cursor-pointer"
            title="دليل النظام والمساعدة"
          >
            <HelpCircle className="w-5 h-5 text-slate-300" />
          </button>

          {/* User Profile */}
          <div
            onClick={() => dispatch(setActiveTab('settings'))}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl border border-white/10 cursor-pointer transition"
            title="إعدادات الحساب والنظام"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-white block">مدير المشتريات</span>
              <span className="text-[10px] text-amber-300 block">مشرف النظام</span>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Help & Quick Guide Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
            darkMode ? 'bg-slate-900 border-indigo-900 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">دليل منظومة إدارة المشتريات والمخازن</h3>
                  <p className="text-xs text-amber-300">الشركة المصرية الهندسية للمقاولات (EEC)</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs leading-relaxed">
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">اعتماد ثلاثي المستويات لطلبات الشراء</h4>
                  <p className="opacity-80">يمر كل طلب شراء عبر 3 مراحل رقابية (مدير الموقع ➔ مدير المشتريات ➔ المدير المالي) مع توثيق فوري في سجل التدقيق.</p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">قوالب جاهزة ومسح ضوئي ذكي (OCR)</h4>
                  <p className="opacity-80">استخدم زر "مسح الفواتير" أعلى الشاشة لالتقاط الفواتير الورقية بالكاميرا، أو اختر من القوالب الجاهزة عند إصدار أمر شراء.</p>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <FileSpreadsheet className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">تصدير التقارير بصيغتي Excel و PDF</h4>
                  <p className="opacity-80">يمكنك من صفحة التقارير وأوامر الشراء تصدير الجداول مباشرة بصيغة Excel (.xlsx) أو PDF معتمد للطباعة باللغة العربية.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>فهمت، إغلاق الدليل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

