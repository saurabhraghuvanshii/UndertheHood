import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="font-mono text-sm text-subtle">404</p>
      <h1 className="mt-2 text-2xl font-semibold">This page doesn’t exist (yet).</h1>
      <p className="mt-2 text-muted">It may be a lesson that hasn’t been written. Try search, or browse the learning paths.</p>
      <div className="mt-6 flex justify-center gap-3 text-sm"><Link href="/search" className="underline">Search</Link><Link href="/paths" className="underline">Learning paths</Link></div>
    </div>
  );
}
