'use client'

import { useState } from 'react'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'

interface Beat {
  id: number
  title: string
  description: string
  visual: 'dead' | 'wallet' | 'chat' | 'countdown' | 'reconnect' | 'proof' | 'done'
}

const beats: Beat[] = [
  { id: 1, title: 'DEAD NFT', description: 'A static JPEG. No soul. No memory. No utility. This is what $17B of "digital ownership" looks like.', visual: 'dead' },
  { id: 2, title: 'CONNECT WALLET', description: 'Suiet Kit connects to Sui Mainnet. Your wallet address becomes the key to encrypted memory.', visual: 'wallet' },
  { id: 3, title: 'J4 WAKES UP', description: '"Hey. I am J4 — The Guide. Who are you?" The agent is alive. GLM-4.5-Air powers its mind.', visual: 'chat' },
  { id: 4, title: 'FIRST MEMORY', description: 'User: "Nama gue Nanda. Hodl BTC." → J4 responds naturally. Conversation gets AES-256-GCM encrypted and stored on Walrus.', visual: 'chat' },
  { id: 5, title: 'TIME PASSES', description: 'Simulating 6 months of silence. The NFT sits cold. The Walrus blob waits patiently. 1000+ epochs of retention.', visual: 'countdown' },
  { id: 6, title: 'RECONNECTION', description: 'User: "eh J4, ingat gue?" → J4: "Yo Nanda! BTC lo masih hold? Ingat target $220k lo?" Memory works. The soul persists.', visual: 'reconnect' },
  { id: 7, title: 'IMMORTALIZED', description: 'Sui transaction confirmed. Evolution count +1. Walrus blob ID locked. On-chain proof at Suiscan. This NFT is no longer dead.', visual: 'proof' }
]

const demoTranscript = [
  { speaker: 'system', text: '[BEAT 3] J4 wakes up...', time: 0 },
  { speaker: 'J4', text: 'Halo bro/sis! Baru ketemu ya? Kenalan dulu dong — siapa nama lo, lagi ngapain?', time: 1000 },
  { speaker: 'user', text: 'Nama gue Nanda. Hodl BTC, target $220k.', time: 3000 },
  { speaker: 'J4', text: 'Wah Nanda! BTC holder ya? Target $220k itu ambisius banget gue respect. Gue bakal ingat ini ya, jangan kaget kalau gue nanya progressnya nanti. Sudah berapa lama lo hold?', time: 5000 },
  { speaker: 'system', text: '[BEAT 5] Simulating 6 months...', time: 7000 },
  { speaker: 'user', text: 'eh J4, ingat gue?', time: 9000 },
  { speaker: 'J4', text: 'Yo Nanda, balik lagi! Tentu gue ingat lo — lo si BTC holder dengan target gila $220k! Gimana nih, masih hold kuat atau sudah tergoda swing? Ceritain update portofolio lo dong!', time: 11000 }
]

