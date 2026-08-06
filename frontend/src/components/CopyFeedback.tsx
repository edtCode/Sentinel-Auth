import { useEffect, useState } from "react";

type Overlay = {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize: number;
};

const DISPLAY_MS = 1600;
const FADE_MS = 220;

export function CopyFeedback() {
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  useEffect(() => {
    let counter = 0;
    let lastTarget: Element | null = null;

    const pushOverlay = (o: Omit<Overlay, "id">) => {
      const id = ++counter;
      setOverlays((prev) => [...prev, { ...o, id }]);
      window.setTimeout(() => {
        setOverlays((prev) => prev.filter((x) => x.id !== id));
      }, DISPLAY_MS + FADE_MS);
    };

    const overlayRect = (r: { top: number; left: number; width: number; height: number }) => {
      pushOverlay({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        fontSize: Math.max(12, Math.min(15, r.height * 0.45)),
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      lastTarget = e.target as Element | null;
    };
    void lastTarget;
    void overlayRect;

    const onCopy = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const rects = Array.from(range.getClientRects()).filter(
        (r) => r.width > 4 && r.height > 4,
      );
      if (rects.length === 0) return;
      rects.forEach(overlayRect);
      sel.removeAllRanges();
    };

    
    

    document.addEventListener("copy", onCopy);
    document.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("pointerdown", onPointerDown, true as never);
    };
  }, []);

  if (overlays.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2147483000,
      }}
    >
      {overlays.map((o) => {
        const pad = 4;
        return (
          <div
            key={o.id}
            style={{
              position: "fixed",
              top: o.top - pad,
              left: o.left - pad,
              width: o.width + pad * 2,
              height: o.height + pad * 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--background, #0b0b0a)",
              border: "1px solid rgba(34,197,94,0.4)",
              borderRadius: 8,
              boxShadow:
                "0 0 0 1px rgba(34,197,94,0.18), 0 10px 28px -12px rgba(34,197,94,0.55)",
              color: "#22c55e",
              fontFamily:
                "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: o.fontSize,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              animation: `copyfeedback-in ${FADE_MS}ms ease-out both, copyfeedback-out ${FADE_MS}ms ease-in ${DISPLAY_MS}ms forwards`,
            }}
          >
            Copied to Clipboard
          </div>
        );
      })}
      <style>{`
        @keyframes copyfeedback-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes copyfeedback-out {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
}
