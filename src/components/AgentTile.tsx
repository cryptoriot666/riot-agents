'use client'

import Link from 'next/link'
import { agents, type Agent } from '@/data/agents'
import { Stamp } from './Stamp'
import { Tape } from './Tape'

interface AgentTileProps {
  agent: Agent
  index?: number
}

export function AgentTile({ agent, index = 0 }: AgentTileProps) {
  const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0']
  const rot = rotations[index % rotations.length]
  const hasPhoto = !agent.image.includes('placeholder')

  return (
    <Link href={`/agents/${agent.id}`}>
      <div
        className={`punk-card halftone-overlay group cursor-pointer p-0 overflow-hidden ${rot}`}
      >
        <div className="relative">
          <Tape text={agent.role} className="absolute -top-1 -left-2 z-10" />

          <div className="aspect-square bg-ink/5 relative overflow-hidden">
            {hasPhoto ? (
              <img
                src={agent.image}
                alt={agent.name}
                className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                style={{ mixBlendMode: 'multiply' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-ink/10">
                <span className="font-display text-6xl text-ink/20">{agent.id}</span>
              </div>
            )}

            <div className="absolute bottom-2 right-2">
              <Stamp text="RIOT" color="blood" className="text-xs scale-75 origin-bottom-right" />
            </div>

            {agent.id === 'J4' && (
              <div className="absolute top-8 right-2 z-20">
                <Stamp text="DEMO STAR" color="highlight" className="text-[10px] scale-90 origin-top-right" />
              </div>
            )}
          </div>

          <div className="p-4 bg-cream">
            <h3 className="font-display text-2xl tracking-wide uppercase">{agent.name}</h3>
            <p className="font-mono text-xs text-ink/60 mt-1 line-clamp-2">
              {agent.personality_prompt}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
