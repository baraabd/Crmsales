/**
 * Home Dashboard Screen - FieldCRM
 * Modern overview with quick stats and actions
 * UX inspired by: Notion, Linear, Asana
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import {
  Text,
  Card,
  Button,
  Badge,
  StatsCard,
  LeadCard,
  TopBar,
  TopBarIconButton,
  Banner,
  EmptyState,
} from '../../../design-system';
import { cn, formatRelativeTime } from '../../../design-system/utils';

// Icons
const BellIcon = ({ badge }: { badge?: number }) => (
  <div className="relative">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    {badge && badge > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--status-error)] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </div>
);

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Quick Action Card
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color?: 'brand' | 'success' | 'warning';
}

function QuickAction({ icon, label, description, onClick, color = 'brand' }: QuickActionProps) {
  const colors = {
    brand: 'from-[var(--brand-blue-500)] to-[var(--brand-blue-600)]',
    success: 'from-[var(--status-success)] to-[#16A34A]',
    warning: 'from-[var(--status-warning)] to-[#EA580C]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full text-right"
    >
      <Card variant="outlined" padding="md" interactive>
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', colors[color])}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <Text variant="titleMedium" weight="semibold">
              {label}
            </Text>
            <Text variant="captionSmall" color="secondary">
              {description}
            </Text>
          </div>
          <ChevronRightIcon />
        </div>
      </Card>
    </motion.button>
  );
}

export function HomeDashboard() {
  const navigate = useNavigate();
  const { accounts, isOnline } = useApp();

  // Mock stats (in real app, calculate from data)
  const todayStats = {
    visits: 5,
    visitsTrend: { value: 12, isPositive: true },
    newLeads: 3,
    newLeadsTrend: { value: 8, isPositive: true },
    deals: 2,
    dealsTrend: { value: 5, isPositive: false },
    appointments: 4,
  };

  // Get today's leads to visit
  const todaysLeads = accounts.slice(0, 3).map((account) => ({
    id: account.id,
    name: account.name,
    businessName: account.companyName,
    phone: account.phone,
    status: (account.lifecycle === 'customer' ? 'hot' : 
             account.lifecycle === 'warm' ? 'warm' : 
             account.lifecycle === 'cold' ? 'cold' : 'new') as 'hot' | 'warm' | 'cold' | 'new',
    distance: Math.random() * 5000,
    lastContact: formatRelativeTime(new Date(account.lastVisit || Date.now())),
    notesCount: 0,
  }));

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-20" dir="rtl">
      {/* Top Bar */}
      <TopBar
        title="الرئيسية"
        variant="elevated"
        leftContent={
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/app/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-blue-500)] to-[var(--brand-blue-600)] flex items-center justify-center text-white font-bold shadow-md"
          >
            م
          </motion.button>
        }
        rightContent={
          <>
            <TopBarIconButton
              icon={<MapIcon />}
              onClick={() => navigate('/app/map-new')}
              label="الخريطة"
            />
            <TopBarIconButton
              icon={<BellIcon badge={3} />}
              onClick={() => navigate('/app/notifications')}
              label="الإشعارات"
            />
          </>
        }
      />

      {/* Offline Banner */}
      {!isOnline && (
        <div className="px-4 pt-4">
          <Banner
            variant="offline"
            message="أنت تعمل في وضع عدم الاتصال"
            size="sm"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Text variant="displaySmall" weight="bold" className="mb-1">
            {getGreeting()} 👋
          </Text>
          <Text variant="bodyMedium" color="secondary">
            لديك {todaysLeads.length} عملاء للزيارة اليوم
          </Text>
        </motion.div>

        {/* Today's Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Text variant="titleMedium" weight="semibold">
            إحصائيات اليوم
          </Text>
          
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              label="الزيارات"
              value={todayStats.visits}
              trend={todayStats.visitsTrend}
              icon={<UsersIcon />}
              color="brand"
              size="sm"
            />
            <StatsCard
              label="عملاء جدد"
              value={todayStats.newLeads}
              trend={todayStats.newLeadsTrend}
              icon={<TrendingUpIcon />}
              color="success"
              size="sm"
            />
            <StatsCard
              label="صفقات"
              value={todayStats.deals}
              trend={todayStats.dealsTrend}
              icon={<CheckCircleIcon />}
              color="warning"
              size="sm"
            />
            <StatsCard
              label="مواعيد"
              value={todayStats.appointments}
              icon={<CalendarIcon />}
              color="info"
              size="sm"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Text variant="titleMedium" weight="semibold">
            إجراءات سريعة
          </Text>
          
          <div className="space-y-2">
            <QuickAction
              icon={<MapIcon />}
              label="عرض الخريطة"
              description="تصفح جميع العملاء على الخريطة"
              onClick={() => navigate('/app/map-new')}
              color="brand"
            />
            <QuickAction
              icon={<UsersIcon />}
              label="إضافة عميل جديد"
              description="إضافة عميل محتمل جديد"
              onClick={() => navigate('/dropin/identify-new')}
              color="success"
            />
            <QuickAction
              icon={<CalendarIcon />}
              label="جدولة موعد"
              description="تحديد موعد مع عميل"
              onClick={() => navigate('/app/calendar')}
              color="warning"
            />
          </div>
        </motion.div>

        {/* Today's Leads to Visit */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <Text variant="titleMedium" weight="semibold">
              زيارات اليوم
            </Text>
            <button
              onClick={() => navigate('/app/map-new')}
              className="text-[var(--brand-blue-600)] hover:text-[var(--brand-blue-700)]"
            >
              <Text variant="bodySmall" weight="semibold">
                عرض الكل
              </Text>
            </button>
          </div>

          {todaysLeads.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <EmptyState
                icon={<CalendarIcon />}
                title="لا توجد زيارات مجدولة"
                description="ابدأ بإضافة عملاء لزيارتهم اليوم"
                size="sm"
                action={{
                  label: 'إضافة عميل',
                  onClick: () => navigate('/dropin/identify-new'),
                }}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {todaysLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <LeadCard
                    name={lead.name}
                    businessName={lead.businessName}
                    phone={lead.phone}
                    status={lead.status}
                    distance={lead.distance}
                    lastContact={lead.lastContact}
                    notesCount={lead.notesCount}
                    onClick={() => navigate(`/app/leads/${lead.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Text variant="titleMedium" weight="semibold">
            النشاط الأخير
          </Text>

          <Card variant="outlined" padding="none">
            {[
              { action: 'زيارة ميدانية', client: 'شركة الأمل', time: 'منذ ساعتين', icon: <CheckCircleIcon /> },
              { action: 'مكالمة هاتفية', client: 'محل النور', time: 'منذ 4 ساعات', icon: <ClockIcon /> },
              { action: 'موعد محدد', client: 'مؤسسة الفجر', time: 'أمس', icon: <CalendarIcon /> },
            ].map((activity, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-4',
                  index !== 2 && 'border-b border-[var(--border-light)]'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--neutral-slate-100)] flex items-center justify-center text-[var(--text-secondary)]">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <Text variant="bodyMedium" weight="medium">
                    {activity.action}
                  </Text>
                  <Text variant="captionSmall" color="secondary">
                    {activity.client}
                  </Text>
                </div>
                <Text variant="captionSmall" color="tertiary">
                  {activity.time}
                </Text>
              </div>
            ))}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
