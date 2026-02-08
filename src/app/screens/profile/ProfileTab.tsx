/**
 * Profile Tab - Modern Jibble Style
 * Features:
 * - Clean profile design
 * - Orange accents
 * - Quick actions
 */

import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Building,
  Settings,
  HelpCircle,
  LogOut,
  Clock,
  RefreshCw,
  ChevronLeft,
  Shield,
  Bell,
} from 'lucide-react';

export function ProfileTab() {
  const { user, logout, isOnline, outbox } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const quickActions = [
    { icon: Clock, label: 'سجل الدوام', path: '/app/timesheet', color: 'text-[#F97316]', bg: 'bg-[#FFF2E8]' },
    { icon: RefreshCw, label: 'حالة المزامنة', path: '/app/sync-status', color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]', badge: outbox.length },
    { icon: Settings, label: 'الإعدادات', path: '/app/settings', color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]' },
    { icon: HelpCircle, label: 'المساعدة', path: '/app/help', color: 'text-[#10B981]', bg: 'bg-[#EAF7EE]' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F7F8FA] overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#F97316] to-[#EA580C] p-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || 'مندوب'}</h1>
            <p className="text-[#FFF2E8] text-sm mt-1">{user?.employeeId || 'EMP-000'}</p>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Online Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between px-4 py-3 rounded-[16px] ${
            isOnline ? 'bg-[#EAF7EE]' : 'bg-[#FFF7E6]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
              }`}
            />
            <span className={`text-sm font-semibold ${
              isOnline ? 'text-[#065F46]' : 'text-[#92400E]'
            }`}>
              {isOnline ? 'متصل بالإنترنت' : 'غير متصل'}
            </span>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
        >
          <h3 className="font-bold text-[#111827] mb-4">معلومات الحساب</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#6B7280]">
              <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#9CA3AF]">البريد الإلكتروني</p>
                <p className="text-sm font-semibold text-[#111827]">{user?.email || 'لا يوجد'}</p>
              </div>
            </div>
            {user?.company && (
              <div className="flex items-center gap-3 text-[#6B7280]">
                <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#9CA3AF]">الشركة</p>
                  <p className="text-sm font-semibold text-[#111827]">{user?.company}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-[#6B7280]">
              <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#9CA3AF]">الرقم الوظيفي</p>
                <p className="text-sm font-semibold text-[#111827]">{user?.employeeId || 'لا يوجد'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
        >
          <h3 className="font-bold text-[#111827] mb-4">إجراءات سريعة</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center justify-between p-3 rounded-[14px] hover:bg-[#F9FAFB] transition-colors text-right"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="font-semibold text-[#111827]">{action.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {action.badge !== undefined && action.badge > 0 && (
                    <span className="px-2 py-0.5 bg-[#EF4444] text-white text-xs font-bold rounded-full">
                      {action.badge}
                    </span>
                  )}
                  <ChevronLeft className="w-5 h-5 text-[#9CA3AF]" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
        >
          <h3 className="font-bold text-[#111827] mb-4">التفضيلات</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-[14px] hover:bg-[#F9FAFB] transition-colors text-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <span className="font-semibold text-[#111827]">الإشعارات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-[#F97316] rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-[16px] bg-white hover:bg-[#FEF2F2] text-[#EF4444] font-semibold shadow-sm border border-[#E5E7EB] hover:border-[#FCA5A5] transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </motion.button>

        {/* App Version */}
        <div className="text-center text-xs text-[#9CA3AF] pt-2 pb-4">
          <p>Field CRM v1.0.0</p>
          <p className="mt-1">© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
