import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { Chip } from '../../components/ui/chip';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Percent,
  AlertCircle,
  CheckCircle,
  User,
  Wifi,
  WifiOff,
  Clock,
  Sparkles,
  Send,
  Package,
  Calendar,
  Info,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';

// Mock services data - should match ServicesCatalog
const SERVICES = [
  {
    id: '1',
    name: 'باقة أساسية',
    category: 'packages',
    price: 1000,
    duration: '14',
    description: 'باقة شاملة للشركات الصغيرة',
  },
  {
    id: '2',
    name: 'باقة متقدمة',
    category: 'packages',
    price: 2500,
    duration: '21',
    description: 'باقة للشركات المتوسطة',
  },
  {
    id: '3',
    name: 'باقة احترافية',
    category: 'packages',
    price: 5000,
    duration: '35',
    description: 'باقة للشركات الكبيرة',
  },
  {
    id: '4',
    name: 'استشارة تسويقية',
    category: 'services',
    price: 500,
    duration: '1',
    description: 'جلسة استشارية متخصصة',
  },
  {
    id: '5',
    name: 'تدريب فريق',
    category: 'services',
    price: 1500,
    duration: '3',
    description: 'جلسة تدريبية لفريقك',
  },
  {
    id: '6',
    name: 'تصميم هوية بصرية',
    category: 'services',
    price: 800,
    duration: '7',
    description: 'تصميم شعار وهوية بصرية',
  },
  {
    id: '7',
    name: 'تطوير موقع إلكتروني',
    category: 'services',
    price: 3000,
    duration: '21',
    description: 'موقع إلكتروني متجاوب',
  },
  {
    id: '8',
    name: 'إدارة سوشيال ميديا',
    category: 'services',
    price: 2000,
    duration: '30',
    description: 'إدارة شهرية لحساباتك',
  },
];

const REP_MAX_DISCOUNT = 10; // 10% maximum discount for rep
const ADMIN_MAX_DISCOUNT = 30; // 30% maximum discount with admin approval

