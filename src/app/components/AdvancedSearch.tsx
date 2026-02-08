import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Filter, ChevronDown, MapPin, Phone, Briefcase, Users } from 'lucide-react';
import { Account } from '../contexts/AppContext';

interface AdvancedSearchProps {
  accounts: Account[];
  onResults: (results: Account[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedSearch({ accounts, onResults, isOpen, onClose }: AdvancedSearchProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedLifecycle, setSelectedLifecycle] = useState<string>('الكل');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const lifecycleOptions = [
    { value: 'الكل', label: 'الكل', gradient: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))' },
    { value: 'customer', label: 'عملاء', gradient: 'linear-gradient(90deg, var(--status-success), var(--success-dark))' },
    { value: 'prospect', label: 'محتملين', gradient: 'linear-gradient(90deg, var(--brand-blue-500), var(--brand-blue-600))' },
    { value: 'warm', label: 'نابذين', gradient: 'linear-gradient(90deg, var(--status-warning), var(--status-warning-dark))' },
    { value: 'lost', label: 'مرفوض', gradient: 'linear-gradient(90deg, var(--status-error), var(--status-error-dark))' },
  ];

  const performSearch = () => {
    let results = accounts;

    // Text search
    if (searchText.trim()) {
      results = results.filter(account => 
        account.name.toLowerCase().includes(searchText.toLowerCase()) ||
        account.contactPerson?.toLowerCase().includes(searchText.toLowerCase()) ||
        account.phone?.includes(searchText) ||
        account.address?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lifecycle filter
    if (selectedLifecycle !== 'الكل') {
      results = results.filter(account => account.lifecycle === selectedLifecycle);
    }

    // Region filter
    if (selectedRegion) {
      results = results.filter(account => 
        account.address?.toLowerCase().includes(selectedRegion.toLowerCase())
      );
    }

    onResults(results);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Real-time search
    setTimeout(() => performSearch(), 300);
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedLifecycle('الكل');
    setSelectedRegion('');
    setSelectedActivity('');
    onResults(accounts);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 backdrop-blur-sm"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
            dir="rtl"
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{
              background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))'
            }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Search className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">بحث متقدم</h2>
                  <p className="text-xs text-white opacity-90">ابحث بكل التفاصيل</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="size-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5" 
                        style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ابحث بالاسم، الهاتف، العنوان..."
                  className="w-full pr-12 pl-4 py-4 rounded-2xl text-base focus:outline-none transition-all"
                  style={{
                    background: 'var(--neutral-50)',
                    border: '2px solid var(--border-light)',
                    color: 'var(--text-primary)',
                  }}
                />
                {searchText && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
                    style={{ background: 'transparent' }}
                  >
                    <X className="size-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                )}
              </div>

              {/* Quick Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(90deg, var(--neutral-50), var(--neutral-100))'
                }}
              >
                <div className="flex items-center gap-2">
                  <Filter className="size-5" style={{ color: 'var(--text-secondary)' }} />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>فلاتر إضافية</span>
                </div>
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="size-5" style={{ color: 'var(--text-secondary)' }} />
                </motion.div>
              </button>

              {/* Filters Section */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Lifecycle Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium" 
                             style={{ color: 'var(--text-primary)' }}>
                        <Users className="size-4" />
                        حالة العميل
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {lifecycleOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedLifecycle(option.value);
                              setTimeout(() => performSearch(), 100);
                            }}
                            className="px-4 py-2 rounded-full font-medium text-sm transition-all"
                            style={
                              selectedLifecycle === option.value
                                ? {
                                    background: option.gradient,
                                    color: 'var(--text-inverse)',
                                    boxShadow: 'var(--shadow-lg)',
                                    transform: 'scale(1.05)',
                                  }
                                : {
                                    background: 'var(--neutral-100)',
                                    color: 'var(--text-secondary)',
                                  }
                            }
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Region Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium"
                             style={{ color: 'var(--text-primary)' }}>
                        <MapPin className="size-4" />
                        المنطقة
                      </label>
                      <input
                        type="text"
                        value={selectedRegion}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value);
                          setTimeout(() => performSearch(), 300);
                        }}
                        placeholder="أدخل اسم المنطقة..."
                        className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none"
                        style={{
                          background: 'var(--neutral-50)',
                          border: '2px solid var(--border-light)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    {/* Phone Search */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium"
                             style={{ color: 'var(--text-primary)' }}>
                        <Phone className="size-4" />
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        value={searchText.match(/\d/) ? searchText : ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="أدخل رقم الهاتف..."
                        className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none"
                        style={{
                          background: 'var(--neutral-50)',
                          border: '2px solid var(--border-light)',
                          color: 'var(--text-primary)',
                        }}
                        dir="ltr"
                      />
                    </div>

                    {/* Activity Type */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium"
                             style={{ color: 'var(--text-primary)' }}>
                        <Briefcase className="size-4" />
                        نوع النشاط
                      </label>
                      <select
                        value={selectedActivity}
                        onChange={(e) => {
                          setSelectedActivity(e.target.value);
                          setTimeout(() => performSearch(), 100);
                        }}
                        className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none"
                        style={{
                          background: 'var(--neutral-50)',
                          border: '2px solid var(--border-light)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="">الكل</option>
                        <option value="retail">تجزئة</option>
                        <option value="wholesale">جملة</option>
                        <option value="services">خدمات</option>
                        <option value="manufacturing">تصنيع</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-6 py-3 font-semibold rounded-xl transition-all"
                  style={{
                    background: 'var(--neutral-100)',
                    color: 'var(--text-primary)',
                  }}
                >
                  إعادة تعيين
                </button>
                <button
                  onClick={() => {
                    performSearch();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))'
                  }}
                >
                  بحث
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
