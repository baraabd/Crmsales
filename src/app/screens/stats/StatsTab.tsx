/**
 * Stats Tab - Modern Jibble Style
 * Features:
 * - Interactive charts
 * - Performance metrics
 * - Clean design
 */

import { useApp } from '../../contexts/AppContext';
import { motion } from 'motion/react';
import { BarChart3, Target, TrendingUp, Clock, AlertCircle, MapPin, Award, Zap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';

export function StatsTab() {
  const { visits, accounts } = useApp();
  const navigate = useNavigate();

  // Calculate stats
  const target = 50;
  const achieved = visits.length;
  const remaining = target - achieved;
  const percentage = Math.min(Math.round((achieved / target) * 100), 100);

  const dealsCount = visits.filter((v) => v.outcome === 'deal').length;
  const appointmentsCount = visits.filter((v) => v.outcome === 'appointment').length;
  const rejectedCount = visits.filter((v) => v.outcome === 'rejected').length;

  const avgDuration = visits.length > 0
    ? Math.round(visits.reduce((sum, v) => sum + (v.duration || 0), 0) / visits.length)
    : 0;

  const isSlowPerformance = achieved < target * 0.5;

  // Nearby leads for suggestion
  const nearbyLeads = accounts.filter((a) => a.lifecycle === 'warm').slice(0, 3);

  return (
    <div className="h-full flex flex-col bg-[#F7F8FA] overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#F97316]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111827]">الإحصائيات</h1>
            <p className="text-sm text-[#6B7280]">مؤشرات الأداء الرئيسية</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Performance Alert */}
        {isSlowPerformance && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFF7E6] border border-[#F59E0B] rounded-[18px] p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#92400E] mb-1">أنت متأخر عن الهدف</h3>
                <p className="text-sm text-[#78350F] mb-3">
                  لديك {remaining} زيارة متبقية. استمر في العمل للوصول إلى الهدف!
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/app/home')}
                  className="text-sm font-semibold text-[#F59E0B] hover:underline"
                >
                  ابدأ الزيارات الآن ←
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-[22px] p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm opacity-90 mb-1">هدف الشهر</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{achieved}</span>
                <span className="text-xl opacity-80">/ {target}</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-white/20 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute inset-y-0 right-0 bg-white rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">{percentage}% مكتمل</span>
            <span className="opacity-90">{remaining} متبقي</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Deals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[18px] p-4 shadow-sm border border-[#E5E7EB]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7EE] flex items-center justify-center">
                <Award className="w-5 h-5 text-[#16A34A]" />
              </div>
              <span className="text-2xl font-bold text-[#111827]">{dealsCount}</span>
            </div>
            <h4 className="text-sm font-semibold text-[#6B7280]">صفقات</h4>
          </motion.div>

          {/* Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-[18px] p-4 shadow-sm border border-[#E5E7EB]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <span className="text-2xl font-bold text-[#111827]">{appointmentsCount}</span>
            </div>
            <h4 className="text-sm font-semibold text-[#6B7280]">مواعيد</h4>
          </motion.div>

          {/* Avg Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[18px] p-4 shadow-sm border border-[#E5E7EB]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7E6] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <span className="text-2xl font-bold text-[#111827]">{avgDuration}</span>
            </div>
            <h4 className="text-sm font-semibold text-[#6B7280]">دقيقة/زيارة</h4>
          </motion.div>

          {/* Rejected */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-[18px] p-4 shadow-sm border border-[#E5E7EB]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center">
                <X className="w-5 h-5 text-[#EF4444]" />
              </div>
              <span className="text-2xl font-bold text-[#111827]">{rejectedCount}</span>
            </div>
            <h4 className="text-sm font-semibold text-[#6B7280]">رفض</h4>
          </motion.div>
        </div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#F97316]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">نظرة عامة</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
              <span className="text-sm text-[#6B7280]">معدل النجاح</span>
              <span className="text-sm font-bold text-[#111827]">
                {visits.length > 0 ? Math.round((dealsCount / visits.length) * 100) : 0}%
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
              <span className="text-sm text-[#6B7280]">إجمالي الزيارات</span>
              <span className="text-sm font-bold text-[#111827]">{visits.length}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#6B7280]">العملاء المحتملون</span>
              <span className="text-sm font-bold text-[#111827]">
                {accounts.filter((a) => a.lifecycle === 'warm').length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Nearby Leads Suggestion */}
        {nearbyLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#111827]">فرص قريبة</h3>
                <p className="text-sm text-[#6B7280]">عملاء محتملون في منطقتك</p>
              </div>
            </div>

            <div className="space-y-2">
              {nearbyLeads.map((lead) => (
                <motion.button
                  key={lead.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/app/leads/${lead.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors text-right"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFF7E6] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#111827]">{lead.name}</p>
                    {lead.address && (
                      <p className="text-xs text-[#6B7280]">{lead.address}</p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-[#9CA3AF]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {visits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-[#FFF2E8] flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-[#F97316]" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">لا توجد بيانات بعد</h3>
            <p className="text-[#6B7280] mb-6 text-center">
              ابدأ زياراتك لرؤية إحصائياتك هنا
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/app/home')}
              className="h-[48px] px-6 rounded-[16px] bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold shadow-sm"
            >
              ابدأ الآن
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Missing X icon component
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
