'use client'

import { useState, useEffect, useRef } from 'react'
import { agents } from '@/data/agents'

export function AgentCarousel() {
  const [active, setActive] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (isHovered) return
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % agents.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [isHovered])

  const visible = agents.slice(0, 10)
  const agent = visible[active % visible.length]

  return (
    <div
      className="relative w-full max-w-4xl mx-auto perspective-[1200px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D ring of agent cards */}
      <div className="relative h-[320px] md:h-[400px] flex items-center justify-center preserve-3d">
        {visible.map((a, i) => {
          const offset = i - active
          const absOffset = Math.abs(offset)
          const isActive = offset === 0

          // Wrap offsets for circular carousel
          let wrappedOffset = offset
          if (offset > visible.length / 2) wrappedOffset = offset - visible.length
          if (offset < -visible.length / 2) wrappedOffset = offset + visible.length

          const translateX = wrappedOffset * 180
          const translateZ = -absOffset * 180
          const rotateY = wrappedOffset * 15
          const scale = isActive ? 1 : 0.75 - absOffset * 0.08
          const opacity = isActive ? 1 : 0.3 - absOffset * 0.15
          const zIndex = visible.length - absOffset

          return (
            <div
              key={a.id}
              className="absolute transition-all duration-700 ease-out cursor-pointer preserve-3d"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${Math.max(scale, 0.05)})`,
                opacity: Math.max(opacity, 0),
                zIndex,
                filter: isActive ? 'none' : `blur(${absOffset * 0.8}px)`,
              }}
              onClick={() => setActive(i)}
            >
              <div className={`w-40 h-52 md:w-48 md:h-64 border-2 transition-all duration-500 ${
                isActive
                  ? 'border-blood bg-ink text-cream punk-shadow-blood scale-110'
                  : 'border-ink/20 bg-cream text-ink/40 hover:border-ink/50'
              }`}>
                {/* Agent card interior */}
                <div className="h-full flex flex-col p-3 md:p-4">
                  <div className="text-3xl md:text-4xl mb-2">{a.id.slice(0, 1) || '?'}</div>
                  <div className={`font-display text-sm md:text-lg leading-tight mb-1 ${isActive ? 'text-highlight' : ''}`}>
                    {a.name}
                  </div>
                  <div className={`text-[8px] md:text-[10px] tracking-[0.2em] font-mono mb-2 ${isActive ? 'text-blood' : 'text-ink/30'}`}>
                    {a.role.toUpperCase()}
                  </div>
                  <p className={`text-[9px] md:text-[10px] leading-relaxed mt-auto line-clamp-3 ${
                    isActive ? 'text-cream/60' : 'text-ink/20'
                  }`}>
                    {a.system_prompt.slice(0, 80)}...
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {visible.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2 h-2 transition-all duration-300 rounded-none ${
              i === active ? 'w-8 bg-blood' : 'bg-ink/20 hover:bg-ink/40'
            }`}
          />
        ))}
      </div>

      {/* Active agent detail */}
      <div className="text-center mt-4 font-mono text-[10px] tracking-[0.3em] text-ink/30 uppercase">
        {agent.id} — {agent.role.toUpperCase()} — WALRUS MEMORY ACTIVE
      </div>
    </div>
  )
}
