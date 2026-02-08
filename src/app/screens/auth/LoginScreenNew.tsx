/**
 * LoginScreen - Dark Premium Login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { AppButton } from '../../design-system/components/AppButton';
import { AppInput } from '../../design-system/components/AppInput';
import { GlassCard } from '../../design-system/components/GlassCard';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

export function LoginScreenNew() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      login({
        id: '1',
        name: 'محمد أحمد',
        email: email,
        phone: '+966501234567',
        role: 'rep',
      });
      
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/app/map-new');
    } catch (error) {
      toast.error('خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg-primary)' }}
      dir="rtl"
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--brand-primary) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="inline-flex items-center justify-center size-20 rounded-3xl mb-4"
            style={{ 
              background: 'var(--brand-primary)',
              boxShadow: 'var(--glow-green)',
            }}
          >
            <LogIn className="size-10" style={{ color: 'var(--text-inverse)' }} />
          </motion.div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Field CRM
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            مرحباً بعودتك
          </p>
        </div>

        {/* Login Card */}
        <GlassCard variant="medium" padding="lg">
          <div className="space-y-5">
            <AppInput
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="size-5" />}
              iconPosition="right"
              fullWidth
            />

            <div className="relative">
              <AppInput
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="size-5" />}
                iconPosition="right"
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span style={{ color: 'var(--text-secondary)' }}>تذكرني</span>
              </label>
              <button 
                onClick={() => navigate('/auth/forgot-password')}
                style={{ color: 'var(--brand-primary)' }}
                className="font-medium hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <AppButton
              variant="primary"
              size="lg"
              fullWidth
              glow
              loading={loading}
              onClick={handleLogin}
              icon={<LogIn className="size-5" />}
            >
              تسجيل الدخول
            </AppButton>

            <div className="text-center">
              <span style={{ color: 'var(--text-secondary)' }}>
                ليس لديك حساب؟{' '}
              </span>
              <button
                onClick={() => navigate('/auth/register')}
                style={{ color: 'var(--brand-primary)' }}
                className="font-semibold hover:underline"
              >
                سجل الآن
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Footer */}
        <p 
          className="text-center text-sm mt-8"
          style={{ color: 'var(--text-tertiary)' }}
        >
          © 2026 Field CRM. جميع الحقوق محفوظة
        </p>
      </motion.div>
    </div>
  );
}
