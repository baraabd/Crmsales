/**
 * ServicesScreen - شاشة الخدمات (إضافة خدمات)
 * مطابقة للتصميم في الصورة
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Wrench,
  Zap,
  Shield,
  Truck,
  Coffee,
  Wifi,
  Star,
  X,
} from 'lucide-react';
import { GridCard } from '../../design-system/components/GridCard';
import { AppButtonV2 } from '../../design-system/components/AppButtonV2';

const services = [
  { id: 1, icon: <Package />, name: 'منتج أساسي', price: '150 ر.س', color: 'green' as const },
  { id: 2, icon: <Wrench />, name: 'صيانة', price: '200 ر.س', color: 'blue' as const },
  { id: 3, icon: <Zap />, name: 'تركيب سريع', price: '100 ر.س', color: 'orange' as const },
  { id: 4, icon: <Shield />, name: 'ضمان ممتد', price: '300 ر.س', color: 'purple' as const },
  { id: 5, icon: <Truck />, name: 'توصيل', price: '50 ر.س', color: 'cyan' as const },
  { id: 6, icon: <Coffee />, name: 'خدمة VIP', price: '500 ر.س', color: 'red' as const },
];

export function ServicesScreen() {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const total = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + parseInt(s.price), 0);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-app)' }}
      dir="rtl"
    >
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center justify-between"
        style={{
          paddingTop: 'calc(var(--safe-top) + 16px)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          إضافة خدمات
        </h1>
        <button
          className="size-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-card)' }}
        >
          <X className="size-5" style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>

      {/* الخدمات المحددة */}
      {selectedServices.length > 0 && (
        <div className="px-4 mt-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                الخدمات المحددة
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                {selectedServices.length} خدمة
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {total} ر.س
            </div>
          </div>
        </div>
      )}

      {/* شبكة الخدمات */}
      <div className="px-4 mt-6 flex-1 pb-32">
        <h3
          className="text-base font-bold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          اختر الخدمات
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {services.map((service) => (
            <motion.div
              key={service.id}
              animate={{
                scale: selectedServices.includes(service.id) ? 0.98 : 1,
                opacity: selectedServices.includes(service.id) ? 0.9 : 1,
              }}
            >
              <ServiceCard
                {...service}
                selected={selectedServices.includes(service.id)}
                onClick={() => toggleService(service.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* الزر السفلي */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4"
        style={{
          background: 'linear-gradient(to top, var(--bg-app) 80%, transparent)',
          paddingBottom: 'calc(var(--safe-bottom) + 24px)',
        }}
      >
        <AppButtonV2
          variant="primary"
          size="lg"
          fullWidth
          disabled={selectedServices.length === 0}
        >
          متابعة ({selectedServices.length} خدمة)
        </AppButtonV2>
      </div>
    </div>
  );
}

function ServiceCard({
  icon,
  name,
  price,
  color,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  name: string;
  price: string;
  color: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'cyan';
  selected: boolean;
  onClick: () => void;
}) {
  const colorMap = {
    green: 'var(--color-primary)',
    red: 'var(--color-red)',
    blue: 'var(--color-blue)',
    orange: 'var(--color-orange)',
    purple: 'var(--color-purple)',
    cyan: 'var(--color-cyan)',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all"
      style={{
        background: selected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: selected ? `2px solid ${colorMap[color]}` : '2px solid transparent',
        minHeight: '120px',
      }}
    >
      {/* Checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 size-6 rounded-full flex items-center justify-center"
          style={{ background: colorMap[color] }}
        >
          <Star className="size-4" style={{ color: 'white', fill: 'white' }} />
        </motion.div>
      )}

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: colorMap[color] }}
      >
        <div className="[&>svg]:size-6 text-black">{icon}</div>
      </div>

      {/* Info */}
      <div className="text-center">
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {name}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {price}
        </div>
      </div>
    </motion.button>
  );
}
