import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { ConcentricRectangle, concentric, fixed, square } from "./concentric-rectangle";

// Helper: get the border-radius style of the rendered div
function getRadius(container: HTMLElement): string {
  return (container.firstChild as HTMLElement).style.borderRadius;
}

// ─── Core radius math (explicit props) ───────────────────────────────────────

describe("concentric corner style", () => {
  it("subtracts inset from container radius", () => {
    const { container } = render(<ConcentricRectangle containerRadius={40} inset={16} />);
    // all four corners: 40 - 16 = 24
    expect(getRadius(container)).toBe("24px 24px 24px 24px");
  });

  it("clamps to 0 when inset exceeds container radius", () => {
    const { container } = render(<ConcentricRectangle containerRadius={10} inset={20} />);
    expect(getRadius(container)).toBe("0px 0px 0px 0px");
  });

  it("respects minimum when concentric radius falls below it", () => {
    const { container } = render(
      <ConcentricRectangle
        containerRadius={20}
        inset={18}
        topLeftCorner={concentric(8)}
        topRightCorner={concentric(8)}
        bottomLeftCorner={concentric(8)}
        bottomRightCorner={concentric(8)}
      />,
    );
    // concentric = 20 - 18 = 2, minimum = 8 → 8
    expect(getRadius(container)).toBe("8px 8px 8px 8px");
  });

  it("uses concentric value when it exceeds minimum", () => {
    const { container } = render(
      <ConcentricRectangle
        containerRadius={40}
        inset={8}
        topLeftCorner={concentric(4)}
        topRightCorner={concentric(4)}
        bottomLeftCorner={concentric(4)}
        bottomRightCorner={concentric(4)}
      />,
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
        topLeftCorner={fixed(24)}
        topRightCorner={fixed(24)}
        bottomLeftCorner={fixed(24)}
        bottomRightCorner={fixed(24)}
      />,
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
        topLeftCorner={square}
        topRightCorner={square}
        bottomLeftCorner={square}
        bottomRightCorner={square}
      />,
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
        topLeftCorner={concentric()} // 32
        topRightCorner={fixed(10)} // 10
        bottomLeftCorner={concentric()} // 32
        bottomRightCorner={square} // 0
      />,
    );
    // CSS order: top-left top-right bottom-right bottom-left
    expect(getRadius(container)).toBe("32px 10px 0px 32px");
  });
});

// ─── borderWidth adds to inset ────────────────────────────────────────────────

describe("borderWidth prop", () => {
  it("adds border width to inset before calculating radius", () => {
    const { container } = render(
      <ConcentricRectangle containerRadius={40} inset={10} borderWidth={6} />,
    );
    // totalInset = 10 + 6 = 16 → 40 - 16 = 24
    expect(getRadius(container)).toBe("24px 24px 24px 24px");
  });
});

// ─── Auto mode: reads metrics from parent ────────────────────────────────────

const STYLE_DEFAULTS: Partial<CSSStyleDeclaration> & Record<string, string> = {
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
  "corner-top-left-shape": "",
  "corner-top-right-shape": "",
  "corner-bottom-right-shape": "",
  "corner-bottom-left-shape": "",
};

function mockComputedStyle(styles: Partial<CSSStyleDeclaration> & Record<string, string>) {
  // jsdom doesn't compute CSS properties, so we stub getComputedStyle.
  // The component calls getComputedStyle(parentElement) inside readParentMetrics.
  // We use mockImplementation (not mockReturnValue) so the stub fires on every call.
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    () => ({ ...STYLE_DEFAULTS, ...styles }) as CSSStyleDeclaration,
  );
}

