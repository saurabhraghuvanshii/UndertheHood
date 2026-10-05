"use client";
import dynamic from "next/dynamic";

export const PlaygroundLoader = dynamic(() => import("./playground").then((m) => m.Playground), {
  ssr: false,
  loading: () => <div className="h-[460px] animate-pulse rounded-lg bg-surface-2" />,
});
