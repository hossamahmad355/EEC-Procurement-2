import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setToastMessage } from '../store/procurementSlice';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const dispatch = useDispatch();
  const message = useSelector((state: RootState) => state.procurement.toastMessage);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        dispatch(setToastMessage(null));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 animate-slideUp">
      <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" />
      <div className="text-sm font-bold">{message}</div>
      <button
        onClick={() => dispatch(setToastMessage(null))}
        className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-200 hover:text-white transition ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
