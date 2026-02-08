/**
 * HomeScreenNew - Fixed Mobile Layout
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  MapPin,
  Calendar,
  TrendingUp,
  FileText,
  Bell,
  Users,
  ShoppingCart,
  ClipboardList,
  Navigation,
  Target,
} from 'lucide-react';
import { GridCard } from '../../design-system/components/GridCard';
import { AppButtonV2 } from '../../design-system/components/AppButtonV2';

export function HomeScreenNew() {
  const navigate = useNavigate();
  const [clockedIn, setClockedIn] = useState(false);

  return (
    <div className="mobile-screen" dir="rtl">
      {/* خريطة في الخلفية */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div
          style={{
            background: 'linear-gradient(180deg, #0B0F1A 0%, #1A1F2E 100%)',
            height: '100%',
          }}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      </div>

      {/* المحتوى القابل للتمرير */}
      <div className="mobile-content relative z-10">
        <div className="px-4">
          {/* Header */}
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between">
              {/* الوقت والتاريخ */}
              <div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  السبت، 8 فبراير 2026
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* الإشعارات */}
              <button
                onClick={() => navigate('/app/notifications-new')}
                className="relative w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-card)' }}
              >
                <Bell className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--color-red)', color: 'white' }}
                >
                  3
                </span>
              </button>
            </div>
          </div>

          {/* الحالة */}
          <div className="mt-2">
            <div
              className="rounded-2xl p-3 flex items-center justify-between"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: clockedIn ? 'var(--color-primary)' : 'var(--text-tertiary)',
                  }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {clockedIn ? 'نشط الآن' : 'غير نشط'}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {clockedIn ? '2 ساعة 15 دقيقة' : 'ابدأ الدوام'}
              </span>
            </div>
          </div>

          {/* الإحصائيات السريعة */}
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="زيارات اليوم" value="12" color="var(--color-primary)" />
              <StatCard label="مكتملة" value="8" color="var(--color-blue)" />
              <StatCard label="قادمة" value="4" color="var(--color-orange)" />
            </div>
          </div>

          {/* الخدمات - شبكة 2x2 */}
          <div className="mt-5">
            <h3
              className="text-base font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              الخدمات
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <GridCard
                icon={<Users />}
                title="العملاء"
                subtitle="125 عميل"
                color="green"
                onClick={() => navigate('/app/leads-new')}
              />
              <GridCard
                icon={<Calendar />}
                title="المواعيد"
                subtitle="8 موعد"
                color="blue"
                badge={3}
                onClick={() => navigate('/app/calendar-new')}
              />
              <GridCard
                icon={<ShoppingCart />}
                title="الطلبات"
                subtitle="23 طلب"
                color="orange"
              />
              <GridCard
                icon={<FileText />}
                title="التقارير"
                subtitle="عرض الكل"
                color="purple"
              />
            </div>

            {/* خدمات إضافية */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <GridCard
                icon={<TrendingUp />}
                title="الإحصائيات"
                color="cyan"
                onClick={() => navigate('/app/stats-new')}
              />
              <GridCard
                icon={<ClipboardList />}
                title="المهام"
                subtitle="5 مهام"
                color="red"
                badge={5}
              />
            </div>
          </div>

          {/* زر بدء الدوام */}
          <div className="mt-6 pb-4">
            <AppButtonV2
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setClockedIn(!clockedIn)}
            >
              {clockedIn ? 'إنهاء الدوام' : 'بدء الدوام'}
            </AppButtonV2>
          </div>
        </div>
      </div>

      {/* أزرار FAB */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <Target className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/app/map-new')}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--color-blue)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <Navigation className="w-5 h-5" style={{ color: 'white' }} />
        </motion.button>
      </div>
    </div>
  );
}

// مكون الإحصائية الصغيرة
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-2.5 text-center"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="text-lg font-bold mb-0.5" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </div>
  );
}
