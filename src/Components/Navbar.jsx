function Navbar() {
    return (
        <nav className="border-b border-slate-800 bg-slate-950">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <h1 className="text-2xl font-bold">Eventora</h1>
<button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500">
    Login
</button>
            </div>
        </nav>
    )
}
export default Navbar