import { useEffect, useRef, useState } from 'react'

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
    const ref = useRef(null)
    // Browsers without IntersectionObserver should render content immediately.
    // Initializing from feature support avoids a synchronous state update in an effect.
    const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

    useEffect(() => {
        const node = ref.current
        if (!node) return undefined
        if (typeof IntersectionObserver === 'undefined') return undefined
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return (
        <Tag
            ref={ref}
            className={`${className} transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </Tag>
    )
}

export default Reveal
