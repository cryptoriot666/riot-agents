import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/glm'
import { indexConversation } from '@/lib/memory'

/**
 * Chat API — Walrus Memory Powered
 *
 * Flow:
 * 1. Chat with agent → GLM-4.5-Air generates reply
 * 2. Memory recall — Walrus Memory SDK injects past conversations into context
 * 3. Indexing — each turn persisted to Walrus Memory (SEAL encrypted)
 * 4. Legacy fallback — blob-based Walrus storage with wallet-derived keys
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agentId, message, walletAddress, encryptionKey } = body as {
      agentId: string
      message: string
      walletAddress?: string
      encryptionKey?: string
    }

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'agentId and message required' },
        { status: 400 }
      )
    }

    const wallet = walletAddress || 'anonymous'
    const result = await chat(agentId, message, wallet, {
      encryptionKey,
      onStore: (_blobId) => {
        // Legacy callback — Walrus Memory handles persistence internally
      },
    })

    // Also index via memory.ts for dual-backend coverage
    try {
      await indexConversation(agentId, wallet, [
        { role: 'user', content: message },
        { role: 'assistant', content: result.reply },
      ])
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({
      reply: result.reply,
      tokenUsage: result.tokenUsage,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API /chat]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
