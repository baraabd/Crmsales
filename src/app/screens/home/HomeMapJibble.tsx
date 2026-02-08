/**
 * Home Map Screen - Jibble Style
 * Vibrant colors, dramatic shadows, smooth animations
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import {
  Text,
  Card,
  Badge,
  Button,
  TextField,
  Banner,
  EmptyState,
  TopBar,
  TopBarIconButton,
  LeadCard,
} from '../../../design-system';
import { cn, formatDistance, formatRelativeTime } from '../../../design-system/utils';

// Icons (same as before)
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const LocateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Jibble-Style Filter Chip
interface FilterChipProps {
  label: string;
  count?: number;
  active: boolean;
  color: 'all' | 'hot' | 'warm' | 'cold' | 'new';
  onClick: () => void;
}

function FilterChip({ label, count, active, color, onClick }: FilterChipProps) {
  const activeGradients = {
    all: 'gradient-primary',
    hot: 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]',
    warm: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]',
    cold: 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB]',
    new: 'bg-gradient-to-r from-[#10B981] to-[#059669]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-5 h-11',
        'rounded-full font-bold text-sm whitespace-nowrap',
        'transition-all duration-200',
        active
          ? cn(activeGradients[color], 'text-white shadow-lg')
          : 'bg-white text-[var(--text-secondary)] border-2 border-[var(--border-light)] hover:border-[var(--brand-primary-300)]'
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold',
            active ? 'bg-white/20' : 'bg-[var(--neutral-100)]'
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

// Jibble-Style Map Pin
interface MapPinProps {
  lead: any;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

function MapPin({ lead, isSelected, onClick, style }: MapPinProps) {
  const pinGradients = {
    hot: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626]',
    warm: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
    cold: 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]',
    new: 'bg-gradient-to-br from-[#10B981] to-[#059669]',
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isSelected ? 1.5 : 1,
        opacity: 1,
        y: isSelected ? -10 : 0,
        zIndex: isSelected ? 50 : 10,
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 1.2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className="absolute"
      style={style}
    >
      <motion.div
        animate={{
          boxShadow: isSelected
            ? '0 20px 50px rgba(0,0,0,0.3)'
            : '0 8px 20px rgba(0,0,0,0.15)',
        }}
        className={cn(
          'relative w-12 h-12 rounded-2xl',
          'border-4 border-white',
          'flex items-center justify-center',
          pinGradients[lead.status as keyof typeof pinGradients]
        )}
      >
        {/* Icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        {/* Badge */}
        {lead.hasPendingAction && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#EF4444] border-3 border-white rounded-full shadow-lg"
          />
        )}

        {/* Pulse Ring */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className={cn(
              'absolute inset-0 rounded-2xl',
              pinGradients[lead.status as keyof typeof pinGradients]
            )}
          />
        )}
      </motion.div>
    </motion.button>
  );
}

