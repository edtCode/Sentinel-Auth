import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BootLoader } from "@/components/BootLoader";
import { GestureScrollControl } from "@/components/GestureScrollControl";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollReveal } from "@/components/ScrollReveal";
import { PointerFieldText } from "@/components/PointerFieldText";
import { ApiStatus } from "@/components/ApiStatus";
import { CinematicFooter } from "@/components/ui/motion-footer";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [theme]);
  return { theme, setTheme };
}

const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-8 z-0 mix-blend-overlay animate-grain-drift"
      style={{
        backgroundImage: GRAIN_URL,
        opacity: "var(--grain-opacity)",
      }}
    />
  );
}

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.classList.add("has-custom-cursor");

    const dot = dotRef.current!;
    const orb = orbRef.current!;

    let dx = window.innerWidth / 2,
      dy = window.innerHeight / 2;
    let ox = dx,
      oy = dy;
    let raf = 0;
    let visible = false;

    const tick = () => {
      ox += (dx - ox) * 0.18;
      oy += (dy - oy) * 0.18;
      dot.style.left = `${dx}px`;
      dot.style.top = `${dy}px`;
      orb.style.left = `${ox}px`;
      orb.style.top = `${oy}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const interactiveSel =
      'a, button, [role="button"], select, label, summary, [data-cursor="hover"]';
    const textSel =
      'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';

    const onMove = (e: MouseEvent) => {
      dx = e.clientX;
      dy = e.clientY;
      if (!visible) {
        visible = true;
        dot.classList.remove("sa-cursor-hidden");
        orb.classList.remove("sa-cursor-hidden");
      }
      const el = e.target instanceof Element ? e.target : null;
      const isText = !!el?.closest(textSel);
      const isHover = !isText && !!el?.closest(interactiveSel);
      orb.classList.toggle("is-hover", isHover);
      orb.classList.toggle("is-text", isText);
      dot.classList.toggle("is-hover", isHover);
      dot.classList.toggle("sa-cursor-hidden", isText);
    };
    const onDown = () => {
      dot.classList.add("is-down");
      orb.classList.add("is-down");
    };
    const onUp = () => {
      dot.classList.remove("is-down");
      orb.classList.remove("is-down");
    };
    const onLeave = () => {
      visible = false;
      dot.classList.add("sa-cursor-hidden");
      orb.classList.add("sa-cursor-hidden");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={orbRef} className="sa-cursor sa-cursor-orb sa-cursor-hidden" aria-hidden />
      <div ref={dotRef} className="sa-cursor sa-cursor-dot sa-cursor-hidden" aria-hidden />
    </>
  );
}

function useParallax(strength = 0.4) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * strength;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [strength]);
  return ref;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------ Audit feed ------------------------------- */

type AuditEvent = {
  ts: string;
  type: string;
  actor: string;
  meta: string;
  critical?: boolean;
};

const EVENT_TEMPLATES: Array<Omit<AuditEvent, "ts">> = [
  { type: "LOGIN_OK", actor: "usr_8f21", meta: "ip=10.24.11.4 role=user" },
  { type: "REFRESH_ROTATED", actor: "usr_8f21", meta: "jti=r_4a…9c" },
  { type: "REGISTER", actor: "usr_ac03", meta: "email=…@nova.io" },
  { type: "LOGIN_FAIL", actor: "usr_1d77", meta: "attempt=3/5", critical: true },
  { type: "TOKEN_REVOKED", actor: "usr_9b02", meta: "reason=rotation" },
  { type: "ROLE_GRANTED", actor: "usr_ac03", meta: "role=manager" },
  { type: "PASSWORD_CHANGED", actor: "usr_5e14", meta: "ip=10.24.11.9" },
  { type: "ACCOUNT_LOCKED", actor: "usr_1d77", meta: "attempts=5/5", critical: true },
  { type: "LOGIN_OK", actor: "usr_5e14", meta: "ip=10.24.11.9 role=admin" },
  { type: "REFRESH_ROTATED", actor: "usr_ac03", meta: "jti=r_8e…12" },
];

function fmtTs(d = new Date()) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function AuditFeed({ compact = false }: { compact?: boolean }) {
  const [events, setEvents] = useState<AuditEvent[]>(() =>
    EVENT_TEMPLATES.slice(0, 6).map((e) => ({ ...e, ts: "--:--:--" })),
  );
  useEffect(() => {
    setEvents((prev) => prev.map((e) => ({ ...e, ts: fmtTs() })));
    let i = 6;
    const id = setInterval(() => {
      const tpl = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
      i++;
      setEvents((prev) => [{ ...tpl, ts: fmtTs() }, ...prev].slice(0, compact ? 5 : 9));
    }, 2400);
    return () => clearInterval(id);
  }, [compact]);

  return (
    <div className="font-mono text-[12px] leading-relaxed">
      <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>audit.log — live</span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse-dot"
            style={{ background: "var(--critical)" }}
          />
          streaming
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {events.map((e, idx) => (
          <li
            key={`${e.ts}-${e.type}-${idx}`}
            className="animate-log-in grid grid-cols-[auto_auto_1fr] items-baseline gap-x-3"
          >
            <span className="text-muted-foreground">{e.ts}</span>
            <span
              className="whitespace-nowrap"
              style={e.critical ? { color: "var(--critical)" } : undefined}
            >
              {e.type.padEnd(16, " ")}
            </span>
            <span className="truncate text-muted-foreground">
              <span className="text-foreground/80">{e.actor}</span> · {e.meta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </div>
  );
}

function SectionShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative ${className}`}>
      <Grain />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function TokenRotateWidget() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, []);
  const oldJti = useMemo(() => `r_${(tick * 7 + 13).toString(16)}…9c`, [tick]);
  const newJti = useMemo(() => `r_${(tick * 11 + 41).toString(16)}…4e`, [tick]);
  return (
    <div className="rounded-lg border border-border bg-[var(--surface)] p-5 font-mono text-xs hover-critical">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>refresh cycle</span>
        <span>t+{tick}</span>
      </div>
      <div key={tick} className="animate-log-in space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through">{oldJti}</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{ background: "var(--critical)", color: "var(--critical-foreground)" }}
          >
            REVOKED
          </span>
        </div>
        <div className="text-muted-foreground">↓ rotate</div>
        <div className="flex items-center gap-2">
          <span>{newJti}</span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ISSUED
          </span>
        </div>
      </div>
    </div>
  );
}

