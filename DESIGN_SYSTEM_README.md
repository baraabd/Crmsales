# Field CRM - Dark Premium Design System

## 🎨 نظرة عامة

تم إعادة تصميم التطبيق بالكامل ليتبع تصميم داكن احترافي مشابه لتطبيقات مثل Uber و Lyft، مع التركيز على:

- **Dark Theme**: خلفية داكنة جداً مع ألوان نيون (#0A0E14)
- **Neon Green Primary**: اللون الأساسي أخضر نيون (#00FF88)
- **Glassmorphism**: تأثيرات زجاجية شفافة مع blur
- **Floating UI**: واجهة عائمة فوق الخريطة
- **Glow Effects**: تأثيرات توهج للعناصر المهمة

## 🏗️ الهيكل الجديد

```
src/
├── design-system/           # نظام التصميم
│   ├── tokens/             # Design Tokens
│   │   ├── colors.ts       # الألوان
│   │   ├── typography.ts   # الخطوط
│   │   ├── spacing.ts      # المسافات
│   │   ├── radius.ts       # Border Radius
│   │   └── shadows.ts      # الظلال والتأثيرات
│   └── components/         # المكونات الأساسية
│       ├── AppButton.tsx
│       ├── GlassCard.tsx
│       ├── FloatingActionButton.tsx
│       ├── BottomSheet.tsx
│       ├── AppInput.tsx
│       └── StatusBadge.tsx
│
├── app/
│   └── screens/
│       ├── MapScreen.tsx          # الشاشة الرئيسية (خريطة + واجهة عائمة)
│       └── auth/
│           └── LoginScreenNew.tsx # شاشة تسجيل دخول جديدة
│
└── styles/
    └── theme.css              # CSS Variables محدثة
```

## 🎨 الألوان الرئيسية

```css
/* Primary - Neon Green */
--brand-primary: #00FF88
--brand-primary-glow: rgba(0, 255, 136, 0.3)

/* Secondary - Blue */
--brand-secondary: #0099FF

/* Accent Colors */
--accent-orange: #FF9500
--accent-red: #FF3B30
--accent-purple: #7B61FF

/* Background - Very Dark */
--bg-primary: #0A0E14
--bg-secondary: #141B26
--bg-tertiary: #1C2533
--bg-card: rgba(28, 37, 51, 0.6)  /* Glass effect */

/* Text */
--text-primary: #FFFFFF
--text-secondary: #9BA5B7
--text-tertiary: #6B7685
```

## 🧩 المكونات الأساسية

### 1. AppButton
```tsx
import { AppButton } from '@/design-system/components';

<AppButton 
  variant="primary"    // primary, secondary, ghost, danger, warning
  size="lg"           // sm, md, lg
  glow={true}         // تأثير التوهج
  fullWidth
>
  النص
</AppButton>
```

### 2. GlassCard
```tsx
import { GlassCard } from '@/design-system/components';

<GlassCard
  variant="medium"   // light, medium, heavy
  padding="md"       // none, sm, md, lg
  rounded="xl"       // md, lg, xl, 2xl
  shadow
  border
  hover
>
  المحتوى
</GlassCard>
```

### 3. FloatingActionButton (FAB)
```tsx
import { FloatingActionButton } from '@/design-system/components';

<FloatingActionButton
  icon={<Plus />}
  variant="primary"
  size="lg"
  glow
  position={{ bottom: '24px', right: '24px' }}
/>
```

### 4. BottomSheet
```tsx
import { BottomSheet } from '@/design-system/components';

<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="العنوان"
  height="half"      // auto, half, full
  showHandle
>
  المحتوى
</BottomSheet>
```

### 5. AppInput
```tsx
import { AppInput } from '@/design-system/components';

<AppInput
  label="البريد الإلكتروني"
  icon={<Mail />}
  iconPosition="right"
  error="رسالة الخطأ"
  fullWidth
/>
```

### 6. StatusBadge
```tsx
import { StatusBadge } from '@/design-system/components';

<StatusBadge 
  variant="success"   // success, warning, error, info, default
  size="md"          // sm, md
  glow
>
  نشط
</StatusBadge>
```

## 📱 الشاشات الجديدة

### MapScreen - الشاشة الرئيسية
**المسار**: `/app/map-new`

**المميزات**:
- خريطة كاملة في الخلفية
- شريط علوي عائم (Status Bar)
- شريط بحث عائم
- بطاقات إحصائيات
- أزرار FAB للتنقل
- زر Clock In/Out رئيسي
- Bottom Sheets للقائمة والعملاء

### LoginScreenNew - تسجيل الدخول
**المسار**: `/auth/login-new`

**المميزات**:
- تصميم داكن مع GlassCard
- Logo متحرك مع توهج
- حقول إدخال بتصميم جديد
- زر تسجيل دخول مع glow effect

## 🎯 كيفية الاستخدام

### 1. الوصول للشاشة الجديدة

بعد تسجيل الدخول، انتقل إلى:
```
/app/map-new
```

### 2. استخدام المكونات في شاشاتك

```tsx
import { 
  AppButton, 
  GlassCard, 
  FloatingActionButton,
  BottomSheet,
  AppInput,
  StatusBadge 
} from '@/design-system/components';

function MyScreen() {
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <GlassCard>
        <AppButton variant="primary" glow>
          اضغط هنا
        </AppButton>
      </GlassCard>
    </div>
  );
}
```

### 3. استخدام Design Tokens

```tsx
// في JSX
<div style={{ 
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--glow-green)'
}} />

// في Tailwind
<div className="rounded-xl" style={{ background: 'var(--bg-card)' }} />
```

## 🚀 الخطوات التالية

- [ ] تطبيق التصميم على شاشات Drop-in Flow
- [ ] إضافة خريطة حقيقية (Google Maps / Mapbox)
- [ ] تحسين الأنيميشنات
- [ ] إضافة Dark Mode Toggle
- [ ] تحسين استجابة الموبايل

## 📝 ملاحظات

1. جميع المكونات تدعم RTL بشكل كامل
2. التصميم mobile-first
3. جميع الألوان من CSS Variables قابلة للتخصيص
4. Glassmorphism يعمل على جميع المتصفحات الحديثة

---

تم التصميم مع ❤️ بواسطة Field CRM Team
