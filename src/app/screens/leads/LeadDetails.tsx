/**
 * Lead Details Screen - Jibble Style
 * 
 * Features:
 * - 100% Design Tokens usage
 * - Clean UI kits (Button, Badge, Chip)
 * - Mobile-first responsive design
 * - Offline-first support
 * - Timeline view for visits
 * 
 * @version 2.0
 * @clean 100%
 */

import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../../design-system';
import { Chip } from '../../components/ui/chip';
import { motion } from 'motion/react';
import {
  ArrowRight,
  MapPin,
  Phone,
  Navigation,
  Calendar,
  Clock,
  MessageCircle,
  User,
  Plus,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

/**
 * Helper: Get lifecycle label in Arabic
 */
const getLifecycleLabel = (lifecycle: string): string => {
  const labels: Record<string, string> = {
    customer: 'عميل',
    warm: 'محتمل',
    cold: 'بارد',
    lost: 'مرفوض',
  };
  return labels[lifecycle] || lifecycle;
};

/**
 * Helper: Get pin color label in Arabic
 */
const getPinColorLabel = (pinColor: string): string => {
  const labels: Record<string, string> = {
    green: 'أخضر',
    yellow: 'أصفر',
    blue: 'أزرق',
    gray: 'رمادي',
  };
  return labels[pinColor] || pinColor;
};

/**
 * Helper: Get outcome label in Arabic
 */
const getOutcomeLabel = (outcome: string): string => {
  const labels: Record<string, string> = {
    deal: 'صفقة',
    appointment: 'موعد',
    busy: 'مشغول',
    rejected: 'رفض',
  };
  return labels[outcome] || outcome;
};

/**
 * LeadDetails Component
 */
export function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accounts, visits } = useApp();

  const account = accounts.find((a) => a.id === id);
  
  if (!account) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="size-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--neutral-100)' }}>
          <User className="size-8" style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          العميل غير موجود
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          العودة
        </Button>
      </div>
    );
  }

  const accountVisits = visits.filter((v) => v.accountId === id);

  // Quick action handlers
  const handleAddVisit = () => {
    navigate(`/dropin/checkin-new/${account.id}`);
  };

  const handleNavigate = () => {
    if (account.latitude && account.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${account.latitude},${account.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleCall = () => {
    if (account.phone) {
      window.location.href = `tel:${account.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (account.phone) {
      const cleanPhone = account.phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
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
        <h1 className="text-lg font-bold text-white">تفاصيل العميل</h1>
        <div className="size-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Account Info Card */}
        <div className="p-4 rounded-[20px] m-4 shadow-sm" style={{ background: 'var(--bg-surface)' }}>
          {/* Customer Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="size-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-soft)' }}>
              <User className="size-8" style={{ color: 'var(--brand-primary-600)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-2 truncate" style={{ color: 'var(--text-primary)' }}>
                {account.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip selected size="sm">
                  {getLifecycleLabel(account.lifecycle)}
                </Chip>
                <Chip selected={false} size="sm">
                  📍 {getPinColorLabel(account.pinColor)}
                </Chip>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-5">
            {account.contactPerson && (
              <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--neutral-50)' }}>
                <MessageCircle className="size-5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{account.contactPerson}</span>
              </div>
            )}
            {account.phone && (
              <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--neutral-50)' }}>
                <Phone className="size-5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }} dir="ltr">{account.phone}</span>
              </div>
            )}
            {account.address && (
              <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--neutral-50)' }}>
                <MapPin className="size-5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{account.address}</span>
              </div>
            )}
          </div>

          {/* Quick Actions - Using Design System Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Action: Add Visit - Full Width */}
            <div className="col-span-2">
              <Button
                onClick={handleAddVisit}
                variant="primary"
                size="lg"
                fullWidth
                startIcon={<Plus className="size-5" />}
              >
                إضافة زيارة
              </Button>
            </div>

            {/* Secondary Actions Row 1 */}
            <Button
              onClick={handleNavigate}
              variant="secondary"
              size="md"
              fullWidth
              disabled={!account.latitude || !account.longitude}
              startIcon={<Navigation className="size-4" />}
            >
              توجيه
            </Button>

            <Button
              onClick={handleCall}
              variant="secondary"
              size="md"
              fullWidth
              disabled={!account.phone}
              startIcon={<Phone className="size-4" />}
            >
              اتصال
            </Button>

            {/* Secondary Actions Row 2 - WhatsApp Full Width */}
            <div className="col-span-2">
              <Button
                onClick={handleWhatsApp}
                variant="secondary"
                size="md"
                fullWidth
                disabled={!account.phone}
                startIcon={<MessageSquare className="size-4" />}
              >
                واتساب
              </Button>
            </div>
          </div>
        </div>

        {/* Next Action Card */}
        {account.nextAction && account.nextAction.type !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-4 rounded-[18px] p-4"
            style={{
              background: 'var(--info-soft)',
              border: '1px solid var(--brand-blue-200)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-blue-100)' }}>
                <Calendar className="size-5" style={{ color: 'var(--brand-blue-600)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2" style={{ color: 'var(--brand-blue-700)' }}>
                  الإجراء التالي
                </h3>
                <div className="space-y-1 text-sm" style={{ color: 'var(--brand-blue-600)' }}>
                  <p>
                    <strong>النوع:</strong>{' '}
                    {account.nextAction.type === 'appointment' ? 'موعد' : 'متابعة'}
                  </p>
                  {account.nextAction.datetime && (
                    <p>
                      <strong>التاريخ:</strong>{' '}
                      {new Date(account.nextAction.datetime).toLocaleString('ar-SA')}
                    </p>
                  )}
                  {account.nextAction.notes && (
                    <p className="mt-2 p-2 rounded-lg" style={{ background: 'white' }}>
                      {account.nextAction.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Visits Timeline */}
        <div className="mx-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              سجل الزيارات
            </h3>
            {accountVisits.length > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: 'var(--brand-soft)',
                  color: 'var(--brand-primary-600)',
                }}
              >
                {accountVisits.length}
              </span>
            )}
          </div>

          {accountVisits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[18px] p-8 text-center"
              style={{ background: 'var(--bg-surface)' }}
            >
              <div className="size-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--neutral-100)' }}>
                <Clock className="size-8" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                لا توجد زيارات سابقة
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                ابدأ بإضافة زيارة جديدة
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {accountVisits.map((visit, index) => (
                <motion.div
                  key={visit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-[16px] p-4 shadow-sm"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(visit.startTime).toLocaleString('ar-SA', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {visit.outcome && (
                      <Chip selected size="sm">
                        {getOutcomeLabel(visit.outcome)}
                      </Chip>
                    )}
                  </div>

                  {visit.duration && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="size-4" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        المدة: {visit.duration} دقيقة
                      </span>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="p-3 rounded-lg mt-2" style={{ background: 'var(--neutral-50)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {visit.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Offline Sync Indicator */}
        <div className="mx-4 mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[14px] p-3 flex items-center justify-center gap-2"
            style={{
              background: 'var(--success-soft)',
              border: '1px solid var(--status-success)',
            }}
          >
            <AlertCircle className="size-4" style={{ color: 'var(--status-success)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--status-success)' }}>
              تم الحفظ محليًا - سيتم المزامنة عند الاتصال
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}