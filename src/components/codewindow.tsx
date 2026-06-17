'use client'

import { useEffect, useState } from 'react'

const LINES = [
  { text: '> riot.remember("agent:oracle:conv_0039", ctx)', delay: 500, color: '#F4D35E' },
  { text: '> // SEAL encrypting memory blob...', delay: 800, color: '#666' },
  { text: '> ✓ Encrypted [sha256:7f83b1...]', delay: 600, color: '#2EC4B6' },
  { text: '> // Storing on Walrus (epoch 42)...', delay: 700, color: '#666' },
  { text: '> ✓ Blob stored | Epochs: 1000+ | Cost: $0.002', delay: 600, color: '#2EC4B6' },
  { text: '> // Generating Merkle proof...', delay: 500, color: '#666' },
  { text: '> ✓ Proof: 0x8a3f...2c1e (verified on Sui)', delay: 800, color: '#2EC4B6' },
  { text: '> riot.verify("agent:oracle:conv_0039")', delay: 1000, color: '#F4D35E' },
  { text: '> ✓ Memory integrity confirmed', delay: 600, color: '#2EC4B6' },
  { text: '> ✓ Chain: conv_0039 → conv_0038 → ... → genesis ✓', delay: 500, color: '#2EC4B6' },
]

export function CodeWindow() {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let cumulative = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    LINES.forEach((_, i) => {
      cumulative += LINES[i].delay
      timeouts.push(setTimeout(() => {
        setVisibleLines((prev) => [...prev, i])
      }, cumulative))
    })

    // Loop
    timeouts.push(setTimeout(() => {
      setVisibleLines([])
      timeouts.push(setTimeout(() => {
        LINES.forEach((_, i) => {
          cumulative += LINES[i].delay
          timeouts.push(setTimeout(() => {
            setVisibleLines((prev) => [...prev, i])
          }, cumulative))
        })
      }, 1500))
    }, cumulative + 3000))

    return () => timeouts.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 500)
    return () => clearInterval(blink)
  }, [])

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-ink/90 border-2 border-b-0 border-ink">
        <div className="w-3 h-3 bg-blood" />
        <div className="w-3 h-3 bg-highlight" />
        <div className="w-3 h-3 bg-[#2EC4B6]" />
        <div className="ml-4 font-mono text-[10px] text-cream/30 tracking-widest uppercase">
          Walrus Memory Runtime — terminal.exe
        </div>
      </div>

      {/* Terminal body */}
      <div className="bg-[#0a0a0a] border-2 border-ink p-4 md:p-6 font-mono text-xs md:text-sm min-h-[280px]">
        {LINES.map((line, i) => (
          <div
            key={i}
            className="transition-all duration-300"
            style={{
              opacity: visibleLines.includes(i) ? 1 : 0,
              transform: visibleLines.includes(i) ? 'translateX(0)' : 'translateX(-10px)',
              color: line.color,
              marginBottom: '4px',
            }}
          >
            {line.text}
          </div>
        ))}
        <span
          className={`inline-block w-2 h-4 bg-highlight ml-1 align-middle transition-opacity ${cursor ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    </div>
  )
}
