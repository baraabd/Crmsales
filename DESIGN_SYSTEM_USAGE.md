# 📚 دليل استخدام Design System - FieldCRM

## 🎨 المكونات المتاحة

### **1. Primitives (المكونات الأساسية)**

#### Text
```tsx
import { Text } from '@/design-system';

<Text variant="headingLarge" weight="bold" color="brand">
  مرحباً بك
</Text>

// Variants:
// - displayLarge, displayMedium, displaySmall
// - headingLarge, headingMedium, headingSmall
// - titleLarge, titleMedium, titleSmall
// - bodyLarge, bodyMedium, bodySmall
// - labelLarge, labelMedium, labelSmall
// - caption, captionSmall
```

#### Button
```tsx
import { Button } from '@/design-system';

<Button 
  variant="primary" 
  size="lg" 
  loading={isLoading}
  startIcon={<Icon />}
  fullWidth
  onClick={handleClick}
>
  تسجيل الدخول
</Button>

// Variants: primary, secondary, ghost, danger, success
// Sizes: sm, md, lg
```

#### Card
```tsx
import { Card } from '@/design-system';

<Card 
  variant="elevated" 
  padding="lg" 
  interactive
  onClick={handleClick}
>
  محتوى الكارد
</Card>

// Variants: elevated, outlined, filled
// Padding: none, xs, sm, md, lg, xl
```

#### Badge
```tsx
import { Badge } from '@/design-system';

<Badge variant="success" content="جديد" />
<Badge variant="error" content={5} max={99} />
<Badge dot pulse />

// Variants: brand, neutral, success, info, warning, error
```

---

### **2. Form Components**

#### TextField
```tsx
import { TextField } from '@/design-system';

<TextField
  label="البريد الإلكتروني"
  value={email}
  onChange={setEmail}
  placeholder="أدخل بريدك الإلكتروني"
  type="email"
  error={errors.email}
  helperText="سنرسل لك رمز التحقق"
  startAdornment={<EmailIcon />}
  required
  fullWidth
/>
```

#### Select
```tsx
import { Select } from '@/design-system';

const options = [
  { value: 'hot', label: 'ساخن', icon: <FireIcon /> },
  { value: 'warm', label: 'دافئ' },
  { value: 'cold', label: 'بارد' },
];

<Select
  label="حالة العميل"
  value={status}
  onChange={setStatus}
  options={options}
  searchable
  error={errors.status}
/>
```

#### Checkbox
```tsx
import { Checkbox } from '@/design-system';

<Checkbox
  checked={agreed}
  onChange={setAgreed}
  label="أوافق على الشروط والأحكام"
  description="يرجى قراءة الشروط بعناية"
  error={errors.agreed}
/>
```

---

### **3. Feedback Components**

#### Dialog
```tsx
import { Dialog } from '@/design-system';

<Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="تأكيد الحذف"
  description="هل أنت متأكد من حذف هذا العنصر؟"
  iconVariant="warning"
  primaryText="حذف"
  primaryVariant="danger"
  onPrimary={handleDelete}
  secondaryText="إلغاء"
  primaryLoading={isDeleting}
/>
```

#### Banner
```tsx
import { Banner } from '@/design-system';

<Banner
  variant="warning"
  message="لديك 3 زيارات معلقة اليوم"
  action={{ label: 'عرض', onClick: () => {} }}
  dismissible
  onDismiss={() => {}}
/>

// Variants: success, info, warning, error, offline
```

#### LoadingOverlay
```tsx
import { LoadingOverlay } from '@/design-system';

<LoadingOverlay
  visible={isLoading}
  message="جاري التحميل..."
  blur
/>
```

#### EmptyState
```tsx
import { EmptyState } from '@/design-system';

<EmptyState
  icon={<InboxIcon />}
  title="لا توجد نتائج"
  description="جرب تغيير معايير البحث"
  action={{ label: 'إعادة المحاولة', onClick: () => {} }}
  size="md"
/>
```

---

### **4. Navigation Components**

#### TopBar
```tsx
import { TopBar, TopBarIconButton, TopBarBackButton } from '@/design-system';

<TopBar
  title="الصفحة الرئيسية"
  variant="elevated"
  leftContent={<TopBarBackButton onClick={() => navigate(-1)} />}
  rightContent={
    <>
      <TopBarIconButton icon={<SearchIcon />} onClick={() => {}} label="بحث" />
      <TopBarIconButton icon={<BellIcon />} onClick={() => {}} label="إشعارات" badge={3} />
    </>
  }
/>
```

#### BottomNav
```tsx
import { BottomNav } from '@/design-system';

const navItems = [
  { key: 'home', label: 'الرئيسية', icon: <HomeIcon /> },
  { key: 'leads', label: 'العملاء', icon: <UsersIcon />, badge: 5 },
  { key: 'calendar', label: 'التقويم', icon: <CalendarIcon /> },
  { key: 'stats', label: 'الإحصائيات', icon: <ChartIcon /> },
  { key: 'profile', label: 'الملف', icon: <UserIcon /> },
];

<BottomNav
  items={navItems}
  activeKey={activeTab}
  onChange={setActiveTab}
  showLabels
/>
```

