# AgentBench Design System

This document defines the design system for AgentBench, providing a comprehensive guide to visual tokens, component patterns, and usage guidelines.

## Table of Contents

- [Getting Started](#getting-started)
- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Dark Mode](#dark-mode)
- [Component Patterns](#component-patterns)
- [Accessibility](#accessibility)

---

## Getting Started

### Installation

Import the design tokens at the root of your application:

```css
/* In your main CSS file (e.g., index.css or App.css) */
@import './styles/tokens.css';
```

### Usage with Tailwind CSS

The tokens are defined as CSS custom properties and can be used alongside Tailwind CSS. For custom values, reference the tokens directly:

```css
.custom-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}
```

---

## Colors

### Color Palette

The design system includes five color scales, each with 10 shades (50-900):

#### Primary (Blue)

Used for primary actions, links, and focus states.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-50` | `#eff6ff` | Lightest backgrounds |
| `--color-primary-100` | `#dbeafe` | Light backgrounds |
| `--color-primary-200` | `#bfdbfe` | Hover backgrounds |
| `--color-primary-300` | `#93c5fd` | Borders |
| `--color-primary-400` | `#60a5fa` | Icons |
| `--color-primary-500` | `#3b82f6` | Primary buttons, links |
| `--color-primary-600` | `#2563eb` | Hover states |
| `--color-primary-700` | `#1d4ed8` | Active states |
| `--color-primary-800` | `#1e40af` | Dark accents |
| `--color-primary-900` | `#1e3a8a` | Darkest accents |

#### Success (Green)

Used for success states, confirmations, and positive actions.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success-50` | `#f0fdf4` | Success backgrounds |
| `--color-success-500` | `#22c55e` | Success indicators |
| `--color-success-700` | `#15803d` | Success text |

#### Error (Red)

Used for error states, destructive actions, and alerts.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-error-50` | `#fef2f2` | Error backgrounds |
| `--color-error-500` | `#ef4444` | Error indicators |
| `--color-error-700` | `#b91c1c` | Error text |

#### Warning (Amber)

Used for warning states, cautions, and important notices.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-warning-50` | `#fffbeb` | Warning backgrounds |
| `--color-warning-500` | `#f59e0b` | Warning indicators |
| `--color-warning-700` | `#b45309` | Warning text |

#### Neutral (Gray)

Used for text, backgrounds, borders, and general UI elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-neutral-50` | `#fafafa` | Page backgrounds |
| `--color-neutral-100` | `#f5f5f5` | Card backgrounds |
| `--color-neutral-200` | `#e5e5e5` | Borders |
| `--color-neutral-500` | `#737373` | Secondary text |
| `--color-neutral-900` | `#171717` | Primary text |

### Semantic Color Tokens

Use semantic tokens for consistent theming across light and dark modes:

```css
/* Background colors */
var(--bg-primary)      /* Main background */
var(--bg-secondary)    /* Card backgrounds */
var(--bg-tertiary)     /* Nested elements */
var(--bg-inverse)      /* Inverted backgrounds */
var(--bg-accent)       /* Accent backgrounds */

/* Text colors */
var(--text-primary)    /* Main text */
var(--text-secondary)  /* Secondary text */
var(--text-tertiary)   /* Disabled/placeholder text */
var(--text-inverse)    /* Text on dark backgrounds */
var(--text-accent)     /* Links and accents */

/* Border colors */
var(--border-primary)  /* Default borders */
var(--border-secondary) /* Darker borders */
var(--border-accent)   /* Accent borders */

/* Status colors */
var(--status-success)  /* Success text/icons */
var(--status-success-bg) /* Success backgrounds */
var(--status-error)    /* Error text/icons */
var(--status-error-bg) /* Error backgrounds */
var(--status-warning)  /* Warning text/icons */
var(--status-warning-bg) /* Warning backgrounds */
```

### Example: Status Badge

```jsx
// Success badge
<span style={{
  backgroundColor: 'var(--status-success-bg)',
  color: 'var(--status-success)',
  padding: 'var(--spacing-1) var(--spacing-2)',
  borderRadius: 'var(--radius-full)'
}}>
  Completed
</span>
```

---

## Typography

### Font Families

```css
var(--font-family-sans)  /* System sans-serif stack */
var(--font-family-mono)  /* Monospace for code */
```

### Font Weights

**Limited to 3 weights** per design decision (REQ-038):

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-regular` | `400` | Body text, descriptions |
| `--font-weight-medium` | `500` | Subheadings, labels, emphasis |
| `--font-weight-bold` | `700` | Headings, important text |

### Font Sizes

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--font-size-xs` | `0.75rem` | 12px | Captions, badges |
| `--font-size-sm` | `0.875rem` | 14px | Secondary text |
| `--font-size-base` | `1rem` | 16px | Body text |
| `--font-size-lg` | `1.125rem` | 18px | Large body text |
| `--font-size-xl` | `1.25rem` | 20px | Small headings |
| `--font-size-2xl` | `1.5rem` | 24px | Section headings |
| `--font-size-3xl` | `1.875rem` | 30px | Page headings |
| `--font-size-4xl` | `2.25rem` | 36px | Large headings |
| `--font-size-5xl` | `3rem` | 48px | Hero headings |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--line-height-tight` | `1.25` | Headings |
| `--line-height-snug` | `1.375` | Compact text |
| `--line-height-normal` | `1.5` | Body text |
| `--line-height-relaxed` | `1.625` | Large body text |

### Typography Examples

```jsx
// Page heading
<h1 style={{
  fontSize: 'var(--font-size-3xl)',
  fontWeight: 'var(--font-weight-bold)',
  lineHeight: 'var(--line-height-tight)',
  color: 'var(--text-primary)'
}}>
  Dashboard
</h1>

// Body text
<p style={{
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 'var(--line-height-normal)',
  color: 'var(--text-secondary)'
}}>
  Welcome to AgentBench, the evaluation platform for AI agents.
</p>

// Label
<label style={{
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--text-primary)'
}}>
  Agent Name
</label>
```

---

## Spacing

The spacing scale uses a 4px base unit. The number represents multiples of 4px:

| Token | Value | Pixels |
|-------|-------|--------|
| `--spacing-0` | `0` | 0px |
| `--spacing-px` | `1px` | 1px |
| `--spacing-0-5` | `0.125rem` | 2px |
| `--spacing-1` | `0.25rem` | 4px |
| `--spacing-2` | `0.5rem` | 8px |
| `--spacing-3` | `0.75rem` | 12px |
| `--spacing-4` | `1rem` | 16px |
| `--spacing-5` | `1.25rem` | 20px |
| `--spacing-6` | `1.5rem` | 24px |
| `--spacing-8` | `2rem` | 32px |
| `--spacing-10` | `2.5rem` | 40px |
| `--spacing-12` | `3rem` | 48px |
| `--spacing-16` | `4rem` | 64px |
| `--spacing-20` | `5rem` | 80px |
| `--spacing-24` | `6rem` | 96px |
| `--spacing-32` | `8rem` | 128px |

### Spacing Guidelines

- **Inline spacing**: Use `--spacing-1` to `--spacing-2` between inline elements
- **Component padding**: Use `--spacing-3` to `--spacing-4` for buttons and inputs
- **Card padding**: Use `--spacing-4` to `--spacing-6` for card content
- **Section spacing**: Use `--spacing-8` to `--spacing-12` between sections
- **Page margins**: Use `--spacing-4` to `--spacing-8` for page gutters

### Example: Card Component

```jsx
<div style={{
  padding: 'var(--spacing-6)',
  marginBottom: 'var(--spacing-4)',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: 'var(--radius-lg)'
}}>
  <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Card Title</h3>
  <p style={{ marginBottom: 'var(--spacing-4)' }}>Card content here.</p>
  <button>Action</button>
</div>
```

---

## Border Radius

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--radius-none` | `0` | 0px | No rounding |
| `--radius-sm` | `0.125rem` | 2px | Subtle rounding |
| `--radius-base` | `0.25rem` | 4px | Default rounding |
| `--radius-md` | `0.375rem` | 6px | Buttons, inputs |
| `--radius-lg` | `0.5rem` | 8px | Cards |
| `--radius-xl` | `0.75rem` | 12px | Modals |
| `--radius-2xl` | `1rem` | 16px | Large cards |
| `--radius-3xl` | `1.5rem` | 24px | Hero sections |
| `--radius-full` | `9999px` | Pill shape | Badges, avatars |

### Example: Button Variations

```jsx
// Standard button
<button style={{ borderRadius: 'var(--radius-md)' }}>Submit</button>

// Pill button
<button style={{ borderRadius: 'var(--radius-full)' }}>Tag</button>

// Card
<div style={{ borderRadius: 'var(--radius-lg)' }}>Card content</div>
```

---

## Shadows

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Subtle elevation for small elements |
| `--shadow-base` | Default shadow for cards |
| `--shadow-md` | Dropdowns, popovers |
| `--shadow-lg` | Modals, floating elements |
| `--shadow-xl` | Large modals, overlays |
| `--shadow-2xl` | Maximum elevation |
| `--shadow-inner` | Inset shadows for inputs |
| `--shadow-none` | Remove shadows |

### Example: Elevation Hierarchy

```jsx
// Card (level 1)
<div style={{ boxShadow: 'var(--shadow-base)' }}>Base card</div>

// Dropdown (level 2)
<div style={{ boxShadow: 'var(--shadow-md)' }}>Dropdown menu</div>

// Modal (level 3)
<div style={{ boxShadow: 'var(--shadow-xl)' }}>Modal dialog</div>
```

---

## Dark Mode

Dark mode is supported automatically via `prefers-color-scheme: dark` media query. Alternatively, add the `.dark` class to the root element for manual control.

### Automatic (System Preference)

The design system automatically switches based on the user's system preference. No additional code required.

### Manual Toggle

```jsx
// Toggle dark mode via class
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// Check current mode
const isDark = document.documentElement.classList.contains('dark');
```

### Dark Mode Best Practices

1. **Always use semantic tokens** (`--bg-primary`, `--text-primary`) instead of raw color values
2. **Test both modes** during development
3. **Consider contrast ratios** - dark mode uses lighter text on dark backgrounds
4. **Shadows are adjusted** automatically in dark mode for better visibility

---

## Component Patterns

### Standard React Components

Per design decision (REQ-009): Use standard React components with Tailwind CSS. No custom component library required.

### Button

```jsx
function Button({ variant = 'primary', children, ...props }) {
  const baseStyles = {
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 'var(--font-weight-medium)',
    fontSize: 'var(--font-size-sm)',
    transition: `all var(--transition-duration-normal) var(--transition-timing-ease)`,
    cursor: 'pointer',
    border: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary-500)',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
    },
    danger: {
      backgroundColor: 'var(--color-error-500)',
      color: 'white',
    },
  };

  return (
    <button style={{ ...baseStyles, ...variants[variant] }} {...props}>
      {children}
    </button>
  );
}
```

### Input

```jsx
function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 'var(--spacing-4)' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: 'var(--spacing-1)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--text-primary)',
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: 'var(--spacing-2) var(--spacing-3)',
          fontSize: 'var(--font-size-base)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--color-error-500)' : 'var(--border-primary)'}`,
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
        {...props}
      />
      {error && (
        <p style={{
          marginTop: 'var(--spacing-1)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-error-500)',
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
```

### Card

```jsx
function Card({ title, children }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-base)',
      padding: 'var(--spacing-6)',
    }}>
      {title && (
        <h3 style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-4)',
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
```

### Alert/Status Banner

```jsx
function Alert({ type = 'info', children }) {
  const typeStyles = {
    info: {
      backgroundColor: 'var(--status-info-bg)',
      borderColor: 'var(--color-primary-300)',
      color: 'var(--color-primary-700)',
    },
    success: {
      backgroundColor: 'var(--status-success-bg)',
      borderColor: 'var(--color-success-300)',
      color: 'var(--color-success-700)',
    },
    warning: {
      backgroundColor: 'var(--status-warning-bg)',
      borderColor: 'var(--color-warning-300)',
      color: 'var(--color-warning-700)',
    },
    error: {
      backgroundColor: 'var(--status-error-bg)',
      borderColor: 'var(--color-error-300)',
      color: 'var(--color-error-700)',
    },
  };

  return (
    <div style={{
      padding: 'var(--spacing-4)',
      borderRadius: 'var(--radius-md)',
      borderLeft: '4px solid',
      ...typeStyles[type],
    }}>
      {children}
    </div>
  );
}
```

---

## Accessibility

### Focus States

All interactive elements should have visible focus states:

```css
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

### Color Contrast

- Text on backgrounds must meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- The semantic tokens are designed to maintain proper contrast in both light and dark modes
- Use `--text-primary` for primary content and `--text-secondary` for less important text

### Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Z-Index Scale

Use consistent z-index values for layered elements:

| Token | Value | Usage |
|-------|-------|-------|
| `--z-index-dropdown` | `100` | Dropdown menus |
| `--z-index-sticky` | `200` | Sticky headers |
| `--z-index-fixed` | `300` | Fixed elements |
| `--z-index-modal-backdrop` | `400` | Modal overlays |
| `--z-index-modal` | `500` | Modal dialogs |
| `--z-index-popover` | `600` | Popovers, tooltips |
| `--z-index-tooltip` | `700` | Highest layer tooltips |

---

## Transitions

Use consistent timing for animations:

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-duration-fast` | `150ms` | Hover states, small changes |
| `--transition-duration-normal` | `200ms` | Default interactions |
| `--transition-duration-slow` | `300ms` | Complex animations |

```css
.interactive-element {
  transition: all var(--transition-duration-normal) var(--transition-timing-ease);
}
```

---

## Quick Reference

### Most Common Tokens

```css
/* Backgrounds */
var(--bg-primary)          /* Page background */
var(--bg-secondary)        /* Card/component background */

/* Text */
var(--text-primary)        /* Main text */
var(--text-secondary)      /* Secondary text */

/* Spacing */
var(--spacing-2)           /* 8px - tight spacing */
var(--spacing-4)           /* 16px - default spacing */
var(--spacing-6)           /* 24px - card padding */
var(--spacing-8)           /* 32px - section spacing */

/* Typography */
var(--font-weight-regular) /* 400 - body text */
var(--font-weight-medium)  /* 500 - labels */
var(--font-weight-bold)    /* 700 - headings */

/* Border radius */
var(--radius-md)           /* 6px - buttons/inputs */
var(--radius-lg)           /* 8px - cards */

/* Shadows */
var(--shadow-base)         /* Default card shadow */
var(--shadow-md)           /* Dropdown shadow */
```
