import { useEffect, useRef } from "react";

type Props = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  radius?: number;
  strength?: number;
};

export function PointerFieldText({
  text,
  className,
  style,
  radius = 150,
  strength = 16,
}: Props) {
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const chars = Array.from(
      root.querySelectorAll<HTMLElement>("[data-pf-char]"),
    );
    const state = chars.map(() => ({ x: 0, y: 0, s: 0, tx: 0, ty: 0, ts: 0 }));

    let pointer = { x: -9999, y: -9999 };
    let active = false;
    let raf = 0;

    const measure = () =>
      chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    let centers = measure();

    const onResize = () => {
      centers = measure();
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (!active) {
        active = true;
        centers = measure();
        loop();
      }
    };

    const onLeave = () => {
      pointer = { x: -9999, y: -9999 };
    };

    const loop = () => {
      let moving = false;
      for (let i = 0; i < chars.length; i++) {
        const c = centers[i];
        const st = state[i];
        if (!c || !st) continue;
        const dx = c.x - pointer.x;
        const dy = c.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const f = 1 - dist / radius;
          const ease = f * f;
          const norm = dist || 1;
          st.tx = (dx / norm) * strength * ease;
          st.ty = (dy / norm) * strength * ease - 4 * ease;
          st.ts = ease;
        } else {
          st.tx = 0;
          st.ty = 0;
          st.ts = 0;
        }

        st.x += (st.tx - st.x) * 0.16;
        st.y += (st.ty - st.y) * 0.16;
        st.s += (st.ts - st.s) * 0.14;

        if (
          Math.abs(st.x - st.tx) > 0.05 ||
          Math.abs(st.y - st.ty) > 0.05 ||
          Math.abs(st.s - st.ts) > 0.005
        ) {
          moving = true;
        }

        const el = chars[i];
        if (!el) continue;
        el.style.transform = `translate3d(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px, 0) scale(${(1 + st.s * 0.14).toFixed(3)})`;
        el.style.opacity = `${(0.82 + st.s * 0.18).toFixed(3)}`;
        el.style.filter =
          st.s > 0.02
            ? `drop-shadow(0 0 ${(st.s * 14).toFixed(1)}px color-mix(in oklab, currentColor ${(st.s * 60).toFixed(0)}%, transparent))`
            : "none";
      }

      if (moving) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
        active = false;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text, radius, strength]);

  const words = text.split(" ");

  return (
    <span ref={rootRef} className={className} style={style} aria-label={text}>
      {words.map((word, wi) => (
        <span
          key={`${word}-${wi}`}
          className="inline-block whitespace-nowrap"
          aria-hidden
        >
          {Array.from(word).map((ch, ci) => (
            <span
              key={`${ch}-${ci}`}
              data-pf-char
              className="inline-block will-change-transform"
              style={{ opacity: 0.82 }}
            >
              {ch}
            </span>
          ))}
          {wi < words.length - 1 ? (
            <span className="inline-block">&nbsp;</span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
