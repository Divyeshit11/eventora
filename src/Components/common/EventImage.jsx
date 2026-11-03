import { useState } from 'react'
import fallbackImage from '../../assets/hero.png'

function EventImage({ src, alt, className = '', ...props }) {
    const [failedSrc, setFailedSrc] = useState(null)

    return (
        <img
            src={!src || failedSrc === src ? fallbackImage : src}
            alt={alt}
            className={className}
            onError={() => setFailedSrc(src)}
            {...props}
        />
    )
}

export default EventImage
