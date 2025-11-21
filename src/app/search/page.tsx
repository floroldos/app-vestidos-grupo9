import Link from "next/link";
import Image from "next/image";
import { listItems, type Category } from "../../../lib/RentalManagementSystem";

type SearchParams = {
  q?: string;
  category?: Category | "";
  size?: string;
  color?: string;
  style?: string;
  start?: string;
  end?: string;
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { q = "", category = "", size = "", color = "", style = "" } = params;
  const items = listItems({
    q,
    category: category || undefined,
    size: size || undefined,
    color: color || undefined,
    style: style || undefined,
  });

  const fieldClass =
    "rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all";

  const hasFilters = q || category || size || color || style;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <Link href="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-fuchsia-600 transition-colors">
              ← Back to home
            </Link>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
            Browse Our <span className="bg-gradient-to-r from-fuchsia-600 to-rose-600 bg-clip-text text-transparent">Collection</span>
          </h1>
          <p className="mt-2 sm:mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {items.length} {items.length === 1 ? 'dress' : 'dresses'} available for rent
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Enhanced Filter Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 sm:p-6 mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-semibold text-base sm:text-lg">Filter & Search</h2>
            {hasFilters && (
              <Link 
                href="/search"
                className="text-sm text-fuchsia-600 hover:text-fuchsia-700 font-medium transition-colors"
              >
                Clear all
              </Link>
            )}
          </div>
          
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="q" className="mb-1.5 sm:mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Search by name
              </label>
              <input
                id="q"
                name="q"
                type="text"
                placeholder="Search..."
                defaultValue={q}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="category" className="mb-1.5 sm:mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select id="category" name="category" defaultValue={category} className={fieldClass}>
                <option value="">All categories</option>
                <option value="dress">Dresses</option>
                <option value="shoes">Shoes</option>
                <option value="bag">Bags</option>
                <option value="jacket">Jackets</option>
              </select>
            </div>

            <div>
              <label htmlFor="size" className="mb-1.5 sm:mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Size
              </label>
              <input 
                id="size" 
                name="size" 
                type="text" 
                placeholder="e.g. M, L" 
                defaultValue={size} 
                className={fieldClass} 
              />
            </div>

            <div>
              <label htmlFor="color" className="mb-1.5 sm:mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Color
              </label>
              <input 
                id="color" 
                name="color" 
                type="text" 
                placeholder="e.g. red" 
                defaultValue={color} 
                className={fieldClass} 
              />
            </div>

            <div>
              <label htmlFor="style" className="mb-1.5 sm:mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Style
              </label>
              <input 
                id="style" 
                name="style" 
                type="text" 
                placeholder="e.g. elegant" 
                defaultValue={style} 
                className={fieldClass} 
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-2 sm:mt-0">
              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white px-6 sm:px-8 py-2.5 text-sm font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Product Grid with Enhanced Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/items/${it.id}`}
              className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Image Container with Zoom Effect */}
              <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <Image 
                  src={it.images[0]} 
                  alt={it.alt} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    {it.category}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-white/95 dark:bg-slate-800/95 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-lg">
                    ${it.pricePerDay}/day
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* View Details Button (appears on hover) */}
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="rounded-xl bg-white dark:bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 dark:text-white shadow-xl">
                    View Details →
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                  {it.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Available sizes: <span className="font-medium text-slate-900 dark:text-white">{it.sizes.join(", ")}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State with Better Design */}
        {items.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-fuchsia-100 to-rose-100 dark:from-fuchsia-900/20 dark:to-rose-900/20 mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-fuchsia-600 dark:text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              No dresses found
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 px-4">
              Try adjusting your filters or search terms
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-700 hover:to-rose-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all shadow-md hover:shadow-xl"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
