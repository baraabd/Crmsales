import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowRight } from 'lucide-react';

export function Discount() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState('');
  const maxAllowed = 10;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white p-4 shadow-sm border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="size-5" />
        </button>
        <h1 className="text-xl font-bold">الخصم</h1>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">الحد المسموح: {maxAllowed}%</p>
        </div>
        <Input type="number" placeholder="نسبة الخصم %" value={discount} onChange={(e) => setDiscount(e.target.value)} className="text-right" />
        <Button onClick={() => navigate(`/dropin/agreement/${visitId}`)} className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
          متابعة
        </Button>
      </div>
    </div>
  );
}
