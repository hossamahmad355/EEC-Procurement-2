import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ApprovalStep {
  role: 'مدير الموقع' | 'مدير المشتريات' | 'المدير المالي';
  approverName: string;
  status: 'معلق' | 'موافق' | 'مرفوض';
  approvedAt?: string;
  note?: string;
}

export interface PurchaseRequest {
  id: string;
  code: string;
  title: string;
  project: string;
  department: string;
  requester: string;
  date: string;
  amount: number;
  status: 'معتمد' | 'قيد المراجعة' | 'مرفوض' | 'معلق' | 'معتمد من مدير الموقع' | 'معتمد من مدير المشتريات';
  category: 'مواد إنشائية' | 'كهربائية' | 'ميكانيكية' | 'تشطيبات' | 'أخرى';
  approvalSteps: ApprovalStep[];
  currentApprovalLevel: number; // 1 (مدير الموقع), 2 (مدير المشتريات), 3 (المدير المالي), 4 (معتمد كلياً)
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier: string;
  project: string;
  amount: number;
  date: string;
  status: 'جاري التنفيذ' | 'تم الاستلام' | 'قيد التوريد' | 'ملغي';
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  status: 'معتمد' | 'نشط' | 'متميز' | 'تحت المراجعة';
  phone: string;
  email: string;
  dealsCount: number;
  location: string;
  suppliedMaterials: string[];
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  warehouse: string;
  minLimit: number;
}

export interface MaterialReceipt {
  id: string;
  receiptCode: string;
  poCode: string;
  supplier: string;
  project: string;
  receivedDate: string;
  itemsCount: number;
  receiver: string;
  status: 'مطابق' | 'تحت الفحص' | 'مرفوض جزئياً';
}

export interface AppNotification {
  id: string;
  type: 'low_stock' | 'overdue_request' | 'overdue_order' | 'inspection_required';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'normal';
  targetTab: 'inventory' | 'purchase-requests' | 'purchase-orders' | 'material-receipts';
  filterMeta?: {
    requestStatus?: string;
    requestCategory?: string;
    orderStatus?: string;
    inventoryLowStock?: boolean;
  };
}

export interface SupplierQuoteOffer {
  supplierId: string;
  supplierName: string;
  location: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  qualityScore: number; // e.g. 98 out of 100
  isoCertified: boolean;
  warrantyPeriod: string;
  paymentTerms: string;
  shippingCost: number;
  reliabilityScore: number;
  notes: string;
  isBestPrice?: boolean;
  isFastestDelivery?: boolean;
  isHighestQuality?: boolean;
  isRecommended?: boolean;
}

export interface MaterialComparison {
  id: string;
  materialName: string;
  category: string;
  project: string;
  requiredQuantity: string;
  estimatedBudget: number;
  offers: SupplierQuoteOffer[];
}

export interface RecurringTask {
  id: string;
  title: string;
  type: 'supplier_price_update_reminder' | 'auto_rfq_on_low_stock' | 'weekly_procurement_summary' | 'inventory_audit_cron';
  frequency: 'يومي' | 'أسبوعي' | 'شهري' | 'آلي عند انخفاض المخزون';
  status: 'نشط' | 'متوقف' | 'مجدول';
  lastRun: string;
  nextRun: string;
  targetGroup: string;
  description: string;
  autoTriggerCount: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  actionType: 'موافقة' | 'رفض' | 'إصدار أمر' | 'تعديل مخزون' | 'إضافة مورد' | 'ترسية عرض' | 'أتمتة النظام' | 'استلام مواد' | 'إنشاء طلب';
  category: 'اعتماد الطلبات' | 'أوامر الشراء' | 'المخزون' | 'الموردين' | 'الأتمتة النظامية' | 'المقارنات والترسية';
  title: string;
  description: string;
  details?: string;
  status: 'ناجح' | 'معلق' | 'تحذير' | 'مرفوض';
  targetCode?: string;
}

interface ProcurementState {
  activeTab: string;
  darkMode: boolean;
  selectedYear: string;
  selectedProject: string;
  selectedPeriod: string;
  requests: PurchaseRequest[];
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  receipts: MaterialReceipt[];
  recurringTasks: RecurringTask[];
  materialComparisons: MaterialComparison[];
  selectedComparisonId: string;
  auditLogs: AuditLogItem[];
  quickActionModal: string | null; // 'new_request', 'new_order', 'new_receipt', 'new_supplier', 'new_quotation', 'reports', null
  notificationsCount: number;
  toastMessage: string | null;
  notifications: AppNotification[];
  isNotificationsOpen: boolean;
  // Dynamic Chart & Metric Filtering
  requestStatusFilter: string;
  requestCategoryFilter: string;
  orderStatusFilter: string;
  orderProjectFilter: string;
  inventoryLowStockFilter: boolean;
  inventoryCategoryFilter: string;
}

