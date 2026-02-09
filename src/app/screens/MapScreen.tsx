/**
 * MapScreen - Fixed Mobile Layout
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Users,
  Layers,
  Target,
  Plus,
  Phone,
  Info,
} from 'lucide-react';
import { AppButtonV2 } from '../../design-system/components/AppButtonV2';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

export function MapScreen() {
  const navigate = useNavigate();
  const { accounts, appointments, visits, canAddData } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [layerFilters, setLayerFilters] = useState({
    active: true,
    pending: true,
    completed: true,
  });

  const pendingAppointmentIds = useMemo(() => {
    const now = new Date();
    return new Set(
      appointments
        .filter((apt) => apt.status === 'scheduled' && new Date(apt.date) >= now)
        .map((apt) => apt.accountId)
    );
  }, [appointments]);

  const completedVisitIds = useMemo(() => {
    return new Set(visits.map((visit) => visit.accountId));
  }, [visits]);

  const customers = useMemo(() => {
    return accounts.map((account) => {
      const hasPending = pendingAppointmentIds.has(account.id);
      const hasCompleted = completedVisitIds.has(account.id);
      const isActive = account.lifecycle !== 'lost';
      const status = hasPending ? 'pending' : hasCompleted ? 'completed' : 'active';
      return {
        id: account.id,
        name: account.name,
        address: account.address || '',
        phone: account.phone || '',
        latitude: account.latitude,
        longitude: account.longitude,
        hasPending,
        hasCompleted,
        isActive,
        status,
      };
    });
  }, [accounts, completedVisitIds, pendingAppointmentIds]);

  const mapBounds = useMemo(() => {
    if (customers.length === 0) {
      return {
        minLat: 0,
        maxLat: 1,
        minLng: 0,
        maxLng: 1,
      };
    }

    let minLat = customers[0].latitude;
    let maxLat = customers[0].latitude;
    let minLng = customers[0].longitude;
    let maxLng = customers[0].longitude;

    customers.forEach((customer) => {
      minLat = Math.min(minLat, customer.latitude);
      maxLat = Math.max(maxLat, customer.latitude);
      minLng = Math.min(minLng, customer.longitude);
      maxLng = Math.max(maxLng, customer.longitude);
    });

    const latPadding = Math.max((maxLat - minLat) * 0.1, 0.01);
    const lngPadding = Math.max((maxLng - minLng) * 0.1, 0.01);

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedQuery ||
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.address.toLowerCase().includes(normalizedQuery) ||
        customer.phone.toLowerCase().includes(normalizedQuery);

      const matchesLayer =
        (layerFilters.active && customer.isActive) ||
        (layerFilters.pending && customer.hasPending) ||
        (layerFilters.completed && customer.hasCompleted);

      return matchesSearch && matchesLayer;
    });
  }, [customers, layerFilters, searchQuery]);

  const statusColors: Record<string, string> = {
    active: 'var(--color-primary)',
    pending: 'var(--color-orange)',
    completed: 'var(--color-blue)',
  };

  const selectedCustomerData = customers.find((customer) => customer.id === selectedCustomer) || null;

  const getMarkerPosition = (latitude: number, longitude: number) => {
    const latRange = mapBounds.maxLat - mapBounds.minLat || 1;
    const lngRange = mapBounds.maxLng - mapBounds.minLng || 1;
    const latRatio = (latitude - mapBounds.minLat) / latRange;
    const lngRatio = (longitude - mapBounds.minLng) / lngRange;

    return {
      top: `${(1 - latRatio) * 100}%`,
      right: `${lngRatio * 100}%`,
    };
  };

  const handleAddCustomer = () => {
    if (!canAddData) {
      toast.error('يجب تسجيل الحضور أولاً لإضافة العملاء! ⏰');
      return;
    }
    navigate('/dropin/identify-new');
  };

  const handleStartVisit = (customerId: string) => {
    if (!canAddData) {
      toast.error('يجب تسجيل الحضور أولاً لبدء الزيارة! ⏰');
      return;
    }
    navigate(`/dropin/checkin-new/${customerId}`);
  };

  return (
    <div className="mobile-screen" dir="rtl">
      {/* Map Background */}
      <div className="absolute inset-0">
        <div
          style={{
            background: 'linear-gradient(180deg, #0B0F1A 0%, #1A1F2E 100%)',
            height: '100%',
          }}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Customer Markers */}
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedCustomer(customer.id)}
              className="absolute cursor-pointer"
              style={{
                ...getMarkerPosition(customer.latitude, customer.longitude),
                transform: 'translate(50%, -50%)',
              }}
            >
              <div
                className="relative w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: statusColors[customer.status],
                  boxShadow: `0 0 15px ${statusColors[customer.status]}`,
                }}
              >
                <MapPin className="w-5 h-5" style={{ color: '#000' }} />
                
                {selectedCustomer === customer.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  >
                    <div
                      className="px-3 py-1.5 rounded-lg"
                      style={{
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {customer.name}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                لا توجد عملاء مطابقون للبحث أو الفلاتر
              </div>
            </div>
          )}

          {/* User Location */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute"
            style={{
              top: '50%',
              right: '50%',
              transform: 'translate(50%, -50%)',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--color-blue)',
                boxShadow: '0 0 25px var(--color-blue)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full"
                style={{ background: '#fff' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Bar */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن عميل..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full h-11 pr-10 pl-3 rounded-xl focus:outline-none text-sm"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Filter Button */}
            <button
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-card)' }}
              onClick={() => setShowLayers(!showLayers)}
            >
              <Filter className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="px-4 mt-2">
          <div
            className="rounded-2xl p-3 flex items-center justify-between"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                <Users className="w-5 h-5" style={{ color: '#000' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  عملاء قريبون
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {filteredCustomers.length} عميل
                </div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                في محيط
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                5 كم
              </div>
            </div>
          </div>
        </div>

        {/* FAB Buttons - Left Side */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)',
            }}
            onClick={() => setShowLayers(!showLayers)}
          >
            <Layers className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--color-blue)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Target className="w-5 h-5" style={{ color: 'white' }} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--color-primary)',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            <Navigation className="w-6 h-6" style={{ color: '#000' }} />
          </motion.button>
        </div>

        {/* Bottom Action */}
        <div className="mt-auto px-4 pb-20 pt-3">
          <AppButtonV2
            variant="primary"
            size="lg"
            fullWidth
            icon={<Plus />}
            onClick={handleAddCustomer}
            disabled={!canAddData}
          >
            إضافة عميل جديد
          </AppButtonV2>
        </div>
      </div>

      {/* Layers Panel */}
      {showLayers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-16 left-4 right-4 rounded-2xl p-3 z-20"
          style={{
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            الطبقات
          </h3>
          
          <div className="space-y-2">
            <LayerToggle
              label="العملاء النشطون"
              color="var(--color-primary)"
              enabled={layerFilters.active}
              onToggle={() =>
                setLayerFilters((prev) => ({ ...prev, active: !prev.active }))
              }
            />
            <LayerToggle
              label="المواعيد المعلقة"
              color="var(--color-orange)"
              enabled={layerFilters.pending}
              onToggle={() =>
                setLayerFilters((prev) => ({ ...prev, pending: !prev.pending }))
              }
            />
            <LayerToggle
              label="الزيارات المكتملة"
              color="var(--color-blue)"
              enabled={layerFilters.completed}
              onToggle={() =>
                setLayerFilters((prev) => ({ ...prev, completed: !prev.completed }))
              }
            />
          </div>
        </motion.div>
      )}

      {/* Selected Customer Card */}
      {selectedCustomerData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-4 right-4 rounded-2xl p-4 z-20"
          style={{
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedCustomerData.name}
              </div>
              {selectedCustomerData.address && (
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {selectedCustomerData.address}
                </div>
              )}
              {selectedCustomerData.phone && (
                <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }} dir="ltr">
                  {selectedCustomerData.phone}
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-xs font-semibold"
              style={{ color: 'var(--text-tertiary)' }}
            >
              إغلاق
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStartVisit(selectedCustomerData.id)}
              className="h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              style={{
                background: canAddData ? 'var(--color-primary)' : 'var(--interactive-disabled)',
                color: canAddData ? '#000' : 'var(--text-disabled)',
              }}
              disabled={!canAddData}
            >
              <Navigation className="w-4 h-4" />
              زيارة
            </button>
            <button
              onClick={() => selectedCustomerData.phone && (window.location.href = `tel:${selectedCustomerData.phone}`)}
              className="h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
              disabled={!selectedCustomerData.phone}
            >
              <Phone className="w-4 h-4" />
              اتصال
            </button>
            <button
              onClick={() => navigate(`/app/leads/${selectedCustomerData.id}`)}
              className="h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <Info className="w-4 h-4" />
              تفاصيل
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function LayerToggle({
  label,
  color,
  enabled,
  onToggle,
}: {
  label: string;
  color: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2 rounded-xl transition-all"
      style={{
        background: enabled ? 'var(--bg-input)' : 'transparent',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: color, opacity: enabled ? 1 : 0.3 }}
        />
        <span
          className="text-xs font-medium"
          style={{ color: enabled ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
        >
          {label}
        </span>
      </div>
      <div
        className="w-4 h-4 rounded flex items-center justify-center"
        style={{
          background: enabled ? color : 'transparent',
          border: `2px solid ${enabled ? color : 'var(--border-color)'}`,
        }}
      >
        {enabled && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#000' }} />}
      </div>
    </button>
  );
}
