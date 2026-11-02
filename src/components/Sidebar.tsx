import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setActiveTab, setToastMessage } from '../store/procurementSlice';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Users,
  Tag,
  Truck,
  Package,
  Award,
  BarChart3,
  Settings,
  ArrowRightLeft,
  Activity,
  CalendarClock,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.procurement.activeTab);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const requestsCount = useSelector((state: RootState) => state.procurement.requests.length);
  const ordersCount = useSelector((state: RootState) => state.procurement.orders.length);
  const suppliersCount = useSelector((state: RootState) => state.procurement.suppliers.length);
  const receiptsCount = useSelector((state: RootState) => state.procurement.receipts.length);
  const inventoryCount = useSelector((state: RootState) => state.procurement.inventory.length);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'kpis', label: 'مؤشرات الأداء (KPIs)', icon: Activity, badge: 'تفاعلي' },
    { id: 'audit-log', label: 'سجل النشاط والتدقيق', icon: ShieldCheck, badge: 'مباشر' },
    { id: 'scheduled-tasks', label: 'جدولة المهام والأتمتة', icon: CalendarClock, badge: 'آلي' },
    { id: 'purchase-requests', label: 'طلبات الشراء', icon: FileText, badge: String(requestsCount) },
    { id: 'purchase-orders', label: 'أوامر الشراء', icon: ShoppingCart, badge: String(ordersCount) },
    { id: 'suppliers', label: 'الموردون', icon: Users, badge: String(suppliersCount) },
    { id: 'quotations', label: 'المقارنة الذكية للعروض', icon: Tag, badge: 'مقارنة' },
    { id: 'material-receipts', label: 'استلام المواد', icon: Truck, badge: String(receiptsCount) },
    { id: 'inventory', label: 'المخزون', icon: Package, badge: String(inventoryCount) },
    { id: 'supplier-evaluation', label: 'تقييم الموردين', icon: Award },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <aside className={`w-64 sticky top-0 h-screen flex flex-col shrink-0 transition-colors duration-300 border-l z-20 ${
      darkMode 
        ? 'bg-[#211a42] text-slate-100 border-indigo-900/40' 
        : 'bg-[#1e1b4b] text-slate-100 border-indigo-900'
    }`}>
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch(setActiveTab(item.id))}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-amber-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Back to Portal Button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => {
            dispatch(setActiveTab('dashboard'));
            dispatch(setToastMessage('تمت العودة إلى البوابة الرئيسية للشركة المصرية الهندسية للمقاولات (EEC)'));
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4 text-amber-400" />
          <span>العودة إلى البوابة</span>
        </button>
      </div>
    </aside>
  );
};

