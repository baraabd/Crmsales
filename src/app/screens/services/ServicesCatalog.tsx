import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Chip } from '../../components/ui/chip';
import { WizardStepper, WizardStep } from '../../components/ui/wizard-stepper';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  Clock,
  ExternalLink,
  User,
  Wifi,
  WifiOff,
  Info,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useCart } from '../../contexts/CartContext';
import { Service } from '../../contexts/CartContext';
import { toast } from 'sonner';

const SERVICES: Service[] = [
  {
    id: '1',
    name: 'باقة أساسية',
    category: 'packages',
    price: 1000,
    description: 'باقة شاملة للشركات الصغيرة تشمل تصميم هوية بصرية وموقع إلكتروني',
    duration: '14', // days
    portfolioUrl: 'https://example.com/portfolio/basic',
    features: ['شعار احترافي', 'موقع إلكتروني', 'بطاقات عمل', 'دعم فني'],
  },
  {
    id: '2',
    name: 'باقة متقدمة',
    category: 'packages',
    price: 2500,
    description: 'باقة للشركات المتوسطة مع خدمات تسويق رقمي',
    duration: '21',
    portfolioUrl: 'https://example.com/portfolio/advanced',
    features: ['كل ما في الباقة الأساسية', 'تسويق رقمي', 'إدارة سوشيال ميديا', 'تحليلات'],
  },
  {
    id: '3',
    name: 'باقة احترافية',
    category: 'packages',
    price: 5000,
    description: 'باقة للشركات الكبيرة مع حلول متكاملة',
    duration: '35',
    portfolioUrl: 'https://example.com/portfolio/pro',
    features: ['كل ما في الباقة المتقدمة', 'نظام CRM', 'تطبيق موبايل', 'استشارات استراتيجية'],
  },
  {
    id: '4',
    name: 'استشارة تسويقية',
    category: 'services',
    price: 500,
    description: 'جلسة استشارية متخصصة لمدة ساعتين',
    duration: '1',
    features: ['تحليل السوق', 'استراتيجية تسويقية', 'خطة تنفيذ'],
  },
  {
    id: '5',
    name: 'تدريب فريق',
    category: 'services',
    price: 1500,
    description: 'جلسة تدريبية لفريقك على أدوات التسويق الحديثة',
    duration: '3',
    portfolioUrl: 'https://example.com/training',
    features: ['تدريب عملي', 'مواد تدريبية', 'شهادة حضور', 'متابعة لمدة شهر'],
  },
  {
    id: '6',
    name: 'تصميم هوية بصرية',
    category: 'services',
    price: 800,
    description: 'تصميم شعار وهوية بصرية متكاملة',
    duration: '7',
    portfolioUrl: 'https://example.com/portfolio/branding',
    features: ['شعار بـ 3 مفاهيم', 'دليل استخدام', 'ملفات مفتوحة', 'تعديلات مجانية'],
  },
  {
    id: '7',
    name: 'تطوير موقع إلكتروني',
    category: 'services',
    price: 3000,
    description: 'موقع إلكتروني متجاوب مع جميع الأجهزة',
    duration: '21',
    portfolioUrl: 'https://example.com/portfolio/web',
    features: ['تصميم حديث', 'لوحة تحكم', 'SEO محسّن', 'استضافة سنة'],
  },
  {
    id: '8',
    name: 'إدارة سوشيال ميديا',
    category: 'services',
    price: 2000,
    description: 'إدارة شهرية لحساباتك على وسائل التواصل',
    duration: '30',
    features: ['30 منشور', 'تصاميم احترافية', 'ردود على التعليقات', 'تقرير شهري'],
  },
];

const ITEMS_PER_PAGE = 5;

