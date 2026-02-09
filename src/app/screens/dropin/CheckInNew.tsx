/**
 * CheckInNew - تسجيل الوصول مطابق للتصميم
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import {
  MapPin,
  Clock,
  Camera,
  Navigation,
  CheckCircle2,
  User,
  Building,
  Phone,
} from 'lucide-react';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';

export function CheckInNew() {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [checkingIn, setCheckingIn] = useState(false);
  const { accounts, startVisit } = useApp();

  const customer = accounts.find((account) => account.id === accountId);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      if (!customer) {
        toast.error('لم يتم العثور على العميل');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      const visit = startVisit(customer.id, customer.latitude, customer.longitude);
      toast.success('تم تسجيل الوصول بنجاح! 🎉');

      setTimeout(() => {
        navigate(`/visit/active/${visit.id}`);
      }, 300);
    } catch (error) {
      toast.error('فشل تسجيل الوصول');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-app)' }}
      dir="rtl"
    >
      {/* Header */}
      <div
        className="px-4 py-6"
        style={{
          paddingTop: 'calc(var(--safe-top) + 24px)',
        }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="size-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--color-primary)' }}
          >
            <MapPin className="size-10" style={{ color: '#000' }} />
          </motion.div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            تسجيل الوصول
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            سجل وصولك لبدء الزيارة
          </p>
        </div>

        {/* Customer Info Card */}
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: 'var(--bg-card)' }}
        >
          {customer ? (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="size-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-blue)' }}
                >
                  <User className="size-7" style={{ color: '#000' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {customer.name}
                  </h3>
                  {customer.contactPerson && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {customer.contactPerson}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                {customer.phone && <InfoRow icon={Phone} text={customer.phone} />}
                {customer.address && <InfoRow icon={MapPin} text={customer.address} />}
                <InfoRow
                  icon={Building}
                  text={`الإحداثيات: ${customer.latitude.toFixed(4)}, ${customer.longitude.toFixed(4)}`}
                />
              </div>
            </>
          ) : (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              لم يتم العثور على بيانات العميل. الرجاء العودة وإعادة المحاولة.
            </div>
          )}
        </div>

        {/* Check-in Options */}
        <div className="space-y-3 mb-6">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            خيارات إضافية
          </h3>

          <OptionCard
            icon={Camera}
            label="التقاط صورة للموقع"
            description="اختياري"
            color="var(--color-orange)"
            onClick={() => {}}
          />

          <OptionCard
            icon={Navigation}
            label="تأكيد الموقع الجغرافي"
            description="مفعّل تلقائياً"
            color="var(--color-blue)"
            active
          />
        </div>

        {/* Current Time */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between mb-6"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <Clock className="size-6" style={{ color: '#000' }} />
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                وقت الوصول
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {new Date().toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            السبت، 8 فبراير
          </div>
        </div>
      </div>

      {/* Check-in Button */}
      <div
        className="mt-auto px-4 pb-6"
        style={{
          paddingBottom: 'calc(var(--safe-bottom) + 24px)',
        }}
      >
        <AppButtonV2
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleCheckIn}
          loading={checkingIn}
          disabled={checkingIn || !customer}
          icon={<CheckCircle2 />}
        >
          {checkingIn ? 'جارٍ التسجيل...' : 'تسجيل الوصول'}
        </AppButtonV2>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {text}
      </span>
    </div>
  );
}

function OptionCard({
  icon: Icon,
  label,
  description,
  color,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  description: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-2xl p-4 flex items-center justify-between"
      style={{
        background: 'var(--bg-card)',
        border: active ? `2px solid ${color}` : '2px solid transparent',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="size-12 rounded-xl flex items-center justify-center"
          style={{ background: color }}
        >
          <Icon className="size-6" style={{ color: '#000' }} />
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {description}
          </div>
        </div>
      </div>

      {active && (
        <CheckCircle2 className="size-6" style={{ color }} />
      )}
    </motion.button>
  );
}
