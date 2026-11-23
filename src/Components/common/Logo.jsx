function Logo({ className = '' }) {
    return (
        <span className={`group/logo inline-flex items-center ${className}`}>
            <img
                src="/eventora-logo.png"
                alt="Eventora — Event Management Company"
                className="h-12 w-44 object-contain transition-transform duration-300 group-hover/logo:scale-[1.02] sm:h-14 sm:w-48"
            />
        </span>
    )
}

export default Logo