export function Cart() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { isOnline } = useApp();
  const { cartItems, removeFromCart, updateQuantity, getTotalItems } = useCart();
  
  const [discountPercent, setDiscountPercent] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountApprovalStatus, setDiscountApprovalStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  const steps: WizardStep[] = [
    { id: 'services', label: 'اختيار الخدمات', description: 'تصفح الكاتالوج' },
    { id: 'cart', label: 'السلة', description: 'مراجعة الطلب' },
    { id: 'duration', label: 'المدة', description: 'تحديد الوقت' },
    { id: 'agreement', label: 'الاتفاقية', description: 'الشروط والأحكام' },
    { id: 'signature', label: 'التوقيع', description: 'إتمام العقد' },
  ];

  // Get cart with full service details
  const cartWithDetails = useMemo(() => {
    return cartItems.map(item => {
      const service = SERVICES.find(s => s.id === item.serviceId);
      return service ? {
        ...service,
        quantity: item.quantity,
      } : null;
    }).filter(Boolean);
  }, [cartItems]);

  // Calculate totals
  const subtotal = useMemo(() => 
    cartWithDetails.reduce((sum, item) => sum + (item!.price * item!.quantity), 0),
    [cartWithDetails]
  );

  const discountValue = useMemo(() => {
    return (subtotal * appliedDiscount) / 100;
  }, [subtotal, appliedDiscount]);

  const total = subtotal - discountValue;

  // Calculate estimated duration
  const estimatedDuration = useMemo(() => {
    const totalDays = cartWithDetails.reduce((sum, item) => {
      return sum + parseInt(item!.duration);
    }, 0);

    if (totalDays === 0) return '';
    if (totalDays <= 7) return `${totalDays} أيام`;
    if (totalDays <= 14) return 'أسبوعين';
    if (totalDays <= 21) return '3 أسابيع';
    if (totalDays <= 30) return 'شهر';
    if (totalDays <= 60) return 'شهرين';
    
    const months = Math.ceil(totalDays / 30);
    return `${months} أشهر`;
  }, [cartWithDetails]);

  // Auto-apply discount if within rep limit
  useEffect(() => {
    const percent = parseFloat(discountPercent);
    if (!isNaN(percent) && percent > 0 && percent <= REP_MAX_DISCOUNT) {
      setAppliedDiscount(percent);
      setDiscountApprovalStatus('none');
    } else if (percent > REP_MAX_DISCOUNT && discountApprovalStatus === 'approved') {
      setAppliedDiscount(percent);
    }
  }, [discountPercent, discountApprovalStatus]);

  const handleDiscountChange = (value: string) => {
    setDiscountPercent(value);
    const percent = parseFloat(value);
    
    if (isNaN(percent) || percent <= 0) {
      setAppliedDiscount(0);
      setDiscountApprovalStatus('none');
      return;
    }

    if (percent > ADMIN_MAX_DISCOUNT) {
      toast.error(`الحد الأقصى للخصم هو ${ADMIN_MAX_DISCOUNT}%`);
      return;
    }

    if (percent > REP_MAX_DISCOUNT) {
      // Reset applied discount and show warning
      setAppliedDiscount(0);
      setDiscountApprovalStatus('none');
    }
  };

  const handleRequestApproval = () => {
    const percent = parseFloat(discountPercent);
    
    if (isNaN(percent) || percent <= REP_MAX_DISCOUNT) {
      toast.error('لا حاجة لطلب موافقة');
      return;
    }

    if (percent > ADMIN_MAX_DISCOUNT) {
      toast.error(`الحد الأقصى للخصم هو ${ADMIN_MAX_DISCOUNT}%`);
      return;
    }

    setDiscountApprovalStatus('pending');
    toast.info('تم إرسال طلب الموافقة للمدير...');
    
    // Simulate admin approval (in real app, this would be via backend)
    setTimeout(() => {
      const approved = Math.random() > 0.3; // 70% approval rate
      setDiscountApprovalStatus(approved ? 'approved' : 'rejected');
      
      if (approved) {
        setAppliedDiscount(percent);
        toast.success('تمت الموافقة على الخصم! ✅');
      } else {
        toast.error('تم رفض طلب الخصم من قبل المدير');
      }
    }, 2000);
  };

  const handleContinue = () => {
    if (cartItems.length === 0) {
      toast.error('السلة فارغة!');
      return;
    }

    const percent = parseFloat(discountPercent) || 0;
    if (percent > REP_MAX_DISCOUNT && discountApprovalStatus !== 'approved') {
      toast.error('يرجى انتظار موافقة المدير على الخصم');
      return;
    }

    // Calculate estimated duration in days
    const totalDays = cartWithDetails.reduce((sum, item) => {
      return sum + parseInt(item!.duration);
    }, 0);

    // Save cart data and navigate with state
    navigate(`/dropin/agreement/${visitId}`, {
      state: {
        cartItems: cartWithDetails,
        subtotal,
        discount: appliedDiscount,
        total,
        estimatedDurationDays: totalDays,
        estimatedDuration,
      }
    });
  };

  const formatDuration = (days: string) => {
    const numDays = parseInt(days);
    if (numDays === 1) return 'يوم واحد';
    if (numDays === 2) return 'يومان';
    if (numDays < 7) return `${numDays} أيام`;
    const weeks = Math.floor(numDays / 7);
    if (weeks === 1) return 'أسبوع';
    if (weeks === 2) return 'أسبوعين';
    if (weeks < 4) return `${weeks} أسابيع`;
    const months = Math.floor(numDays / 30);
    if (months === 1) return 'شهر';
    if (months === 2) return 'شهرين';
    return `${months} أشهر`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)' }} dir="rtl">
      {/* Top Bar */}
      <div 
        className="px-4 py-3 flex items-center justify-between shadow-lg relative z-10"
        style={{ background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))' }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowRight className="size-6 text-white" />
          </motion.button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <div className="size-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="size-5 text-white" />
            </div>
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-white font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
          السلة
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingCart className="size-6 text-white" />
            {getTotalItems() > 0 && (
              <span 
                className="absolute -top-1 -right-1 size-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                style={{ background: 'var(--status-error)', fontSize: '10px' }}
              >
                {getTotalItems()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)' }}>
        <WizardStepper steps={steps} currentStepId="cart" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div className="size-20 rounded-full flex items-center justify-center mb-4"
                 style={{ background: 'var(--neutral-100)' }}>
              <ShoppingCart className="size-10" style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 className="font-bold mb-2" style={{ fontSize: 'var(--font-size-xl)' }}>
              السلة فارغة
            </h3>
            <p className="text-center mb-6" style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
            }}>
              أضف خدمات من الكاتالوج لتظهر هنا
            </p>
            <Button
              onClick={() => navigate(`/dropin/services/${visitId}`)}
              className="font-semibold text-white"
              style={{ 
                height: 'var(--button-height-md)',
                borderRadius: 'var(--button-radius)',
                background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
              }}
            >
              تصفح الخدمات
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Items Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
                <h2 className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                  الخدمات المختارة
                </h2>
              </div>
              <div className="px-3 py-1 rounded-full font-bold text-white" style={{ 
                background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
                fontSize: 'var(--font-size-sm)',
              }}>
                {getTotalItems()} عنصر
              </div>
            </div>

            {/* Estimated Duration Card */}
            {estimatedDuration && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ 
                  background: 'linear-gradient(135deg, var(--brand-soft), var(--status-info-light))',
                  border: '1px solid var(--brand-primary-200)',
                }}
              >
                <div className="size-12 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'white' }}>
                  <Calendar className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    المدة التقديرية للتنفيذ
                  </p>
                  <p className="font-bold" style={{ 
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--brand-primary-700)',
                  }}>
                    {estimatedDuration}
                  </p>
                </div>
                <Info className="size-5" style={{ color: 'var(--brand-primary-400)' }} />
              </motion.div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3">
              {cartWithDetails.map((item, index) => {
                if (!item) return null;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl p-4 shadow-sm"
                    style={{ 
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                            {item.name}
                          </h3>
                          <div 
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ 
                              background: item.category === 'packages' ? 'var(--brand-soft)' : 'var(--status-info-light)',
                              color: item.category === 'packages' ? 'var(--brand-primary-600)' : 'var(--status-info)',
                            }}
                          >
                            {item.category === 'packages' ? 'باقة' : 'خدمة'}
                          </div>
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          <Clock className="size-3" />
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                      </div>
                      <div className="text-left mr-3">
                        <p className="font-bold" style={{ 
                          fontSize: 'var(--font-size-lg)',
                          color: 'var(--brand-primary-600)',
                        }}>
                          {(item.price * item.quantity).toLocaleString()} ر.س
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {item.price.toLocaleString()} × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const currentItem = cartItems.find(ci => ci.serviceId === item.id);
                            if (currentItem && currentItem.quantity === 1) {
                              removeFromCart(item.id);
                            } else {
                              updateQuantity(item.id, -1);
                            }
                          }}
                          className="size-9 rounded-lg flex items-center justify-center"
                          style={{ 
                            background: 'var(--neutral-100)',
                            border: '1px solid var(--border-main)',
                          }}
                        >
                          <Minus className="size-4" />
                        </motion.button>
                        <span className="font-bold min-w-8 text-center" style={{ fontSize: 'var(--font-size-base)' }}>
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (item.category === 'packages') {
                              toast.error('لا يمكن زيادة كمية الباقة');
                              return;
                            }
                            updateQuantity(item.id, 1);
                          }}
                          disabled={item.category === 'packages'}
                          className="size-9 rounded-lg flex items-center justify-center text-white"
                          style={{ 
                            background: item.category === 'packages'
                              ? 'var(--interactive-disabled)'
                              : 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
                          }}
                        >
                          <Plus className="size-4" />
                        </motion.button>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success(`تم إزالة ${item.name}`);
                        }}
                        className="size-9 rounded-lg flex items-center justify-center"
                        style={{ 
                          background: 'var(--danger-soft)',
                          color: 'var(--status-error)',
                        }}
                      >
                        <Trash2 className="size-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Discount Section */}
            <div 
              className="rounded-2xl p-5 shadow-sm space-y-4"
              style={{ 
                background: 'var(--bg-surface)',
                border: '2px solid var(--brand-primary-200)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="size-11 rounded-xl flex items-center justify-center"
                     style={{ background: 'var(--brand-soft)' }}>
                  <Percent className="size-6" style={{ color: 'var(--brand-primary-600)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                    تطبيق خصم
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    حتى {REP_MAX_DISCOUNT}% بدون موافقة
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    placeholder="0"
                    min="0"
                    max={ADMIN_MAX_DISCOUNT.toString()}
                    step="0.5"
                    className="pr-12"
                    style={{ 
                      height: 'var(--input-height)',
                      borderRadius: 'var(--input-radius)',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'bold',
                    }}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold"
                       style={{ color: 'var(--text-tertiary)' }}>
                    %
                  </div>
                </div>

                {/* Discount Status Messages */}
                <AnimatePresence mode="wait">
                  {discountPercent && parseFloat(discountPercent) > 0 && (
                    <>
                      {parseFloat(discountPercent) <= REP_MAX_DISCOUNT && (
                        <motion.div
                          key="auto-applied"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="p-3 rounded-xl flex items-start gap-2"
                          style={{ 
                            background: 'var(--success-soft)',
                            border: '1px solid #BBF7D0',
                          }}
                        >
                          <CheckCircle className="size-5 mt-0.5 flex-shrink-0" 
                                      style={{ color: 'var(--status-success)' }} />
                          <div>
                            <p className="font-semibold text-sm" style={{ color: '#065F46' }}>
                              تم تطبيق الخصم تلقائياً ✓
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#065F46' }}>
                              الخصم ضمن الصلاحيات المسموحة
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {parseFloat(discountPercent) > REP_MAX_DISCOUNT && parseFloat(discountPercent) <= ADMIN_MAX_DISCOUNT && (
                        <motion.div
                          key="needs-approval"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="space-y-3"
                        >
                          <div 
                            className="p-3 rounded-xl flex items-start gap-2"
                            style={{ 
                              background: discountApprovalStatus === 'approved' 
                                ? 'var(--success-soft)'
                                : discountApprovalStatus === 'rejected'
                                ? 'var(--danger-soft)'
                                : 'var(--warning-soft)',
                              border: `1px solid ${
                                discountApprovalStatus === 'approved' 
                                  ? '#BBF7D0'
                                  : discountApprovalStatus === 'rejected'
                                  ? '#FECACA'
                                  : '#FDE68A'
                              }`,
                            }}
                          >
                            {discountApprovalStatus === 'none' && (
                              <>
                                <AlertCircle className="size-5 mt-0.5 flex-shrink-0" 
                                           style={{ color: 'var(--status-warning)' }} />
                                <div className="flex-1">
                                  <p className="font-semibold text-sm" style={{ color: '#92400E' }}>
                                    الخصم يتجاوز صلاحياتك ({REP_MAX_DISCOUNT}%)
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: '#92400E' }}>
                                    يتطلب موافقة المدير للمتابعة
                                  </p>
                                </div>
                              </>
                            )}
                            {discountApprovalStatus === 'pending' && (
                              <>
                                <Send className="size-5 mt-0.5 flex-shrink-0 animate-pulse" 
                                      style={{ color: 'var(--status-warning)' }} />
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: '#92400E' }}>
                                    في انتظار موافقة المدير...
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: '#92400E' }}>
                                    سيتم إعلامك بالنتيجة قريباً
                                  </p>
                                </div>
                              </>
                            )}
                            {discountApprovalStatus === 'approved' && (
                              <>
                                <CheckCircle className="size-5 mt-0.5 flex-shrink-0" 
                                           style={{ color: 'var(--status-success)' }} />
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: '#065F46' }}>
                                    تمت الموافقة على الخصم! ✓
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: '#065F46' }}>
                                    يمكنك المتابعة الآن
                                  </p>
                                </div>
                              </>
                            )}
                            {discountApprovalStatus === 'rejected' && (
                              <>
                                <AlertCircle className="size-5 mt-0.5 flex-shrink-0" 
                                           style={{ color: 'var(--status-error)' }} />
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: '#991B1B' }}>
                                    تم رفض طلب الخصم
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: '#991B1B' }}>
                                    الرجاء تعديل النسبة أو المحاولة مرة أخرى
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          {discountApprovalStatus === 'none' && (
                            <Button
                              onClick={handleRequestApproval}
                              className="w-full font-semibold text-white"
                              style={{ 
                                height: 'var(--button-height-md)',
                                borderRadius: 'var(--button-radius)',
                                background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                              }}
                            >
                              <Send className="size-5 ml-2" />
                              طلب موافقة من المدير
                            </Button>
                          )}
                        </motion.div>
                      )}

                      {parseFloat(discountPercent) > ADMIN_MAX_DISCOUNT && (
                        <motion.div
                          key="exceeded"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="p-3 rounded-xl flex items-start gap-2"
                          style={{ 
                            background: 'var(--danger-soft)',
                            border: '1px solid #FECACA',
                          }}
                        >
                          <AlertCircle className="size-5 mt-0.5 flex-shrink-0" 
                                      style={{ color: 'var(--status-error)' }} />
                          <div>
                            <p className="font-semibold text-sm" style={{ color: '#991B1B' }}>
                              تجاوز الحد الأقصى
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#991B1B' }}>
                              الحد الأقصى المسموح {ADMIN_MAX_DISCOUNT}%
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Price Summary */}
            <div 
              className="rounded-2xl p-5 shadow-md space-y-3"
              style={{ 
                background: 'var(--bg-surface)',
                border: '2px solid var(--brand-primary-300)',
              }}
            >
              <h3 className="font-bold pb-3" style={{ 
                fontSize: 'var(--font-size-lg)',
                borderBottom: '1px solid var(--border-light)',
              }}>
                ملخص الطلب
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    المجموع الفرعي
                  </span>
                  <span className="font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>
                    {subtotal.toLocaleString()} ر.س
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--status-success)' }}>
                      الخصم ({appliedDiscount}%)
                    </span>
                    <span className="font-semibold" style={{ 
                      fontSize: 'var(--font-size-base)',
                      color: 'var(--status-success)',
                    }}>
                      - {discountValue.toLocaleString()} ر.س
                    </span>
                  </div>
                )}

                <div 
                  className="flex justify-between items-center pt-3"
                  style={{ borderTop: '2px dashed var(--brand-primary-200)' }}
                >
                  <span className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                    الإجمالي
                  </span>
                  <span className="font-bold" style={{ 
                    fontSize: 'var(--font-size-2xl)',
                    color: 'var(--brand-primary-600)',
                  }}>
                    {total.toLocaleString()} ر.س
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {cartItems.length > 0 && (
        <div 
          className="fixed bottom-0 left-0 right-0 p-4" 
          dir="rtl"
          style={{ 
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
            paddingBottom: 'calc(1rem + var(--safe-area-inset-bottom))',
          }}
        >
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleContinue}
              className="w-full font-bold shadow-lg text-white"
              style={{ 
                height: 'var(--button-height-lg)',
                borderRadius: 'var(--button-radius)',
                fontSize: 'var(--font-size-lg)',
                background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
              }}
            >
              المتابعة إلى تحديد المدة
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}