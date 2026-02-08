/**
 * Next Step Screen - شاشة الخطوة التالية الإلزامية
 * NextStep Engine حسب Hybrid Pipeline Implementation
 */

import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useSync } from '../../contexts/SyncContext';
import { Button, Card, Text, Badge } from '../../../design-system';
import { StatusBar } from '../../../design-system/components/feedback/StatusBar';
import { cn } from '../../../design-system/utils';

type NextStepType = 'appointment' | 'task' | 'quote';

interface NextStepOption {
  id: NextStepType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

const nextStepOptions: NextStepOption[] = [
  {
    id: 'appointment',
    label: 'موعد',
    description: 'حجز موعد مستقبلي مع العميل',
    icon: '📅',
    color: 'var(--status-info)',
    bgColor: 'var(--status-info-light)',
  },
  {
    id: 'task',
    label: 'مهمة',
    description: 'إنشاء مهمة متابعة',
    icon: '✅',
    color: 'var(--status-warning)',
    bgColor: 'var(--status-warning-light)',
  },
  {
    id: 'quote',
    label: 'عرض سعر',
    description: 'إنشاء مسودة عرض سعر للصفقة',
    icon: '💼',
    color: 'var(--brand-primary-600)',
    bgColor: 'var(--brand-soft)',
  },
];

export default function NextStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const { visitId } = useParams<{ visitId: string }>();
  const { connectionStatus, lastSyncTime, outboxCount, conflictCount, addToOutbox } = useSync();

  const outcome = location.state?.outcome;

  const [selectedType, setSelectedType] = useState<NextStepType | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentSubject, setAppointmentSubject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [quoteNotes, setQuoteNotes] = useState('');

  const selectedOption = nextStepOptions.find(o => o.id === selectedType);

  const handleFinishVisit = () => {
    if (!selectedType) {
      alert('الرجاء اختيار نوع الخطوة التالية');
      return;
    }

    // التحقق من الحقول المطلوبة
    if (selectedType === 'appointment') {
      if (!appointmentDate || !appointmentTime || !appointmentSubject) {
        alert('الرجاء تعبئة جميع حقول الموعد');
        return;
      }
    } else if (selectedType === 'task') {
      if (!taskTitle || !taskDueDate) {
        alert('الرجاء تعبئة عنوان المهمة والتاريخ');
        return;
      }
    } else if (selectedType === 'quote') {
      if (!quoteNotes) {
        alert('الرجاء إضافة ملاحظات لعرض السعر');
        return;
      }
    }

    // إنشاء الخطوة التالية
    const nextStepData: any = {
      visitId,
      type: selectedType,
      createdAt: new Date(),
    };

    if (selectedType === 'appointment') {
      nextStepData.appointment = {
        date: appointmentDate,
        time: appointmentTime,
        subject: appointmentSubject,
        dateTime: new Date(`${appointmentDate}T${appointmentTime}`),
      };
    } else if (selectedType === 'task') {
      nextStepData.task = {
        title: taskTitle,
        dueDate: taskDueDate,
        priority: taskPriority,
      };
    } else if (selectedType === 'quote') {
      nextStepData.quote = {
        notes: quoteNotes,
        status: 'draft',
      };
    }

    // حفظ في Outbox
    addToOutbox({
      type: 'task',
      operation: 'create',
      data: nextStepData,
      maxAttempts: 5,
    });

    // التوجيه حسب النوع
    if (selectedType === 'quote') {
      // الانتقال لشاشة الصفقة
      navigate(`/visit/deal/${visitId}`, {
        state: { quoteData: nextStepData }
      });
    } else {
      // إنهاء والعودة للرئيسية
      navigate('/app/home', {
        state: { 
          message: `تم حفظ ${selectedType === 'appointment' ? 'الموعد' : 'المهمة'} بنجاح`,
          showSuccess: true 
        }
      });
    }
  };

  // الحصول على التاريخ الحالي بصيغة yyyy-mm-dd
  const today = new Date().toISOString().split('T')[0];

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
            <Text variant="h3" className="font-bold">حدد الخطوة التالية</Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              مطلوب - لا يمكن إنهاء الزيارة بدونها
            </Text>
          </div>
          <Badge variant="warning">إلزامي</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 pb-32">
        {/* Context Info */}
        <Card className="mb-6 bg-[var(--brand-soft)] border border-[var(--brand-primary-300)]">
          <div className="flex gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <Text variant="body" className="font-semibold text-[var(--brand-primary-700)] mb-1">
                نتيجة الزيارة: {outcome === 'interested' ? 'مهتم' : 'لا يوجد تواصل'}
              </Text>
              <Text variant="caption" className="text-[var(--brand-primary-600)]">
                يجب تحديد خطوة تالية للمتابعة مع العميل
              </Text>
            </div>
          </div>
        </Card>

        {/* Step Type Selection */}
        <div className="space-y-3 mb-6">
          <Text variant="body" className="text-[var(--text-secondary)] mb-3">
            اختر نوع الخطوة التالية:
          </Text>

