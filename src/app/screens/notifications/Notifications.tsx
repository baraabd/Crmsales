import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ArrowRight, Bell, Calendar, MessageSquare, AlertCircle, MapPin } from 'lucide-react';

export function Notifications() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: '1',
      type: 'appointment',
      title: 'موعد قريب',
      message: 'لديك موعد مع شركة الفجر للتجارة اليوم الساعة 3:00 م',
      time: 'منذ 5 دقائق',
      read: false,
      action: () => navigate('/app/calendar'),
    },
    {
      id: '2',
      type: 'message',
      title: 'رسالة من المدير',
      message: 'تم الموافقة على طلب الخصم للعميل متجر النور',
      time: 'منذ ساعة',
      read: false,
      action: () => {},
    },
    {
      id: '3',
      type: 'sync_failed',
      title: 'فشل مزامنة',
      message: 'فشل رفع زيارة #12345. اضغط لمعرفة التفاصيل',
      time: 'منذ ساعتين',
      read: false,
      action: () => navigate('/app/sync-status'),
    },
    {
      id: '4',
      type: 'suggestion',
      title: 'اقتراح عميل قريب',
      message: 'يوجد 3 عملاء محتملين قريبين من موقعك الحالي',
      time: 'منذ 3 ساعات',
      read: true,
      action: () => navigate('/app/home'),
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="size-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="size-5 text-green-600" />;
      case 'sync_failed':
        return <AlertCircle className="size-5 text-red-600" />;
      case 'suggestion':
        return <MapPin className="size-5 text-indigo-600" />;
      default:
        return <Bell className="size-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="size-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">الإشعارات</h1>
        <Button variant="ghost" size="sm">
          قراءة الكل
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              !notif.read ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={notif.action}
          >
            <div className="flex items-start gap-3">
              <div className="size-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold">{notif.title}</h3>
                  {!notif.read && (
                    <Badge className="bg-blue-600 text-white">جديد</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                <p className="text-xs text-gray-500">{notif.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
