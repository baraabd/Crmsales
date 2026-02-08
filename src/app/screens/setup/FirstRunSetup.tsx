/**
 * First Run Setup - Matching new dark design
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Map, Package, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';

export function FirstRunSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [locationPermission, setLocationPermission] = useState(false);
  const [mapDownload, setMapDownload] = useState(false);
  const [catalogDownload, setCatalogDownload] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLocationPermission = async () => {
    setLoading(true);
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (permission.state === 'granted' || permission.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermission(true);
            toast.success('تم تفعيل الموقع بنجاح');
            setStep(2);
          },
          () => {
            toast.error('فشل الحصول على إذن الموقع');
          }
        );
      }
    } catch (error) {
      setTimeout(() => {
        setLocationPermission(true);
        toast.success('تم تفعيل الموقع بنجاح');
        setStep(2);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleMapDownload = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMapDownload(true);
    toast.success('تم تنزيل الخريطة');
    setStep(3);
    setLoading(false);
  };

  const handleCatalogDownload = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCatalogDownload(true);
    toast.success('تم تنزيل كتالوج الخدمات');
    
    localStorage.setItem('setupCompleted', 'true');
    setLoading(false);
    
    setTimeout(() => {
      navigate('/app/home-new');
    }, 500);
  };

  const steps = [
    {
      id: 1,
      title: 'تفعيل الموقع',
      description: 'نحتاج إلى موقعك للوصول إلى العملاء القريبين',
      icon: MapPin,
      action: handleLocationPermission,
      buttonText: 'تفعيل الموقع',
      completed: locationPermission,
      color: 'var(--color-primary)',
    },
    {
      id: 2,
      title: 'تنزيل الخريطة',
      description: 'تنزيل بيانات الخريطة للعمل بدون إنترنت (25 MB)',
      icon: Map,
      action: handleMapDownload,
      buttonText: 'تنزيل الآن',
      completed: mapDownload,
      color: 'var(--color-blue)',
    },
    {
      id: 3,
      title: 'كتالوج الخدمات',
      description: 'تنزيل قائمة الخدمات والمنتجات (10 MB)',
      icon: Package,
      action: handleCatalogDownload,
      buttonText: 'تنزيل الكتالوج',
      completed: catalogDownload,
      color: 'var(--color-orange)',
    },
  ];

  const currentStep = steps.find(s => s.id === step)!;

  return (
    <div
      className="min-h-screen flex flex-col justify-center p-6"
      style={{ background: 'var(--bg-app)' }}
      dir="rtl"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            إعداد أولي
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            خطوة {step} من {steps.length}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <motion.div
                animate={{
                  background: s.completed 
                    ? 'var(--color-primary)' 
                    : s.id === step 
                    ? s.color 
                    : 'var(--bg-card)',
                  scale: s.id === step ? 1.1 : 1,
                }}
                className="size-10 rounded-full flex items-center justify-center"
                style={{
                  border: s.id === step ? `2px solid ${s.color}` : '2px solid transparent',
                }}
              >
                {s.completed ? (
                  <CheckCircle2 className="size-5" style={{ color: '#000' }} />
                ) : (
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {s.id}
                  </span>
                )}
              </motion.div>
              {i < steps.length - 1 && (
                <div
                  className="w-8 h-0.5 rounded"
                  style={{
                    background: s.completed ? 'var(--color-primary)' : 'var(--bg-card)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl p-6 mb-6"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="size-20 rounded-2xl flex items-center justify-center"
                style={{ background: currentStep.color }}
              >
                <currentStep.icon className="size-10" style={{ color: '#000' }} />
              </motion.div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {currentStep.title}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {currentStep.description}
              </p>
            </div>

            {/* Action Button */}
            <AppButtonV2
              variant="primary"
              size="lg"
              fullWidth
              onClick={currentStep.action}
              loading={loading}
              disabled={loading}
              icon={<Download />}
            >
              {currentStep.buttonText}
            </AppButtonV2>
          </motion.div>
        </AnimatePresence>

        {/* Skip Button */}
        {step < steps.length && (
          <div className="text-center">
            <button
              onClick={() => {
                localStorage.setItem('setupCompleted', 'true');
                navigate('/app/home-new');
              }}
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
              disabled={loading}
            >
              تخطي الآن
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
