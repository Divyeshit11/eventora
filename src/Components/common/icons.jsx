const baseProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
}

export function MapPinIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

export function CalendarIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    )
}

export function TicketIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5Z" />
            <path d="M13 5v2m0 3v2m0 3v2" />
        </svg>
    )
}

export function HeartIcon({ filled = false, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z" />
        </svg>
    )
}

export function ArrowRightIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
    )
}

export function ArrowLeftIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M19 12H5m6 6-6-6 6-6" />
        </svg>
    )
}

export function SearchIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

export function SparklesIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M12 2c.6 4.8 2.4 6.6 7.2 7.2-4.8.6-6.6 2.4-7.2 7.2-.6-4.8-2.4-6.6-7.2-7.2C9.6 8.6 11.4 6.8 12 2Z" />
            <path d="M19 13.5c.3 2.3 1.2 3.2 3.5 3.5-2.3.3-3.2 1.2-3.5 3.5-.3-2.3-1.2-3.2-3.5-3.5 2.3-.3 3.2-1.2 3.5-3.5Z" opacity=".7" />
            <path d="M5 15.5c.25 1.9 1 2.6 2.9 2.85-1.9.25-2.65 1-2.9 2.9-.25-1.9-1-2.65-2.9-2.9 1.9-.25 2.65-1 2.9-2.9Z" opacity=".5" />
        </svg>
    )
}

export function MusicIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    )
}

export function CpuIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="6" y="6" width="12" height="12" rx="2" />
            <rect x="10" y="10" width="4" height="4" rx="1" />
            <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" />
        </svg>
    )
}

export function BriefcaseIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="3" y="7" width="18" height="13" rx="3" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
        </svg>
    )
}

export function MicIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8" />
        </svg>
    )
}

export function StarIcon({ filled = false, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
        </svg>
    )
}

export function UsersIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

export function ChartIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M3 3v18h18" />
            <path d="M7 15v3m5-7v7m5-11v11" />
        </svg>
    )
}

export function SettingsIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
    )
}

export function EyeIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

export function EyeOffIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
            <path d="m2 2 20 20" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        </svg>
    )
}

export function MailIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="m22 7-10 6L2 7" />
        </svg>
    )
}

export function LockIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="4" y="11" width="16" height="10" rx="3" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
    )
}

export function ClockIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    )
}

export function CheckIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

export function XIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    )
}

export function MenuIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    )
}

export function DownloadIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
    )
}

export function UploadIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
    )
}

export function TrashIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6m4-6v6" />
        </svg>
    )
}

export function EditIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    )
}

export function GridIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    )
}

export function ListIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
    )
}

export function CompassIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z" />
        </svg>
    )
}

export function ShieldIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

export function WalletIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
    )
}

export function PartyIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M5.8 11.3 2 22l10.7-3.79" />
            <path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01" />
            <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
            <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" />
            <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
            <path d="M11 13c1.93 1.93 2.83 4.17 2 6-.83-1.93-3.07-2.83-6-2 1.93-.83 4.17-3.07 6-2Z" />
        </svg>
    )
}

export function ConfettiIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
            <path d="M14 14h.01M18 18h.01M20 8h.01M8 20h.01" />
        </svg>
    )
}

// This is a component lookup helper, intentionally exported beside its icon components.
// eslint-disable-next-line react-refresh/only-export-components
export function categoryIcon(id) {
    switch (id) {
        case 'Music':
            return MusicIcon
        case 'Business':
            return BriefcaseIcon
        case 'Comedy':
            return MicIcon
        case 'Technology':
        default:
            return CpuIcon
    }
}
