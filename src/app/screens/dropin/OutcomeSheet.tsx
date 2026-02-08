import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'motion/react';
import {
  CheckCircle,
  Calendar,
  Clock,
  XCircle,
  ArrowRight,
  User,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export function OutcomeSheet() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { currentVisit, isOnline } = useApp();

  if (!currentVisit) {
    navigate('/app/home');
    return null;
  }

  const outcomes = [
    {
      id: 'deal',
      label: 'تم الاتفاق',
      description: 'صفقة مؤكدة ومضمونة',
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      bg: 'var(--success-soft)',
      border: '#BBF7D0',
      iconColor: 'var(--status-success)',
      path: `/dropin/services/${visitId}`,
    },
    {
      id: 'appointment',
      label: 'حجز موعد',
      description: 'جدولة موعد قادم',
      icon: Calendar,
      gradient: 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))',
      bg: 'var(--brand-soft)',
      border: 'var(--brand-primary-200)',
      iconColor: 'var(--brand-primary-600)',
      path: `/dropin/appointment/${visitId}`,
    },
    {
      id: 'busy',
      label: 'مشغول / لاحقاً',
      description: 'تحديد موعد متابعة',
      icon: Clock,
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      bg: 'var(--warning-soft)',
      border: '#FDE68A',
      iconColor: 'var(--status-warning)',
      path: `/dropin/followup/${visitId}`,
    },
    {
      id: 'rejected',
      label: 'رفض',
      description: 'لا يرغب بالخدمة حالياً',
      icon: XCircle,
      gradient: 'linear-gradient(135deg, #6B7280, #4B5563)',
      bg: 'var(--neutral-100)',
      border: 'var(--neutral-300)',
      iconColor: 'var(--neutral-600)',
      path: `/dropin/reject/${visitId}`,
    },
  ];

  const handleOutcomeSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
      {/* Top Bar */}
      <div 
        className="px-4 py-3 flex items-center justify-between shadow-lg relative z-10"
        style={{ background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))' }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/dropin/in-progress/${visitId}`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowRight className="size-6 text-white" />
          </motion.button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <div className="size-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="size-5 text-white" />
            </div>
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-white font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
          نتيجة الزيارة
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-6">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl flex items-start gap-3"
          style={{ 
            background: 'var(--status-info-light)',
            border: '1px solid #BFDBFE',
          }}
        >
          <Sparkles className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-info)' }} />
          <p className="text-sm leading-relaxed" style={{ color: '#1E40AF' }}>
            اختر نتيجة الزيارة المناسبة لإكمال العملية وتحديث حالة العميل
          </p>
        </motion.div>

        {/* Outcome Cards */}
        {outcomes.map((outcome, index) => (
          <motion.button
            key={outcome.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOutcomeSelect(outcome.path)}
            className="w-full rounded-2xl p-5 shadow-md transition-all"
            style={{ 
              background: outcome.bg,
              border: `2px solid ${outcome.border}`,
            }}
          >
            <div className="flex items-center gap-4">
              {/* Icon with Gradient Background */}
              <div
                className="size-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ 
                  background: outcome.gradient,
                }}
              >
                <outcome.icon className="size-8 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Text Content */}
              <div className="flex-1 text-right">
                <h3 className="font-bold mb-1" style={{ 
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--text-primary)',
                }}>
                  {outcome.label}
                </h3>
                <p style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                }}>
                  {outcome.description}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="size-10 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ 
                     background: 'var(--bg-surface)',
                     border: '1px solid var(--border-light)',
                   }}>
                <ArrowRight className="size-5" style={{ color: outcome.iconColor }} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
