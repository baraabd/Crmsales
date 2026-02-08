import { useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Clock, Phone, Navigation, Calendar, SlidersHorizontal } from 'lucide-react';
import { AdvancedSearch } from '../../components/AdvancedSearch';
import type { Account } from '../../contexts/AppContext';

export function MyLeads() {
  const { accounts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Account[]>(accounts);

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'customer', label: 'عملاء' },
    { id: 'warm', label: 'محتملين' },
    { id: 'cold', label: 'باردين' },
    { id: 'lost', label: 'مرفوض' },
    { id: 'today', label: 'مواعيد اليوم' },
  ];

  const filteredAccounts = searchResults.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'today') {
      const today = new Date().toDateString();
      return (
        matchesSearch &&
        account.nextAction?.datetime &&
        new Date(account.nextAction.datetime).toDateString() === today
      );
    }
    return matchesSearch && account.lifecycle === selectedFilter;
  });

  const getStatusColor = (lifecycle: string) => {
    switch (lifecycle) {
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800';
      case 'cold':
        return 'bg-blue-100 text-blue-800';
      case 'lost':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (lifecycle: string) => {
    switch (lifecycle) {
      case 'customer':
        return 'عميل';
      case 'warm':
        return 'محتمل';
      case 'cold':
        return 'بارد';
      case 'lost':
        return 'مرفوض';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden" dir="rtl">
      {/* Header - Mobile First */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-4 shadow-md space-y-3"
      >
        <h1 className="text-2xl font-bold">عملائي</h1>

        {/* Search - Larger Touch Target */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث بالاسم أو الحي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setShowAdvancedSearch(true)}
            className="pr-11 pl-14 h-12 text-base text-right rounded-xl cursor-pointer"
            readOnly
          />
          <button
            onClick={() => setShowAdvancedSearch(true)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="size-4 text-white" />
          </button>
        </div>

        {/* Filters - Swipeable */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
        
        {/* Results Count */}
        <p className="text-sm text-gray-500">
          {filteredAccounts.length} {filteredAccounts.length === 1 ? 'نتيجة' : 'نتائج'}
        </p>
      </motion.div>

      {/* List - Animated Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAccounts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-12 text-center"
            >
              <div className="size-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="size-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">لا توجد نتائج</p>
              <p className="text-gray-400 text-sm mt-2">جرب البحث بكلمات أخرى</p>
            </motion.div>
          ) : (
            filteredAccounts.map((account, index) => (
              <motion.div
                key={account.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/app/leads/${account.id}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md active:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{account.name}</h3>
                      {account.contactPerson && (
                        <p className="text-sm text-gray-600">{account.contactPerson}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(account.lifecycle) + ' text-xs px-3 py-1'}>
                      {getStatusLabel(account.lifecycle)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {account.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        <span className="line-clamp-1">{account.address}</span>
                      </div>
                    )}
                    {account.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 shrink-0" />
                        <span dir="ltr" className="text-left">{account.phone}</span>
                      </div>
                    )}
                    {account.lastVisit && (
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0" />
                        <span>
                          آخر زيارة: {new Date(account.lastVisit).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )}
                    {account.nextAction?.datetime && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg -mx-1"
                      >
                        <Calendar className="size-4 shrink-0" />
                        <span className="font-medium">
                          {account.nextAction.type === 'appointment' ? 'موعد' : 'متابعة'}:{' '}
                          {new Date(account.nextAction.datetime).toLocaleDateString('ar-SA')}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Advanced Search Modal */}
      <AdvancedSearch
        accounts={accounts}
        onResults={(results) => setSearchResults(results)}
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
      />
    </div>
  );
}