function RbacWidget() {
  const rows = [
    ["users:read", "•", "•", "•"],
    ["users:write", "", "•", "•"],
    ["billing:read", "", "•", "•"],
    ["audit:read", "", "", "•"],
    ["roles:assign", "", "", "•"],
  ];
  return (
    <div className="rounded-lg border border-border bg-[var(--surface)] p-5 font-mono text-xs hover-critical">
      <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        permission matrix
      </div>
      <div className="grid grid-cols-4 gap-y-1.5 text-[11px]">
        <div className="text-muted-foreground">scope</div>
        <div className="text-center text-muted-foreground">user</div>
        <div className="text-center text-muted-foreground">manager</div>
        <div className="text-center text-muted-foreground">admin</div>
        {rows.map((r) => (
          <div key={r[0]} className="contents">
            <div>{r[0]}</div>
            <div
              className="text-center tabular-nums"
              style={{ color: r[1] ? "var(--data-cyan)" : undefined }}
            >
              {r[1] || "·"}
            </div>
            <div
              className="text-center tabular-nums"
              style={{ color: r[2] ? "var(--data-cyan)" : undefined }}
            >
              {r[2] || "·"}
            </div>
            <div
              className="text-center tabular-nums"
              style={{ color: r[3] ? "var(--data-cyan)" : undefined }}
            >
              {r[3] || "·"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LockWidget() {
  const [attempts, setAttempts] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setAttempts((a) => (a >= 5 ? 0 : a + 1));
    }, 1400);
    return () => clearInterval(id);
  }, []);
  const locked = attempts >= 5;
  return (
    <div className="rounded-lg border border-border bg-[var(--surface)] p-5 font-mono text-xs hover-critical">
      <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        lockout monitor
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-muted-foreground">failed_attempts</div>
          <div className="mt-1 text-3xl" style={{ color: locked ? "var(--critical)" : undefined }}>
            {attempts}
            <span className="text-muted-foreground text-lg"> / 5</span>
          </div>
        </div>
        <div>
          {locked ? (
            <span
              className="rounded px-2 py-1 text-[10px] uppercase tracking-[0.18em]"
              style={{ background: "var(--critical)", color: "var(--critical-foreground)" }}
            >
              ● locked
            </span>
          ) : (
            <span className="rounded border border-border px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              active
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              background:
                i < attempts
                  ? "var(--critical)"
                  : "color-mix(in oklab, var(--foreground) 12%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CopyInstall({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cmd = "npm install sentinelauth";
  const [copied, setCopied] = useState(false);
  const pad =
    size === "lg"
      ? "px-5 py-4 text-[15px]"
      : size === "sm"
        ? "px-3 py-2 text-[12px]"
        : "px-4 py-3 text-[13px]";
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(cmd);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {}
      }}
      className={`group inline-flex items-center gap-3 rounded-md border font-mono ${pad} text-left transition-colors ${
        copied
          ? "border-border bg-[var(--surface)] text-[#86efac]"
          : "border-border bg-[var(--surface)] hover:border-foreground/40"
      }`}
    >
      {copied ? (
        <span
          className="font-semibold tracking-wide"
          style={{ animation: "copyfeedback-in 220ms ease-out both" }}
        >
          Copied to Clipboard
        </span>
      ) : (
        <>
          <span className="text-muted-foreground">$</span>
          <span className="text-foreground">{cmd}</span>
          <span
            className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground"
            aria-live="polite"
          >
            copy
          </span>
        </>
      )}
    </button>
  );
}

function TerminalTilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    let tx = 0,
      ty = 0,
      rx = 0,
      ry = 0;
    let targetX = 0,
      targetY = 0,
      targetRX = 0,
      targetRY = 0;
    const apply = () => {
      tx += (targetX - tx) * 0.12;
      ty += (targetY - ty) * 0.12;
      rx += (targetRX - rx) * 0.12;
      ry += (targetRY - ry) * 0.12;
      el.style.transform = `perspective(1100px) translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(apply);
    };
    raf = requestAnimationFrame(apply);
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      targetX = dx * 6;
      targetY = dy * 4;
      targetRY = dx * 3.5;
      targetRX = -dy * 2.5;
    };
    const onLeave = () => {
      targetX = targetY = targetRX = targetRY = 0;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return (
    <div ref={ref} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
      {children}
    </div>
  );
}

function TerminalInstall() {
  const script = useMemo(
    () => [
      { txt: "$ npm install sentinelauth", cls: "" },
      { txt: "  ⠋ resolving dependencies…", cls: "text-muted-foreground" },
      { txt: "  ⠙ fetching sentinelauth@1.4.2", cls: "text-muted-foreground" },
      { txt: "  + sentinelauth 1.4.2 (48.2 kB)", cls: "text-muted-foreground" },
      { txt: "  added 1 package in 1.3s", cls: "" },
      { txt: "", cls: "" },
      { txt: "// server.js", cls: "text-muted-foreground" },
      { txt: 'import { sentinelAuth } from "sentinelauth";', cls: "" },
      { txt: "app.use(sentinelAuth());", cls: "", critical: true },
      { txt: "// ✔ auth armed · rbac · audit", cls: "text-muted-foreground" },
    ],
    [],
  );

  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [loop, setLoop] = useState(0);
  const [split, setSplit] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setLineIdx(script.length);
      setCharIdx(0);
      return;
    }

    let cancelled = false;
    let li = 0;
    let ci = 0;
    setLineIdx(0);
    setCharIdx(0);

    const step = () => {
      if (cancelled) return;
      const line = script[li];
      if (!line) return;

      if (ci < line.txt.length) {
        ci++;
        setCharIdx(ci);
        const speed =
          line.txt.startsWith("$") ||
          line.txt.startsWith("import") ||
          line.txt.startsWith("app.use")
            ? 32
            : 12;
        setTimeout(step, speed);
      } else {
        li++;
        ci = 0;
        setLineIdx(li);
        setCharIdx(0);
        if (li < script.length) {
          const gap =
            script[li - 1].txt.startsWith("  ⠋") || script[li - 1].txt.startsWith("  ⠙")
              ? 260
              : 380;
          setTimeout(step, gap);
        } else {
          setTimeout(() => {
            if (!cancelled) setLoop((n) => n + 1);
          }, 2600);
        }
      }
    };
    const start = setTimeout(step, 250);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [script, loop]);

  useEffect(() => {
    const updateFromClient = (clientX: number) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pct = ((clientX - r.left) / r.width) * 100;
      setSplit(Math.max(0, Math.min(100, pct)));
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      updateFromClient(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const startDrag = (e: React.PointerEvent) => {
    draggingRef.current = true;
    document.body.style.userSelect = "none";
    const r = wrapRef.current!.getBoundingClientRect();
    const pct = ((e.clientX - r.left) / r.width) * 100;
    setSplit(Math.max(0, Math.min(100, pct)));
  };

  const complete = lineIdx >= script.length;

  const renderContent = (mode: "dark" | "light") => {
    const isLight = mode === "light";
    const darkPalette = {
      text: "#f4f1ea",
      muted: "#a8a196",
      critical: "#ff8a3d",
      surface: "#111011",
      headerBg: "#1a1a1b",
      border: "rgba(244,241,234,0.16)",
    };
    const palette = isLight
      ? {
          text: "#111111",
          muted: "#4a4438",
          critical: "#b3350a",
          surface: "#f5efe1",
          headerBg: "#e8dfc8",
          border: "#c9bd9f",
        }
      : darkPalette;

    return (
      <div
        className="h-full w-full flex flex-col"
        style={{ background: palette.surface, color: palette.text }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-2.5"
          style={{ borderColor: palette.border, background: palette.headerBg }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: palette.critical }} />
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: palette.muted, opacity: 0.5 }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: palette.muted, opacity: 0.5 }}
          />
          <span
            className="ml-3 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: palette.muted }}
          >
            ~/your-app — zsh
          </span>
          <span
            className="ml-auto font-mono text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: palette.muted }}
          >
            {isLight ? "LIGHT" : "DARK"}
          </span>
        </div>
        <div
          className="p-5 font-mono text-[13px] leading-[1.85] min-h-[300px] flex-1"
          style={{
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            fontVariantLigatures: "none" as const,
          }}
        >
          {script.slice(0, lineIdx).map((l, i) => {
            const isMuted = l.cls.includes("text-muted-foreground");
            const color = l.critical ? palette.critical : isMuted ? palette.muted : palette.text;
            return (
              <div key={i} className="whitespace-pre" style={{ color }}>
                <span>{l.txt || "\u00a0"}</span>
              </div>
            );
          })}
          {!complete &&
            lineIdx < script.length &&
            (() => {
              const cur = script[lineIdx];
              const isMuted = cur.cls.includes("text-muted-foreground");
              const color = cur.critical
                ? palette.critical
                : isMuted
                  ? palette.muted
                  : palette.text;
              return (
                <div className="whitespace-pre" style={{ color }}>
                  <span>{cur.txt.slice(0, charIdx) || "\u00a0"}</span>
                  <span
                    className="inline-block h-[14px] w-[7px] translate-y-[2px] ml-[1px] animate-cursor"
                    style={{ background: palette.critical }}
                    aria-hidden
                  />
                </div>
              );
            })()}
          {complete && (
            <span
              className="inline-block h-[14px] w-[7px] translate-y-[2px] animate-cursor"
              style={{ background: palette.critical }}
              aria-hidden
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={wrapRef}
      className="relative rounded-xl border overflow-hidden select-none"
      style={{
        borderColor: "color-mix(in oklab, var(--foreground) 14%, transparent)",
      }}
    >
      {}
      {renderContent("dark")}

      {}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        aria-hidden
      >
        {renderContent("light")}
      </div>

      {}
      <div
        className="absolute top-2 z-10 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] pointer-events-none px-1.5 py-0.5 rounded-sm"
        style={{
          left: `${split}%`,
          transform: "translateX(-50%)",
          color: "var(--background)",
          background: "var(--foreground)",
        }}
        aria-hidden
      >
        {Math.round(split)}%
      </div>

      {}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${split}%`, transform: "translateX(-50%)" }}
      >
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
          style={{ background: "color-mix(in oklab, var(--foreground) 70%, transparent)" }}
        />
        <button
          type="button"
          onPointerDown={startDrag}
          aria-label="Drag to reveal light or dark terminal"
          aria-valuenow={Math.round(split)}
          aria-valuemin={0}
          aria-valuemax={100}
          role="slider"
          data-cursor="hover"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center cursor-ew-resize touch-none transition-transform hover:scale-110 active:scale-95"
          style={{
            background: "var(--foreground)",
            boxShadow: "0 0 0 1px color-mix(in oklab, var(--foreground) 80%, transparent)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M5 3 L2 7 L5 11"
              stroke="var(--background)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 3 L12 7 L9 11"
              stroke="var(--background)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function HeroBackdrop() {
  const glowRef = useParallax(-0.15);
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-scanline opacity-40" />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 hero-glow hero-glow-breathe"
      />
    </>
  );
}

function ScanDivider() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="relative h-px w-full overflow-hidden bg-border">
      {shown && (
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3"
          style={{
            background: "linear-gradient(90deg, transparent, var(--critical), transparent)",
            animation: "scan-sweep 1.8s ease-out both",
          }}
        />
      )}
    </div>
  );
}

