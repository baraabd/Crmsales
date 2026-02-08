/**
 * BottomNav - Fixed Mobile Version
 */

import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import {
  Home,
  Calendar,
  Users,
  User,
  MapPin,
} from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
      path: '/app/home-new',
      color: 'var(--color-primary)',
    },
    {
      id: 'calendar',
      label: 'المواعيد',
      icon: Calendar,
      path: '/app/calendar-new',
      color: 'var(--color-blue)',
    },
    {
      id: 'map',
      label: 'الخريطة',
      icon: MapPin,
      path: '/app/map-new',
      color: 'var(--color-orange)',
      isCenter: true,
    },
    {
      id: 'leads',
      label: 'العملاء',
      icon: Users,
      path: '/app/leads-new',
      color: 'var(--color-purple)',
    },
    {
      id: 'profile',
      label: 'الحساب',
      icon: User,
      path: '/app/profile-new',
      color: 'var(--color-cyan)',
    },
  ];

  const currentPath = location.pathname;
  const activeTab = tabs.find(tab => currentPath.includes(tab.path.replace('-new', '')));

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        height: 'calc(var(--bottom-nav-height) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
      }}
      dir="rtl"
    >
      {/* Background with blur */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)',
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab?.id === tab.id;

          if (tab.isCenter) {
            // Center FAB
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(tab.path)}
                className="relative -mt-6"
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: isActive ? tab.color : 'var(--color-primary)',
                    boxShadow: 'var(--shadow-button)',
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: '#000' }} />
                </div>
              </motion.button>
            );
          }

          // Regular tabs
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all relative min-w-0"
              style={{
                background: isActive ? `${tab.color}15` : 'transparent',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                style={{
                  color: isActive ? tab.color : 'var(--text-tertiary)',
                  strokeWidth: isActive ? 2.5 : 2,
                }}
              />
              <span
                className="text-[10px] font-medium truncate max-w-full"
                style={{
                  color: isActive ? tab.color : 'var(--text-tertiary)',
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
