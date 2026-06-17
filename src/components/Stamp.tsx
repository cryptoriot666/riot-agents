export function Stamp({
  text,
  color = 'blood',
  className = ''
}: {
  text: string
  color?: 'blood' | 'ink' | 'highlight'
  className?: string
}) {
  const colorMap = {
    blood: 'border-blood text-blood',
    ink: 'border-ink text-ink',
    highlight: 'border-highlight text-highlight'
  }

  return (
    <div
      className={`inline-block border-4 ${colorMap[color]} px-3 py-1 font-display text-xl tracking-widest uppercase
                  transform -rotate-12 opacity-80 animate-stamp-in ${className}`}
      style={{
        fontFamily: 'var(--font-bebas), Impact, sans-serif',
        letterSpacing: '0.15em'
      }}
    >
      {text}
    </div>
  )
}
