# 🎨 Jibble Style Guide - FieldCRM

## 🌈 Overview

هذا الدليل يوضح كيفية تطبيق ستايل Jibble الاحترافي على جميع صفحات ومكونات تطبيق FieldCRM.

---

## 🎨 Core Design Principles

### 1. **Colors - Purple/Indigo Heavy**
```css
/* Primary: Purple/Indigo Gradients */
--brand-primary-500: #8B5CF6
--brand-primary-600: #7C3AED
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)

/* Secondary: Vibrant Blue */
--brand-secondary-500: #3B82F6
--gradient-secondary: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)

/* Accent: Pink/Magenta */
--brand-accent-500: #D946EF
--gradient-accent: linear-gradient(135deg, #D946EF 0%, #C026D3 100%)
```

### 2. **Shadows - Dramatic & Deep**
```css
/* Colored shadows for depth */
--shadow-primary: 0px 8px 24px rgba(139, 92, 246, 0.25)
--shadow-xl: 0px 16px 48px rgba(0, 0, 0, 0.20)
--shadow-2xl: 0px 24px 64px rgba(0, 0, 0, 0.25)
```

### 3. **Border Radius - Large & Rounded**
```css
--radius-xl: 24px
--radius-2xl: 32px
--button-radius: 24px
--card-radius: 32px
```

### 4. **Gradients - Everywhere!**
```css
.gradient-primary    /* Purple gradient */
.gradient-secondary  /* Blue gradient */
.gradient-mesh       /* Multi-color gradient */
```

---

## 📱 Component Styling

### **Button - Jibble Style**

```tsx
// ✅ Primary Button (Gradient + Shadow)
<Button variant="primary" size="lg">
  تسجيل الدخول
</Button>
// Output: Purple gradient + colored shadow + large radius

// Styles:
- gradient-primary
- shadow-primary
- rounded-[24px]
- hover:scale-[1.02]
- active:scale-[0.98]
```

### **Card - Jibble Style**

```tsx
// ✅ Elevated Card (White + Dramatic Shadow)
<Card variant="elevated" padding="lg">
  المحتوى
</Card>

// Styles:
- bg-white
- rounded-[32px]
- shadow-md
- hover:shadow-lg
- hover:y-[-2px]
```

### **Badge - Jibble Style**

```tsx
// ✅ Status Badge (Vibrant Colors)
<Badge variant="success" content="نشط" />

// Styles:
- rounded-full
- border-2
- font-bold
- Vibrant background colors
```

---

## 🎨 Page Design Patterns

### **1. Login Page - Jibble Style**

**Key Features:**
- ✨ Animated gradient orbs background
- 💜 Purple gradient logo
- 🔮 Glassmorphism card
- 🎯 Large rounded inputs (52px height)
- 🌊 Smooth animations

```tsx
// Background Gradient
bg-gradient-to-br from-[var(--brand-primary-50)] via-white to-[var(--brand-secondary-50)]

// Animated Orbs
<GradientOrb className="w-96 h-96 bg-gradient-to-r from-[var(--brand-primary-400)] to-[var(--brand-accent-400)]" />

// Glass Card
<Card variant="glass" padding="lg">
  <!-- Login form -->
</Card>
```

**انظر:** `/src/app/screens/auth/LoginNew.tsx`

---

### **2. Home Map - Jibble Style**

**Key Features:**
- 🎨 Vibrant gradient background
- 📍 Large rounded pins with gradients
- 🎯 Colored shadows on pins
- 💫 Pulse animation on selection
- 🔵 Large filter chips with gradients
- 🚀 Gradient FAB button

```tsx
// Map Background
bg-gradient-to-br from-[var(--brand-primary-50)] via-[var(--brand-secondary-50)] to-[var(--brand-accent-50)]

// Pin with Gradient
<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] border-4 border-white shadow-xl">
  <MapIcon />
</div>

// Filter Chip (Active)
<button className="gradient-primary text-white shadow-lg rounded-full px-5 h-11">
  الكل <span>12</span>
</button>

// FAB
<button className="w-16 h-16 rounded-[24px] gradient-primary shadow-primary">
  <PlusIcon />
</button>
```

**انظر:** `/src/app/screens/home/HomeMapJibble.tsx`

---

### **3. Dashboard - Jibble Style**

**Key Features:**
- 🌈 Gradient page background
- 📊 Stats cards with colored icons
- ⚡ Quick actions with gradients
- 🎨 Vibrant status indicators

```tsx
// Page Background
bg-gradient-to-br from-[var(--brand-primary-50)] via-white to-[var(--brand-secondary-50)]

// Stats Card with Icon
<StatsCard
  label="الزيارات"
  value={5}
  icon={<UsersIcon />}
  color="brand"  // Purple gradient icon background
/>

// Quick Action
<div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
  <MapIcon />
</div>
```

**انظر:** `/src/app/screens/home/HomeDashboardJibble.tsx`

---

## 🎭 Animation Patterns

