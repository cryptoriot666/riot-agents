import { NextRequest, NextResponse } from 'next/server'
import { getAgentById } from '@/data/agents'
import { semanticRecall, recallAcrossAllAgents } from '@/lib/memory'

/**
 * Memory Recall API — Walrus Memory powered semantic search.
 *
 * Two modes:
 * 1. Per-agent recall — memories scoped to one agent
 * 2. Cross-agent recall — memories across ALL agents for a wallet
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const agent = getAgentById(agentId)
    if (!agent)
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const body = await req.json()
    const { query, walletAddress, topK, crossAgent } = body as {
      query?: string
      walletAddress?: string
      topK?: number
      crossAgent?: boolean
    }

    if (!query || !walletAddress) {
      return NextResponse.json(
        { error: 'query and walletAddress required' },
        { status: 400 }
      )
    }

    if (crossAgent) {
      const memories = await recallAcrossAllAgents(
        walletAddress,
        query,
        topK || 5
      )
      return NextResponse.json({ memories })
    }

    const memories = await semanticRecall(
      agentId,
      walletAddress,
      query,
      topK || 3
    )
    return NextResponse.json({ memories })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API /recall]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
