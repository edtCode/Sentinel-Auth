import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    
    
    document.querySelectorAll<HTMLElement>("main h2, main h3, [data-auto-reveal]").forEach((el) => {
      if (el.hasAttribute("data-reveal")) return;
      if (el.closest("[data-no-reveal]")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) return;
      el.setAttribute("data-reveal", "fade");
    });

    
    document.querySelectorAll<HTMLElement>("main hr").forEach((el) => {
      if (el.hasAttribute("data-reveal")) return;
      if (el.closest("[data-no-reveal]")) return;
      el.setAttribute("data-reveal", "divider");
    });

    
    document.querySelectorAll<HTMLElement>("[data-reveal-words]").forEach((el) => {
      if (el.dataset.revealWordsInit === "1") return;
      const text = el.textContent ?? "";
      el.textContent = "";
      const words = text.split(/(\s+)/);
      words.forEach((w, i) => {
        if (/^\s+$/.test(w)) {
          el.appendChild(document.createTextNode(w));
          return;
        }
        const span = document.createElement("span");
        span.className = "reveal-word";
        span.style.transitionDelay = `${Math.min(i * 60, 900)}ms`;
        span.textContent = w;
        el.appendChild(span);
      });
      el.dataset.revealWordsInit = "1";
    });

    
    const targets = new Set<Element>();
    const collect = () => {
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (!targets.has(el)) targets.add(el);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            if (entry.target.getAttribute("data-reveal-once") !== "false") {
              io.unobserve(entry.target);
            }
          } else if (entry.target.getAttribute("data-reveal-once") === "false") {
            entry.target.classList.remove("is-inview");
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    collect();
    targets.forEach((t) => io.observe(t));

    
    const mo = new MutationObserver(() => {
      document.querySelectorAll("[data-reveal]:not(.is-inview)").forEach((el) => {
        if (!targets.has(el)) {
          targets.add(el);
          io.observe(el);
        }
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    if (reduce) {
      
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        el.classList.add("is-inview");
      });
    }

    
    let raf = 0;
    const root = document.documentElement;
    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      root.style.setProperty("--scroll-progress", p.toFixed(4));

      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.15");
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const y = -center * speed;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      });
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="scroll-progress-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 2,
        width: "100%",
        transformOrigin: "0 50%",
        transform: "scaleX(var(--scroll-progress, 0))",
        background: "var(--critical)",
        boxShadow: "0 0 12px var(--critical)",
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}
