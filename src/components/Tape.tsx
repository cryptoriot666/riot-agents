export function Tape({
  text,
  className = ''
}: {
  text: string
  className?: string
}) {
  return (
    <div
      className={`inline-block bg-highlight px-6 py-2 font-mono text-xs uppercase tracking-widest
                  transform -rotate-1 shadow-sm ${className}`}
      style={{
        boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.15)'
      }}
    >
      {text}
    </div>
  )
}
