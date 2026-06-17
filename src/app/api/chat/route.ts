import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/glm'

const activeSessions = new Map<string, { blobId: string; encryptionKey: string }>()

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
      return NextResponse.json({ error: 'agentId and message required' }, { status: 400 })
    }

    const sessionKey = `${agentId}:${walletAddress || 'anon'}`
    const session = activeSessions.get(sessionKey)

    const result = await chat(agentId, message, walletAddress || 'anonymous', {
      blobId: session?.blobId,
      encryptionKey: session?.encryptionKey || encryptionKey,
      onStore: (blobId) => {
        if (encryptionKey && walletAddress) {
          activeSessions.set(sessionKey, { blobId, encryptionKey })
        }
      }
    })

    return NextResponse.json({
      reply: result.reply,
      tokenUsage: result.tokenUsage
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API /chat]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
