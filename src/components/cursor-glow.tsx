'use client'

import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const onMove = (e: MouseEvent) => {
      glow.style.setProperty('--x', `${e.clientX}px`)
      glow.style.setProperty('--y', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={glowRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{
        background: 'radial-gradient(600px at var(--x, 50%) var(--y, 50%), rgba(230,57,70,0.06) 0%, transparent 80%)',
      }}
    />
  )
}
