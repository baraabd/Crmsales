/**
 * CalendarScreenNew - Fixed Mobile Layout
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';

export function CalendarScreenNew() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const appointments = [
    {
      id: '1',
      title: 'زيارة عميل - محمد أحمد',
      time: '09:00',
      duration: '30 دقيقة',
      location: 'الرياض، حي النخيل',
      status: 'upcoming',
      color: 'var(--color-primary)',
    },
    {
      id: '2',
      title: 'عرض تقديمي - شركة النور',
      time: '11:30',
      duration: '1 ساعة',
      location: 'الرياض، مركز الأعمال',
      status: 'upcoming',
      color: 'var(--color-blue)',
    },
    {
      id: '3',
      title: 'متابعة - فاطمة علي',
      time: '14:00',
      duration: '45 دقيقة',
      location: 'الرياض، حي السلام',
      status: 'completed',
      color: 'var(--color-orange)',
    },
  ];

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="mobile-screen" dir="rtl">
      <div className="mobile-content">
        <div className="px-4">
          {/* Header */}
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  المواعيد
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {appointments.length} موعد هذا الأسبوع
                </p>
              </div>

              <button
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}
              >
                <Plus className="w-6 h-6" style={{ color: '#000' }} />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatCard label="اليوم" value="2" color="var(--color-primary)" />
              <StatCard label="الأسبوع" value="8" color="var(--color-blue)" />
              <StatCard label="الشهر" value="24" color="var(--color-orange)" />
            </div>

            {/* Calendar Header */}
            <div
              className="rounded-2xl p-3 mb-3"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <button className="w-9 h-9 rounded-lg flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>

                <div className="text-center">
                  <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    فبراير 2026
                  </div>
                </div>

                <button className="w-9 h-9 rounded-lg flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-semibold py-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.slice(0, 28).map((day) => {
                  const isToday = day === 8;
                  const hasAppointment = [8, 10, 12, 15].includes(day);

                  return (
                    <motion.button
                      key={day}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(new Date(2026, 1, day))}
                      className="relative aspect-square rounded-lg flex items-center justify-center"
                      style={{
                        background: isToday ? 'var(--color-primary)' : 'transparent',
                      }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: isToday ? '#000' : 'var(--text-primary)',
                        }}
                      >
                        {day}
                      </span>
                      {hasAppointment && !isToday && (
                        <div
                          className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{ background: 'var(--color-blue)' }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="pb-4">
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              مواعيد اليوم
            </h3>

            <div className="space-y-2">
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment.id} {...appointment} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-2 text-center"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="text-lg font-bold mb-0.5" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </div>
  );
}

function AppointmentCard({
  title,
  time,
  duration,
  location,
  status,
  color,
}: {
  title: string;
  time: string;
  duration: string;
  location: string;
  status: string;
  color: string;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl p-3"
      style={{
        background: 'var(--bg-card)',
        opacity: status === 'completed' ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-2">
        {/* Time Badge */}
        <div
          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
          style={{ background: color }}
        >
          <div className="text-[10px] font-bold" style={{ color: '#000' }}>
            {time.split(':')[0]}
          </div>
          <div className="text-[10px] font-bold" style={{ color: '#000' }}>
            {time.split(':')[1]}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold mb-1.5 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h4>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {duration}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {location}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        {status === 'completed' && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            <div className="text-base" style={{ color: '#000' }}>✓</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
