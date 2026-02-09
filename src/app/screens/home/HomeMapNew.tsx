/**
 * Home Map Screen - FieldCRM
 * Modern, Professional, Mobile-First Map Experience
 * UX inspired by: Google Maps, Uber, Waze
 */

import React, { useState, useRef } from 'react';
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

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Filter Chip Component
interface FilterChipProps {
  label: string;
  count?: number;
  active: boolean;
  color: 'all' | 'hot' | 'warm' | 'cold' | 'new';
  onClick: () => void;
}

function FilterChip({ label, count, active, color, onClick }: FilterChipProps) {
  const colorClasses = {
    all: active ? 'bg-[var(--brand-blue-500)] text-white' : 'bg-white text-[var(--text-secondary)]',
    hot: active ? 'bg-[var(--status-error)] text-white' : 'bg-white text-[var(--text-secondary)]',
    warm: active ? 'bg-[var(--status-warning)] text-white' : 'bg-white text-[var(--text-secondary)]',
    cold: active ? 'bg-[var(--status-info)] text-white' : 'bg-white text-[var(--text-secondary)]',
    new: active ? 'bg-[var(--status-success)] text-white' : 'bg-white text-[var(--text-secondary)]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 h-9',
        'rounded-full border',
        'text-sm font-semibold whitespace-nowrap',
        'transition-all duration-200',
        active
          ? 'border-transparent shadow-md'
          : 'border-[var(--border-main)] hover:border-[var(--border-focus)]',
        colorClasses[color]
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold',
            active ? 'bg-white/20' : 'bg-[var(--neutral-slate-100)]'
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

// Map Pin Component
interface MapPinProps {
  lead: any;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

function MapPin({ lead, isSelected, onClick, style }: MapPinProps) {
  const pinColors = {
    hot: 'bg-[var(--status-error)]',
    warm: 'bg-[var(--status-warning)]',
    cold: 'bg-[var(--status-info)]',
    new: 'bg-[var(--status-success)]',
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isSelected ? 1.4 : 1,
        opacity: 1,
        y: isSelected ? -8 : 0,
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
            ? '0 16px 40px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.15)',
        }}
        className={cn(
          'relative w-11 h-11 rounded-full border-3 border-white',
          'flex items-center justify-center',
          pinColors[lead.status as keyof typeof pinColors]
        )}
      >
        {/* Icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        {/* Badge for pending action */}
        {lead.hasPendingAction && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--status-error)] border-2 border-white rounded-full"
          />
        )}

        {/* Pulse animation when selected */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className={cn(
              'absolute inset-0 rounded-full',
              pinColors[lead.status as keyof typeof pinColors]
            )}
          />
        )}
      </motion.div>
    </motion.button>
  );
}

export function HomeMapNew() {
  const navigate = useNavigate();
  const { accounts, isOnline } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hot' | 'warm' | 'cold' | 'new'>('all');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Transform accounts to leads format
  const leads = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    businessName: account.companyName,
    phone: account.phone,
    status: account.lifecycle === 'customer' ? 'hot' : 
            account.lifecycle === 'warm' ? 'warm' : 
            account.lifecycle === 'cold' ? 'cold' : 'new',
    distance: Math.random() * 5000, // Mock distance
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

  // Bottom sheet drag handler
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
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-blue-500)] to-[var(--brand-blue-600)] flex items-center justify-center text-white font-bold shadow-md"
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
          message="أنت غير متصل. البيانات المعروضة من الذاكرة المحلية."
          size="sm"
        />
      )}

      {/* Search Bar (Expandable) */}
      <AnimatePresence>
        {showSearchBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-b border-[var(--border-light)] overflow-hidden"
          >
            <div className="p-4">
              <TextField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="ابحث عن عميل..."
                startAdornment={<SearchIcon />}
                size="md"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white border-b border-[var(--border-light)] p-3"
          >
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <FilterChip
                label="الكل"
                count={filterCounts.all}
                active={selectedFilter === 'all'}
                color="all"
                onClick={() => setSelectedFilter('all')}
              />
              <FilterChip
                label="ساخن"
                count={filterCounts.hot}
                active={selectedFilter === 'hot'}
                color="hot"
                onClick={() => setSelectedFilter('hot')}
              />
              <FilterChip
                label="دافئ"
                count={filterCounts.warm}
                active={selectedFilter === 'warm'}
                color="warm"
                onClick={() => setSelectedFilter('warm')}
              />
              <FilterChip
                label="بارد"
                count={filterCounts.cold}
                active={selectedFilter === 'cold'}
                color="cold"
                onClick={() => setSelectedFilter('cold')}
              />
              <FilterChip
                label="جديد"
                count={filterCounts.new}
                active={selectedFilter === 'new'}
                color="new"
                onClick={() => setSelectedFilter('new')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-blue-50)] via-[var(--neutral-slate-50)] to-[var(--brand-blue-100)]">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Pins */}
          <AnimatePresence>
            {filteredLeads.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <EmptyState
                  title="لا توجد نتائج"
                  description="جرب تغيير معايير البحث أو الفلتر"
                  size="md"
                />
              </div>
            ) : (
              filteredLeads.map((lead, index) => {
                // Pseudo-random positioning (in real app, use actual coordinates)
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

        {/* My Location Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className={cn(
            'absolute bottom-6 left-4 z-20',
            'w-12 h-12 rounded-full',
            'bg-white shadow-lg border border-[var(--border-light)]',
            'flex items-center justify-center',
            'text-[var(--brand-blue-600)]',
            'active:bg-[var(--neutral-slate-50)]'
          )}
          onClick={() => {
            // Center map on user location
            console.log('Center on my location');
          }}
        >
          <LocateIcon />
        </motion.button>

        {/* FAB - Add Lead */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            'absolute bottom-6 right-4 z-20',
            'w-14 h-14 rounded-2xl',
            'bg-[var(--brand-blue-500)] text-white',
            'shadow-lg',
            'flex items-center justify-center',
            'active:bg-[var(--brand-blue-600)]'
          )}
          onClick={() => navigate('/app/leads/new')}
        >
          <PlusIcon />
        </motion.button>

        {/* Bottom Sheet - Lead Details */}
        <AnimatePresence>
          {selectedLead && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLeadId(null)}
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
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 max-h-[70vh] overflow-hidden"
              >
                {/* Drag Handle */}
                <div className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1.5 bg-[var(--neutral-slate-300)] rounded-full" />
                </div>

                {/* Content */}
                <div className="px-4 pb-6 overflow-y-auto max-h-[calc(70vh-40px)]">
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
                      // Open navigation app
                      console.log('Navigate to', selectedLead.address);
                    }}
                  />

                  {/* Primary Action */}
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => {
                        navigate(`/dropin/checkin-new/${selectedLead.id}`);
                      }}
                    >
                      بدء زيارة ميدانية
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Safe Area Bottom Padding */}
      <div className="h-16 bg-transparent pointer-events-none" />

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
