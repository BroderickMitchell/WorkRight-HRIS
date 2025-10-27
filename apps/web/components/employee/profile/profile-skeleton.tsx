'use client';

export function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
