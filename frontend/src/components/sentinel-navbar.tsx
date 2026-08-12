"use client";

import { useEffect, useRef, useState } from "react";

const primaryLinks = [
  { label: "Product", href: "#product", active: true },
  { label: "Security", href: "#security" },
  { label: "Developers", href: "#developers" },
  { label: "Docs", href: "#docs" },
];

const utilityLinks = [
  { label: "GitHub", href: "https://github.com", external: true },
  { label: "npm", href: "https://www.npmjs.com", external: true },
];

export function SentinelNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const magneticRef = useRef<HTMLAnchorElement | null>(null);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const menu = document.getElementById("mobileMenu");
      const button = document.getElementById("menuButton");
      if (menu && button && !menu.contains(target) && !button.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const el = magneticRef.current;
    if (!el) return;

    const strength = 10;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const onLeave = () => {
      el.style.transform = "translate(0px, 0px)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <header className={`site-nav ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="nav-shell">
        <a className="brand focusable" href="/" aria-label="SentinelAuth home">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">SentinelAuth</span>
        </a>

        <nav className="nav-center desktop-only" aria-label="Primary">
          {primaryLinks.map((link) => (
            <a
              key={link.label}
              className={`nav-link focusable ${link.active ? "is-active" : ""}`}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-right desktop-only" aria-label="Secondary">
          {utilityLinks.map((link) => (
            <a
              key={link.label}
              className="nav-ghost focusable"
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              aria-label={
                link.external ? `${link.label} (opens in a new tab)` : link.label
              }
            >
              {link.label}
            </a>
          ))}

          <span className="magnetic-wrap">
            <a
              ref={magneticRef}
              className="nav-cta focusable"
              href="#start"
              aria-label="Start building with SentinelAuth"
            >
              Start Building
            </a>
          </span>
        </div>

        <button
          id="menuButton"
          className="mobile-toggle focusable"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobileMenu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="hamburger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div className="mobile-panel" id="mobileMenu" data-open={menuOpen} hidden={!menuOpen}>
        <div className="mobile-panel-inner">
          <nav aria-label="Mobile primary">
            <ul className="mobile-links">
              {primaryLinks.map((link, index) => (
                <li key={link.label}>
                  <a className="mobile-link focusable" href={link.href} onClick={() => setMenuOpen(false)}>
                    <span>{link.label}</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-utility">
            {utilityLinks.map((link) => (
              <a
                key={link.label}
                className="mobile-link mobile-ghost focusable"
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a className="mobile-cta focusable" href="#start" onClick={() => setMenuOpen(false)}>
              Start Building
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
