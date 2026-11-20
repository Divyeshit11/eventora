function LogoMark({ className = 'h-9 w-9' }) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="eventora-logo-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818cf8" />
                    <stop offset="0.55" stopColor="#6366f1" />
                    <stop offset="1" stopColor="#d946ef" />
                </linearGradient>
            </defs>
            <rect
                x="4"
                y="10"
                width="40"
                height="30"
                rx="9"
                fill="url(#eventora-logo-grad)"
            />
            <path
                d="M14 20.5 20.5 27 14 33.5"
                stroke="#fff"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M24 34h10"
                stroke="#fff"
                strokeWidth="3.4"
                strokeLinecap="round"
            />
            <circle cx="34" cy="14" r="4" fill="#f0abfc" />
            <path
                d="M34 10.5v-2M34 19.5v-2M30.5 14h-2M39.5 14h-2"
                stroke="#f0abfc"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    )
}

function Logo({ className = '', markClassName = 'h-9 w-9', textClassName = '' }) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <LogoMark className={markClassName} />
            <span className={`font-display text-xl font-extrabold tracking-tight text-white ${textClassName}`}>
                Eventora
                <span className="text-gradient">.</span>
            </span>
        </span>
    )
}

export default Logo
export { LogoMark }
