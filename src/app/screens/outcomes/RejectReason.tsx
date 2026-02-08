import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowRight, XCircle } from 'lucide-react';

export function RejectReason() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { endVisit, updateAccount, currentVisit } = useApp();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    if (currentVisit) {
      endVisit(currentVisit.id, 'rejected', `${reason}: ${notes}`);
      updateAccount(currentVisit.accountId, {
        lifecycle: 'lost',
        pinColor: 'gray',
      });
    }
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="size-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
            <XCircle className="size-12 text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">تم حفظ الرفض</h2>
            <p className="text-sm text-orange-600 mt-4">
              لا يُنصح بزيارة هذا العميل الآن
            </p>
          </div>
          <Button onClick={() => navigate('/app/home')} className="w-full bg-gray-600 hover:bg-gray-700" size="lg">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="size-5" />
        </button>
        <h1 className="text-xl font-bold">سبب الرفض</h1>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason">السبب</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="اختر السبب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">السعر</SelectItem>
              <SelectItem value="no-need">لا يحتاج</SelectItem>
              <SelectItem value="competitor">يتعامل مع منافس</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
          <Textarea
            id="notes"
            placeholder="أضف ملاحظات..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-right"
          />
        </div>
        <Button onClick={handleConfirm} className="w-full bg-gray-600 hover:bg-gray-700" size="lg">
          حفظ الرفض
        </Button>
      </div>
    </div>
  );
}