// Load from localStorage if available
const loadInitialState = (): Partial<ProcurementState> => {
  try {
    const saved = localStorage.getItem('eec_procurement_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }
  return {};
};

const createInitialSteps = (status: string): { currentApprovalLevel: number; approvalSteps: ApprovalStep[] } => {
  if (status === 'معتمد') {
    return {
      currentApprovalLevel: 4,
      approvalSteps: [
        { role: 'مدير الموقع', approverName: 'م. خالد عبد الرحمن', status: 'موافق', approvedAt: '2026-10-24 09:30', note: 'المواصفات الفنية مطابقة لموقع المشروع' },
        { role: 'مدير المشتريات', approverName: 'أ. طارق محمود', status: 'موافق', approvedAt: '2026-10-25 11:15', note: 'مقارنة عروض الأسعار معتمدة' },
        { role: 'المدير المالي', approverName: 'أ.د. عصام الدين', status: 'موافق', approvedAt: '2026-10-26 14:00', note: 'الميزانية مغطاة بالكامل' },
      ],
    };
  } else if (status === 'قيد المراجعة') {
    return {
      currentApprovalLevel: 2,
      approvalSteps: [
        { role: 'مدير الموقع', approverName: 'م. خالد عبد الرحمن', status: 'موافق', approvedAt: '2026-10-26 10:00', note: 'تم الفحص الميداني والموافقة' },
        { role: 'مدير المشتريات', approverName: 'أ. طارق محمود', status: 'معلق' },
        { role: 'المدير المالي', approverName: 'أ.د. عصام الدين', status: 'معلق' },
      ],
    };
  } else if (status === 'معتمد من مدير الموقع') {
    return {
      currentApprovalLevel: 2,
      approvalSteps: [
        { role: 'مدير الموقع', approverName: 'م. خالد عبد الرحمن', status: 'موافق', approvedAt: '2026-10-27 08:30', note: 'مطلوب للموقع بصورة عاجلة' },
        { role: 'مدير المشتريات', approverName: 'أ. طارق محمود', status: 'معلق' },
        { role: 'المدير المالي', approverName: 'أ.د. عصام الدين', status: 'معلق' },
      ],
    };
  } else if (status === 'مرفوض') {
    return {
      currentApprovalLevel: 1,
      approvalSteps: [
        { role: 'مدير الموقع', approverName: 'م. خالد عبد الرحمن', status: 'مرفوض', approvedAt: '2026-10-24 16:20', note: 'الكميات تزيد عن احتياج المرحلة الحالية' },
        { role: 'مدير المشتريات', approverName: 'أ. طارق محمود', status: 'معلق' },
        { role: 'المدير المالي', approverName: 'أ.د. عصام الدين', status: 'معلق' },
      ],
    };
  } else {
    return {
      currentApprovalLevel: 1,
      approvalSteps: [
        { role: 'مدير الموقع', approverName: 'م. خالد عبد الرحمن', status: 'معلق' },
        { role: 'مدير المشتريات', approverName: 'أ. طارق محمود', status: 'معلق' },
        { role: 'المدير المالي', approverName: 'أ.د. عصام الدين', status: 'معلق' },
      ],
    };
  }
};

const initialRequests: PurchaseRequest[] = [
  { id: '1', code: 'PR-285', title: 'حديد تسليح عالي المقاومة 16مم', project: 'المبنى الإداري', department: 'الهندسة الإنشائية', requester: 'مهندس أحمد سعيد', date: '2026-10-28', amount: 1250000, status: 'معتمد', category: 'مواد إنشائية', ...createInitialSteps('معتمد') },
  { id: '2', code: 'PR-284', title: 'كابلات نحاسية مدرعة 4×50 مم', project: 'محطة التحويل الرئيسية', department: 'القسم الكهربائي', requester: 'م. محمود حسن', date: '2026-10-27', amount: 675000, status: 'معتمد من مدير الموقع', category: 'كهربائية', ...createInitialSteps('معتمد من مدير الموقع') },
  { id: '3', code: 'PR-283', title: 'مضخات مياه غاطسة 15 حصان', project: 'المرافق العامة', department: 'الميكانيكا', requester: 'م. سامح عبد الله', date: '2026-10-26', amount: 420000, status: 'قيد المراجعة', category: 'ميكانيكية', ...createInitialSteps('قيد المراجعة') },
  { id: '4', code: 'PR-282', title: 'أطقم سيراميك فرز أول وبورسلين', project: 'مبنى الخدمات', department: 'التشطيبات', requester: 'أ. خالد ابراهيم', date: '2026-10-25', amount: 380000, status: 'معلق', category: 'تشطيبات', ...createInitialSteps('معلق') },
  { id: '5', code: 'PR-281', title: 'لوحات تحكم كهربائية توزيع رئيسي', project: 'المخازن الرئيسية', department: 'الكهرباء', requester: 'م. كريم عادل', date: '2026-10-24', amount: 2950000, status: 'مرفوض', category: 'كهربائية', ...createInitialSteps('مرفوض') },
  { id: '6', code: 'PR-280', title: 'أسمنت بورتلاندي مقاوم للأملاح', project: 'أبراج النيل السكنية', department: 'الإنشاءات', requester: 'م. طارق وفيق', date: '2026-10-23', amount: 1850000, status: 'معتمد', category: 'مواد إنشائية', ...createInitialSteps('معتمد') },
  { id: '7', code: 'PR-279', title: 'أنابيب عزل حراري وپولي بروبلين', project: 'المستشفى التخصصي', department: 'التكييف والميكانيكا', requester: 'م. هاني رجب', date: '2026-10-22', amount: 920000, status: 'قيد المراجعة', category: 'ميكانيكية', ...createInitialSteps('قيد المراجعة') },
];

const initialOrders: PurchaseOrder[] = [
  { id: '1', code: 'PR-0268', supplier: 'شركة النيل للحديد والصلب', project: 'المبنى الإداري', amount: 12500000, date: '2026-10-28', status: 'جاري التنفيذ' },
  { id: '2', code: 'PR-0259', supplier: 'شركة دلتا للكابلات الكهربائية', project: 'ورشة المعدات', amount: 6750000, date: '2026-10-25', status: 'جاري التنفيذ' },
  { id: '3', code: 'PR-0247', supplier: 'شركة الشرق للسباكة والأدوات', project: 'المرافق العامة', amount: 4200000, date: '2026-10-22', status: 'تم الاستلام' },
  { id: '4', code: 'PR-0239', supplier: 'شركة الأمل للتشطيبات والديكور', project: 'مبنى الخدمات', amount: 3800000, date: '2026-10-19', status: 'تم الاستلام' },
  { id: '5', code: 'PR-0226', supplier: 'شركة المتحدة للمواد البناء', project: 'المخازن الرئيسية', amount: 2950000, date: '2026-10-15', status: 'قيد التوريد' },
];

const initialSuppliers: Supplier[] = [
  { id: '1', name: 'شركة النيل للحديد والصلب', category: 'مواد إنشائية', rating: 4.8, status: 'متميز', phone: '+20 2 23456789', email: 'info@nile-steel.eg', dealsCount: 42, location: 'القاهرة - المنطقة الصناعية', suppliedMaterials: ['حديد تسليح 16مم', 'قطاعات صلب', 'أسياخ لحام'] },
  { id: '2', name: 'شركة دلتا للكابلات الكهربائية', category: 'كهربائية', rating: 4.6, status: 'معتمد', phone: '+20 3 54321098', email: 'sales@deltacables.eg', dealsCount: 28, location: 'الإسكندرية - برج العرب', suppliedMaterials: ['كابلات نحاسية', 'أسلاك مدرعة', 'لوحات توزيع'] },
  { id: '3', name: 'شركة الشرق للسباكة والصناعة', category: 'ميكانيكية', rating: 4.7, status: 'متميز', phone: '+20 2 27418529', email: 'contact@shark-pipe.eg', dealsCount: 35, location: 'الجيزة - 6 أكتوبر', suppliedMaterials: ['مضخات مياه', 'صمامات تحكم', 'أنابيب بولي بروبلين'] },
  { id: '4', name: 'المجموعة الهندسية الحديثة للأسمنت', category: 'مواد إنشائية', rating: 4.5, status: 'نشط', phone: '+20 2 29638527', email: 'orders@modern-cement.eg', dealsCount: 19, location: 'السويس - المنطقة الاقتصادية', suppliedMaterials: ['أسمنت بورتلاندي', 'خلطات خرسانية', 'طوب أحمر'] },
  { id: '5', name: 'شركة الأمل للدهانات والتشطيبات', category: 'تشطيبات', rating: 4.4, status: 'نشط', phone: '+20 2 25896314', email: 'support@alamel-dec.eg', dealsCount: 15, location: 'العاشر من رمضان', suppliedMaterials: ['دهانات جوتن', 'معجون حوائط', 'عوازل رطوبة'] },
  { id: '6', name: 'مؤسسة الكوثر للمعدات والأدوات', category: 'أخرى', rating: 4.2, status: 'معتمد', phone: '+20 2 24567890', email: 'sales@alkawthar.eg', dealsCount: 12, location: 'القاهرة - حلوان', suppliedMaterials: ['معدات لحام', 'مولدات كهربائية', 'أدوات سلامة'] },
  { id: '7', name: 'شركة الأهرام للسيراميك والبورسلين', category: 'تشطيبات', rating: 4.9, status: 'متميز', phone: '+20 2 38901234', email: 'info@ahram-ceramics.eg', dealsCount: 51, location: 'الجيزة - طريق إسكندرية الصحراوي', suppliedMaterials: ['بورسلين فرز أول', 'سيراميك أرضيات', 'أطقم حمامات'] },
  { id: '8', name: 'شركة القناة للمقاولات والتوريدات', category: 'ميكانيكية', rating: 3.9, status: 'تحت المراجعة', phone: '+20 64 3214567', email: 'contact@qanat-supplies.eg', dealsCount: 8, location: 'الإسماعيلية', suppliedMaterials: ['أنظمة تكييف مركزي', 'عزل حراري', 'محابس بخار'] },
];

const initialInventory: InventoryItem[] = [
  { id: '1', code: 'INV-101', name: 'حديد تسليح 12مم', category: 'مواد إنشائية', quantity: 4500, unit: 'طن', warehouse: 'مخزن القاهرة الرئيسي', minLimit: 1000 },
  { id: '2', code: 'INV-102', name: 'أسمنت بورتلاندي عادي', category: 'مواد إنشائية', quantity: 12000, unit: 'شكارة', warehouse: 'مخزن الإسكندرية', minLimit: 3000 },
  { id: '3', code: 'INV-103', name: 'كابل نحاس 3×10مم', category: 'كهربائية', quantity: 3400, unit: 'متر', warehouse: 'مخزن الجيزة', minLimit: 500 },
  { id: '4', code: 'INV-104', name: 'محبس بوابة نحاس 2 بوصة', category: 'ميكانيكية', quantity: 450, unit: 'قطعة', warehouse: 'مخزن القاهرة الرئيسي', minLimit: 100 },
  { id: '5', code: 'INV-105', name: 'بلاط بورسلين 60×60', category: 'تشطيبات', quantity: 8500, unit: 'متر مربع', warehouse: 'مخزن العاشر من رمضان', minLimit: 1500 },
  { id: '6', code: 'INV-106', name: 'دهان جوتن مقاوم للرطوبة 20L', category: 'تشطيبات', quantity: 25, unit: 'جالون', warehouse: 'مخزن الجيزة', minLimit: 100 },
  { id: '7', code: 'INV-107', name: 'صمام تحكم هيدروليكي 4 بوصة', category: 'ميكانيكية', quantity: 12, unit: 'قطعة', warehouse: 'مخزن القاهرة الرئيسي', minLimit: 30 },
  { id: '8', code: 'INV-108', name: 'كابل ألياف ضوئية سينجل مود', category: 'كهربائية', quantity: 180, unit: 'متر', warehouse: 'مخزن الإسكندرية', minLimit: 500 },
  { id: '9', code: 'INV-109', name: 'أسياخ لحام 3.2 مم عالية الصلابة', category: 'مواد إنشائية', quantity: 40, unit: 'علبة', warehouse: 'مخزن القاهرة الرئيسي', minLimit: 150 },
];

const initialReceipts: MaterialReceipt[] = [
  { id: '1', receiptCode: 'REC-501', poCode: 'PR-0247', supplier: 'شركة الشرق للسباكة والأدوات', project: 'المرافق العامة', receivedDate: '2026-10-29', itemsCount: 12, receiver: 'أحمد مرسي', status: 'مطابق' },
  { id: '2', receiptCode: 'REC-502', poCode: 'PR-0239', supplier: 'شركة الأمل للتشطيبات', project: 'مبنى الخدمات', receivedDate: '2026-10-28', itemsCount: 8, receiver: 'محمود الشريف', status: 'مطابق' },
  { id: '3', receiptCode: 'REC-503', poCode: 'PR-0268', supplier: 'شركة النيل للحديد', project: 'المبنى الإداري', receivedDate: '2026-10-27', itemsCount: 25, receiver: 'محمد عبد الستار', status: 'تحت الفحص' },
];

const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'low_stock',
    title: 'تنبيه حرج: دهان جوتن مقاوم للرطوبة 20L',
    message: 'المخزون الحالي 25 جالون فقط بالمقارنة مع حد الطلب الأدنى (100 جالون). يلزم إعادة الطلب الفوري.',
    date: 'منذ ساعتين',
    isRead: false,
    priority: 'high',
    targetTab: 'inventory',
    filterMeta: { inventoryLowStock: true }
  },
  {
    id: 'n2',
    type: 'overdue_request',
    title: 'تأخير اعتماد: طلب شراء PR-283 (مضخات مياه)',
    message: 'الطلب قيد المراجعة منذ 7 أيام بدون اتخاذ قرار تعميد. القيمة التقديرية: 420,000 ج.م.',
    date: 'منذ 3 ساعات',
    isRead: false,
    priority: 'high',
    targetTab: 'purchase-requests',
    filterMeta: { requestStatus: 'قيد المراجعة' }
  },
  {
    id: 'n3',
    type: 'low_stock',
    title: 'تنبيه مخزون: صمام تحكم هيدروليكي 4 بوصة',
    message: 'المخزون المتبقي بمخزن القاهرة الرئيسي 12 قطعة فقط (حد الطلب الأدنى 30 قطعة).',
    date: 'منذ 5 ساعات',
    isRead: false,
    priority: 'high',
    targetTab: 'inventory',
    filterMeta: { inventoryLowStock: true }
  },
  {
    id: 'n4',
    type: 'overdue_order',
    title: 'تأخير توريد: أمر شراء PR-0226 (المتحدة للبناء)',
    message: 'أمر التوريد قيد التوريد وتجاوز التاريخ المتوقع للتسليم في موقع المخازن الرئيسية.',
    date: 'منذ يوم واحد',
    isRead: false,
    priority: 'medium',
    targetTab: 'purchase-orders',
    filterMeta: { orderStatus: 'قيد التوريد' }
  },
  {
    id: 'n5',
    type: 'overdue_request',
    title: 'طلب شراء معلق: PR-282 (أطقم سيراميك فرز أول)',
    message: 'الطلب معلق بالقسم الإداري لمشروع مبنى الخدمات منذ 6 أيام.',
    date: 'منذ يومين',
    isRead: true,
    priority: 'medium',
    targetTab: 'purchase-requests',
    filterMeta: { requestStatus: 'معلق' }
  },
  {
    id: 'n6',
    type: 'low_stock',
    title: 'تنبيه مخزون: أسياخ لحام 3.2مم',
    message: 'المخزون المتوفر 40 علبة فقط بمخزن القاهرة (حد الطلب 150 علبة).',
    date: 'منذ يومين',
    isRead: true,
    priority: 'medium',
    targetTab: 'inventory',
    filterMeta: { inventoryLowStock: true }
  }
];

