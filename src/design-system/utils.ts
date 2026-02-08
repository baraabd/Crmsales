/**
 * Design System Utilities
 * Helper functions for the component library
 */

import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 * Usage: cn('px-2 py-1', className, { 'bg-red-500': hasError })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert spacing value to CSS
 * Usage: toCSSValue(4) => '16px', toCSSValue('1rem') => '1rem'
 */
export function toCSSValue(value: string | number): string {
  if (typeof value === 'number') {
    return `${value * 4}px`; // 4px grid
  }
  return value;
}

/**
 * Get initials from name
 * Usage: getInitials('أحمد محمد') => 'أم'
 */
export function getInitials(name: string, maxChars: number = 2): string {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, maxChars).toUpperCase();
  }
  
  return words
    .slice(0, maxChars)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * Format currency
 * Usage: formatCurrency(1234.56, 'SAR') => '1,234.56 ر.س'
 */
export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  const formatted = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return formatted;
}

/**
 * Format date (Arabic)
 * Usage: formatDate(new Date()) => 'الجمعة، 5 فبراير 2026'
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'medium' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = format === 'short' 
    ? { day: 'numeric', month: 'numeric', year: 'numeric' }
    : format === 'long'
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric' };
  
  return new Intl.DateTimeFormat('ar-SA', options).format(d);
}

/**
 * Format time (Arabic)
 * Usage: formatTime(new Date()) => '01:46 ص'
 */
export function formatTime(date: Date | string, includeSeconds: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  };
  
  return new Intl.DateTimeFormat('ar-SA', options).format(d);
}

/**
 * Format relative time (Arabic)
 * Usage: formatRelativeTime(new Date(Date.now() - 60000)) => 'منذ دقيقة'
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} ${diffMins === 1 ? 'دقيقة' : 'دقائق'}`;
  if (diffHours < 24) return `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
  if (diffDays < 7) return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
  
  return formatDate(d, 'short');
}

/**
 * Truncate text
 * Usage: truncate('Long text here', 10) => 'Long text...'
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format phone number (Saudi format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: +966 XX XXX XXXX
  if (cleaned.startsWith('966')) {
    const match = cleaned.match(/^(966)(\d{2})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  }
  
  // Format: 05X XXX XXXX
  const match = cleaned.match(/^(0\d)(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}${match[2]} ${match[3]}`;
  }
  
  return phone;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Format distance (meters to human readable)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} م`;
  }
  return `${(meters / 1000).toFixed(1)} كم`;
}
