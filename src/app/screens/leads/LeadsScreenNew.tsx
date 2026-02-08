/**
 * LeadsScreenNew - Fixed Mobile Layout
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Building,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AppButtonV2 } from '../../../design-system/components/AppButtonV2';

export function LeadsScreenNew() {
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const leads = [
    {
      id: '1',
      name: 'محمد أحمد السعيد',
      company: 'شركة التقنية',
      status: 'hot',
      value: '50,000 ر.س',
      phone: '0501234567',
      location: 'الرياض',
      lastContact: 'منذ ساعتين',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      company: 'مؤسسة النور',
      status: 'warm',
      value: '30,000 ر.س',
      phone: '0507654321',
      location: 'جدة',
      lastContact: 'أمس',
    },
    {
      id: '3',
      name: 'خالد سعيد',
      company: 'مكتب الاستشارات',
      status: 'cold',
      value: '15,000 ر.س',
      phone: '0509876543',
      location: 'الدمام',
      lastContact: 'منذ 3 أيام',
    },
  ];

  const statusConfig = {
    hot: { label: 'ساخن', color: 'var(--color-red)', icon: TrendingUp },
    warm: { label: 'دافئ', color: 'var(--color-orange)', icon: Clock },
    cold: { label: 'بارد', color: 'var(--color-blue)', icon: CheckCircle2 },
  };

  const filteredLeads = leads.filter(lead => 
    (filter === 'all' || lead.status === filter) &&
    (searchQuery === '' || lead.name.includes(searchQuery) || lead.company.includes(searchQuery))
  );

  return (
    <div className="mobile-screen" dir="rtl">
      <div className="mobile-content">
        <div className="px-4">
          {/* Header */}
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  العملاء
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {filteredLeads.length} عميل محتمل
                </p>
              </div>

              <button
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}
              >
                <Plus className="w-6 h-6" style={{ color: '#000' }} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <StatCard label="ساخن" value="1" color="var(--color-red)" />
              <StatCard label="دافئ" value="1" color="var(--color-orange)" />
              <StatCard label="بارد" value="1" color="var(--color-blue)" />
            </div>

            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن عميل..."
                  className="w-full h-11 pr-10 pl-3 rounded-xl focus:outline-none text-sm"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <FilterTab
                label="الكل"
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterTab
                label="ساخن"
                active={filter === 'hot'}
                onClick={() => setFilter('hot')}
                color="var(--color-red)"
              />
              <FilterTab
                label="دافئ"
                active={filter === 'warm'}
                onClick={() => setFilter('warm')}
                color="var(--color-orange)"
              />
              <FilterTab
                label="بارد"
                active={filter === 'cold'}
                onClick={() => setFilter('cold')}
                color="var(--color-blue)"
              />
            </div>
          </div>

          {/* Leads List */}
          <div className="pb-4">
            <div className="space-y-2">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} statusConfig={statusConfig} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-2 text-center"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="text-lg font-bold mb-0.5" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
      style={{
        background: active ? (color || 'var(--color-primary)') : 'var(--bg-card)',
        color: active ? '#000' : 'var(--text-secondary)',
      }}
    >
      {label}
    </motion.button>
  );
}

function LeadCard({ lead, statusConfig }: { lead: any; statusConfig: any }) {
  const config = statusConfig[lead.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl p-3"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: config.color }}
          >
            <Users className="w-5 h-5" style={{ color: '#000' }} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold mb-0.5 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
              {lead.name}
            </h4>
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {lead.company}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className="px-2 py-1 rounded-lg flex items-center gap-1 flex-shrink-0"
          style={{
            background: `${config.color}20`,
            border: `1px solid ${config.color}`,
          }}
        >
          <StatusIcon className="w-3 h-3" style={{ color: config.color }} />
          <span className="text-[10px] font-semibold" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {lead.phone}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {lead.location}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            القيمة المتوقعة
          </div>
          <div className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
            {lead.value}
          </div>
        </div>

        <div className="text-left">
          <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            آخر تواصل
          </div>
          <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {lead.lastContact}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
