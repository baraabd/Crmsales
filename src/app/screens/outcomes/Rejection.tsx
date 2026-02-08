import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { Chip } from '../../components/ui/chip';
import { Textarea } from '../../components/ui/textarea';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  User,
  Wifi,
  WifiOff,
  MessageSquare,
  Send,
  AlertTriangle,
  Info,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock rejection reasons from admin
const REJECTION_REASONS = [
  'السعر مرتفع',
  'لديه مزود حالي',
  'غير مهتم حالياً',
  'لا يحتاج الخدمة',
  'ميزانية محدودة',
  'يحتاج وقت للتفكير',
  'لا يتخذ القرار',
  'عدم ثقة بالجودة',
  'توقيت غير مناسب',
];

export function Rejection() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { 
    endVisit, 
    updateAccount, 
    currentVisit, 
    isOnline, 
    accounts,
  } = useApp();
  
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const account = currentVisit
    ? accounts.find((a) => a.id === currentVisit.accountId)
    : null;

  const steps: WizardStep[] = [
    { id: 'reason', label: 'السبب', description: 'اختر سبب الرفض' },
    { id: 'details', label: 'التفاصيل', description: 'ملاحظات إضافية' },
    { id: 'confirm', label: 'التأكيد', description: 'إنهاء الزيارة' },
  ];

  const currentStepId = 
    !selectedReason ? 'reason' :
    !notes ? 'details' :
    'confirm';

  // Auto-save notes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (notes) {
        localStorage.setItem(`rejection-notes-${currentVisit?.id}`, notes);
      }
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [notes, currentVisit]);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setCustomReason('');
  };

  const handleComplete = async () => {
    if (!selectedReason) {
      toast.error('الرجاء اختيار سبب الرفض');
      return;
    }

    if (!notes.trim()) {
      toast.error('الرجاء إضافة ملاحظات توضيحية');
      return;
    }

    if (!account) {
      toast.error('لم يتم العثور على العميل');
      return;
    }

    // Update account
    updateAccount(account.id, {
      lastContactDate: new Date().toISOString(),
      stage: 'lost',
      lostReason: selectedReason || customReason,
    });

    // End visit
    if (currentVisit) {
      endVisit(currentVisit.id, 'rejected', {
        notes: `رفض: ${selectedReason || customReason} - ${notes}`,
        reason: selectedReason || customReason,
      });
    }

    toast.success('تم تسجيل الرفض');
    setShowSuccess(true);
    
    setTimeout(() => {
      navigate('/app/home');
    }, 2000);
  };

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>العميل غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
      {/* Top Bar */}
      <div 
        className="px-4 py-3 flex items-center justify-between shadow-lg relative z-10"
        style={{ background: 'linear-gradient(90deg, #EF4444, #DC2626)' }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowRight className="size-6 text-white" />
          </motion.button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <div className="size-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="size-5 text-white" />
            </div>
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-white font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
          رفض الخدمة
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)' }}>
        <WizardStepper steps={steps} currentStepId={currentStepId} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-32">
        {/* Customer Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="size-12 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--danger-soft)' }}>
            <User className="size-6" style={{ color: 'var(--status-error)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate" style={{ fontSize: 'var(--font-size-base)' }}>
              {account.name}
            </h3>
            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
              {account.contactPerson || 'لا يوجد'}
            </p>
          </div>
        </motion.div>

        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ 
            background: 'var(--warning-soft)',
            border: '1px solid #FDE68A',
          }}
        >
          <AlertTriangle className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-warning)' }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: '#92400E' }}>
              تنبيه مهم
            </p>
            <p className="text-xs" style={{ color: '#92400E' }}>
              تسجيل الرفض سيساعد في تحسين استراتيجيات المبيعات المستقبلية. الرجاء تقديم معلومات دقيقة.
            </p>
          </div>
        </motion.div>

        {/* Rejection Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 shadow-sm space-y-4"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-lg)' }}>
            <XCircle className="size-6" style={{ color: 'var(--status-error)' }} />
            سبب الرفض *
          </h3>
          <div className="flex flex-wrap gap-2">
            {REJECTION_REASONS.map((reason) => (
              <Chip
                key={reason}
                selected={selectedReason === reason}
                onClick={() => handleReasonSelect(reason)}
                size="md"
              >
                {reason}
              </Chip>
            ))}
          </div>
          {selectedReason && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl flex items-center gap-2"
              style={{ 
                background: 'var(--danger-soft)',
                border: '1px solid #FECACA',
              }}
            >
              <CheckCircle className="size-5" style={{ color: 'var(--status-error)' }} />
              <span className="font-semibold text-sm" style={{ color: '#991B1B' }}>
                تم اختيار: {selectedReason}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Custom Reason (Optional) */}
        {selectedReason === 'أخرى' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-3"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            <label htmlFor="customReason" className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-base)' }}>
              <FileText className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
              حدد السبب
            </label>
            <input
              id="customReason"
              type="text"
              placeholder="اكتب السبب..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-4 rounded-xl"
              style={{ 
                height: 'var(--input-height)',
                fontSize: 'var(--font-size-base)',
                border: '1px solid var(--border-main)',
              }}
            />
          </motion.div>
        )}

        {/* Detailed Notes */}
        {selectedReason && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-3"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
              <label htmlFor="notes" className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                ملاحظات تفصيلية *
              </label>
            </div>
            <Textarea
              id="notes"
              placeholder="أضف تفاصيل دقيقة عن الرفض: ما الذي قاله العميل بالضبط؟ هل هناك فرصة للعودة لاحقاً؟"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              className="text-right"
              style={{ 
                minHeight: '150px',
                fontSize: 'var(--font-size-base)',
                borderRadius: 'var(--input-radius)',
                border: !notes.trim() && selectedReason ? '2px solid var(--status-error)' : undefined,
              }}
            />
            {!notes.trim() && selectedReason && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--status-error)' }}>
                <Info className="size-3" />
                الملاحظات التفصيلية مطلوبة لفهم أسباب الرفض
              </p>
            )}
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              يتم حفظ الملاحظات تلقائياً أثناء الكتابة
            </p>
          </motion.div>
        )}

        {/* Best Practices Tips */}
        {selectedReason && notes.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-3"
            style={{ 
              background: 'var(--status-info-light)',
              border: '1px solid #BFDBFE',
            }}
          >
            <div className="flex items-start gap-3">
              <Info className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-info)' }} />
              <div>
                <p className="font-semibold text-sm mb-2" style={{ color: '#1E40AF' }}>
                  نصائح للتعامل مع الرفض
                </p>
                <ul className="space-y-1 text-xs" style={{ color: '#1E40AF' }}>
                  <li>• احترم قرار العميل ولا تضغط عليه</li>
                  <li>• اترك انطباعاً إيجابياً للمستقبل</li>
                  <li>• استفسر بلطف عن إمكانية التواصل لاحقاً</li>
                  <li>• سجل أي معلومات قد تساعد الفريق</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary */}
        {selectedReason && notes.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-md space-y-3"
            style={{ 
              background: 'var(--bg-surface)',
              border: '2px solid var(--status-error)',
            }}
          >
            <h3 className="font-bold pb-3" style={{ 
              fontSize: 'var(--font-size-lg)',
              borderBottom: '1px solid var(--border-light)',
            }}>
              ملخص الرفض
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl" style={{ background: 'var(--danger-soft)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                  السبب
                </p>
                <p className="font-semibold" style={{ 
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--status-error)',
                }}>
                  {selectedReason || customReason}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--neutral-50)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                  الملاحظات
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {notes.length > 80 ? `${notes.substring(0, 80)}...` : notes}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {selectedReason && notes.trim() && (
        <div 
          className="fixed bottom-0 left-0 right-0 p-4" 
          dir="rtl"
          style={{ 
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
            paddingBottom: 'calc(1rem + var(--safe-area-inset-bottom))',
          }}
        >
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleComplete}
              className="w-full font-bold shadow-lg text-white"
              style={{ 
                height: 'var(--button-height-lg)',
                borderRadius: 'var(--button-radius)',
                fontSize: 'var(--font-size-lg)',
                background: 'linear-gradient(90deg, #EF4444, #DC2626)',
              }}
            >
              <Send className="size-6 ml-2" />
              تأكيد الرفض
            </Button>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'var(--bg-overlay)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="rounded-3xl p-8 text-center max-w-sm"
              style={{ background: 'var(--bg-surface)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="size-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--danger-soft)' }}
              >
                <CheckCircle className="size-12" style={{ color: 'var(--status-error)' }} />
              </motion.div>
              <h3 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-2xl)' }}>
                تم تسجيل الرفض
              </h3>
              <p className="mb-4" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                شكراً لتوثيق المعلومات. سيتم استخدامها لتحسين الأداء.
              </p>
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                السبب: {selectedReason || customReason}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}