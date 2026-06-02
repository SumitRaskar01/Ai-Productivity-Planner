# 📄 design.md — Timezy UI Design System

## 1. 🎨 Design Overview
Timezy follows a minimal, soft, productivity-focused UI with:
- Calm green-based palette (reduces cognitive load)
- Rounded, friendly components
- Clear hierarchy for task management
- Subtle shadows + depth for card separation

Design style:
- Soft neumorphism + flat hybrid
- Focus on usability over decoration

---

## 2. 🔤 Typography

### Font Family
- Primary: Inter / SF Pro Display (iOS style)
- Fallback: system-ui, -apple-system, sans-serif

### Font Scale

| Type            | Size | Weight | Usage |
|----------------|------|--------|------|
| Heading Large  | 28px | 600    | Planner, Calendar |
| Heading Medium | 22px | 600    | Section titles |
| Body Large     | 16px | 500    | Main content |
| Body Regular   | 14px | 400    | Secondary text |
| Caption        | 12px | 400    | Labels, time |

### Typography Rules
- Line height: 1.4–1.6
- Letter spacing: slightly negative for headings (-0.5px)
- Use medium weight (500) instead of bold for modern feel

---

## 3. 🎨 Color System

### Primary Palette

- Primary Green: #1F7A4C
- Light Green BG: #EAF4EC
- Accent Green: #2E8B57

### Neutral Colors

- Text Dark: #1A1A1A
- Text Light: #6B7280
- Border: #E5E7EB
- White: #FFFFFF

### Status Colors

- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444
- Info: #3B82F6

---

## 4. 📦 Spacing System

Use 8px grid system

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

Rules:
- Cards padding: 16–20px
- Screen margins: 20px
- Component gap: 12–16px

---

## 5. 🔘 Components

### Buttons
- Radius: 12px
- Height: 44px
- Background: #1F7A4C
- Text: white

### Cards
- Background: white
- Border radius: 16px
- Shadow: 0 4px 12px rgba(0,0,0,0.05)

---

## 6. 📱 Layout System

- Top: Greeting + Profile
- Middle: Summary Cards
- Bottom: Activity Graph
- Right: Calendar + Timeline

---

## 7. 📊 Data Visualization

- Rounded bar charts
- Active: dark green
- Inactive: light grey

---

## 8. 🧠 UX Principles

- Visual hierarchy
- Progressive disclosure
- Calm color psychology
- Soft UI feel

---

## 9. ✨ Iconography

- Outline + soft fill
- Size: 20–24px

---

## 10. 🎯 Design Tokens

```css
:root {
  --color-primary: #1F7A4C;
  --color-bg: #EAF4EC;
  --color-text: #1A1A1A;
  --color-muted: #6B7280;

  --radius-md: 12px;
  --radius-lg: 16px;

  --spacing-md: 16px;
  --spacing-lg: 24px;

  --shadow-soft: 0 4px 12px rgba(0,0,0,0.05);
}
```

---

## 11. 🚀 Extras

- Interaction states (hover, focus, disabled)
- Accessibility (contrast ≥ 4.5:1)
- Motion (200–300ms transitions)
- Responsive layouts

---

## 12. 📌 Summary

Minimal, modern, and productivity-focused UI system suitable for dashboards and task apps.
