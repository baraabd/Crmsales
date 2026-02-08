/**
 * Home Dashboard - Jibble Style
 * Purple gradients, dramatic shadows, vibrant cards
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import {
  Text,
  Card,
  Button,
  StatsCard,
  LeadCard,
  TopBar,
  TopBarIconButton,
  Banner,
  EmptyState,
} from '../../../design-system';
import { cn, formatRelativeTime } from '../../../design-system/utils';

const BellIcon = ({ badge }: { badge?: number }) => (
  <div className="relative">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    {badge && badge > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 gradient-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-primary">
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

const icons = {
  trending: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  check: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  chevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient: string;
  onClick: () => void;
}

function QuickAction({ icon, label, description, gradient, onClick }: QuickActionProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="w-full text-right"
    >
      <Card variant="elevated" padding="md" interactive className="hover:shadow-xl">
        <div className="flex items-center gap-4">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg', gradient)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <Text variant="titleMedium" weight="bold">
              {label}
            </Text>
            <Text variant="bodySmall" color="secondary">
              {description}
            </Text>
          </div>
          {icons.chevronRight()}
        </div>
      </Card>
    </motion.button>
  );
}

export function HomeDashboardJibble() {
  const navigate = useNavigate();
  const { accounts, isOnline } = useApp();

  const todayStats = {
    visits: 5,
    visitsTrend: { value: 12, isPositive: true },
    newLeads: 3,
    newLeadsTrend: { value: 8, isPositive: true },
    deals: 2,
    dealsTrend: { value: 5, isPositive: false },
    appointments: 4,
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-primary-50)] via-white to-[var(--brand-secondary-50)] pb-20" dir="rtl">
      {/* Top Bar */}
      <TopBar
        title="الرئيسية"
        variant="elevated"
        leftContent={
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/app/profile')}
            className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold shadow-primary"
          >
            م
          </motion.button>
        }
        rightContent={
          <>
            <TopBarIconButton
              icon={<MapIcon />}
              onClick={() => navigate('/app/home/map')}
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

      {!isOnline && (
        <div className="px-4 pt-4">
          <Banner variant="offline" message="وضع عدم الاتصال" size="sm" />
        </div>
      )}

      <div className="p-5 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Text variant="displaySmall" weight="bold" className="text-gradient-primary mb-2">
            {getGreeting()} 👋
          </Text>
          <Text variant="bodyLarge" color="secondary">
            لديك {todaysLeads.length} عملاء للزيارة اليوم
          </Text>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Text variant="titleLarge" weight="bold">
            إحصائيات اليوم 📊
          </Text>
          
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              label="الزيارات"
              value={todayStats.visits}
              trend={todayStats.visitsTrend}
              icon={icons.users()}
              color="brand"
              size="sm"
            />
            <StatsCard
              label="عملاء جدد"
              value={todayStats.newLeads}
              trend={todayStats.newLeadsTrend}
              icon={icons.trending()}
              color="success"
              size="sm"
            />
            <StatsCard
              label="صفقات"
              value={todayStats.deals}
              trend={todayStats.dealsTrend}
              icon={icons.check()}
              color="warning"
              size="sm"
            />
            <StatsCard
              label="مواعيد"
              value={todayStats.appointments}
              icon={icons.calendar()}
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
          className="space-y-4"
        >
          <Text variant="titleLarge" weight="bold">
            إجراءات سريعة ⚡
          </Text>
          
          <div className="space-y-3">
            <QuickAction
              icon={<MapIcon />}
              label="عرض الخريطة"
              description="تصفح جميع العملاء"
              gradient="gradient-primary"
              onClick={() => navigate('/app/home/map')}
            />
            <QuickAction
              icon={icons.users()}
              label="إضافة عميل"
              description="عميل محتمل جديد"
              gradient="bg-gradient-to-br from-[#10B981] to-[#059669]"
              onClick={() => navigate('/app/leads/new')}
            />
            <QuickAction
              icon={icons.calendar()}
              label="جدولة موعد"
              description="تحديد موعد"
              gradient="bg-gradient-to-br from-[#F59E0B] to-[#D97706]"
              onClick={() => navigate('/app/calendar')}
            />
          </div>
        </motion.div>

        {/* Today's Leads */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Text variant="titleLarge" weight="bold">
              زيارات اليوم 📍
            </Text>
            <button
              onClick={() => navigate('/app/home/map')}
              className="text-[var(--brand-primary-600)] hover:text-[var(--brand-primary-700)]"
            >
              <Text variant="bodyMedium" weight="bold">
                عرض الكل
              </Text>
            </button>
          </div>

          {todaysLeads.length === 0 ? (
            <Card variant="elevated" padding="lg">
              <EmptyState
                icon={icons.calendar()}
                title="لا توجد زيارات"
                description="ابدأ بإضافة عملاء"
                size="sm"
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
      </div>
    </div>
  );
}
