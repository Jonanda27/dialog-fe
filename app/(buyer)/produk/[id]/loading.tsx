export default function ProductLoading() {
    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-square w-full rounded-2xl bg-zinc-900 border border-zinc-800"></div>

            {/* Metadata Skeleton */}
            <div className="flex flex-col pt-4">
                <div className="flex gap-3 mb-6">
                    <div className="h-6 w-20 bg-zinc-800 rounded-md"></div>
                    <div className="h-6 w-24 bg-zinc-800 rounded-md"></div>
                </div>

                <div className="h-10 w-3/4 bg-zinc-800 rounded-lg mb-4"></div>
                <div className="h-6 w-1/2 bg-zinc-900 rounded-lg mb-8"></div>
                <div className="h-10 w-40 bg-zinc-800 rounded-lg mb-8"></div>

                <div className="grid grid-cols-2 gap-6 border-t border-zinc-800 pt-8">
                    <div className="h-12 w-full bg-zinc-900 rounded-lg"></div>
                    <div className="h-12 w-full bg-zinc-900 rounded-lg"></div>
                    <div className="h-12 w-full bg-zinc-900 rounded-lg"></div>
                    <div className="h-12 w-full bg-zinc-900 rounded-lg"></div>
                </div>

                <div className="flex gap-4 mt-12">
                    <div className="h-12 flex-1 bg-zinc-800 rounded-xl"></div>
                    <div className="h-12 flex-1 bg-zinc-800 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}