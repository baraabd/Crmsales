/**
 * Home Map - Modern Jibble Style
 * Features:
 * - Interactive Clock In/Out button
 * - Work time display
 * - Disabled FAB when not clocked in
 * - Clean top bar with app name
 * - No bottom navigation
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Search,
  MapPin,
  Plus,
  Phone,
  Navigation,
  Menu,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Clock In Button Component
function ClockInButton({
  workStatus,
  onStatusChange,
  clockInTime,
}: {
  workStatus: 'offDuty' | 'clockedIn' | 'break';
  onStatusChange: (status: 'offDuty' | 'clockedIn' | 'break') => void;
  clockInTime: string | null;
}) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (clockInTime) {
        const elapsed = Math.floor((Date.now() - new Date(clockInTime).getTime()) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        setCurrentTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [clockInTime]);

  const handleClick = () => {
    if (workStatus === 'offDuty') {
      onStatusChange('clockedIn');
      toast.success('تم تسجيل الحضور! 🎉');
    } else if (workStatus === 'clockedIn') {
      onStatusChange('break');
      toast('أنت الآن في استراحة ☕');
    } else {
      onStatusChange('clockedIn');
      toast.success('عودة إلى العمل! 💼');
    }
  };

  const isActive = workStatus !== 'offDuty';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`relative h-12 px-5 rounded-[16px] font-semibold text-sm shadow-sm flex items-center gap-2.5 transition-all ${
        workStatus === 'clockedIn'
          ? 'bg-[#F97316] text-white'
          : workStatus === 'break'
          ? 'bg-[#3B82F6] text-white'
          : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
      }`}
    >
      <motion.div
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: 'linear' }}
      >
        <Clock className="w-4.5 h-4.5" strokeWidth={2.5} />
      </motion.div>
      
      {isActive && clockInTime ? (
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] opacity-80">في الدوام</span>
          <span className="text-sm font-bold tabular-nums">{currentTime}</span>
        </div>
      ) : (
        <span>تسجيل الحضور</span>
      )}
      
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white"
        />
      )}
    </motion.button>
  );
}

export function HomeMap() {
  const navigate = useNavigate();
  const { accounts, isOnline, workStatus, setWorkStatus, clockInTime, canAddData, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPinColor = (lifecycle: string) => {
    switch (lifecycle) {
      case 'customer':
        return '#F97316';
      case 'warm':
        return '#F59E0B';
      case 'cold':
        return '#3B82F6';
      default:
        return '#16A34A';
    }
  };

  const selectedAccountData = selectedAccount
    ? accounts.find((a) => a.id === selectedAccount)
    : null;

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      setSelectedAccount(null);
    }
  };

  const handleAddClick = () => {
    if (!canAddData) {
      toast.error('يجب تسجيل الحضور أولاً لإضافة عملاء! ⏰');
      return;
    }
    navigate('/dropin/identify');
  };

  return (
    <div className="h-full flex flex-col bg-[#F7F8FA] overflow-hidden" dir="rtl">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 relative z-10">
        <div className="flex items-center justify-between gap-3">
          {/* Menu */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* App Name */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-[#111827]">Field CRM</h1>
          </div>

          {/* Avatar */}
          <button
            onClick={() => navigate('/app/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center text-white font-bold shadow-sm"
          >
            {user?.name.charAt(0) || 'م'}
          </button>
        </div>

        {/* Clock In Button */}
        <div className="mt-3 flex justify-center">
          <ClockInButton
            workStatus={workStatus}
            onStatusChange={setWorkStatus}
            clockInTime={clockInTime}
          />
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-[#E5E7EB] overflow-hidden"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن عميل..."
                  autoFocus
                  className="w-full h-11 pr-11 pl-4 rounded-[14px] border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Clean Map Background */}
        <div className="absolute inset-0 bg-[#F5F5F5]">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Pins */}
          <AnimatePresence>
            {filteredAccounts.map((account, index) => {
              const top = 20 + ((index * 17) % 55);
              const left = 15 + ((index * 23) % 65);
              const isSelected = selectedAccount === account.id;

              return (
                <motion.button
                  key={account.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isSelected ? 1.3 : 1,
                    opacity: 1,
                    y: isSelected ? -8 : 0,
                    zIndex: isSelected ? 50 : 10,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={() => setSelectedAccount(account.id)}
                  className="absolute"
                  style={{ top: `${top}%`, left: `${left}%` }}
                >
                  <motion.div
                    animate={{
                      boxShadow: isSelected
                        ? '0 8px 20px rgba(0,0,0,0.2)'
                        : '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    className="w-10 h-10 rounded-xl border-3 border-white flex items-center justify-center shadow-md"
                    style={{ backgroundColor: getPinColor(account.lifecycle) }}
                  >
                    <MapPin className="w-5 h-5 text-white fill-white" />
                  </motion.div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Search Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSearch(!showSearch)}
          className="absolute top-6 right-4 z-20 w-12 h-12 rounded-xl bg-white shadow-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#F97316] transition-colors"
        >
          {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </motion.button>

        {/* Navigation Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-6 left-4 z-20 w-12 h-12 rounded-xl bg-white shadow-md border border-[#E5E7EB] flex items-center justify-center text-[#F97316] hover:shadow-lg transition-shadow"
        >
          <Navigation className="w-5 h-5" />
        </motion.button>

        {/* FAB - Disabled when not clocked in */}
        <div className="absolute bottom-6 right-4 z-20">
          <motion.button
            whileTap={canAddData ? { scale: 0.9 } : {}}
            className={`w-14 h-14 rounded-[28px] text-white shadow-lg flex items-center justify-center transition-all ${
              canAddData
                ? 'bg-[#F97316] hover:bg-[#EA580C] cursor-pointer'
                : 'bg-[#D1D5DB] cursor-not-allowed'
            }`}
            onClick={handleAddClick}
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </motion.button>

          {/* Tooltip */}
          <AnimatePresence>
            {!canAddData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-3 w-48 bg-[#111827] text-white text-xs px-3 py-2 rounded-lg shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>سجل حضورك أولاً لإضافة عملاء</span>
                </div>
                <div className="absolute -bottom-1 right-6 w-2 h-2 bg-[#111827] transform rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {selectedAccountData && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAccount(null)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30"
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-xl z-40 max-h-[70vh]"
              >
                {/* Handle */}
                <div className="pt-3 pb-2 flex justify-center">
                  <div className="w-12 h-1 bg-[#D1D5DB] rounded-full" />
                </div>

                <div className="px-4 pb-6">
                  {/* Account Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#111827]">{selectedAccountData.name}</h3>
                    {selectedAccountData.contactPerson && (
                      <p className="text-sm text-[#6B7280]">{selectedAccountData.contactPerson}</p>
                    )}
                    {selectedAccountData.address && (
                      <p className="text-sm text-[#9CA3AF] mt-1">{selectedAccountData.address}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          selectedAccountData.lifecycle === 'customer'
                            ? '#EAF7EE'
                            : selectedAccountData.lifecycle === 'warm'
                            ? '#FFF7E6'
                            : '#EFF6FF',
                        color:
                          selectedAccountData.lifecycle === 'customer'
                            ? '#16A34A'
                            : selectedAccountData.lifecycle === 'warm'
                            ? '#F59E0B'
                            : '#3B82F6',
                      }}
                    >
                      {selectedAccountData.lifecycle === 'customer'
                        ? 'عميل'
                        : selectedAccountData.lifecycle === 'warm'
                        ? 'محتمل'
                        : 'جديد'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => (window.location.href = `tel:${selectedAccountData.phone}`)}
                      className="h-11 rounded-[14px] bg-white border border-[#E5E7EB] text-[#111827] font-semibold flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-shadow"
                    >
                      <Phone className="w-4 h-4" />
                      <span>اتصال</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="h-11 rounded-[14px] bg-white border border-[#E5E7EB] text-[#111827] font-semibold flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-shadow"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>توجيه</span>
                    </motion.button>
                  </div>

                  {/* Visit Button */}
                  <motion.button
                    whileTap={canAddData ? { scale: 0.98 } : {}}
                    onClick={() => {
                      if (!canAddData) {
                        toast.error('يجب تسجيل الحضور أولاً! ⏰');
                        return;
                      }
                      navigate(`/dropin/checkin/${selectedAccountData.id}`);
                    }}
                    disabled={!canAddData}
                    className={`w-full h-[52px] rounded-[18px] font-semibold shadow-sm hover:shadow-md transition-all mt-4 ${
                      canAddData
                        ? 'bg-[#F97316] hover:bg-[#EA580C] text-white cursor-pointer'
                        : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    }`}
                  >
                    {canAddData ? 'بدء زيارة ميدانية' : 'يجب تسجيل الحضور أولاً'}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Transparent Sidebar Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white/95 backdrop-blur-xl shadow-2xl z-50"
              dir="rtl"
            >
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {user?.name.charAt(0) || 'م'}
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">{user?.name || 'مندوب'}</p>
                    <p className="text-sm text-[#6B7280]">{user?.company || 'شركة'}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/app/home');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-[#111827] hover:bg-[#FFF2E8] hover:text-[#F97316] transition-colors text-right"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">الخريطة</span>
                  </button>

                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/app/calendar');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-[#111827] hover:bg-[#FFF2E8] hover:text-[#F97316] transition-colors text-right"
                  >
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">التقويم</span>
                  </button>

                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/app/stats');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-[#111827] hover:bg-[#FFF2E8] hover:text-[#F97316] transition-colors text-right"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-semibold">الإحصائيات</span>
                  </button>

                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/app/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-[#111827] hover:bg-[#FFF2E8] hover:text-[#F97316] transition-colors text-right"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold">الملف الشخصي</span>
                  </button>

                  <div className="h-px bg-[#E5E7EB] my-4" />

                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/app/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] text-[#111827] hover:bg-[#FFF2E8] hover:text-[#F97316] transition-colors text-right"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">الإعدادات</span>
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