const initialRecurringTasks: RecurringTask[] = [
  {
    id: 'task-1',
    title: 'طلب عروض أسعار (RFQ) آلية عند انخفاض المخزون',
    type: 'auto_rfq_on_low_stock',
    frequency: 'آلي عند انخفاض المخزون',
    status: 'نشط',
    lastRun: '2026-10-28 14:00',
    nextRun: 'تلقائي عند تجاوز الحد الأدنى',
    targetGroup: 'الموردون المعتمدون (مواد إنشائية وكهربائية)',
    description: 'إنشاء طلبات عروض أسعار وإرسالها آلياً عبر البريد للشركات عند تجاوز الحد الأدنى للمخزون',
    autoTriggerCount: 14,
  },
  {
    id: 'task-2',
    title: 'تذكير دوري للموردين بتحديث قائمة الأسعار',
    type: 'supplier_price_update_reminder',
    frequency: 'شهري',
    status: 'نشط',
    lastRun: '2026-10-01 09:00',
    nextRun: '2026-11-01 09:00',
    targetGroup: 'جميع الموردين النشطين والمعتمدين (56 مورد)',
    description: 'إرسال رسائل بريد تذكيرية دورية للموردين لتحديث قائمة أسعار المواد وخصومات الكميات',
    autoTriggerCount: 8,
  },
  {
    id: 'task-3',
    title: 'إرسال التقرير الشامل الأسبوعي للمشتريات والميزانية',
    type: 'weekly_procurement_summary',
    frequency: 'أسبوعي',
    status: 'نشط',
    lastRun: '2026-10-26 08:00',
    nextRun: '2026-11-02 08:00',
    targetGroup: 'الإدارة العليا والمدير المالي',
    description: 'تجميع إحصائيات المشتريات والأوامر المعلقة والتوفير المحقق وتصديره إلكترونياً للإدارة',
    autoTriggerCount: 32,
  },
  {
    id: 'task-4',
    title: 'التدقيق والجرد الدوري لأذونات التسليم والمخازن',
    type: 'inventory_audit_cron',
    frequency: 'يومي',
    status: 'مجدول',
    lastRun: '2026-10-28 23:00',
    nextRun: '2026-10-29 23:00',
    targetGroup: 'أمناء المخازن ومديرو المشاريع',
    description: 'مطابقة أذونات الاستلام اليومية بالمواقع مع حركة المخزون وتحديد الفروقات تلقائياً',
    autoTriggerCount: 120,
  },
];

