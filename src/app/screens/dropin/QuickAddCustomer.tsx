import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  MapPin,
  Camera,
  Loader2,
  Check,
  User,
  Phone,
  Building2,
  FileText,
  Wifi,
  WifiOff,
  Sparkles,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  notes: string;
  photoUrl: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export function QuickAddCustomer() {
  const navigate = useNavigate();
  const { addAccount, canAddData, isOnline } = useApp();
  const [currentStep, setCurrentStep] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    notes: '',
    photoUrl: '',
  });
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const steps: WizardStep[] = [
    { id: 'basic', label: 'المعلومات الأساسية', description: 'بيانات العميل' },
    { id: 'contact', label: 'معلومات الاتصال', description: 'التواصل والموقع' },
    { id: 'additional', label: 'معلومات إضافية', description: 'ملاحظات وصور' },
  ];

  // Redirect if not clocked in
  useEffect(() => {
    if (!canAddData) {
      toast.error('يجب تسجيل الحضور أولاً! ⏰');
      navigate('/app/home');
    }
  }, [canAddData, navigate]);

  // Get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocation({ lat: 24.7136, lng: 46.6753 });
      }
    );
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('quickAddDraft', JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('quickAddDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateStep = (stepId: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (stepId === 'basic') {
      if (!formData.name.trim()) {
        newErrors.name = 'اسم المتجر مطلوب';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'اسم المتجر يجب أن يكون 3 أحرف على الأقل';
      }
    }

    if (stepId === 'contact') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'رقم الهاتف مطلوب';
      } else if (!/^05\d{8}$/.test(formData.phone.trim())) {
        newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
      }

      if (!formData.address.trim()) {
        newErrors.address = 'العنوان مطلوب';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('contact')) {
      toast.error('يرجى تصحيح الأخطاء');
      return;
    }

    if (!location) {
      toast.error('جاري الحصول على الموقع...');
      return;
    }

    setLoading(true);

    try {
      const newAccount = addAccount({
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        latitude: location.lat,
        longitude: location.lng,
        lifecycle: 'prospect',
        pinColor: 'gray',
        photoUrl: formData.photoUrl || undefined,
      });

      // Clear draft
      localStorage.removeItem('quickAddDraft');
      
      toast.success('تم إضافة العميل بنجاح! ✨');
      
      setTimeout(() => {
        navigate(`/dropin/checkin/${newAccount.id}`);
      }, 500);
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة');
      setLoading(false);
    }
  };

  if (!canAddData) {
    return null;
  }

  const isLastStep = currentStep === steps[steps.length - 1].id;

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
            onClick={handleBack}
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
          إضافة عميل جديد
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)' }}>
        <WizardStepper steps={steps} currentStepId={currentStep} />
      </div>

      {/* Location Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 flex items-center justify-between p-4 rounded-xl"
        style={{ 
          background: location ? 'var(--success-soft)' : 'var(--warning-soft)',
          border: location ? '1px solid #BBF7D0' : '1px solid #FDE68A',
        }}
      >
        <div className="flex items-center gap-3">
          {location ? (
            <Check className="size-5" style={{ color: 'var(--status-success)' }} />
          ) : (
            <Loader2 className="size-5 animate-spin" style={{ color: 'var(--status-warning)' }} />
          )}
          <span className="font-semibold" style={{ 
            fontSize: 'var(--font-size-sm)',
            color: location ? '#065F46' : '#92400E',
          }}>
            {location ? 'تم تحديد الموقع' : 'جاري تحديد الموقع...'}
          </span>
        </div>
        <MapPin className="size-5" style={{ color: location ? 'var(--status-success)' : 'var(--status-warning)' }} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl p-5 shadow-sm space-y-4"
                style={{ 
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--card-radius)',
                }}
              >
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="size-10 rounded-xl flex items-center justify-center"
                       style={{ background: 'var(--brand-soft)' }}>
                    <Building2 className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                      معلومات المتجر
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      أدخل اسم المتجر والمسؤول
                    </p>
                  </div>
                </div>

                {/* Store Name */}
                <div>
                  <label className="block font-semibold mb-2" style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}>
                    اسم المتجر <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="مثال: سوبر ماركت النور"
                    className={errors.name ? 'border-red-500' : ''}
                    style={{ 
                      height: 'var(--input-height)',
                      borderRadius: 'var(--input-radius)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 mt-2"
                      style={{ fontSize: 'var(--font-size-xs)', color: 'var(--status-error)' }}
                    >
                      <AlertCircle className="size-3" />
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block font-semibold mb-2" style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}>
                    اسم المسؤول
                  </label>
                  <Input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    placeholder="مثال: أحمد محمد"
                    style={{ 
                      height: 'var(--input-height)',
                      borderRadius: 'var(--input-radius)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  />
                </div>
              </motion.div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl flex items-start gap-3"
                style={{ 
                  background: 'var(--status-info-light)',
                  border: '1px solid #BFDBFE',
                }}
              >
                <Sparkles className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-info)' }} />
                <p className="text-sm leading-relaxed" style={{ color: '#1E40AF' }}>
                  يتم حفظ بياناتك تلقائياً أثناء الكتابة. لن تفقد أي معلومة!
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl p-5 shadow-sm space-y-4"
                style={{ 
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--card-radius)',
                }}
              >
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="size-10 rounded-xl flex items-center justify-center"
                       style={{ background: 'var(--brand-soft)' }}>
                    <Phone className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                      معلومات الاتصال
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      رقم الهاتف والعنوان
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-semibold mb-2" style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}>
                    رقم الهاتف <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="05XXXXXXXX"
                    maxLength={10}
                    className={errors.phone ? 'border-red-500' : ''}
                    style={{ 
                      height: 'var(--input-height)',
                      borderRadius: 'var(--input-radius)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  />
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 mt-2"
                      style={{ fontSize: 'var(--font-size-xs)', color: 'var(--status-error)' }}
                    >
                      <AlertCircle className="size-3" />
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block font-semibold mb-2" style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}>
                    العنوان <span style={{ color: 'var(--status-error)' }}>*</span>
                  </label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="مثال: حي السليمانية، شارع الأمير محمد بن عبدالعزيز"
                    className={errors.address ? 'border-red-500' : ''}
                    style={{ 
                      minHeight: '96px',
                      borderRadius: 'var(--input-radius)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  />
                  {errors.address && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 mt-2"
                      style={{ fontSize: 'var(--font-size-xs)', color: 'var(--status-error)' }}
                    >
                      <AlertCircle className="size-3" />
                      {errors.address}
                    </motion.p>
                  )}
                  <p className="mt-2" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    سيتم ربط الموقع الجغرافي تلقائياً
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Additional Info */}
          {currentStep === 'additional' && (
            <motion.div
              key="additional"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl p-5 shadow-sm space-y-4"
                style={{ 
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--card-radius)',
                }}
              >
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="size-10 rounded-xl flex items-center justify-center"
                       style={{ background: 'var(--brand-soft)' }}>
                    <FileText className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                      معلومات إضافية
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      ملاحظات وصور (اختياري)
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold mb-2" style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}>
                    ملاحظات
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="أي ملاحظات إضافية عن العميل..."
                    style={{ 
                      minHeight: '120px',
                      borderRadius: 'var(--input-radius)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  />
                  <p className="mt-2" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    يتم حفظ الملاحظات تلقائياً أثناء الكتابة
                  </p>
                </div>

                {/* Photo */}
                <div>
                  <label className="block font-semibold mb-2" style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}>
                    صورة المتجر
                  </label>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-3"
                    style={{ 
                      height: '160px',
                      borderColor: 'var(--border-main)',
                      background: 'var(--neutral-50)',
                    }}
                  >
                    <div className="size-14 rounded-full flex items-center justify-center"
                         style={{ background: 'var(--brand-soft)' }}>
                      <Camera className="size-7" style={{ color: 'var(--brand-primary-600)' }} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold" style={{ 
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-primary)',
                      }}>
                        التقط أو ارفع صورة
                      </p>
                      <p style={{ 
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-secondary)',
                      }}>
                        صورة واجهة المتجر (اختياري)
                      </p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Success Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl flex items-start gap-3"
                style={{ 
                  background: 'var(--success-soft)',
                  border: '1px solid #BBF7D0',
                }}
              >
                <Check className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-success)' }} />
                <p className="text-sm leading-relaxed" style={{ color: '#065F46' }}>
                  جاهز للحفظ! سيتم إضافة العميل والانتقال مباشرة لبدء الزيارة.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Actions */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4 space-y-2" 
        dir="rtl"
        style={{ 
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-light)',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
          paddingBottom: 'calc(1rem + var(--safe-area-inset-bottom))',
        }}
      >
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={isLastStep ? handleSubmit : handleNext}
            disabled={loading || !location}
            className="w-full font-bold shadow-lg"
            style={{ 
              height: 'var(--button-height-lg)',
              borderRadius: 'var(--button-radius)',
              fontSize: 'var(--font-size-lg)',
              background: loading || !location
                ? 'var(--interactive-disabled)'
                : 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
            }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span>جاري الحفظ...</span>
              </div>
            ) : isLastStep ? (
              <>
                <Check className="size-6 ml-2" />
                حفظ والمتابعة
              </>
            ) : (
              <>
                التالي
                <ChevronLeft className="size-6 mr-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
