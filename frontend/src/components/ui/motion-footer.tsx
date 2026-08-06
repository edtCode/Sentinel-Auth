import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUp, BookOpen, Github, Package, ScrollText } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
  .cinematic-footer-wrapper {
    font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
    --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
    --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
    --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
    --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
    --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
    --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
    --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
    --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
    --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
    --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  }
  @keyframes footer-breathe {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
  }
  @keyframes footer-scroll-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @keyframes footer-heartbeat {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
    15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
    30% { transform: scale(1); }
  }
  .animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
  .animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear infinite; }
  .animate-footer-heartbeat { animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }
  .footer-bg-grid {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
    mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  }
  .footer-aurora {
    background: radial-gradient(
      circle at 50% 50%,
      color-mix(in oklch, var(--primary) 15%, transparent) 0%,
      color-mix(in oklch, var(--secondary) 15%, transparent) 40%,
      transparent 70%
    );
  }
  .footer-glass-pill {
    background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
    box-shadow: 0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
    border: 1px solid var(--pill-border);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .footer-glass-pill:hover {
    background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
    border-color: var(--pill-border-hover);
    box-shadow: 0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
    color: var(--foreground);
  }
  .footer-giant-bg-text {
    font-size: 26vw;
    line-height: 0.75;
    font-weight: 900;
    letter-spacing: -0.05em;
    color: transparent;
    -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
    background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
    -webkit-background-clip: text;
    background-clip: text;
  }
  .footer-text-glow {
    background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-footer-breathe,
    .animate-footer-scroll-marquee,
    .animate-footer-heartbeat,
    .footer-aurora,
    .footer-giant-bg-text,
    .footer-text-glow {
      animation: none !important;
    }
  }
`;

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;
      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;
          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };
        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };
        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);
      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as { current: HTMLElement | null }).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as { current: HTMLElement | null }).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

function MarqueeItem() {
  const words = [
    "JWT Rotation",
    "RBAC",
    "Audit Logs",
    "Email Verify",
    "Lockout",
    "OAuth",
    "Session Control",
    "Refresh Rotation",
  ];
  return (
    <div className="flex shrink-0 items-center space-x-12 px-6">
      {words.map((w, i) => (
        <span key={w} className="flex items-center space-x-12">
          <span>{w}</span>
          <span className={i % 2 === 0 ? "text-primary/60" : "text-secondary/60"}>✦</span>
        </span>
      ))}
    </div>
  );
}

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground">
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            AUTH
          </div>

          {/* Marquee */}
          <div className="absolute left-0 top-12 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y border-border/50 bg-background/60 py-4 shadow-2xl backdrop-blur-md">
            <div className="flex w-max animate-footer-scroll-marquee text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground md:text-sm">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* Center */}
          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2
              ref={headingRef}
              className="footer-text-glow mb-12 text-center text-5xl font-black tracking-tighter md:text-8xl"
            >
              Ready to begin?
            </h2>
            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-wrap justify-center gap-4">
                <MagneticButton
                  as="a"
                  href="#get-started"
                  className="footer-glass-pill group flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-foreground md:px-10 md:py-5 md:text-base"
                >
                  <ArrowRight className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
                  Get started
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="#npm"
                  className="footer-glass-pill group flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-foreground md:px-10 md:py-5 md:text-base"
                >
                  <Package className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
                  View on npm
                </MagneticButton>
              </div>
              <div className="mt-2 flex w-full flex-wrap justify-center gap-3 md:gap-6">
                <MagneticButton
                  as="a"
                  href="https://github.com/Brijnandan11"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-glass-pill flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="#docs"
                  className="footer-glass-pill flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  <BookOpen className="h-4 w-4" />
                  Docs
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="#changelog"
                  className="footer-glass-pill flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  <ScrollText className="h-4 w-4" />
                  Changelog
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:order-1 md:text-xs">
              © {new Date().getFullYear()} SENTINELAUTH · All rights reserved
            </div>
            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full border-border/50 px-6 py-3 md:order-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">
                Crafted with
              </span>
              <span className="animate-footer-heartbeat text-destructive text-sm md:text-base">
                ❤
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">
                by
              </span>
              <a
                href="https://github.com/Brijnandan11"
                target="_blank"
                rel="noreferrer"
                className="ml-1 text-xs font-black normal-case text-foreground hover:text-primary md:text-sm"
              >
                Brijnandan11
              </a>
            </div>
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="footer-glass-pill group order-3 flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1.5" />
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
