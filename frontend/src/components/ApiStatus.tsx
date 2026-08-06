import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = "checking" | "online" | "offline";

interface State {
  status: Status;
  ms: number | null;
}

export function ApiStatus() {
  const [state, setState] = useState<State>({ status: "checking", ms: null });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const t0 = performance.now();
      try {
        const res = await api.health();
        if (cancelled) return;
        setState({
          status: res.status === "ok" ? "online" : "online",
          ms: Math.round(performance.now() - t0),
        });
      } catch {
        if (!cancelled) setState({ status: "offline", ms: null });
      }
    };

    check();
    const id = setInterval(check, 15000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const dotColor = state.status === "offline" ? "var(--critical)" : "var(--data-cyan)";
  const label =
    state.status === "checking"
      ? "checking…"
      : state.status === "online"
        ? `online · ${state.ms}ms`
        : "offline";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
      <span
        className={`relative inline-block h-1.5 w-1.5 rounded-full ${
          state.status === "online" ? "hero-pulse-dot" : ""
        }`}
        style={{
          background: dotColor,
          boxShadow: `0 0 8px 1px color-mix(in oklab, ${dotColor} 60%, transparent)`,
        }}
      />
      api · {label}
    </div>
  );
}
