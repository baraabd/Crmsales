/**
 * Visit Outcome Screen - شاشة نتائج الزيارة
 * 5 Outcomes فقط مع التوجيه الإلزامي
 * Hybrid Pipeline Implementation
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useSync } from '../../contexts/SyncContext';
import { Button, Card, Text, Badge } from '../../../design-system';
import { StatusBar } from '../../../design-system/components/feedback/StatusBar';
import { cn } from '../../../design-system/utils';

// Outcome Types - 5 فقط حسب المواصفات
type OutcomeType = 'no_contact' | 'interested' | 'not_interested' | 'wrong_info' | 'sold';

interface OutcomeOption {
  id: OutcomeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  requiresNextStep: boolean;
  requiresReason: boolean;
  requiresCorrection: boolean;
  requiresOrder: boolean;
}

const outcomes: OutcomeOption[] = [
  {
    id: 'no_contact',
    label: 'لا يوجد تواصل',
    description: 'العميل غير متاح حالياً',
    icon: '📞',
    color: 'var(--neutral-600)',
    bgColor: 'var(--neutral-100)',
    requiresNextStep: true,
    requiresReason: false,
    requiresCorrection: false,
    requiresOrder: false,
  },
  {
    id: 'interested',
    label: 'مهتم',
    description: 'العميل أبدى اهتماماً',
    icon: '🤔',
    color: 'var(--status-info)',
    bgColor: 'var(--status-info-light)',
    requiresNextStep: true,
    requiresReason: false,
    requiresCorrection: false,
    requiresOrder: false,
  },
  {
    id: 'not_interested',
    label: 'غير مهتم',
    description: 'العميل رفض العرض',
    icon: '👎',
    color: 'var(--status-warning)',
    bgColor: 'var(--status-warning-light)',
    requiresNextStep: false,
    requiresReason: true,
    requiresCorrection: false,
    requiresOrder: false,
  },
  {
    id: 'wrong_info',
    label: 'معلومات خاطئة',
    description: 'بيانات العميل غير صحيحة',
    icon: '❌',
    color: 'var(--status-error)',
    bgColor: 'var(--status-error-light)',
    requiresNextStep: false,
    requiresReason: false,
    requiresCorrection: true,
    requiresOrder: false,
  },
  {
    id: 'sold',
    label: 'تم البيع!',
    description: 'العميل وافق واشترى',
    icon: '💰',
    color: 'var(--status-success)',
    bgColor: 'var(--status-success-light)',
    requiresNextStep: false,
    requiresReason: false,
    requiresCorrection: false,
    requiresOrder: true,
  },
];

const rejectionReasons = [
  'السعر مرتفع',
  'لديه مورد حالي',
  'لا يحتاج الخدمة حالياً',
  'يريد التفكير أكثر',
  'ميزانية غير كافية',
  'سبب آخر...',
];

export default function VisitOutcome() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { connectionStatus, lastSyncTime, outboxCount, conflictCount, addToOutbox } = useSync();

  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [customReason, setCustomReason] = useState('');

  const selectedOption = outcomes.find(o => o.id === selectedOutcome);

  const handleSaveAndContinue = () => {
    if (!selectedOutcome) {
      alert('الرجاء اختيار نتيجة الزيارة');
      return;
    }

    // التحقق من الحقول المطلوبة
    if (selectedOption?.requiresReason && !rejectionReason) {
      alert('الرجاء اختيار سبب الرفض');
      return;
    }

    if (selectedOption?.requiresCorrection && !correctionNotes) {
      alert('الرجاء إدخال المعلومات الصحيحة');
      return;
    }

    // حفظ النتيجة
    const outcomeData = {
      visitId,
      outcome: selectedOutcome,
      rejectionReason: rejectionReason || null,
      correctionNotes: correctionNotes || null,
      timestamp: new Date()
    };

    addToOutbox({
      type: 'visit',
      operation: 'update',
      data: outcomeData,
      maxAttempts: 5
    });

    // التوجيه حسب النتيجة
    if (selectedOption?.requiresNextStep) {
      // الانتقال لشاشة الخطوة التالية
      navigate(`/visit/next-step/${visitId}`, {
        state: { outcome: selectedOutcome }
      });
    } else if (selectedOption?.requiresOrder) {
      // الانتقال لشاشة الطلب/الصفقة
      navigate(`/visit/deal/${visitId}`);
    } else {
      // إنهاء الزيارة والعودة
      navigate('/app/home', {
        state: { message: 'تم حفظ نتيجة الزيارة بنجاح' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]" dir="rtl">
      {/* Status Bar */}
      <StatusBar
        connectionStatus={connectionStatus}
        lastSyncTime={lastSyncTime}
        outboxCount={outboxCount}
        conflictCount={conflictCount}
        onStatusClick={() => navigate('/app/sync-status')}
      />

      {/* Header */}
      <div className="bg-white border-b border-[var(--border-light)] px-5 py-4 sticky top-12 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-[var(--interactive-hover)] flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1">
            <Text variant="h3" className="font-bold">اختر نتيجة الزيارة</Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              إلزامي - يجب اختيار نتيجة واحدة
            </Text>
          </div>
          <Badge variant="warning">مطلوب</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 pb-32">
        {/* Outcome Options */}
        <div className="space-y-3 mb-6">
          <Text variant="body" className="text-[var(--text-secondary)] mb-4">
            ما هي نتيجة هذه الزيارة؟
          </Text>

          {outcomes.map((outcome, index) => (
            <motion.div
              key={outcome.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => setSelectedOutcome(outcome.id)}
                className={cn(
                  'w-full text-right transition-all',
                  selectedOutcome === outcome.id && 'scale-[1.02]'
                )}
              >
                <Card
                  className={cn(
                    'transition-all',
                    selectedOutcome === outcome.id
                      ? 'ring-2 shadow-lg'
                      : 'hover:shadow-md'
                  )}
                  style={{
                    ringColor: selectedOutcome === outcome.id ? outcome.color : undefined
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: outcome.bgColor }}
                    >
                      {outcome.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Text variant="body" className="font-bold mb-1">
                        {outcome.label}
                      </Text>
                      <Text variant="caption" className="text-[var(--text-secondary)]">
                        {outcome.description}
                      </Text>

                      {/* Required Actions */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {outcome.requiresNextStep && (
                          <Badge variant="info" size="sm">يتطلب خطوة تالية</Badge>
                        )}
                        {outcome.requiresReason && (
                          <Badge variant="warning" size="sm">يتطلب سبب</Badge>
                        )}
                        {outcome.requiresCorrection && (
                          <Badge variant="error" size="sm">يتطلب تصحيح</Badge>
                        )}
                        {outcome.requiresOrder && (
                          <Badge variant="success" size="sm">يتطلب طلب</Badge>
                        )}
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                        selectedOutcome === outcome.id
                          ? 'border-transparent scale-110'
                          : 'border-[var(--border-main)]'
                      )}
                      style={{
                        backgroundColor: selectedOutcome === outcome.id ? outcome.color : 'transparent'
                      }}
                    >
                      {selectedOutcome === outcome.id && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Fields Based on Selection */}
        <AnimatePresence mode="wait">
          {selectedOption?.requiresReason && (
            <motion.div
              key="rejection-reason"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="bg-[var(--status-warning-light)] border-2 border-[var(--status-warning)]">
                <Text variant="h4" className="font-bold mb-4">
                  سبب الرفض (مطلوب)
                </Text>

                <div className="space-y-2">
                  {rejectionReasons.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => {
                        if (reason.includes('آخر')) {
                          setRejectionReason('');
                        } else {
                          setRejectionReason(reason);
                          setCustomReason('');
                        }
                      }}
                      className={cn(
                        'w-full text-right px-4 py-3 rounded-lg border-2 transition-all',
                        rejectionReason === reason || (reason.includes('آخر') && rejectionReason === '')
                          ? 'border-[var(--status-warning)] bg-white'
                          : 'border-[var(--border-light)] bg-white hover:border-[var(--border-main)]'
                      )}
                    >
                      <Text variant="body">{reason}</Text>
                    </button>
                  ))}

                  {rejectionReason === '' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <input
                        type="text"
                        value={customReason}
                        onChange={(e) => {
                          setCustomReason(e.target.value);
                          setRejectionReason(e.target.value);
                        }}
                        placeholder="اكتب السبب..."
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border-2',
                          'border-[var(--status-warning)] bg-white',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--status-warning)]'
                        )}
                        dir="rtl"
                      />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {selectedOption?.requiresCorrection && (
            <motion.div
              key="correction-notes"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="bg-[var(--status-error-light)] border-2 border-[var(--status-error)]">
                <Text variant="h4" className="font-bold mb-4">
                  المعلومات الصحيحة (مطلوب)
                </Text>

                <textarea
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="اكتب المعلومات الصحيحة: العنوان، رقم الهاتف، اسم المسؤول..."
                  className={cn(
                    'w-full min-h-[120px] p-4 rounded-lg',
                    'bg-white border-2 border-[var(--status-error)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--status-error)]',
                    'resize-none'
                  )}
                  dir="rtl"
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-[var(--status-info-light)] border border-[var(--status-info)]">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-2xl">💡</div>
                <div>
                  <Text variant="caption" className="text-[var(--status-info)]">
                    {selectedOption.requiresNextStep && (
                      <span>سيتم توجيهك لتحديد الخطوة التالية (مهمة/موعد/عرض سعر)</span>
                    )}
                    {selectedOption.requiresOrder && (
                      <span>سيتم توجيهك لإنشاء طلب وإدارة الصفقة</span>
                    )}
                    {!selectedOption.requiresNextStep && !selectedOption.requiresOrder && (
                      <span>سيتم إنهاء الزيارة وحفظ البيانات</span>
                    )}
                  </Text>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] p-5"
        style={{ paddingBottom: 'calc(20px + var(--safe-area-inset-bottom))' }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleSaveAndContinue}
          className="w-full"
          disabled={!selectedOutcome}
        >
          {selectedOption?.requiresNextStep && 'حفظ والمتابعة للخطوة التالية'}
          {selectedOption?.requiresOrder && 'حفظ وإنشاء الطلب'}
          {!selectedOption?.requiresNextStep && !selectedOption?.requiresOrder && 'حفظ وإنهاء الزيارة'}
          {!selectedOption && 'اختر نتيجة للمتابعة'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
