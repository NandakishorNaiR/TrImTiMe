# 🎨 DESIGN SYSTEM DOCUMENTATION

## Overview
Complete design system for TrimTime Barber Booking App with modern purple/teal color palette.

---

## 📚 Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Components](#components)
4. [Spacing & Layout](#spacing--layout)
5. [Usage Examples](#usage-examples)

---

## 🎨 Color Palette

### Primary Colors
- **Primary Purple**: `#9333ea` (Main brand color)
- **Secondary Purple**: `#7c3aed` (Accents)
- **Teal/Cyan**: `#14b8a6` (Success, highlights)

### Semantic Colors
- **Success**: `#22c55e` (Green)
- **Warning**: `#f97316` (Orange)
- **Danger**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

### Neutral Colors
- **White**: `#ffffff`
- **Light Gray**: `#f9f7ff`
- **Medium Gray**: `#e5e7eb`
- **Dark Gray**: `#1f2937`

See `constants/designTokens.js` for complete color definitions.

---

## 🔤 Typography

### Font Family
- Primary: **Poppins** (modern, friendly)
- Fallback: System UI sans-serif

### Font Sizes & Weights

| Level | Size | Weight | Use Case |
|-------|------|--------|----------|
| Display | 3.5rem | 700 | Hero sections |
| H1 | 2.5rem | 700 | Page titles |
| H2 | 2rem | 700 | Section titles |
| H3 | 1.5rem | 600 | Subsection titles |
| H4 | 1.25rem | 600 | Card titles |
| Body | 1rem | 400 | Main text |
| Body Small | 0.875rem | 400 | Secondary text |
| Label | 0.875rem | 600 | Form labels, badges |
| Caption | 0.75rem | 500 | Hints, timestamps |

---

## 🧩 Components

### Button
```jsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">Click Me</Button>
<Button variant="secondary" disabled>Disabled</Button>
<Button variant="danger" loading>Loading...</Button>
<Button fullWidth>Full Width</Button>
```

**Props:**
- `variant`: primary | secondary | tertiary | danger | ghost
- `size`: sm | md | lg
- `disabled`: boolean
- `loading`: boolean
- `fullWidth`: boolean

---

### Card
```jsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui';

<Card shadow="lg" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardBody>
    Content here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props:**
- `shadow`: none | sm | md | lg | xl
- `hover`: boolean
- `interactive`: boolean

---

### Badge
```jsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="lg">Pending</Badge>
<Badge variant="danger">Error</Badge>
```

**Props:**
- `variant`: default | primary | secondary | success | warning | danger | accent
- `size`: sm | md | lg

---

### Input
```jsx
import { Input, Textarea } from '@/components/ui';

<Input label="Full Name" placeholder="John Doe" />
<Input label="Email" type="email" error="Invalid email" />
<Textarea label="Bio" rows={4} hint="Max 500 characters" />
```

**Props:**
- `label`: string
- `type`: string
- `placeholder`: string
- `error`: string
- `hint`: string
- `size`: sm | md | lg

---

### Avatar
```jsx
import { Avatar } from '@/components/ui';

<Avatar src="/user.jpg" alt="John" />
<Avatar initials="JD" size="lg" />
```

**Props:**
- `src`: string (image URL)
- `initials`: string (fallback text)
- `size`: xs | sm | md | lg | xl

---

### Rating
```jsx
import { Rating } from '@/components/ui';

<Rating value={4} max={5} />
<Rating value={3} max={5} size="lg" />
```

**Props:**
- `value`: number
- `max`: number
- `size`: sm | md | lg

---

### Modal
```jsx
import { Modal } from '@/components/ui';
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  size="md"
>
  Are you sure?
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: sm | md | lg | xl | full
- `footer`: ReactNode

---

### Tabs
```jsx
import { Tabs } from '@/components/ui';

const tabs = [
  { label: 'Tab 1', content: <div>Content 1</div> },
  { label: 'Tab 2', content: <div>Content 2</div> },
];

<Tabs tabs={tabs} defaultActive={0} onChange={(index) => console.log(index)} />
```

---

### Alert
```jsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Success" message="Action completed" />
<Alert variant="error" title="Error" message="Something went wrong" onClose={() => {}} />
<Alert variant="warning" message="This is a warning" />
```

**Props:**
- `variant`: success | warning | error | info
- `title`: string
- `message`: string
- `onClose`: function

---

## 📏 Spacing & Layout

### Spacing Scale
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px (base unit)
- `6` = 24px
- `8` = 32px
- `12` = 48px
- `16` = 64px
- `20` = 80px
- `24` = 96px

### Breakpoints
- `xs`: 320px (mobile)
- `sm`: 640px (tablet)
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Grid Layout
```jsx
// 4-column grid on desktop, 2-column on tablet, 1-column on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

---

## 🎯 Usage Examples

### Complete Login Form
```jsx
import { Card, CardBody, Input, Button, Alert } from '@/components/ui';
import { useState } from 'react';

export function LoginForm() {
  const [error, setError] = useState('');
  
  return (
    <Card className="max-w-md mx-auto">
      <CardBody className="space-y-4">
        <h2 className="text-h3 font-bold">Login</h2>
        
        {error && <Alert variant="error" message={error} />}
        
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        
        <Button fullWidth variant="primary">
          Sign In
        </Button>
      </CardBody>
    </Card>
  );
}
```

### Booking Card
```jsx
import { Card, CardHeader, CardTitle, Badge, Button, Rating } from '@/components/ui';

export function BookingCard({ booking }) {
  return (
    <Card hover shadow="md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{booking.shopName}</CardTitle>
          <Badge variant="success">Confirmed</Badge>
        </div>
      </CardHeader>
      
      <div className="space-y-3">
        <p className="text-body-small text-neutral-600">
          📅 {booking.date} at {booking.time}
        </p>
        <p className="text-body">💇 {booking.service}</p>
        <Rating value={booking.rating} size="sm" />
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" size="sm" fullWidth>View</Button>
          <Button variant="danger" size="sm" fullWidth>Cancel</Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## 🚀 Integration

### Importing Components
```jsx
// Individual import
import { Button } from '@/components/ui/Button';

// Batch import
import { Button, Card, Badge, Input } from '@/components/ui';
```

### Using Design Tokens
```jsx
import { DESIGN_TOKENS } from '@/constants/designTokens';

const { colors, typography, spacing } = DESIGN_TOKENS;
```

### Tailwind CSS Classes
```jsx
// Use Tailwind directly for flexibility
<div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 rounded-xl shadow-lg">
  <h1 className="text-display font-bold text-white">Hero Section</h1>
</div>
```

---

## 📱 Responsive Design

### Mobile-First Approach
```jsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

### Hidden Elements
```jsx
// Show on desktop, hide on mobile
<div className="hidden lg:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">Mobile only</div>
```

---

## 🎨 Color Usage Guidelines

| Color | Usage |
|-------|-------|
| Primary Purple | Buttons, links, active states |
| Secondary Purple | Backgrounds, cards, accents |
| Teal/Cyan | Success states, badges |
| Green | Confirmations, positive actions |
| Orange | Warnings, pending states |
| Red | Errors, danger actions |
| Gray | Borders, disabled states, secondary text |

---

## ✅ Best Practices

1. **Consistency**: Always use design tokens for spacing, colors, and typography
2. **Accessibility**: Maintain sufficient color contrast ratios (WCAG AA)
3. **Mobile First**: Design for mobile, enhance for larger screens
4. **Performance**: Use lazy loading for images, optimize animations
5. **Shadows**: Use shadows to create hierarchy, not just decoration
6. **Whitespace**: Let content breathe with generous spacing

---

## 📞 Support

For component issues or feature requests, check the design system repository or contact the design team.

**Last Updated**: May 25, 2026