---

### **5. Feature Cards**

#### LeadCard
```tsx
import { LeadCard } from '@/design-system';

<LeadCard
  name="أحمد محمد"
  businessName="شركة النور"
  phone="0501234567"
  status="hot"
  distance={1500}
  lastContact="منذ ساعتين"
  notesCount={3}
  showActions
  onCall={() => window.location.href = 'tel:0501234567'}
  onNavigate={() => {}}
  onClick={() => navigate(`/leads/${id}`)}
/>

// Status: hot, warm, cold, new
```

#### StatsCard
```tsx
import { StatsCard } from '@/design-system';

<StatsCard
  label="الزيارات اليوم"
  value={12}
  icon={<UsersIcon />}
  trend={{ value: 15, isPositive: true }}
  color="brand"
  onClick={() => {}}
/>

// Colors: brand, success, warning, info, neutral
```

---

## 🛠️ Utility Functions

```tsx
import {
  cn,                    // Tailwind class merger
  formatCurrency,        // تنسيق العملات
  formatDate,            // تنسيق التواريخ
  formatTime,            // تنسيق الوقت
  formatRelativeTime,    // "منذ ساعتين"
  formatPhoneNumber,     // تنسيق الهاتف
  formatDistance,        // "1.5 كم"
  truncate,              // اختصار النصوص
  getInitials,           // الحروف الأولى
  debounce,              // تأخير التنفيذ
  throttle,              // تحديد معدل التنفيذ
  generateId,            // إنشاء ID عشوائي
} from '@/design-system/utils';

// أمثلة:
cn('px-4', 'py-2', { 'bg-red-500': hasError });
formatCurrency(1234.56, 'SAR'); // "1,234.56 ر.س"
formatDate(new Date()); // "الجمعة، 5 فبراير 2026"
formatRelativeTime(date); // "منذ دقيقتين"
formatPhoneNumber('0501234567'); // "0501234 567"
formatDistance(1500); // "1.5 كم"
```

---

## 🎨 Theme & Design Tokens

```tsx
import { theme } from '@/design-system';

// استخدام الـ tokens في CSS Variables:
<div className="bg-[var(--brand-blue-500)]" />
<div className="text-[var(--text-primary)]" />
<div className="rounded-[var(--radius-lg)]" />
<div className="shadow-[var(--shadow-level-2)]" />

// أو استخدام theme object مباشرة:
const myColor = theme.colors.brand[500];
const mySpacing = theme.spacing[4];
```

---

## 📱 صفحات كاملة (Examples)

### صفحة Login
```tsx
import { Text, Button, Card, TextField } from '@/design-system';

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--brand-blue-50)] to-white">
      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        <Text variant="headingLarge" className="mb-6">مرحباً بك</Text>
        
        <TextField
          label="رقم الموظف"
          value={employeeId}
          onChange={setEmployeeId}
          placeholder="أدخل رقم الموظف"
          fullWidth
        />
        
        <TextField
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="أدخل كلمة المرور"
          fullWidth
          className="mt-4"
        />
        
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth
          loading={isLoading}
          onClick={handleLogin}
          className="mt-6"
        >
          تسجيل الدخول
        </Button>
      </Card>
    </div>
  );
}
```

### صفحة Home/Map
```tsx
// انظر /src/app/screens/home/HomeMapNew.tsx
// صفحة كاملة مع خريطة تفاعلية، فلاتر، bottom sheet
```

### صفحة Dashboard
```tsx
// انظر /src/app/screens/home/HomeDashboard.tsx
// صفحة رئيسية مع إحصائيات وإجراءات سريعة
```

---

## 🚀 Best Practices

### 1. استخدم Semantic Components
```tsx
// ❌ سيء
<div className="text-lg font-bold text-blue-600">عنوان</div>

// ✅ جيد
<Text variant="headingMedium" weight="bold" color="brand">عنوان</Text>
```

### 2. استخدم Design Tokens
```tsx
// ❌ سيء
<div className="bg-blue-500 text-white p-4 rounded-lg">

// ✅ جيد
<div className="bg-[var(--brand-blue-500)] text-[var(--text-inverse)] p-[var(--spacing-4)] rounded-[var(--radius-lg)]">
```

### 3. استخدم Utility Functions
```tsx
// ❌ سيء
const formatted = `${amount.toFixed(2)} ريال`;

// ✅ جيد
const formatted = formatCurrency(amount, 'SAR');
```

### 4. Type Safety
```tsx
// ✅ استخدم الـ types المُعرّفة
import type { TextProps, ButtonProps } from '@/design-system';
```

---

## 📖 المزيد

- **Theme Tokens**: `/src/design-system/theme/`
- **Components**: `/src/design-system/components/`
- **Utilities**: `/src/design-system/utils.ts`
- **Types**: `/src/design-system/types.ts`

---

**تم بناء هذا النظام بحب ❤️ لتطبيق FieldCRM**
