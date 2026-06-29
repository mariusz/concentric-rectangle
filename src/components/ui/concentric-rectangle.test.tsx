import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import {
  ConcentricRectangle,
  concentric,
  fixed,
  square,
} from "./concentric-rectangle";

// Helper: get the border-radius style of the rendered div
function getRadius(container: HTMLElement): string {
  return (container.firstChild as HTMLElement).style.borderRadius;
}

// ─── Core radius math (explicit props) ───────────────────────────────────────

describe("concentric corner style", () => {
  it("subtracts inset from container radius", () => {
    const { container } = render(
      <ConcentricRectangle containerRadius={40} inset={16} />
    );
    // all four corners: 40 - 16 = 24
    expect(getRadius(container)).toBe("24px 24px 24px 24px");
  });

  it("clamps to 0 when inset exceeds container radius", () => {
    const { container } = render(
      <ConcentricRectangle containerRadius={10} inset={20} />
    );
    expect(getRadius(container)).toBe("0px 0px 0px 0px");
  });

  it("respects minimum when concentric radius falls below it", () => {
    const { container } = render(
      <ConcentricRectangle
        containerRadius={20}
        inset={18}
        topLeadingCorner={concentric(8)}
        topTrailingCorner={concentric(8)}
        bottomLeadingCorner={concentric(8)}
        bottomTrailingCorner={concentric(8)}
      />
    );
    // concentric = 20 - 18 = 2, minimum = 8 → 8
    expect(getRadius(container)).toBe("8px 8px 8px 8px");
  });

  it("uses concentric value when it exceeds minimum", () => {
    const { container } = render(
      <ConcentricRectangle
        containerRadius={40}
        inset={8}
        topLeadingCorner={concentric(4)}
        topTrailingCorner={concentric(4)}
        bottomLeadingCorner={concentric(4)}
        bottomTrailingCorner={concentric(4)}
      />
    );
    // concentric = 40 - 8 = 32, minimum = 4 → 32
    expect(getRadius(container)).toBe("32px 32px 32px 32px");
  });
});

describe("fixed corner style", () => {
  it("uses exact radius regardless of container", () => {
    const { container } = render(
      <ConcentricRectangle
        containerRadius={40}
        inset={16}
        topLeadingCorner={fixed(24)}
        topTrailingCorner={fixed(24)}
        bottomLeadingCorner={fixed(24)}
        bottomTrailingCorner={fixed(24)}
      />
    );
    expect(getRadius(container)).toBe("24px 24px 24px 24px");
  });
});

describe("square corner style", () => {
  it("produces zero radius", () => {
    const { container } = render(
      <ConcentricRectangle
        containerRadius={40}
        inset={8}
        topLeadingCorner={square}
        topTrailingCorner={square}
        bottomLeadingCorner={square}
        bottomTrailingCorner={square}
      />
    );
    expect(getRadius(container)).toBe("0px 0px 0px 0px");
  });
});

// ─── Mixed per-corner styles ──────────────────────────────────────────────────

describe("mixed corner styles", () => {
  it("applies each corner style independently", () => {
    const { container } = render(
      <ConcentricRectangle
        containerRadius={40}
        inset={8}
        topLeadingCorner={concentric()}   // 32
        topTrailingCorner={fixed(10)}     // 10
        bottomLeadingCorner={concentric()} // 32
        bottomTrailingCorner={square}     // 0
      />
    );
    // CSS order: top-left top-right bottom-right bottom-left
    expect(getRadius(container)).toBe("32px 10px 0px 32px");
  });
});

// ─── borderWidth adds to inset ────────────────────────────────────────────────

describe("borderWidth prop", () => {
  it("adds border width to inset before calculating radius", () => {
    const { container } = render(
      <ConcentricRectangle containerRadius={40} inset={10} borderWidth={6} />
    );
    // totalInset = 10 + 6 = 16 → 40 - 16 = 24
    expect(getRadius(container)).toBe("24px 24px 24px 24px");
  });
});

// ─── Auto mode: reads metrics from parent ────────────────────────────────────

const STYLE_DEFAULTS: Partial<CSSStyleDeclaration> = {
  borderTopLeftRadius: "0px",
  borderTopRightRadius: "0px",
  borderBottomRightRadius: "0px",
  borderBottomLeftRadius: "0px",
  paddingTop: "0px",
  paddingRight: "0px",
  paddingBottom: "0px",
  paddingLeft: "0px",
  borderTopWidth: "0px",
  borderRightWidth: "0px",
  borderBottomWidth: "0px",
  borderLeftWidth: "0px",
};

function mockComputedStyle(styles: Partial<CSSStyleDeclaration>) {
  // jsdom doesn't compute CSS properties, so we stub getComputedStyle.
  // The component calls getComputedStyle(parentElement) inside readParentMetrics.
  // We use mockImplementation (not mockReturnValue) so the stub fires on every call.
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    () => ({ ...STYLE_DEFAULTS, ...styles }) as CSSStyleDeclaration
  );
}

describe("auto mode", () => {
  beforeEach(() => {
    mockComputedStyle({
      borderTopLeftRadius: "40px",
      borderTopRightRadius: "40px",
      borderBottomRightRadius: "40px",
      borderBottomLeftRadius: "40px",
      paddingTop: "16px",
      paddingRight: "16px",
      paddingBottom: "16px",
      paddingLeft: "16px",
    });
  });

  it("becomes visible and applies correct radii after metrics resolve", async () => {
    const { container } = render(
      <div>
        <ConcentricRectangle />
      </div>
    );
    await act(async () => {});

    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(inner.style.visibility).toBe("");
    // 40 - 16 = 24 for all corners
    expect(inner.style.borderRadius).toBe("24px 24px 24px 24px");
  });

  it("uses parent border width in inset calculation", async () => {
    mockComputedStyle({
      borderTopLeftRadius: "40px",
      borderTopRightRadius: "40px",
      borderBottomRightRadius: "40px",
      borderBottomLeftRadius: "40px",
      paddingTop: "10px",
      paddingRight: "10px",
      paddingBottom: "10px",
      paddingLeft: "10px",
      borderTopWidth: "6px",
      borderRightWidth: "6px",
      borderBottomWidth: "6px",
      borderLeftWidth: "6px",
    });

    const { container } = render(
      <div>
        <ConcentricRectangle />
      </div>
    );
    await act(async () => {});

    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    // totalInset per corner = (10+10)/2 + (6+6)/2 = 10 + 6 = 16 → 40 - 16 = 24
    expect(inner.style.borderRadius).toBe("24px 24px 24px 24px");
  });
});
