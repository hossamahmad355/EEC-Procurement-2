/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store/store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { PurchaseRequestsView } from './components/PurchaseRequestsView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { SuppliersView } from './components/SuppliersView';
import { InventoryView } from './components/InventoryView';
import { MaterialReceivingView } from './components/MaterialReceivingView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { KeyPerformanceIndicators } from './components/KeyPerformanceIndicators';
import { ScheduledTasksView } from './components/ScheduledTasksView';
import { SupplierComparisonView } from './components/SupplierComparisonView';
import { AuditLogView } from './components/AuditLogView';
import { QuickActionModal } from './components/QuickActionModal';
import { DocumentScannerModal } from './components/DocumentScannerModal';
import { Toast } from './components/Toast';
import { setQuickActionModal } from './store/procurementSlice';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

const MainContent: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.procurement.activeTab);
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const quickActionModal = useSelector((state: RootState) => state.procurement.quickActionModal);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'kpis': return <KeyPerformanceIndicators />;
      case 'audit-log': return <AuditLogView />;
      case 'scheduled-tasks': return <ScheduledTasksView />;
      case 'purchase-requests': return <PurchaseRequestsView />;
      case 'purchase-orders': return <PurchaseOrdersView />;
      case 'suppliers':
      case 'supplier-evaluation': return <SuppliersView />;
      case 'quotations': return <SupplierComparisonView />;
      case 'inventory': return <InventoryView />;
      case 'material-receipts': return <MaterialReceivingView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'dark bg-[#18122b] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <Header />

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Quick Action Modal, Document Scanner Modal & Toasts */}
      <QuickActionModal />
      <DocumentScannerModal
        isOpen={quickActionModal === 'scanner'}
        onClose={() => dispatch(setQuickActionModal(null))}
      />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <MainContent />
    </Provider>
  );
}
