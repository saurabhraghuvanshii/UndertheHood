"use client";
import { useEffect } from "react";
import { actions, STORAGE_KEY, useLearner } from "@/lib/store";
import { Monitor, Moon, Sun } from "lucide-react";

/** Runs before first paint: resolves theme + motion preference onto <html>. */
export const themeScript = `(function(){try{var s=(JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"{}").settings)||{};var t=s.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";if(s.motion&&s.motion!=="system")document.documentElement.dataset.motion=s.motion;}catch(e){document.documentElement.dataset.theme="light"}})()`;

/** Keeps <html data-theme> in sync with settings and the OS preference. */
export function ThemeSync() {
  const theme = useLearner((s) => s.settings.theme);
  const motion = useLearner((s) => s.settings.motion);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    if (motion === "system") delete document.documentElement.dataset.motion;
    else document.documentElement.dataset.motion = motion;
  }, [motion]);
  return null;
}

const order = ["system", "light", "dark"] as const;
export function ThemeToggle() {
  const theme = useLearner((s) => s.settings.theme);
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={() => actions.updateSettings({ theme: next })}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted hover:bg-surface-2 hover:text-fg"
      aria-label={`Theme: ${theme}. Switch to ${next}`}
      title={`Theme: ${theme} (click for ${next})`}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