const initialMaterialComparisons: MaterialComparison[] = [
  {
    id: 'comp-1',
    materialName: 'حديد تسليح عالي المقاومة 16مم',
    category: 'مواد إنشائية',
    project: 'المبنى الإداري - التجمع الخامس',
    requiredQuantity: '250 طن',
    estimatedBudget: 1300000,
    offers: [
      {
        supplierId: '1',
        supplierName: 'شركة النيل للحديد والصلب',
        location: 'القاهرة - المنطقة الصناعية',
        unitPrice: 4950,
        totalPrice: 1237500,
        deliveryDays: 3,
        qualityScore: 98,
        isoCertified: true,
        warrantyPeriod: '10 سنوات (شهادة فك ومطابقة هيدروليكية)',
        paymentTerms: '20% دفعة مقدمة - 80% بعد الفحص والاستلام',
        shippingCost: 0,
        reliabilityScore: 4.8,
        notes: 'عرض متكامل يشتمل على اختبارات الشد والاختبارات المعملية مجاناً',
        isBestPrice: true,
        isFastestDelivery: true,
        isHighestQuality: true,
        isRecommended: true,
      },
      {
        supplierId: '4',
        supplierName: 'المجموعة الهندسية الحديثة للصلب',
        location: 'السويس - المنطقة الاقتصادية',
        unitPrice: 5100,
        totalPrice: 1275000,
        deliveryDays: 5,
        qualityScore: 94,
        isoCertified: true,
        warrantyPeriod: '5 سنوات',
        paymentTerms: '30% دفعة مقدمة - 70% آجل 30 يوم',
        shippingCost: 15000,
        reliabilityScore: 4.5,
        notes: 'إمكانية توفير كميات إضافية خلال 48 ساعة عند الطلب',
      },
      {
        supplierId: '9',
        supplierName: 'شركة السويس للصناعات الفولاذية',
        location: 'السويس - عتاقة',
        unitPrice: 5000,
        totalPrice: 1250000,
        deliveryDays: 7,
        qualityScore: 91,
        isoCertified: false,
        warrantyPeriod: '3 سنوات',
        paymentTerms: '50% دفعة مقدمة - 50% عند التسليم',
        shippingCost: 10000,
        reliabilityScore: 4.2,
        notes: 'يلزم تأكيد أمر الشراء قبل 5 أيام عمل من التوريد',
      },
    ],
  },
  {
    id: 'comp-2',
    materialName: 'كابلات نحاسية مدرعة 4×50 مم',
    category: 'كهربائية',
    project: 'محطة التحويل الرئيسية - ورشة المعدات',
    requiredQuantity: '1,500 متر',
    estimatedBudget: 700000,
    offers: [
      {
        supplierId: '2',
        supplierName: 'شركة دلتا للكابلات الكهربائية',
        location: 'الإسكندرية - برج العرب',
        unitPrice: 440,
        totalPrice: 660000,
        deliveryDays: 4,
        qualityScore: 96,
        isoCertified: true,
        warrantyPeriod: '5 سنوات',
        paymentTerms: '25% دفعة مقدمة - 75% بعد التسليم بمناطق المشروع',
        shippingCost: 5000,
        reliabilityScore: 4.6,
        notes: 'عرض منافس شاملاً بكرات التعبئة الخشبية والتأمين علي الشحنة',
        isBestPrice: true,
        isFastestDelivery: true,
        isRecommended: true,
      },
      {
        supplierId: '10',
        supplierName: 'شركة السويدي للتوريدات الكهربائية',
        location: 'العاشر من رمضان',
        unitPrice: 460,
        totalPrice: 690000,
        deliveryDays: 6,
        qualityScore: 99,
        isoCertified: true,
        warrantyPeriod: '10 سنوات ضمان شامل ضد عيوب التصنيع',
        paymentTerms: '10% دفعة مقدمة - 90% بعد اعتماد الاستلام النهائي',
        shippingCost: 0,
        reliabilityScore: 4.9,
        notes: 'أعلى مستوى من الجودة والمطابقة للمواصفات القياسية المصرية',
        isHighestQuality: true,
      },
      {
        supplierId: '11',
        supplierName: 'القاهرة للكابلات والصناعات',
        location: 'القاهرة - حلوان',
        unitPrice: 450,
        totalPrice: 675000,
        deliveryDays: 10,
        qualityScore: 90,
        isoCertified: true,
        warrantyPeriod: '3 سنوات',
        paymentTerms: '40% مقدم - 60% عند التوريد',
        shippingCost: 8000,
        reliabilityScore: 4.1,
        notes: 'ملاحظة: زمن التوريد أطول نسبيًا نظراً لضغط خطوط الإنتاج',
      },
    ],
  },
  {
    id: 'comp-3',
    materialName: 'مضخات مياه غاطسة 15 حصان',
    category: 'ميكانيكية',
    project: 'مشروع المرافق العامة والخزانات',
    requiredQuantity: '20 مضخة',
    estimatedBudget: 450000,
    offers: [
      {
        supplierId: '3',
        supplierName: 'شركة الشرق للسباكة والصناعة',
        location: 'الجيزة - 6 أكتوبر',
        unitPrice: 20500,
        totalPrice: 410000,
        deliveryDays: 2,
        qualityScore: 95,
        isoCertified: true,
        warrantyPeriod: '3 سنوات شاملة الصيانة قطع الغيار',
        paymentTerms: '20% دفعة مقدمة - 80% آجل 45 يوم',
        shippingCost: 0,
        reliabilityScore: 4.7,
        notes: 'توفير فني تركيب مجاني للمضخة الأولى بالموقع',
        isBestPrice: true,
        isFastestDelivery: true,
        isHighestQuality: true,
        isRecommended: true,
      },
      {
        supplierId: '6',
        supplierName: 'مؤسسة الكوثر للمعدات والأدوات',
        location: 'القاهرة - حلوان',
        unitPrice: 21800,
        totalPrice: 436000,
        deliveryDays: 5,
        qualityScore: 92,
        isoCertified: false,
        warrantyPeriod: '2 سنة',
        paymentTerms: '50% دفعة مقدمة - 50% عند التسليم',
        shippingCost: 4000,
        reliabilityScore: 4.2,
        notes: 'تأمين قطع الغيار لمدة سنتين بسعر التكلفة',
      },
    ],
  },
];

