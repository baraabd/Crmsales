/**
 * Register Screen - Matching new dark design
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';

export function RegisterRep() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('جميع الحقول إلزامية');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('تم إنشاء الحساب بنجاح! 🎉');
      navigate('/auth/login');
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
      toast.error('خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center p-6"
      style={{ background: 'var(--bg-app)' }}
      dir="rtl"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            تسجيل جديد
          </motion.h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            أنشئ حسابك الجديد
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              الاسم الكامل
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أحمد محمد"
                className="w-full h-12 pr-11 pl-4 rounded-xl focus:outline-none transition-all"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@company.com"
                className="w-full h-12 pr-11 pl-4 rounded-xl focus:outline-none transition-all"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              رقم الجوال
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full h-12 pr-11 pl-4 rounded-xl focus:outline-none transition-all"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pr-11 pl-11 rounded-xl focus:outline-none transition-all"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pr-11 pl-11 rounded-xl focus:outline-none transition-all"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ 
                    background: 'rgba(255, 59, 71, 0.1)',
                    border: '1px solid var(--color-red)',
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-red)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--color-red)' }}>
                    {error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="pt-2">
            <AppButtonV2
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              إنشاء حساب
            </AppButtonV2>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            لديك حساب بالفعل؟{' '}
            <Link
              to="/auth/login"
              className="font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              سجّل الدخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
