'use client'

import { useState } from 'react'
import { agents } from '@/data/agents'
import { AgentTile } from '@/components/AgentTile'
import { Marquee } from '@/components/Marquee'

const roles = ['ALL', ...new Set(agents.map(a => a.role))]

export default function AgentsPage() {
  const [filter, setFilter] = useState('ALL')
  const filtered = filter === 'ALL' ? agents : agents.filter(a => a.role === filter)

  return (
    <main className="min-h-screen">
      <Marquee>
        ★ 25 AGENTS ★ PICK YOUR SOUL ★ EACH ONE IS ALIVE ★ MEMORY ON WALRUS ★
      </Marquee>

      <section className="px-6 md:px-16 lg:px-24 py-12">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <h1 className="font-display text-6xl md:text-8xl tracking-tight uppercase">
              THE <span className="text-blood">RIOT</span> SQUAD
            </h1>
            <p className="font-mono text-sm text-ink/60 mt-2 tracking-widest uppercase">
              25 LIVING AGENTS — CHOOSE YOUR PARTNER IN CRIME
            </p>
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b-3 border-ink">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                  filter === role
                    ? 'bg-blood text-white'
                    : 'bg-transparent hover:bg-highlight/20 border border-ink/20'
                }`}
              >
                {role}
              </button>
            ))}
            <span className="ml-auto font-mono text-xs text-ink/40 self-center">
              {filtered.length} AGENTS
            </span>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {filtered.map((agent, i) => (
              <AgentTile key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
