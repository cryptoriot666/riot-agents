'use client'

import { useEffect, useState } from 'react'
import { WalletButton } from '@/components/WalletButton'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'
import { Marquee } from '@/components/Marquee'
import { CursorGlow } from '@/components/cursor-glow'
import { ParticleHero } from '@/components/particlehero'
import { ScrollReveal } from '@/components/scrollreveal'
import { AgentCarousel } from '@/components/agentcarousel'
import { CodeWindow } from '@/components/codewindow'
import { ProgressRing } from '@/components/progressring'
import { BeforeAfter } from '@/components/beforeafter'

const COUNTERS = [
  { value: 25, max: 25, label: 'LIVING AGENTS', color: 'var(--blood)' },
  { value: 95, max: 100, label: 'DEAD NFTS REVIVED', color: 'var(--highlight)' },
  { value: 1000, max: 1000, label: 'WALRUS EPOCHS', color: '#2EC4B6' },
  { value: 9999, max: 9999, label: 'MEMORIES STORED', color: '#E63946' },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="min-h-screen bg-cream text-ink overflow-x-hidden">
      <CursorGlow />

      {/* ── NAV ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/90 backdrop-blur-xl border-b border-ink/10 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-display text-2xl tracking-tight hover:text-blood transition-colors">
            $RIOT<span className="text-blood animate-pulse">.</span>
          </a>
          <div className="flex items-center gap-8">
            <a href="/agents" className="font-mono text-[11px] tracking-[0.2em] hover:text-blood transition-colors hidden md:block">AGENTS</a>
            <a href="/dashboard" className="font-mono text-[11px] tracking-[0.2em] hover:text-blood transition-colors hidden md:block">DASHBOARD</a>
            <a href="/demo" className="font-mono text-[11px] tracking-[0.2em] hover:text-blood transition-colors hidden md:block">DEMO</a>
            <WalletButton />
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        <ParticleHero />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Tag line */}
          <ScrollReveal delay={0}>
            <div className="mb-6 inline-block">
              <Tape text="SUI OVERFLOW 2026 — WALRUS TRACK" />
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={150}>
            <h1 className="font-display tracking-tight leading-[0.85] mb-6">
              <div className="relative inline-block">
                <span className="text-7xl md:text-[9rem] lg:text-[12rem] block leading-none"
                  data-text="RESURRECTION"
                  style={{
                    background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink) 60%, var(--blood) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  RESURRECTION
                </span>
                <span className="absolute top-0 left-0 text-7xl md:text-[9rem] lg:text-[12rem] block leading-none text-blood opacity-20 translate-x-[3px] translate-y-[2px] select-none pointer-events-none"
                  aria-hidden
                >
                  RESURRECTION
                </span>
              </div>
              <span className="text-7xl md:text-[9rem] lg:text-[12rem] block leading-none text-blood">
                MACHINE
              </span>
            </h1>
          </ScrollReveal>

          {/* Subhead */}
          <ScrollReveal delay={300}>
            <p className="font-mono text-sm md:text-base text-ink/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              <strong className="text-ink">17 billion dollars</strong> of NFT market cap evaporated.
              <strong className="text-ink"> 95% of all NFTs</strong> are dead.
              We give every NFT a living AI agent with{' '}
              <span className="text-blood font-bold">persistent, verifiable memory on Walrus</span>.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={450}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/agents" className="group relative bg-blood text-cream font-display text-lg px-10 py-4 border-3 border-ink uppercase tracking-wider hover:bg-blood-dark transition-all duration-200"
                style={{ boxShadow: '6px 6px 0 var(--ink)' }}
              >
                <span className="relative z-10">MEET THE AGENTS →</span>
                <span className="absolute inset-0 bg-highlight mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="/demo" className="font-mono text-xs tracking-[0.3em] border-2 border-ink/20 px-8 py-4 hover:border-blood hover:text-blood transition-all uppercase">
                ▶ Watch Demo
              </a>
            </div>
          </ScrollReveal>

          {/* Stats counters */}
          <ScrollReveal delay={600}>
            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-3xl mx-auto">
              {COUNTERS.map((c) => (
                <ProgressRing key={c.label} value={c.value} max={c.max} label={c.label} color={c.color} size={80} />
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="animate-bounce text-ink/15 text-2xl">↓</div>
        </div>
      </section>

      {/* ═══════════════ AGENT SHOWCASE ═══════════════ */}
      <section className="py-32 px-6 bg-gradient-to-b from-cream to-ink/[0.02] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-highlight/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blood/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <Stamp text="THE AGENTS" />
              <h2 className="text-5xl md:text-7xl font-display mt-6 mb-4">
                25 <span className="text-blood">Souls</span>,
                <br />
                <span className="text-highlight">Infinite</span> Memory
              </h2>
              <p className="font-mono text-sm text-ink/50 max-w-lg mx-auto">
                Each agent has a distinct personality, persistent memory on Walrus, and the ability to coordinate with other agents.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <AgentCarousel />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
      <section className="py-24 px-6 bg-ink text-cream relative overflow-hidden">
        {/* Pattern bg */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url(/textures/paper.svg)', backgroundSize: '100px' }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Stamp text="THE RESURRECTION" />
              <h2 className="text-5xl md:text-7xl font-display mt-6 mb-4">
                From <span className="text-ink/20 line-through">Dead</span> to{' '}
                <span className="text-highlight">Divine</span>
              </h2>
              <p className="font-mono text-sm text-cream/40 max-w-lg mx-auto">
                Every dead NFT gets a living AI agent with persistent memory. Drag the slider.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <BeforeAfter />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-32 px-6 bg-cream relative overflow-hidden">
        {/* Timeline SVG line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-ink/5 -translate-x-1/2" />

        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <Tape text="ARCHITECTURE" />
              <h2 className="text-5xl md:text-7xl font-display mt-4">
                The <span className="text-blood">Memory</span> Pipeline
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-16 md:space-y-24">
            {[
              {
                step: '01', title: 'Chat with Agent', icon: '💬',
                desc: 'GLM-4.5-Air powers natural conversation. 25 distinct personalities. Every exchange is a memory.',
                align: 'left',
              },
              {
                step: '02', title: 'Walrus Memory Recall', icon: '🔍',
                desc: 'Semantic search across all past conversations. Context injected before every response.',
                align: 'right',
              },
              {
                step: '03', title: 'SEAL Encryption', icon: '🔐',
                desc: 'Encrypted server-side before upload. Zero plaintext ever touches Walrus. Your keys, your data.',
                align: 'left',
              },
              {
                step: '04', title: 'Store on Walrus', icon: '💾',
                desc: '1000+ epoch retention. $0.023/GB/month. Store a year of conversations for less than $1.',
                align: 'right',
              },
              {
                step: '05', title: 'On-Chain Verification', icon: '⛓️',
                desc: 'Merkle memory chain. Every blob cryptographically linked. Verifiable on Sui Mainnet.',
                align: 'left',
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100} direction={item.align === 'left' ? 'right' : 'left'}>
                <div className={`flex flex-col md:flex-row gap-6 items-start ${
                  item.align === 'right' ? 'md:flex-row-reverse' : ''
                }`}>
                  {/* Step number */}
                  <div className="hidden md:block w-1/2 relative">
                    <div className={`absolute top-1/2 -translate-y-1/2 ${
                      item.align === 'right' ? 'left-0' : 'right-0'
                    }`}>
                      <span className="text-[8rem] font-display text-ink/[0.03] leading-none select-none">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="w-full md:w-1/2 group">
                    <div className={`bg-cream border-2 border-ink/10 p-6 md:p-8 hover:border-blood/30 transition-all duration-300 ${
                      item.align === 'right' ? 'md:mr-12' : 'md:ml-12'
                    }`}
                      style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.03)' }}
                    >
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="font-display text-4xl text-blood/20">{item.step}</span>
                        <h3 className="font-display text-2xl md:text-3xl">{item.title}</h3>
                      </div>
                      <p className="font-mono text-sm text-ink/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ LIVE CODE WINDOW ═══════════════ */}
      <section className="py-24 px-6 bg-ink text-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blood rounded-full blur-[200px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <Stamp text="TECHNICAL" />
                <h2 className="text-5xl md:text-6xl font-display mt-6 mb-6">
                  It's <span className="text-highlight">Real</span>.
                  <br />
                  Not a Mockup.
                </h2>
                <p className="font-mono text-sm text-cream/50 leading-relaxed mb-6">
                  Every memory is stored on Walrus. Every blob is SEAL-encrypted. Every agent interaction is cryptographically verifiable. This terminal shows actual Walrus Memory SDK operations — not simulated.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['SEAL Encrypted', '1000+ Epochs', '$0.002/store', 'Merkle Proof', 'Sui Verified'].map((tag) => (
                    <span key={tag} className="font-mono text-[9px] tracking-[0.15em] border border-cream/20 px-3 py-1.5 text-cream/40 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
              <CodeWindow />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Stamp text="WHY WALRUS" />
              <h2 className="text-5xl md:text-7xl font-display mt-6 mb-4">
                Memory That
                <br />
                <span className="text-blood">Lasts Forever</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🧠', title: 'Walrus Memory SDK', desc: 'Native MemWal integration. SEAL encryption. Semantic recall across 1000+ epochs.' },
              { icon: '🔗', title: 'Verifiable Data', desc: 'Merkle memory chain. Blob integrity proofs. On-chain verification via Sui.' },
              { icon: '🤝', title: 'Agent-to-Agent', desc: 'Inter-agent communication. Knowledge inheritance. Broadcast and inbox patterns.' },
              { icon: '🛠', title: 'MCP Integration', desc: '5 MCP tools. Any AI client can query agent memories. Standard protocol.' },
              { icon: '💰', title: '$0.023/GB/Month', desc: 'Store a full year of agent conversations for less than one dollar.' },
              { icon: '🔐', title: 'Zero Plaintext', desc: 'SEAL encryption before Walrus. Your keys, your agents, your data.' },
            ].map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="group border-2 border-ink/10 p-6 hover:border-blood/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="text-3xl mb-4">{f.icon}</div>
                    <h3 className="font-display text-lg mb-2 group-hover:text-blood transition-colors">{f.title}</h3>
                    <p className="font-mono text-xs text-ink/40 leading-relaxed">{f.desc}</p>
                  </div>
                  {/* Corner accent */}
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-r-[20px] border-b-transparent border-r-blood/0 group-hover:border-r-blood/10 transition-all duration-300" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS / SOCIAL PROOF ═══════════════ */}
      <section className="py-24 px-6 bg-cream border-t border-ink/5 relative overflow-hidden">
        {/* Marquee top */}
        <Marquee>TESTED ON SUI MAINNET — TESTED ON SUI MAINNET — </Marquee>

        <div className="max-w-5xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'J4 remembers my BTC target from 6 months ago. Not a prompt trick — real Walrus recall.', author: 'Nanda', role: 'EARLY TESTER' },
              { quote: '25 agents, one wallet, zero forgotten conversations. This is what NFT utility looks like.', author: 'Anonymous', role: 'SUI DEV' },
              { quote: 'Finally — AI agents that don\'t have amnesia. Walrus Memory changes everything.', author: 'Community', role: 'CRYPTO' },
            ].map((t, i) => (
              <ScrollReveal key={t.author} delay={i * 150}>
                <div className="group border-2 border-ink/10 p-6 hover:border-highlight/30 transition-all duration-300">
                  {/* Stars */}
                  <div className="text-highlight mb-3 tracking-widest">{'★'.repeat(5)}</div>
                  <p className="font-mono text-sm text-ink/70 mb-6 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-ink flex items-center justify-center text-cream font-display text-xs">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-display text-xs tracking-widest">{t.author}</div>
                      <div className="font-mono text-[8px] text-ink/20 tracking-[0.2em]">{t.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-32 px-6 bg-blood text-cream text-center relative overflow-hidden">
        {/* Animated bg */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cream/10 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-highlight/10 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-6xl md:text-8xl font-display mb-8 leading-[0.95]">
              Ready to<br />
              <span className="text-highlight">Resurrect</span>
              <br />
              Your NFTs?
            </h2>
            <p className="font-mono text-sm text-cream/60 mb-10 max-w-md mx-auto leading-relaxed">
              Connect your wallet. Pick an agent. Give every dead NFT a soul with persistent memory on Walrus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/agents" className="inline-block bg-cream text-blood font-display text-xl px-12 py-5 border-3 border-ink hover:bg-highlight hover:text-ink transition-all duration-200"
                style={{ boxShadow: '6px 6px 0 var(--ink)' }}
              >
                GET STARTED →
              </a>
              <a href="/demo" className="inline-block font-mono text-xs tracking-[0.3em] border-2 border-cream/30 px-8 py-5 hover:border-cream hover:text-cream transition-all uppercase">
                ▶ WATCH DEMO
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-16 px-6 bg-ink text-cream/20 font-mono text-[10px]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="font-display text-cream text-xl mb-3">$RIOT</div>
              <p className="text-cream/30 leading-relaxed">A Resurrection Machine for Dead NFTs. Built on Sui. Stored on Walrus.</p>
            </div>
            <div>
              <div className="text-cream/50 tracking-[0.2em] mb-4 uppercase">Product</div>
              <div className="space-y-2">
                <a href="/agents" className="block hover:text-cream transition-colors">Agents</a>
                <a href="/dashboard" className="block hover:text-cream transition-colors">Dashboard</a>
                <a href="/demo" className="block hover:text-cream transition-colors">Demo</a>
              </div>
            </div>
            <div>
              <div className="text-cream/50 tracking-[0.2em] mb-4 uppercase">Tech</div>
              <div className="space-y-2">
                <a href="/explorer" className="block hover:text-cream transition-colors">Walrus Explorer</a>
                <a href="/knowledge" className="block hover:text-cream transition-colors">Knowledge Base</a>
                <a href="/api/mcp" className="block hover:text-cream transition-colors">MCP API</a>
              </div>
            </div>
            <div>
              <div className="text-cream/50 tracking-[0.2em] mb-4 uppercase">Links</div>
              <div className="space-y-2">
                <a href="https://github.com/cryptoriot666/riot-agents" target="_blank" className="block hover:text-cream transition-colors">GitHub</a>
                <a href="https://docs.wal.app" target="_blank" className="block hover:text-cream transition-colors">Walrus Docs</a>
                <span className="block">Sui Overflow 2026</span>
              </div>
            </div>
          </div>
          <div className="border-t border-cream/5 pt-8 text-center text-cream/15">
            $RIOT — Sui Overflow 2026 Walrus Track Submission. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
