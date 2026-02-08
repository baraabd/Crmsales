import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { motion } from 'motion/react';
import { 
  Clock, 
  Phone, 
  MessageCircle, 
  Navigation, 
  StopCircle, 
  ArrowRight, 
  User, 
  Menu,
  Wifi,
  WifiOff,
  MapPin,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

export function InProgress() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { currentVisit, accounts, isOnline } = useApp();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState('');

  const account = currentVisit
    ? accounts.find((a) => a.id === currentVisit.accountId)
    : null;

  const steps: WizardStep[] = [
    { id: 'checkin', label: 'تسجيل الدخول', description: 'بدأت الزيارة' },
    { id: 'inprogress', label: 'الزيارة جارية', description: 'جمع المعلومات' },
    { id: 'outcome', label: 'النتيجة', description: 'إنهاء الزيارة' },
  ];

  useEffect(() => {
    if (!currentVisit) {
      navigate('/app/home');
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(currentVisit.startTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentVisit, navigate]);

  // Auto-save notes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (notes && currentVisit) {
        localStorage.setItem(`visit-notes-${currentVisit.id}`, notes);
      }
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [notes, currentVisit]);

  const handleEndVisit = () => {
    if (!currentVisit) return;
    navigate(`/dropin/outcome/${currentVisit.id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCall = () => {
    if (account?.phone) {
      window.location.href = `tel:${account.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (account?.phone) {
      // Remove any non-digit characters and add country code if needed
      const cleanPhone = account.phone.replace(/\D/g, '');
      const phoneWithCode = cleanPhone.startsWith('966') ? cleanPhone : `966${cleanPhone.substring(1)}`;
      window.open(`https://wa.me/${phoneWithCode}`, '_blank');
    }
  };

  const handleNavigate = () => {
    if (account?.latitude && account?.longitude) {
      // Open Google Maps with directions
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${account.latitude},${account.longitude}`,
        '_blank'
      );
    }
  };

  if (!currentVisit || !account) {
    return null;
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
          الزيارة جارية
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)' }}>
        <WizardStepper steps={steps} currentStepId="inprogress" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-24">
        {/* Customer Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 shadow-sm"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--brand-soft)' }}>
              <User className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold truncate mb-1" style={{ 
                fontSize: 'var(--font-size-xl)',
                color: 'var(--text-primary)',
              }}>
                {account.name}
              </h2>
              {account.contactPerson && (
                <p className="truncate" style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                }}>
                  {account.contactPerson}
                </p>
              )}
              {account.address && (
                <p className="text-xs truncate flex items-center gap-1 mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  <MapPin className="size-3" />
                  {account.address}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Timer - Main Focus */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-10 text-center shadow-lg text-white"
          style={{ 
            background: 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="size-7 opacity-90" />
            <p className="font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>
              مدة الزيارة
            </p>
          </div>
          <motion.div 
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
            }}
            className="font-mono font-bold mb-6"
            style={{ fontSize: '72px' }}
          >
            {formatTime(elapsedTime)}
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <div className="size-2 bg-white rounded-full animate-pulse" />
            <span>بدأت في {new Date(currentVisit.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 shadow-sm space-y-4"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-base)' }}>
            <Navigation className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
            إجراءات سريعة
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {/* Call Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCall}
              disabled={!account.phone}
              className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{ 
                background: account.phone ? 'linear-gradient(90deg, #10B981, #059669)' : 'var(--interactive-disabled)',
                color: 'white',
              }}
            >
              <Phone className="size-5" />
              اتصال
              {account.phone && (
                <span className="text-xs opacity-80">({account.phone})</span>
              )}
            </motion.button>

            {/* WhatsApp Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsApp}
              disabled={!account.phone}
              className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 text-white"
              style={{ 
                background: account.phone ? 'linear-gradient(90deg, #25D366, #128C7E)' : 'var(--interactive-disabled)',
              }}
            >
              <MessageCircle className="size-5" />
              واتساب
            </motion.button>

            {/* Navigate Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNavigate}
              disabled={!account.latitude || !account.longitude}
              className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 text-white"
              style={{ 
                background: (account.latitude && account.longitude) 
                  ? 'linear-gradient(90deg, #3B82F6, #2563EB)' 
                  : 'var(--interactive-disabled)',
              }}
            >
              <Navigation className="size-5" />
              توجيه
              <ExternalLink className="size-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Notes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 shadow-sm space-y-3"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
            <label htmlFor="notes" className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
              ملاحظات سريعة
            </label>
          </div>
          <Textarea
            id="notes"
            placeholder="أضف ملاحظات مهمة عن الزيارة..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-right"
            style={{ 
              minHeight: '120px',
              fontSize: 'var(--font-size-base)',
              borderRadius: 'var(--input-radius)',
            }}
          />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            يتم حفظ الملاحظات تلقائياً أثناء الكتابة
          </p>
        </motion.div>
      </div>

      {/* End Visit Button - Fixed Bottom */}
      <div 
        className="p-5"
        style={{ 
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-light)',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        }}
      >
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleEndVisit}
            className="w-full font-bold text-white shadow-lg"
            style={{ 
              height: 'var(--button-height-lg)',
              fontSize: 'var(--font-size-lg)',
              borderRadius: 'var(--button-radius)',
              background: 'linear-gradient(90deg, #EF4444, #DC2626)',
            }}
          >
            <StopCircle className="size-6 ml-2" />
            إنهاء الزيارة
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
