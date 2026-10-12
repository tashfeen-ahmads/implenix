// Skeleton shown while a dashboard page loads its data. Mirrors the common
// page shape: title, a row of stats, then a large panel.
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="motion-safe:animate-pulse">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-48 rounded-sm bg-white/10" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-sm bg-white/5" />
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[92px] rounded-md border border-white/10 bg-white/[0.03]" />
        ))}
      </div>
      <div className="mt-6 h-80 rounded-md border border-white/10 bg-white/[0.03]" />
    </div>
  );
}
