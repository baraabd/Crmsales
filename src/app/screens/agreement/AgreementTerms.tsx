/**
 * Agreement Terms Screen - Jibble Style
 * Features:
 * - Suggested duration based on cart items
 * - Auto-calculated payment dates
 * - Implementation method with animations
 * - Clean orange design
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { Chip } from '../../components/ui/chip';
import { Textarea } from '../../components/ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  FileText,
  Clock,
  Settings,
  User,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  DollarSign,
  Info,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  label: string;
  content: string;
  durationDays?: number;
}

interface PaymentDate {
  date: string;
  amount: number;
  percentage: number;
  label: string;
}

const DURATION_TEMPLATES: Template[] = [
  { id: '1week', label: 'أسبوع واحد', content: 'مدة تنفيذ الخدمة أسبوع واحد من تاريخ التوقيع على الاتفاقية.', durationDays: 7 },
  { id: '2weeks', label: 'أسبوعين', content: 'مدة تنفيذ الخدمة أسبوعين من تاريخ التوقيع على الاتفاقية.', durationDays: 14 },
  { id: '1month', label: 'شهر واحد', content: 'مدة تنفيذ الخدمة شهر واحد من تاريخ التوقيع على الاتفاقية.', durationDays: 30 },
  { id: '2months', label: 'شهرين', content: 'مدة تنفيذ الخدمة شهرين من تاريخ التوقيع على الاتفاقية.', durationDays: 60 },
  { id: '3months', label: '3 أشهر', content: 'مدة تنفيذ الخدمة ثلاثة أشهر من تاريخ التوقيع على الاتفاقية.', durationDays: 90 },
  { id: '6months', label: '6 أشهر', content: 'مدة تنفيذ الخدمة ستة أشهر من تاريخ التوقيع على الاتفاقية.', durationDays: 180 },
];

const IMPLEMENTATION_TEMPLATES: Template[] = [
  {
    id: 'standard',
    label: 'قياسي',
    content: 'يتم التنفيذ على مراحل:\n1. المرحلة الأولى: التحليل والتخطيط (20%)\n2. المرحلة الثانية: التصميم والتطوير (40%)\n3. المرحلة الثالثة: الاختبار والمراجعة (20%)\n4. المرحلة النهائية: التسليم والتدريب (20%)',
  },
  {
    id: 'agile',
    label: 'مرن (Agile)',
    content: 'يتم التنفيذ بطريقة مرنة:\n- سبرينت أسبوعي مع مراجعة دورية\n- تسليم تدريجي للمكونات الجاهزة\n- إمكانية التعديل حسب الملاحظات\n- اجتماعات متابعة أسبوعية',
  },
  {
    id: 'phased',
    label: 'تدريجي',
    content: 'يتم التنفيذ على مراحل متتابعة:\n- كل مرحلة تستغرق أسبوعين\n- دفعة مالية عند إنهاء كل مرحلة\n- موافقة العميل مطلوبة للانتقال للمرحلة التالية\n- تقرير تقدم شهري',
  },
  {
    id: 'turnkey',
    label: 'مفتاح باليد',
    content: 'تنفيذ متكامل:\n- تسليم المشروع كاملاً في نهاية المدة\n- العميل لا يحتاج لمتابعة تفاصيل التنفيذ\n- تقارير تقدم شهرية\n- التسليم النهائي مع الضمان',
  },
];

const PAYMENT_TEMPLATES: Template[] = [
  {
    id: 'upfront',
    label: 'دفعة مقدمة',
    content: 'الدفع:\n- 50% دفعة مقدمة عند التوقيع\n- 50% عند التسليم النهائي',
  },
  {
    id: 'installments',
    label: 'أقساط',
    content: 'الدفع:\n- 30% عند التوقيع\n- 40% عند منتصف المدة\n- 30% عند التسليم النهائي',
  },
  {
    id: 'milestones',
    label: 'حسب المراحل',
    content: 'الدفع:\n- 25% عند كل مرحلة رئيسية\n- آلية دفع مرنة حسب التقدم\n- فاتورة عند إتمام كل مرحلة',
  },
];

export function AgreementTerms() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, currentVisit, accounts } = useApp();
  
  // Get data from navigation state (passed from Cart)
  const cartData = location.state as {
    cartItems: any[];
    subtotal: number;
    discount: number;
    total: number;
    estimatedDurationDays: number;
    estimatedDuration: string;
  } | null;

  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedImplementation, setSelectedImplementation] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [customNotes, setCustomNotes] = useState('');
  const [showImplementationDetails, setShowImplementationDetails] = useState(false);
  const [paymentDates, setPaymentDates] = useState<PaymentDate[]>([]);

  const customer = currentVisit
    ? accounts.find((a) => a.id === currentVisit.accountId)
    : null;

  // Suggest duration based on cart estimated days
  const suggestedDurations = useMemo(() => {
    if (!cartData?.estimatedDurationDays) return [];
    
    const estimatedDays = cartData.estimatedDurationDays;
    
    // Filter durations that are >= estimated days
    return DURATION_TEMPLATES.filter(t => 
      t.durationDays && t.durationDays >= estimatedDays
    );
  }, [cartData]);

  // Auto-select first suggested duration
  useEffect(() => {
    if (suggestedDurations.length > 0 && !selectedDuration) {
      setSelectedDuration(suggestedDurations[0].id);
    }
  }, [suggestedDurations]);

  // Calculate payment dates automatically
  useEffect(() => {
    if (selectedPayment && cartData) {
      const dates = calculatePaymentDates(selectedPayment, cartData.total);
      setPaymentDates(dates);
    }
  }, [selectedPayment, cartData]);

  const calculatePaymentDates = (paymentId: string, totalAmount: number): PaymentDate[] => {
    const today = new Date();
    const dates: PaymentDate[] = [];

    if (paymentId === 'upfront') {
      // 50% now, 50% at end
      dates.push({
        date: today.toISOString(),
        amount: totalAmount * 0.5,
        percentage: 50,
        label: 'دفعة مقدمة',
      });
      
      const endDate = new Date(today);
      const selectedDur = DURATION_TEMPLATES.find(d => d.id === selectedDuration);
      if (selectedDur?.durationDays) {
        endDate.setDate(endDate.getDate() + selectedDur.durationDays);
      }
      
      dates.push({
        date: endDate.toISOString(),
        amount: totalAmount * 0.5,
        percentage: 50,
        label: 'عند التسليم',
      });
    } else if (paymentId === 'installments') {
      // 30%, 40%, 30%
      dates.push({
        date: today.toISOString(),
        amount: totalAmount * 0.3,
        percentage: 30,
        label: 'دفعة مقدمة',
      });
      
      const midDate = new Date(today);
      const selectedDur = DURATION_TEMPLATES.find(d => d.id === selectedDuration);
      if (selectedDur?.durationDays) {
        midDate.setDate(midDate.getDate() + Math.floor(selectedDur.durationDays / 2));
      }
      
      dates.push({
        date: midDate.toISOString(),
        amount: totalAmount * 0.4,
        percentage: 40,
        label: 'منتصف المدة',
      });
      
      const endDate = new Date(today);
      if (selectedDur?.durationDays) {
        endDate.setDate(endDate.getDate() + selectedDur.durationDays);
      }
      
      dates.push({
        date: endDate.toISOString(),
        amount: totalAmount * 0.3,
        percentage: 30,
        label: 'عند التسليم',
      });
    } else if (paymentId === 'milestones') {
      // 4 payments of 25% each
      const selectedDur = DURATION_TEMPLATES.find(d => d.id === selectedDuration);
      const daysBetween = selectedDur?.durationDays ? Math.floor(selectedDur.durationDays / 4) : 7;
      
      for (let i = 0; i < 4; i++) {
        const milestoneDate = new Date(today);
        milestoneDate.setDate(milestoneDate.getDate() + (daysBetween * i));
        
        dates.push({
          date: milestoneDate.toISOString(),
          amount: totalAmount * 0.25,
          percentage: 25,
          label: `المرحلة ${i + 1}`,
        });
      }
    }

    return dates;
  };

  const getDurationContent = () => {
    const template = DURATION_TEMPLATES.find(t => t.id === selectedDuration);
    return template?.content || '';
  };

  const getImplementationContent = () => {
    const template = IMPLEMENTATION_TEMPLATES.find(t => t.id === selectedImplementation);
    return template?.content || '';
  };

  const getPaymentContent = () => {
    const template = PAYMENT_TEMPLATES.find(t => t.id === selectedPayment);
    return template?.content || '';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const isComplete = selectedDuration && selectedImplementation && selectedPayment;

  const steps: WizardStep[] = [
    { id: 'services', label: 'اختيار الخدمات', description: 'تصفح الكاتالوج' },
    { id: 'cart', label: 'السلة', description: 'مراجعة الطلب' },
    { id: 'agreement', label: 'الاتفاقية', description: 'الشروط والأحكام' },
    { id: 'signature', label: 'التوقيع', description: 'إتمام العقد' },
  ];

  const handleContinue = () => {
    if (!isComplete) {
      toast.error('يرجى اختيار جميع الشروط المطلوبة');
      return;
    }

    if (!currentVisit || !customer) {
      toast.error('لا يوجد عميل محدد!');
      return;
    }

    // Navigate to signature with all data
    navigate(`/dropin/signature/${visitId}`, {
      state: {
        ...cartData,
        selectedDuration,
        selectedImplementation,
        selectedPayment,
        customNotes,
        paymentDates,
        durationContent: getDurationContent(),
        implementationContent: getImplementationContent(),
        paymentContent: getPaymentContent(),
        customer,
      },
    });
  };

  if (!cartData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
        <div className="text-center p-8">
          <AlertCircle className="size-16 mx-auto mb-4" style={{ color: 'var(--brand-primary-500)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>لا توجد بيانات للسلة</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>يرجى العودة وإضافة خدمات أولاً</p>
          <Button onClick={() => navigate(`/dropin/services/${visitId}`)}>
            العودة للكاتالوج
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between shadow-sm" 
           style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl transition-colors"
            style={{ background: 'transparent' }}
          >
            <ArrowRight className="size-6" style={{ color: 'var(--text-primary)' }} />
          </motion.button>
          <div className="size-8 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-soft)' }}>
            <User className="size-4" style={{ color: 'var(--brand-primary-500)' }} />
          </div>
        </div>
        
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>شروط الاتفاقية</h1>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="size-5" style={{ color: 'var(--status-success)' }} />
          ) : (
            <WifiOff className="size-5" style={{ color: 'var(--status-error)' }} />
          )}
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)' }}>
        <WizardStepper steps={steps} currentStepId="agreement" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Smart Duration Suggestion */}
        {suggestedDurations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl flex items-start gap-3"
            style={{ background: 'var(--info-soft)', border: '1px solid var(--brand-blue-200)' }}
          >
            <Sparkles className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-blue-500)' }} />
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--brand-blue-600)' }}>
                اقتراح ذكي للمدة
              </p>
              <p className="text-sm" style={{ color: 'var(--brand-blue-600)' }}>
                بناءً على الخدمات المختارة ({cartData.cartItems.length} خدمات)
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--brand-blue-500)' }}>
                المدة المقترحة: <strong>{suggestedDurations[0].label}</strong>
              </p>
            </div>
          </motion.div>
        )}

        {/* Duration Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 shadow-sm space-y-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-soft)' }}>
              <Clock className="size-5" style={{ color: 'var(--brand-primary-500)' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>المدة</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>اختر مدة تنفيذ المشروع</p>
            </div>
            {suggestedDurations.length > 0 && selectedDuration === suggestedDurations[0].id && (
              <div className="px-2 py-1 rounded-full text-xs font-semibold"
                   style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary-500)' }}>
                مقترح
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(suggestedDurations.length > 0 ? suggestedDurations : DURATION_TEMPLATES).map(template => (
              <Chip
                key={template.id}
                selected={selectedDuration === template.id}
                onClick={() => setSelectedDuration(template.id)}
                size="md"
              >
                {template.label}
              </Chip>
            ))}
          </div>

          <AnimatePresence>
            {selectedDuration && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl"
                style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand-primary-300)' }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-primary-700)' }}>
                  {getDurationContent()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Implementation Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 shadow-sm space-y-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--info-soft)' }}>
              <Settings className="size-5" style={{ color: 'var(--brand-blue-500)' }} />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>آلية التنفيذ</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>كيف سيتم تنفيذ المشروع</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {IMPLEMENTATION_TEMPLATES.map(template => (
              <Chip
                key={template.id}
                selected={selectedImplementation === template.id}
                onClick={() => {
                  setSelectedImplementation(template.id);
                  setShowImplementationDetails(true);
                }}
                size="md"
              >
                {template.label}
              </Chip>
            ))}
          </div>

          <AnimatePresence>
            {selectedImplementation && showImplementationDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-xl" style={{ background: 'var(--info-soft)', border: '1px solid var(--brand-blue-200)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="size-4" style={{ color: 'var(--brand-blue-500)' }} />
                    <p className="text-xs font-semibold" style={{ color: 'var(--brand-blue-600)' }}>تفاصيل التنفيذ:</p>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--brand-blue-600)' }}>
                    {getImplementationContent()}
                  </p>
                </div>
                
                {/* Animation placeholder */}
                <div className="p-6 rounded-xl flex items-center justify-center"
                     style={{ 
                       background: 'linear-gradient(135deg, var(--info-soft), var(--brand-blue-100))',
                       border: '1px solid var(--brand-blue-200)' 
                     }}>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                    className="text-center"
                  >
                    <Settings className="size-12 mx-auto mb-2" style={{ color: 'var(--brand-blue-500)' }} />
                    <p className="text-xs" style={{ color: 'var(--brand-blue-600)' }}>عملية التنفيذ</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 shadow-sm space-y-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--success-soft)' }}>
              <DollarSign className="size-5" style={{ color: 'var(--status-success)' }} />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>شروط الدفع</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>اختر آلية الدفع المناسبة</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PAYMENT_TEMPLATES.map(template => (
              <Chip
                key={template.id}
                selected={selectedPayment === template.id}
                onClick={() => setSelectedPayment(template.id)}
                size="md"
              >
                {template.label}
              </Chip>
            ))}
          </div>

          <AnimatePresence>
            {selectedPayment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-xl" style={{ background: 'var(--success-soft)', border: '1px solid var(--status-success)' }}>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--status-success)' }}>
                    {getPaymentContent()}
                  </p>
                </div>

                {/* Payment Dates */}
                {paymentDates.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="size-4" style={{ color: 'var(--brand-primary-500)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>جدول الدفعات:</p>
                    </div>
                    <div className="space-y-2">
                      {paymentDates.map((payment, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl" 
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{payment.label}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(payment.date)}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold" style={{ color: 'var(--brand-primary-500)' }}>
                              {payment.amount.toLocaleString()} ر.س
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{payment.percentage}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Custom Notes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 shadow-sm space-y-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3">
            <FileText className="size-5" style={{ color: 'var(--brand-primary-500)' }} />
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>ملاحظات إضافية (اختياري)</h3>
          </div>
          <Textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="أي ملاحظات أو شروط إضافية..."
            className="min-h-[120px] rounded-xl"
          />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            يتم حفظ الملاحظات تلقائياً أثناء الكتابة
          </p>
        </motion.div>

        {/* Status Banner */}
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'var(--success-soft)', border: '1px solid var(--status-success)' }}
            >
              <CheckCircle className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-success)' }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--status-success)' }}>جاهز للمتابعة!</p>
                <p className="text-xs mt-1" style={{ color: 'var(--status-success)' }}>تم اختيار جميع الشروط المطلوبة</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="incomplete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'var(--warning-soft)', border: '1px solid var(--status-warning)' }}
            >
              <AlertCircle className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-warning)' }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--status-warning)' }}>يرجى اختيار جميع الشروط</p>
                <p className="text-xs mt-1" style={{ color: 'var(--status-warning)' }}>المدة، آلية التنفيذ، وشروط الدفع مطلوبة</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 shadow-lg" 
           style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }} dir="rtl">
        <Button
          onClick={handleContinue}
          disabled={!isComplete}
          className="w-full"
          size="lg"
        >
          المتابعة للتوقيع
        </Button>
      </div>
    </div>
  );
}