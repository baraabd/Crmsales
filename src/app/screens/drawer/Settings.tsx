import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { ArrowRight, Languages, Moon, Wifi, Fingerprint, Download } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [offlineLogin, setOfflineLogin] = useState(true);
  const [biometric, setBiometric] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="size-5" />
        </button>
        <h1 className="text-xl font-bold">الإعدادات</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Language */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="size-5 text-gray-600" />
              <Label>اللغة</Label>
            </div>
            <Button variant="outline" size="sm">العربية</Button>
          </div>
        </Card>

        {/* Dark Mode */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="size-5 text-gray-600" />
              <Label htmlFor="darkMode">الوضع الداكن</Label>
            </div>
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked);
                toast.success(checked ? 'تم تفعيل الوضع الداكن' : 'تم إيقاف الوضع الداكن');
              }}
            />
          </div>
        </Card>

        {/* Offline Login */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="size-5 text-gray-600" />
              <Label htmlFor="offlineLogin">السماح بالدخول بدون إنترنت</Label>
            </div>
            <Switch
              id="offlineLogin"
              checked={offlineLogin}
              onCheckedChange={setOfflineLogin}
            />
          </div>
        </Card>

        {/* Biometric */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="size-5 text-gray-600" />
              <Label htmlFor="biometric">تفعيل البصمة / Face ID</Label>
            </div>
            <Switch
              id="biometric"
              checked={biometric}
              onCheckedChange={setBiometric}
            />
          </div>
        </Card>

        {/* Offline Downloads */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Download className="size-5 text-gray-600" />
              <Label>إدارة التنزيلات Offline</Label>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                تحديث الخريطة (25 MB)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                تحديث كاتالوج الخدمات (10 MB)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
