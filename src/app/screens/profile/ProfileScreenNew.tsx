/**
 * ProfileScreenNew - Fixed Mobile Layout
 */

import { motion } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  Edit2,
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function ProfileScreenNew() {
  const navigate = useNavigate();
  
  const user = {
    name: 'أحمد محمد السعيد',
    email: 'ahmed@company.com',
    phone: '0501234567',
    position: 'مندوب مبيعات أول',
    location: 'الرياض، المملكة العربية السعودية',
    joinDate: 'يناير 2024',
  };

  const stats = [
    { label: 'الزيارات', value: '156', color: 'var(--color-primary)' },
    { label: 'المبيعات', value: '89', color: 'var(--color-blue)' },
    { label: 'التقييم', value: '4.8', color: 'var(--color-orange)' },
  ];

  const menuItems = [
    {
      icon: Settings,
      label: 'الإعدادات',
      color: 'var(--color-blue)',
      action: () => navigate('/app/settings'),
    },
    {
      icon: Award,
      label: 'الإنجازات',
      color: 'var(--color-orange)',
      action: () => {},
    },
    {
      icon: Calendar,
      label: 'سجل الدوام',
      color: 'var(--color-purple)',
      action: () => navigate('/app/timesheet'),
    },
    {
      icon: LogOut,
      label: 'تسجيل الخروج',
      color: 'var(--color-red)',
      action: () => navigate('/auth/login'),
    },
  ];

  return (
    <div className="mobile-screen" dir="rtl">
      <div className="mobile-content">
        <div className="px-4">
          {/* Header */}
          <div className="pt-6 pb-4">
            <h1 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
              الملف الشخصي
            </h1>

            {/* Avatar & Name */}
            <div className="text-center mb-5">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="relative inline-block mb-3"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <User className="w-10 h-10" style={{ color: '#000' }} />
                </div>
                
                <button
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--color-blue)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <Edit2 className="w-4 h-4" style={{ color: 'white' }} />
                </button>
              </motion.div>

              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {user.position}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-2.5 text-center"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div className="text-xl font-bold mb-0.5" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-2 mb-5">
            <InfoCard icon={Mail} label="البريد الإلكتروني" value={user.email} />
            <InfoCard icon={Phone} label="رقم الجوال" value={user.phone} />
            <InfoCard icon={MapPin} label="الموقع" value={user.location} />
            <InfoCard icon={Briefcase} label="تاريخ الانضمام" value={user.joinDate} />
          </div>

          {/* Menu Items */}
          <div className="space-y-2 pb-4">
            {menuItems.map((item) => (
              <MenuItem key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-2"
      style={{ background: 'var(--bg-card)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--bg-input)' }}
      >
        <Icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </div>
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  color,
  action,
}: {
  icon: any;
  label: string;
  color: string;
  action: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={action}
      className="w-full rounded-2xl p-3 flex items-center justify-between"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color }}
        >
          <Icon className="w-5 h-5" style={{ color: '#000' }} />
        </div>

        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
      </div>

      <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
    </motion.button>
  );
}
