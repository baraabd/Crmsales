/**
 * Offline Diagnostics Screen - شاشة التشخيص والأوفلاين
 * Outbox Queue Management & Conflict Resolution
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useSync } from '../../contexts/SyncContext';
import { Button, Card, Text, Badge } from '../../../design-system';
import { StatusBar } from '../../../design-system/components/feedback/StatusBar';
import { cn } from '../../../design-system/utils';

const icons = {
  visit: '👔',
  task: '✅',
  party: '🏢',
  quote: '💼',
  media: '📷',
};

const statusConfig = {
  pending: {
    color: 'var(--neutral-500)',
    bgColor: 'var(--neutral-100)',
    label: 'في الانتظار',
    icon: '⏳',
  },
  uploading: {
    color: 'var(--status-info)',
    bgColor: 'var(--status-info-light)',
    label: 'جاري الرفع',
    icon: '⬆️',
  },
  synced: {
    color: 'var(--status-success)',
    bgColor: 'var(--status-success-light)',
    label: 'تمت المزامنة',
    icon: '✅',
  },
  error: {
    color: 'var(--status-error)',
    bgColor: 'var(--status-error-light)',
    label: 'فشل',
    icon: '❌',
  },
  conflict: {
    color: 'var(--status-warning)',
    bgColor: 'var(--status-warning-light)',
    label: 'تعارض',
    icon: '⚠️',
  },
};

export default function OfflineDiagnostics() {
  const navigate = useNavigate();
  const {
    connectionStatus,
    lastSyncTime,
    outboxItems,
    outboxCount,
    conflictCount,
    triggerSync,
    retryFailedItems,
    resolveConflict,
    clearOutbox,
    syncStatus
  } = useSync();

  const handleResolveConflict = async (itemId: string, resolution: 'local' | 'server') => {
    await resolveConflict(itemId, resolution);
    alert(`تم حل التعارض باستخدام البيانات ${resolution === 'local' ? 'المحلية' : 'من الخادم'}`);
  };

  const handleClearCompleted = () => {
    const confirm = window.confirm('هل تريد حذف جميع العمليات المكتملة؟');
    if (confirm) {
      // في التطبيق الحقيقي، نحذف فقط المتزامنة
      clearOutbox();
    }
  };

  const pendingItems = outboxItems.filter(i => i.status === 'pending');
  const uploadingItems = outboxItems.filter(i => i.status === 'uploading');
  const syncedItems = outboxItems.filter(i => i.status === 'synced');
  const errorItems = outboxItems.filter(i => i.status === 'error');
  const conflictItems = outboxItems.filter(i => i.status === 'conflict');

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]" dir="rtl">
      {/* Status Bar */}
      <StatusBar
        connectionStatus={connectionStatus}
        lastSyncTime={lastSyncTime}
        outboxCount={outboxCount}
        conflictCount={conflictCount}
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
            <Text variant="h3" className="font-bold">التشخيص والمزامنة</Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              إدارة قائمة الانتظار والتعارضات
            </Text>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 pb-24">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="text-center">
            <Text variant="h2" className="text-[var(--brand-primary-600)] font-bold mb-1">
              {outboxCount}
            </Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              عمليات معلقة
            </Text>
          </Card>
          <Card className="text-center">
            <Text variant="h2" className={cn(
              "font-bold mb-1",
              conflictCount > 0 ? "text-[var(--status-error)]" : "text-[var(--status-success)]"
            )}>
              {conflictCount}
            </Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              تعارضات
            </Text>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-6">
          <Text variant="h4" className="font-bold mb-4">إجراءات سريعة</Text>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={triggerSync}
              disabled={connectionStatus !== 'online' || syncStatus === 'syncing'}
              className="w-full"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {syncStatus === 'syncing' ? 'جاري المزامنة...' : 'مزامنة الآن'}
            </Button>

            {errorItems.length > 0 && (
              <Button
                variant="secondary"
                onClick={retryFailedItems}
                className="w-full"
              >
                إعادة محاولة العمليات الفاشلة ({errorItems.length})
              </Button>
            )}

            {syncedItems.length > 0 && (
              <Button
                variant="secondary"
                onClick={handleClearCompleted}
                className="w-full"
              >
                حذف العمليات المكتملة ({syncedItems.length})
              </Button>
            )}
          </div>
        </Card>

        {/* Outbox Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Text variant="h4" className="font-bold">قائمة الانتظار (Outbox)</Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              إجمالي: {outboxItems.length}
            </Text>
          </div>

          {outboxItems.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[var(--status-success-light)] flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <Text variant="h4" className="mb-2">كل شيء متزامن!</Text>
              <Text variant="body" className="text-[var(--text-secondary)]">
                لا توجد عمليات معلقة في قائمة الانتظار
              </Text>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Conflict Items - أعلى أولوية */}
              {conflictItems.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    <Card 
                      className="border-2"
                      style={{ borderColor: config.color }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          {icons[item.type]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Text variant="body" className="font-semibold">
                              {item.type === 'visit' && 'إرسال زيارة'}
                              {item.type === 'task' && 'تحديث مهمة'}
                              {item.type === 'party' && 'تحديث عميل'}
                              {item.type === 'quote' && 'عرض سعر'}
                              {item.type === 'media' && 'رفع ملف'}
                            </Text>
                            <Badge 
                              variant="error" 
                              size="sm"
                            >
                              {config.icon} {config.label}
                            </Badge>
                          </div>
                          <Text variant="caption" className="text-[var(--text-secondary)]">
                            محاولة {item.attempts}/{item.maxAttempts}
                          </Text>
                        </div>
                      </div>

                      <div className="bg-[var(--status-error-light)] border border-[var(--status-error)] rounded-lg p-3 mb-3">
                        <Text variant="caption" className="text-[var(--status-error)] font-semibold mb-2 block">
                          ⚠️ تعارض في البيانات - اختر الإصدار المطلوب:
                        </Text>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleResolveConflict(item.id, 'local')}
                            className="flex-1"
                          >
                            الاحتفاظ بالمحلي
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleResolveConflict(item.id, 'server')}
                            className="flex-1"
                          >
                            استخدام الخادم
                          </Button>
                        </div>
                      </div>

                      <Text variant="caption" className="text-[var(--text-tertiary)]">
                        {new Date(item.timestamp).toLocaleString('ar-SA')}
                      </Text>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Uploading Items */}
              {uploadingItems.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    <Card>
                      <div className="flex items-start gap-3 mb-2">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          {icons[item.type]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Text variant="body" className="font-semibold">
                              {item.type === 'media' ? `رفع: ${item.data?.name || 'ملف'}` : 'جاري الرفع...'}
                            </Text>
                            <Badge 
                              variant="info" 
                              size="sm"
                            >
                              {config.icon} {item.progress || 0}%
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress || 0}%` }}
                          className="h-full bg-gradient-to-r from-[var(--status-info)] to-[var(--brand-primary-500)]"
                        />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Pending Items */}
              {pendingItems.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    <Card>
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          {icons[item.type]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Text variant="body" className="font-semibold">
                              {item.operation === 'create' && 'إنشاء'}
                              {item.operation === 'update' && 'تحديث'}
                              {item.operation === 'delete' && 'حذف'}
                              {' '}
                              {item.type === 'visit' && 'زيارة'}
                              {item.type === 'task' && 'مهمة'}
                              {item.type === 'party' && 'عميل'}
                              {item.type === 'quote' && 'عرض سعر'}
                              {item.type === 'media' && 'ملف'}
                            </Text>
                            <Badge 
                              variant="default" 
                              size="sm"
                            >
                              {config.icon}
                            </Badge>
                          </div>
                          <Text variant="caption" className="text-[var(--text-secondary)]">
                            محاولة {item.attempts}/{item.maxAttempts}
                            {item.attempts > 0 && ' • سيتم إعادة المحاولة في: 30 ثانية'}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Error Items */}
              {errorItems.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    <Card 
                      className="border"
                      style={{ borderColor: config.color }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          {icons[item.type]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Text variant="body" className="font-semibold">
                              فشل الرفع
                            </Text>
                            <Badge 
                              variant="error" 
                              size="sm"
                            >
                              {config.icon} {config.label}
                            </Badge>
                          </div>
                          <Text variant="caption" className="text-[var(--status-error)]">
                            {item.error || 'خطأ غير معروف'}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Synced Items */}
              {syncedItems.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                  >
                    <Card className="opacity-60">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          {icons[item.type]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Text variant="body" className="font-semibold">
                              تمت المزامنة
                            </Text>
                            <Badge 
                              variant="success" 
                              size="sm"
                            >
                              {config.icon}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        {connectionStatus === 'offline' && outboxCount > 0 && (
          <div className="mt-6 bg-[var(--status-warning-light)] border border-[var(--status-warning)] rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-2xl">📡</div>
              <div>
                <Text variant="body" className="font-semibold text-[var(--status-warning)] mb-1">
                  وضع عدم الاتصال
                </Text>
                <Text variant="caption" className="text-[var(--status-warning)]">
                  سيتم مزامنة جميع العمليات المعلقة تلقائياً عند استعادة الاتصال بالإنترنت
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
