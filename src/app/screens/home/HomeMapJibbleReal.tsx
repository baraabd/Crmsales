/**
 * Home Map - Real Jibble Style
 * Clean, orange accents, work status indicator
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
  WorkStatusIndicator,
  WorkStatus,
} from '../../../design-system';
import { cn, formatRelativeTime } from '../../../design-system/utils';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const NavigateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

// Map Pin Component
interface MapPinProps {
  lead: any;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

function MapPin({ lead, isSelected, onClick, style }: MapPinProps) {
  const pinColors = {
    hot: '#F97316', // Orange
    warm: '#F59E0B', // Amber
    cold: '#3B82F6', // Blue
    new: '#16A34A', // Green
  };

  return (
    <motion.button
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
      onClick={onClick}
      className="absolute"
      style={style}
    >
      <motion.div
        animate={{
          boxShadow: isSelected
            ? '0 8px 20px rgba(0,0,0,0.2)'
            : '0 4px 12px rgba(0,0,0,0.15)',
        }}
        className="relative w-10 h-10 rounded-xl border-3 border-white flex items-center justify-center shadow-md"
        style={{ backgroundColor: pinColors[lead.status as keyof typeof pinColors] }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        {lead.hasPendingAction && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] border-2 border-white rounded-full"
          />
        )}
      </motion.div>
    </motion.button>
  );
}

export function HomeMapJibbleReal() {
  const navigate = useNavigate();
  const { accounts, isOnline } = useApp();
  
  const [workStatus, setWorkStatus] = useState<WorkStatus>('offDuty');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Transform accounts
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

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Top Bar with Work Status */}
      <div className="bg-white border-b border-[var(--border-light)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Menu */}
          <button className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] rounded-lg">
            <MenuIcon />
          </button>

          {/* Work Status Indicator */}
          <WorkStatusIndicator
            status={workStatus}
            onStatusChange={setWorkStatus}
            showButtons={true}
          />

          {/* Avatar */}
          <button
            onClick={() => navigate('/app/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary-500)] to-[var(--brand-primary-600)] flex items-center justify-center text-white font-bold shadow-sm"
          >
            م
          </button>
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <Banner
          variant="offline"
          message="وضع عدم الاتصال - البيانات محلية"
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

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Clean map background */}
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
            {filteredLeads.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <EmptyState
                  title="لا توجد نتائج"
                  description="جرب البحث بكلمات أخرى"
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

        {/* Navigation Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-6 left-4 z-20 w-12 h-12 rounded-xl bg-white shadow-md border border-[var(--border-light)] flex items-center justify-center text-[var(--text-brand)] hover:shadow-lg"
        >
          <NavigateIcon />
        </motion.button>

        {/* FAB - Orange */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-6 right-4 z-20 w-14 h-14 rounded-[28px] bg-[var(--brand-primary-500)] hover:bg-[var(--brand-primary-600)] text-white shadow-lg flex items-center justify-center"
          onClick={() => navigate('/app/leads/new')}
        >
          <PlusIcon />
        </motion.button>

        {/* Pending Sync Banner */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-[var(--border-light)]">
            <div className="w-2 h-2 bg-[var(--status-warning)] rounded-full animate-pulse" />
            <Text variant="captionSmall" weight="semibold" className="text-[var(--status-warning)]">
              Pending sync
            </Text>
            <span className="flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-[var(--status-warning-light)] text-[var(--status-warning)] text-xs font-bold">
              1
            </span>
          </div>
        </div>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {selectedLead && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLeadId(null)}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30"
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
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-xl z-40 max-h-[70vh]"
              >
                {/* Handle */}
                <div className="pt-3 pb-2 flex justify-center">
                  <div className="w-12 h-1 bg-[var(--neutral-300)] rounded-full" />
                </div>

                <div className="px-4 pb-6">
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
                    onNavigate={() => {}}
                  />

                  <div className="mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => navigate(`/app/dropin/checkin/${selectedLead.id}`)}
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

      {/* Bottom Stats Card */}
      <div className="p-4 bg-white border-t border-[var(--border-light)]">
        <div className="flex items-center justify-between">
          <div>
            <Text variant="captionSmall" color="secondary">
              Targets
            </Text>
            <div className="flex items-baseline gap-2">
              <Text variant="titleLarge" weight="bold">
                2 / 8
              </Text>
              <Text variant="bodySmall" color="secondary">
                New Leads
              </Text>
            </div>
          </div>
          <Button variant="secondary" size="md">
            Navigate
          </Button>
        </div>
      </div>
    </div>
  );
}
