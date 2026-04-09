export default function DashboardLoading() {
    return (
        <div className="space-y-10 animate-pulse">
            {/* Header Skeleton */}
            <section>
                <div className="h-9 w-64 bg-zinc-800 rounded-md"></div>
                <div className="h-5 w-96 bg-zinc-900 rounded-md mt-3"></div>
            </section>

            {/* Stats Cards Skeleton */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5"></div>
                ))}
            </section>

            {/* Recent Releases Skeleton */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <div className="h-7 w-40 bg-zinc-800 rounded-md"></div>
                    <div className="h-5 w-24 bg-zinc-900 rounded-md"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col bg-zinc-900/40 border border-zinc-800/50 rounded-xl overflow-hidden h-[340px]">
                            <div className="w-full aspect-square bg-zinc-800/50"></div>
                            <div className="p-4 flex flex-col flex-grow gap-3">
                                <div className="h-5 w-3/4 bg-zinc-800 rounded"></div>
                                <div className="h-4 w-1/2 bg-zinc-800/50 rounded"></div>
                                <div className="mt-auto h-6 w-1/3 bg-zinc-800 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}