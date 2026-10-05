"use client";
import { useState, type ReactNode } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui";

/** Hides an answer until the learner chooses to see it ("try answering out loud first"). */
export function Reveal({ children, prompt = "Try answering out loud first, then reveal.", label = "Reveal answer" }: { children: ReactNode; prompt?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <div className="anim-in">{children}</div>;
  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface-2 px-4 py-6 text-center">
      <p className="mb-3 text-sm text-muted">{prompt}</p>
      <Button onClick={() => setOpen(true)} variant="primary"><Eye className="h-4 w-4" aria-hidden />{label}</Button>
    </div>
  );
}
