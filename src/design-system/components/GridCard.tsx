/**
 * GridCard - Fixed Mobile Version
 */

import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GridCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  color: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'cyan';
  onClick?: () => void;
  badge?: string | number;
}

const colorMap = {
  green: '#00E676',
  red: '#FF3B47',
  blue: '#4E7CFF',
  orange: '#FF9500',
  purple: '#9B51E0',
  cyan: '#00D9FF',
};

export function GridCard({ icon, title, subtitle, color, onClick, badge }: GridCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all w-full"
      style={{
        background: 'var(--bg-card)',
        border: 'none',
        cursor: 'pointer',
        minHeight: '100px',
        aspectRatio: '1',
      }}
    >
      {/* Badge */}
      {badge !== undefined && (
        <div
          className="absolute top-2 right-2 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: 'var(--color-red)',
            color: 'white',
          }}
        >
          {badge}
        </div>
      )}

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: colorMap[color],
        }}
      >
        <div className="[&>svg]:w-5 [&>svg]:h-5 text-black">
          {icon}
        </div>
      </div>

      {/* Title */}
      <div className="text-center w-full px-1">
        <div
          className="text-xs font-semibold leading-tight line-clamp-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className="text-[10px] mt-0.5 line-clamp-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </motion.button>
  );
}