          {nextStepOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => setSelectedType(option.id)}
                className={cn(
                  'w-full text-right transition-all',
                  selectedType === option.id && 'scale-[1.02]'
                )}
              >
                <Card
                  className={cn(
                    'transition-all',
                    selectedType === option.id
                      ? 'ring-2 shadow-lg'
                      : 'hover:shadow-md'
                  )}
                  style={{
                    ringColor: selectedType === option.id ? option.color : undefined
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: option.bgColor }}
                    >
                      {option.icon}
                    </div>

                    <div className="flex-1">
                      <Text variant="body" className="font-bold mb-0.5">
                        {option.label}
                      </Text>
                      <Text variant="caption" className="text-[var(--text-secondary)]">
                        {option.description}
                      </Text>
                    </div>

                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedType === option.id
                          ? 'border-transparent'
                          : 'border-[var(--border-main)]'
                      )}
                      style={{
                        backgroundColor: selectedType === option.id ? option.color : 'transparent'
                      }}
                    >
                      {selectedType === option.id && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
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

        {/* Dynamic Form Based on Selection */}
        <AnimatePresence mode="wait">
          {selectedType === 'appointment' && (
            <motion.div
              key="appointment-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-[var(--status-info-light)] border-2 border-[var(--status-info)]">
                <Text variant="h4" className="font-bold mb-4">تفاصيل الموعد</Text>

                <div className="space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="body" className="font-semibold">الموضوع *</Text>
                    </label>
                    <input
                      type="text"
                      value={appointmentSubject}
                      onChange={(e) => setAppointmentSubject(e.target.value)}
                      placeholder="مثال: عرض تجريبي للمنتج"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[var(--border-light)] focus:border-[var(--status-info)] focus:outline-none bg-white"
                      dir="rtl"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="body" className="font-semibold">التاريخ *</Text>
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={today}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[var(--border-light)] focus:border-[var(--status-info)] focus:outline-none bg-white"
                      dir="rtl"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="body" className="font-semibold">الوقت *</Text>
                    </label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[var(--border-light)] focus:border-[var(--status-info)] focus:outline-none bg-white"
                      dir="rtl"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {selectedType === 'task' && (
            <motion.div
              key="task-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-[var(--status-warning-light)] border-2 border-[var(--status-warning)]">
                <Text variant="h4" className="font-bold mb-4">تفاصيل المهمة</Text>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="body" className="font-semibold">عنوان المهمة *</Text>
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="مثال: إرسال عرض السعر بالبريد"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[var(--border-light)] focus:border-[var(--status-warning)] focus:outline-none bg-white"
                      dir="rtl"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="body" className="font-semibold">تاريخ الاستحقاق *</Text>
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      min={today}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[var(--border-light)] focus:border-[var(--status-warning)] focus:outline-none bg-white"
                      dir="rtl"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block mb-2">
                      <Text variant="body" className="font-semibold">الأولوية</Text>
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'high' as const, label: 'عاجل', color: 'var(--status-error)' },
                        { value: 'normal' as const, label: 'عادي', color: 'var(--status-warning)' },
                        { value: 'low' as const, label: 'منخفض', color: 'var(--status-info)' },
                      ].map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() => setTaskPriority(priority.value)}
                          className={cn(
                            'flex-1 py-2 rounded-lg border-2 transition-all',
                            taskPriority === priority.value
                              ? 'border-transparent text-white'
                              : 'border-[var(--border-light)] bg-white hover:border-[var(--border-main)]'
                          )}
                          style={{
                            backgroundColor: taskPriority === priority.value ? priority.color : undefined
                          }}
                        >
                          <Text variant="body" className="font-semibold">
                            {priority.label}
                          </Text>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {selectedType === 'quote' && (
            <motion.div
              key="quote-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-[var(--brand-soft)] border-2 border-[var(--brand-primary-500)]">
                <Text variant="h4" className="font-bold mb-4">بدء مسودة عرض السعر</Text>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">
                      <Text variant="body" className="font-semibold">ملاحظات العرض *</Text>
                    </label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="الخدمات المطلوبة، الباقة المقترحة، الملاحظات الأولية..."
                      className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-[var(--border-light)] focus:border-[var(--brand-primary-500)] focus:outline-none bg-white resize-none"
                      dir="rtl"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-[var(--brand-primary-300)]">
                    <Text variant="caption" className="text-[var(--brand-primary-700)]">
                      💡 سيتم توجيهك لشاشة الصفقة لإكمال تفاصيل عرض السعر والخدمات
                    </Text>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Button */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] p-5"
        style={{ paddingBottom: 'calc(20px + var(--safe-area-inset-bottom))' }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleFinishVisit}
          className="w-full"
          disabled={!selectedType}
        >
          {selectedType === 'quote' ? 'إنشاء الصفقة والمتابعة' : 'إنهاء الزيارة وحفظ 🏁'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
