"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
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

function CopyCommand({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-2 bg-muted rounded-md px-3 py-2 w-fit">
      <code className="font-mono text-xs">{cmd}</code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(cmd);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="t-icon-swap text-muted-foreground hover:text-foreground transition-colors"
        data-state={copied ? "b" : "a"}
        aria-label="Copy"
      >
        <span className="t-icon" data-icon="a">
          <Copy size={14} />
        </span>
        <span className="t-icon" data-icon="b">
          <Check size={14} />
        </span>
      </button>
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
  const innerRadius = Math.max(0, containerRadius - inset - borderWidth);

  return (
    <main className="min-h-screen bg-background text-foreground p-8 flex flex-col gap-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">ConcentricRectangle</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A rounded rectangle whose corner radii are calculated to be concentric with a container
          shape — sharing the same center point. The math:{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            innerRadius = containerRadius − inset − borderWidth
          </code>
        </p>
        <CopyCommand cmd="npx shadcn add https://mariusz.github.io/concentric-rectangle/r/concentric-rectangle.json" />
      </div>

      {/* Live preview — no explicit props, reads parent automatically */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-black/5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="rounded border border-border bg-foreground px-2 py-1 text-background">
            container r={containerRadius}px
          </span>
          <span className="rounded border border-border bg-secondary px-2 py-1 text-secondary-foreground">
            inset {inset}px
          </span>
          <span className="rounded border border-border bg-muted px-2 py-1 text-muted-foreground">
            border {borderWidth}px
          </span>
          <span className="rounded border border-border bg-card px-2 py-1 text-foreground shadow-sm shadow-black/5">
            inner r={innerRadius}px
          </span>
        </div>
        <div
          className="relative flex min-h-60 items-center justify-center bg-[#f6f6f3]"
          aria-label="Live ConcentricRectangle preview"
          data-testid="live-preview"
          style={{
            borderRadius: containerRadius,
            padding: inset,
            border: `${borderWidth}px solid rgb(115 115 115)`,
            outline: "1px solid rgb(212 212 212)",
            outlineOffset: 0,
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.8)",
          }}
        >
          <span className="pointer-events-none absolute left-3 top-3 rounded border border-border bg-white/90 px-2 py-1 text-[10px] font-mono text-foreground shadow-sm shadow-black/5">
            parent container
          </span>
          <span className="pointer-events-none absolute bottom-3 right-3 rounded border border-border bg-white/90 px-2 py-1 text-[10px] font-mono text-muted-foreground shadow-sm shadow-black/5">
            visible inset area
          </span>
          <ConcentricRectangle
            topLeftCorner={toCornerStyle(tl)}
            topRightCorner={toCornerStyle(tr)}
            bottomLeftCorner={toCornerStyle(bl)}
            bottomRightCorner={toCornerStyle(br)}
            className="flex h-36 w-full items-center justify-center bg-[#2f3437] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.18),0_10px_24px_rgb(0_0_0_/_0.10)]"
          >
            <span className="rounded border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-black/10 backdrop-blur">
              ConcentricRectangle
            </span>
          </ConcentricRectangle>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">
              Container radius: <span className="font-mono">{containerRadius}px</span>
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
              Container border width: <span className="font-mono">{borderWidth}px</span>
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
            <CornerPicker label="↖ top-left" value={tl} onChange={setTl} />
            <CornerPicker label="↗ top-right" value={tr} onChange={setTr} />
            <CornerPicker label="↙ bottom-left" value={bl} onChange={setBl} />
            <CornerPicker label="↘ bottom-right" value={br} onChange={setBr} />
          </div>
        </CardContent>
      </Card>

      {/* Nested demo */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Nested ConcentricRectangles</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Each layer is a{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded">ConcentricRectangle</code> nested
          inside the previous one. Corner radii are automatically derived from the parent&apos;s
          computed style.
        </p>
        <div
          className="flex items-center justify-center border border-border bg-[#f6f6f3] shadow-sm shadow-black/5"
          style={{ borderRadius: 48, padding: 16 }}
        >
          <ConcentricRectangle
            className="flex w-full items-center justify-center bg-[#e7e5df]"
            style={{ padding: 16 }}
          >
            <ConcentricRectangle
              className="flex w-full items-center justify-center bg-[#d6d8d2]"
              style={{ padding: 16 }}
            >
              <ConcentricRectangle
                topLeftCorner={concentric(4)}
                topRightCorner={concentric(4)}
                bottomLeftCorner={concentric(4)}
                bottomRightCorner={concentric(4)}
                className="flex w-full items-center justify-center bg-[#2f3437]"
                style={{ padding: 16 }}
              >
                <span className="text-xs font-mono text-white">innermost</span>
              </ConcentricRectangle>
            </ConcentricRectangle>
          </ConcentricRectangle>
        </div>
      </div>

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
                className="flex items-center justify-center border border-border bg-[#f6f6f3] shadow-sm shadow-black/5"
                style={{ borderRadius: ex.outer, padding: ex.inset, height: 100 }}
              >
                <ConcentricRectangle
                  containerRadius={ex.outer}
                  inset={ex.inset}
                  topLeftCorner={ex.tl}
                  topRightCorner={ex.tr}
                  bottomLeftCorner={ex.bl}
                  bottomRightCorner={ex.br}
                  className="h-full w-full bg-[#2f3437] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.18)]"
                />
              </div>
              <span className="text-xs text-muted-foreground text-center">{ex.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
