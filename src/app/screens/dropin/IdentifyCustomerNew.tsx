/**
 * IdentifyCustomerNew - البحث عن عميل مطابق للتصميم
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Search,
  UserPlus,
  MapPin,
  Phone,
  Building,
  ChevronLeft,
  Users,
} from 'lucide-react';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';

export function IdentifyCustomerNew() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock customers
  const customers = [
    {
      id: '1',
      name: 'محمد أحمد السعيد',
      company: 'شركة التقنية المتقدمة',
      phone: '0501234567',
      location: 'الرياض، حي النخيل',
      lastVisit: 'منذ 3 أيام',
    },
    {
      id: '2',
      name: 'فاطمة علي محمود',
      company: 'مؤسسة النور للتجارة',
      phone: '0507654321',
      location: 'جدة، حي الروضة',
      lastVisit: 'منذ أسبوع',
    },
    {
      id: '3',
      name: 'خالد سعيد',
      company: 'مكتب الاستشارات',
      phone: '0509876543',
      location: 'الدمام، حي الفيصلية',
      lastVisit: 'منذ شهر',
    },
  ];

  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchQuery) ||
    c.company.includes(searchQuery) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-app)' }}
      dir="rtl"
    >
      {/* Header */}
      <div
        className="px-4 py-4"
        style={{
          paddingTop: 'calc(var(--safe-top) + 16px)',
        }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          تحديد العميل
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          ابحث عن العميل أو أضف عميل جديد
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الشركة، أو رقم الجوال..."
            className="w-full h-14 pr-11 pl-4 rounded-xl focus:outline-none text-base"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
            autoFocus
          />
        </div>
      </div>

      {/* Add New Customer Button */}
      <div className="px-4 mb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dropin/quick-add')}
          className="w-full rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: 'var(--color-primary)',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0, 0, 0, 0.1)' }}
            >
              <UserPlus className="size-6" style={{ color: '#000' }} />
            </div>
            <span className="text-base font-bold" style={{ color: '#000' }}>
              إضافة عميل جديد
            </span>
          </div>
          <ChevronLeft className="size-5" style={{ color: '#000' }} />
        </motion.button>
      </div>

      {/* Results */}
      <div className="px-4 flex-1 pb-28">
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {searchQuery ? `نتائج البحث (${filteredCustomers.length})` : 'العملاء القريبون'}
        </h3>

        {filteredCustomers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => navigate(`/dropin/checkin/${customer.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerCard({
  customer,
  onClick,
}: {
  customer: any;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-2xl p-4 text-right"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="size-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-blue)' }}
        >
          <Users className="size-7" style={{ color: '#000' }} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {customer.name}
          </h4>

          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-2">
              <Building className="size-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                {customer.company}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="size-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {customer.phone}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                {customer.location}
              </span>
            </div>
          </div>

          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            آخر زيارة: {customer.lastVisit}
          </div>
        </div>

        {/* Arrow */}
        <ChevronLeft className="size-5 flex-shrink-0 mt-4" style={{ color: 'var(--text-tertiary)' }} />
      </div>
    </motion.button>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div
        className="size-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--bg-card)' }}
      >
        <Search className="size-10" style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        لا توجد نتائج
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        جرب البحث بكلمات مختلفة أو أضف عميل جديد
      </p>
    </div>
  );
}
