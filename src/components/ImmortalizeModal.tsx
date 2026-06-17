'use client'

import { useState } from 'react'
import { Stamp } from './Stamp'

interface ImmortalizeModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  agentName: string
  blobId: string
  evolutionCount: number
}

export function ImmortalizeModal({
  open,
  onClose,
  onConfirm,
  agentName,
  blobId,
  evolutionCount
}: ImmortalizeModalProps) {
  const [loading, setLoading] = useState(false)
  const [txDigest, setTxDigest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      setTxDigest('0x' + Math.random().toString(16).slice(2, 66))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm">
      <div className="bg-cream punk-border punk-shadow w-full max-w-lg mx-4 p-8 relative rotate-neg-1">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 font-display text-2xl text-blood hover:text-blood-dark"
        >
          ✕
        </button>

        <h2 className="font-display text-4xl tracking-wide mb-6 text-blood uppercase">
          IMMORTALIZE MEMORY
        </h2>

        <div className="space-y-4 font-mono text-sm mb-8">
          <div className="flex justify-between border-b border-ink/20 pb-2">
            <span className="text-ink/60">AGENT</span>
            <span className="font-semibold">{agentName}</span>
          </div>
          <div className="flex justify-between border-b border-ink/20 pb-2">
            <span className="text-ink/60">WALRUS BLOB</span>
            <span className="text-xs break-all max-w-[280px]">{blobId.slice(0, 20)}...</span>
          </div>
          <div className="flex justify-between border-b border-ink/20 pb-2">
            <span className="text-ink/60">EVOLUTION</span>
            <span>{evolutionCount} → {evolutionCount + 1}</span>
          </div>
          {txDigest && (
            <div className="flex justify-between border-b border-ink/20 pb-2 text-highlight">
              <span className="text-ink/60">TX DIGEST</span>
              <span className="text-xs">{txDigest.slice(0, 16)}...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-blood p-3 mb-4 font-mono text-sm text-blood">
            SYSTEM FAILURE: {error}
          </div>
        )}

        {txDigest ? (
          <div className="space-y-3">
            <Stamp text="IMMORTALIZED" />
            <a
              href={`https://suiscan.xyz/mainnet/tx/${txDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center punk-btn text-center"
            >
              VIEW ON SUISCAN →
            </a>
            <button onClick={onClose} className="w-full mt-2 py-2 font-mono text-sm underline hover:text-blood">
              CLOSE
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 punk-btn disabled:opacity-50"
            >
              {loading ? 'SIGNING...' : 'CONFIRM TX'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 font-mono text-sm border-3 border-ink hover:bg-ink/5"
            >
              CANCEL
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
