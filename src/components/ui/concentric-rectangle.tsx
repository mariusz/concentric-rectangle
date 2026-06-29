"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

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
  /** Corner radius of the container. Auto-read from parent if omitted. */
  containerRadius?: number;
  /** Inset from container edge. Auto-read from parent padding+border if omitted. */
  inset?: number;
  /** Container border width. Auto-read from parent if omitted. */
  borderWidth?: number;
  topLeadingCorner?: CornerStyle;
  topTrailingCorner?: CornerStyle;
  bottomLeadingCorner?: CornerStyle;
  bottomTrailingCorner?: CornerStyle;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function resolveRadius(corner: CornerStyle, containerRadius: number, totalInset: number): number {
  if (corner.type === "square") return 0;
  if (corner.type === "fixed") return corner.radius;
  const r = Math.max(0, containerRadius - totalInset);
  return corner.minimum !== undefined ? Math.max(corner.minimum, r) : r;
}

function parsePixels(value: string): number {
  return parseFloat(value) || 0;
}

interface ParentMetrics {
  // top-left, top-right, bottom-right, bottom-left
  radii: [number, number, number, number];
  // top, right, bottom, left
  padding: [number, number, number, number];
  border: [number, number, number, number];
}

function readParentMetrics(el: HTMLElement): ParentMetrics | null {
  const parent = el.parentElement;
  if (!parent) return null;
  const s = getComputedStyle(parent);
  return {
    radii: [
      parsePixels(s.borderTopLeftRadius),
      parsePixels(s.borderTopRightRadius),
      parsePixels(s.borderBottomRightRadius),
      parsePixels(s.borderBottomLeftRadius),
    ],
    padding: [
      parsePixels(s.paddingTop),
      parsePixels(s.paddingRight),
      parsePixels(s.paddingBottom),
      parsePixels(s.paddingLeft),
    ],
    border: [
      parsePixels(s.borderTopWidth),
      parsePixels(s.borderRightWidth),
      parsePixels(s.borderBottomWidth),
      parsePixels(s.borderLeftWidth),
    ],
  };
}

export function ConcentricRectangle({
  containerRadius,
  inset,
  borderWidth,
  topLeadingCorner = concentric(),
  topTrailingCorner = concentric(),
  bottomLeadingCorner = concentric(),
  bottomTrailingCorner = concentric(),
  className,
  style,
  children,
}: ConcentricRectangleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<ParentMetrics | null>(null);
  const isAuto = containerRadius === undefined || inset === undefined;

  useEffect(() => {
    if (!isAuto || !ref.current) return;
    const update = () => setMetrics(readParentMetrics(ref.current!));
    update();
    const observer = new ResizeObserver(update);
    if (ref.current.parentElement) observer.observe(ref.current.parentElement);
    return () => observer.disconnect();
  }, [isAuto]);

  // Per-corner inset = border + padding for that corner's edges.
  // top-left uses top padding + left padding averaged, same for border.
  // ponytail: simple corner-edge average; good enough for uniform padding/border.
  function cornerInset(pi: number, pj: number, bi: number, bj: number): number {
    const p = inset ?? (pi + pj) / 2;
    const b = borderWidth ?? (bi + bj) / 2;
    return p + b;
  }

  const m = metrics;
  const [rt, rr, rb, rl] = m ? m.radii : [0, 0, 0, 0];
  const [pt, pr, pb, pl] = m ? m.padding : [0, 0, 0, 0];
  const [bt, bri, bbo, bl2] = m ? m.border : [0, 0, 0, 0];

  const tlRadius = containerRadius ?? rt;
  const trRadius = containerRadius ?? rr;
  const brRadius = containerRadius ?? rb;
  const blRadius = containerRadius ?? rl;

  const tl = resolveRadius(topLeadingCorner, tlRadius, cornerInset(pt, pl, bt, bl2));
  const tr = resolveRadius(topTrailingCorner, trRadius, cornerInset(pt, pr, bt, bri));
  const br = resolveRadius(bottomTrailingCorner, brRadius, cornerInset(pb, pr, bbo, bri));
  const bln = resolveRadius(bottomLeadingCorner, blRadius, cornerInset(pb, pl, bbo, bl2));

  // On first render before metrics are read, render transparent to avoid flash.
  const ready = !isAuto || metrics !== null;

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      style={{
        borderRadius: `${tl}px ${tr}px ${br}px ${bln}px`,
        visibility: ready ? undefined : "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
