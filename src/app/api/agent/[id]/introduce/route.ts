import { NextRequest, NextResponse } from 'next/server'
import { getAgentById } from '@/data/agents'

const aliasRegistry = new Map<string, string>()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const agent = getAgentById(agentId)
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const body = await req.json()
    const { alias } = body as { alias?: string }

    if (!alias || typeof alias !== 'string' || alias.trim().length === 0) {
      return NextResponse.json({ error: 'alias is required' }, { status: 400 })
    }

    const key = agentId
    aliasRegistry.set(key, alias.trim())

    return NextResponse.json({
      success: true,
      agentId,
      alias: alias.trim(),
      message: `${agent.name} now knows you as "${alias.trim()}"`
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