export function ServicesCatalog() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { isOnline } = useApp();
  const { cartItems, addToCart, removeFromCart, updateQuantity, getTotalItems } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const steps: WizardStep[] = [
    { id: 'services', label: 'اختيار الخدمات', description: 'تصفح الكاتالوج' },
    { id: 'cart', label: 'السلة', description: 'مراجعة الطلب' },
    { id: 'agreement', label: 'الاتفاقية', description: 'الشروط والأحكام' },
    { id: 'signature', label: 'التوقيع', description: 'إتمام العقد' },
  ];

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'packages', label: 'باقات' },
    { id: 'services', label: 'خدمات' },
  ];

  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasPackageInCart = () => {
    return cartItems.some(item => {
      const service = SERVICES.find(s => s.id === item.serviceId);
      return service?.category === 'packages';
    });
  };

  const handleAddToCart = (serviceId: string) => {
    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) return;

    // Check if trying to add a package when one already exists
    if (service.category === 'packages' && hasPackageInCart()) {
      toast.error('لا يمكن إضافة أكثر من باقة واحدة! يرجى إزالة الباقة الحالية أولاً.');
      return;
    }

    addToCart(serviceId);
    toast.success(`تمت الإضافة: ${service.name}`);
  };

  const handleRemoveFromCart = (serviceId: string) => {
    const item = cartItems.find(i => i.serviceId === serviceId);
    if (item && item.quantity > 1) {
      updateQuantity(serviceId, -1);
    } else {
      removeFromCart(serviceId);
      const service = SERVICES.find(s => s.id === serviceId);
      toast.success(`تمت الإزالة: ${service?.name}`);
    }
  };

  const getItemQuantity = (serviceId: string) => {
    const item = cartItems.find(i => i.serviceId === serviceId);
    return item?.quantity || 0;
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
          كاتالوج الخدمات
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/dropin/cart/${visitId}`)}
            className="relative p-2 hover:bg-white/10 rounded-lg"
          >
            <ShoppingCart className="size-6 text-white" />
            {getTotalItems() > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 size-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                style={{ background: 'var(--status-error)' }}
              >
                {getTotalItems()}
              </motion.span>
            )}
          </motion.button>
          <div className="flex items-center gap-1.5 text-white/90" style={{ fontSize: 'var(--font-size-xs)' }}>
            {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
          </div>
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="px-4 py-6" style={{ background: 'var(--bg-surface)' }}>
        <WizardStepper steps={steps} currentStepId="services" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5" style={{ color: 'var(--text-tertiary)' }} />
          <Input
            type="text"
            placeholder="ابحث عن خدمة..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pr-11"
            style={{ 
              height: 'var(--input-height)',
              borderRadius: 'var(--input-radius)',
              fontSize: 'var(--font-size-base)',
            }}
          />
        </motion.div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              selected={selectedCategory === cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              size="md"
            >
              {cat.label}
            </Chip>
          ))}
        </div>

        {/* Package Warning */}
        {hasPackageInCart() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl flex items-start gap-3"
            style={{ 
              background: 'var(--warning-soft)',
              border: '1px solid #FDE68A',
            }}
          >
            <AlertTriangle className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-warning)' }} />
            <p className="text-sm" style={{ color: '#92400E' }}>
              تم اختيار باقة. لا يمكن إضافة باقة أخرى.
            </p>
          </motion.div>
        )}

        {/* Services List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {paginatedServices.map((service, index) => {
              const quantity = getItemQuantity(service.id);
              const isPackage = service.category === 'packages';
              const canAdd = !isPackage || !hasPackageInCart() || quantity > 0;
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ 
                    background: 'var(--bg-surface)',
                    border: `1px solid ${quantity > 0 ? 'var(--brand-primary-300)' : 'var(--border-light)'}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>
                          {service.name}
                        </h3>
                        <div 
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            background: isPackage ? 'var(--brand-soft)' : 'var(--status-info-light)',
                            color: isPackage ? 'var(--brand-primary-600)' : 'var(--status-info)',
                          }}
                        >
                          {isPackage ? 'باقة' : 'خدمة'}
                        </div>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{formatDuration(service.duration)}</span>
                        </div>
                        {service.portfolioUrl && (
                          <button
                            onClick={() => setSelectedService(service)}
                            className="flex items-center gap-1 hover:underline"
                            style={{ color: 'var(--brand-primary-600)' }}
                          >
                            <Info className="size-3" />
                            <span>تفاصيل</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="font-bold mr-3" style={{ 
                      fontSize: 'var(--font-size-xl)',
                      color: 'var(--brand-primary-600)',
                    }}>
                      {service.price.toLocaleString()} ر.س
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {quantity > 0 ? (
                      <div className="flex items-center gap-3 flex-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveFromCart(service.id)}
                          className="size-10 rounded-xl flex items-center justify-center"
                          style={{ 
                            background: 'var(--neutral-100)',
                            border: '1px solid var(--border-main)',
                          }}
                        >
                          <Minus className="size-5" />
                        </motion.button>
                        <span className="font-bold min-w-10 text-center" style={{ fontSize: 'var(--font-size-lg)' }}>
                          {quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (isPackage) {
                              toast.error('لا يمكن زيادة كمية الباقة');
                              return;
                            }
                            updateQuantity(service.id, 1);
                          }}
                          disabled={isPackage}
                          className="size-10 rounded-xl flex items-center justify-center text-white"
                          style={{ 
                            background: isPackage 
                              ? 'var(--interactive-disabled)' 
                              : 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
                          }}
                        >
                          <Plus className="size-5" />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddToCart(service.id)}
                        disabled={!canAdd}
                        className="flex-1 h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                        style={{ 
                          background: canAdd
                            ? 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))'
                            : 'var(--interactive-disabled)',
                        }}
                      >
                        <Plus className="size-5" />
                        إضافة للسلة
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="size-10 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ 
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-main)',
              }}
            >
              <ChevronRight className="size-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="size-10 rounded-xl flex items-center justify-center font-semibold"
                style={{ 
                  background: page === currentPage 
                    ? 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))'
                    : 'var(--bg-surface)',
                  color: page === currentPage ? 'var(--text-inverse)' : 'var(--text-primary)',
                  border: `1px solid ${page === currentPage ? 'transparent' : 'var(--border-main)'}`,
                }}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="size-10 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ 
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-main)',
              }}
            >
              <ChevronLeft className="size-5" />
            </button>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background: 'var(--bg-overlay)' }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
              style={{ 
                background: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold mb-1" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {selectedService.name}
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                    {selectedService.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="size-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--neutral-100)' }}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--brand-soft)' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
                    <span className="font-semibold" style={{ color: 'var(--brand-primary-700)' }}>
                      مدة التنفيذ: {formatDuration(selectedService.duration)}
                    </span>
                  </div>
                  <p className="font-bold" style={{ 
                    fontSize: 'var(--font-size-xl)',
                    color: 'var(--brand-primary-600)',
                  }}>
                    {selectedService.price.toLocaleString()} ر.س
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2" style={{ fontSize: 'var(--font-size-base)' }}>
                    <FileText className="size-5" style={{ color: 'var(--brand-primary-600)' }} />
                    الميزات المتضمنة
                  </h4>
                  <ul className="space-y-2">
                    {selectedService.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="size-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                             style={{ background: 'var(--success-soft)' }}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            ✓
                          </motion.div>
                        </div>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedService.portfolioUrl && (
                  <a
                    href={selectedService.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-12 rounded-xl font-semibold"
                    style={{ 
                      background: 'var(--status-info-light)',
                      color: 'var(--status-info)',
                    }}
                  >
                    <ExternalLink className="size-5" />
                    عرض أعمال سابقة
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
