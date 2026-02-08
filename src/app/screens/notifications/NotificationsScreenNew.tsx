/**
 * NotificationsScreenNew - Fixed Mobile Layout
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Users,
  Package,
  Trash2,
  Calendar,
  TrendingUp,
} from 'lucide-react';

export function NotificationsScreenNew() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'success',
      title: 'تم إتمام الزيارة',
      message: 'تم إتمام زيارة محمد أحمد بنجاح',
      time: 'منذ 5 دقائق',
      read: false,
      icon: CheckCircle2,
      color: 'var(--color-primary)',
    },
    {
      id: '2',
      type: 'warning',
      title: 'موعد قريب',
      message: 'لديك موعد مع فاطمة علي بعد 30 دقيقة',
      time: 'منذ 10 دقائق',
      read: false,
      icon: Calendar,
      color: 'var(--color-orange)',
    },
    {
      id: '3',
      type: 'info',
      title: 'تحديث جديد',
      message: 'تم إضافة 3 عملاء جدد إلى قائمتك',
      time: 'منذ ساعة',
      read: false,
      icon: Users,
      color: 'var(--color-blue)',
    },
    {
      id: '4',
      type: 'success',
      title: 'هدف محقق',
      message: 'تهانينا! حققت هدف المبيعات الشهري',
      time: 'منذ ساعتين',
      read: true,
      icon: TrendingUp,
      color: 'var(--color-primary)',
    },
    {
      id: '5',
      type: 'info',
      title: 'منتجات جديدة',
      message: 'تم إضافة 5 منتجات جديدة إلى الكتالوج',
      time: 'أمس',
      read: true,
      icon: Package,
      color: 'var(--color-purple)',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="mobile-screen" dir="rtl">
      <div className="mobile-content">
        <div className="px-4">
          {/* Header */}
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  الإشعارات
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {unreadCount} إشعار غير مقروء
                  </p>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--color-primary)',
                  }}
                >
                  تعليم الكل
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <StatCard
                icon={Bell}
                label="الكل"
                value={notifications.length.toString()}
                color="var(--color-primary)"
              />
              <StatCard
                icon={AlertCircle}
                label="غير مقروء"
                value={unreadCount.toString()}
                color="var(--color-orange)"
              />
              <StatCard
                icon={CheckCircle2}
                label="مقروء"
                value={(notifications.length - unreadCount).toString()}
                color="var(--color-blue)"
              />
            </div>
          </div>

          {/* Notifications List */}
          <div className="pb-4">
            {notifications.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    {...notification}
                    onDelete={() => deleteNotification(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-2.5 flex flex-col items-center"
      style={{ background: 'var(--bg-card)' }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-1.5"
        style={{ background: color }}
      >
        <Icon className="w-4 h-4" style={{ color: '#000' }} />
      </div>
      <div className="text-base font-bold mb-0.5" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </div>
  );
}

function NotificationCard({
  icon: Icon,
  title,
  message,
  time,
  read,
  color,
  onDelete,
}: {
  icon: any;
  title: string;
  message: string;
  time: string;
  read: boolean;
  color: string;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="rounded-2xl p-3 relative"
      style={{
        background: 'var(--bg-card)',
        opacity: read ? 0.6 : 1,
      }}
    >
      {/* Unread Indicator */}
      {!read && (
        <div
          className="absolute top-3 left-3 w-2 h-2 rounded-full"
          style={{ background: color }}
        />
      )}

      <div className="flex items-start gap-2">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: color }}
        >
          <Icon className="w-5 h-5" style={{ color: '#000' }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h4>
          <p className="text-xs mb-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            {time}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-input)' }}
        >
          <Trash2 className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: 'var(--bg-card)' }}
      >
        <Bell className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        لا توجد إشعارات
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        ستظهر هنا جميع الإشعارات والتحديثات
      </p>
    </div>
  );
}
