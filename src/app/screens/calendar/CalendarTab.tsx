/**
 * Calendar Tab - Modern Jibble Style
 * Features:
 * - Disabled add buttons when not clocked in
 * - Clean, minimal design
 * - Orange accents
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, Phone, Plus, AlertCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function CalendarTab() {
  const navigate = useNavigate();
  const { accounts, canAddData, appointments } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get appointments from appointments state (not from accounts.nextAction)
  const allAppointments = appointments.map((apt) => {
    const account = accounts.find((acc) => acc.id === apt.accountId);
    return {
      ...apt,
      accountName: account?.name || 'عميل غير معروف',
      contactPerson: account?.contactPerson || '',
      phone: account?.phone || '',
      address: account?.address || '',
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = allAppointments.filter(
    (apt) => new Date(apt.date) >= today && apt.status === 'scheduled'
  );

  const pastAppointments = allAppointments.filter(
    (apt) => new Date(apt.date) < today
  );

  const handleAddAppointment = () => {
    if (!canAddData) {
      toast.error('يجب تسجيل الحضور أولاً لإضافة مواعيد! ⏰');
      return;
    }
    navigate('/app/leads');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
      {/* Header */}
      <div className="px-4 py-4" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-soft)' }}>
              <CalendarIcon className="w-5 h-5" style={{ color: 'var(--brand-primary-500)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>التقويم</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{upcomingAppointments.length} موعد قادم</p>
            </div>
          </div>

          {/* Add Button */}
          <motion.button
            whileTap={canAddData ? { scale: 0.95 } : {}}
            onClick={handleAddAppointment}
            disabled={!canAddData}
            className="h-10 px-4 rounded-[14px] font-semibold text-sm shadow-sm flex items-center gap-2 transition-all"
            style={canAddData ? {
              background: 'var(--button-primary-bg)',
              color: 'var(--text-inverse)'
            } : {
              background: 'var(--interactive-disabled)',
              color: 'var(--text-disabled)',
              cursor: 'not-allowed'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>موعد جديد</span>
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Today's Summary */}
        {upcomingAppointments.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        }).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[18px] p-5 text-white shadow-md"
            style={{ 
              background: 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))' 
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">مواعيد اليوم</h3>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {upcomingAppointments.filter(apt => {
                const aptDate = new Date(apt.date);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate.getTime() === today.getTime();
              }).length} موعد
            </p>
            <p className="text-sm opacity-90 mt-1">استعد لزياراتك اليوم</p>
          </motion.div>
        )}

        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-5 h-5" style={{ color: 'var(--brand-primary-500)' }} />
            المواعيد القادمة
          </h2>

          {upcomingAppointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[18px] p-8 text-center shadow-sm"
              style={{ background: 'var(--bg-surface)' }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
                   style={{ background: 'var(--neutral-50)' }}>
                <CalendarIcon className="w-8 h-8" style={{ color: 'var(--border-main)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>لا توجد مواعيد قادمة</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>أضف موعداً جديداً لبدء التنظيم</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-[18px] p-4 shadow-sm hover:shadow-md transition-shadow"
                  style={{ 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-light)' 
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{apt.accountName}</h3>
                      {apt.contactPerson && (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{apt.contactPerson}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" 
                          style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary-500)' }}>
                      قادم
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(apt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--brand-primary-500)' }}>
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(apt.date)}</span>
                    </div>
                  </div>

                  {/* Address */}
                  {apt.address && (
                    <div className="flex items-start gap-2 text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{apt.address}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {apt.notes && (
                    <div className="text-sm rounded-[12px] p-3 mb-3" 
                         style={{ color: 'var(--text-secondary)', background: 'var(--neutral-50)' }}>
                      {apt.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => (window.location.href = `tel:${apt.phone}`)}
                      className="flex-1 h-10 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                      style={{ 
                        background: 'var(--neutral-50)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      <Phone className="w-4 h-4" />
                      <span>اتصال</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/app/leads/${apt.accountId}`)}
                      className="flex-1 h-10 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                      style={{ 
                        background: 'var(--button-primary-bg)', 
                        color: 'var(--text-inverse)' 
                      }}
                    >
                      <span>التفاصيل</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              المواعيد السابقة
            </h2>

            <div className="space-y-3">
              {pastAppointments.slice(0, 5).map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-[18px] p-4 shadow-sm opacity-75"
                  style={{ 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-light)' 
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{apt.accountName}</h3>
                      {apt.contactPerson && (
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{apt.contactPerson}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'var(--neutral-100)', color: 'var(--text-secondary)' }}>
                      منتهي
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(apt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(apt.date)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {appointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                 style={{ background: 'var(--brand-soft)' }}>
              <CalendarIcon className="w-10 h-10" style={{ color: 'var(--brand-primary-500)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>لا توجد مواعيد بعد</h3>
            <p className="mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
              ابدأ بإضافة مواعيدك وتنظيم يومك
            </p>
            <motion.button
              whileTap={canAddData ? { scale: 0.98 } : {}}
              onClick={handleAddAppointment}
              disabled={!canAddData}
              className="h-[48px] px-6 rounded-[16px] font-semibold shadow-sm flex items-center gap-2 transition-all"
              style={canAddData ? {
                background: 'var(--button-primary-bg)',
                color: 'var(--text-inverse)'
              } : {
                background: 'var(--interactive-disabled)',
                color: 'var(--text-disabled)',
                cursor: 'not-allowed'
              }}
            >
              <Plus className="w-5 h-5" />
              <span>إضافة موعد</span>
            </motion.button>
            {!canAddData && (
              <p className="text-xs mt-3 flex items-center gap-1" style={{ color: 'var(--status-error)' }}>
                <AlertCircle className="w-4 h-4" />
                <span>يجب تسجيل الحضور أولاً</span>
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}