export function HomeMapJibble() {
  const navigate = useNavigate();
  const { accounts, isOnline } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hot' | 'warm' | 'cold' | 'new'>('all');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Transform accounts to leads
  const leads = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    businessName: account.companyName,
    phone: account.phone,
    status: account.lifecycle === 'customer' ? 'hot' : 
            account.lifecycle === 'warm' ? 'warm' : 
            account.lifecycle === 'cold' ? 'cold' : 'new',
    distance: Math.random() * 5000,
    lastContact: account.lastVisit || new Date().toISOString(),
    notesCount: 0,
    hasPendingAction: account.nextAction !== undefined,
    address: account.address,
  }));

  // Filter logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || lead.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const filterCounts = {
    all: leads.length,
    hot: leads.filter((l) => l.status === 'hot').length,
    warm: leads.filter((l) => l.status === 'warm').length,
    cold: leads.filter((l) => l.status === 'cold').length,
    new: leads.filter((l) => l.status === 'new').length,
  };

  const selectedLead = selectedLeadId
    ? filteredLeads.find((l) => l.id === selectedLeadId)
    : null;

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      setSelectedLeadId(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-canvas)] overflow-hidden" dir="rtl">
      {/* Top Bar */}
      <TopBar
        title="الخريطة"
        variant="elevated"
        leftContent={
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/app/profile')}
            className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold shadow-primary"
          >
            م
          </motion.button>
        }
        rightContent={
          <>
            <TopBarIconButton
              icon={<SearchIcon />}
              onClick={() => setShowSearchBar(!showSearchBar)}
              label="بحث"
            />
            <TopBarIconButton
              icon={<LayersIcon />}
              onClick={() => {}}
              label="الطبقات"
            />
          </>
        }
      />

      {/* Offline Banner */}
      {!isOnline && (
        <Banner
          variant="offline"
          message="وضع عدم الاتصال - البيانات من الذاكرة المحلية"
          size="sm"
        />
      )}

      {/* Search Bar */}
      <AnimatePresence>
        {showSearchBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-b-2 border-[var(--border-light)] overflow-hidden"
          >
            <div className="p-4">
              <TextField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="ابحث عن عميل..."
                startAdornment={<SearchIcon />}
                size="lg"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Chips */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b-2 border-[var(--border-light)] p-4"
      >
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip
            label="الكل"
            count={filterCounts.all}
            active={selectedFilter === 'all'}
            color="all"
            onClick={() => setSelectedFilter('all')}
          />
          <FilterChip
            label="ساخن 🔥"
            count={filterCounts.hot}
            active={selectedFilter === 'hot'}
            color="hot"
            onClick={() => setSelectedFilter('hot')}
          />
          <FilterChip
            label="دافئ ☀️"
            count={filterCounts.warm}
            active={selectedFilter === 'warm'}
            color="warm"
            onClick={() => setSelectedFilter('warm')}
          />
          <FilterChip
            label="بارد ❄️"
            count={filterCounts.cold}
            active={selectedFilter === 'cold'}
            color="cold"
            onClick={() => setSelectedFilter('cold')}
          />
          <FilterChip
            label="جديد ✨"
            count={filterCounts.new}
            active={selectedFilter === 'new'}
            color="new"
            onClick={() => setSelectedFilter('new')}
          />
        </div>
      </motion.div>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Vibrant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary-50)] via-[var(--brand-secondary-50)] to-[var(--brand-accent-50)]">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(var(--brand-primary-200) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary-200) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Pins */}
          <AnimatePresence>
            {filteredLeads.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <EmptyState
                  title="لا توجد نتائج"
                  description="جرب تغيير الفلتر أو البحث"
                  size="md"
                />
              </div>
            ) : (
              filteredLeads.map((lead, index) => {
                const top = 20 + ((index * 17) % 55);
                const left = 15 + ((index * 23) % 65);

                return (
                  <MapPin
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadId === lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    style={{ top: `${top}%`, left: `${left}%` }}
                  />
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Location Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            'absolute bottom-6 left-4 z-20',
            'w-14 h-14 rounded-2xl',
            'bg-white shadow-lg border-2 border-[var(--border-light)]',
            'flex items-center justify-center',
            'text-[var(--brand-primary-600)]',
            'hover:shadow-xl'
          )}
        >
          <LocateIcon />
        </motion.button>

        {/* FAB - Jibble Style */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            'absolute bottom-6 right-4 z-20',
            'w-16 h-16 rounded-[24px]',
            'gradient-primary text-white',
            'shadow-primary hover:shadow-xl',
            'flex items-center justify-center'
          )}
          onClick={() => navigate('/app/leads/new')}
        >
          <PlusIcon />
        </motion.button>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {selectedLead && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLeadId(null)}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm z-30"
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl z-40 max-h-[70vh] overflow-hidden"
              >
                {/* Handle */}
                <div className="pt-4 pb-3 flex justify-center">
                  <div className="w-14 h-1.5 bg-[var(--neutral-300)] rounded-full" />
                </div>

                <div className="px-5 pb-6 overflow-y-auto max-h-[calc(70vh-40px)]">
                  <LeadCard
                    name={selectedLead.name}
                    businessName={selectedLead.businessName}
                    phone={selectedLead.phone}
                    status={selectedLead.status}
                    distance={selectedLead.distance}
                    lastContact={formatRelativeTime(new Date(selectedLead.lastContact))}
                    notesCount={selectedLead.notesCount}
                    showActions={true}
                    onCall={() => {
                      window.location.href = `tel:${selectedLead.phone}`;
                    }}
                    onNavigate={() => {
                      console.log('Navigate');
                    }}
                  />

                  <div className="mt-5">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => {
                        navigate(`/app/dropin/checkin/${selectedLead.id}`);
                      }}
                    >
                      🚀 بدء زيارة ميدانية
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
