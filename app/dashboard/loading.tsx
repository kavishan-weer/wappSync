function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#E9ECEF] ${className}`}
      aria-hidden="true"
    />
  );
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#F0F2F5] text-[#111B21]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[#E0E6EA] bg-white p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-11" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="mt-2 h-3 w-36" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-11 w-full" />
            ))}
          </div>
        </aside>

        <section className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
            <div className="rounded-lg border border-[#E0E6EA] bg-white p-6">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="mt-4 h-8 w-72 max-w-full" />
              <SkeletonBlock className="mt-3 h-4 w-[32rem] max-w-full" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#E0E6EA] bg-white p-5"
                >
                  <SkeletonBlock className="h-10 w-10" />
                  <SkeletonBlock className="mt-5 h-4 w-28" />
                  <SkeletonBlock className="mt-3 h-7 w-20" />
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-[#E0E6EA] bg-white p-5">
              <SkeletonBlock className="h-5 w-40" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
