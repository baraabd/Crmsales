/**
 * Login Screen - Fixed Mobile Layout
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';

export function Login() {
  const navigate = useNavigate();
  const { login, loginOffline, isOnline } = useApp();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !password) {
      setError('الحقول إلزامية');
      return;
    }

    if (!isOnline) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        loginOffline();
        navigate('/app/home-new');
      } else {
        setError('لا يمكن تسجيل الدخول لأول مرة بدون إنترنت.');
      }
      return;
    }

    setLoading(true);
    try {
      await login(employeeId, password);
      toast.success('تم تسجيل الدخول بنجاح! 🎉');
      
      const hasCompletedSetup = localStorage.getItem('setupCompleted');
      if (!hasCompletedSetup) {
        navigate('/setup');
      } else {
        navigate('/app/home-new');
      }
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
      toast.error('خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-screen" dir="rtl">
      <div className="mobile-content flex items-center justify-center px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              تسجيل الدخول
            </motion.h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              أدخل بياناتك للمتابعة
            </p>
          </div>

          {/* Offline Indicator */}
          {!isOnline && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <WifiOff className="w-4 h-4" style={{ color: 'var(--color-orange)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                غير متصل بالإنترنت
              </span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    className="flex items-start gap-2 p-2.5 rounded-xl"
                    style={{ 
                      background: 'rgba(255, 59, 71, 0.1)',
                      border: '1px solid var(--color-red)',
                    }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-red)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--color-red)' }}>
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password */}
            <div className="text-center pt-1">
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

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
                تسجيل الدخول
              </AppButtonV2>
            </div>
          </form>

          {/* Register Link */}
          <div className="text-center mt-5">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ليس لديك حساب؟{' '}
              <Link
                to="/auth/register"
                className="font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                سجّل الآن
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