const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-28 14:30',
    user: 'أ.د. عصام الدين',
    userRole: 'المدير المالي',
    actionType: 'موافقة',
    category: 'اعتماد الطلبات',
    title: 'اعتماد نهائي لطلب الشراء PR-285',
    description: 'تمت الموافقة المالية واعتماد طلب حديد تسليح 16مم لمشروع المبنى الإداري بقيمة 1,250,000 ج.م',
    details: 'مستوى اعتماد (3 من 3) - الميزانية مخصصة بالكامل ببنود الإنشاءات',
    status: 'ناجح',
    targetCode: 'PR-285'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-28 11:15',
    user: 'النظام الآلي',
    userRole: 'مُشغّل الأتمتة',
    actionType: 'أتمتة النظام',
    category: 'الأتمتة النظامية',
    title: 'إرسال طلب عروض أسعار (RFQ) تلقائي',
    description: 'تم إرسال طلبات تسعير آلية إلى 3 موردين معتمدين لوصول مخزون (دهان جوتن) للحد الأدنى (25 جالون)',
    details: 'الموردون المستهدفون: شركة الأمل، شركة جوتن مصر، شركة القناة',
    status: 'ناجح',
    targetCode: 'INV-106'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-27 16:45',
    user: 'أ. طارق محمود',
    userRole: 'مدير المشتريات',
    actionType: 'ترسية عرض',
    category: 'المقارنات والترسية',
    title: 'ترسية توريد كابلات نحاسية مدرعة على شركة دلتا',
    description: 'اعتماد المقارنة الذكية وترسية توريد 1,500 متر كابل نحاسي بمبلغ 660,000 ج.م',
    details: 'تم اختيار شركة دلتا لتقديمها أفضل سعر وأسرع موعد تسليم (4 أيام)',
    status: 'ناجح',
    targetCode: 'PR-0259'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-27 09:10',
    user: 'م. خالد عبد الرحمن',
    userRole: 'مدير الموقع',
    actionType: 'موافقة',
    category: 'اعتماد الطلبات',
    title: 'موافقة المستوى الأول على الطلب PR-284',
    description: 'الموافقة على المواصفات الفنية لكابلات كهربائية بمشروع محطة التحويل الرئيسية',
    details: 'تم الفحص الميداني والموافقة على الاحتياج العاجل للموقع',
    status: 'ناجح',
    targetCode: 'PR-284'
  },
  {
    id: 'log-5',
    timestamp: '2026-10-26 15:20',
    user: 'أحمد مرسي',
    userRole: 'أمين مخزن المرافق',
    actionType: 'استلام مواد',
    category: 'المخزون',
    title: 'تسجيل استلام اذن REC-501',
    description: 'تم استلام 12 طقم مضخات مياه غاطسة من شركة الشرق للسباكة ومطابقتها للشروط',
    details: 'الحالة: مطابق بنسبة 100% مع شهادة الفحص المعملي',
    status: 'ناجح',
    targetCode: 'REC-501'
  },
  {
    id: 'log-6',
    timestamp: '2026-10-24 16:20',
    user: 'م. خالد عبد الرحمن',
    userRole: 'مدير الموقع',
    actionType: 'رفض',
    category: 'اعتماد الطلبات',
    title: 'رفض طلب الشراء PR-281',
    description: 'تم رفض طلب لوحات تحكم كهربائية توزيع رئيسي بمشروع المخازن بقيمة 2,950,000 ج.م',
    details: 'سبب الرفض: الكميات المطلوبة تزيد عن احتياج المرحلة الحالية بالموقع',
    status: 'مرفوض',
    targetCode: 'PR-281'
  },
  {
    id: 'log-7',
    timestamp: '2026-10-23 13:00',
    user: 'أ. طارق محمود',
    userRole: 'مدير المشتريات',
    actionType: 'إضافة مورد',
    category: 'الموردين',
    title: 'اعتماد مورد جديد: شركة الأهرام للسيراميك',
    description: 'إضافة شركة الأهرام للسيراميك والبورسلين إلى قائمة الموردين المعتمدين وتصنيفها كـ (متميز)',
    details: 'السجل التجاري: 492019 | التقييم الأولي: 4.9/5',
    status: 'ناجح',
    targetCode: 'SUP-007'
  }
];

const saved = loadInitialState();

const normalizedRequests: PurchaseRequest[] = (saved.requests || initialRequests).map((r: any) => {
  if (!r.approvalSteps || !Array.isArray(r.approvalSteps) || r.approvalSteps.length === 0) {
    return {
      ...r,
      ...createInitialSteps(r.status || 'قيد المراجعة'),
    };
  }
  return r;
});

const initialState: ProcurementState = {
  activeTab: saved.activeTab || 'dashboard',
  darkMode: saved.darkMode ?? true,
  selectedYear: saved.selectedYear || '2026',
  selectedProject: saved.selectedProject || 'جميع المشاريع',
  selectedPeriod: saved.selectedPeriod || 'من بداية العام',
  orders: saved.orders || initialOrders,
  suppliers: saved.suppliers || initialSuppliers,
  inventory: saved.inventory || initialInventory,
  receipts: saved.receipts || initialReceipts,
  recurringTasks: saved.recurringTasks || initialRecurringTasks,
  materialComparisons: saved.materialComparisons || initialMaterialComparisons,
  selectedComparisonId: saved.selectedComparisonId || 'comp-1',
  auditLogs: saved.auditLogs || initialAuditLogs,
  notifications: saved.notifications || initialNotifications,
  isNotificationsOpen: false,
  quickActionModal: null,
  notificationsCount: (saved.notifications || initialNotifications).filter((n) => !n.isRead).length,
  toastMessage: null,
  requestStatusFilter: 'الكل',
  requestCategoryFilter: 'الكل',
  orderStatusFilter: 'الكل',
  orderProjectFilter: 'الكل',
  inventoryLowStockFilter: false,
  inventoryCategoryFilter: 'الكل',
  ...saved,
  requests: normalizedRequests,
};

