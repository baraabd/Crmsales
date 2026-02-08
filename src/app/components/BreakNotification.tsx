import React from 'react';
import { motion } from 'motion/react';
import { Coffee, Clock } from 'lucide-react';

interface BreakNotificationProps {
  breakTimeRemaining: number;
  onEndBreak: () => void;
}

export function BreakNotification({ breakTimeRemaining, onEndBreak }: BreakNotificationProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = breakTimeRemaining <= 5 * 60 && breakTimeRemaining > 0;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={`fixed top-4 right-4 left-4 z-50 ${
        isWarning ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
      } text-white rounded-2xl shadow-2xl p-4 flex items-center gap-4`}
      dir="rtl"
    >
      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
        {isWarning ? (
          <Clock className="w-6 h-6 animate-pulse" />
        ) : (
          <Coffee className="w-6 h-6" />
        )}
      </div>
      
      <div className="flex-1">
        <p className="font-semibold text-sm">
          {isWarning ? '⏰ قرب انتهاء الاستراحة!' : '☕ وقت الاستراحة'}
        </p>
        <p className="text-xs text-white/90">
          {isWarning ? 'استعد للعودة للعمل' : 'أنت في استراحة الآن'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono">
            {formatTime(breakTimeRemaining)}
          </div>
          <div className="text-xs text-white/80">متبقي</div>
        </div>
        
        <button
          onClick={onEndBreak}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 active:scale-95"
        >
          إنهاء الاستراحة
        </button>
      </div>
    </motion.div>
  );
}
