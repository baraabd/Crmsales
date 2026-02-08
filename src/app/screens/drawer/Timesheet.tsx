import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ArrowRight, Clock, Coffee, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function Timesheet() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'out' | 'in' | 'break'>('out');
  
  const todayLogs = [
    { type: 'clockIn', time: '08:30', status: 'success' },
    { type: 'breakStart', time: '12:00', status: 'success' },
    { type: 'breakEnd', time: '12:30', status: 'success' },
  ];

  const handleClockIn = () => {
    setStatus('in');
    toast.success('تم تسجيل الدخول');
  };

  const handleBreakStart = () => {
    setStatus('break');
    toast.success('بدأت فترة الراحة');
  };

  const handleBreakEnd = () => {
    setStatus('in');
    toast.success('انتهت فترة الراحة');
  };

  const handleClockOut = () => {
    setStatus('out');
    toast.success('تم تسجيل الخروج');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="size-5" />
        </button>
        <h1 className="text-xl font-bold">سجل الدوام</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Card */}
        <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
          <div className="text-center space-y-4">
            <div className="size-20 bg-white/20 rounded-full mx-auto flex items-center justify-center">
              <Clock className="size-10" />
            </div>
            <div>
              <p className="text-sm text-indigo-100 mb-1">الحالة الحالية</p>
              <h3 className="text-2xl font-bold">
                {status === 'in' && 'في العمل'}
                {status === 'break' && 'فترة راحة'}
                {status === 'out' && 'خارج العمل'}
              </h3>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleClockIn}
            disabled={status !== 'out'}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <LogIn className="size-5 ml-2" />
            تسجيل دخول
          </Button>
          <Button
            onClick={handleClockOut}
            disabled={status === 'out'}
            className="bg-red-600 hover:bg-red-700"
            size="lg"
          >
            <LogOut className="size-5 ml-2" />
            تسجيل خروج
          </Button>
          <Button
            onClick={handleBreakStart}
            disabled={status !== 'in'}
            variant="outline"
            size="lg"
          >
            <Coffee className="size-5 ml-2" />
            بدء راحة
          </Button>
          <Button
            onClick={handleBreakEnd}
            disabled={status !== 'break'}
            variant="outline"
            size="lg"
          >
            <Coffee className="size-5 ml-2" />
            إنهاء راحة
          </Button>
        </div>

        {/* Today's Log */}
        <div>
          <h3 className="font-semibold text-lg mb-3">سجل اليوم</h3>
          <div className="space-y-2">
            {todayLogs.map((log, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                    {log.type === 'clockIn' && <LogIn className="size-5 text-green-600" />}
                    {log.type === 'clockOut' && <LogOut className="size-5 text-red-600" />}
                    {(log.type === 'breakStart' || log.type === 'breakEnd') && <Coffee className="size-5 text-orange-600" />}
                  </div>
                  <div>
                    <p className="font-medium">
                      {log.type === 'clockIn' && 'تسجيل دخول'}
                      {log.type === 'clockOut' && 'تسجيل خروج'}
                      {log.type === 'breakStart' && 'بدء راحة'}
                      {log.type === 'breakEnd' && 'إنهاء راحة'}
                    </p>
                    <p className="text-sm text-gray-600">{log.time}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">✓</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">ملخص الأسبوع</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-indigo-600">42</p>
              <p className="text-sm text-gray-600">ساعة</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">5</p>
              <p className="text-sm text-gray-600">أيام</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
