"use client";
import { useRef, useState } from "react";
import { actions, getState, STORAGE_KEY, useHydrated, useLearner } from "@/lib/store";
import { Button, SectionTitle } from "@/components/ui";
import { Segmented } from "@/components/viz/kit";
import { today } from "@/lib/dates";

export function SettingsForm() {
  const hydrated = useHydrated();
  const settings = useLearner((s) => s.settings);
  const counts = {
    p: useLearner((s) => Object.keys(s.progress).length),
    n: useLearner((s) => s.notes.length),
    t: useLearner((s) => s.tasks.length),
  };
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  if (!hydrated) return <div className="h-96 animate-pulse rounded-lg bg-surface-2" />;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `under-the-hood-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (f: File) => {
    try {
      actions.importState(await f.text());
      setMsg("Imported. Your data has been replaced with the backup.");
    } catch (e) {
      setMsg(`Import failed: ${(e as Error).message}`);
    }
  };
  const srs = settings.srs;

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <SectionTitle>Appearance</SectionTitle>
        <div className="space-y-3">
          <Segmented label="Theme" value={settings.theme} onChange={(theme) => actions.updateSettings({ theme })} options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
          <div><Segmented label="Motion" value={settings.motion} onChange={(motion) => actions.updateSettings({ motion })} options={[{ value: "system", label: "System" }, { value: "reduce", label: "Reduced" }, { value: "full", label: "Full" }]} /></div>
          <p className="text-xs text-muted">“System” follows your operating system’s dark-mode and reduced-motion settings. Every animation has a static equivalent.</p>
        </div>
      </section>

      <section>
        <SectionTitle>Spaced repetition</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">First interval (days)
            <input type="number" min={1} max={14} value={srs.firstIntervals[0]} onChange={(e) => actions.updateSettings({ srs: { ...srs, firstIntervals: [Math.max(1, +e.target.value), srs.firstIntervals[1]] } })} className="mt-1 w-full rounded-md border border-border-strong bg-surface px-2 py-1.5" />
          </label>
          <label className="text-sm">Second interval (days)
            <input type="number" min={1} max={30} value={srs.firstIntervals[1]} onChange={(e) => actions.updateSettings({ srs: { ...srs, firstIntervals: [srs.firstIntervals[0], Math.max(1, +e.target.value)] } })} className="mt-1 w-full rounded-md border border-border-strong bg-surface px-2 py-1.5" />
          </label>
          <label className="text-sm">Intensity
            <select value={srs.intensity} onChange={(e) => actions.updateSettings({ srs: { ...srs, intensity: +e.target.value } })} className="mt-1 w-full rounded-md border border-border-strong bg-surface px-2 py-1.5">
              <option value={0.5}>Cram (reviews 2× as often)</option>
              <option value={0.75}>Frequent</option>
              <option value={1}>Standard</option>
              <option value={1.5}>Relaxed</option>
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">After the first two successful reviews, each interval is multiplied by an ease factor (starts at 2.5; “Hard” lowers it, “Easy” raises it). Changes apply to future reviews.</p>
      </section>

      <section>
        <SectionTitle>Your data</SectionTitle>
        <p className="mb-3 text-sm leading-relaxed text-muted">
          There are no accounts yet: everything ({counts.p} progress records, {counts.n} notes, {counts.t} planned tasks) lives in this browser’s localStorage under <code className="font-mono text-xs">{STORAGE_KEY}</code>. It survives refreshes and restarts, but not clearing site data, private windows, or switching browser/device. Export a backup regularly.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportData}>Export backup (.json)</Button>
          <Button onClick={() => file.current?.click()}>Import backup…</Button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          <Button variant="danger" onClick={() => { if (confirm("Erase ALL progress, notes, plans and settings in this browser? This cannot be undone.")) { actions.reset(); setMsg("All local data erased."); } }}>Erase everything</Button>
        </div>
        {msg && <p className="mt-2 text-sm" role="status">{msg}</p>}
      </section>
    </div>
  );
}
