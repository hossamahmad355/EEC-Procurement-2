import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  addMaterialReceipt,
  addPurchaseOrder,
  addAuditLog,
  setToastMessage
} from '../store/procurementSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  X,
  Scan,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Zap,
  Building2,
  DollarSign,
  Calendar,
  Layers,
  Check,
  RotateCcw,
  Maximize2
} from 'lucide-react';

interface ExtractedInvoiceData {
  supplier: string;
  invoiceCode: string;
  poCode: string;
  project: string;
  amount: number;
  date: string;
  itemsCount: number;
  receiver: string;
  materialsList: string;
  confidenceScore: number;
}

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.procurement.darkMode);
  const suppliers = useSelector((state: RootState) => state.procurement.suppliers || []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [actionType, setActionType] = useState<'receipt' | 'order'>('receipt');

  // Editable extracted form fields
  const [supplier, setSupplier] = useState('');
  const [invoiceCode, setInvoiceCode] = useState('');
  const [poCode, setPoCode] = useState('');
  const [project, setProject] = useState('المبنى الإداري');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [materialsList, setMaterialsList] = useState('');

  // Start video stream when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraActive(true);
      } else {
        setCameraError('خاصية الكاميرا غير مدعومة مباشرة في هذا المتصفح. يرجى اختيار رفع صورة الفاتورة.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('لم يتم منح إذن الوصول للكاميرا أو الجهاز لا يحتوي على كاميرا نشطة. يمكنك رفع صورة الفاتورة إلكترونياً.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture current video frame into canvas
  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        runAiScanAnalysis(dataUrl);
      }
    }
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        stopCamera();
        runAiScanAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate Smart AI OCR Document Analysis
  const runAiScanAnalysis = (imgData: string) => {
    setIsScanning(true);
    setExtractedData(null);

    setTimeout(() => {
      // Pick random realistic extracted values
      const randomSupplier = suppliers.length > 0
        ? suppliers[Math.floor(Math.random() * suppliers.length)].name
        : 'شركة النيل للحديد والصلب';
      
      const generatedInvCode = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
      const generatedPoCode = `PR-0${Math.floor(250 + Math.random() * 50)}`;
      const generatedAmount = Math.floor(150000 + Math.random() * 850000);
      const generatedDate = new Date().toISOString().split('T')[0];

      const extracted: ExtractedInvoiceData = {
        supplier: randomSupplier,
        invoiceCode: generatedInvCode,
        poCode: generatedPoCode,
        project: 'المبنى الإداري',
        amount: generatedAmount,
        date: generatedDate,
        itemsCount: Math.floor(3 + Math.random() * 12),
        receiver: 'م. أحمد سعيد (أمين الموقع)',
        materialsList: 'حديد تسليح 16مم، أسياخ صلب عالية الصلابة، خلطة خرسانية جاهزة',
        confidenceScore: 98.4
      };

      setExtractedData(extracted);
      setSupplier(extracted.supplier);
      setInvoiceCode(extracted.invoiceCode);
      setPoCode(extracted.poCode);
      setProject(extracted.project);
      setAmount(extracted.amount);
      setDate(extracted.date);
      setItemsCount(extracted.itemsCount);
      setMaterialsList(extracted.materialsList);

      setIsScanning(false);
    }, 2200);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedData(null);
    startCamera();
  };

  const handleSaveToSystem = (e: React.FormEvent) => {
    e.preventDefault();

    if (actionType === 'receipt') {
      const recCode = `REC-${Math.floor(600 + Math.random() * 300)}`;
      dispatch(
        addMaterialReceipt({
          receiptCode: recCode,
          poCode: poCode || 'PR-0268',
          supplier: supplier || 'شركة النيل للحديد والصلب',
          project: project || 'المبنى الإداري',
          receivedDate: date || new Date().toISOString().split('T')[0],
          itemsCount: itemsCount || 5,
          receiver: 'م. أحمد سعيد (مسح إلكتروني)',
          status: 'مطابق'
        })
      );

      dispatch(
        addAuditLog({
          user: 'الماسح الضوئي الذكي (AI OCR)',
          userRole: 'الماسح الكهرومغناطيسي',
          actionType: 'استلام مواد',
          category: 'المخزون',
          title: `مسح ضوئي إلكتروني لفاتورة/إذن استلام ${recCode}`,
          description: `تم استخراج بيانات الفاتورة ورصيد ${itemsCount} بند بقيمة ${amount.toLocaleString('ar-EG')} ج.م تلقائياً بالكاميرا`,
          details: `المورد: ${supplier} | الكود المستخرج: ${invoiceCode}`,
          status: 'ناجح',
          targetCode: recCode
        })
      );

      dispatch(setToastMessage(`تم حفظ إذن الاستلام الممسوح ضوئياً برقم ${recCode} بنجاح!`));
    } else {
      const poNum = `PR-0${Math.floor(300 + Math.random() * 100)}`;
      dispatch(
        addPurchaseOrder({
          code: poNum,
          supplier: supplier || 'شركة النيل للحديد والصلب',
          project: project || 'المبنى الإداري',
          amount: amount || 250000,
          date: date || new Date().toISOString().split('T')[0],
          status: 'جاري التنفيذ'
        })
      );

      dispatch(
        addAuditLog({
          user: 'الماسح الضوئي الذكي (AI OCR)',
          userRole: 'الماسح الكهرومغناطيسي',
          actionType: 'إصدار أمر',
          category: 'أوامر الشراء',
          title: `تسجيل أمر شراء إلكتروني ممسوح ضوئياً ${poNum}`,
          description: `تسجيل الفاتورة الممسوحة ضوئياً لصالح (${supplier}) بمبلغ ${amount.toLocaleString('ar-EG')} ج.م`,
          details: `كود الفاتورة: ${invoiceCode}`,
          status: 'ناجح',
          targetCode: poNum
        })
      );

      dispatch(setToastMessage(`تم إصدار أمر الشراء الممسوح ضوئياً برقم ${poNum} بنجاح!`));
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl relative overflow-hidden dir-rtl ${
          darkMode ? 'bg-slate-900 border-indigo-900/80 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Modal Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black shadow">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">ماسح الفواتير وإيصالات الشراء بالكاميرا (AI Document Scanner)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OCR Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                توجيه كاميرا المحمول أو الحاسوب نحو الفاتورة الورقية لاستخراج البيانات آلياً
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Camera Live Viewfinder / Upload Dropzone */}
          {!capturedImage ? (
            <div className="space-y-4">
              <div className="relative w-full h-72 rounded-2xl bg-slate-950 border-2 border-dashed border-amber-500/40 overflow-hidden flex flex-col items-center justify-center text-center shadow-inner">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Live Scanner Optical Laser Line Animation */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                    {/* Viewfinder Corners */}
                    <div className="flex justify-between border-t-4 border-l-4 border-amber-400 w-12 h-12 rounded-tl-xl" />
                    <div className="flex justify-between border-t-4 border-r-4 border-amber-400 w-12 h-12 rounded-tr-xl self-end" />
                    
                    {/* Laser Horizontal Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] animate-pulse my-auto" />

                    <div className="flex justify-between border-b-4 border-l-4 border-amber-400 w-12 h-12 rounded-bl-xl" />
                    <div className="flex justify-between border-b-4 border-r-4 border-amber-400 w-12 h-12 rounded-br-xl self-end" />
                  </div>
                )}

                {/* Fallback Display if Camera isn't active or permission pending */}
                {!cameraActive && (
                  <div className="p-6 space-y-3 max-w-md">
                    <Camera className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
                    {cameraError ? (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 font-medium">
                        <AlertCircle className="w-4 h-4 inline-block ml-1" />
                        {cameraError}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300 font-medium">
                        جاري طلب إذن الكاميرا... يرجى السماح بالوصول عند الحصول على التنبيه.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {cameraActive ? (
                  <button
                    onClick={handleCaptureSnapshot}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg hover:from-amber-600 hover:to-amber-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>التقاط صورة الفاتورة فوراً</span>
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة تشغيل الكاميرا</span>
                  </button>
                )}

                {/* Upload File Input Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition border flex items-center gap-2 cursor-pointer ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>رفع صورة من الجهاز</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Step 2: Image Preview & OCR Data Extraction Form */
            <div className="space-y-5">
              {/* Captured Image Preview + Scan Status */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border bg-slate-950 border-indigo-900/60 text-white">
                <div className="relative w-36 h-28 rounded-xl overflow-hidden shrink-0 border border-amber-500/40 shadow">
                  <img src={capturedImage} alt="Scanned Invoice" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-amber-300 font-bold">
                    معاينة اللقطة
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 w-full text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                      نتائج المحرك الاصطناعي لاستخراج البيانات (AI OCR)
                    </span>
                    <button
                      onClick={handleRetake}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة الالتقاط</span>
                    </button>
                  </div>

                  {isScanning ? (
                    <div className="py-3 text-xs text-amber-300 font-bold space-y-1">
                      <p>جاري تحليل نصوص وحقول الفاتورة واستخراج المبالغ...</p>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 animate-pulse w-3/4 rounded-full" />
                      </div>
                    </div>
                  ) : extractedData ? (
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      تم استخراج البيانات بنجاح بدرجة ثقة {extractedData.confidenceScore}%
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Step 3: Extracted Editable Form */}
              {extractedData && (
                <form onSubmit={handleSaveToSystem} className="space-y-4">
                  <div className="flex items-center gap-3 p-1 rounded-xl bg-slate-900/40 border border-slate-700/50 text-xs font-bold">
                    <span className="text-slate-400 px-2 font-bold">إجراء التوثيق بالسيستم:</span>
                    <button
                      type="button"
                      onClick={() => setActionType('receipt')}
                      className={`flex-1 py-1.5 rounded-lg transition font-black ${
                        actionType === 'receipt'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      تسجيل إذن استلام مواد (Receipt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('order')}
                      className={`flex-1 py-1.5 rounded-lg transition font-black ${
                        actionType === 'order'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      تسجيل أمر شراء ساري (Order)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        اسم المورد المكتشف *
                      </label>
                      <input
                        type="text"
                        required
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        رقم الفاتورة المستخرج *
                      </label>
                      <input
                        type="text"
                        required
                        value={invoiceCode}
                        onChange={(e) => setInvoiceCode(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        كود أمر الشراء المرجعي
                      </label>
                      <input
                        type="text"
                        value={poCode}
                        onChange={(e) => setPoCode(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        المشروع الاستثماري
                      </label>
                      <select
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="المبنى الإداري">المبنى الإداري</option>
                        <option value="ورشة المعدات">ورشة المعدات</option>
                        <option value="المرافق العامة">المرافق العامة</option>
                        <option value="مبنى الخدمات">مبنى الخدمات</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        إجمالي القيمة المستخرجة (ج.م) *
                      </label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        تاريخ الفاتورة
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs font-bold mb-1 block ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      المواد والبنود الواردة بالفاتورة
                    </label>
                    <textarea
                      rows={2}
                      value={materialsList}
                      onChange={(e) => setMaterialsList(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/40">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                    >
                      إعادة الالتقاط
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>اعتماد وحفظ البيانات بالسيستم</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
