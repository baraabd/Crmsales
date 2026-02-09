/**
 * MapScreen - Fixed Mobile Layout
 */

import { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { AppButtonV2 } from '../../design-system/components/AppButtonV2';
import { useApp } from '../contexts/AppContext';

type MapCustomerStatus = 'active' | 'pending' | 'completed';

interface MapCustomer {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: MapCustomerStatus;
  phone?: string;
  address?: string;
  lastVisit?: string;
}

export function MapScreen() {
  const navigate = useNavigate();
  const { accounts } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [layerFilters, setLayerFilters] = useState({
    active: true,
    pending: true,
    completed: true,
  });

  // Mock customers
  const customers = useMemo<MapCustomer[]>(() => {
    if (!accounts.length) {
      return [
        { id: '1', name: 'محمد أحمد', lat: 0.35, lng: 0.4, status: 'active' },
        { id: '2', name: 'فاطمة علي', lat: 0.6, lng: 0.3, status: 'pending' },
        { id: '3', name: 'خالد سعيد', lat: 0.25, lng: 0.65, status: 'completed' },
        { id: '4', name: 'نورة محمد', lat: 0.7, lng: 0.5, status: 'active' },
      ];
    }

    const lats = accounts.map((account) => account.latitude);
    const lngs = accounts.map((account) => account.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const normalize = (value: number, min: number, max: number) => {
      if (max === min) return 0.5;
      return (value - min) / (max - min);
    };

    return accounts.map((account) => {
      const status: MapCustomerStatus = account.nextAction?.type === 'appointment'
        ? 'pending'
        : account.lastVisit
          ? 'completed'
          : 'active';

      return {
        id: account.id,
        name: account.name,
        phone: account.phone,
        address: account.address,
        lastVisit: account.lastVisit,
        status,
        lat: 0.1 + normalize(account.latitude, minLat, maxLat) * 0.8,
        lng: 0.1 + normalize(account.longitude, minLng, maxLng) * 0.8,
      };
    });
  }, [accounts]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim();
    return customers.filter((customer) => {
      const matchesLayer = layerFilters[customer.status];
      const matchesSearch =
        !normalizedQuery || customer.name.includes(normalizedQuery);
      return matchesLayer && matchesSearch;
    });
  }, [customers, layerFilters, searchQuery]);

  const statusCounts = useMemo(() => {
    return customers.reduce(
      (counts, customer) => {
        counts[customer.status] += 1;
        return counts;
      },
      { active: 0, pending: 0, completed: 0 }
    );
  }, [customers]);

  const selectedCustomerData = selectedCustomer
    ? customers.find((customer) => customer.id === selectedCustomer)
    : null;

  useEffect(() => {
    if (selectedCustomer && !filteredCustomers.some((customer) => customer.id === selectedCustomer)) {
      setSelectedCustomer(null);
    }
  }, [filteredCustomers, selectedCustomer]);

  const statusColors: Record<string, string> = {
    active: 'var(--color-primary)',
    pending: 'var(--color-orange)',
    completed: 'var(--color-blue)',
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
                top: `${customer.lat * 100}%`,
                right: `${customer.lng * 100}%`,
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

        {/* Selected Customer Actions */}
        {selectedCustomerData && (
          <div className="px-4 mt-3">
            <div
              className="rounded-2xl p-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedCustomerData.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedCustomerData.status === 'active'
                      ? 'عميل نشط'
                      : selectedCustomerData.status === 'pending'
                        ? 'موعد معلق'
                        : 'زيارة مكتملة'}
                  </div>
                </div>
                <div
                  className="px-2 py-1 rounded-lg text-[11px]"
                  style={{
                    background: 'var(--bg-input)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {selectedCustomerData.phone || 'بدون رقم'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex-1 h-10 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                  onClick={() => navigate(`/app/leads/${selectedCustomerData.id}`)}
                >
                  عرض البيانات
                </button>
                <button
                  className="flex-1 h-10 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#000',
                  }}
                  onClick={() => navigate(`/dropin/checkin-new/${selectedCustomerData.id}`)}
                >
                  بدء زيارة
                </button>
              </div>
            </div>
          </div>
        )}

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
            onClick={() => navigate('/dropin/quick-add')}
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
              label={`العملاء النشطون (${statusCounts.active})`}
              color="var(--color-primary)"
              enabled={layerFilters.active}
              onToggle={() =>
                setLayerFilters((prev) => ({ ...prev, active: !prev.active }))
              }
            />
            <LayerToggle
              label={`المواعيد المعلقة (${statusCounts.pending})`}
              color="var(--color-orange)"
              enabled={layerFilters.pending}
              onToggle={() =>
                setLayerFilters((prev) => ({ ...prev, pending: !prev.pending }))
              }
            />
            <LayerToggle
              label={`الزيارات المكتملة (${statusCounts.completed})`}
              color="var(--color-blue)"
              enabled={layerFilters.completed}
              onToggle={() =>
                setLayerFilters((prev) => ({ ...prev, completed: !prev.completed }))
              }
            />
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
