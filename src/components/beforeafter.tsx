'use client'

import { useState, useRef, useEffect } from 'react'

export function BeforeAfter() {
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent | TouchEvent) => {
      const bar = barRef.current
      if (!bar) return
      const rect = bar.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100))
      setPosition(pct)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging])

  return (
    <div
      ref={barRef}
      className="relative w-full max-w-2xl mx-auto border-2 border-ink overflow-hidden select-none"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Before (dead NFT) */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink/5 to-ink/20 flex flex-col items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-ink/20 bg-cream/50 flex items-center justify-center text-4xl md:text-5xl opacity-20">
          👻
        </div>
        <div className="mt-4 font-mono text-[10px] md:text-xs tracking-[0.3em] text-ink/20 uppercase">
          NFT #2847 — DEAD
        </div>
        <div className="mt-2 font-mono text-[8px] text-ink/10">
          No agent · No memory · No utility
        </div>
      </div>

      {/* After (resurrected - clipped) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blood/10 to-highlight/10 flex flex-col items-center justify-center overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-blood bg-cream flex items-center justify-center text-4xl md:text-5xl punk-shadow-blood">
          {['🧠', '⚡', '🔥', '💎', '👁️'][Math.floor(Math.random() * 5)]}
        </div>
        <div className="mt-4 font-mono text-[10px] md:text-xs tracking-[0.3em] text-blood uppercase">
          NFT #2847 — ALIVE
        </div>
        <div className="mt-2 font-mono text-[8px] text-ink/40">
          Agent: The Oracle · 1.2K memories · Trust: 87%
        </div>
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-blood cursor-ew-resize z-10"
        style={{ left: `${position}%` }}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
      >
        {/* Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-blood border-2 border-ink flex items-center justify-center text-cream text-xs">
          ⇤⇥
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-ink/30 tracking-widest bg-cream/80 px-2 py-1">
        DEAD
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-blood tracking-widest bg-cream/80 px-2 py-1">
        RESURRECTED
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[8px] text-ink/20 tracking-[0.3em] uppercase">
        ← DRAG TO COMPARE →
      </div>
    </div>
  )
}