function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const isNumeric = !!match && !isNaN(target);
  const [n, setN] = useState(isNumeric ? 0 : target);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !isNumeric) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(target);
      return;
    }
    setN(0);
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setN(target * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, isNumeric]);

  const display = isNumeric
    ? Number.isInteger(target)
      ? Math.round(n).toString()
      : n.toFixed(1)
    : value;

  return (
    <div
      ref={ref}
      className="text-[72px] font-medium leading-none tracking-tight md:text-[104px] tabular-nums"
      style={{
        fontFamily: "var(--font-display)",
        color: "var(--data-cyan)",
        textShadow: inView
          ? "0 0 32px color-mix(in oklab, var(--data-cyan) 35%, transparent)"
          : "none",
        opacity: inView ? 1 : 0.35,
        transform: inView ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {isNumeric ? `${display}${suffix}` : value}
    </div>
  );
}

function TypedEyebrow({ children }: { children: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!shown) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(children.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setN(i);
      if (i >= children.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [shown, children]);
  return (
    <div
      ref={ref}
      className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
    >
      {children.slice(0, n)}
      <span
        className="inline-block h-[10px] w-[6px] translate-y-[1px] ml-[2px] animate-cursor"
        style={{ background: "var(--critical)", opacity: n < children.length ? 1 : 0 }}
        aria-hidden
      />
    </div>
  );
}

function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const features = [
    {
      no: "§ 01",
      label: "AUTHENTICATE",
      subhead: "Tokens that rotate themselves.",
      body: "Drop sentinelAuth() into your Express app. Short-lived JWT access tokens and rotating refresh tokens are issued, verified, and revoked in middleware — no auth routes to write.",
      widget: <TokenRotateWidget />,
    },
    {
      no: "§ 02",
      label: "AUTHORIZE",
      subhead: "Roles, not regex.",
      body: "Guard routes with a single requireRole('admin') middleware. User, Manager, Admin come out of the box; the check runs in-process, no network hop, no if-tree spaghetti in your controllers.",
      widget: <RbacWidget />,
    },
    {
      no: "§ 03",
      label: "AUDIT",
      subhead: "A record for every request.",
      body: "Registration, login, failed login, password change, role grant, lockout — every sensitive action is emitted through a structured, append-only logger you own and pipe wherever you want.",
      widget: (
        <div className="rounded-lg border border-border bg-[var(--surface)] p-5 hover-critical">
          <AuditFeed compact />
        </div>
      ),
    },
    {
      no: "§ 04",
      label: "LOCK",
      subhead: "Brute force hits a wall.",
      body: "Five failed attempts inside the window and the account locks — counted, enforced, and logged by the package. No Redis rules to write, no alerts to wire, no state to babysit.",
      widget: <LockWidget />,
    },
  ];

  const detailCards = [
    { k: "ZERO CONFIG DEFAULTS", v: "sensible secrets, sane cookie flags" },
    { k: "PURE JAVASCRIPT", v: "no build step, no transpiler required" },
    { k: "PEER DEP: EXPRESS ^4", v: "middleware, not a service" },
    { k: "PACKAGE SIZE: 48 KB", v: "gzipped, no runtime bloat" },
    { k: "ARGON2 / BCRYPT", v: "password hashing" },
    { k: "HELMET + CORS", v: "security headers, origin control" },
    { k: "RATE LIMIT: 100/15MIN", v: "per-IP throttling" },
    { k: "PINO", v: "structured JSON logging" },
    { k: "ZOD", v: "request validation at the edge" },
    { k: "JEST + SUPERTEST", v: "unit and HTTP integration coverage" },
    { k: "SWAGGER / OPENAPI", v: "auto-generated /docs for every route" },
    { k: "JWT + REFRESH ROTATION", v: "short-lived access, rotating refresh" },
  ];

  const audiences = [
    {
      t: "Solo Developer",
      d: "Skip building auth from scratch. npm i sentinelauth, done.",
      k: "shipping alone",
      s: "npm i sentinelauth",
    },
    {
      t: "Startup Founder",
      d: "Install once — compliance-ready audit logs from day one, in your own database.",
      k: "audit from day 0",
      s: "app.use(sentinelAuth({ audit: true }))",
    },
    {
      t: "Small Team",
      d: "RBAC out of the box, imported like any other middleware — User, Manager, Admin.",
      k: "roles without a rewrite",
      s: "requireRole('admin')",
    },
    {
      t: "Platform / API Builder",
      d: "Refresh rotation and revocation handled inside your stack, not somebody else's.",
      k: "your stack, your keys",
      s: "rotateRefresh(userId)",
    },
  ];

  const stats = [
    { n: "0", l: "runtime deps on external services" },
    { n: "48kb", l: "gzipped package size" },
    { n: "100%", l: "sensitive actions logged" },
  ];

  return (
    <>
      <main className="relative z-10 min-h-screen bg-background text-foreground">
        <SmoothScroll />
        <ScrollReveal />
        <BootLoader />
        <GestureScrollControl />

        <CustomCursor />
        {}
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <a
                href="#top"
                className="flex items-center gap-2.5 font-mono text-[13px] tracking-[0.14em]"
              >
                <img src="/favicon.svg" alt="" aria-hidden className="h-5 w-5 rounded-[5px]" />
                SENTINEL<span style={{ color: "var(--critical)" }}>·</span>AUTH
              </a>
              <span className="hidden items-center gap-1.5 rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inline-flex">
                npm <span className="text-foreground">v1.4.2</span>
              </span>
              <a
                href="https://github.com/Brijnandan11"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                <span style={{ color: "var(--critical)" }}>★</span>
                <span className="text-foreground">2.4k</span>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme (currently ${theme})`}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTheme(theme === "dark" ? "light" : "dark");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--critical)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
                <span>{theme}</span>
              </button>
              <span
                className="hidden rounded-md border border-border px-3 py-1.5 font-mono text-[11px] tracking-[0.02em] sm:inline-block"
                style={{ color: "var(--critical)" }}
              >
                npm i sentinelauth
              </span>
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                data-cursor="hover"
                className={`hamb-btn ${menuOpen ? "is-open" : ""}`}
              >
                <span className="hamb-icon" aria-hidden="true">
                  <i />
                </span>
                <span className="hamb-label">[{menuOpen ? "CLOSE" : "MENU"}]</span>
              </button>
            </div>
          </div>
        </header>

        {}
        <div className={`menu-overlay ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
          <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
          <div className="menu-panel">
            <div className="menu-scan" />
            <div className="menu-grain" />

            <div className="menu-head">
              <span className="menu-dot" />
              <span>sentinelauth ~ nav.sh</span>
              <span className="menu-head-right">[ESC] close</span>
            </div>

            <nav className="menu-nav">
              {[
                { href: "#docs", label: "Docs", hint: "/docs" },
                {
                  href: "https://github.com/Brijnandan11",
                  label: "GitHub",
                  hint: "→ github.com/Brijnandan11",
                  external: true,
                },
                {
                  href: "https://www.npmjs.com/package/sentinelauth",
                  label: "npm",
                  hint: "→ npmjs.com/package/sentinelauth",
                  external: true,
                },
                { href: "#changelog", label: "Changelog", hint: "/changelog" },
              ].map((it: { href: string; label: string; hint: string; external?: boolean }, i) => (
                <a
                  key={it.href}
                  href={it.href}
                  target={it.external ? "_blank" : undefined}
                  rel={it.external ? "noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="menu-link"
                  style={{ ["--i" as any]: i }}
                >
                  <span className="menu-link-mask">
                    <span className="menu-link-row">
                      <span className="menu-idx">{String(i + 1).padStart(2, "0")}.</span>
                      <span className="menu-label">{it.label}</span>
                      <span className="menu-hint">{it.hint}</span>
                    </span>
                  </span>
                </a>
              ))}
            </nav>

            <div className="menu-foot">
              <span>v1.4.2 · © 2026 SENTINELAUTH</span>
              <span className="menu-foot-live">
                <span className="menu-dot" />
                audit stream · LIVE
              </span>
            </div>
          </div>
        </div>

        {}
        <section className="relative overflow-hidden border-b border-border">
          <HeroBackdrop />
          <Grain />
          <div
            className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-20 md:pb-24"
            id="top"
          >
            <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-10">
              {}
              <div className="md:col-span-6">
                <div
                  className="hero-kin flex flex-wrap items-center gap-3"
                  style={{ animationDelay: "80ms" }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                    <span
                      className="relative inline-block h-1.5 w-1.5 rounded-full hero-pulse-dot"
                      style={{
                        background: "var(--critical)",
                        boxShadow:
                          "0 0 10px 1px color-mix(in oklab, var(--critical) 65%, transparent)",
                      }}
                    />
                    v1.4.2 · middleware, not a service
                  </div>
                  <ApiStatus />
                </div>

                <h1
                  className="mt-6 max-w-[16ch] text-[40px] font-medium leading-[1.02] tracking-tight md:text-[56px] lg:text-[64px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <PointerFieldText
                    text="Auth middleware your"
                    className="hero-kin block"
                    style={{ animationDelay: "220ms" }}
                  />
                  <PointerFieldText
                    text="server can actually own."
                    className="hero-kin block"
                    style={{ color: "var(--critical)", animationDelay: "360ms" }}
                  />
                </h1>

                <p
                  className="hero-kin mt-6 max-w-[36rem] text-[16px] leading-[1.65] text-muted-foreground"
                  style={{ animationDelay: "520ms" }}
                >
                  JWT auth, RBAC, and audit logging as Express middleware. No API to trust, no
                  service to call.
                </p>
                <div
                  className="hero-kin mt-8 flex flex-wrap items-center gap-5"
                  style={{ animationDelay: "660ms" }}
                >
                  <CopyInstall size="lg" />
                  <a
                    href="https://www.npmjs.com/package/sentinelauth"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                  >
                    View on npm →
                  </a>
                </div>
              </div>

              {}
              <div className="md:col-span-6">
                <div className="hero-kin relative" style={{ animationDelay: "420ms" }}>
                  <TerminalTilt>
                    <TerminalInstall />
                  </TerminalTilt>
                </div>
              </div>
            </div>
          </div>
        </section>

        {}
        <SectionShell>
          <div className="mx-auto max-w-6xl px-6 pt-24 pb-16 md:pt-32">
            {features.map((f, i) => (
              <div key={f.no} className="relative h-[85vh] md:h-[90vh]">
                <div className="sticky" style={{ top: `calc(6rem + ${i * 18}px)` }}>
                  <div
                    className="rounded-2xl border border-border bg-[var(--surface)]/95 backdrop-blur-md card-glow p-8 md:p-12 hover-critical"
                    style={{
                      transform: `scale(${1 - i * 0.012})`,
                      transformOrigin: "top center",
                    }}
                  >
                    <div
                      className={`grid gap-10 md:grid-cols-12 md:items-center ${
                        i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                      }`}
                    >
                      <div className="md:col-span-6">
                        <TypedEyebrow>{`${f.no} — ${f.label}`}</TypedEyebrow>
                        <h2
                          className="mt-4 max-w-[16ch] text-[32px] font-medium leading-[1.1] tracking-tight md:text-[44px]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {f.subhead}
                        </h2>
                        <p className="mt-5 max-w-[36rem] text-[16px] leading-[1.75] text-muted-foreground">
                          {f.body}
                        </p>
                      </div>
                      <div className="md:col-span-6">{f.widget}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        {}
        <ScanDivider />

        {}
        <SectionShell className="relative overflow-hidden border-b border-border">
          {}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none overflow-hidden"
          >
            <div
              className="aud-watermark whitespace-nowrap text-center font-medium leading-none text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(140px, 24vw, 340px)",
              }}
            >
              STACK
            </div>
          </div>

          {}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/4 -z-10 h-[520px] w-[520px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--critical) 30%, transparent), transparent 65%)",
              filter: "blur(90px)",
            }}
          />

          {}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-8 -z-10 hidden w-px overflow-hidden md:block"
          >
            <div
              className="aud-scanline h-32 w-full"
              style={{
                background: "linear-gradient(to bottom, transparent, var(--critical), transparent)",
                boxShadow: "0 0 12px var(--critical)",
              }}
            />
          </div>

          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <Reveal>
              <TypedEyebrow>§ 05 — UNDER THE HOOD</TypedEyebrow>
              <h2
                className="mt-4 max-w-[22ch] text-[32px] font-medium leading-[1.05] tracking-tight md:text-[52px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The parts you'd have{" "}
                <span className="cta-stretch-critical" style={{ color: "var(--critical)" }}>
                  built anyway
                </span>
                .
              </h2>
              <p className="mt-6 max-w-[52ch] text-[14px] leading-[1.75] text-muted-foreground">
                Twelve boring, battle-tested modules. Bundled, wired, and hidden behind{" "}
                <span className="font-mono text-foreground">app.use()</span>. No opinions you can't
                override.
              </p>
            </Reveal>

            {}
            <Reveal delay={120}>
              <div className="mt-10 flex items-center gap-3 border-y border-border bg-[color:var(--surface)]/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="inline-flex gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--critical)", boxShadow: "0 0 8px var(--critical)" }}
                  />
                  <span className="h-2 w-2 rounded-full bg-border" />
                  <span className="h-2 w-2 rounded-full bg-border" />
                </span>
                <span className="text-foreground">~/sentinelauth</span>
                <span>$ ls -la lib/</span>
                <span className="aud-caret ml-auto" style={{ height: "10px", width: "6px" }} />
              </div>
            </Reveal>

            <div className="mt-px grid gap-px overflow-hidden border-x border-b border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {detailCards.map((c, i) => (
                <Reveal key={c.k} delay={140 + i * 55}>
                  <div
                    className="hood-card group relative h-full bg-background p-6"
                    onMouseMove={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                      e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                    }}
                  >
                    <span aria-hidden className="hood-bar" />
                    <span aria-hidden className="hood-sweep" />
                    <span
                      aria-hidden
                      className="hood-corner left-3 top-3 border-l border-t"
                      style={{ transform: "translate(-4px, -4px)" }}
                    />
                    <span
                      aria-hidden
                      className="hood-corner bottom-3 right-3 border-b border-r"
                      style={{ transform: "translate(4px, 4px)" }}
                    />

                    <div className="flex items-baseline justify-between">
                      <span className="hood-num font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span aria-hidden className="hood-eq">
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                    <div
                      className="hood-key mt-4 font-mono text-[12px] uppercase leading-tight tracking-[0.16em]"
                      style={{ color: "var(--critical)" }}
                    >
                      {c.k}
                    </div>
                    <div className="mt-2 text-[14px] leading-[1.55] text-muted-foreground">
                      {c.v}
                    </div>
                    <div className="mt-5 h-px w-full origin-left scale-x-0 bg-[var(--critical)]/40 transition-transform duration-500 group-hover:scale-x-100" />
                  </div>
                </Reveal>
              ))}
            </div>

            {}
            <Reveal delay={900}>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      background: "var(--critical)",
                      boxShadow: "0 0 12px var(--critical)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                  12 modules
                </span>
                <span>0 runtime deps</span>
                <span>48 kb gzipped</span>
                <span className="ml-auto text-foreground">exit 0</span>
              </div>
            </Reveal>
          </div>
        </SectionShell>

        {}
        <SectionShell>
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32" id="audit">
            {}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none overflow-hidden"
            >
              <div
                className="aud-watermark whitespace-nowrap text-center font-medium leading-none text-foreground"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(120px, 22vw, 300px)",
                }}
              >
                WHO
              </div>
            </div>

            {}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 top-1/3 -z-10 h-[420px] w-[420px] rounded-full opacity-50"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--critical) 26%, transparent), transparent 65%)",
                filter: "blur(70px)",
              }}
            />

            {}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-8 -z-10 hidden w-px overflow-hidden md:block"
            >
              <div
                className="aud-scanline h-24 w-full"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, var(--critical), transparent)",
                  boxShadow: "0 0 12px var(--critical)",
                }}
              />
            </div>

            <div className="grid gap-10 md:grid-cols-12">
              {}
              <div className="md:col-span-5">
                <div className="md:sticky md:top-24">
                  <Reveal>
                    <TypedEyebrow>§ 06 — WHO IT'S FOR</TypedEyebrow>
                    <h2
                      className="mt-4 text-[32px] font-medium leading-[1.02] tracking-tight md:text-[52px]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Built for the people who'd otherwise{" "}
                      <span className="cta-stretch-critical" style={{ color: "var(--critical)" }}>
                        write it twice
                      </span>
                      .
                    </h2>
                    <p className="mt-6 max-w-[36ch] text-[14px] leading-[1.75] text-muted-foreground">
                      Four kinds of teams keep reaching for the same duct-taped auth stack. This is
                      what they install instead — one package, their database, their rules.
                    </p>

                    {}
                    <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8">
                      <div>
                        <div
                          className="text-[44px] font-medium leading-none"
                          style={{ fontFamily: "var(--font-display)", color: "var(--critical)" }}
                        >
                          04
                        </div>
                        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          roles covered
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[44px] font-medium leading-none"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          01
                        </div>
                        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          middleware install
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      <span
                        aria-hidden
                        className="inline-block h-2 w-2 rounded-full"
                        style={{
                          background: "var(--critical)",
                          boxShadow: "0 0 12px var(--critical)",
                          animation: "pulse 2s ease-in-out infinite",
                        }}
                      />
                      4 roles · 1 middleware · your database
                    </div>
                  </Reveal>
                </div>
              </div>

              {}
              <div className="md:col-span-7">
                <div className="grid gap-4">
                  {audiences.map((a, i) => (
                    <Reveal key={a.t} delay={i * 110}>
                      <article className="aud-card group relative rounded-lg border border-border bg-[var(--surface)] p-6">
                        {}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
                          style={{
                            background: "var(--critical)",
                            boxShadow: "0 0 14px var(--critical)",
                          }}
                        />
                        <div className="flex items-start gap-6">
                          {}
                          <div className="shrink-0" style={{ minWidth: 68 }}>
                            <div
                              className="aud-index aud-num font-medium leading-none"
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 44,
                                letterSpacing: "-0.03em",
                                color: "var(--muted-foreground)",
                                animationDelay: `${i * 110 + 120}ms`,
                              }}
                            >
                              0{i + 1}
                            </div>
                            <div className="mt-2 h-px w-10 bg-border transition-colors duration-300 group-hover:bg-[var(--critical)]" />
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-3">
                              <h3
                                className="text-[20px] font-medium leading-tight md:text-[24px]"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {a.t}
                              </h3>
                              <span className="aud-tag rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {a.k}
                              </span>
                            </div>
                            <p className="mt-3 text-[14px] leading-[1.7] text-muted-foreground">
                              {a.d}
                            </p>
                            <div className="mt-4 flex items-center gap-2 rounded border border-border/70 bg-background/50 px-3 py-2 font-mono text-[12px]">
                              <span style={{ color: "var(--critical)" }}>$</span>
                              <span className="truncate text-foreground/90">{a.s}</span>
                              <span
                                aria-hidden
                                className="aud-caret ml-auto opacity-0 group-hover:opacity-100"
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionShell>

        {}
        <SectionShell className="border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <div className="grid gap-12 md:grid-cols-3">
              {stats.map((s, i) => (
                <Reveal key={s.l} delay={i * 80}>
                  <div>
                    <AnimatedStat value={s.n} />
                    <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {s.l}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </SectionShell>

        {}
        <SectionShell>
          <div
            className="relative mx-auto max-w-5xl overflow-hidden px-6 py-28 text-center md:py-40"
            id="get-started"
          >
            {}
            <div aria-hidden className="cta-scan" />

            {}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 select-none overflow-hidden"
            >
              <div
                className="cta-marquee font-medium leading-none text-foreground/[0.06]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(140px, 24vw, 340px)",
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="px-8">
                    BEGIN ·{" "}
                  </span>
                ))}
              </div>
            </div>

            {}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="cta-orbit" style={{ width: 520, height: 520 }}>
                <span
                  className="cta-orbit-dot"
                  style={{ ["--orbit-r" as string]: "260px" } as React.CSSProperties}
                />
              </div>
              <div className="cta-orbit cta-orbit-inner" style={{ width: 380, height: 380 }}>
                <span
                  className="cta-orbit-dot"
                  style={
                    {
                      ["--orbit-r" as string]: "190px",
                      animationDuration: "11s",
                      background: "#7dd3fc",
                      boxShadow: "0 0 18px #7dd3fc99",
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            {}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--critical) 22%, transparent), transparent 65%)",
                filter: "blur(40px)",
                animation: "hero-pulse 6s ease-in-out infinite",
              }}
            />

            <Reveal>
              <Eyebrow>§ 07 — BEGIN</Eyebrow>
              <h2
                className="mx-auto mt-6 max-w-[18ch] text-[40px] font-medium leading-[1.05] tracking-tight md:text-[64px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="cta-headline cta-stretch" data-text="Auth you don't have to">
                  Auth you don't have to
                </span>{" "}
                <span
                  className="cta-headline cta-stretch-critical"
                  data-text="trust blindly."
                  style={
                    { color: "var(--critical)", animationDelay: "0.8s" } as React.CSSProperties
                  }
                >
                  trust blindly.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-[42ch] text-[15px] leading-[1.7] text-muted-foreground">
                One install. Middleware you own, in the process you already run.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4">
                <CopyInstall size="lg" />
                <a
                  href="https://www.npmjs.com/package/sentinelauth"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                >
                  <span>View on npm</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>

              {}
              <div className="mt-16 space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    built with
                  </span>
                  {["Node.js", "JavaScript", "PostgreSQL", "Redis", "JWT"].map((t, i) => (
                    <span
                      key={t}
                      className="cta-chip font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80"
                      style={{ animationDelay: `${200 + i * 70}ms` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    tested with
                  </span>
                  {[
                    { t: "Jest", accent: true },
                    { t: "Supertest", accent: false },
                    { t: "Express (peer dep)", accent: false },
                  ].map((c, i) => (
                    <span
                      key={c.t}
                      className="cta-chip font-mono text-[10px] uppercase tracking-[0.2em]"
                      style={{
                        animationDelay: `${600 + i * 70}ms`,
                        color: c.accent ? "var(--critical)" : undefined,
                        borderColor: c.accent
                          ? "color-mix(in oklab, var(--critical) 45%, var(--border))"
                          : undefined,
                      }}
                    >
                      {c.t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </SectionShell>
      </main>

      <CinematicFooter />
    </>
  );
}
