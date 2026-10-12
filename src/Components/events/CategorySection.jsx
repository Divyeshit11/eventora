
import categories from '../../data/categories'

function CategorySection({ onCategorySelect }) {
  return (
    <section
    id="categories" 
    className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
          Browse by interest
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Explore Categories
        </h2>

        <p className="mt-2 text-slate-400">
          Find the experience that's right for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategorySelect(category.id)}
            className="group rounded-2xl border border-surface-border bg-surface-card p-5 text-left transition hover:-translate-y-1 hover:border-brand-500"
          >
            <span className="text-3xl" aria-hidden="true">
              {category.icon}
            </span>

            <h3 className="mt-4 font-semibold text-white group-hover:text-brand-100">
              {category.label}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {category.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}

export default CategorySection
