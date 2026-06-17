import { NextResponse } from 'next/server'
import { getAgentById, agents } from '@/data/agents'
import {
  calculateStorageCost,
  estimateConversationCost,
  aggregateWalletCosts,
  type CostBreakdown,
} from '@/lib/walrus-cost'
import { getMemoryStats } from '@/lib/memory'

/**
 * GET /api/agent/[id]/costs
 *
 * Walrus storage cost breakdown for an agent.
 * Query: ?walletAddress=0x...&bytesEstimate=50000
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const agent = getAgentById(agentId)
    if (!agent)
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const url = new URL(req.url)
    const walletAddress = url.searchParams.get('walletAddress')
    const bytesEstimate = parseInt(
      url.searchParams.get('bytesEstimate') || '50000'
    )
    const epochsPurchased = parseInt(
      url.searchParams.get('epochsPurchased') || '1000'
    )

    if (agentId === 'all') {
      // Aggregate costs for all agents
      const breakdowns: CostBreakdown[] = []
      for (const a of agents) {
        if (!walletAddress) break
        const stats = getMemoryStats(a.id, walletAddress)
        const cost = calculateStorageCost(
          stats.memoryCount * 500, // ~500 bytes per memory
          epochsPurchased,
          Math.floor(Date.now() / 86400000),
          0
        )
        breakdowns.push({
          agentId: a.id,
          name: a.name,
          memoryCount: stats.memoryCount,
          storage: cost,
        })
      }

      const aggregate = aggregateWalletCosts(breakdowns)
      return NextResponse.json({
        mode: 'aggregate',
        aggregate,
        agents: breakdowns,
        pricingNote: '$0.023/GB/month USD-denominated, paid in WAL',
      })
    }

    // Single agent cost
    const stats = walletAddress
      ? getMemoryStats(agentId, walletAddress)
      : { memoryCount: 0, lastInteraction: null }

    const estimatedBytes =
      stats.memoryCount > 0 ? stats.memoryCount * 500 : bytesEstimate

    const cost = calculateStorageCost(
      estimatedBytes,
      epochsPurchased,
      Math.floor(Date.now() / 86400000),
      0
    )

    const conversationEstimate = estimateConversationCost(50, 500, 365)

    return NextResponse.json({
      agentId,
      name: agent.name,
      memoryCount: stats.memoryCount,
      estimatedBytes,
      storage: cost,
      projections: {
        daily: conversationEstimate,
        note: 'Based on ~50 turns/day at ~500 bytes/turn',
      },
      pricingNote: '$0.023/GB/month — pay once, store for 1000+ epochs',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
