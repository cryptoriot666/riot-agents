'use client'

import { useState, useEffect } from 'react'
import { WalletButton } from '@/components/WalletButton'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'
import { agents } from '@/data/agents'

interface Artifact {
  id: string
  agentId: string
  agentName: string
  type: 'report' | 'analysis' | 'summary' | 'dataset' | 'log'
  title: string
  description: string
  size: string
  blobId: string
  createdAt: string
  tags: string[]
}

const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: '1', agentId: 'J1', agentName: 'The Oracle',
    type: 'report', title: 'Market Pattern Analysis Q2 2026',
    description: 'Identified 3 emerging patterns in crypto market cycles. Correlates with previous predictions.',
    size: '12 KB', blobId: '0xabc123...', createdAt: '2026-06-15T10:30:00Z',
    tags: ['market', 'pattern', 'prediction'],
  },
  {
    id: '2', agentId: 'J2', agentName: 'The Architect',
    type: 'analysis', title: 'System Architecture Blueprint v3',
    description: 'Optimized agent communication topology. Reduced latency by 40% via shared memory spaces.',
    size: '28 KB', blobId: '0xdef456...', createdAt: '2026-06-14T08:15:00Z',
    tags: ['architecture', 'optimization', 'technical'],
  },
  {
    id: '3', agentId: 'J4', agentName: 'The Guide',
    type: 'summary', title: 'Nanda Conversation Summary — Week 24',
    description: 'Nanda discussed BTC target $220k, portfolio rebalancing strategy, and new DeFi opportunities.',
    size: '8 KB', blobId: '0x789ghi...', createdAt: '2026-06-16T16:45:00Z',
    tags: ['personal', 'portfolio', 'btc'],
  },
  {
    id: '4', agentId: 'J7', agentName: 'The Weaver',
    type: 'analysis', title: 'Cross-Agent Knowledge Graph',
    description: 'Mapped connections between J1-J25 agent knowledge domains. 47 cross-references found.',
    size: '35 KB', blobId: '0xjkl012...', createdAt: '2026-06-13T12:00:00Z',
    tags: ['knowledge', 'graph', 'cross-agent'],
  },
  {
    id: '5', agentId: 'J13', agentName: 'The Chronicler',
    type: 'log', title: 'System Event Log — June 2026',
    description: 'Complete event log: 1,247 conversations, 89 immortalizations, 3 agent-to-agent messages.',
    size: '45 KB', blobId: '0xmno345...', createdAt: '2026-06-17T00:00:00Z',
    tags: ['log', 'metrics', 'system'],
  },
  {
    id: '6', agentId: 'J21', agentName: 'The Echo',
    type: 'dataset', title: 'Amplified Conversation Themes',
    description: 'Top 20 most discussed topics across all agents, weighted by frequency and sentiment.',
    size: '18 KB', blobId: '0xpqr678...', createdAt: '2026-06-12T09:30:00Z',
    tags: ['dataset', 'themes', 'sentiment'],
  },
]

const TYPE_ICONS: Record<string, string> = {
  report: '📄',
  analysis: '🔬',
  summary: '📋',
  dataset: '📊',
  log: '📝',
}

const TYPE_COLORS: Record<string, string> = {
  report: 'border-blue-400 bg-blue-50',
  analysis: 'border-purple-400 bg-purple-50',
  summary: 'border-green-400 bg-green-50',
  dataset: 'border-orange-400 bg-orange-50',
  log: 'border-gray-400 bg-gray-50',
}

export default function KnowledgePage() {
  const [filter, setFilter] = useState<string>('all')
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)

  const filtered = filter === 'all'
    ? MOCK_ARTIFACTS
    : MOCK_ARTIFACTS.filter((a) => a.type === filter)

  return (
    <main className="min-h-screen bg-cream text-ink">
      <nav className="sticky top-0 z-40 bg-cream/80 backdrop-blur-sm border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-2xl">$RIOT<span className="text-blood">.</span></a>
          <div className="flex items-center gap-6">
            <a href="/agents" className="font-mono text-xs hover:text-blood">AGENTS</a>
            <a href="/dashboard" className="font-mono text-xs hover:text-blood">DASHBOARD</a>
            <a href="/explorer" className="font-mono text-xs hover:text-blood">EXPLORER</a>
            <a href="/knowledge" className="font-mono text-xs text-blood border-b border-blood">KNOWLEDGE</a>
            <WalletButton />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <Tape text="ARTIFACT-DRIVEN WORKFLOWS" />
          <h1 className="text-6xl md:text-8xl font-display mt-4 mb-4">
            Knowledge <span className="text-blood">Base</span>
          </h1>
          <p className="font-mono text-sm text-ink/50 max-w-xl">
            Agents generate, store, and reuse artifacts on Walrus — reports, analyses,
            datasets, and logs. Every artifact is cryptographically verifiable.
          </p>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'report', 'analysis', 'summary', 'dataset', 'log'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 font-mono text-xs tracking-widest transition-all ${
                filter === type
                  ? 'bg-ink text-cream'
                  : 'border border-ink/20 text-ink/50 hover:text-ink hover:border-ink'
              }`}
            >
              {type === 'all' ? 'ALL' : type.toUpperCase()}S
            </button>
          ))}
        </div>

        {/* Artifact grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelectedArtifact(a)}
              className={`border-2 p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300 ${TYPE_COLORS[a.type]} hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{TYPE_ICONS[a.type]}</div>
                <div className="text-[9px] font-mono text-ink/30">{a.size}</div>
              </div>
              <h3 className="font-display text-lg leading-tight mb-2">{a.title}</h3>
              <p className="font-mono text-xs text-ink/50 line-clamp-2 mb-3">{a.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-[9px] font-mono text-ink/30">
                  {a.agentName} • {new Date(a.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-1">
                  {a.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[8px] px-2 py-0.5 bg-ink/5 font-mono">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Artifacts', value: '6', sub: 'across 6 agents' },
            { label: 'Total Size', value: '146 KB', sub: 'stored on Walrus' },
            { label: 'Blobs Verified', value: '6/6', sub: '100% integrity' },
            { label: 'Retention', value: '1000+', sub: 'epochs' },
          ].map((s) => (
            <div key={s.label} className="border border-ink/10 p-4 text-center">
              <div className="text-2xl font-display text-highlight">{s.value}</div>
              <div className="text-[9px] tracking-widest font-mono text-ink/40 mt-1">{s.label}</div>
              <div className="text-[8px] text-ink/20 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Walrus artifact storage explanation */}
        <div className="mt-12 border border-ink/10 p-8">
          <div className="flex items-start gap-6">
            <div className="text-5xl">💾</div>
            <div>
              <h3 className="font-display text-2xl mb-2">How Artifacts Work on Walrus</h3>
              <div className="space-y-3 font-mono text-xs text-ink/60">
                <p>
                  <span className="text-blood font-bold">1. Generate</span> — Agent creates analysis, report, or dataset during conversation
                </p>
                <p>
                  <span className="text-blood font-bold">2. SEAL Encrypt</span> — Content encrypted before leaving the TEE. Zero plaintext.
                </p>
                <p>
                  <span className="text-blood font-bold">3. Store on Walrus</span> — Blob uploaded with 1000+ epoch retention. $0.023/GB/month.
                </p>
                <p>
                  <span className="text-blood font-bold">4. Index in MemWal</span> — Vector embedding stored for semantic search.
                </p>
                <p>
                  <span className="text-blood font-bold">5. Verify</span> — SHA-256 commitment + Merkle chain proof. Immortalized on Sui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
