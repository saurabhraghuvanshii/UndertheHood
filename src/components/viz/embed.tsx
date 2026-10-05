"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { VizId } from "@/content/types";
import { VIZ_META } from "./meta";

const loading = () => <div className="my-6 h-64 animate-pulse rounded-lg border border-border bg-surface-2" aria-label="Loading visualization" />;

/** Each visualization is code-split and only loaded when a page embeds it. */
const REGISTRY: Record<VizId, ComponentType> = {
  "js-closure": dynamic(() => import("./js/js-viz").then((m) => m.ClosureViz), { ssr: false, loading }),
  "js-event-loop": dynamic(() => import("./js/js-viz").then((m) => m.EventLoopViz), { ssr: false, loading }),
  "js-hoisting": dynamic(() => import("./js/js-viz").then((m) => m.HoistingViz), { ssr: false, loading }),
  "js-this": dynamic(() => import("./js/js-viz").then((m) => m.ThisViz), { ssr: false, loading }),
  "js-references": dynamic(() => import("./js/js-viz").then((m) => m.ReferencesViz), { ssr: false, loading }),
  "js-async-await": dynamic(() => import("./js/js-viz").then((m) => m.AsyncAwaitViz), { ssr: false, loading }),
  "go-slices": dynamic(() => import("./go/slices"), { ssr: false, loading }),
  "go-channels": dynamic(() => import("./go/channels"), { ssr: false, loading }),
  "go-scheduler": dynamic(() => import("./go/scheduler"), { ssr: false, loading }),
  "go-mutex": dynamic(() => import("./go/mutex"), { ssr: false, loading }),
  "go-waitgroup": dynamic(() => import("./go/waitgroup"), { ssr: false, loading }),
  "go-worker-pool": dynamic(() => import("./go/worker-pool"), { ssr: false, loading }),
  "sys-request-flow": dynamic(() => import("./sys/request-flow"), { ssr: false, loading }),
  "sys-cache": dynamic(() => import("./sys/cache"), { ssr: false, loading }),
  "sys-load-balancer": dynamic(() => import("./sys/load-balancer"), { ssr: false, loading }),
  "sys-rate-limiter": dynamic(() => import("./sys/rate-limiter"), { ssr: false, loading }),
  "sys-circuit-breaker": dynamic(() => import("./sys/circuit-breaker"), { ssr: false, loading }),
  "mem-hierarchy": dynamic(() => import("./sys/mem-hierarchy"), { ssr: false, loading }),
};

export function VizEmbed({ id, caption }: { id: VizId; caption?: string }) {
  const C = REGISTRY[id];
  if (!C) return <p className="text-sm text-danger">Unknown visualization “{id}”.</p>;
  return (
    <div>
      <C />
      {caption && <p className="-mt-3 mb-6 text-sm text-muted">{caption}</p>}
      <noscript>
        <p className="text-sm text-muted">{VIZ_META[id].summary}</p>
      </noscript>
    </div>
  );
}
