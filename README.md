# ConcentricRectangle

**ConcentricRectangle: shadcn component for all those who are tired of calculating border-radius.**

A port of SwiftUI's [`ConcentricRectangle`](https://developer.apple.com/documentation/swiftui/concentricrectangle) — a rounded rectangle whose corner radii are automatically calculated to share a common center with the container's corners.

The math: `innerRadius = containerRadius − inset`

## Usage

```tsx
import {
  ConcentricRectangle,
  concentric,
  fixed,
  square,
} from "@/components/ui/concentric-rectangle";

// All corners concentric with container
<div style={{ borderRadius: 40, padding: 16 }}>
  <ConcentricRectangle containerRadius={40} inset={16}>
    content
  </ConcentricRectangle>
</div>

// Notes-style sheet: fixed top, concentric bottom
<ConcentricRectangle
  containerRadius={44}
  inset={14}
  topLeadingCorner={fixed(16)}
  topTrailingCorner={fixed(16)}
  bottomLeadingCorner={concentric()}
  bottomTrailingCorner={concentric()}
/>

// Mixed
<ConcentricRectangle
  containerRadius={40}
  inset={14}
  topLeadingCorner={concentric(8)}  // concentric with 8px minimum
  topTrailingCorner={fixed(24)}
  bottomLeadingCorner={concentric()}
  bottomTrailingCorner={square}
/>
```

## Corner styles

| Style | Description |
|---|---|
| `concentric()` | Radius = `containerRadius − inset`, floored at 0 |
| `concentric(minimum)` | Same, but at least `minimum` px |
| `fixed(radius)` | Exact radius, ignores container |
| `square` | No rounding (0px) |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `containerRadius` | `number` | required | Corner radius of the surrounding container |
| `inset` | `number` | required | Distance from container edge to this element |
| `topLeadingCorner` | `CornerStyle` | `concentric()` | |
| `topTrailingCorner` | `CornerStyle` | `concentric()` | |
| `bottomLeadingCorner` | `CornerStyle` | `concentric()` | |
| `bottomTrailingCorner` | `CornerStyle` | `concentric()` | |
| `className` | `string` | — | Tailwind classes |
| `style` | `CSSProperties` | — | Inline styles |
| `children` | `ReactNode` | — | |

## Dev

```bash
npm run dev   # http://localhost:3000
```

Interactive demo with live sliders and preset examples.
