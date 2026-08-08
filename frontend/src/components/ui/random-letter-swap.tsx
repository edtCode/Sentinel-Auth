import { useEffect, useRef } from "react";

type Props = {
  label: string;
  href: string;
  external?: boolean;
  className?: string;
};

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function RandomLetterSwap({ label, href, external, className }: Props) {
  const textRef = useRef<HTMLSpanElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const iterationRef = useRef(0);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const scramble = () => {
    const el = textRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = label;
      return;
    }

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    iterationRef.current = 0;

    const target = label;
    const resolveAt = 1 + Math.round(target.length / 3);

    const frame = () => {
      const n = iterationRef.current;
      let text = "";
      for (let i = 0; i < target.length; i++) {
        if (i < Math.floor(n / resolveAt)) {
          text += target[i];
        } else {
          text += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      el.textContent = text;

      if (n >= target.length * resolveAt) {
        el.textContent = target;
        frameRef.current = null;
        return;
      }
      iterationRef.current = n + 1;
      frameRef.current = requestAnimationFrame(frame);
    };

    frame();
  };

  const reset = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (textRef.current) textRef.current.textContent = label;
  };

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      data-cursor="hover"
      onMouseEnter={scramble}
      onFocus={scramble}
      onMouseLeave={reset}
      onBlur={reset}
      className={`relative overflow-hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-300 hover:text-[var(--critical)] focus:outline-none focus-visible:text-[var(--critical)] ${className ?? ""}`}
    >
      <span ref={textRef}>{label}</span>
    </a>
  );
}