"use client";

const ALL_SIZES = ["XS", "S", "M", "L", "XL"];

interface SizeSelectorProps {
  availableSizes: string[];
}

export function SizeSelector({ availableSizes }: SizeSelectorProps) {
  const available = new Set(availableSizes.map((s: string) => s.toUpperCase()));

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium">Size</legend>
      <div className="flex flex-wrap gap-2">
        {ALL_SIZES.map((size) => {
          const inStock = available.has(size);
          return (
            <label
              key={size}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                inStock ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" : "opacity-50 cursor-not-allowed"
              }`}
            >
              <input
                type="radio"
                name="size"
                value={size}
                disabled={!inStock}
                required
                className="h-4 w-4"
                aria-describedby={!inStock ? `size-${size}-hint` : undefined}
              />
              <span>{size}</span>
              {!inStock && (
                <span
                  id={`size-${size}-hint`}
                  className="ml-1 rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                >
                  Not available
                </span>
              )}
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">Please select an available size to continue.</p>
    </fieldset>
  );
}
