export function Halftone({
  intensity = 0.1,
  className = ''
}: {
  intensity?: number
  className?: string
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, #111 1px, transparent 1px)`,
        backgroundSize: '4px 4px',
        opacity: intensity,
        mixBlendMode: 'multiply'
      }}
    />
  )
}
