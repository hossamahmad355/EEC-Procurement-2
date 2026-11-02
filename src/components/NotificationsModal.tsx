import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  markAllNotificationsRead,
  markNotificationRead,
  dismissNotification,
  openFilteredView,
  setQuickActionModal
} from '../store/procurementSlice';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCheck,
  Trash2,
  ExternalLink,
  Zap
} from 'lucide-react';

export const NotificationsModal: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.procurement.notifications);
  const unreadCount = useSelector((state: RootState) => state.procurement.notificationsCount);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);

  const [activeType, setActiveType] = useState<'all' | 'low_stock' | 'overdue'>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (activeType === 'low_stock') return item.type === 'low_stock';
    if (activeType === 'overdue')
      return item.type === 'overdue_request' || item.type === 'overdue_order';
    return true;
  });

  const handleNotificationClick = (item: any) => {
    dispatch(markNotificationRead(item.id));

    if (item.targetTab) {
      dispatch(
        openFilteredView({
          tab: item.targetTab,
          requestStatus: item.filterMeta?.requestStatus,
          orderStatus: item.filterMeta?.orderStatus,
          inventoryLowStock: item.filterMeta?.inventoryLowStock,
          toastMsg: `تم التوجيه لمعاينة: ${item.title}`,
        })
      );

      // Smooth scroll to target view top / content
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <section
      id="notifications-section"
      className={`w-full rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${
        darkMode
          ? 'bg-slate-800/90 border-indigo-900/50 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-white border-b border-indigo-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 relative">
            <Bell className="w-5 h-5 animate-bounce" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">مركز التنبيهات والإشعارات</h3>
            <p className="text-xs text-amber-300">
              متابعة تنبيهات المخزون المنخفض، والطلبات المتأخرة، وتحديثات الموردين
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => dispatch(markAllNotificationsRead())}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center gap-1.5 border border-amber-400/30 cursor-pointer"
            title="تحديد كافة الإشعارات كمقروءة"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      {/* Filter Tabs Sub-Bar */}
      <div
        className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-bold ${
          darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeType === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : darkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            جميع الإشعارات ({notifications.length})
          </button>
          <button
            onClick={() => setActiveType('low_stock')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeType === 'low_stock'
                ? 'bg-red-500 text-white font-black shadow'
                : darkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>نفاذ المخزون</span>
          </button>
          <button
            onClick={() => setActiveType('overdue')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeType === 'overdue'
                ? 'bg-amber-600 text-white font-black shadow'
                : darkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>طلبات متأخرة</span>
          </button>
        </div>

        <span className="text-[11px] opacity-70">
          انقر على أي إشعار للانتقال المباشر ومعاينة التفاصيل
        </span>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-slate-700/20 max-h-[420px] overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const isLowStock = item.type === 'low_stock';
            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 transition cursor-pointer flex items-start justify-between gap-4 relative ${
                  !item.isRead
                    ? darkMode
                      ? 'bg-slate-800/80 hover:bg-slate-800 font-semibold border-r-4 border-amber-400'
                      : 'bg-amber-50/90 hover:bg-amber-100/80 font-semibold border-r-4 border-amber-500'
                    : darkMode
                    ? 'hover:bg-white/5 opacity-85'
                    : 'hover:bg-slate-50 opacity-85'
                }`}
              >
                <div className="flex items-start gap-3.5 pr-1">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isLowStock
                        ? 'bg-red-500/15 border-red-500/30 text-red-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {isLowStock ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40">
                          جديد
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] opacity-70">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1 hover:underline">
                        <span>انقر للمعاينة والتصفية المباشرة</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isLowStock && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(markNotificationRead(item.id));
                        dispatch(setQuickActionModal('new_request'));
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 text-xs font-bold transition flex items-center gap-1 border border-amber-400/30 cursor-pointer"
                      title="إنشاء طلب توريد عاجل للمادة"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">طلب عاجل</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(dismissNotification(item.id));
                    }}
                    className="p-2 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                    title="حذف الإشعار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs opacity-60 space-y-2">
            <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
            <p className="font-bold">لا توجد إشعارات حالياً في هذه الفئة</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-3 border-t text-center text-xs font-semibold ${
          darkMode
            ? 'bg-slate-900/80 border-indigo-900/40 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}
      >
        <span>نظام التنبيهات الآلي - الشركة المصرية الهندسية للمقاولات (EEC)</span>
      </div>
    </section>
  );
};