const saveToLocalStorage = (state: ProcurementState) => {
  try {
    localStorage.setItem('eec_procurement_state', JSON.stringify({
      activeTab: state.activeTab,
      darkMode: state.darkMode,
      selectedYear: state.selectedYear,
      selectedProject: state.selectedProject,
      selectedPeriod: state.selectedPeriod,
      requests: state.requests,
      orders: state.orders,
      suppliers: state.suppliers,
      inventory: state.inventory,
      receipts: state.receipts,
      recurringTasks: state.recurringTasks,
      materialComparisons: state.materialComparisons,
      selectedComparisonId: state.selectedComparisonId,
      auditLogs: state.auditLogs,
      notifications: state.notifications,
    }));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const procurementSlice = createSlice({
  name: 'procurement',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
      saveToLocalStorage(state);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      saveToLocalStorage(state);
    },
    setSelectedYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload;
      saveToLocalStorage(state);
    },
    setSelectedProject: (state, action: PayloadAction<string>) => {
      state.selectedProject = action.payload;
      saveToLocalStorage(state);
    },
    setSelectedPeriod: (state, action: PayloadAction<string>) => {
      state.selectedPeriod = action.payload;
      saveToLocalStorage(state);
    },
    setQuickActionModal: (state, action: PayloadAction<string | null>) => {
      state.quickActionModal = action.payload;
    },
    setToastMessage: (state, action: PayloadAction<string | null>) => {
      state.toastMessage = action.payload;
    },
    addPurchaseRequest: (
      state,
      action: PayloadAction<Omit<PurchaseRequest, 'id' | 'code' | 'date' | 'approvalSteps' | 'currentApprovalLevel'>>
    ) => {
      const newReq: PurchaseRequest = {
        ...action.payload,
        id: Date.now().toString(),
        code: `PR-${Math.floor(290 + Math.random() * 100)}`,
        date: new Date().toISOString().split('T')[0],
        currentApprovalLevel: 1,
        approvalSteps: [
          { role: 'مدير الموقع', approverName: 'م. خالد عبد الرحمن', status: 'معلق' },
          { role: 'مدير المشتريات', approverName: 'أ. طارق محمود', status: 'معلق' },
          { role: 'المدير المالي', approverName: 'أ.د. عصام الدين', status: 'معلق' },
        ],
      };
      state.requests.unshift(newReq);
      state.toastMessage = 'تم إنشاء طلب الشراء وتحويله آلياً للمستوى الأول (مدير الموقع)';
      state.quickActionModal = null;

      // Audit Log entry
      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        user: action.payload.requester || 'مهندس الموقع',
        userRole: 'مُعدّ الطلب',
        actionType: 'إنشاء طلب',
        category: 'اعتماد الطلبات',
        title: `إنشاء طلب شراء جديد ${newReq.code}`,
        description: `تم تقديم طلب شراء لـ (${newReq.title}) بمبلغ ${newReq.amount.toLocaleString('ar-EG')} ج.م`,
        details: `المشروع: ${newReq.project} | القسم: ${newReq.department}`,
        status: 'معلق',
        targetCode: newReq.code
      });

      saveToLocalStorage(state);
    },
    advanceApprovalStep: (
      state,
      action: PayloadAction<{
        requestId: string;
        role: 'مدير الموقع' | 'مدير المشتريات' | 'المدير المالي';
        decision: 'موافق' | 'مرفوض';
        approverName?: string;
        note?: string;
      }>
    ) => {
      const req = state.requests.find((r) => r.id === action.payload.requestId);
      if (!req) return;

      if (!req.approvalSteps || !Array.isArray(req.approvalSteps)) {
        const initialized = createInitialSteps(req.status || 'قيد المراجعة');
        req.approvalSteps = initialized.approvalSteps;
        req.currentApprovalLevel = initialized.currentApprovalLevel;
      }

      const stepIndex = req.approvalSteps.findIndex((s) => s.role === action.payload.role);
      if (stepIndex === -1) return;

      const now =
        new Date().toISOString().split('T')[0] +
        ' ' +
        new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      req.approvalSteps[stepIndex].status = action.payload.decision;
      req.approvalSteps[stepIndex].approvedAt = now;
      if (action.payload.note) {
        req.approvalSteps[stepIndex].note = action.payload.note;
      }
      if (action.payload.approverName) {
        req.approvalSteps[stepIndex].approverName = action.payload.approverName;
      }

      let logTitle = '';
      let logDesc = '';

      if (action.payload.decision === 'مرفوض') {
        req.status = 'مرفوض';
        state.toastMessage = `تم رفض طلب الشراء ${req.code} في مستوى (${action.payload.role})`;
        logTitle = `رفض طلب الشراء ${req.code} في مستوى (${action.payload.role})`;
        logDesc = `تم رفض الطلب بواسطة ${action.payload.approverName || action.payload.role}`;
      } else {
        if (action.payload.role === 'مدير الموقع') {
          req.currentApprovalLevel = 2;
          req.status = 'معتمد من مدير الموقع';
          state.toastMessage = `تمت موافقة مدير الموقع على الطلب ${req.code} وتحويله لمدير المشتريات`;
          logTitle = `اعتماد المستوى الأول (مدير الموقع) - ${req.code}`;
          logDesc = `تمت الموافقة الميدانية والفنية على طلب ${req.title}`;
        } else if (action.payload.role === 'مدير المشتريات') {
          req.currentApprovalLevel = 3;
          req.status = 'معتمد من مدير المشتريات';
          state.toastMessage = `تمت موافقة مدير المشتريات على الطلب ${req.code} وتحويله للمدير المالي`;
          logTitle = `اعتماد المستوى الثاني (مدير المشتريات) - ${req.code}`;
          logDesc = `تمت موافقة المشتريات والتحقق من الأسعار والموردين`;
        } else if (action.payload.role === 'المدير المالي') {
          req.currentApprovalLevel = 4;
          req.status = 'معتمد';
          state.toastMessage = `مبروك! تم اعتماد طلب الشراء ${req.code} نهائياً بجميع المستويات الثلاثة`;
          logTitle = `الاعتماد النهائي المالي والشامل - ${req.code}`;
          logDesc = `تم الاعتماد المالي النهائي وإجازة صرف الميزانية`;
        }
      }

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: now,
        user: action.payload.approverName || action.payload.role,
        userRole: action.payload.role,
        actionType: action.payload.decision === 'موافق' ? 'موافقة' : 'رفض',
        category: 'اعتماد الطلبات',
        title: logTitle,
        description: logDesc,
        details: action.payload.note ? `ملاحظة: ${action.payload.note}` : `حالة الطلب الحالية: ${req.status}`,
        status: action.payload.decision === 'موافق' ? 'ناجح' : 'مرفوض',
        targetCode: req.code
      });

      saveToLocalStorage(state);
    },
    addPurchaseOrder: (state, action: PayloadAction<Omit<PurchaseOrder, 'id'>>) => {
      const newOrder: PurchaseOrder = {
        ...action.payload,
        id: Date.now().toString(),
        code: `PR-0${Math.floor(300 + Math.random() * 100)}`,
        date: new Date().toISOString().split('T')[0],
      };
      state.orders.unshift(newOrder);
      state.toastMessage = 'تم إصدار أمر الشراء بنجاح وحفظه تلقائياً';
      state.quickActionModal = null;

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        user: 'أ. طارق محمود',
        userRole: 'مدير المشتريات',
        actionType: 'إصدار أمر',
        category: 'أوامر الشراء',
        title: `إصدار أمر شراء جديد ${newOrder.code}`,
        description: `تم إصدار أمر شراء لصالح (${newOrder.supplier}) بمبلغ ${newOrder.amount.toLocaleString('ar-EG')} ج.م`,
        details: `المشروع المستهدف: ${newOrder.project}`,
        status: 'ناجح',
        targetCode: newOrder.code
      });

      saveToLocalStorage(state);
    },
    addSupplier: (state, action: PayloadAction<Omit<Supplier, 'id'>>) => {
      const newSupplier: Supplier = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.suppliers.unshift(newSupplier);
      state.toastMessage = 'تم تسجيل المورد الجديد بنجاح وحفظه تلقائياً';
      state.quickActionModal = null;

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        user: 'أ. طارق محمود',
        userRole: 'مدير المشتريات',
        actionType: 'إضافة مورد',
        category: 'الموردين',
        title: `تسجيل مورد جديد: ${newSupplier.name}`,
        description: `تسجيل ${newSupplier.name} لتصنيف (${newSupplier.category}) بحالة (${newSupplier.status})`,
        details: `الموقع: ${newSupplier.location} | الهاتف: ${newSupplier.phone}`,
        status: 'ناجح',
        targetCode: newSupplier.id
      });

      saveToLocalStorage(state);
    },
    addMaterialReceipt: (state, action: PayloadAction<Omit<MaterialReceipt, 'id'>>) => {
      const newReceipt: MaterialReceipt = {
        ...action.payload,
        id: Date.now().toString(),
        receiptCode: `REC-${Math.floor(600 + Math.random() * 100)}`,
        receivedDate: new Date().toISOString().split('T')[0],
      };
      state.receipts.unshift(newReceipt);
      state.toastMessage = 'تم تسجيل استلام المواد بنجاح وحفظه تلقائياً';
      state.quickActionModal = null;

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        user: newReceipt.receiver || 'أمين المخزن',
        userRole: 'أمين المخزن',
        actionType: 'استلام مواد',
        category: 'المخزون',
        title: `تسجيل إذن استلام ${newReceipt.receiptCode}`,
        description: `استلام ${newReceipt.itemsCount} بند من المورد (${newReceipt.supplier}) بموجب أمر ${newReceipt.poCode}`,
        details: `المشروع: ${newReceipt.project} | الفحص: ${newReceipt.status}`,
        status: newReceipt.status === 'مطابق' ? 'ناجح' : 'تحذير',
        targetCode: newReceipt.receiptCode
      });

      saveToLocalStorage(state);
    },
    updateRequestStatus: (state, action: PayloadAction<{ id: string; status: PurchaseRequest['status'] }>) => {
      const req = state.requests.find((r) => r.id === action.payload.id);
      if (req) {
        req.status = action.payload.status;
        state.toastMessage = `تم تحديث حالة الطلب ${req.code} إلى (${action.payload.status})`;
        saveToLocalStorage(state);
      }
    },
    toggleTaskStatus: (state, action: PayloadAction<string>) => {
      const task = state.recurringTasks.find((t) => t.id === action.payload);
      if (task) {
        task.status = task.status === 'نشط' ? 'متوقف' : 'نشط';
        state.toastMessage = `تم تغيير حالة المهمة "${task.title}" إلى (${task.status})`;
        saveToLocalStorage(state);
      }
    },
    triggerTaskExecution: (state, action: PayloadAction<string>) => {
      const task = state.recurringTasks.find((t) => t.id === action.payload);
      if (task) {
        const nowFormatted =
          new Date().toISOString().split('T')[0] +
          ' ' +
          new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        task.lastRun = nowFormatted;
        task.autoTriggerCount += 1;
        state.toastMessage = `تم تشغيل المهمة الآلية "${task.title}" بنجاح وتنفيد الإجراء الآن`;

        state.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: nowFormatted,
          user: 'النظام الآلي',
          userRole: 'مُشغّل الأتمتة',
          actionType: 'أتمتة النظام',
          category: 'الأتمتة النظامية',
          title: `تشغيل آلي: ${task.title}`,
          description: task.description,
          details: `المجموعة المستهدفة: ${task.targetGroup} | عدد المرات: ${task.autoTriggerCount}`,
          status: 'ناجح',
          targetCode: task.id
        });

        saveToLocalStorage(state);
      }
    },
    addRecurringTask: (state, action: PayloadAction<Omit<RecurringTask, 'id' | 'lastRun' | 'autoTriggerCount'>>) => {
      const newTask: RecurringTask = {
        ...action.payload,
        id: `task-${Date.now()}`,
        lastRun: 'لم تُنفذ بعد',
        autoTriggerCount: 0,
      };
      state.recurringTasks.unshift(newTask);
      state.toastMessage = 'تم إدراج قاعدة الأتمتة والجدولة الآلية الجديدة بنجاح';
      saveToLocalStorage(state);
    },
    setRequestStatusFilter: (state, action: PayloadAction<string>) => {
      state.requestStatusFilter = action.payload;
    },
    setRequestCategoryFilter: (state, action: PayloadAction<string>) => {
      state.requestCategoryFilter = action.payload;
    },
    setOrderStatusFilter: (state, action: PayloadAction<string>) => {
      state.orderStatusFilter = action.payload;
    },
    setOrderProjectFilter: (state, action: PayloadAction<string>) => {
      state.orderProjectFilter = action.payload;
    },
    setInventoryLowStockFilter: (state, action: PayloadAction<boolean>) => {
      state.inventoryLowStockFilter = action.payload;
    },
    setInventoryCategoryFilter: (state, action: PayloadAction<string>) => {
      state.inventoryCategoryFilter = action.payload;
    },
    clearAllFilters: (state) => {
      state.requestStatusFilter = 'الكل';
      state.requestCategoryFilter = 'الكل';
      state.orderStatusFilter = 'الكل';
      state.orderProjectFilter = 'الكل';
      state.inventoryLowStockFilter = false;
      state.inventoryCategoryFilter = 'الكل';
    },
    openFilteredView: (
      state,
      action: PayloadAction<{
        tab: string;
        requestStatus?: string;
        requestCategory?: string;
        orderStatus?: string;
        orderProject?: string;
        inventoryLowStock?: boolean;
        inventoryCategory?: string;
        toastMsg?: string;
      }>
    ) => {
      state.activeTab = action.payload.tab;
      if (action.payload.requestStatus !== undefined) {
        state.requestStatusFilter = action.payload.requestStatus;
      }
      if (action.payload.requestCategory !== undefined) {
        state.requestCategoryFilter = action.payload.requestCategory;
      }
      if (action.payload.orderStatus !== undefined) {
        state.orderStatusFilter = action.payload.orderStatus;
      }
      if (action.payload.orderProject !== undefined) {
        state.orderProjectFilter = action.payload.orderProject;
      }
      if (action.payload.inventoryLowStock !== undefined) {
        state.inventoryLowStockFilter = action.payload.inventoryLowStock;
      }
      if (action.payload.inventoryCategory !== undefined) {
        state.inventoryCategoryFilter = action.payload.inventoryCategory;
      }
      if (action.payload.toastMsg) {
        state.toastMessage = action.payload.toastMsg;
      }
      saveToLocalStorage(state);
    },
    toggleNotificationsPanel: (state) => {
      state.isNotificationsOpen = !state.isNotificationsOpen;
    },
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationsOpen = action.payload;
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => (n.isRead = true));
      state.notificationsCount = 0;
      saveToLocalStorage(state);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find((item) => item.id === action.payload);
      if (n && !n.isRead) {
        n.isRead = true;
        state.notificationsCount = Math.max(0, state.notificationsCount - 1);
        saveToLocalStorage(state);
      }
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      const idx = state.notifications.findIndex((item) => item.id === action.payload);
      if (idx !== -1) {
        if (!state.notifications[idx].isRead) {
          state.notificationsCount = Math.max(0, state.notificationsCount - 1);
        }
        state.notifications.splice(idx, 1);
        saveToLocalStorage(state);
      }
    },
    setSelectedComparisonId: (state, action: PayloadAction<string>) => {
      state.selectedComparisonId = action.payload;
      saveToLocalStorage(state);
    },
    awardQuotationToSupplier: (
      state,
      action: PayloadAction<{ comparisonId: string; offer: SupplierQuoteOffer }>
    ) => {
      const comp = state.materialComparisons.find((c) => c.id === action.payload.comparisonId);
      const offer = action.payload.offer;
      const poCode = `PR-0${Math.floor(320 + Math.random() * 80)}`;
      const newOrder: PurchaseOrder = {
        id: Date.now().toString(),
        code: poCode,
        supplier: offer.supplierName,
        project: comp ? comp.project : 'مشروع المشتريات الرئيسية',
        amount: offer.totalPrice,
        date: new Date().toISOString().split('T')[0],
        status: 'جاري التنفيذ',
      };
      state.orders.unshift(newOrder);
      state.toastMessage = `تمت الترسية بنجاح على (${offer.supplierName}) وإصدار أمر الشراء رقم ${poCode} بمبلغ ${offer.totalPrice.toLocaleString('ar-EG')} ج.م`;
      state.activeTab = 'purchase-orders';

      state.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        user: 'أ. طارق محمود',
        userRole: 'مدير المشتريات',
        actionType: 'ترسية عرض',
        category: 'المقارنات والترسية',
        title: `ترسية مناقصة وتوليد أمر شراء ${poCode}`,
        description: `ترسية توريد (${comp ? comp.materialName : 'مواد'}) على المورد (${offer.supplierName})`,
        details: `المبلغ: ${offer.totalPrice.toLocaleString('ar-EG')} ج.م | سرعة التسليم: ${offer.deliveryDays} أيام`,
        status: 'ناجح',
        targetCode: poCode
      });

      saveToLocalStorage(state);
    },
    addAuditLog: (state, action: PayloadAction<Omit<AuditLogItem, 'id' | 'timestamp'>>) => {
      const now =
        new Date().toISOString().split('T')[0] +
        ' ' +
        new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const newLog: AuditLogItem = {
        ...action.payload,
        id: `log-${Date.now()}`,
        timestamp: now,
      };
      state.auditLogs.unshift(newLog);
      saveToLocalStorage(state);
    },
    updateInventoryItemStock: (
      state,
      action: PayloadAction<{ id: string; newQuantity: number; newMinLimit?: number }>
    ) => {
      const item = state.inventory.find((i) => i.id === action.payload.id);
      if (!item) return;

      const prevQuantity = item.quantity;
      item.quantity = Math.max(0, action.payload.newQuantity);
      if (action.payload.newMinLimit !== undefined && action.payload.newMinLimit >= 0) {
        item.minLimit = action.payload.newMinLimit;
      }

      const now =
        new Date().toISOString().split('T')[0] +
        ' ' +
        new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      // Automatically trigger Reorder Point alert if quantity drops below or equal to minLimit
      if (item.quantity <= item.minLimit) {
        const deficit = Math.max(item.minLimit - item.quantity, Math.ceil(item.minLimit * 0.5));
        const alertTitle = `تنبيه آلي (تحت حد الطلب): ${item.name}`;
        const alertMsg = `انخفض الرصيد في (${item.warehouse}) إلى ${item.quantity.toLocaleString('ar-EG')} ${item.unit} وهو أقل من حد الطلب (${item.minLimit.toLocaleString('ar-EG')} ${item.unit}). الكمية المقترحة لإعادة الطلب: ${deficit.toLocaleString('ar-EG')} ${item.unit}.`;

        const newNotification: AppNotification = {
          id: `reorder-${item.code}-${Date.now()}`,
          type: 'low_stock',
          title: alertTitle,
          message: alertMsg,
          date: 'الآن (تنبيه تلقائي)',
          isRead: false,
          priority: 'high',
          targetTab: 'inventory',
          filterMeta: { inventoryLowStock: true },
        };

        state.notifications.unshift(newNotification);
        state.notificationsCount = state.notifications.filter((n) => !n.isRead).length;
        state.toastMessage = `⚠️ تنبيه تلقائي: رصيد "${item.name}" (${item.quantity} ${item.unit}) وصل إلى أقل من حد الطلب (${item.minLimit} ${item.unit})!`;

        state.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: now,
          user: 'نظام رصد المخزون الآلي',
          userRole: 'مراقب حد الطلب (Reorder Point)',
          actionType: 'تعديل مخزون',
          category: 'المخزون',
          title: `إطلاق تنبيه حد الطلب تلقائياً للمادة ${item.code}`,
          description: `تغير الرصيد من ${prevQuantity} إلى ${item.quantity} ${item.unit} (حد الطلب: ${item.minLimit} ${item.unit}) في ${item.warehouse}`,
          details: alertMsg,
          status: 'تحذير',
          targetCode: item.code,
        });
      } else {
        state.toastMessage = `تم تحديث رصيد "${item.name}" إلى ${item.quantity.toLocaleString('ar-EG')} ${item.unit}`;
        state.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: now,
          user: 'أمين المخزن الرئيسي',
          userRole: 'إدارة المخازن',
          actionType: 'تعديل مخزون',
          category: 'المخزون',
          title: `تحديث رصيد المخزون للمادة ${item.code}`,
          description: `تعديل الرصيد من ${prevQuantity} إلى ${item.quantity} ${item.unit} في ${item.warehouse}`,
          details: `الرصيد الحالي آمن فوق حد الطلب (${item.minLimit} ${item.unit})`,
          status: 'ناجح',
          targetCode: item.code,
        });
      }

      saveToLocalStorage(state);
    },
    sendReorderAlertNotification: (
      state,
      action: PayloadAction<{ itemId?: string; silentToast?: boolean }>
    ) => {
      const now =
        new Date().toISOString().split('T')[0] +
        ' ' +
        new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      const targetItems = action.payload.itemId
        ? state.inventory.filter((i) => i.id === action.payload.itemId && i.quantity <= i.minLimit)
        : state.inventory.filter((i) => i.quantity <= i.minLimit);

      if (targetItems.length === 0) {
        if (!action.payload.silentToast) {
          state.toastMessage = 'جميع أصناف المخزون فوق حد الطلب الآمن حالياً';
        }
        return;
      }

      let addedCount = 0;
      targetItems.forEach((item, idx) => {
        const alreadyUnread = state.notifications.some(
          (n) => !n.isRead && n.type === 'low_stock' && n.title.includes(item.name)
        );
        if (!alreadyUnread || action.payload.itemId) {
          const deficit = Math.max(item.minLimit * 2 - item.quantity, item.minLimit);
          state.notifications.unshift({
            id: `reorder-alert-${item.code}-${Date.now()}-${idx}`,
            type: 'low_stock',
            title: `تنبيه حد الطلب (Reorder Point): ${item.name}`,
            message: `الرصيد المتاح (${item.quantity} ${item.unit}) أقل من حد الطلب (${item.minLimit} ${item.unit}) في ${item.warehouse}. يُوصى بطلب ${deficit} ${item.unit} فوراً.`,
            date: 'الآن (فحص تلقائي)',
            isRead: false,
            priority: 'high',
            targetTab: 'inventory',
            filterMeta: { inventoryLowStock: true },
          });
          addedCount++;
        }
      });

      state.notificationsCount = state.notifications.filter((n) => !n.isRead).length;

      if (addedCount > 0) {
        if (!action.payload.silentToast) {
          state.toastMessage =
            targetItems.length === 1
              ? `تم إرسال تنبيه عاجل لتجاوز حد الطلب للمادة: ${targetItems[0].name}`
              : `تم إرسال ${addedCount} تنبيهات تلقائية للمواد التي وصلت لأقل من حد الطلب (Reorder Point)`;
        }

        state.auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: now,
          user: 'النظام الآلي',
          userRole: 'مراقب حد الطلب (Reorder Point)',
          actionType: 'أتمتة النظام',
          category: 'المخزون',
          title: `إرسال تنبيهات حد الطلب (${addedCount} مادة حرجة)`,
          description: `تم رصد ${targetItems.length} مواد تحت حد الطلب الأدنى وإرسال إشعارات فورية لقسم المشتريات`,
          details: `المواد: ${targetItems.map((i) => `${i.name} (${i.quantity}/${i.minLimit})`).join(' ، ')}`,
          status: 'تحذير',
          targetCode: targetItems[0]?.code || 'INV-ALERT',
        });
      } else if (!action.payload.silentToast) {
        state.toastMessage = `تم تحديث وبث تنبيهات حد الطلب لعدد (${targetItems.length}) مواد حرجة في مركز الإشعارات`;
      }

      saveToLocalStorage(state);
    },
  },
});

export const {
  setActiveTab,
  toggleDarkMode,
  setSelectedYear,
  setSelectedProject,
  setSelectedPeriod,
  setQuickActionModal,
  setToastMessage,
  addPurchaseRequest,
  advanceApprovalStep,
  addPurchaseOrder,
  addSupplier,
  addMaterialReceipt,
  updateRequestStatus,
  toggleTaskStatus,
  triggerTaskExecution,
  addRecurringTask,
  setSelectedComparisonId,
  awardQuotationToSupplier,
  addAuditLog,
  updateInventoryItemStock,
  sendReorderAlertNotification,
  setRequestStatusFilter,
  setRequestCategoryFilter,
  setOrderStatusFilter,
  setOrderProjectFilter,
  setInventoryLowStockFilter,
  setInventoryCategoryFilter,
  clearAllFilters,
  openFilteredView,
  toggleNotificationsPanel,
  setNotificationsOpen,
  markAllNotificationsRead,
  markNotificationRead,
  dismissNotification,
} = procurementSlice.actions;

export default procurementSlice.reducer;
