'use client'

export function PunkPhoto({
  src,
  alt,
  className = '',
  rotation = 0
}: {
  src: string
  alt: string
  className?: string
  rotation?: number
}) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="absolute -inset-1 bg-ink translate-x-1 translate-y-1" />
      <img
        src={src}
        alt={alt}
        className="relative w-full h-full object-cover grayscale contrast-125"
        style={{ mixBlendMode: 'multiply' }}
        loading="lazy"
      />
    </div>
  )
}
