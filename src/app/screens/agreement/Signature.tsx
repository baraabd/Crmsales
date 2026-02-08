/**
 * Digital Signature Screen - Jibble Style
 * Features:
 * - Interactive canvas for digital signature
 * - PDF preview of agreement
 * - Wizard steps integration
 * - Touch and mouse support
 * - 100% Design Tokens
 */

import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CheckCircle,
  Trash2,
  FileText,
  PenTool,
  Download,
  Eye,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const wizardSteps: WizardStep[] = [
  { id: 'services', label: 'إضافة الخدمات', status: 'completed' },
  { id: 'terms', label: 'شروط الاتفاقية', status: 'completed' },
  { id: 'signature', label: 'التوقيع الرقمي', status: 'active' },
];

export function Signature() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { endVisit, updateAccount, currentVisit } = useApp();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.strokeStyle = 'var(--brand-primary-600)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    // Save signature as base64
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      setSignatureData(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureData('');
    toast.success('تم مسح التوقيع');
  };

  const handleConfirm = () => {
    if (!hasSignature) {
      toast.error('يجب التوقيع أولاً ✍️');
      return;
    }

    if (!agreed) {
      toast.error('يجب الموافقة على الشروط');
      return;
    }

    // Save agreement with signature
    if (currentVisit) {
      endVisit(currentVisit.id, 'deal', 'صفقة مكتملة مع اتفاقية موقعة');
      updateAccount(currentVisit.accountId, {
        lifecycle: 'customer',
        pinColor: 'green',
      });
      
      // Save signature to localStorage (mock)
      localStorage.setItem(`agreement-${currentVisit.accountId}-signature`, signatureData);
      localStorage.setItem(`agreement-${currentVisit.accountId}-date`, new Date().toISOString());
    }

    toast.success('تم حفظ التوقيع بنجاح! 🎉');
    setShowSuccess(true);
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-[24px] p-8 text-center"
          style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="size-24 mx-auto mb-6 rounded-full flex items-center justify-center relative"
            style={{ background: 'var(--success-soft)' }}
          >
            <CheckCircle className="size-14" style={{ color: 'var(--status-success)' }} />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="size-8" style={{ color: 'var(--brand-primary-500)' }} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            تم حفظ الاتفاقية بنجاح!
          </motion.h2>

          {/* Agreement Number */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              رقم الاتفاقية
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--brand-primary-600)' }}>
              #{Date.now().toString().slice(-8)}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
              {new Date().toLocaleString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </motion.div>

          {/* Signature Preview */}
          {signatureData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 p-4 rounded-[16px]"
              style={{ background: 'var(--neutral-50)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                التوقيع الرقمي
              </p>
              <img src={signatureData} alt="Signature" className="max-h-16 mx-auto" />
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/home')}
              className="w-full h-[52px] rounded-[18px] text-white font-semibold shadow-sm flex items-center justify-center gap-2"
              style={{ background: 'var(--button-primary-bg)' }}
            >
              <CheckCircle className="size-5" />
              <span>العودة للرئيسية</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Download PDF logic here
                toast.success('سيتم تحميل نسخة PDF قريباً');
              }}
              className="w-full h-[48px] rounded-[16px] font-semibold flex items-center justify-center gap-2"
              style={{ background: 'var(--neutral-50)', color: 'var(--text-primary)' }}
            >
              <Download className="size-5" />
              <span>تحميل نسخة PDF</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // PDF Preview Modal
  const PDFPreviewModal = () => (
    <AnimatePresence>
      {showPdfPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={() => setShowPdfPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] rounded-[24px] overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3">
                <FileText className="size-6" style={{ color: 'var(--brand-primary-500)' }} />
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  معاينة الاتفاقية
                </h3>
              </div>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="size-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--neutral-50)', color: 'var(--text-secondary)' }}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* PDF Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="rounded-[16px] p-6" style={{ background: 'var(--neutral-50)' }}>
                {/* Mock PDF Content */}
                <div className="space-y-4" style={{ color: 'var(--text-primary)' }}>
                  <h2 className="text-xl font-bold text-center mb-6">اتفاقية تقديم الخدمات</h2>
                  
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed">
                      <strong>الطرف الأول:</strong> الشركة المزودة للخدمة
                    </p>
                    <p className="text-sm leading-relaxed">
                      <strong>الطرف الثاني:</strong> العميل
                    </p>
                  </div>

                  <div className="my-6 h-px" style={{ background: 'var(--border-light)' }}></div>

                  <div className="space-y-4">
                    <h3 className="font-bold">البنود والشروط:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <li>تلتزم الشركة بتقديم الخدمات المتفق عليها وفقاً للمعايير المهنية.</li>
                      <li>يلتزم العميل بسداد المبالغ المستحقة في المواعيد المحددة.</li>
                      <li>مدة الاتفاقية تبدأ من تاريخ التوقيع وتستمر حسب المدة المتفق عليها.</li>
                      <li>يحق لأي من الطرفين إنهاء الاتفاقية بإشعار مسبق مدته 30 يوماً.</li>
                      <li>جميع البيانات والمعلومات المتبادلة تعتبر سرية ولا يجوز إفشاؤها.</li>
                    </ol>
                  </div>

                  <div className="my-6 h-px" style={{ background: 'var(--border-light)' }}></div>

                  <div className="space-y-4">
                    <h3 className="font-bold">شروط الدفع:</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      يتم الدفع وفقاً للجدول الزمني المتفق عليه في شروط الاتفاقية.
                    </p>
                  </div>

                  <div className="my-6 h-px" style={{ background: 'var(--border-light)' }}></div>

                  <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                    تم إنشاء هذه الاتفاقية في {new Date().toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Main Screen
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
      {/* Top Bar */}
      <div
        className="px-4 py-3 flex items-center justify-between shadow-lg relative z-10"
        style={{ background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="size-10 rounded-full flex items-center justify-center transition-colors bg-white/10 hover:bg-white/20"
        >
          <ArrowRight className="size-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">التوقيع الرقمي</h1>
        <div className="size-10" />
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)' }}>
        <WizardStepper steps={wizardSteps} currentStepId="signature" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Preview Agreement Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPdfPreview(true)}
          className="w-full p-4 rounded-[18px] flex items-center justify-between shadow-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-soft)' }}>
              <FileText className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
            </div>
            <div className="text-right">
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>معاينة الاتفاقية</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>اضغط لعرض تفاصيل الاتفاقية</p>
            </div>
          </div>
          <Eye className="size-5" style={{ color: 'var(--text-tertiary)' }} />
        </motion.button>

        {/* Signature Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[18px] p-5 shadow-sm"
          style={{ background: 'var(--bg-surface)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-soft)' }}>
                <PenTool className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>التوقيع الرقمي</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>وقّع بإصبعك أو الماوس</p>
              </div>
            </div>
            {hasSignature && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearSignature}
                className="size-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--status-error-light)', color: 'var(--status-error)' }}
              >
                <Trash2 className="size-4" />
              </motion.button>
            )}
          </div>

          {/* Canvas */}
          <div className="relative mb-4">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-48 rounded-[14px] cursor-crosshair touch-none"
              style={{
                background: 'var(--neutral-50)',
                border: `2px dashed ${hasSignature ? 'var(--brand-primary-500)' : 'var(--border-main)'}`,
              }}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <PenTool className="size-8 mb-2 opacity-30" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm opacity-50" style={{ color: 'var(--text-tertiary)' }}>
                  وقّع هنا
                </p>
              </div>
            )}
          </div>

          {/* Signature Info */}
          {hasSignature && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-[12px] flex items-start gap-2"
              style={{ background: 'var(--success-soft)' }}
            >
              <CheckCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--status-success)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--status-success)' }}>
                  تم التوقيع بنجاح
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  يمكنك المسح وإعادة التوقيع إذا أردت
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Agreement Checkbox */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[18px] p-5 shadow-sm"
          style={{ background: 'var(--bg-surface)' }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 size-5 rounded accent-[var(--brand-primary-500)] cursor-pointer"
            />
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                أوافق على جميع الشروط والأحكام
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                لقد قرأت ووافقت على جميع البنود المذكورة في الاتفاقية أعلاه
              </p>
            </div>
          </label>
        </motion.div>

        {/* Warning if not completed */}
        {(!hasSignature || !agreed) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[16px] p-4 flex items-start gap-3"
            style={{ background: 'var(--warning-soft)', border: '1px solid var(--status-warning)' }}
          >
            <AlertCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--status-warning)' }} />
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--status-warning)' }}>
                يجب إكمال المتطلبات
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {!hasSignature && <li>• التوقيع على الاتفاقية</li>}
                {!agreed && <li>• الموافقة على الشروط والأحكام</li>}
              </ul>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
        <motion.button
          whileTap={hasSignature && agreed ? { scale: 0.98 } : {}}
          onClick={handleConfirm}
          disabled={!hasSignature || !agreed}
          className="w-full h-[52px] rounded-[18px] text-white font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: hasSignature && agreed ? 'var(--button-primary-bg)' : 'var(--interactive-disabled)',
            color: hasSignature && agreed ? 'var(--text-inverse)' : 'var(--text-disabled)',
          }}
        >
          <CheckCircle className="size-5" />
          <span>تأكيد وحفظ الاتفاقية</span>
        </motion.button>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal />
    </div>
  );
}
