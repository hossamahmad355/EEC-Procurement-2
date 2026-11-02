import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  markAllNotificationsRead,
  markNotificationRead,
  dismissNotification,
  openFilteredView,
  setQuickActionModal
} from '../store/procurementSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCheck,
  Trash2,
  ExternalLink,
  Zap,
  X,
  Filter,
  Package
} from 'lucide-react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const notifications = useSelector((state: RootState) => state.procurement.notifications);
  const unreadCount = useSelector((state: RootState) => state.procurement.notificationsCount);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);

  const [filterType, setFilterType] = useState<'all' | 'unread' | 'low_stock' | 'overdue'>('all');

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter((item) => {
    if (filterType === 'unread') return !item.isRead;
    if (filterType === 'low_stock') return item.type === 'low_stock';
    if (filterType === 'overdue')
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
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`absolute left-0 mt-3 w-[360px] sm:w-[420px] max-w-[92vw] rounded-3xl shadow-2xl border z-50 overflow-hidden dir-rtl ${
          darkMode
            ? 'bg-slate-900/95 border-indigo-900/80 text-slate-100 shadow-indigo-950/80'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/30'
        }`}
        style={{ transformOrigin: 'top left' }}
      >
        {/* Facebook-style Popover Header */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">الإشعارات والتنبيهات</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsRead())}
                className="p-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="تحديد الكل كمقروء"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قراءة الكل</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className={`px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold no-scrollbar ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/60 border-slate-200'
        }`}>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            الكل ({notifications.length})
          </button>

          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
              filterType === 'unread'
                ? 'bg-indigo-600 text-white font-black shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            غير مقروء ({unreadCount})
          </button>

          <button
            onClick={() => setFilterType('low_stock')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
              filterType === 'low_stock'
                ? 'bg-rose-600 text-white font-black shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>نفاذ مخزون</span>
          </button>

          <button
            onClick={() => setFilterType('overdue')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
              filterType === 'overdue'
                ? 'bg-amber-600 text-white font-black shadow-sm'
                : (darkMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            <Clock className="w-3 h-3 text-amber-500" />
            <span>طلبات متأخرة</span>
          </button>
        </div>

        {/* Scrollable Notifications List (Facebook Style) */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/80">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const isLowStock = item.type === 'low_stock';
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition cursor-pointer flex items-start justify-between gap-3 group relative ${
                    !item.isRead
                      ? (darkMode ? 'bg-indigo-950/40 hover:bg-indigo-900/30' : 'bg-amber-50/80 hover:bg-amber-100/70')
                      : (darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Container */}
                    <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isLowStock
                        ? (darkMode ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-rose-100 text-rose-700 border-rose-200')
                        : (darkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200')
                    }`}>
                      {isLowStock ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black line-clamp-1 ${
                          !item.isRead ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-200'
                        }`}>
                          {item.title}
                        </h4>
                      </div>
                      <p className={`text-[11px] leading-snug line-clamp-2 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                        <span className="font-semibold">{item.date}</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                          <span>معاينة</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Unread Indicator */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <div className="flex items-center gap-1">
                      {!item.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" title="إشعار غير مقروء" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(dismissNotification(item.id));
                        }}
                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        title="حذف الإشعار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isLowStock && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(markNotificationRead(item.id));
                          dispatch(setQuickActionModal('new_request'));
                          onClose();
                        }}
                        className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-600 dark:text-amber-300 text-[10px] font-black transition flex items-center gap-1 border border-amber-400/30 cursor-pointer"
                        title="طلب توريد عاجل للمادة"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>طلب عاجل</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-xs text-slate-400 space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <p className="font-bold">لا توجد إشعارات في هذه الفئة حالياً</p>
            </div>
          )}
        </div>

        {/* Facebook-style Footer */}
        <div className={`p-2.5 border-t text-center text-xs font-extrabold ${
          darkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-200 text-amber-600'
        }`}>
          <button
            onClick={() => {
              dispatch(openFilteredView({ tab: 'audit-log', toastMsg: 'الانتقال إلى سجل النشاط الكامل' }));
              onClose();
            }}
            className="hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <span>عرض كافة سجلات النشاط والتدقيق الإداري</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
