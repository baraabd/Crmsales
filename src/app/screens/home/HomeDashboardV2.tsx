/**
 * Home Dashboard V2 - الشاشة الرئيسية
 * Hybrid Pipeline Implementation - UX/UI 2026
 * مع Clock-In/Out, Territory Map, Today's Agenda
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useSync } from '../../contexts/SyncContext';
import { Button, Card, Text, Badge } from '../../../design-system';
import { StatusBar } from '../../../design-system/components/feedback/StatusBar';
import { cn } from '../../../design-system/utils';

// Icons
const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const NavigationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface Task {
  id: string;
  type: 'task' | 'appointment';
  title: string;
  customer: string;
  time: string;
  status: 'pending' | 'completed';
  priority?: 'high' | 'normal';
}

interface Party {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance: string;
  lastVisit?: string;
  status: 'lead' | 'prospect' | 'customer';
}

export default function HomeDashboardV2() {
  const navigate = useNavigate();
  const { user, workStatus, setWorkStatus, todayStats } = useApp();
  const { connectionStatus, lastSyncTime, outboxCount, conflictCount } = useSync();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  // تحديث الوقت كل ثانية
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // بيانات تجريبية
  const todayTasks: Task[] = [
    {
      id: '1',
      type: 'task',
      title: 'متابعة مع العميل',
      customer: 'شركة التقنية المتقدمة',
      time: '10:00 ص',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      type: 'appointment',
      title: 'عرض تجريبي',
      customer: 'مؤسسة ألفا التجارية',
      time: '1:00 م',
      status: 'pending'
    },
    {
      id: '3',
      type: 'task',
      title: 'مكالمة هاتفية',
      customer: 'متجر بيتا',
      time: '3:30 م',
      status: 'completed'
    }
  ];

  const nearbyParties: Party[] = [
    {
      id: 'p1',
      name: 'شركة التقنية المتقدمة',
      address: 'شارع الملك فهد، الرياض',
      phone: '+966 50 123 4567',
      lat: 24.7136,
      lng: 46.6753,
      distance: '500 م',
      lastVisit: '3 أيام',
      status: 'lead'
    },
    {
      id: 'p2',
      name: 'مؤسسة ألفا التجارية',
      address: 'طريق الملك عبدالله، جدة',
      phone: '+966 50 234 5678',
      lat: 24.7200,
      lng: 46.6800,
      distance: '1.2 كم',
      status: 'prospect'
    },
    {
      id: 'p3',
      name: 'متجر بيتا الإلكتروني',
      address: 'حي النخيل، الدمام',
      phone: '+966 50 345 6789',
      lat: 24.7100,
      lng: 46.6700,
      distance: '2.5 كم',
      lastVisit: 'أسبوع',
      status: 'customer'
    }
  ];

  const handleClockIn = () => {
    if (workStatus === 'offDuty') {
      setWorkStatus('clockedIn');
    } else if (workStatus === 'clockedIn') {
      setWorkStatus('offDuty');
    }
  };

  const handleStartVisit = (party: Party) => {
    if (workStatus !== 'clockedIn') {
      alert('يجب تسجيل الحضور أولاً قبل بدء الزيارة');
      return;
    }
    navigate(`/dropin/checkin-new/${party.id}`);
  };

  const canStartVisit = workStatus === 'clockedIn';
  const isWorking = workStatus === 'clockedIn' || workStatus === 'break';

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

      {/* Main Content */}
      <div className="pb-20">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[var(--brand-primary-500)] to-[var(--brand-primary-600)] px-5 pt-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Greeting */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Text variant="body" className="text-white/80 mb-1">
                  {currentTime.getHours() < 12 ? 'صباح الخير' : 
                   currentTime.getHours() < 18 ? 'مساء الخير' : 'مساء الخير'}
                </Text>
                <Text variant="h2" className="text-white font-bold">
                  {user?.name || 'أحمد المندوب'}
                </Text>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2">
                <Text variant="caption" className="text-white/60">
                  الوقت الحالي
                </Text>
                <Text variant="body" className="text-white font-semibold">
                  {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
            </div>

            {/* Clock In/Out Button */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                variant={workStatus === 'clockedIn' ? 'secondary' : 'primary'}
                size="lg"
                onClick={handleClockIn}
                className={cn(
                  'w-full h-16 text-lg font-bold shadow-lg',
                  workStatus === 'clockedIn' 
                    ? 'bg-white text-[var(--brand-primary-600)] hover:bg-white/90'
                    : 'bg-white text-[var(--brand-primary-600)] hover:bg-white/90'
                )}
              >
                <ClockIcon />
                <span>
                  {workStatus === 'clockedIn' ? 'إنهاء يوم العمل' : 'بدء يوم العمل'}
                </span>
              </Button>
            </motion.div>

            {!canStartVisit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 text-center"
              >
                <Text variant="caption" className="text-white/70">
                  ⚠️ يجب تسجيل الحضور لبدء الزيارات
                </Text>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Stats Quick View */}
        {isWorking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 -mt-4 mb-5"
          >
            <Card className="bg-white shadow-lg">
              <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[var(--border-light)]">
                <div className="text-center py-3">
                  <Text variant="h3" className="text-[var(--brand-primary-600)] font-bold">
                    {todayStats?.visits || 0}
                  </Text>
                  <Text variant="caption" className="text-[var(--text-secondary)]">
                    زيارات اليوم
                  </Text>
                </div>
                <div className="text-center py-3">
                  <Text variant="h3" className="text-[var(--status-success)] font-bold">
                    {todayStats?.tasks || 0}
                  </Text>
                  <Text variant="caption" className="text-[var(--text-secondary)]">
                    مهام منجزة
                  </Text>
                </div>
                <div className="text-center py-3">
                  <Text variant="h3" className="text-[var(--status-info)] font-bold">
                    {todayTasks.filter(t => t.status === 'pending').length}
                  </Text>
                  <Text variant="caption" className="text-[var(--text-secondary)]">
                    مهام قادمة
                  </Text>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Territory Map View */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Text variant="h3" className="font-bold">
              🗺️ العملاء القريبون
            </Text>
            <button
              onClick={() => navigate('/app/home')}
              className="text-[var(--brand-primary-600)] text-sm font-semibold flex items-center gap-1"
            >
              <span>عرض الخريطة</span>
              <NavigationIcon />
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {nearbyParties.map((party, index) => (
                <motion.div
                  key={party.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={cn(
                      'hover:shadow-md transition-shadow cursor-pointer',
                      !canStartVisit && 'opacity-50'
                    )}
                    onClick={() => canStartVisit && setSelectedParty(party)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--brand-soft)] flex items-center justify-center flex-shrink-0">
                        <MapPinIcon />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <Text variant="body" className="font-semibold">
                            {party.name}
                          </Text>
                          <Badge 
                            variant={
                              party.status === 'customer' ? 'success' :
                              party.status === 'prospect' ? 'info' : 'default'
                            }
                            size="sm"
                          >
                            {party.status === 'customer' ? 'عميل' :
                             party.status === 'prospect' ? 'محتمل' : 'جديد'}
                          </Badge>
                        </div>
                        
                        <Text variant="caption" className="text-[var(--text-secondary)] block mb-2">
                          {party.address}
                        </Text>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-[var(--text-tertiary)]">
                            📍 {party.distance}
                          </span>
                          {party.lastVisit && (
                            <span className="text-[var(--text-tertiary)]">
                              آخر زيارة: {party.lastVisit}
                            </span>
                          )}
                        </div>
                      </div>

                      {canStartVisit && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartVisit(party);
                          }}
                          className="flex-shrink-0"
                        >
                          بدء زيارة
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Today's Agenda */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Text variant="h3" className="font-bold">
              📅 جدول اليوم
            </Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              {todayTasks.length} مهام ({todayTasks.filter(t => t.status === 'pending').length} معلقة)
            </Text>
          </div>

          <div className="space-y-3">
            {todayTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={cn(
                    task.status === 'completed' && 'opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {task.type === 'appointment' ? (
                      <div className="w-10 h-10 rounded-full bg-[var(--status-info-light)] flex items-center justify-center flex-shrink-0">
                        <CalendarIcon />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--status-warning-light)] flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Text variant="body" className="font-semibold">
                          {task.title}
                        </Text>
                        {task.priority === 'high' && (
                          <Badge variant="error" size="sm">عاجل</Badge>
                        )}
                      </div>
                      <Text variant="caption" className="text-[var(--text-secondary)]">
                        {task.customer}
                      </Text>
                    </div>

                    <div className="text-left flex-shrink-0">
                      <Text variant="caption" className="text-[var(--text-secondary)] block mb-1">
                        {task.time}
                      </Text>
                      {task.status === 'completed' && (
                        <Badge variant="success" size="sm">مكتمل</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - will be added in MainLayout */}
    </div>
  );
}
