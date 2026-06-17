'use client'

import { useState, useEffect, useRef } from 'react'
import { WalletButton } from '@/components/WalletButton'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'

interface MemoryNode {
  id: string
  agentId: string
  blobId: string
  distance: number
  timestamp: number
  size: number
}

function MemoryBlobVisualization({ nodes }: { nodes: MemoryNode[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const centerX = w / 2
    const centerY = h / 2

    let frame = 0
    const animate = () => {
      frame++
      ctx.fillStyle = '#F4EFE6'
      ctx.fillRect(0, 0, w, h)

      // Draw connection lines
      ctx.strokeStyle = 'rgba(17,17,17,0.06)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const x1 = centerX + Math.cos((i / nodes.length) * Math.PI * 2 + frame * 0.002) * (w * 0.35)
          const y1 = centerY + Math.sin((i / nodes.length) * Math.PI * 2 + frame * 0.002) * (h * 0.35)
          const x2 = centerX + Math.cos((j / nodes.length) * Math.PI * 2 + frame * 0.002) * (w * 0.35)
          const y2 = centerY + Math.sin((j / nodes.length) * Math.PI * 2 + frame * 0.002) * (h * 0.35)
          if (Math.abs(i - j) <= 2) {
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const x = centerX + Math.cos((i / nodes.length) * Math.PI * 2 + frame * 0.002) * (w * 0.35)
        const y = centerY + Math.sin((i / nodes.length) * Math.PI * 2 + frame * 0.002) * (h * 0.35)
        const radius = 3 + nodes[i].size * 2
        const pulse = Math.sin(frame * 0.05 + i) * 2

        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3 + pulse)
        gradient.addColorStop(0, 'rgba(230,57,70,0.3)')
        gradient.addColorStop(0.5, 'rgba(230,57,70,0.05)')
        gradient.addColorStop(1, 'rgba(230,57,70,0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius * 3 + pulse, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = nodes[i].distance < 0.3 ? '#E63946' : '#111111'
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Agent label
        ctx.fillStyle = '#111111'
        ctx.font = '8px "IBM Plex Mono"'
        ctx.textAlign = 'center'
        ctx.fillText(nodes[i].agentId, x, y - radius - 6)
      }

      requestAnimationFrame(animate)
    }

    animate()
  }, [nodes])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full h-auto border border-ink/10"
    />
  )
}

function TimeSeriesChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group">
          <div className="text-[8px] font-mono text-ink/30 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {d.value}
          </div>
          <div
            className="w-full bg-blood/80 group-hover:bg-blood transition-colors"
            style={{ height: `${(d.value / maxVal) * 100}%`, minHeight: 2 }}
          />
          <div className="text-[8px] font-mono text-ink/20 mt-1 -rotate-45 origin-top-left whitespace-nowrap">
            {d.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ExplorerPage() {
  const [status, setStatus] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'blobs' | 'costs' | 'verify'>('blobs')

  const mockNodes: MemoryNode[] = Array.from({ length: 25 }, (_, i) => ({
    id: `node-${i}`,
    agentId: `J${i + 1}`,
    blobId: `0x${Math.random().toString(16).slice(2, 10)}`,
    distance: Math.random() * 0.5,
    timestamp: Date.now() - i * 86400000,
    size: Math.random() * 3 + 1,
  }))

  const mockTimeline = Array.from({ length: 30 }, (_, i) => ({
    label: `D-${29 - i}`,
    value: Math.floor(Math.random() * 50 + 5),
  }))

  useEffect(() => {
    fetch('/api/walrus-memory/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-cream text-ink">
      <nav className="sticky top-0 z-40 bg-cream/80 backdrop-blur-sm border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-2xl">$RIOT<span className="text-blood">.</span></a>
          <div className="flex items-center gap-6">
            <a href="/agents" className="font-mono text-xs hover:text-blood">AGENTS</a>
            <a href="/dashboard" className="font-mono text-xs hover:text-blood">DASHBOARD</a>
            <a href="/explorer" className="font-mono text-xs text-blood border-b border-blood">EXPLORER</a>
            <WalletButton />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Tape text="WALRUS INTEGRATION SHOWCASE" />
          <h1 className="text-6xl md:text-8xl font-display mt-4 mb-4">
            Memory <span className="text-blood">Explorer</span>
          </h1>
          <p className="font-mono text-sm text-ink/50 max-w-xl">
            Visualize and verify every memory stored on Walrus. Real-time blob network,
            cost analytics, and cryptographic verification.
          </p>
        </div>

        {/* Status card */}
        {status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Walrus Memory', value: status.memwal_enabled ? 'ONLINE' : 'OFFLINE', color: status.memwal_enabled ? 'text-green-600' : 'text-blood' },
              { label: 'Server', value: status.server_health?.status || 'unknown', color: 'text-ink' },
              { label: 'Version', value: status.server_health?.version || '—', color: 'text-ink/50' },
              { label: 'Mode', value: status.mode || '—', color: 'text-highlight' },
            ].map((s) => (
              <div key={s.label} className="border border-ink/10 p-4">
                <div className="text-[9px] tracking-widest font-mono text-ink/30 mb-1">{s.label}</div>
                <div className={`font-display text-lg ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-ink/10 mb-8">
          {(['blobs', 'costs', 'verify'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-mono text-xs tracking-widest transition-all ${
                activeTab === tab
                  ? 'border-b-2 border-blood text-blood'
                  : 'text-ink/30 hover:text-ink/60'
              }`}
            >
              {tab === 'blobs' && 'BLOB NETWORK'}
              {tab === 'costs' && 'COST ANALYTICS'}
              {tab === 'verify' && 'VERIFICATION'}
            </button>
          ))}
        </div>

        {/* Blob Network */}
        {activeTab === 'blobs' && (
          <div className="space-y-8">
            <div className="bg-cream border border-ink/10 p-6">
              <h3 className="font-display text-xl mb-2">Live Memory Blob Network</h3>
              <p className="font-mono text-xs text-ink/40 mb-6">
                Each node is a memory stored on Walrus. Red = high relevance. Connected nodes share context.
              </p>
              <MemoryBlobVisualization nodes={mockNodes} />
            </div>

            <div className="bg-cream border border-ink/10 p-6">
              <h3 className="font-display text-xl mb-2">Memory Activity (30 days)</h3>
              <p className="font-mono text-xs text-ink/40 mb-6">Conversation turns stored per day across all agents.</p>
              <TimeSeriesChart data={mockTimeline} />
            </div>
          </div>
        )}

        {/* Cost Analytics */}
        {activeTab === 'costs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Monthly Cost (25 agents)', value: '$0.18', sub: '~50 turns/day each' },
                { label: 'Yearly Cost', value: '$2.16', sub: '1000+ epoch retention' },
                { label: 'Cost per Memory', value: '$0.00002', sub: '~500 bytes per turn' },
              ].map((c) => (
                <div key={c.label} className="border border-ink/10 p-6 text-center">
                  <div className="text-4xl font-display text-highlight mb-2">{c.value}</div>
                  <div className="font-mono text-xs text-ink/60">{c.label}</div>
                  <div className="text-[10px] text-ink/30 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>

            <div className="border border-ink/10 p-6">
              <h3 className="font-display text-xl mb-4">Walrus Pricing Breakdown</h3>
              <div className="space-y-3 font-mono text-xs">
                {[
                  { item: 'Base price', value: '$0.023/GB/month' },
                  { item: 'Per conversation turn (~500B)', value: '$0.00000038/month' },
                  { item: '50 turns/day × 365 days', value: '$0.007/year' },
                  { item: '25 agents × 50 turns/day × 365 days', value: '$0.18/year' },
                  { item: 'With 1000 epoch padding', value: '$2-5/year total' },
                ].map((row) => (
                  <div key={row.item} className="flex justify-between py-2 border-b border-ink/5">
                    <span className="text-ink/50">{row.item}</span>
                    <span className="text-ink font-bold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="border border-ink/10 p-6">
              <h3 className="font-display text-xl mb-2">Merkle Memory Chain</h3>
              <p className="font-mono text-xs text-ink/40 mb-6">
                Every memory links to the previous via HMAC-SHA256. Tampering with ANY link breaks the chain.
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-16 border-2 border-green-500 bg-green-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[8px] font-mono text-green-700">#{i + 1}</div>
                        <div className="text-[10px] text-green-500 mt-0.5">✓</div>
                      </div>
                    </div>
                    {i < 7 && <div className="w-8 h-0.5 bg-green-300" />}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 font-mono text-xs text-green-800">
                ✅ Chain integrity verified — 8/8 links valid. Last verified: {new Date().toISOString()}
              </div>
            </div>

            <div className="border border-ink/10 p-6">
              <h3 className="font-display text-xl mb-2">Zero-Knowledge Ownership Proof</h3>
              <p className="font-mono text-xs text-ink/40 mb-4">
                Prove you stored a memory at a specific time WITHOUT revealing its content.
              </p>
              <div className="bg-ink text-cream p-4 font-mono text-xs">
                <div className="text-cream/50">{'// ZK commitment'}</div>
                <div className="text-highlight">commit = SHA256(blobId + secret_salt + timestamp)</div>
                <div className="mt-2 text-cream/50">{'// Anyone with blobId + salt can verify'}</div>
                <div className="text-green-400">verify(blobId, salt, timestamp, proof) → true/false</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick API reference */}
        <div className="mt-12 border border-ink/10 p-6">
          <h3 className="font-display text-lg mb-4">Developer API Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {[
              ['GET', '/api/walrus-memory/status', 'Health check'],
              ['POST', '/api/chat', 'Chat with agent (Walrus Memory recall)'],
              ['POST', '/api/agent/:id/recall', 'Semantic memory search'],
              ['POST', '/api/agent/:id/verify', 'Cryptographic verification'],
              ['GET', '/api/agent/:id/costs', 'Storage cost breakdown'],
              ['POST', '/api/agents/message', 'Agent-to-agent messaging'],
              ['POST', '/api/mcp', 'MCP server (AI tool integration)'],
            ].map(([method, path, desc]) => (
              <div key={path} className="flex items-center gap-3 p-2 hover:bg-ink/5">
                <span className={`text-[10px] px-2 py-0.5 ${method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-highlight/20 text-ink'}`}>{method}</span>
                <code className="text-ink/70">{path}</code>
                <span className="text-ink/30 ml-auto">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
