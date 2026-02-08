/**
 * Login Screen - Real Jibble Style
 * Clean, minimal, orange accents
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Text, Button, Card, TextField } from '../../../design-system';
import { cn } from '../../../design-system/utils';

// Jibble Logo SVG
function JibbleLogo() {
  return (
    <svg width="140" height="40" viewBox="0 0 140 40" fill="none">
      <path d="M25 8L20 8C18.3431 8 17 9.34315 17 11L17 29C17 30.6569 18.3431 32 20 32H25C26.6569 32 28 30.6569 28 29V11C28 9.34315 26.6569 8 25 8Z" fill="var(--brand-primary-500)"/>
      <circle cx="22.5" cy="3.5" r="3.5" fill="var(--brand-primary-500)"/>
      <text x="38" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="var(--text-primary)">jibble</text>
    </svg>
  );
}

export function LoginJibble() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      navigate('/app/home');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6" dir="rtl">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <JibbleLogo />
          </motion.div>
        </div>

        {/* Login Card */}
        <Card variant="elevated" padding="lg" className="space-y-5">
          {/* Email */}
          <TextField
            label="البريد الإلكتروني"
            value={email}
            onChange={setEmail}
            placeholder="أدخل بريدك الإلكتروني"
            type="email"
            size="lg"
            startAdornment={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
          />

          {/* Password */}
          <TextField
            label="كلمة المرور"
            value={password}
            onChange={setPassword}
            placeholder="أدخل كلمة المرور"
            type={showPassword ? 'text' : 'password'}
            size="lg"
            startAdornment={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
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
                <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--status-error-light)] border border-[var(--status-error)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-[var(--status-error)] mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <Text variant="bodySmall" className="text-[var(--status-error)]">
                    {error}
                  </Text>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forgot Password */}
          <div className="text-center">
            <button
              onClick={() => navigate('/auth/forgot-password')}
              className="text-[var(--text-secondary)] hover:text-[var(--text-brand)] transition-colors text-sm"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Login Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onClick={handleLogin}
          >
            تسجيل الدخول
          </Button>
        </Card>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <Text variant="bodyMedium" color="secondary">
            ليس لديك حساب؟{' '}
            <button
              onClick={() => navigate('/auth/register')}
              className="text-[var(--text-brand)] hover:underline font-semibold"
            >
              سجّل الآن
            </button>
          </Text>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <Text variant="captionSmall" color="tertiary">
            Field Sales CRM — Mission Control
          </Text>
        </motion.div>
      </motion.div>
    </div>
  );
}