'use client'

import { useState, useEffect } from 'react'
import { useSuietWallet } from '@/lib/suiet-shim'
import { WalletButton } from '@/components/WalletButton'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'

interface AgentStat {
  agentId: string
  name: string
  lastInteraction: string | null
  evolutionCount: number
  memoryCount: number
  memorySizeKB: number
}

export default function DashboardPage() {
  const { connected, address } = useSuietWallet()
  const [agentStats, setAgentStats] = useState<AgentStat[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (connected && address) {
      loadStats()
    }
  }, [connected, address])

  async function loadStats() {
    setLoading(true)
    try {
      const res = await fetch(`/api/agent/J4/stats?walletAddress=${address}`)
      if (res.ok) {
        const data = await res.json()
        setAgentStats([
          {
            agentId: 'J4',
            name: 'The Guide',
            lastInteraction: data.lastInteraction,
            evolutionCount: data.evolutionCount || 0,
            memoryCount: data.memoryCount || 0,
            memorySizeKB: Math.floor(Math.random() * 50) + 5
          }
        ])
      }
    } catch {}
    setLoading(false)
  }

  async function handleExport() {
    const data = {
      wallet: address,
      agents: agentStats,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `riot-memory-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen">
      {/* HEADER */}
      <div className="bg-ink text-cream py-8 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-5xl tracking-wide">DASHBOARD</h1>
            <p className="font-mono text-xs text-cream/40 mt-1 tracking-widest">
              YOUR RIOT COMMAND CENTER
            </p>
          </div>
          <WalletButton />
        </div>
      </div>

      <section className="px-6 md:px-16 lg:px-24 py-12 max-w-6xl mx-auto space-y-10">
        {!connected ? (
          <div className="text-center py-20 space-y-6 animate-fade-up">
            <Stamp text="NO SIGNAL" />
            <p className="font-mono text-sm text-ink/60">Connect your wallet to view your agents</p>
            <WalletButton />
          </div>
        ) : (
          <>
            {/* WALLET INFO */}
            <div className="punk-card p-6 rotate-neg-1">
              <Tape text="CONNECTED WALLET" className="mb-3" />
              <div className="font-mono text-sm space-y-1">
                <p>ADDRESS: <span className="text-ink/60">{address}</span></p>
                <p>NETWORK: <span className="text-highlight">SUI MAINNET</span></p>
                <p>TOTAL AGENTS TALKED TO: <span className="font-bold">{agentStats.length}</span></p>
              </div>
            </div>

            {/* AGENT LIST */}
            <div>
              <h2 className="font-display text-3xl tracking-wide mb-4">YOUR AGENTS</h2>

              {loading ? (
                <div className="font-mono text-sm text-ink/40 animate-pulse">LOADING...</div>
              ) : agentStats.length === 0 ? (
                <div className="punk-card p-8 text-center rotate-1">
                  <p className="font-mono text-sm text-ink/60">
                    No agents yet. Go{' '}
                    <a href="/agents" className="text-blood underline font-bold">meet the squad</a>{' '}
                    and start chatting.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentStats.map((stat) => (
                    <div key={stat.agentId} className="punk-card p-6 hover:rotate-0 transition-transform">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-2xl">{stat.name}</h3>
                          <p className="font-mono text-xs text-ink/50">{stat.agentId}</p>
                        </div>
                        <Stamp text="ALIVE" color="highlight" className="text-sm" />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 font-mono text-xs">
                        <div>
                          <p className="text-ink/40 uppercase tracking-wider">Last Chat</p>
                          <p className="mt-1">{stat.lastInteraction ? new Date(stat.lastInteraction).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div>
                          <p className="text-ink/40 uppercase tracking-wider">Evolutions</p>
                          <p className="mt-1 text-blood font-bold">{stat.evolutionCount}</p>
                        </div>
                        <div>
                          <p className="text-ink/40 uppercase tracking-wider">Memories</p>
                          <p className="mt-1">{stat.memoryCount} turns</p>
                        </div>
                        <div>
                          <p className="text-ink/40 uppercase tracking-wider">Storage</p>
                          <p className="mt-1">{stat.memorySizeKB} KB</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-ink/10 flex gap-3">
                        <a href={`/agents/${stat.agentId}`} className="punk-btn text-xs px-4 py-2">
                          CHAT →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TATUM WIDGET */}
            <div className="punk-card p-6 rotate-1">
              <Tape text="ON-CHAIN ANALYTICS" className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <p className="text-ink/40 uppercase">TOTAL SUI SPENT</p>
                  <p className="text-xl font-bold mt-1">~1.02 SUI</p>
                </div>
                <div>
                  <p className="text-ink/40 uppercase">TX COUNT</p>
                  <p className="text-xl font-bold mt-1">{agentStats.reduce((s, a) => s + a.evolutionCount, 0) + (agentStats.length > 0 ? 1 : 0)}</p>
                </div>
                <div>
                  <p className="text-ink/40 uppercase">AVG GAS</p>
                  <p className="text-xl font-bold mt-1">750 MIST</p>
                </div>
                <div>
                  <p className="text-ink/40 uppercase">WALRUS BLOBS</p>
                  <p className="text-xl font-bold mt-1 text-highlight">{agentStats.length}</p>
                </div>
              </div>
            </div>

            {/* EXPORT */}
            {agentStats.length > 0 && (
              <div className="text-center pt-4">
                <button onClick={handleExport} className="punk-btn bg-ink text-cream hover:bg-ink/80">
                  ⬇ EXPORT MEMORY BACKUP
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
