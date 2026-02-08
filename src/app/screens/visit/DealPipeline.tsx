/**
 * Deal Pipeline Screen - شاشة صفقة المبيعات
 * Sales Pipeline مع Quote/Order Management
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { useSync } from '../../contexts/SyncContext';
import { Button, Card, Text, Badge } from '../../../design-system';
import { StatusBar } from '../../../design-system/components/feedback/StatusBar';
import { cn } from '../../../design-system/utils';

type PipelineStage = 'discovery' | 'solution_fit' | 'proposal' | 'negotiation' | 'won' | 'lost';

interface PipelineStageInfo {
  id: PipelineStage;
  label: string;
  color: string;
}

const pipelineStages: PipelineStageInfo[] = [
  { id: 'discovery', label: 'الاكتشاف', color: 'var(--neutral-400)' },
  { id: 'solution_fit', label: 'ملاءمة الحل', color: 'var(--status-info)' },
  { id: 'proposal', label: 'العرض', color: 'var(--brand-primary-500)' },
  { id: 'negotiation', label: 'التفاوض', color: 'var(--status-warning)' },
  { id: 'won', label: 'مكتسبة', color: 'var(--status-success)' },
  { id: 'lost', label: 'مفقودة', color: 'var(--status-error)' },
];

interface LineItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function DealPipeline() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { connectionStatus, lastSyncTime, outboxCount, conflictCount, addToOutbox } = useSync();

  const [currentStage, setCurrentStage] = useState<PipelineStage>('proposal');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: 'باقة تحسين محركات البحث الأساسية', price: 500, quantity: 1 },
    { id: '2', name: 'إدارة وسائل التواصل الاجتماعي', price: 300, quantity: 1 },
  ]);
  const [discount, setDiscount] = useState(10);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [priceRulesVersion, setPriceRulesVersion] = useState('v1.2');

  const subtotal = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const currentStageIndex = pipelineStages.findIndex(s => s.id === currentStage);

  const handleSubmitForApproval = () => {
    const quoteData = {
      visitId,
      stage: currentStage,
      lineItems,
      subtotal,
      discount,
      total,
      priceRulesVersion,
      status: 'pending_approval',
      timestamp: new Date()
    };

    addToOutbox({
      type: 'quote',
      operation: 'create',
      data: quoteData,
      maxAttempts: 5
    });

    alert('تم إرسال العرض للموافقة بنجاح');
    navigate('/app/home');
  };

  const handleMarkAsWon = () => {
    setCurrentStage('won');
    
    const dealData = {
      visitId,
      stage: 'won',
      lineItems,
      total,
      timestamp: new Date()
    };

    addToOutbox({
      type: 'quote',
      operation: 'update',
      data: dealData,
      maxAttempts: 5
    });

    setTimeout(() => {
      navigate('/app/home', {
        state: { message: '🎉 تهانينا! تم اكتساب الصفقة بنجاح', showSuccess: true }
      });
    }, 1000);
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-[var(--interactive-hover)] flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1">
            <Text variant="h3" className="font-bold">صفقة: التحول الرقمي</Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              شركة التقنية المتقدمة
            </Text>
          </div>
          <Badge variant="info">نشطة</Badge>
        </div>

        {/* Pipeline Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <Text variant="caption" className="font-semibold">المرحلة</Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              {currentStageIndex + 1}/{pipelineStages.filter(s => !['won', 'lost'].includes(s.id)).length}
            </Text>
          </div>
          
          <div className="flex items-center gap-1">
            {pipelineStages.filter(s => !['won', 'lost'].includes(s.id)).map((stage, index) => (
              <div
                key={stage.id}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: index <= currentStageIndex ? stage.color : 'var(--neutral-200)'
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            {pipelineStages.filter(s => !['won', 'lost'].includes(s.id)).map((stage, index) => (
              <button
                key={stage.id}
                onClick={() => setCurrentStage(stage.id)}
                className={cn(
                  'flex-1 text-center py-1 text-xs transition-colors',
                  currentStage === stage.id ? 'font-bold' : 'text-[var(--text-tertiary)]'
                )}
                style={{
                  color: currentStage === stage.id ? stage.color : undefined
                }}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 pb-32">
        {/* Quote Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Text variant="h4" className="font-bold">تفاصيل العرض</Text>
            <Badge variant="success" size="sm">
              قواعد التسعير: {priceRulesVersion} ✅
            </Badge>
          </div>

          <Card className="space-y-4">
            {/* Line Items */}
            <div>
              <Text variant="body" className="font-semibold mb-3">بنود العرض</Text>
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between pb-3 border-b border-[var(--border-light)] last:border-0 last:pb-0">
                    <div className="flex-1">
                      <Text variant="body" className="font-medium mb-1">{item.name}</Text>
                      <Text variant="caption" className="text-[var(--text-secondary)]">
                        الكمية: {item.quantity}
                      </Text>
                    </div>
                    <Text variant="body" className="font-semibold">
                      ${item.price.toFixed(2)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-[var(--neutral-50)] rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <Text variant="body" className="text-[var(--text-secondary)]">المجموع الفرعي</Text>
                <Text variant="body" className="font-semibold">${subtotal.toFixed(2)}</Text>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Text variant="body" className="text-[var(--text-secondary)]">الخصم</Text>
                  {discount > 15 && (
                    <Badge variant="warning" size="sm">يتطلب موافقة ⚠️</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDiscount(val);
                      setRequiresApproval(val > 15);
                    }}
                    min="0"
                    max="100"
                    className="w-16 px-2 py-1 rounded border border-[var(--border-light)] text-center"
                  />
                  <Text variant="body" className="font-semibold">%</Text>
                  <Text variant="body" className="font-semibold">-${discountAmount.toFixed(2)}</Text>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[var(--border-main)] flex justify-between">
                <Text variant="h4" className="font-bold">الإجمالي</Text>
                <Text variant="h4" className="font-bold text-[var(--brand-primary-600)]">
                  ${total.toFixed(2)}
                </Text>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)]">
              <Text variant="body" className="text-[var(--text-secondary)]">الحالة</Text>
              <Badge variant={requiresApproval ? 'warning' : 'default'}>
                {requiresApproval ? 'يتطلب موافقة المدير' : 'مسودة'}
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[var(--brand-soft)] border border-[var(--brand-primary-300)]">
            <Text variant="h4" className="font-bold mb-4">الإجراءات المتاحة</Text>
            
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleMarkAsWon}
                className="w-full"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                تأكيد البيع (WON)
              </Button>

              {requiresApproval && (
                <Button
                  variant="secondary"
                  onClick={handleSubmitForApproval}
                  className="w-full"
                >
                  إرسال للموافقة
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => navigate(`/dropin/services/${visitId}`)}
                className="w-full"
              >
                تعديل الخدمات
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Info Box */}
        <div className="mt-6 bg-[var(--status-info-light)] border border-[var(--status-info)] rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <Text variant="caption" className="text-[var(--status-info)]">
                عند تأكيد البيع، سيتم إنشاء طلب تلقائياً وبدء عملية الإعداد (Onboarding)
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] p-5"
        style={{ paddingBottom: 'calc(20px + var(--safe-area-inset-bottom))' }}
      >
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            حفظ كمسودة
          </Button>
          <Button
            variant="primary"
            onClick={handleMarkAsWon}
            className="flex-1"
          >
            تأكيد البيع 🎉
          </Button>
        </div>
      </div>
    </div>
  );
}
