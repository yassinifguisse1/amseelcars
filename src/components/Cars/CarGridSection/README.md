# CarGridSection Component

A fully responsive, grid-based component for displaying car rental cards. This component follows mobile-first design principles and accessibility best practices.

## Features

- ✅ **Fully Responsive**: Adapts to all screen sizes and orientations
- ✅ **Mobile-First**: Optimized for mobile devices with progressive enhancement
- ✅ **Accessible**: Uses semantic HTML with proper ARIA attributes
- ✅ **Performance Optimized**: Efficient grid layouts and minimal animations
- ✅ **Height Adaptive**: Adjusts layout based on screen height constraints
- ✅ **Touch Friendly**: Optimized interactions for touch devices
- ✅ **Print Friendly**: Includes print styles for documentation

## Responsive Breakpoints

### Width-based Breakpoints
- **Mobile (< 480px)**: 1 column
- **Large Mobile (480px+)**: 2 columns
- **Tablet (768px+)**: 2-3 columns (auto-fit, min 300px)
- **Desktop (1024px+)**: 3-4 columns (auto-fit, min 280px)
- **Large Desktop (1200px+)**: 4 columns (fixed)
- **Extra Large (1440px+)**: 4-5 columns (auto-fit, min 300px)

### Height-based Adjustments
- **Very Short (≤ 500px)**: Compact spacing, smaller cards
- **Short (≤ 600px)**: Reduced padding, optimized layout
- **Medium (≤ 700px)**: Balanced spacing

## Usage

```tsx
import CarGridSection from '@/components/Cars/CarGridSection'

// Basic usage
<CarGridSection />

// With custom props
<CarGridSection 
  className="custom-class"
  showTitle={false}
  title="Custom Title"
  subtitle="Custom subtitle"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `showTitle` | `boolean` | `true` | Whether to show the section title |
| `title` | `string` | `"Our Premium Fleet"` | Section title text |
| `subtitle` | `string` | `"Choose from..."` | Section subtitle text |

## Accessibility Features

- ✅ Semantic HTML structure (`<section>`, `<header>`, `<article>`)
- ✅ Proper heading hierarchy
- ✅ High contrast mode support
- ✅ Reduced motion support
- ✅ Keyboard navigation friendly
- ✅ Screen reader optimized

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ CSS Grid support required
- ✅ Graceful degradation for older browsers

## Performance

- **Lightweight**: Minimal CSS and JavaScript
- **Efficient Rendering**: CSS Grid for optimal layout performance
- **Touch Optimized**: Smooth interactions on touch devices
- **Print Ready**: Optimized for printing

## Integration

This component integrates seamlessly with:
- `CarRentalCard` component for individual car displays
- `BookingDialog` for car reservations
- WhatsApp integration for direct contact
- Existing car data from `/data/cars.ts`
