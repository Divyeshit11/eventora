import { useState } from "react";
import navigationItems from "../../data/navigation";
import Button from "../common/Button";

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/95 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
                <a href="/" className="text-2xl font-bold text-white">
                Eventora <span className="text-brand-500">.</span>
                </a>

                <div className="hidden items-center gap-7 md:flex">
                    {navigationItems.map((item)=>(
                        <a
                        key={item.href}
                        href={item.href}
                        className="text-sm text-slate-300 transition hover:text-white"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
                <div className="hidden md:block">
                    <Button onClick={() => window.alert('Login will be implemented later.')}>
                        Login
                    </Button>

                </div>

                <button
                type="button"
                className="rounded-lg border border-surface-border p-2 text-white md:hidden"
                aria-label={isMenuOpen ? 'Close menu': 'Open menu'}
                aria-expanded={isMenuOpen}
                onClick={()=>setIsMenuOpen((previous)=> !previous)}
                >
                    {isMenuOpen ? 'x' : '☰'}
                    </button>
            </nav>
{isMenuOpen && (
    <div className="border-t border-surface-border px-4 py-4 md:hidden">
        <div className="flex flex-col gap-4">
            {navigationItems.map((item)=>(
                <a
                key={item.href}
                href={item.href}
                className="text-sm text-slate-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
                >
                    {item.label}
                </a>
            ))}

        </div>

    </div>
)}


        </header>
    )
}
export default Navbar