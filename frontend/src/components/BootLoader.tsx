import { useEffect, useRef, useState } from "react";

const LINES = [
  "$ sentinelAuth init",
  "✓ loading middleware...",
  "✓ verifying JWT config...",
  "✓ connecting audit logger...",
  "✓ RBAC ready",
];

const CHAR_MS = 16;
const LINE_GAP = 95;
const TOTAL_TARGET = 2100; 

export function BootLoader() {
  const [done, setDone] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [typed, setTyped] = useState<string[]>(LINES.map(() => ""));
  const [completed, setCompleted] = useState<boolean[]>(LINES.map(() => false));
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = !!reduced;

    document.body.style.overflow = "hidden";

    let cancelled = false;
    const timers: number[] = [];

    if (reduced) {
      setTyped(LINES.map((l) => l));
      setCompleted(LINES.map(() => true));
      setPct(100);
      setReady(true);
      timers.push(
        window.setTimeout(() => {
          setDone(true);
          document.body.style.overflow = "";
        }, 350),
      );
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
        document.body.style.overflow = "";
      };
    }

    // Typewriter
    let cursor = 0;
    LINES.forEach((line, li) => {
      for (let ci = 1; ci <= line.length; ci++) {
        timers.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setTyped((prev) => {
              const next = [...prev];
              next[li] = line.slice(0, ci);
              return next;
            });
          }, cursor + ci * CHAR_MS),
        );
      }
      cursor += line.length * CHAR_MS;
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setCompleted((prev) => {
            const next = [...prev];
            next[li] = true;
            return next;
          });
        }, cursor + 20),
      );
      cursor += LINE_GAP;
    });

    // Percentage: uneven easing
    const pctStart = performance.now();
    const pctDur = Math.max(cursor + 150, TOTAL_TARGET - 300);
    const ease = (t: number) => {
      // fast-slow-fast
      return t < 0.4
        ? 1.6 * t
        : t < 0.75
          ? 0.64 + (t - 0.4) * 0.6
          : 0.85 + (t - 0.75) * (0.15 / 0.25);
    };
    let raf = 0;
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - pctStart) / pctDur);
      const v = Math.min(1, ease(t));
      setPct(Math.round(v * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setReady(true);
        timers.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setWiping(true);
            timers.push(
              window.setTimeout(() => {
                setDone(true);
                document.body.style.overflow = "";
              }, 520),
            );
          }, 240),
        );
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  const SEGMENTS = 32;
  const litSegs = Math.round((pct / 100) * SEGMENTS);

  return (
    <div
      aria-hidden
      className={`boot-root ${wiping ? "boot-wipe" : ""}`}
      style={{ pointerEvents: wiping ? "none" : "auto" }}
    >
      <div className="boot-scan" />
      <div className="boot-grain" />
      <div className="boot-inner font-mono">
        <div className="boot-header">
          <span className="boot-dot" />
          <span>sentinelauth · secure boot</span>
          <span className="boot-header-right">
            {pct.toString().padStart(3, "0")}%
          </span>
        </div>

        <div className="boot-log">
          {LINES.map((line, i) => {
            const t = typed[i] ?? "";
            const isLast = i === LINES.length - 1;
            const isDone = completed[i];
            const showCursor =
              (i === LINES.findIndex((_, idx) => !completed[idx])) ||
              (isLast && ready && !wiping);
            const hasCheck = line.startsWith("✓");
            const rest = hasCheck ? t.slice(1) : t;
            return (
              <div
                key={i}
                className="boot-line"
                style={{ opacity: t.length ? 1 : 0.25 }}
              >
                {hasCheck ? (
                  <span
                    className="boot-check"
                    style={{
                      color: isDone
                        ? "var(--ok, #4ade80)"
                        : "color-mix(in oklab, var(--foreground) 45%, transparent)",
                    }}
                  >
                    {t.length ? "✓" : "·"}
                  </span>
                ) : null}
                <span>{rest}</span>
                {showCursor ? <span className="boot-caret">█</span> : null}
              </div>
            );
          })}
          {ready && !wiping ? (
            <div className="boot-line boot-ready">
              <span style={{ color: "var(--ok, #4ade80)" }}>✓</span>
              <span>&nbsp;system ready</span>
            </div>
          ) : null}
        </div>

        <div className="boot-meter" role="progressbar" aria-valuenow={pct}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={`boot-seg ${i < litSegs ? "on" : ""}`}
              style={{ transitionDelay: `${i * 6}ms` }}
            />
          ))}
        </div>

        <div className="boot-footer">
          <span>booting auth engine</span>
          <span className="tabular-nums">
            {pct.toString().padStart(3, "0")} / 100
          </span>
        </div>
      </div>
    </div>
  );
}
