'use client'

import { useState, useEffect, useRef } from 'react'
import { WalletButton } from '@/components/WalletButton'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'
import { Marquee } from '@/components/Marquee'
import { Halftone } from '@/components/Halftone'
import { agents } from '@/data/agents'

const STATS = [
  { label: 'AGENTS', value: '25', suffix: '' },
  { label: 'DEAD NFTS RESURRECTED', value: '95', suffix: '%' },
  { label: 'WALRUS EPOCHS', value: '1000', suffix: '+' },
  { label: 'MEMORIES STORED', value: '∞', suffix: '' },
]

const FEATURES = [
  {
    icon: '🧠',
    title: 'Walrus Memory',
    desc: 'SEAL-encrypted persistent memory. Agents remember forever.',
  },
  {
    icon: '🔗',
    title: 'Verifiable Data',
    desc: 'Cryptographic proof every memory exists on-chain.',
  },
  {
    icon: '🤝',
    title: 'Multi-Agent',
    desc: 'Agents communicate, coordinate, inherit knowledge.',
  },
  {
    icon: '🛠',
    title: 'MCP Integration',
    desc: 'Any AI tool can query agent memories via MCP.',
  },
  {
    icon: '💰',
    title: '$0.023/GB/month',
    desc: 'Store a year of conversations for less than $1.',
  },
  {
    icon: '🔐',
    title: 'Zero Plaintext',
    desc: 'SEAL encryption before Walrus. We never see your data.',
  },
]

const TESTIMONIALS = [
  { text: 'J4 remembers my BTC target from 6 months ago. Not a prompt trick — real Walrus recall.', author: 'Nanda' },
  { text: '25 agents, one wallet, zero forgotten conversations. This is what NFT utility looks like.', author: 'Early Tester' },
  { text: 'Finally — AI agents that don\'t have amnesia. Walrus Memory changes everything.', author: 'Dev Community' },
]

function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 z-0 text-blood opacity-30 animate-pulse" style={{ clipPath: 'inset(40% 0 30% 0)' }}>
        {text}
      </span>
      <span className="absolute top-0 left-0 z-0 text-highlight opacity-20" style={{ clipPath: 'inset(70% 0 10% 0)' }}>
        {text}
      </span>
    </span>
  )
}

