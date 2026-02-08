/**
 * Identify Customer - Modern Jibble Style
 * Features:
 * - Check if user is clocked in
 * - Redirect if not clocked in
 * - Clean search interface
 */

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'motion/react';
import { ArrowRight, Search, MapPin, UserPlus, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function IdentifyCustomer() {
  const navigate = useNavigate();
  const { accounts, canAddData, workStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not clocked in
  useEffect(() => {
    if (!canAddData) {
      toast.error('يجب تسجيل الحضور أولاً! ⏰');
      navigate('/app/home');
    }
  }, [canAddData, navigate]);

  const nearbyAccounts = accounts.slice(0, 5); // Mock nearby
  const filteredAccounts = searchQuery
    ? accounts.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nearbyAccounts;

  const handleSelectExisting = (accountId: string) => {
    navigate(`/dropin/checkin/${accountId}`);
  };

  const handleAddNew = () => {
    navigate('/dropin/quick-add');
  };

  if (!canAddData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/app/home')}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#F9FAFB] rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-[#6B7280]" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111827]">تحديد العميل</h1>
            <p className="text-sm text-[#6B7280]">اختر عميلاً لبدء الزيارة</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Hint */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[16px] p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#1E40AF]">
            سيتم حفظ الموقع والوقت تلقائيًا عند بدء الزيارة.
          </p>
        </motion.div>

        {/* Existing Customer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-[#FFF2E8] rounded-[14px] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-[#F97316]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#111827] mb-1">عميل موجود</h3>
              <p className="text-sm text-[#6B7280]">
                ابحث عن عميل من القائمة
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="ابحث عن عميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-11 pl-4 rounded-[14px] border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] transition-all"
            />
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">لا توجد نتائج</p>
              </div>
            ) : (
              filteredAccounts.map((account, index) => (
                <motion.button
                  key={account.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectExisting(account.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors text-right"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFF2E8] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111827] truncate">{account.name}</p>
                    {account.address && (
                      <p className="text-sm text-[#6B7280] truncate">{account.address}</p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-[#9CA3AF] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {/* New Customer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-[#EAF7EE] rounded-[14px] flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-6 h-6 text-[#16A34A]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#111827] mb-1">عميل جديد</h3>
              <p className="text-sm text-[#6B7280]">
                أضف عميلاً جديداً للنظام
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNew}
            className="w-full h-12 rounded-[14px] bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold shadow-sm transition-colors"
          >
            إضافة عميل جديد
          </motion.button>
        </motion.div>

        {/* Nearby Section */}
        {!searchQuery && nearbyAccounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-[18px] p-5 shadow-sm border border-[#E5E7EB]"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#F97316]" />
              <h3 className="font-bold text-[#111827]">عملاء قريبون</h3>
            </div>
            <div className="space-y-2">
              {nearbyAccounts.slice(0, 3).map((account) => (
                <motion.button
                  key={account.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectExisting(account.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors text-right"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFF2E8] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#111827] truncate">{account.name}</p>
                  </div>
                  <span className="text-xs text-[#6B7280] bg-white px-2 py-1 rounded-full">قريب</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
