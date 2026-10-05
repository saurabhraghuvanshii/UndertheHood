import type { ReactNode } from "react";

/**
 * Layout for long-form reading pages (lessons, questions, design exercises).
 *
 * On wide screens (xl+) the reading column is centred in the space between the
 * navigation sidebar and a rail pinned to the far-right edge of the viewport, which
 * holds progress, contents and related links — so the text sits in the middle and
 * the tools stay out of the way. Below xl the rail simply follows the content.
 * The shell's <main> widens itself for these pages via `has-[[data-reading]]`.
 */
export function ReadingLayout({ children, rail, railLabel }: { children: ReactNode; rail: ReactNode; railLabel: string }) {
  return (
    <div data-reading>
      <div className="mx-auto w-full max-w-3xl">{children}</div>
      <aside
        aria-label={railLabel}
        className="mx-auto mt-12 w-full max-w-3xl space-y-6 border-t border-border pt-8 xl:fixed xl:bottom-0 xl:right-0 xl:top-14 xl:mt-0 xl:w-80 xl:max-w-none xl:overflow-y-auto xl:border-l xl:border-t-0 xl:bg-bg xl:px-5 xl:py-6"
      >
        {rail}
      </aside>
    </div>
  );
}
