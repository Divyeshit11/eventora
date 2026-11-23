
import categories from '../../data/categories'
import Reveal from '../common/Reveal'
import { categoryIcon, ArrowRightIcon } from '../common/icons'

const accentClasses = [
  'from-blue-500/25 to-indigo-500/10 text-blue-300 ring-blue-400/30',
  'from-purple-500/25 to-fuchsia-500/10 text-purple-300 ring-purple-400/30',
  'from-amber-500/25 to-orange-500/10 text-amber-300 ring-amber-400/30',
  'from-pink-500/25 to-rose-500/10 text-pink-300 ring-pink-400/30',
]

function CategorySection({ onCategorySelect }) {
  return (
    <section
    id="categories"
    className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-72 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.1),_transparent_65%)]" />
      <Reveal className="relative mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
          Browse by interest
        </span>

        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Explore <span className="text-gradient">Categories</span>
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Find the experience that's right for you.
        </p>
      </Reveal>

      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => {
          const Icon = categoryIcon(category.id)
          const accent = accentClasses[index % accentClasses.length]
          return (
            <Reveal key={category.id} delay={index * 90}>
              <button
                type="button"
                onClick={() => onCategorySelect(category.id)}
                className="card-surface card-hover group flex h-full flex-col items-start rounded-3xl p-6 text-left"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${accent} ring-1 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                  <Icon className="h-7 w-7" />
                </span>

                <h3 className="mt-5 font-display text-lg font-bold text-white group-hover:text-brand-200">
                  {category.label}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                  {category.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 transition group-hover:gap-2.5 group-hover:text-brand-300">
                  Explore
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

export default CategorySection
