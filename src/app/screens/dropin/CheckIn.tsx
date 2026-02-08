import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Clock, 
  ArrowRight, 
  Check, 
  Loader2, 
  User, 
  Wifi, 
  WifiOff, 
  Calendar,
  AlertCircle,
  Info,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

export function CheckIn() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { accounts, startVisit, isOnline, appointments } = useApp();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [timestamp] = useState(new Date());
  const [isStarting, setIsStarting] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [existingAppointment, setExistingAppointment] = useState<any>(null);

  const account = accounts.find((a) => a.id === accountId);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Mock location for demo
        setLocation({ lat: 24.7136, lng: 46.6753 });
      }
    );
  }, []);

  // Check for existing appointment
  useEffect(() => {
    if (account && appointments) {
      const today = new Date();
      const todayAppointment = appointments.find(
        (apt) =>
          apt.accountId === account.id &&
          apt.status !== 'cancelled' &&
          new Date(apt.scheduledDate).toDateString() === today.toDateString()
      );

      if (todayAppointment) {
        setExistingAppointment(todayAppointment);
        setShowAppointmentModal(true);
      }
    }
  }, [account, appointments]);

  const handleStartVisit = async () => {
    if (!location || !account) {
      toast.error('جاري الحصول على الموقع...');
      return;
    }

    setIsStarting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const visit = startVisit(account.id, location.lat, location.lng);
    toast.success('تم بدء الزيارة بنجاح! 🎉');
    navigate(`/dropin/in-progress/${visit.id}`);
  };

  const handleViewAppointment = () => {
    setShowAppointmentModal(false);
    // Here you would navigate to appointment details
    // For now, we'll just proceed with the visit
    handleStartVisit();
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>العميل غير موجود</p>
      </div>
    );
  }

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
            onClick={() => navigate(-1)}
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
          بدء زيارة
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Customer Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 shadow-sm"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--brand-soft)' }}>
              <User className="size-8" style={{ color: 'var(--brand-primary-600)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold mb-2" style={{ 
                fontSize: 'var(--font-size-2xl)',
                color: 'var(--text-primary)',
              }}>
                {account.name}
              </h2>
              {account.contactPerson && (
                <p className="mb-2" style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                }}>
                  {account.contactPerson}
                </p>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant={
                    account.stage === 'lead' ? 'secondary' :
                    account.stage === 'qualified' ? 'default' :
                    account.stage === 'customer' ? 'default' : 'secondary'
                  }
                >
                  {account.stage === 'lead' ? 'عميل محتمل' :
                   account.stage === 'qualified' ? 'مؤهل' :
                   account.stage === 'customer' ? 'عميل' : account.stage}
                </Badge>
                {account.priority && (
                  <Badge variant={account.priority === 'high' ? 'destructive' : 'default'}>
                    {account.priority === 'high' ? 'أولوية عالية' :
                     account.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                  </Badge>
                )}
              </div>
              {account.address && (
                <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <MapPin className="size-4 mt-0.5 flex-shrink-0" />
                  <span>{account.address}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Appointment Notice */}
        {existingAppointment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ 
              background: 'linear-gradient(135deg, var(--status-info-light), var(--brand-soft))',
              border: '2px solid var(--brand-primary-300)',
            }}
          >
            <Calendar className="size-6 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-primary-600)' }} />
            <div className="flex-1">
              <p className="font-bold mb-1" style={{ 
                fontSize: 'var(--font-size-base)',
                color: 'var(--brand-primary-700)',
              }}>
                لديك موعد مسبق مع هذا العميل
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                الموعد: {new Date(existingAppointment.scheduledDate).toLocaleString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              {existingAppointment.notes && (
                <p className="text-xs mb-3 p-2 rounded-lg" style={{ 
                  background: 'white',
                  color: 'var(--text-secondary)',
                }}>
                  "{existingAppointment.notes}"
                </p>
              )}
              <Button
                onClick={handleViewAppointment}
                size="sm"
                className="font-semibold"
                style={{ 
                  background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
                }}
              >
                <Eye className="size-4 ml-1" />
                عرض تفاصيل الموعد
              </Button>
            </div>
          </motion.div>
        )}

        {/* Visit Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 shadow-sm space-y-4"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-lg)' }}>
            <Info className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
            تفاصيل الزيارة
          </h3>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--brand-soft)' }}>
              <MapPin className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                الموقع
              </p>
              {location ? (
                <div className="flex items-center gap-2">
                  <Check className="size-4" style={{ color: 'var(--status-success)' }} />
                  <span className="text-sm" style={{ color: 'var(--status-success)' }}>
                    تم الحصول على الموقع
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" style={{ color: 'var(--brand-primary-600)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    جاري الحصول على الموقع...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--brand-soft)' }}>
              <Clock className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>
                وقت البدء
              </p>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>
                {timestamp.toLocaleTimeString('ar-SA', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Important Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ 
            background: 'var(--warning-soft)',
            border: '1px solid #FDE68A',
          }}
        >
          <AlertCircle className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-warning)' }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: '#92400E' }}>
              تذكير مهم
            </p>
            <p className="text-xs" style={{ color: '#92400E' }}>
              سيتم تسجيل موقعك ووقت بدء الزيارة. تأكد من أنك في موقع العميل.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <div 
        className="p-5 space-y-3"
        style={{ 
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-light)',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        }}
      >
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleStartVisit}
            disabled={!location || isStarting}
            className="w-full font-bold shadow-lg text-white"
            style={{ 
              height: 'var(--button-height-lg)',
              fontSize: 'var(--font-size-lg)',
              borderRadius: 'var(--button-radius)',
              background: location 
                ? 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))'
                : 'var(--interactive-disabled)',
            }}
          >
            {isStarting ? (
              <>
                <Loader2 className="size-6 animate-spin ml-2" />
                جاري البدء...
              </>
            ) : (
              <>
                <Check className="size-6 ml-2" />
                بدء الزيارة
              </>
            )}
          </Button>
        </motion.div>

        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full font-semibold"
          style={{ 
            height: 'var(--button-height-md)',
            fontSize: 'var(--font-size-base)',
            borderRadius: 'var(--button-radius)',
          }}
        >
          إلغاء
        </Button>
      </div>

      {/* Appointment Modal */}
      <AnimatePresence>
        {showAppointmentModal && existingAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAppointmentModal(false)}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background: 'var(--bg-overlay)' }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl p-6"
              style={{ 
                background: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="size-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'var(--brand-soft)' }}>
                  <Calendar className="size-7" style={{ color: 'var(--brand-primary-600)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ fontSize: 'var(--font-size-xl)' }}>
                    موعد مسبق مع العميل
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    تم العثور على موعد مجدول مع هذا العميل اليوم
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl" style={{ background: 'var(--neutral-50)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    موعد الزيارة
                  </p>
                  <p className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                    {new Date(existingAppointment.scheduledDate).toLocaleString('ar-SA', {
                      weekday: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>

                {existingAppointment.purpose && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--neutral-50)' }}>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      الغرض من الزيارة
                    </p>
                    <p className="font-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>
                      {existingAppointment.purpose}
                    </p>
                  </div>
                )}

                {existingAppointment.notes && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--neutral-50)' }}>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      ملاحظات
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {existingAppointment.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleViewAppointment}
                  className="flex-1 font-bold text-white"
                  style={{ 
                    height: 'var(--button-height-md)',
                    borderRadius: 'var(--button-radius)',
                    background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
                  }}
                >
                  <Check className="size-5 ml-2" />
                  بدء الزيارة
                </Button>
                <Button
                  onClick={() => setShowAppointmentModal(false)}
                  variant="outline"
                  className="flex-1 font-semibold"
                  style={{ 
                    height: 'var(--button-height-md)',
                    borderRadius: 'var(--button-radius)',
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
