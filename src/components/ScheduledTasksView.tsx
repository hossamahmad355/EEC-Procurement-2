import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
  toggleTaskStatus,
  triggerTaskExecution,
  addRecurringTask,
  RecurringTask
} from '../store/procurementSlice';
import {
  CalendarClock,
  Play,
  Pause,
  Plus,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  BellRing,
  Bot,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScheduledTasksView: React.FC = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.procurement.recurringTasks);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<RecurringTask['type']>('auto_rfq_on_low_stock');
  const [newTaskFrequency, setNewTaskFrequency] = useState<RecurringTask['frequency']>('آلي عند انخفاض المخزون');
  const [newTaskTargetGroup, setNewTaskTargetGroup] = useState('الموردون المعتمدون');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const activeCount = tasks.filter((t: RecurringTask) => t.status === 'نشط' || t.status === 'مجدول').length;
  const totalTriggers = tasks.reduce((sum: number, t: RecurringTask) => sum + t.autoTriggerCount, 0);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDescription.trim()) return;

    dispatch(
      addRecurringTask({
        title: newTaskTitle,
        type: newTaskType,
        frequency: newTaskFrequency,
        status: 'نشط',
        nextRun: newTaskFrequency === 'آلي عند انخفاض المخزون' ? 'تلقائي عند الهبوط' : 'خلال 24 ساعة',
        targetGroup: newTaskTargetGroup,
        description: newTaskDescription,
      })
    );

    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsModalOpen(false);
  };

  const getTaskIcon = (type: RecurringTask['type']) => {
    switch (type) {
      case 'auto_rfq_on_low_stock':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'supplier_price_update_reminder':
        return <Send className="w-5 h-5 text-blue-500" />;
      case 'weekly_procurement_summary':
        return <Layers className="w-5 h-5 text-purple-500" />;
      case 'inventory_audit_cron':
        return <RefreshCw className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bot className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">جدولة المهام والأتمتة الآلية</h1>
              <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                محرك الأتمتة الذكي
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              إدارة التذكيرات الدورية للموردين، وتوليد طلبات عروض الأسعار (RFQ) التلقائية، وجدولة التقارير وجرد المخازن
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة قاعدة أتمتة جديدة</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي قواعد الأتمتة</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">{tasks.length}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">المهام النشطة حالياً</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">مرات التنفيذ الآلي</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-1 tabular-nums">{totalTriggers} عملية</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">تذكيرات الأسعار والـ RFQ</p>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 tabular-nums">مربوطة بالبريد</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <BellRing className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Automation Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>قواعد وجداول التشغيل الدورية والآلية</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({tasks.length} قاعدة)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tasks.map((task: RecurringTask) => {
            const isActive = task.status === 'نشط' || task.status === 'مجدول';
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all shadow-xs flex flex-col justify-between ${
                  isActive
                    ? 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                    : 'border-slate-200 dark:border-slate-800/60 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getTaskIcon(task.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">التكرار:</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200 font-medium">
                            {task.frequency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => dispatch(toggleTaskStatus(task.id))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>نشط</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>متوقف</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {task.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">المستهدفون:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{task.targetGroup}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-400 block mb-0.5">مرات التشغيل الآلي:</span>
                      <span className="font-bold text-amber-500 dark:text-amber-400 tabular-nums">{task.autoTriggerCount} مرة</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>آخر تنفيذ: {task.lastRun}</span>
                  </div>

                  <button
                    onClick={() => dispatch(triggerTaskExecution(task.id))}
                    className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs rounded-xl border border-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>تشغيل فوري الآن</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding a new recurring task */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">إضافة قاعدة أتمتة وجدولة جديدة</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    اسم قاعدة الأتمتة / المهمة
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: إرسال تذكير أسبوعي بمطابقة الأسعار"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      نوع العملية
                    </label>
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="auto_rfq_on_low_stock">طلب RFQ تلقائي عند نقص المخزون</option>
                      <option value="supplier_price_update_reminder">تذكير الموردين بتحديث الأسعار</option>
                      <option value="weekly_procurement_summary">تقرير أسبوعي للإدارة</option>
                      <option value="inventory_audit_cron">جرد وتدقيق دوري للمخازن</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      معدل التكرار
                    </label>
                    <select
                      value={newTaskFrequency}
                      onChange={(e) => setNewTaskFrequency(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="آلي عند انخفاض المخزون">آلي عند انخفاض المخزون</option>
                      <option value="يومي">يومي</option>
                      <option value="أسبوعي">أسبوعي</option>
                      <option value="شهري">شهري</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    المجموعة المستهدفة
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: موردي المواد الكهربائية والإنشائية"
                    value={newTaskTargetGroup}
                    onChange={(e) => setNewTaskTargetGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    وصف القاعدة والمهام المنفذة تلقائياً
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="اشرح آلية عمل القاعدة والإجراء التلقائي المتخذ عند التشغيل..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md"
                  >
                    حفظ تفعيل القاعدة
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
