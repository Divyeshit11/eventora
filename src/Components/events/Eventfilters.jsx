import categories from "../../data/categories";

function Eventfilters({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    maxPrice,
    onMaxPriceChange,
    sortBy,
    onSortChange,
}) {
    return (
        <div className="mb-8 space-y-5">
            <input
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search events or locations..."
                aria-label="Search events and locations"
                className="w-full rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-brand-500 sm:max-w-md" />

            <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onCategoryChange(category.id)}
                        aria-pressed={selectedCategory === category.id}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selectedCategory === category.id
                            ? 'border-brand-500 bg-brand-600 text-white'
                            : 'border-surface-border bg-surface-card text-slate-300 hover:border-brand-500'}`} >
                        {category.label}
                    </button>
                ))}

            </div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-xs">
                    <label htmlFor="max-price"
                        className="mb-2 block text-sm text-slate-300"
                    >
                        Maximum ticket price: ${maxPrice}
                    </label>

                    <input
                        id="max-price"
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={maxPrice}
                        onChange={(event) =>
                            onMaxPriceChange(Number(event.target.value))
                        }
                        className="w-full accent-indigo-500"
                        />
                    
                </div>
                <div className="w-full sm:w-56">
                    <label
                     htmlFor="sort-events"
                     className="mb-2 block text-sm text-slate-300"
                     >
                        sort events
                     </label>

                     <select
                     id="sort-events"
                     value={sortBy}
                     onChange={(event)=>onSortChange(event.target.value)}
                     className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-white outline-none focus:border-brand-500">
                        <option value="default">Recommended</option>
                        <option value="price-low">Price: Low to high</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="title">Title:A to Z </option>

                     </select>

                </div>
            </div>
        </div>
    )
}

export default Eventfilters