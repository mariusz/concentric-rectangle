"use client";

import { useState } from "react";
import {
  ConcentricRectangle,
  concentric,
  fixed,
  square,
  type CornerStyle,
} from "@/components/ui/concentric-rectangle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const CORNER_STYLES = ["concentric", "concentric(min:8)", "fixed(24)", "square"] as const;
type StyleLabel = (typeof CORNER_STYLES)[number];

function toCornerStyle(label: StyleLabel): CornerStyle {
  if (label === "concentric") return concentric();
  if (label === "concentric(min:8)") return concentric(8);
  if (label === "fixed(24)") return fixed(24);
  return square;
}

function CornerPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: StyleLabel;
  onChange: (v: StyleLabel) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1">
        {CORNER_STYLES.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-2 py-0.5 rounded text-xs border transition-colors ${
              value === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [containerRadius, setContainerRadius] = useState(40);
  const [inset, setInset] = useState(16);
  const [borderWidth, setBorderWidth] = useState(0);
  const [tl, setTl] = useState<StyleLabel>("concentric");
  const [tr, setTr] = useState<StyleLabel>("concentric");
  const [bl, setBl] = useState<StyleLabel>("concentric");
  const [br, setBr] = useState<StyleLabel>("concentric");

  return (
    <main className="min-h-screen bg-background text-foreground p-8 flex flex-col gap-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">ConcentricRectangle</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A rounded rectangle whose corner radii are calculated to be concentric
          with a container shape — sharing the same center point. The math:{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            innerRadius = containerRadius − inset
          </code>
        </p>
      </div>

      {/* Live preview */}
      <div
        className="relative flex items-center justify-center bg-muted/40"
        style={{
          borderRadius: containerRadius,
          padding: inset,
          minHeight: 200,
          border: `${borderWidth}px solid hsl(var(--border))`,
        }}
      >
        <span className="absolute top-2 left-3 text-[10px] text-muted-foreground font-mono">
          container r={containerRadius}px
        </span>
        <ConcentricRectangle
          containerRadius={containerRadius}
          inset={inset}
          borderWidth={borderWidth}
          topLeadingCorner={toCornerStyle(tl)}
          topTrailingCorner={toCornerStyle(tr)}
          bottomLeadingCorner={toCornerStyle(bl)}
          bottomTrailingCorner={toCornerStyle(br)}
          className="w-full h-32 bg-primary/80 flex items-center justify-center"
        >
          <span className="text-primary-foreground text-sm font-mono">
            ConcentricRectangle
          </span>
        </ConcentricRectangle>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">
              Container radius:{" "}
              <span className="font-mono">{containerRadius}px</span>
            </Label>
            <Slider
              min={0}
              max={80}
              step={1}
              value={[containerRadius]}
              onValueChange={(v) => setContainerRadius(Array.isArray(v) ? v[0] : v)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs">
              Inset: <span className="font-mono">{inset}px</span>
            </Label>
            <Slider
              min={0}
              max={60}
              step={1}
              value={[inset]}
              onValueChange={(v) => setInset(Array.isArray(v) ? v[0] : v)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs">
              Container border width:{" "}
              <span className="font-mono">{borderWidth}px</span>
            </Label>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[borderWidth]}
              onValueChange={(v) => setBorderWidth(Array.isArray(v) ? v[0] : v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CornerPicker label="↖ top-leading" value={tl} onChange={setTl} />
            <CornerPicker label="↗ top-trailing" value={tr} onChange={setTr} />
            <CornerPicker label="↙ bottom-leading" value={bl} onChange={setBl} />
            <CornerPicker label="↘ bottom-trailing" value={br} onChange={setBr} />
          </div>
        </CardContent>
      </Card>

      {/* Preset examples */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Preset examples</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "All concentric",
              outer: 32,
              inset: 12,
              tl: concentric(),
              tr: concentric(),
              bl: concentric(),
              br: concentric(),
            },
            {
              label: "Notes-style sheet",
              outer: 44,
              inset: 14,
              tl: fixed(16),
              tr: fixed(16),
              bl: concentric(),
              br: concentric(),
            },
            {
              label: "Mixed corners",
              outer: 40,
              inset: 14,
              tl: concentric(8),
              tr: fixed(24),
              bl: concentric(),
              br: square,
            },
          ].map((ex) => (
            <div key={ex.label} className="flex flex-col gap-2">
              <div
                className="bg-muted/40 border border-border flex items-center justify-center"
                style={{ borderRadius: ex.outer, padding: ex.inset, height: 100 }}
              >
                <ConcentricRectangle
                  containerRadius={ex.outer}
                  inset={ex.inset}
                  topLeadingCorner={ex.tl}
                  topTrailingCorner={ex.tr}
                  bottomLeadingCorner={ex.bl}
                  bottomTrailingCorner={ex.br}
                  className="w-full h-full bg-primary/80"
                />
              </div>
              <span className="text-xs text-muted-foreground text-center">
                {ex.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
