# ConcentricRectangle

**ConcentricRectangle: shadcn component for all those who are tired of calculating border-radius.**

A port of SwiftUI's [`ConcentricRectangle`](https://developer.apple.com/documentation/swiftui/concentricrectangle) — a rounded rectangle whose corner radii are automatically calculated to share a common center with the container's corners.

The math: `innerRadius = containerRadius − inset`

## Installation

```bash
npx shadcn add https://mariusz.github.io/concentric-rectangle/r/concentric-rectangle.json
```

## Usage

```tsx
import {
  ConcentricRectangle,
  concentric,
  fixed,
  square,
} from "@/components/ui/concentric-rectangle";

// All corners concentric with container (auto-reads parent styles)
<div style={{ borderRadius: 40, padding: 16 }}>
  <ConcentricRectangle>
    content
  </ConcentricRectangle>
</div>

// Explicit props
<div style={{ borderRadius: 40, padding: 16 }}>
  <ConcentricRectangle containerRadius={40} inset={16}>
    content
  </ConcentricRectangle>
</div>

// Notes-style sheet: fixed top, concentric bottom
<ConcentricRectangle
  containerRadius={44}
  inset={14}
  topLeftCorner={fixed(16)}
  topRightCorner={fixed(16)}
  bottomLeftCorner={concentric()}
  bottomRightCorner={concentric()}
/>

// Mixed
<ConcentricRectangle
  containerRadius={40}
  inset={14}
  topLeftCorner={concentric(8)}  // concentric with 8px minimum
  topRightCorner={fixed(24)}
  bottomLeftCorner={concentric()}
  bottomRightCorner={square}
/>

// Nested — each layer reads its parent automatically
<div style={{ borderRadius: 48, padding: 16 }}>
  <ConcentricRectangle style={{ padding: 16 }}>
    <ConcentricRectangle style={{ padding: 16 }}>
      <ConcentricRectangle topLeftCorner={concentric(4)} topRightCorner={concentric(4)}
                           bottomLeftCorner={concentric(4)} bottomRightCorner={concentric(4)}>
        innermost
      </ConcentricRectangle>
    </ConcentricRectangle>
  </ConcentricRectangle>
</div>
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
| `containerRadius` | `number` | auto | Corner radius of the surrounding container. Auto-read from parent if omitted. |
| `inset` | `number` | auto | Distance from container edge to this element. Auto-read from parent padding + border if omitted. |
| `borderWidth` | `number` | auto | Container border width. Auto-read from parent if omitted. |
| `topLeftCorner` | `CornerStyle` | `concentric()` | |
| `topRightCorner` | `CornerStyle` | `concentric()` | |
| `bottomLeftCorner` | `CornerStyle` | `concentric()` | |
| `bottomRightCorner` | `CornerStyle` | `concentric()` | |
| `className` | `string` | — | Tailwind classes |
| `style` | `CSSProperties` | — | Inline styles |
| `children` | `ReactNode` | — | |

## Dev

```bash
npm run dev   # http://localhost:3000
```

Interactive demo with live sliders, nested example, and preset examples.
