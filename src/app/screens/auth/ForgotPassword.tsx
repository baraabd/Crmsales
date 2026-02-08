/**
 * Forgot Password Screen - Matching new dark design
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('البريد الإلكتروني إلزامي');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('البريد الإلكتروني غير صالح');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      toast.success('تم إرسال رابط إعادة التعيين! 📧');
    } catch (err: any) {
      setError(err.message || 'فشل إرسال البريد');
      toast.error('خطأ في إرسال البريد');
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
        {/* Back Button */}
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4"
          >
            <div
              className="size-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-card)' }}
            >
              <Mail className="size-8" style={{ color: 'var(--color-primary)' }} />
            </div>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            استعادة كلمة المرور
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {success 
              ? 'تم إرسال رابط إعادة التعيين إلى بريدك' 
              : 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور'
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  إرسال رابط إعادة التعيين
                </AppButtonV2>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ 
                  background: 'rgba(0, 230, 118, 0.1)',
                  border: '1px solid var(--color-primary)',
                }}
              >
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                    تم الإرسال بنجاح!
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.
                  </p>
                </div>
              </div>

              {/* Back to Login */}
              <Link to="/auth/login">
                <AppButtonV2 variant="secondary" size="lg" fullWidth>
                  العودة لتسجيل الدخول
                </AppButtonV2>
              </Link>

              {/* Resend */}
              <div className="text-center">
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  لم يصلك البريد؟ <span style={{ color: 'var(--color-primary)' }}>إعادة الإرسال</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
