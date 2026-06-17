'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WalletButton } from '@/components/WalletButton'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'
import { Marquee } from '@/components/Marquee'
import { Halftone } from '@/components/Halftone'

const stats = [
  { value: '$17B→$1.5B', label: 'NFT MARKET CAP CRASH', struck: true },
  { value: '95%', label: 'OF NFTs ARE DEAD', struck: true },
  { value: '0', label: 'UTILITY FOR HOLDERS', struck: false }
]

export default function LandingPage() {
  const [heroLoaded, setHeroLoaded] = useState(false)

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Marquee>
        ★ SUI MAINNET ★ WALRUS STORAGE ★ AI AGENTS ★ IMMORTAL MEMORY ★ NO MORE DEAD NFTs ★
      </Marquee>

      <Halftone intensity={0.04} className="fixed inset-0 z-0" />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: TEXT */}
          <div className="space-y-8 z-10">
            <div className="overflow-hidden">
              <h1
                className="font-display text-[120px] sm:text-[180px] lg:text-[240px] leading-[0.85] tracking-tight"
                style={{ fontFamily: 'var(--font-bebas), Impact, sans-serif' }}
                onLoad={() => setHeroLoaded(true)}
              >
                $RIOT<span className="text-blood">.</span>
              </h1>
            </div>

            <p className="font-display text-xl md:text-2xl tracking-[0.25em] text-ink/80 uppercase">
              A RESURRECTION MACHINE FOR DEAD NFTs
            </p>

            <p className="font-mono text-base md:text-lg max-w-md leading-relaxed">
              Static JPEGs →{' '}
              <span className="marker-highlight font-semibold">Living agents.</span>{' '}
              Every NFT gets a soul. Every conversation is{' '}
              <span className="text-blood font-bold">immortalized on Walrus</span>.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <WalletButton />
              <Link href="/agents" className="punk-btn bg-ink text-cream hover:bg-ink/80">
                MEET THE AGENTS →
              </Link>
              <Link href="/demo" className="px-6 py-3 font-mono text-sm border-3 border-ink hover:bg-highlight/20 transition-colors">
                RUN DEMO
              </Link>
            </div>
          </div>

          {/* RIGHT: EVIDENCE PHOTO */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[320px] h-[400px] md:w-[380px] md:h-[480px] rotate-2">
              {/* Corner brackets */}
              <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-blood z-10" />
              <div className="absolute -top-3 -right-3 w-12 h-12 border-t-4 border-r-4 border-blood z-10" />
              <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-4 border-l-4 border-blood z-10" />
              <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-blood z-10" />

              <img
                src="/agents/J4.jpg"
                alt="J4 The Guide — evidence photo"
                className="w-full h-full object-cover grayscale contrast-125 border-4 border-ink"
                style={{ mixBlendMode: 'multiply' }}
              />

              <Tape text="EVIDENCE #004" className="absolute -top-2 left-4 z-20" />
              <Stamp text="PROOF" className="absolute bottom-8 -right-2 z-20 text-3xl" />
              <Stamp text="ALIVE" color="highlight" className="absolute top-12 -left-4 z-20 rotate-6" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 md:px-16 lg:px-24 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`punk-card p-6 md:p-8 ${i === 0 ? '-rotate-1' : i === 1 ? 'rotate-1' : '-rotate-2'}`}
            >
              <p className={`font-display text-4xl md:text-5xl ${stat.struck ? 'line-through text-ink/40' : 'text-blood'}`}>
                {stat.value}
              </p>
              <p className="font-mono text-xs tracking-widest uppercase mt-2 text-ink/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Tape text="BUILT ON SUI MAINNET + WALRUS" className="mx-auto" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink text-cream py-8 px-6 text-center font-mono text-xs tracking-widest">
        <p>$RIOT AGENT NFT PLATFORM — SUI OVERFLOW 2026</p>
        <p className="mt-2 text-ink/40">NOT FINANCIAL ADVICE. DYOR. STAY PUNK.</p>
      </footer>
    </main>
  )
}
