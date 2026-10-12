const footerLinks = [
    {
        title: 'Explore',
        links: [
            { label: 'All Events', href: '#events' },
            { label: 'Technology', href: '#events' },
            { label: 'Music', href: '#events' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '#about' },
            { label: 'Contact', href: '#contact' },
        ],
    },
];

function Footer() {
    return (
        <footer className="border-t border-surface-border bg-surface">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <a href="/" className="text-2xl font-bold tracking-tight text-white">
                            Eventora<span className="text-brand-500">.</span>
                        </a>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                            Discover exciting experiences, find your next event, and make every moment memorable.
                        </p>
                    </div>

                    {footerLinks.map((group) => (
                        <div key={group.title}>
                            <h3 className="font-semibold text-white">{group.title}</h3>

                            <ul className="mt-4 space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-slate-400 transition hover:text-white"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 border-t border-surface-border pt-6">
                    <p className="text-center text-sm text-slate-500">
                        © {new Date().getFullYear()}. Eventora. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;