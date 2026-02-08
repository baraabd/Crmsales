import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function SplashGate() {
  const navigate = useNavigate();
  const { isOnline, isAuthenticated, loginOffline } = useApp();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const savedUser = localStorage.getItem('user');
      
      if (savedUser && isAuthenticated) {
        // Valid session - go to home
        setTimeout(() => navigate('/app/home'), 1500);
      } else if (savedUser && !isOnline) {
        // Offline with cached session - show offline login option
        // Will show button below
      } else {
        // No session or expired - go to login
        setTimeout(() => navigate('/auth/login'), 1500);
      }
    };

    checkSession();
  }, [navigate, isAuthenticated, isOnline]);

  const handleOfflineLogin = () => {
    loginOffline();
    navigate('/app/home');
  };

  const savedUser = localStorage.getItem('user');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{
      background: 'linear-gradient(135deg, var(--brand-soft), var(--brand-primary-100))'
    }}>
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="size-24 rounded-2xl mx-auto flex items-center justify-center shadow-lg" style={{
          background: 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))'
        }}>
          <span className="text-4xl text-white font-bold">CRM</span>
        </div>
        
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>نظام إدارة العملاء</h1>
        
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="size-5 animate-spin" style={{ color: 'var(--brand-primary-600)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>جاري التحقق من الجلسة...</p>
        </div>

        {/* Connection Status */}
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={
            isOnline 
              ? { background: 'var(--success-soft)', color: 'var(--status-success)' }
              : { background: 'var(--warning-soft)', color: 'var(--status-warning)' }
          }>
            <div className="size-2 rounded-full" style={{
              background: isOnline ? 'var(--status-success)' : 'var(--status-warning)'
            }} />
            {isOnline ? 'متصل' : 'غير متصل'}
          </div>
        </div>

        {/* Offline Login Option */}
        {savedUser && !isOnline && !isAuthenticated && (
          <div className="mt-8 space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>يوجد جلسة محفوظة</p>
            <Button onClick={handleOfflineLogin}>
              الدخول بدون إنترنت
            </Button>
          </div>
        )}

        {!savedUser && !isOnline && (
          <div className="mt-8 p-4 rounded-lg max-w-sm" style={{
            background: 'var(--warning-soft)',
            border: '1px solid var(--status-warning)',
          }}>
            <p className="text-sm" style={{ color: 'var(--status-warning)' }}>
              لا يمكن تسجيل الدخول لأول مرة بدون إنترنت.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
