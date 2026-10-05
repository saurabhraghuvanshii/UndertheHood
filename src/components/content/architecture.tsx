import type { DesignExercise } from "@/content/types";

type Arch = DesignExercise["architecture"];
const COL: Record<Arch["nodes"][number]["kind"], number> = { client: 0, edge: 1, service: 2, queue: 3, cache: 3, data: 4, external: 4 };
const KIND_LABEL = { client: "client", edge: "edge", service: "service", queue: "queue", cache: "cache", data: "data store", external: "external" } as const;

/**
 * Layered architecture diagram: nodes are placed in columns by kind
 * (client → edge → services → queues/caches → data), edges are straight arrows.
 * The same information is listed as text below for screen readers and small screens.
 */
export function ArchitectureDiagram({ arch, title }: { arch: Arch; title: string }) {
  const cols = new Map<number, Arch["nodes"]>();
  for (const n of arch.nodes) cols.set(COL[n.kind], [...(cols.get(COL[n.kind]) ?? []), n]);
  const usedCols = [...cols.keys()].sort((a, b) => a - b);
  const W = 190, H = 54, GX = 110, GY = 44, PAD = 16;
  const maxRows = Math.max(...[...cols.values()].map((c) => c.length));
  const width = PAD * 2 + usedCols.length * W + (usedCols.length - 1) * GX;
  const height = PAD * 2 + maxRows * H + (maxRows - 1) * GY;
  const pos = new Map<string, { x: number; y: number }>();
  usedCols.forEach((c, ci) => {
    const nodes = cols.get(c)!;
    const colH = nodes.length * H + (nodes.length - 1) * GY;
    nodes.forEach((n, ri) => pos.set(n.id, { x: PAD + ci * (W + GX), y: PAD + (height - PAD * 2 - colH) / 2 + ri * (H + GY) }));
  });
  const label = (id: string) => arch.nodes.find((n) => n.id === id)?.label ?? id;

  return (
    <figure className="my-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-bg p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto block h-auto w-full" style={{ maxWidth: width, minWidth: Math.round(width * 0.72) }} role="img" aria-labelledby="arch-title">
          <title id="arch-title">{`Architecture of ${title}`}</title>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--fg-subtle)" />
            </marker>
          </defs>
          {arch.edges.map((e, i) => {
            const a = pos.get(e.from), b = pos.get(e.to);
            if (!a || !b) return null;
            const forward = b.x >= a.x;
            const sameCol = a.x === b.x;
            // two-way links in one column get separate lanes (down on the left, up on the right)
            const lane = sameCol ? (b.y > a.y ? -14 : 14) : 0;
            const x1 = sameCol ? a.x + W / 2 + lane : forward ? a.x + W : a.x;
            const y1 = sameCol ? (b.y > a.y ? a.y + H : a.y) : a.y + H / 2;
            const x2 = sameCol ? b.x + W / 2 + lane : forward ? b.x : b.x + W;
            const y2 = sameCol ? (b.y > a.y ? b.y : b.y + H) : b.y + H / 2;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fg-subtle)" strokeWidth="1.2" markerEnd="url(#arrow)" />
                {e.label && (
                  <text x={sameCol ? x1 + (lane < 0 ? -6 : 6) : (x1 + x2) / 2} y={sameCol ? (y1 + y2) / 2 + 3 : (y1 + y2) / 2 - 4} textAnchor={sameCol ? (lane < 0 ? "end" : "start") : "middle"} fontSize="11.5" fill="var(--fg-muted)" style={{ paintOrder: "stroke", stroke: "var(--bg)", strokeWidth: 3 }}>
                    {e.label.length > 26 ? e.label.slice(0, 25) + "…" : e.label}
                  </text>
                )}
              </g>
            );
          })}
          {arch.nodes.map((n) => {
            const p = pos.get(n.id)!;
            const fill = n.kind === "data" ? "var(--info-soft)" : n.kind === "cache" ? "var(--ok-soft)" : n.kind === "queue" ? "var(--warn-soft)" : n.kind === "client" ? "var(--surface-2)" : "var(--surface)";
            return (
              <g key={n.id}>
                <rect x={p.x} y={p.y} width={W} height={H} rx={n.kind === "data" ? 14 : 8} fill={fill} stroke="var(--border-strong)" />
                <text x={p.x + W / 2} y={p.y + 24} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--fg)">{n.label.length > 24 ? n.label.slice(0, 23) + "…" : n.label}</text>
                <text x={p.x + W / 2} y={p.y + 40} textAnchor="middle" fontSize="11.5" fill="var(--fg-subtle)">{KIND_LABEL[n.kind]}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted">Diagram as text ({arch.edges.length} connections)</summary>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-muted">
          {arch.edges.map((e, i) => <li key={i}><span className="text-fg">{label(e.from)}</span> → <span className="text-fg">{label(e.to)}</span>{e.label && `: ${e.label}`}</li>)}
        </ul>
      </details>
    </figure>
  );
}
