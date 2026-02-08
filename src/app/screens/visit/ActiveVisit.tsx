/**
 * Active Visit Screen - شاشة الزيارة النشطة
 * مع Check-in GPS، ملاحظات التفاعل، والصور
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useSync } from '../../contexts/SyncContext';
import { Button, Card, Text, Badge } from '../../../design-system';
import { StatusBar } from '../../../design-system/components/feedback/StatusBar';
import { cn } from '../../../design-system/utils';

// Icons
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface GPSLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
  status: 'high' | 'medium' | 'low' | 'unavailable';
}

interface MediaAttachment {
  id: string;
  type: 'image' | 'document';
  name: string;
  size: number;
  uploadStatus: 'queued' | 'uploading' | 'uploaded' | 'error';
  progress?: number;
  thumbnail?: string;
}

export default function ActiveVisit() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { workStatus } = useApp();
  const { connectionStatus, lastSyncTime, outboxCount, conflictCount, addToOutbox } = useSync();

  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>([]);
  const [checkInTime, setCheckInTime] = useState(new Date());

  // بيانات الزيارة (تجريبية)
  const visitData = {
    id: visitId,
    customerName: 'شركة التقنية المتقدمة',
    customerType: 'عميل محتمل',
    address: 'شارع الملك فهد، الرياض',
    phone: '+966 50 123 4567',
  };

  // الحصول على موقع GPS
  useEffect(() => {
    let watchId: number;

    const getLocation = () => {
      if (!navigator.geolocation) {
        setGpsLocation({
          lat: 0,
          lng: 0,
          accuracy: 0,
          timestamp: new Date(),
          status: 'unavailable'
        });
        setGpsLoading(false);
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const accuracy = position.coords.accuracy;
          const status: GPSLocation['status'] = 
            accuracy <= 10 ? 'high' :
            accuracy <= 50 ? 'medium' : 'low';

          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: accuracy,
            timestamp: new Date(position.timestamp),
            status: status
          });
          setGpsLoading(false);
        },
        (error) => {
          console.error('GPS Error:', error);
          setGpsLocation({
            lat: 24.7136,
            lng: 46.6753,
            accuracy: 999,
            timestamp: new Date(),
            status: 'unavailable'
          });
          setGpsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    getLocation();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleTakePhoto = () => {
    // محاكاة التقاط صورة
    const newPhoto: MediaAttachment = {
      id: `photo_${Date.now()}`,
      type: 'image',
      name: `صورة_${mediaAttachments.length + 1}.jpg`,
      size: Math.random() * 2000000 + 500000,
      uploadStatus: connectionStatus === 'online' ? 'uploading' : 'queued',
      progress: 0,
      thumbnail: `https://source.unsplash.com/random/200x200?sig=${Date.now()}`
    };

    setMediaAttachments(prev => [...prev, newPhoto]);

    // محاكاة رفع الصورة
    if (connectionStatus === 'online') {
      simulateUpload(newPhoto.id);
    } else {
      // إضافة للـ Outbox
      addToOutbox({
        type: 'media',
        operation: 'create',
        data: newPhoto,
        maxAttempts: 5
      });
    }
  };

  const simulateUpload = (photoId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        setMediaAttachments(prev =>
          prev.map(m => m.id === photoId ? { ...m, uploadStatus: 'uploaded' as const, progress: 100 } : m)
        );
        clearInterval(interval);
      } else {
        setMediaAttachments(prev =>
          prev.map(m => m.id === photoId ? { ...m, progress } : m)
        );
      }
    }, 300);
  };

  const handleProceedToOutcome = () => {
    if (!notes.trim()) {
      alert('الرجاء إدخال ملاحظات عن التفاعل');
      return;
    }

    if (!gpsLocation || gpsLocation.status === 'unavailable') {
      const confirm = window.confirm('لم يتم تحديد موقع GPS بدقة. هل تريد المتابعة؟');
      if (!confirm) return;
    }

    // حفظ بيانات الزيارة
    const visitRecord = {
      visitId,
      checkInTime,
      checkInLocation: gpsLocation,
      notes,
      media: mediaAttachments,
      timestamp: new Date()
    };

    // إضافة للـ Outbox
    addToOutbox({
      type: 'visit',
      operation: 'update',
      data: visitRecord,
      maxAttempts: 5
    });

    // الانتقال لشاشة النتائج
    navigate(`/visit/outcome/${visitId}`);
  };

  const getGPSStatusConfig = () => {
    if (!gpsLocation) return { color: 'var(--neutral-400)', text: 'جاري التحديد...', icon: '🔍' };
    
    switch (gpsLocation.status) {
      case 'high':
        return { color: 'var(--status-success)', text: 'دقة عالية', icon: '✅', badge: 'success' as const };
      case 'medium':
        return { color: 'var(--status-warning)', text: 'دقة متوسطة', icon: '⚠️', badge: 'warning' as const };
      case 'low':
        return { color: 'var(--status-error)', text: 'دقة منخفضة', icon: '⚠️', badge: 'error' as const };
      case 'unavailable':
        return { color: 'var(--neutral-500)', text: 'غير متاح', icon: '❌', badge: 'default' as const };
    }
  };

  const gpsStatus = getGPSStatusConfig();

  if (workStatus !== 'clockedIn') {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-5" dir="rtl">
        <Card className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[var(--status-error-light)] flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--status-error)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <Text variant="h3" className="mb-2">لا يمكن بدء الزيارة</Text>
          <Text variant="body" className="text-[var(--text-secondary)] mb-6">
            يجب تسجيل الحضور أولاً من الشاشة الرئيسية
          </Text>
          <Button onClick={() => navigate('/app/home')}>
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]" dir="rtl">
      {/* Status Bar */}
      <StatusBar
        connectionStatus={connectionStatus}
        lastSyncTime={lastSyncTime}
        outboxCount={outboxCount}
        conflictCount={conflictCount}
        onStatusClick={() => navigate('/app/sync-status')}
      />

      {/* Header */}
      <div className="bg-white border-b border-[var(--border-light)] px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-[var(--interactive-hover)] flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1">
            <Text variant="h3" className="font-bold">زيارة نشطة</Text>
            <Text variant="caption" className="text-[var(--text-secondary)]">
              {visitData.customerName}
            </Text>
          </div>
          <Badge variant="info">جارية</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 pb-24">
        {/* 1. Check-In Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">1️⃣</span>
            <Text variant="h4" className="font-bold">معلومات تسجيل الدخول</Text>
          </div>

          <Card className="space-y-4">
            {/* الوقت */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
              <Text variant="body" className="text-[var(--text-secondary)]">وقت التسجيل</Text>
              <Text variant="body" className="font-semibold">
                {checkInTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </div>

            {/* الموقع GPS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="text-[var(--text-secondary)]" />
                  <Text variant="body" className="text-[var(--text-secondary)]">الموقع GPS</Text>
                </div>
                <Badge variant={gpsStatus.badge || 'default'} size="sm">
                  {gpsStatus.icon} {gpsStatus.text}
                </Badge>
              </div>

              {gpsLocation && gpsLocation.status !== 'unavailable' && (
                <div className="bg-[var(--neutral-50)] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">خط الطول:</span>
                    <span className="font-mono">{gpsLocation.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">خط العرض:</span>
                    <span className="font-mono">{gpsLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">الدقة:</span>
                    <span className="font-mono">{Math.round(gpsLocation.accuracy)} متر</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* 2. Interaction Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">2️⃣</span>
            <Text variant="h4" className="font-bold">ملاحظات التفاعل</Text>
          </div>

          <Card>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملخص الاجتماع، تحديد الاحتياجات، صناع القرار الرئيسيين..."
              className={cn(
                'w-full min-h-[150px] p-4 rounded-lg',
                'bg-[var(--neutral-50)] border border-[var(--border-light)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-500)]',
                'resize-none transition-all'
              )}
              dir="rtl"
            />
            <div className="mt-2 text-left">
              <Text variant="caption" className="text-[var(--text-tertiary)]">
                {notes.length} حرف
              </Text>
            </div>
          </Card>
        </motion.div>

        {/* 3. Media Attachments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">3️⃣</span>
            <Text variant="h4" className="font-bold">الصور والمرفقات</Text>
          </div>

          <Card className="space-y-4">
            <Button
              variant="secondary"
              onClick={handleTakePhoto}
              className="w-full"
            >
              <CameraIcon />
              التقاط صورة (إثبات/مستندات)
            </Button>

            <AnimatePresence>
              {mediaAttachments.map((media, index) => (
                <motion.div
                  key={media.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-[var(--neutral-50)] rounded-lg"
                >
                  {media.thumbnail ? (
                    <img 
                      src={media.thumbnail} 
                      alt={media.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--brand-soft)] flex items-center justify-center">
                      <FileIcon />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <Text variant="body" className="font-medium truncate">
                      {media.name}
                    </Text>
                    <Text variant="caption" className="text-[var(--text-secondary)]">
                      {(media.size / 1024).toFixed(0)} KB
                    </Text>
                  </div>

                  <div className="text-left">
                    {media.uploadStatus === 'uploaded' && (
                      <CheckCircleIcon className="text-[var(--status-success)]" />
                    )}
                    {media.uploadStatus === 'uploading' && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        {media.progress}%
                      </div>
                    )}
                    {media.uploadStatus === 'queued' && (
                      <div className="text-xs text-[var(--status-warning)]">
                        🕒 في الانتظار
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {mediaAttachments.some(m => m.uploadStatus === 'queued') && (
              <div className="bg-[var(--status-warning-light)] border border-[var(--status-warning)] rounded-lg p-3">
                <Text variant="caption" className="text-[var(--status-warning)]">
                  💡 سيتم رفع الملفات تلقائياً عند الاتصال بالإنترنت
                </Text>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Fixed Bottom Button */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] p-5"
        style={{ paddingBottom: 'calc(20px + var(--safe-area-inset-bottom))' }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleProceedToOutcome}
          className="w-full"
          disabled={!notes.trim()}
        >
          المتابعة إلى النتيجة
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
