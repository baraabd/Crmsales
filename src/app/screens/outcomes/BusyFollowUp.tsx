import { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Clock,
  User,
  Wifi,
  WifiOff,
  MessageSquare,
  Send,
  CalendarClock,
  Info,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock follow-up periods from admin
const FOLLOW_UP_PERIODS = [
  { label: 'بعد يوم', days: 1 },
  { label: 'بعد 3 أيام', days: 3 },
  { label: 'بعد أسبوع', days: 7 },
  { label: 'بعد أسبوعين', days: 14 },
  { label: 'بعد شهر', days: 30 },
  { label: 'بعد 3 أشهر', days: 90 },
];

export function BusyFollowUp() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { 
    endVisit, 
    updateAccount, 
    currentVisit, 
    isOnline, 
    accounts,
    addFollowUp,
  } = useApp();
  
  const [selectedPeriod, setSelectedPeriod] = useState<typeof FOLLOW_UP_PERIODS[0] | null>(null);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const account = currentVisit
    ? accounts.find((a) => a.id === currentVisit.accountId)
    : null;

  const steps: WizardStep[] = [
    { id: 'period', label: 'موعد المتابعة', description: 'اختر الفترة' },
    { id: 'pickup', label: 'تاريخ الاستلام', description: 'يتم حسابه تلقائياً' },
    { id: 'notes', label: 'الملاحظات', description: 'تفاصيل إضافية' },
    { id: 'confirm', label: 'التأكيد', description: 'إنهاء الزيارة' },
  ];

  const currentStepId = 
    !selectedPeriod ? 'period' :
    !pickupDate ? 'pickup' :
    !notes ? 'notes' :
    'confirm';

  // Calculate pickup date based on selected period
  useEffect(() => {
    if (selectedPeriod) {
      const date = new Date();
      date.setDate(date.getDate() + selectedPeriod.days);
      setPickupDate(date);
    }
  }, [selectedPeriod]);

  // Auto-save notes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (notes) {
        localStorage.setItem(`busy-notes-${currentVisit?.id}`, notes);
      }
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [notes, currentVisit]);

  const handlePeriodSelect = (period: typeof FOLLOW_UP_PERIODS[0]) => {
    setSelectedPeriod(period);
  };

  const handleComplete = async () => {
    if (!selectedPeriod || !pickupDate || !notes.trim()) {
      toast.error('الرجاء إكمال جميع الحقول');
      return;
    }

    if (!account) {
      toast.error('لم يتم العثور على العميل');
      return;
    }

    // Add follow-up
    const followUp = {
      id: `fu-${Date.now()}`,
      accountId: account.id,
      followUpDate: new Date(Date.now() + selectedPeriod.days * 24 * 60 * 60 * 1000),
      pickupDate: pickupDate,
      notes: notes,
      status: 'pending',
      createdAt: new Date(),
    };

    addFollowUp?.(followUp);

    // Update account
    updateAccount(account.id, {
      lastContactDate: new Date().toISOString(),
      stage: account.stage === 'lead' ? 'qualified' : account.stage,
    });

    // End visit
    if (currentVisit) {
      endVisit(currentVisit.id, 'busy', {
        notes: `متابعة بعد ${selectedPeriod.label} - ${notes}`,
        followUpDate: followUp.followUpDate.toISOString(),
        pickupDate: pickupDate.toISOString(),
        reason: 'مشغول',
      });
    }

    toast.success('تم تسجيل المتابعة بنجاح!');
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
        style={{ background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))' }}
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
          مشغول - متابعة
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
               style={{ background: 'var(--brand-soft)' }}>
            <User className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
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

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ 
            background: 'var(--status-info-light)',
            border: '1px solid #BFDBFE',
          }}
        >
          <Info className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-info)' }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: '#1E40AF' }}>
              العميل مشغول حالياً
            </p>
            <p className="text-xs" style={{ color: '#1E40AF' }}>
              حدد موعد المتابعة المناسب وسيتم تذكيرك تلقائياً
            </p>
          </div>
        </motion.div>

        {/* Follow-up Period Selection */}
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
            <CalendarClock className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
            اختر موعد المتابعة
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {FOLLOW_UP_PERIODS.map((period) => (
              <motion.button
                key={period.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePeriodSelect(period)}
                className="h-16 rounded-xl font-semibold relative flex flex-col items-center justify-center"
                style={{
                  background: selectedPeriod?.label === period.label
                    ? 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))'
                    : 'var(--neutral-50)',
                  color: selectedPeriod?.label === period.label
                    ? 'var(--text-inverse)'
                    : 'var(--text-primary)',
                  border: `1px solid ${selectedPeriod?.label === period.label ? 'transparent' : 'var(--border-light)'}`,
                }}
              >
                <span style={{ fontSize: 'var(--font-size-base)' }}>{period.label}</span>
                <span className="text-xs opacity-70">{period.days} يوم</span>
                {selectedPeriod?.label === period.label && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <CheckCircle className="size-5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Pickup Date Display */}
        {selectedPeriod && pickupDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-3"
            style={{ 
              background: 'linear-gradient(135deg, var(--success-soft), var(--brand-soft))',
              border: '2px solid var(--brand-primary-200)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="size-11 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: 'white' }}>
                <Calendar className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  تاريخ الاستلام المتوقع
                </p>
                <p className="font-bold" style={{ 
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--brand-primary-700)',
                }}>
                  {pickupDate.toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Sparkles className="size-5" style={{ color: 'var(--brand-primary-400)' }} />
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'white' }}>
              <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                تم الحساب تلقائياً بناءً على موعد المتابعة المختار
              </p>
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {pickupDate && (
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
                ملاحظات المتابعة *
              </label>
            </div>
            <Textarea
              id="notes"
              placeholder="أضف تفاصيل مهمة: ما الذي يمنع العميل؟ متى يمكن التواصل معه؟"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              className="text-right"
              style={{ 
                minHeight: '120px',
                fontSize: 'var(--font-size-base)',
                borderRadius: 'var(--input-radius)',
                border: !notes.trim() && selectedPeriod ? '2px solid var(--status-warning)' : undefined,
              }}
            />
            {!notes.trim() && selectedPeriod && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--status-warning)' }}>
                <Info className="size-3" />
                الملاحظات مطلوبة للمتابعة الفعالة
              </p>
            )}
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              يتم حفظ الملاحظات تلقائياً أثناء الكتابة
            </p>
          </motion.div>
        )}

        {/* Summary */}
        {selectedPeriod && pickupDate && notes.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-md space-y-3"
            style={{ 
              background: 'var(--bg-surface)',
              border: '2px solid var(--brand-primary-300)',
            }}
          >
            <h3 className="font-bold pb-3" style={{ 
              fontSize: 'var(--font-size-lg)',
              borderBottom: '1px solid var(--border-light)',
            }}>
              ملخص المتابعة
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  موعد المتابعة
                </span>
                <span className="font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>
                  {selectedPeriod.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  تاريخ الاستلام
                </span>
                <span className="font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>
                  {pickupDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {selectedPeriod && pickupDate && notes.trim() && (
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
                background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
              }}
            >
              <Send className="size-6 ml-2" />
              تأكيد المتابعة
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
                style={{ background: 'var(--success-soft)' }}
              >
                <CheckCircle className="size-12" style={{ color: 'var(--status-success)' }} />
              </motion.div>
              <h3 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-2xl)' }}>
                تم تسجيل المتابعة!
              </h3>
              <p className="mb-4" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                سيتم تذكيرك بموعد المتابعة
              </p>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-tertiary)' }}>
                <p>📅 {pickupDate?.toLocaleDateString('ar-SA')}</p>
                <p>⏰ {selectedPeriod?.label}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}