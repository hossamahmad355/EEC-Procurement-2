import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { advanceApprovalStep, PurchaseRequest } from '../store/procurementSlice';
import {
  CheckCircle2,
  XCircle,
  Clock,
  X,
  UserCheck,
  ShieldCheck,
  Building2,
  DollarSign,
  ShoppingCart,
  Send,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApprovalWorkflowModalProps {
  request: PurchaseRequest | null;
  onClose: () => void;
}

export const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({
  request,
  onClose,
}) => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);

  const [activeRole, setActiveRole] = useState<'مدير الموقع' | 'مدير المشتريات' | 'المدير المالي'>(
    'مدير الموقع'
  );
  const [approverName, setApproverName] = useState('');
  const [note, setNote] = useState('');

  if (!request) return null;

  const handleDecision = (decision: 'موافق' | 'مرفوض') => {
    const defaultNameMap = {
      'مدير الموقع': 'م. خالد عبد الرحمن (مدير موقع ' + request.project + ')',
      'مدير المشتريات': 'أ. طارق محمود (مدير إدارة المشتريات)',
      'المدير المالي': 'أ.د. عصام الدين (المدير المالي العام)',
    };

    dispatch(
      advanceApprovalStep({
        requestId: request.id,
        role: activeRole,
        decision,
        approverName: approverName || defaultNameMap[activeRole],
        note: note || (decision === 'موافق' ? 'تمت المراجعة والاعتماد الميداني' : 'تم الرفض لعدم مطابقة الشروط'),
      })
    );

    if (decision === 'موافق' && activeRole === 'المدير المالي') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    setNote('');
  };

  const getStepColor = (status: string) => {
    if (status === 'موافق') return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15';
    if (status === 'مرفوض') return 'text-red-400 border-red-500/40 bg-red-500/15';
    return 'text-amber-400 border-amber-500/40 bg-amber-500/15';
  };

  const safeApprovalSteps =
    request.approvalSteps && Array.isArray(request.approvalSteps) && request.approvalSteps.length > 0
      ? request.approvalSteps
      : [
          { role: 'مدير الموقع' as const, approverName: 'م. خالد عبد الرحمن', status: (request.status === 'معتمد' ? 'موافق' : 'معلق') as 'معلق' | 'موافق' | 'مرفوض' },
          { role: 'مدير المشتريات' as const, approverName: 'أ. طارق محمود', status: (request.status === 'معتمد' ? 'موافق' : 'معلق') as 'معلق' | 'موافق' | 'مرفوض' },
          { role: 'المدير المالي' as const, approverName: 'أ.د. عصام الدين', status: (request.status === 'معتمد' ? 'موافق' : 'معلق') as 'معلق' | 'موافق' | 'مرفوض' },
        ];

  const currentLevel = request.currentApprovalLevel || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all transform scale-100 ${
        darkMode ? 'bg-slate-900 border-indigo-900 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 px-6 py-4 flex items-center justify-between text-white border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">سير عمل الاعتماد متعدد المستويات (Workflow)</h3>
              <p className="text-xs text-amber-300">
                طلب شراء رقم: {request.code} | {request.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Request Meta Box */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border text-xs ${
            darkMode ? 'bg-slate-800/50 border-slate-700/30 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <div>
              <span className="opacity-60 block">المشروع</span>
              <span className="font-bold">{request.project}</span>
            </div>
            <div>
              <span className="opacity-60 block">مقدم الطلب</span>
              <span className="font-bold">{request.requester}</span>
            </div>
            <div>
              <span className="opacity-60 block">القيمة التقديرية</span>
              <span className="font-bold text-emerald-500">{(request.amount || 0).toLocaleString()} ج.م</span>
            </div>
            <div>
              <span className="opacity-60 block">الحالة الحالية</span>
              <span className="font-bold text-amber-500">{request.status}</span>
            </div>
          </div>

          {/* Stepper Progress Visualizer */}
          <div className="relative py-4">
            <h4 className="text-xs font-bold opacity-75 mb-4">مسار الموافقات والاعتمادات الثلاثية:</h4>

            <div className="grid grid-cols-3 gap-3 relative z-10">
              {safeApprovalSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCurrent = currentLevel === stepNum;
                const isCompleted = step.status === 'موافق';
                const isRejected = step.status === 'مرفوض';

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveRole(step.role)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                      isCurrent ? 'ring-2 ring-amber-500 scale-[1.02]' : ''
                    } ${getStepColor(step.status)}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-black/20">
                          مستوى {stepNum}
                        </span>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isRejected && <XCircle className="w-4 h-4 text-red-400" />}
                        {step.status === 'معلق' && <Clock className="w-4 h-4 text-amber-400 animate-pulse" />}
                      </div>

                      <h5 className="font-extrabold text-xs mb-1">{step.role}</h5>
                      <span className="text-[11px] opacity-80 block truncate">{step.approverName}</span>
                    </div>

                    {step.approvedAt && (
                      <span className="text-[10px] opacity-60 block mt-2 border-t border-white/10 pt-1">
                        {step.approvedAt}
                      </span>
                    )}

                    {step.note && (
                      <p className="text-[10px] italic opacity-85 mt-1 bg-black/10 p-1 rounded">
                        "{step.note}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Simulation Selector & Approval Decision Box */}
          <div className={`p-4 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-indigo-950/40 border-indigo-800/40' : 'bg-indigo-50/70 border-indigo-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`text-xs font-bold ${darkMode ? 'text-amber-300' : 'text-indigo-900'}`}>
                محاكاة دور المراجع والاعتماد الحالي:
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                {(['مدير الموقع', 'مدير المشتريات', 'المدير المالي'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRole(r)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      activeRole === r
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : darkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">اسم المعتمد / المسؤول</label>
              <input
                type="text"
                placeholder={`اسم ${activeRole}`}
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">ملاحظات والتوصية الفنية/المالية</label>
              <input
                type="text"
                placeholder="أدخل أي ملاحظات فنية أو تسليمات موقع أو ملاحظات ميزانية..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleDecision('مرفوض')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>رفض الطلب في مستوى ({activeRole})</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('موافق')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>مواصفات معتمدة - اعتماد المستوى ({activeRole})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
