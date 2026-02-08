import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ArrowRight, MessageCircle, FileText, Send, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="size-5" />
        </button>
        <h1 className="text-xl font-bold">مساعدة</h1>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="size-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">تواصل مع الدعم</h3>
              <p className="text-sm text-gray-600 mb-3">
                تحدث مع فريق الدعم الفني مباشرة
              </p>
              <Button onClick={() => toast.info('قريباً')} className="bg-blue-600 hover:bg-blue-700">
                بدء محادثة
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Send className="size-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">إرسال تقرير مشكلة</h3>
              <p className="text-sm text-gray-600 mb-3">
                أبلغنا عن أي مشكلة تقنية تواجهك
              </p>
              <Button variant="outline" onClick={() => toast.info('قريباً')}>
                إرسال تقرير
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="size-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">الأسئلة الشائعة</h3>
              <p className="text-sm text-gray-600 mb-3">
                تصفح الأسئلة والأجوبة الشائعة
              </p>
              <Button variant="outline" onClick={() => toast.info('قريباً')}>
                عرض FAQ
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">معلومات التطبيق</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>الإصدار</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>آخر تحديث</span>
              <span className="font-medium">4 فبراير 2026</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
