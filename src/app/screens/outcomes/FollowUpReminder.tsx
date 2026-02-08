/**
 * Follow Up Reminder Screen - Jibble Style
 * Features:
 * - Chips for follow-up period selection
 * - Auto-calculated dates
 * - Chips for priority
 * - Top Bar with gradient
 * - 100% Design Tokens
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Chip } from '../../components/ui/chip';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle, Calendar, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';

type FollowUpPeriod = 'week' | 'month' | '3months';
type Priority = 'high' | 'medium' | 'low';

interface PeriodOption {
  id: FollowUpPeriod;
  label: string;
  days: number;
}

interface PriorityOption {
  id: Priority;
  label: string;
  icon: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { id: 'week', label: 'أسبوع', days: 7 },
  { id: 'month', label: 'شهر', days: 30 },
  { id: '3months', label: '3 أشهر', days: 90 },
];

const PRIORITY_OPTIONS: PriorityOption[] = [
  { id: 'low', label: 'منخفضة', icon: '🟢' },
  { id: 'medium', label: 'متوسطة', icon: '🟡' },
  { id: 'high', label: 'عالية', icon: '🔴' },
];

export function FollowUpReminder() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { endVisit, updateAccount, currentVisit } = useApp();
  
  const [selectedPeriod, setSelectedPeriod] = useState<FollowUpPeriod | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-calculate follow-up date
  const calculatedDate = useMemo(() => {
    if (!selectedPeriod) return null;
    
    const period = PERIOD_OPTIONS.find(p => p.id === selectedPeriod);
    if (!period) return null;
    
    const date = new Date();
    date.setDate(date.getDate() + period.days);
    return date;
  }, [selectedPeriod]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = () => {
    if (!selectedPeriod || !calculatedDate) {
      toast.error('اختر موعد المتابعة أولاً ⏰');
      return;
    }

    if (currentVisit) {
      const followUpDateStr = calculatedDate.toISOString();
      endVisit(currentVisit.id, 'busy', `متابعة في ${PERIOD_OPTIONS.find(p => p.id === selectedPeriod)?.label}`);
      updateAccount(currentVisit.accountId, {
        pinColor: 'yellow',
        nextAction: {
          type: 'followUp',
          datetime: followUpDateStr,
          notes: `أولوية: ${PRIORITY_OPTIONS.find(p => p.id === selectedPriority)?.label}`,
        },
      });
    }

    toast.success('تم حفظ المتابعة بنجاح! ✅');
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
            style={{ background: 'var(--warning-soft)' }}
          >
            <CheckCircle className="size-14" style={{ color: 'var(--status-warning)' }} />
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
            تم حفظ المتابعة بنجاح!
          </motion.h2>

          {/* Date Info */}
          {calculatedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 p-4 rounded-[16px]"
              style={{ background: 'var(--warning-soft)' }}
            >
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>موعد المتابعة</p>
              <p className="text-lg font-bold" style={{ color: 'var(--status-warning)' }}>
                {formatDate(calculatedDate)}
              </p>
            </motion.div>
          )}

          {/* Action */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/app/home')}
            className="w-full h-[52px] rounded-[18px] text-white font-semibold shadow-sm flex items-center justify-center gap-2"
            style={{ background: 'var(--button-primary-bg)' }}
          >
            <CheckCircle className="size-5" />
            <span>العودة للرئيسية</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
        <h1 className="text-lg font-bold text-white">تذكير متابعة</h1>
        <div className="size-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Period Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[18px] p-5 shadow-sm"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-soft)' }}>
              <Calendar className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>اختر موعد المتابعة</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>متى تريد المتابعة مع هذا العميل؟</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {PERIOD_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                selected={selectedPeriod === option.id}
                onClick={() => setSelectedPeriod(option.id)}
                size="lg"
              >
                {option.label}
              </Chip>
            ))}
          </div>

          {/* Calculated Date Display */}
          <AnimatePresence>
            {selectedPeriod && calculatedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-[14px] flex items-start gap-3"
                style={{ background: 'var(--info-soft)', border: '1px solid var(--brand-blue-200)' }}
              >
                <Clock className="size-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-blue-500)' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--brand-blue-600)' }}>
                    التاريخ المحسوب
                  </p>
                  <p className="text-sm" style={{ color: 'var(--brand-blue-600)' }}>
                    {formatDate(calculatedDate)}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Priority Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[18px] p-5 shadow-sm"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--warning-soft)' }}>
              <AlertCircle className="size-5" style={{ color: 'var(--status-warning)' }} />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>الأولوية</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>ما مدى أهمية هذه المتابعة؟</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {PRIORITY_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                selected={selectedPriority === option.id}
                onClick={() => setSelectedPriority(option.id)}
                size="lg"
              >
                <span className="text-base">{option.icon}</span>
                <span>{option.label}</span>
              </Chip>
            ))}
          </div>
        </motion.div>

        {/* Warning if not selected */}
        {!selectedPeriod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[16px] p-4 flex items-start gap-3"
            style={{ background: 'var(--warning-soft)', border: '1px solid var(--status-warning)' }}
          >
            <AlertCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--status-warning)' }} />
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--status-warning)' }}>
                يجب اختيار موعد المتابعة
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                اختر الفترة المناسبة من الأعلى
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
        <motion.button
          whileTap={selectedPeriod ? { scale: 0.98 } : {}}
          onClick={handleConfirm}
          disabled={!selectedPeriod}
          className="w-full h-[52px] rounded-[18px] text-white font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: selectedPeriod ? 'var(--button-primary-bg)' : 'var(--interactive-disabled)',
            color: selectedPeriod ? 'var(--text-inverse)' : 'var(--text-disabled)',
          }}
        >
          <CheckCircle className="size-5" />
          <span>حفظ المتابعة</span>
        </motion.button>
      </div>
    </div>
  );
}
