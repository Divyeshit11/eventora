import categories from "../../data/categories";

function Eventfilters({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
}) {
    return (
        <div className="mb-8 space-y-5">
            <input 
            type="search"
            value={searchTerm}
            onChange={(event)=> onSearchChange(event.target.value)}
            placeholder="Search events, locations..."
            aria-label="Search events and locations"
            className="w-full rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-brand-500 sm:max-w-md" />

            <div className="flex flex-wrap gap-3">
                {categories.map((category)=>(
                    <button
                    key={category.id}
                    type="button"
                    onClick={() => onCategoryChange(category.id)}
                    aira-pressed={selectedCategory === category.id}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selectedCategory === category.id
                        ? 'border-brand-500 bg-brand-600 text-white'
                        :'border-surface-border bg-surface-card text-slate-300 hover:border-brand-500'}`} >
                            {category.label}
                        </button>
                ))}

            </div>

        </div>
    )
}

export default Eventfilters