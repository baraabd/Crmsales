import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { BottomNav } from '../../design-system/components/BottomNav';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  User,
  Menu,
  Bell,
  Wifi,
  WifiOff,
  Clock,
  RefreshCw,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isOnline, outbox, logout } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const tabs = [
    { path: '/app/home', icon: Home, label: 'الرئيسية' },
    { path: '/app/calendar', icon: Calendar, label: 'التقويم' },
    { path: '/app/leads', icon: Users, label: 'عملائي' },
    { path: '/app/stats', icon: BarChart3, label: 'الإحصائيات' },
    { path: '/app/profile', icon: User, label: 'الحساب' },
  ];

  const drawerItems = [
    { path: '/app/timesheet', icon: Clock, label: 'سجل الدوام' },
    { path: '/app/sync-status', icon: RefreshCw, label: 'حالة المزامنة', badge: outbox.length },
    { path: '/app/settings', icon: Settings, label: 'الإعدادات' },
    { path: '/app/help', icon: HelpCircle, label: 'مساعدة' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    setLogoutDialogOpen(false);
    setDrawerOpen(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" dir="rtl" style={{ background: 'var(--bg-canvas)' }}>
      {/* Mobile-First Top Bar - Compact */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 py-3 flex items-center justify-between shadow-lg relative z-10"
        style={{ background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))' }}
      >
        <div className="flex items-center gap-3">
          {/* Menu Button with Animation */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="size-6 text-white" />
                {outbox.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 size-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'var(--status-error)' }}
                  >
                    {outbox.length}
                  </motion.span>
                )}
              </motion.button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle className="text-right">
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="size-14 rounded-full flex items-center justify-center shadow-lg" style={{
                      background: 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))'
                    }}>
                      <User className="size-7 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{user?.name}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.employeeId}</div>
                      <div className={`text-xs mt-1 flex items-center gap-1.5`} style={{
                        color: isOnline ? 'var(--status-success)' : 'var(--status-warning)'
                      }}>
                        {isOnline ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                        <span>{isOnline ? 'متصل' : 'غير متصل'}</span>
                      </div>
                    </div>
                  </motion.div>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  قائمة الإعدادات والخيارات الإضافية
                </SheetDescription>
              </SheetHeader>

              <div className="mt-8 space-y-2">
                {drawerItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between px-4 py-4 rounded-xl transition-colors"
                      style={{
                        background: 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--neutral-100)' }}>
                          <item.icon className="size-5" style={{ color: 'var(--text-primary)' }} />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="destructive" className="rounded-full">{item.badge}</Badge>
                      )}
                    </Link>
                  </motion.div>
                ))}

                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: drawerItems.length * 0.05 }}
                  onClick={() => setLogoutDialogOpen(true)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-colors mt-4"
                  style={{ background: 'transparent', color: 'var(--status-error)' }}
                >
                  <div className="p-2 rounded-lg" style={{ background: 'var(--status-error-light)' }}>
                    <LogOut className="size-5" />
                  </div>
                  <span className="font-medium">تسجيل الخروج</span>
                </motion.button>
              </div>
            </SheetContent>
          </Sheet>

          {/* User Avatar Button - NEW */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => navigate('/app/profile')}
          >
            <div className="size-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="size-5 text-white" />
            </div>
          </motion.button>
        </div>

        {/* App Title - Center */}
        <div className="absolute left-1/2 -translate-x-1/2 text-white">
          <div className="font-bold text-base tracking-wide">نظام CRM</div>
        </div>

        {/* Status Indicators - Compact */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <motion.div whileTap={{ scale: 0.9 }}>
            <Link to="/app/notifications">
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="size-5 text-white" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -left-1 size-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  style={{ background: 'var(--status-error)' }}
                >
                  3
                </motion.span>
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content - Full Screen */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Bottom Navigation - استخدام المكون الجديد */}
      <BottomNav />

      {/* Logout Confirmation Dialog - Mobile Optimized */}
      <AnimatePresence>
        {logoutDialogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutDialogOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-6"
            >
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <div className="flex justify-center">
                  <div className="size-14 rounded-full flex items-center justify-center" style={{ background: 'var(--status-error-light)' }}>
                    <LogOut className="size-7" style={{ color: 'var(--status-error)' }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>تسجيل الخروج</h3>
                <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  هل تريد تسجيل الخروج؟ سيتم الاحتفاظ بالبيانات غير المزامنة وسيتم رفعها لاحقًا عند تسجيل الدخول.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setLogoutDialogOpen(false)}
                    className="flex-1 h-12 text-base"
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="flex-1 h-12 text-base font-semibold"
                  >
                    تسجيل الخروج
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}