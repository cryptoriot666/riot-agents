'use client'

import { useEffect, useState } from 'react'

export function ProgressRing({
  value,
  max,
  label,
  color = 'var(--blood)',
  size = 100,
}: {
  value: number; max: number; label: string
  color?: string; size?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const stroke = size * 0.1
  const radius = (size - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const targetRatio = Math.min(value / max, 1)
  const offset = circumference - (displayValue / max) * circumference

  useEffect(() => {
    const duration = 2000
    const start = Date.now()
    const startVal = 0
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(Math.floor(eased * value))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-3 group">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--ink)" strokeOpacity={0.08} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          className="drop-shadow-[0_0_8px_rgba(230,57,70,0.3)]"
        />
      </svg>
      <div className="text-center">
        <div className="font-display text-2xl md:text-3xl text-ink">
          {displayValue}
          <span className="text-blood">%</span>
        </div>
        <div className="font-mono text-[9px] tracking-[0.15em] text-ink/30 mt-1 uppercase">{label}</div>
      </div>
    </div>
  )
}
