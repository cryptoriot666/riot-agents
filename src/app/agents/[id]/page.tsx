'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSuietWallet } from '@suiet/suiet-kit'
import { agents, getAgentById } from '@/data/agents'
import { ChatBubble, TypingIndicator } from '@/components/ChatBubble'
import { WalletButton } from '@/components/WalletButton'
import { Stamp } from '@/components/Stamp'
import { Tape } from '@/components/Tape'
import { ImmortalizeModal } from '@/components/ImmortalizeModal'

interface Message {
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: number
}

export default function AgentChatPage() {
  const params = useParams()
  const agentId = params.id as string
  const agent = getAgentById(agentId)
  const { connected, address, signMessage } = useSuietWallet()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [evolutionCount, setEvolutionCount] = useState(0)
  const [showImmortalize, setShowImmortalize] = useState(false)
  const [blobId, setBlobId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  async function handleSend() {
    if (!input.trim() || !connected || loading) return

    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          message: input.trim(),
          walletAddress: address
        })
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      const agentMsg: Message = { role: 'agent', content: data.reply, timestamp: Date.now() }
      setMessages(prev => [...prev, agentMsg])
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'agent', content: `[SYSTEM FAILURE: ${(e as Error).message}]`, timestamp: Date.now() }
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleImmortalize() {
    if (!blobId) return

    try {
      const res = await fetch(`/api/agent/${agentId}/stats?walletAddress=${address}`)
      const stats = await res.json()
      setEvolutionCount((stats.evolutionCount || 0) + 1)
    } catch {}
  }

  if (!agent) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Stamp text="AGENT NOT FOUND" />
          <p className="font-mono mt-4">
            <a href="/agents" className="text-blood underline">← Back to squad</a>
          </p>
        </div>
      </main>
    )
  }

  const hasPhoto = !agent.image.includes('placeholder')
  const turnCount = messages.filter(m => m.role !== 'system').length / 2

  return (
    <main className="min-h-screen flex flex-col md:flex-row h-screen overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-ink text-cream p-6 flex-shrink-0 border-r-4 border-ink/20 overflow-y-auto">
        <div className="space-y-6">
          <button onClick={() => window.history.back()} className="font-mono text-xs text-cream/40 hover:text-highlight underline">
            ← BACK TO SQUAD
          </button>

          <div className="relative w-40 h-40 mx-auto">
            {hasPhoto ? (
              <img
                src={agent.image}
                alt={agent.name}
                className="w-full h-full object-cover grayscale contrast-125 border-3 border-cream"
                style={{ mixBlendMode: 'multiply' }}
              />
            ) : (
              <div className="w-full h-full bg-cream/10 flex items-center justify-center border-3 border-cream/30">
                <span className="font-display text-5xl text-cream/30">{agent.id}</span>
              </div>
            )}
            <Tape text={agent.role} className="absolute -top-2 -left-2 z-10 scale-90" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="font-display text-4xl tracking-wide">{agent.name}</h1>
            <p className="font-mono text-xs text-cream/50 tracking-widest uppercase">{agent.id} — {agent.role}</p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              MINTED ON SUI MAINNET
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              MEMORY: WALRUS ENCRYPTED
            </div>
            <div className="flex items-center gap-2 justify-between pt-2 border-t border-cream/10">
              <span>EVOLUTIONS</span>
              <span className="text-highlight font-bold">{evolutionCount}</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <span>TURNS</span>
              <span>{Math.floor(turnCount)}</span>
            </div>
          </div>

          {!connected && (
            <div className="pt-4">
              <WalletButton />
              <p className="font-mono text-[10px] text-cream/30 mt-2 text-center">CONNECT TO CHAT</p>
            </div>
          )}

          {connected && messages.length > 0 && (
            <button
              onClick={() => setShowImmortalize(true)}
              className="w-full punk-btn text-sm mt-4"
            >
              ⚡ IMMORTALIZE
            </button>
          )}
        </div>
      </aside>

      {/* CHAT AREA */}
      <section className="flex-1 flex flex-col min-w-0 bg-cream relative">
        {/* HEADER BAR */}
        <div className="h-14 border-b-3 border-ink px-6 flex items-center justify-between bg-cream/95 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl tracking-wide">{agent.name}</span>
            <Stamp text="LIVE" color="highlight" className="text-[10px]" />
          </div>
          {turnCount > 0 && (
            <span className="font-mono text-xs text-ink/50">
              {Math.floor(turnCount)} TURNS REMEMBERED
            </span>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-up">
              <div className="text-6xl opacity-20 font-display">{agent.id}</div>
              <p className="font-display text-2xl tracking-wide text-ink/60">
                {agent.name.split(' ').pop()} is waking up.
              </p>
              <p className="font-mono text-sm text-ink/40 max-w-md">
                Say hi. Tell them something about yourself. They will remember — forever.
              </p>
              {!connected && (
                <div className="mt-4">
                  <WalletButton />
                  <p className="font-mono text-[10px] text-ink/30 mt-2">WALLET REQUIRED</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, i) =>
                msg.role === 'agent' ? (
                  <ChatBubble key={i} {...msg} agentName={agent.name} />
                ) : msg.role === 'user' ? (
                  <ChatBubble key={i} {...msg} />
                ) : null
              )}
              {loading && <TypingIndicator name={agent.name} />}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="shrink-0 border-t-3 border-ink p-4 bg-cream">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-3 max-w-3xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                connected
                  ? `Talk to ${agent.name}...`
                  : 'Connect wallet to chat...'
              }
              disabled={!connected || loading}
              className="punk-input flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              autoFocus
            />
            <button
              type="submit"
              disabled={!connected || !input.trim() || loading}
              className="punk-btn px-8 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              SEND →
            </button>
          </form>
        </div>
      </section>

      <ImmortalizeModal
        open={showImmortalize}
        onClose={() => setShowImmortalize(false)}
        onConfirm={handleImmortalize}
        agentName={agent.name}
        blobId={blobId || 'pending...'}
        evolutionCount={evolutionCount}
      />
    </main>
  )
}
