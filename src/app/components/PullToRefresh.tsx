import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  const rotate = useTransform(y, [0, 80], [0, 360]);
  const opacity = useTransform(y, [0, 80], [0, 1]);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    y.set(0);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    // Only allow pull-to-refresh when at the top
    if (scrollTop === 0 && info.offset.y > 0) {
      y.set(Math.min(info.offset.y, 100));
    }
  };

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      {/* Pull Indicator */}
      <motion.div
        style={{ 
          y: y,
          opacity: opacity,
        }}
        className="absolute top-0 left-0 right-0 flex justify-center pt-2 z-50"
      >
        <div className="rounded-full p-3 shadow-lg" style={{ background: 'var(--bg-surface)' }}>
          <motion.div style={{ rotate }}>
            <RefreshCw 
              className={`size-6 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ color: 'var(--brand-primary-600)' }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: isRefreshing ? 60 : y }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}