import { useEffect, useState } from "react";
import { useGestureScroll } from "@/hooks/useGestureScroll";

export function GestureScrollControl() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const { status, handDetected, paused, videoRef } = useGestureScroll({ enabled });

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    if (status === "denied" || status === "unavailable") {
      setEnabled(false);
      setSupported(false);
    }
  }, [status]);

  if (!supported) return null;

  const statusLabel = !enabled
    ? "OFF"
    : status === "loading"
      ? "BOOTING"
      : paused
        ? "PAUSED"
        : handDetected
          ? "HAND DETECTED"
          : "NO HAND";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 10,
        letterSpacing: "0.08em",
        color: "rgba(255,255,255,0.75)",
        pointerEvents: "auto",
      }}
    >
      {enabled && (
        <div
          style={{
            width: 140,
            height: 105,
            borderRadius: 6,
            overflow: "hidden",
            background: "#000",
            border: "1px solid rgba(255,138,61,0.4)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 0 24px rgba(255,138,61,0.15)",
            position: "relative",
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0) 40%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 6,
              bottom: 4,
              fontSize: 9,
              textTransform: "uppercase",
              color: handDetected ? "#ff8a3d" : "rgba(255,255,255,0.6)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: handDetected ? "#ff8a3d" : "#555",
                marginRight: 5,
                verticalAlign: "middle",
                boxShadow: handDetected
                  ? "0 0 8px #ff8a3d"
                  : "none",
              }}
            />
            {statusLabel}
          </div>
        </div>
      )}
      {showHelp && (
        <div
          style={{
            width: 240,
            padding: "12px 14px",
            background: "rgba(10,10,11,0.92)",
            border: "1px solid rgba(255,138,61,0.35)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.85)",
            fontSize: 10,
            lineHeight: 1.7,
            letterSpacing: "0.04em",
            backdropFilter: "blur(10px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ color: "#ff8a3d", marginBottom: 6, letterSpacing: "0.14em" }}>
            HOW TO USE
          </div>
          <div>1 · Click ENABLE, allow camera</div>
          <div>2 · Keep hand 30–50cm from cam, well lit</div>
          <div>3 · Move CLOSED hand UP / DOWN to scroll</div>
          <div>4 · OPEN PALM (5 fingers) to PAUSE</div>
          <div>5 · Faster hand = faster scroll</div>
          <div style={{ marginTop: 6, color: "rgba(255,255,255,0.55)" }}>
            Requires HTTPS or localhost.
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: enabled ? "rgba(255,138,61,0.12)" : "rgba(10,10,11,0.7)",
            border: `1px solid ${enabled ? "rgba(255,138,61,0.55)" : "rgba(255,255,255,0.18)"}`,
            borderRadius: 6,
            color: enabled ? "#ff8a3d" : "rgba(255,255,255,0.8)",
            cursor: "none",
            textTransform: "uppercase",
            fontSize: 10,
            letterSpacing: "0.12em",
            backdropFilter: "blur(8px)",
          }}
        >
          {enabled ? "[×] GESTURE SCROLL" : "[+] ENABLE GESTURE SCROLL"}
        </button>
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          aria-label="How to use gesture scroll"
          style={{
            width: 30,
            padding: "8px 0",
            background: "rgba(10,10,11,0.7)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 6,
            color: showHelp ? "#ff8a3d" : "rgba(255,255,255,0.8)",
            cursor: "none",
            fontSize: 11,
            fontWeight: 700,
            backdropFilter: "blur(8px)",
          }}
        >
          ?
        </button>
      </div>
    </div>
  );
}
