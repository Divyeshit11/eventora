import categories from "../../data/categories";
import { SearchIcon } from '../common/icons'

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
        <div className="card-surface gradient-border mb-8 space-y-5 rounded-3xl p-5 sm:p-6">
            <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search events or locations..."
                    aria-label="Search events and locations"
                    className="field field-with-icon w-full py-3.5" />
            </div>

            <div className="flex flex-wrap gap-2.5">
                {[
                    { id: 'all', label: 'All' },
                    ...categories,
                    { id: 'Other', label: 'Other' },
                ].map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onCategoryChange(category.id)}
                        aria-pressed={selectedCategory === category.id}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${selectedCategory === category.id
                            ? 'border-transparent bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30'
                            : 'border-surface-border bg-surface-card text-slate-300 hover:border-brand-500/50 hover:text-white'
                        }`} >
                        {category.label}
                    </button>
                ))}

            </div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-xs">
                    <label htmlFor="max-price"
                        className="mb-2 block text-sm font-medium text-slate-300"
                    >
                        Maximum ticket price: <span className="text-brand-300">₹{maxPrice}</span>
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
                        className="w-full"
                        />

                </div>
                <div className="w-full sm:w-56">
                    <label
                     htmlFor="sort-events"
                     className="mb-2 block text-sm font-medium text-slate-300"
                     >
                        Sort events
                     </label>

                     <select
                     id="sort-events"
                     value={sortBy}
                     onChange={(event)=>onSortChange(event.target.value)}
                     className="field w-full py-3">
                        <option value="default">Recommended</option>
                        <option value="price-low">Price: Low to high</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="title">Title: A to Z</option>

                     </select>

                </div>
            </div>
        </div>
    )
}

export default Eventfilters