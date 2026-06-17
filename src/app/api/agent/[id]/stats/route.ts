import { NextResponse } from 'next/server'
import { getAgentById } from '@/data/agents'
import { getMemoryStats } from '@/lib/memory'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const agent = getAgentById(agentId)
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const url = new URL(_req.url)
    const walletAddress = url.searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress query param required' }, { status: 400 })
    }

    const stats = getMemoryStats(agentId, walletAddress)

    return NextResponse.json({
      agentId,
      name: agent.name,
      evolutionCount: 0,
      memoryCount: stats.memoryCount,
      lastInteraction: stats.lastInteraction
        ? new Date(stats.lastInteraction * 1000).toISOString()
        : null
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