describe("auto mode", () => {
  let computedStyles: Partial<CSSStyleDeclaration> & Record<string, string>;

  beforeEach(() => {
    computedStyles = {
      borderTopLeftRadius: "40px",
      borderTopRightRadius: "40px",
      borderBottomRightRadius: "40px",
      borderBottomLeftRadius: "40px",
      paddingTop: "16px",
      paddingRight: "16px",
      paddingBottom: "16px",
      paddingLeft: "16px",
    };
    mockComputedStyle(computedStyles);
  });

  it("becomes visible and applies correct radii after metrics resolve", async () => {
    const { container } = render(
      <div>
        <ConcentricRectangle />
      </div>,
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
      </div>,
    );
    await act(async () => {});

    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    // totalInset per corner = (10+10)/2 + (6+6)/2 = 10 + 6 = 16 → 40 - 16 = 24
    expect(inner.style.borderRadius).toBe("24px 24px 24px 24px");
  });

  it("refreshes auto radii when the parent style changes without resizing", async () => {
    const { container } = render(
      <div style={{ borderRadius: 40, padding: 16 }}>
        <ConcentricRectangle />
      </div>,
    );
    await act(async () => {});

    const parent = container.firstElementChild as HTMLElement;
    const inner = parent.firstElementChild as HTMLElement;
    expect(inner.style.borderRadius).toBe("24px 24px 24px 24px");

    computedStyles.borderTopLeftRadius = "56px";
    computedStyles.borderTopRightRadius = "56px";
    computedStyles.borderBottomRightRadius = "56px";
    computedStyles.borderBottomLeftRadius = "56px";

    await act(async () => {
      parent.style.borderRadius = "56px";
    });

    expect(inner.style.borderRadius).toBe("40px 40px 40px 40px");
  });
});

// ─── corner-shape inheritance ─────────────────────────────────────────────────

describe("corner-shape inheritance", () => {
  it("forwards uniform corner-shape from parent onto inner div", async () => {
    mockComputedStyle({
      borderTopLeftRadius: "40px",
      borderTopRightRadius: "40px",
      borderBottomRightRadius: "40px",
      borderBottomLeftRadius: "40px",
      paddingTop: "16px",
      paddingRight: "16px",
      paddingBottom: "16px",
      paddingLeft: "16px",
      "corner-top-left-shape": "squircle",
      "corner-top-right-shape": "squircle",
      "corner-bottom-right-shape": "squircle",
      "corner-bottom-left-shape": "squircle",
    });

    const { container } = render(
      <div>
        <ConcentricRectangle />
      </div>,
    );
    await act(async () => {});

    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(inner.style.getPropertyValue("corner-top-left-shape")).toBe("squircle");
    expect(inner.style.getPropertyValue("corner-top-right-shape")).toBe("squircle");
    expect(inner.style.getPropertyValue("corner-bottom-right-shape")).toBe("squircle");
    expect(inner.style.getPropertyValue("corner-bottom-left-shape")).toBe("squircle");
  });

  it("forwards mixed per-corner shapes from parent", async () => {
    mockComputedStyle({
      borderTopLeftRadius: "40px",
      borderTopRightRadius: "40px",
      borderBottomRightRadius: "40px",
      borderBottomLeftRadius: "40px",
      paddingTop: "16px",
      paddingRight: "16px",
      paddingBottom: "16px",
      paddingLeft: "16px",
      "corner-top-left-shape": "squircle",
      "corner-top-right-shape": "bevel",
      "corner-bottom-right-shape": "round",
      "corner-bottom-left-shape": "notch",
    });

    const { container } = render(
      <div>
        <ConcentricRectangle />
      </div>,
    );
    await act(async () => {});

    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(inner.style.getPropertyValue("corner-top-left-shape")).toBe("squircle");
    expect(inner.style.getPropertyValue("corner-top-right-shape")).toBe("bevel");
    expect(inner.style.getPropertyValue("corner-bottom-right-shape")).toBe("round");
    expect(inner.style.getPropertyValue("corner-bottom-left-shape")).toBe("notch");
  });

  it("does not set corner-shape properties when parent has none", async () => {
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

    const { container } = render(
      <div>
        <ConcentricRectangle />
      </div>,
    );
    await act(async () => {});

    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(inner.style.getPropertyValue("corner-top-left-shape")).toBe("");
    expect(inner.style.getPropertyValue("corner-top-right-shape")).toBe("");
    expect(inner.style.getPropertyValue("corner-bottom-right-shape")).toBe("");
    expect(inner.style.getPropertyValue("corner-bottom-left-shape")).toBe("");
  });
});
