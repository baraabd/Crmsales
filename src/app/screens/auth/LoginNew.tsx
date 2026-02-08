/**
 * Login Screen - Jibble Style
 * Purple gradients, dramatic shadows, glassmorphism
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Text, Button, Card, TextField } from '../../../design-system';
import { cn } from '../../../design-system/utils';

// Animated gradient background orbs
function GradientOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.6, 0.4],
        x: [0, 30, 0],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={cn('absolute rounded-full blur-3xl', className)}
    />
  );
}

export function Login() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    
    if (!employeeId || !password) {
      setError('يرجى إدخال رقم الموظف وكلمة المرور');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/app/home');
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[var(--brand-primary-50)] via-white to-[var(--brand-secondary-50)]" dir="rtl">
      {/* Animated gradient orbs */}
      <GradientOrb
        className="w-96 h-96 bg-gradient-to-r from-[var(--brand-primary-400)] to-[var(--brand-accent-400)] -top-20 -right-20"
        delay={0}
      />
      <GradientOrb
        className="w-80 h-80 bg-gradient-to-r from-[var(--brand-secondary-400)] to-[var(--brand-primary-400)] -bottom-20 -left-20"
        delay={1}
      />
      <GradientOrb
        className="w-64 h-64 bg-gradient-to-r from-[var(--brand-accent-300)] to-[var(--brand-primary-300)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        delay={2}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-[28px] gradient-primary shadow-primary flex items-center justify-center">
              <Text variant="displayLarge" weight="bold" className="text-white">
                F
              </Text>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <Text variant="displaySmall" weight="bold" className="text-gradient-primary mb-2">
              مرحباً بك مجدداً
            </Text>
            <Text variant="bodyLarge" color="secondary">
              سجّل دخولك للمتابعة إلى FieldCRM
            </Text>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" padding="lg" className="backdrop-blur-xl">
              <div className="space-y-5">
                {/* Employee ID */}
                <TextField
                  label="رقم الموظف"
                  value={employeeId}
                  onChange={setEmployeeId}
                  placeholder="أدخل رقم الموظف"
                  type="text"
                  size="lg"
                  startAdornment={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                />

                {/* Password */}
                <TextField
                  label="كلمة المرور"
                  value={password}
                  onChange={setPassword}
                  placeholder="أدخل كلمة المرور"
                  type="password"
                  size="lg"
                  startAdornment={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                />

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 p-3 rounded-[var(--radius-lg)] bg-[var(--status-error-light)] border-2 border-[var(--status-error)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-[var(--status-error)] mt-0.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <Text variant="bodySmall" weight="medium" className="text-[var(--status-error)]">
                          {error}
                        </Text>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-2 border-[var(--border-main)] text-[var(--brand-primary-600)] focus:ring-2 focus:ring-[var(--brand-primary-500)]/20"
                    />
                    <Text variant="bodySmall" color="secondary">
                      تذكرني
                    </Text>
                  </label>
                  
                  <button
                    onClick={() => navigate('/auth/forgot-password')}
                    className="text-[var(--brand-primary-600)] hover:text-[var(--brand-primary-700)] transition-colors"
                  >
                    <Text variant="bodySmall" weight="semibold">
                      نسيت كلمة المرور؟
                    </Text>
                  </button>
                </div>

                {/* Login Button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  onClick={handleLogin}
                  className="mt-2"
                >
                  تسجيل الدخول
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Register Link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <Text variant="bodyMedium" color="secondary">
              ليس لديك حساب؟{' '}
              <button
                onClick={() => navigate('/auth/register')}
                className="text-[var(--brand-primary-600)] hover:text-[var(--brand-primary-700)] font-semibold transition-colors"
              >
                سجّل الآن
              </button>
            </Text>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Text variant="captionSmall" color="tertiary">
              © 2026 FieldCRM. جميع الحقوق محفوظة.
            </Text>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
