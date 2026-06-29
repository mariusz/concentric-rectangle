"use client";

import { cn } from "@/lib/utils";
import React from "react";

export type CornerStyle =
  | { type: "concentric"; minimum?: number }
  | { type: "fixed"; radius: number }
  | { type: "square" };

export const concentric = (minimum?: number): CornerStyle => ({
  type: "concentric",
  minimum,
});
export const fixed = (radius: number): CornerStyle => ({
  type: "fixed",
  radius,
});
export const square: CornerStyle = { type: "square" };

interface ConcentricRectangleProps {
  /** Corner radius of the container shape (the outer rounded rect). */
  containerRadius: number;
  /** Padding from container edge to this rectangle. */
  inset: number;
  /** Border width of the container (added to inset — border-radius is measured from the outer border edge). */
  borderWidth?: number;
  topLeadingCorner?: CornerStyle;
  topTrailingCorner?: CornerStyle;
  bottomLeadingCorner?: CornerStyle;
  bottomTrailingCorner?: CornerStyle;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// The math: concentric radius = containerRadius - inset (clamped to 0).
// With minimum: max(minimum, containerRadius - inset).
function resolveRadius(
  corner: CornerStyle,
  containerRadius: number,
  inset: number
): number {
  if (corner.type === "square") return 0;
  if (corner.type === "fixed") return corner.radius;
  // concentric
  const r = Math.max(0, containerRadius - inset);
  return corner.minimum !== undefined ? Math.max(corner.minimum, r) : r;
}

export function ConcentricRectangle({
  containerRadius,
  inset,
  borderWidth = 0,
  topLeadingCorner = concentric(),
  topTrailingCorner = concentric(),
  bottomLeadingCorner = concentric(),
  bottomTrailingCorner = concentric(),
  className,
  style,
  children,
}: ConcentricRectangleProps) {
  const totalInset = inset + borderWidth;
  const tl = resolveRadius(topLeadingCorner, containerRadius, totalInset);
  const tr = resolveRadius(topTrailingCorner, containerRadius, totalInset);
  const bl = resolveRadius(bottomLeadingCorner, containerRadius, totalInset);
  const br = resolveRadius(bottomTrailingCorner, containerRadius, totalInset);

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
