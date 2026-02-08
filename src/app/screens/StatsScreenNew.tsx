/**
 * StatsScreenNew - شاشة الإحصائيات
 * مطابقة للتصميم في الصورة
 */

import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Target,
} from 'lucide-react';

export function StatsScreenNew() {
  return (
    <div
      className="min-h-screen"
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
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          الإحصائيات
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          أداء هذا الشهر
        </p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <BigStatCard
            icon={<DollarSign />}
            label="إجمالي المبيعات"
            value="45,320 ر.س"
            change="+12.5%"
            trend="up"
            color="var(--color-primary)"
          />
          <BigStatCard
            icon={<Users />}
            label="عملاء جدد"
            value="127"
            change="+8.2%"
            trend="up"
            color="var(--color-blue)"
          />
          <BigStatCard
            icon={<ShoppingBag />}
            label="الطلبات"
            value="89"
            change="-3.1%"
            trend="down"
            color="var(--color-orange)"
          />
          <BigStatCard
            icon={<CheckCircle2 />}
            label="معدل الإنجاز"
            value="94%"
            change="+5.4%"
            trend="up"
            color="var(--color-purple)"
          />
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="px-4 mt-6">
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--bg-card)' }}
        >
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            الأداء الأسبوعي
          </h3>
          
          {/* Chart - Simplified bars */}
          <div className="flex items-end justify-between h-40 gap-2">
            {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex-1 rounded-t-lg"
                style={{
                  background: i === 6 ? 'var(--color-primary)' : 'var(--color-blue)',
                  opacity: i === 6 ? 1 : 0.5,
                }}
              />
            ))}
          </div>
          
          {/* Days */}
          <div className="flex justify-between mt-3">
            {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, i) => (
              <div
                key={i}
                className="text-xs text-center"
                style={{ color: i === 6 ? 'var(--color-primary)' : 'var(--text-tertiary)' }}
              >
                {day[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الأهداف */}
      <div className="px-4 mt-6">
        <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          الأهداف
        </h3>
        
        <div className="space-y-3">
          <GoalCard
            icon={<Target />}
            label="مبيعات الشهر"
            current={45320}
            target={50000}
            color="var(--color-primary)"
          />
          <GoalCard
            icon={<Users />}
            label="عملاء جدد"
            current={127}
            target={150}
            color="var(--color-blue)"
          />
          <GoalCard
            icon={<Clock />}
            label="ساعات العمل"
            current={156}
            target={180}
            color="var(--color-orange)"
          />
        </div>
      </div>
    </div>
  );
}

function BigStatCard({
  icon,
  label,
  value,
  change,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="size-10 rounded-xl flex items-center justify-center"
          style={{ background: color }}
        >
          <div className="[&>svg]:size-5 text-black">{icon}</div>
        </div>
        <div
          className="flex items-center gap-1 text-xs font-semibold"
          style={{
            color: trend === 'up' ? 'var(--color-primary)' : 'var(--color-red)',
          }}
        >
          {trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {change}
        </div>
      </div>
      
      <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </div>
  );
}

function GoalCard({
  icon,
  label,
  current,
  target,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  const percentage = (current / target) * 100;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="size-10 rounded-xl flex items-center justify-center"
          style={{ background: color }}
        >
          <div className="[&>svg]:size-5 text-black">{icon}</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {current.toLocaleString()} / {target.toLocaleString()}
          </div>
        </div>
        <div className="text-lg font-bold" style={{ color }}>
          {Math.round(percentage)}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-input)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
