import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { Chip } from '../../components/ui/chip';
import { Textarea } from '../../components/ui/textarea';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CheckCircle,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Wifi,
  WifiOff,
  Sparkles,
  MapPin,
  MessageSquare,
  Edit,
  Send,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

const WEEKDAYS_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

// Mock reasons from admin
const APPOINTMENT_REASONS = [
  'استشارة أولية',
  'مناقشة عرض سعر',
  'متابعة مشروع',
  'عرض منتج جديد',
  'توقيع عقد',
  'دعم فني',
  'تجديد اتفاقية',
];

// Mock edit reasons
const EDIT_REASONS = [
  'ظرف طارئ',
  'موعد آخر مستعجل',
  'طلب العميل',
  'إعادة جدولة',
  'تعارض في المواعيد',
];

export function ScheduleAppointment() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { 
    endVisit, 
    updateAccount, 
    currentVisit, 
    isOnline, 
    accounts,
    appointments,
    addAppointment,
    updateAppointment,
  } = useApp();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [existingAppointment, setExistingAppointment] = useState<any>(null);
  const [editReason, setEditReason] = useState('');

  const account = currentVisit
    ? accounts.find((a) => a.id === currentVisit.accountId)
    : null;

  const steps: WizardStep[] = [
    { id: 'date', label: 'التاريخ', description: 'اختر اليوم' },
    { id: 'time', label: 'الوقت', description: 'حدد الساعة' },
    { id: 'details', label: 'التفاصيل', description: 'السبب والملاحظات' },
    { id: 'confirm', label: 'التأكيد', description: 'مراجعة الموعد' },
  ];

  const currentStepId = 
    !selectedDate ? 'date' :
    !selectedTime ? 'time' :
    !selectedReason ? 'details' :
    'confirm';

  // Check for existing appointment
  useEffect(() => {
    if (account && appointments) {
      const existing = appointments.find(
        (apt) => apt.accountId === account.id && apt.status !== 'cancelled'
      );
      if (existing) {
        setExistingAppointment(existing);
        
        // Safely parse the date with validation
        // Check if date exists and is not empty
        if (existing.date && existing.date.trim() !== '') {
          const aptDate = new Date(existing.date);
          
          // Check if date is valid
          if (!isNaN(aptDate.getTime())) {
            setSelectedDate(aptDate);
            setSelectedTime(existing.time || '');
            setSelectedReason(existing.reason || '');
            setNotes(existing.notes || '');
          } else {
            console.error('Invalid appointment date in existing appointment:', existing.date);
            // Don't set the date if it's invalid - only set other fields
            setSelectedTime(existing.time || '');
            setSelectedReason(existing.reason || '');
            setNotes(existing.notes || '');
          }
        } else {
          console.warn('Appointment date is missing or empty:', existing);
          // Load other fields only
          setSelectedTime(existing.time || '');
          setSelectedReason(existing.reason || '');
          setNotes(existing.notes || '');
        }
      }
    }
  }, [account, appointments]);

  // Auto-save notes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (notes) {
        localStorage.setItem(`appointment-notes-${currentVisit?.id}`, notes);
      }
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [notes, currentVisit]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentMonth]);

  // Generate time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = selectedDate?.toDateString() === now.toDateString();
    
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        let available = true;
        let reason = '';
        
        if (isToday) {
          const slotTime = new Date(selectedDate!);
          slotTime.setHours(hour, minute, 0, 0);
          if (slotTime <= now) {
            available = false;
            reason = 'وقت منقضي';
          }
        }
        
        slots.push({ time: timeStr, available, reason });
      }
    }
    
    return slots;
  }, [selectedDate]);

  const canEditAppointment = (appointment: any) => {
    const appointmentDate = new Date(appointment.date); // Use 'date' instead of 'scheduledDate'
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilAppointment >= 24;
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      toast.error('لا يمكن اختيار تاريخ في الماضي');
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setCustomReason('');
  };

  const handleEditAppointment = async () => {
    if (!existingAppointment || !canEditAppointment(existingAppointment)) {
      toast.error('لا يمكن تعديل الموعد (يجب أن يكون قبل 24 ساعة)');
      return;
    }

    if (!editReason) {
      toast.error('الرجاء اختيار سبب التعديل');
      return;
    }

    // Update appointment
    const updatedAppointment = {
      ...existingAppointment,
      scheduledDate: new Date(
        selectedDate!.getFullYear(),
        selectedDate!.getMonth(),
        selectedDate!.getDate(),
        parseInt(selectedTime.split(':')[0]),
        parseInt(selectedTime.split(':')[1])
      ),
      purpose: selectedReason || customReason,
      notes: notes,
      editReason: editReason,
      editedAt: new Date(),
    };

    updateAppointment?.(existingAppointment.id, updatedAppointment);

    // Send email and SMS (mock)
    toast.success('تم تحديث الموعد وإرسال إشعار للعميل');
    
    // Send email notification (mock)
    console.log('Sending email to customer:', {
      to: account?.email,
      subject: 'تعديل موعد',
      message: `عزيزنا العميل، نعتذر عن ${editReason}. تم تعديل موعدك إلى ${selectedDate?.toLocaleDateString('ar-SA')} ${selectedTime}`,
    });

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/app/home');
    }, 2000);
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || !selectedReason) {
      toast.error('الرجاء إكمال جميع الحقول');
      return;
    }

    if (!account) {
      toast.error('لم يتم العثور على العميل');
      console.error('Account not found. currentVisit:', currentVisit, 'accounts:', accounts);
      return;
    }

    // Validate time format
    const timeParts = selectedTime.split(':');
    if (timeParts.length !== 2 || isNaN(parseInt(timeParts[0])) || isNaN(parseInt(timeParts[1]))) {
      toast.error('وقت غير صالح');
      return;
    }

    // Create appointment date with validation
    const appointmentDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(timeParts[0]),
      parseInt(timeParts[1])
    );

    // Validate the created date
    if (isNaN(appointmentDate.getTime())) {
      toast.error('تاريخ أو وقت غير صالح');
      console.error('Invalid date created:', { selectedDate, selectedTime, appointmentDate });
      return;
    }

    // Add appointment with correct structure
    const newAppointment = {
      accountId: account.id,
      visitId: currentVisit?.id,
      date: appointmentDate.toISOString(),
      time: selectedTime,
      reason: selectedReason || customReason,
      notes: notes,
      status: 'scheduled' as const,
    };

    const savedAppointment = addAppointment(newAppointment);

    // Update account stage
    if (account.stage === 'lead') {
      updateAccount(account.id, { stage: 'qualified' });
    }

    // End visit
    if (currentVisit) {
      endVisit(currentVisit.id, 'appointment', {
        notes: `موعد مجدول: ${selectedReason || customReason} - ${appointmentDate.toLocaleDateString('ar-SA')} ${selectedTime}`,
        scheduledDate: appointmentDate.toISOString(),
        purpose: selectedReason || customReason,
      });
    }

    // Send email notification (mock)
    toast.success('تم حجز الموعد وإرسال إشعار للعميل');

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/app/home');
    }, 2000);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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
          {isEditing ? 'تعديل موعد' : 'حجز موعد'}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)' }}>
        <WizardStepper steps={steps} currentStepId={currentStepId} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-32">
        {/* Customer Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="size-12 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--brand-soft)' }}>
            <User className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate" style={{ fontSize: 'var(--font-size-base)' }}>
              {account.name}
            </h3>
            {account.address && (
              <p className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <MapPin className="size-3" />
                {account.address}
              </p>
            )}
          </div>
        </motion.div>

        {/* Edit Existing Appointment Notice */}
        {existingAppointment && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-4 space-y-3"
            style={{ 
              background: 'var(--status-info-light)',
              border: '1px solid #BFDBFE',
            }}
          >
            <div className="flex items-start gap-3">
              <Info className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-info)' }} />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: '#1E40AF' }}>
                  يوجد موعد مسبق مع هذا العميل
                </p>
                <p className="text-xs mb-2" style={{ color: '#1E40AF' }}>
                  {new Date(existingAppointment.date).toLocaleString('ar-SA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            {canEditAppointment(existingAppointment) && (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="w-full font-semibold"
                style={{ 
                  background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
                }}
              >
                <Edit className="size-4 ml-1" />
                تعديل الموعد
              </Button>
            )}
            {!canEditAppointment(existingAppointment) && (
              <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: 'white' }}>
                <AlertCircle className="size-4 mt-0.5" style={{ color: 'var(--status-warning)' }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  لا يمكن تعديل الموعد (يجب أن يكون قبل 24 ساعة)
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Edit Reason (if editing) */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-3"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div className="flex items-center gap-2">
              <Edit className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
              <h3 className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                سبب تعديل الموعد
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {EDIT_REASONS.map((reason) => (
                <Chip
                  key={reason}
                  selected={editReason === reason}
                  onClick={() => setEditReason(reason)}
                  size="md"
                >
                  {reason}
                </Chip>
              ))}
            </div>
          </motion.div>
        )}

        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 shadow-sm space-y-4"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-lg)' }}>
              <CalendarIcon className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
              اختر التاريخ
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="size-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--neutral-100)' }}
              >
                <ChevronRight className="size-5" />
              </button>
              <span className="font-semibold min-w-32 text-center" style={{ fontSize: 'var(--font-size-sm)' }}>
                {currentMonth.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={nextMonth}
                className="size-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--neutral-100)' }}
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS_AR.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold py-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const isSelected = selectedDate?.toDateString() === day.toDateString();
              const isToday = new Date().toDateString() === day.toDateString();
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
              const isDisabled = isPast;

              return (
                <motion.button
                  key={day.toISOString()}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                  className="aspect-square rounded-lg flex items-center justify-center text-sm font-semibold relative"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))'
                      : isToday
                      ? 'var(--brand-soft)'
                      : 'transparent',
                    color: isSelected
                      ? 'var(--text-inverse)'
                      : isDisabled
                      ? 'var(--text-disabled)'
                      : isToday
                      ? 'var(--brand-primary-600)'
                      : 'var(--text-primary)',
                    border: isToday && !isSelected ? '2px solid var(--brand-primary-400)' : 'none',
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                >
                  {day.getDate()}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <CheckCircle className="size-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Time Selection */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-4"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-lg)' }}>
              <Clock className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
              اختر الوقت
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <motion.button
                  key={slot.time}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className="h-12 rounded-xl font-semibold relative"
                  style={{
                    background: selectedTime === slot.time
                      ? 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))'
                      : slot.available
                      ? 'var(--neutral-50)'
                      : 'var(--interactive-disabled)',
                    color: selectedTime === slot.time
                      ? 'var(--text-inverse)'
                      : slot.available
                      ? 'var(--text-primary)'
                      : 'var(--text-disabled)',
                    border: `1px solid ${selectedTime === slot.time ? 'transparent' : 'var(--border-light)'}`,
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {slot.time}
                  {selectedTime === slot.time && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <CheckCircle className="size-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reason Selection */}
        {selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-4"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-lg)' }}>
              <Sparkles className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
              سبب الموعد
            </h3>
            <div className="flex flex-wrap gap-2">
              {APPOINTMENT_REASONS.map((reason) => (
                <Chip
                  key={reason}
                  selected={selectedReason === reason}
                  onClick={() => handleReasonSelect(reason)}
                  size="md"
                >
                  {reason}
                </Chip>
              ))}
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {selectedReason && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 shadow-sm space-y-3"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
              <label htmlFor="notes" className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                ملاحظات إضافية (اختياري)
              </label>
            </div>
            <Textarea
              id="notes"
              placeholder="أضف أي ملاحظات مهمة عن الموعد..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-right"
              style={{ 
                minHeight: '100px',
                fontSize: 'var(--font-size-base)',
                borderRadius: 'var(--input-radius)',
              }}
            />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              يتم حفظ الملاحظات تلقائياً أثناء الكتابة
            </p>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {selectedDate && selectedTime && selectedReason && (
        <div 
          className="fixed bottom-0 left-0 right-0 p-4" 
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
              onClick={isEditing ? handleEditAppointment : handleSchedule}
              disabled={isEditing && !editReason}
              className="w-full font-bold shadow-lg text-white"
              style={{ 
                height: 'var(--button-height-lg)',
                borderRadius: 'var(--button-radius)',
                fontSize: 'var(--font-size-lg)',
                background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
              }}
            >
              <Send className="size-6 ml-2" />
              {isEditing ? 'تأكيد التعديل' : 'تأكيد الموعد'}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'var(--bg-overlay)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="rounded-3xl p-8 text-center max-w-sm"
              style={{ background: 'var(--bg-surface)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="size-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--success-soft)' }}
              >
                <CheckCircle className="size-12" style={{ color: 'var(--status-success)' }} />
              </motion.div>
              <h3 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-2xl)' }}>
                {isEditing ? 'تم تعديل الموعد!' : 'تم حجز الموعد!'}
              </h3>
              <p className="mb-4" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                {isEditing 
                  ? 'تم إرسال إشعار للعميل بالتعديل الجديد'
                  : 'تم إرسال تأكيد الموعد للعميل'}
              </p>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-tertiary)' }}>
                <p>📅 {selectedDate?.toLocaleDateString('ar-SA')}</p>
                <p>🕐 {selectedTime}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}