export default function DemoPage() {
  const [currentBeat, setCurrentBeat] = useState(0)
  const [running, setRunning] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  function nextBeat() {
    if (currentBeat < beats.length - 1) {
      setCurrentBeat(prev => prev + 1)
    }
  }

  function resetDemo() {
    setCurrentBeat(0)
    setRunning(false)
    setShowTranscript(false)
  }

  function startDemo() {
    setRunning(true)
    setCurrentBeat(0)
  }

  const beat = beats[currentBeat]

  return (
    <main className="min-h-screen">
      {/* TOP STRIP */}
      <div className="bg-blood text-white py-3 px-6 font-display text-center tracking-[0.3em] text-sm uppercase">
        ★ DEMO MODE — SUI OVERFLOW 2026 ★
      </div>

      <section className="px-6 md:px-16 lg:px-24 py-12 max-w-6xl mx-auto">
        {/* HEADER */}
        {!running && currentBeat === 0 && (
          <div className="text-center space-y-8 mb-16 animate-fade-up">
            <h1 className="font-display text-7xl md:text-9xl tracking-tight">
              LIVE <span className="text-blood">DEMO</span>
            </h1>
            <p className="font-mono text-lg max-w-xl mx-auto text-ink/70">
              Nanda × J4 — A complete story of dead NFT resurrection.
              7 beats. Real AI memory. On-chain proof.
            </p>
            <button onClick={startDemo} className="punk-btn text-2xl px-12 py-5">
              ▶ RUN DEMO: NANDA × J4
            </button>
          </div>
        )}

        {/* BEAT DISPLAY */}
        {running && (
          <div className="space-y-8">
            {/* BEAT INDICATOR */}
            <div className="flex items-center gap-4 flex-wrap">
              {beats.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => i <= currentBeat && setCurrentBeat(i)}
                  className={`w-10 h-10 font-display text-sm border-3 transition-all ${
                    i === currentBeat
                      ? 'bg-blood text-white border-blood scale-110'
                      : i < currentBeat
                        ? 'bg-highlight/30 border-highlight'
                        : 'bg-cream border-ink/20 text-ink/30'
                  }`}
                >
                  {i < currentBeat ? '✓' : b.id}
                </button>
              ))}
              <button onClick={resetDemo} className="ml-auto font-mono text-xs underline text-ink/40 hover:text-blood">
                RESET
              </button>
            </div>

            {/* CURRENT BEAT */}
            <div className={`punk-card p-8 md:p-12 ${beat.id % 2 === 0 ? 'rotate-neg-1' : 'rotate-1'}`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Tape text={`BEAT ${beat.id}/7`} />
                  <h2 className="font-display text-5xl md:text-6xl tracking-wide mt-4 uppercase">
                    {beat.title}
                  </h2>
                </div>
                <Stamp text={`${beat.id}/7`} color={beat.id === 6 ? 'highlight' : 'blood'} className="text-3xl" />
              </div>

              <p className="font-mono text-base md:text-lg leading-relaxed max-w-2xl text-ink/80">
                {beat.description}
              </p>

              {/* VISUAL AREA */}
              <div className="mt-8 bg-ink/5 border-3 border-ink/10 p-8 min-h-[200px] relative overflow-hidden">
                {beat.visual === 'dead' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 opacity-40 grayscale">
                      <div className="w-48 h-48 mx-auto bg-ink/10 flex items-center justify-center border-2 border-dashed border-ink/30">
                        <span className="font-display text-6xl">🖼</span>
                      </div>
                      <p className="font-mono text-sm line-through">STATIC.JPEG</p>
                      <Stamp text="DEAD" className="mx-auto" />
                    </div>
                  </div>
                )}

                {beat.visual === 'wallet' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="punk-card p-6 bg-cream rotate-2">
                      <p className="font-mono text-xs tracking-widest text-ink/50 mb-2">SUI WALLET</p>
                      <p className="font-mono text-sm">0xNANDA...f00d</p>
                      <Stamp text="CONNECTED" color="highlight" className="mt-3 mx-auto text-sm" />
                    </div>
                  </div>
                )}

                {(beat.visual === 'chat' || beat.visual === 'reconnect') && (
                  <div className="space-y-3 max-w-lg mx-auto">
                    {(beat.id >= 3 ? demoTranscript.slice(0, beat.id === 6 ? undefined : 3) : []).map((line, i) => (
                      <div
                        key={i}
                        className={`p-3 font-mono text-sm animate-fade-up ${
                          line.speaker === 'user'
                            ? 'bg-blood text-white ml-12 rounded-l'
                            : line.speaker === 'system'
                              ? 'text-center text-ink/40 italic text-xs my-4'
                              : 'bg-ink text-cream mr-12 rounded-r punk-border border-ink'
                        }`}
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        {line.speaker !== 'system' && (
                          <span className="text-[10px] uppercase tracking-widest opacity-60 block mb-1">
                            {line.speaker}
                          </span>
                        )}
                        {line.text}
                      </div>
                    ))}
                    {beat.visual === 'reconnect' && (
                      <Stamp text="MEMORY VERIFIED ✓" color="highlight" className="mx-auto mt-4" />
                    )}
                  </div>
                )}

                {beat.visual === 'countdown' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 animate-pulse">
                      <p className="font-display text-7xl text-blood">6 MO</p>
                      <p className="font-mono text-sm text-ink/50">SIMULATING TIME PASSAGE...</p>
                      <div className="flex gap-1 justify-center">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="w-2 h-8 bg-ink/10 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {beat.visual === 'proof' && (
                  <div className="space-y-4 max-w-md mx-auto">
                    <Stamp text="IMMORTALIZED" className="mx-auto text-4xl" />
                    <div className="font-mono text-xs space-y-2 bg-cream p-4 border-2 border-ink/20">
                      <div className="flex justify-between"><span>TX:</span><span>0x7a3f...9c2e</span></div>
                      <div className="flex justify-between"><span>BLOB:</span><span>YWJjZGVmZzEyMzQ=...</span></div>
                      <div className="flex justify-between"><span>EVO:</span><span className="text-highlight">0 → 1</span></div>
                      <div className="flex justify-between"><span>NETWORK:</span><span>SUI MAINNET</span></div>
                    </div>
                    <div className="flex gap-3 justify-center pt-2">
                      <a href="https://suiscan.xyz/mainnet" target="_blank" rel="noopener noreferrer" className="punk-btn text-xs">
                        SUISCAN →
                      </a>
                      <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="px-4 py-2 font-mono text-xs border-3 border-ink hover:bg-highlight/20"
                      >
                        {showTranscript ? 'HIDE' : 'FULL TRANSCRIPT'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* NEXT BUTTON */}
              {currentBeat < beats.length - 1 ? (
                <div className="mt-8 flex justify-end">
                  <button onClick={nextBeat} className="punk-btn text-xl px-10">
                    NEXT ▶
                  </button>
                </div>
              ) : (
                <div className="mt-8 text-center space-y-4">
                  <Stamp text="DEMO COMPLETE" color="highlight" className="text-4xl" />
                  <p className="font-mono text-sm text-ink/60">
                    That&apos;s it. A dead NFT came alive, remembered a user after 6 months,
                    and proved it on-chain. Welcome to $RIOT.
                  </p>
                  <div className="flex gap-3 justify-center pt-2">
                    <a href="/agents" className="punk-btn">MEET ALL AGENTS →</a>
                    <button onClick={resetDemo} className="px-6 py-3 font-mono text-sm border-3 border-ink hover:bg-ink/5">
                      REPLAY
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