### **1. Hover Effects**
```tsx
// Cards
whileHover={{ y: -2 }}
hover:shadow-xl

// Buttons
whileHover={{ scale: 1.05 }}
hover:shadow-lg

// Pins
whileHover={{ scale: 1.1 }}
```

### **2. Tap/Press Effects**
```tsx
whileTap={{ scale: 0.97 }}
active:scale-[0.98]
```

### **3. Entrance Animations**
```tsx
initial={{ y: 20, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ delay: 0.1 }}
```

### **4. Pulse Animation (Selected State)**
```tsx
<motion.div
  initial={{ scale: 0.8, opacity: 0.6 }}
  animate={{ scale: 1.8, opacity: 0 }}
  transition={{ duration: 1.2, repeat: Infinity }}
  className="gradient-primary rounded-2xl"
/>
```

---

## 🎨 Color Usage Guide

### **When to use each gradient:**

| Gradient | Use Case | Example |
|----------|----------|---------|
| `gradient-primary` | Primary buttons, FAB, main actions | Login, Submit |
| `gradient-secondary` | Secondary highlights, info cards | Info sections |
| `gradient-success` | Success states, completed actions | Completed visit |
| `gradient-sunset` | Warning/attention states | Pending actions |
| `gradient-mesh` | Decorative backgrounds | Hero sections |

### **Status Colors:**

| Status | Color | Gradient |
|--------|-------|----------|
| Hot 🔥 | `#EF4444` | `from-[#EF4444] to-[#DC2626]` |
| Warm ☀️ | `#F59E0B` | `from-[#F59E0B] to-[#D97706]` |
| Cold ❄️ | `#3B82F6` | `from-[#3B82F6] to-[#2563EB]` |
| New ✨ | `#10B981` | `from-[#10B981] to-[#059669]` |

---

## 📐 Spacing & Sizing

### **Component Heights (Jibble Standard)**
```css
Button SM:  36px
Button MD:  44px
Button LG:  52px

Input:      52px
Filter Chip: 44px
FAB:        56px (or 64px for emphasis)

TopBar:     56px
BottomNav:  64px
```

### **Border Radius Guidelines**
```css
Small elements:  12px - 16px
Buttons:         24px
Cards:           32px
FAB:             24px
Pins:            20px
Badge:           full (9999px)
```

---

## ✨ Special Effects

### **1. Glassmorphism**
```tsx
<div className="glass">
  <!-- Content -->
</div>

// CSS:
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### **2. Text Gradient**
```tsx
<Text className="text-gradient-primary">
  مرحباً بك
</Text>

// CSS:
.text-gradient-primary {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### **3. Animated Orbs (Background)**
```tsx
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.4, 0.6, 0.4],
    x: [0, 30, 0],
    y: [0, -30, 0],
  }}
  transition={{ duration: 8, repeat: Infinity }}
  className="absolute w-96 h-96 rounded-full blur-3xl gradient-primary"
/>
```

---

## 🎯 Quick Checklist

عند تصميم أي صفحة جديدة، تأكد من:

- ✅ **Gradient background** للصفحة
- ✅ **Colored shadows** للعناصر التفاعلية
- ✅ **Large border radius** (24px+)
- ✅ **Purple/Indigo** كألوان أساسية
- ✅ **Smooth animations** على جميع التفاعلات
- ✅ **Vibrant status colors**
- ✅ **Dramatic shadows** للعمق
- ✅ **Glassmorphism** للطبقات العلوية
- ✅ **Bold typography** للعناوين
- ✅ **Generous white space**

---

## 📁 Files Modified for Jibble Style

```
✅ /src/styles/theme.css                    (Complete rewrite)
✅ /src/design-system/theme/colors.ts        (Purple/Indigo palette)
✅ /src/design-system/theme/shadows.ts       (Dramatic shadows)
✅ /src/design-system/theme/radius.ts        (Larger values)
✅ /src/design-system/primitives/Button      (Gradients + shadows)
✅ /src/design-system/primitives/Card        (Large radius)
✅ /src/design-system/primitives/Badge       (Vibrant colors)
✅ /src/app/screens/auth/LoginNew.tsx        (Jibble style)
✅ /src/app/screens/home/HomeMapJibble.tsx   (Jibble style)
✅ /src/app/screens/home/HomeDashboardJibble.tsx (Jibble style)
```

---

## 🚀 Next Steps

لتطبيق Jibble Style على باقي الصفحات:

1. **Drop-in Flow** - رحلة الزيارة الميدانية
2. **Calendar** - صفحة التقويم
3. **Stats** - صفحة الإحصائيات
4. **Profile** - صفحة الملف الشخصي
5. **Settings** - صفحة الإعدادات

---

## 🎨 Design Inspiration

**Jibble App Characteristics:**
- 💜 Purple is the hero color
- ✨ Gradients everywhere
- 🎭 Dramatic shadows create depth
- 🔵 Large, rounded UI elements
- 🌈 Vibrant, joyful color palette
- 💫 Smooth, delightful animations
- 🎯 Bold typography
- ⚡ Clear hierarchy

---

**تم بناء هذا الدليل بحب ❤️ لـ FieldCRM بستايل Jibble**
