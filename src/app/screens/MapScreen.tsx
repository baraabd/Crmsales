/**
 * MapScreen - Fixed Mobile Layout
 */

import { useState } from 'react';
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

export function MapScreen() {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);

  // Mock customers
  const customers = [
    { id: '1', name: 'محمد أحمد', lat: 0.35, lng: 0.4, status: 'active' },
    { id: '2', name: 'فاطمة علي', lat: 0.6, lng: 0.3, status: 'pending' },
    { id: '3', name: 'خالد سعيد', lat: 0.25, lng: 0.65, status: 'completed' },
    { id: '4', name: 'نورة محمد', lat: 0.7, lng: 0.5, status: 'active' },
  ];

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
          {customers.map((customer) => (
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
                  {customers.length} عميل
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
            <LayerToggle label="العملاء النشطون" color="var(--color-primary)" />
            <LayerToggle label="المواعيد المعلقة" color="var(--color-orange)" />
            <LayerToggle label="الزيارات المكتملة" color="var(--color-blue)" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function LayerToggle({ label, color }: { label: string; color: string }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
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
