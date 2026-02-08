import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ArrowRight, RefreshCw, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function SyncStatus() {
  const navigate = useNavigate();
  const { outbox, syncNow, isOnline } = useApp();

  const handleSync = async () => {
    try {
      await syncNow();
      toast.success('جميع البيانات مرفوعة.');
    } catch (error) {
      toast.error('فشل رفع عملية');
    }
  };

  const handleCopyDetails = () => {
    toast.success('تم نسخ التفاصيل');
  };

  const getStatusIcon = () => {
    if (outbox.length === 0) return <CheckCircle className="size-12 text-green-600" />;
    if (!isOnline) return <AlertCircle className="size-12 text-orange-600" />;
    return <RefreshCw className="size-12 text-blue-600" />;
  };

  const getStatusText = () => {
    if (outbox.length === 0) return 'جميع البيانات متزامنة';
    if (!isOnline) return `يوجد ${outbox.length} عمليات معلقة`;
    return `يوجد ${outbox.length} عمليات للمزامنة`;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="size-5" />
        </button>
        <h1 className="text-xl font-bold">حالة المزامنة</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Card */}
        <Card className="p-8 text-center">
          <div className="size-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h3 className="text-xl font-bold mb-2">{getStatusText()}</h3>
          {!isOnline && outbox.length > 0 && (
            <p className="text-sm text-orange-600">
              لا يوجد اتصال بالإنترنت. ستتم المزامنة تلقائيًا عند الاتصال.
            </p>
          )}
        </Card>

        {/* Sync Button */}
        {isOnline && outbox.length > 0 && (
          <Button onClick={handleSync} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
            <RefreshCw className="size-5 ml-2" />
            زامِن الآن
          </Button>
        )}

        {/* Outbox List */}
        {outbox.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">قائمة العمليات المعلقة</h3>
            <div className="space-y-3">
              {outbox.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                          {item.type === 'visit' && 'زيارة'}
                          {item.type === 'account' && 'عميل'}
                          {item.type === 'appointment' && 'موعد'}
                          {item.type === 'discount_request' && 'طلب خصم'}
                          {item.type === 'agreement' && 'اتفاقية'}
                        </h4>
                        <Badge
                          className={
                            item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.status === 'syncing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {item.status === 'pending' && 'معلق'}
                          {item.status === 'syncing' && 'يتم المزامنة'}
                          {item.status === 'failed' && 'فشل'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  {item.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={handleCopyDetails}
                    >
                      <Copy className="size-4 ml-1" />
                      نسخ التفاصيل للدعم
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {outbox.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <CheckCircle className="size-16 text-green-500 mx-auto mb-3" />
            <p>لا توجد عمليات معلقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
