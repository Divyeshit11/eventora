import { useState } from 'react'
import fallbackImage from '../../assets/hero.png'

function EventImage({ src, alt, className = '', ...props }) {
    const [failedSrc, setFailedSrc] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const showFallback = !src || failedSrc === src

    return (
        <span className={`img-shimmer relative block overflow-hidden ${className.split(' ').filter((c) => /^(h-|w-|min-|max-|rounded|shrink-|grow-|sm:|md:|lg:)/.test(c)).join(' ')}`}>
            <img
                src={showFallback ? fallbackImage : src}
                alt={alt}
                className={`${className} transition-opacity duration-500 ${loaded || showFallback ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
                onError={() => setFailedSrc(src)}
                {...props}
            />
        </span>
    )
}

export default EventImage
