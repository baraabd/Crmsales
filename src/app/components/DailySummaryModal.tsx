import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Calendar, Users, TrendingUp } from 'lucide-react';
import { DailySummary } from '../contexts/AppContext';

interface DailySummaryModalProps {
  isOpen: boolean;
  summary: DailySummary | null;
  onClose: () => void;
}

export function DailySummaryModal({ isOpen, summary, onClose }: DailySummaryModalProps) {
  if (!summary) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} ساعة ${minutes} دقيقة`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'var(--bg-overlay)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
          >
            {/* Gradient Header */}
            <div className="p-8 text-white text-center" style={{ 
              background: 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))' 
            }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">أحسنت! 🎉</h2>
              <p className="opacity-90">شكراً على عملك الجاد اليوم</p>
            </div>

            {/* Summary Content */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>إجمالي وقت العمل</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary-600)' }}>
                  {formatTime(summary.totalWorkTime)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: 'linear-gradient(135deg, var(--info-soft), var(--brand-blue-100))' }}
                >
                  <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--brand-blue-500)' }} />
                  <p className="text-2xl font-bold" style={{ color: 'var(--brand-blue-600)' }}>{summary.totalVisits}</p>
                  <p className="text-sm" style={{ color: 'var(--brand-blue-500)' }}>زيارات</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: 'linear-gradient(135deg, var(--success-soft), var(--success-light))' }}
                >
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--status-success)' }} />
                  <p className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>{summary.totalDeals}</p>
                  <p className="text-sm" style={{ color: 'var(--status-success)' }}>صفقات</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: 'linear-gradient(135deg, var(--brand-soft), var(--brand-primary-100))' }}
                >
                  <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--brand-primary-600)' }} />
                  <p className="text-2xl font-bold" style={{ color: 'var(--brand-primary-700)' }}>{summary.totalAppointments}</p>
                  <p className="text-sm" style={{ color: 'var(--brand-primary-600)' }}>مواعيد</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: 'linear-gradient(135deg, var(--warning-soft), var(--status-warning-light))' }}
                >
                  <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--status-warning)' }} />
                  <p className="text-2xl font-bold" style={{ color: 'var(--status-warning)' }}>{summary.totalFollowUps}</p>
                  <p className="text-sm" style={{ color: 'var(--status-warning)' }}>متابعات</p>
                </motion.div>
              </div>

              <div className="pt-4">
                <p className="text-center text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  نراك غداً بنشاط وحماس أكبر! 💪
                </p>
                <button
                  onClick={onClose}
                  className="w-full text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))' }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
