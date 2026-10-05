"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Calendar, Compass, FlaskConical, Hammer, Home, ListChecks, Menu, MessagesSquare, Network, NotebookPen,
  Repeat, Route, Search, Settings, X,
} from "lucide-react";
import { nav, site } from "@/config/site";
import { cn } from "@/components/ui/cn";
import { Kbd } from "@/components/ui";
import { ThemeToggle } from "./theme";
import { CommandPalette } from "./command-palette";
import { useLearner, useHydrated } from "@/lib/store";
import { today } from "@/lib/dates";

const icons = {
  home: Home, compass: Compass, route: Route, messages: MessagesSquare, flask: FlaskConical, network: Network,
  hammer: Hammer, list: ListChecks, calendar: Calendar, repeat: Repeat, notebook: NotebookPen, settings: Settings,
} as const;

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

function DueCount() {
  const hydrated = useHydrated();
  const n = useLearner((s) => Object.values(s.progress).filter((p) => p.revision && p.revision.due <= today()).length);
  if (!hydrated || n === 0) return null;
  return (
    <span className="ml-auto rounded-full bg-warn-soft px-1.5 text-xs font-medium text-warn" aria-label={`${n} revisions due`}>
      {n}
    </span>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <ul className="space-y-0.5">
      {nav.map((item) => {
        const Icon = icons[item.icon];
        const active = isActive(path, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-surface-3 font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
              {item.href === "/revision" && <DueCount />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-semibold tracking-tight text-fg" aria-label={`${site.name} — dashboard`}>
      <span aria-hidden className="grid h-7 w-7 place-items-center rounded-md bg-fg font-mono text-xs text-bg">{"{}"}</span>
      <span className={compact ? "hidden sm:inline" : undefined}>{site.name}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      } else if (e.key === "/" && !palette && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable)) {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [palette]);

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:shadow">
        Skip to content
      </a>

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-bg lg:flex" >
        <div className="flex h-14 items-center px-5">
          <Brand />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Primary">
          <NavList />
        </nav>
        <p className="border-t border-border px-5 py-3 text-xs leading-relaxed text-subtle">Progress is stored in this browser only.</p>
      </aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button className="absolute inset-0 bg-black/30" aria-label="Close navigation" onClick={() => setDrawer(false)} />
          <div className="anim-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-bg">
            <div className="flex h-14 items-center justify-between px-5">
              <Brand />
              <button onClick={() => setDrawer(false)} className="rounded-md p-2 text-muted hover:bg-surface-2" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2">
              <NavList onNavigate={() => setDrawer(false)} />
            </nav>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-bg/75 sm:px-6">
          <button className="rounded-md p-2 text-muted hover:bg-surface-2 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <button
            onClick={() => setPalette(true)}
            className="ml-auto flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-subtle hover:border-border-strong lg:ml-0"
            aria-label="Search everything"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Search lessons, questions, notes…</span>
            <span className="ml-auto hidden items-center gap-1 sm:flex">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 xl:has-[[data-reading]]:max-w-none xl:has-[[data-reading]]:pr-[22.5rem]">
          {children}
        </main>
      </div>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  );
}