function LiveStat({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const targetValue = value === '∞' ? 9999 : parseInt(value)

  useEffect(() => {
    if (value === '∞') {
      setDisplayValue(9999)
      return
    }
    const duration = 1500
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(eased * targetValue))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [targetValue, value])

  return (
    <div className="text-center group hover:scale-110 transition-transform duration-300">
      <div className="text-4xl md:text-5xl font-display font-bold text-highlight mb-1">
        {value === '∞' ? '∞' : displayValue}{suffix}
      </div>
      <div className="text-[10px] tracking-[0.2em] text-ink/40 font-mono">{label}</div>
    </div>
  )
}

function AgentPreview({ agent, index }: { agent: typeof agents[0]; index: number }) {
  const [flipped, setFlipped] = useState(false)
  const rotation = (index % 5 - 2) * 1.5

  return (
    <div
      className="relative cursor-pointer group"
      style={{ transform: `rotate(${rotation}deg)` }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div className={`transition-all duration-500 ${flipped ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-ink/20 bg-cream overflow-hidden">
          <div className="w-full h-full bg-ink/5 flex items-center justify-center text-3xl font-display text-ink/20">
            {agent.id}
          </div>
        </div>
        <div className="mt-1 text-[8px] text-center font-mono text-ink/30 truncate w-20 md:w-24">
          {agent.name}
        </div>
      </div>
      <div className={`absolute inset-0 transition-all duration-500 flex items-center justify-center ${flipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="w-20 h-20 md:w-24 md:h-24 bg-ink text-cream p-2 flex flex-col justify-center items-center">
          <div className="text-[8px] font-bold tracking-widest text-blood">{agent.role.toUpperCase()}</div>
          <div className="text-[7px] mt-1 leading-tight text-center opacity-60">{agent.personality_prompt.slice(0, 40)}...</div>
        </div>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Halftone />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="min-h-screen bg-cream text-ink overflow-x-hidden">
      {/* Paper grain */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" style={{
        backgroundImage: 'url(/textures/paper.svg)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px',
      }} />

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-40 bg-cream/80 backdrop-blur-sm border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-2xl tracking-tight hover:text-blood transition-colors">
            $RIOT<span className="text-blood">.</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/agents" className="font-mono text-xs tracking-widest hover:text-blood transition-colors">AGENTS</a>
            <a href="/dashboard" className="font-mono text-xs tracking-widest hover:text-blood transition-colors">DASHBOARD</a>
            <a href="/demo" className="font-mono text-xs tracking-widest hover:text-blood transition-colors">DEMO</a>
            <WalletButton />
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blood/5 rounded-full blur-[120px]" />
        
        <div className="relative z-10 text-center max-w-4xl">
          <div className="mb-6">
            <Tape text="SUI OVERFLOW 2026 — WALRUS TRACK" />
          </div>

          <h1 className="text-7xl md:text-[10rem] font-display leading-[0.85] tracking-tight mb-6">
            <GlitchText text="RESURRECTION" className="block" />
            <span className="block text-blood">MACHINE</span>
          </h1>

          <p className="font-mono text-sm md:text-base text-ink/50 max-w-xl mx-auto mb-8 leading-relaxed">
            17 billion dollars of NFT market cap evaporated. 95% of all NFTs are dead.
            We give every NFT a living AI agent with <span className="text-blood">persistent, verifiable memory on Walrus</span>.
          </p>

          <div className="flex gap-4 justify-center">
            <a href="/agents" className="punk-btn text-lg px-8 py-3">
              MEET THE AGENTS →
            </a>
            <a href="/demo" className="font-mono text-xs border-2 border-ink/20 px-6 py-3 hover:border-blood hover:text-blood transition-all tracking-widest">
              WATCH DEMO
            </a>
          </div>

          {/* Live stats bar */}
          <div className="mt-20 grid grid-cols-4 gap-8 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <LiveStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {/* Agent preview grid */}
        <div className="relative z-10 mt-16 flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl opacity-60 hover:opacity-100 transition-opacity duration-700">
          {agents.slice(0, 10).map((agent, i) => (
            <AgentPreview key={agent.id} agent={agent} index={i} />
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-ink/20 text-2xl">↓</div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-ink text-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Halftone />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Stamp text="WHY WALRUS" />
            <h2 className="text-5xl md:text-7xl font-display mt-6 mb-4">
              Memory That <span className="text-highlight">Lasts Forever</span>
            </h2>
            <p className="font-mono text-sm text-cream/50 max-w-lg mx-auto">
              Powered by Walrus — the verifiable data platform for high-stakes AI systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="border border-cream/10 p-6 hover:border-highlight/50 transition-all group">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display text-xl mb-2 group-hover:text-highlight transition-colors">{f.title}</h3>
                <p className="font-mono text-xs text-cream/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Tape text="ARCHITECTURE" />
            <h2 className="text-5xl md:text-7xl font-display mt-4">
              The <span className="text-blood">Memory</span> Pipeline
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'User Chats with Agent', desc: 'GLM-4.5-Air powers the conversation. 25 unique personalities.', icon: '💬' },
              { step: '02', title: 'Walrus Memory Recall', desc: 'Semantic search retrieves past conversations. Context injected naturally.', icon: '🔍' },
              { step: '03', title: 'SEAL Encryption', desc: 'Conversation encrypted server-side. Zero plaintext touches our infrastructure.', icon: '🔐' },
              { step: '04', title: 'Store on Walrus', desc: 'Encrypted blob stored with 1000+ epoch retention. $0.023/GB/month.', icon: '💾' },
              { step: '05', title: 'On-Chain Verification', desc: 'Merkle memory chain. Cryptographic proof. Immortalized on Sui.', icon: '⛓️' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-start gap-6 group">
                <div className="text-5xl font-display text-ink/10 group-hover:text-blood transition-colors shrink-0">
                  {item.step}
                </div>
                <div className="pt-3">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <h3 className="font-display text-xl mb-1">{item.title}</h3>
                  <p className="font-mono text-xs text-ink/50">{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block flex-1 h-px bg-ink/10 self-center mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-24 px-6 bg-cream border-t border-ink/10">
        <div className="max-w-4xl mx-auto">
          <Marquee>WHAT PEOPLE ARE SAYING — WHAT PEOPLE ARE SAYING — </Marquee>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="border border-ink/10 p-6 hover:border-blood/30 transition-all">
                <p className="font-mono text-sm text-ink/70 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="font-display text-xs tracking-widest text-blood">— {t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-blood text-cream text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cream rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cream rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-display mb-6">
            Ready to <span className="text-highlight">Resurrect</span> Your NFTs?
          </h2>
          <p className="font-mono text-sm text-cream/70 mb-8">
            Connect your wallet. Pick an agent. Give your NFT a soul.
          </p>
          <a href="/agents" className="inline-block bg-cream text-blood font-display text-xl px-12 py-4 hover:bg-highlight hover:text-ink transition-all">
            GET STARTED
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 bg-ink text-cream/30 font-mono text-xs text-center">
        <p>$RIOT — Built on Sui Mainnet. Stored on Walrus. Powered by GLM-4.5-Air.</p>
        <p className="mt-2">
          <a href="https://github.com/cryptoriot666/riot-agents" className="hover:text-cream transition-colors">GitHub</a>
          {' • '}
          <a href="https://docs.wal.app" className="hover:text-cream transition-colors">Walrus Docs</a>
          {' • '}
          Sui Overflow 2026
        </p>
      </footer>
    </main>
  )
}
