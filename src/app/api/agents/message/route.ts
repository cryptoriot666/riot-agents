import { NextRequest, NextResponse } from 'next/server'
import {
  sendAgentMessage,
  getAgentInbox,
  broadcastToAllAgents,
  inheritAgentKnowledge,
} from '@/lib/agent-comms'
import { agents, getAgentById } from '@/data/agents'

/**
 * Agent Communication API
 *
 * POST /api/agents/message
 * Body: { fromAgentId, toAgentId, walletAddress, subject, body, action? }
 *
 * Actions:
 * - send (default) — send message to another agent
 * - broadcast — send to ALL agents
 * - inbox — get messages for an agent
 * - inherit — new agent inherits from parent agent
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fromAgentId,
      toAgentId,
      walletAddress,
      subject,
      body: msgBody,
      action,
      parentAgentId,
      childAgentId,
      maxMemories,
    } = body as {
      fromAgentId?: string
      toAgentId?: string
      walletAddress?: string
      subject?: string
      body?: string
      action?: 'send' | 'broadcast' | 'inbox' | 'inherit'
      parentAgentId?: string
      childAgentId?: string
      maxMemories?: number
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress required' },
        { status: 400 }
      )
    }

    // ── Action: Inbox ──
    if (action === 'inbox') {
      if (!toAgentId) {
        return NextResponse.json(
          { error: 'toAgentId required for inbox' },
          { status: 400 }
        )
      }
      const messages = await getAgentInbox(toAgentId, walletAddress)
      return NextResponse.json({
        agentId: toAgentId,
        messageCount: messages.length,
        messages,
      })
    }

    // ── Action: Broadcast ──
    if (action === 'broadcast') {
      if (!fromAgentId || !subject || !msgBody) {
        return NextResponse.json(
          { error: 'fromAgentId, subject, and body required for broadcast' },
          { status: 400 }
        )
      }
      const sender = getAgentById(fromAgentId)
      const allIds = agents.map((a) => a.id)
      const results = await broadcastToAllAgents(
        fromAgentId,
        sender?.name || fromAgentId,
        walletAddress,
        allIds,
        subject,
        msgBody
      )
      return NextResponse.json({
        action: 'broadcast',
        fromAgentId,
        delivered: results.filter((r) => r.blobId).length,
        failed: results.filter((r) => !r.blobId).length,
        results,
      })
    }

    // ── Action: Inherit ──
    if (action === 'inherit') {
      if (!parentAgentId || !childAgentId) {
        return NextResponse.json(
          { error: 'parentAgentId and childAgentId required for inherit' },
          { status: 400 }
        )
      }
      const inherited = await inheritAgentKnowledge(
        parentAgentId,
        childAgentId,
        walletAddress,
        maxMemories || 20
      )
      return NextResponse.json({
        action: 'inherit',
        parentAgentId,
        childAgentId,
        inherited,
      })
    }

    // ── Action: Send (default) ──
    if (!fromAgentId || !toAgentId || !subject || !msgBody) {
      return NextResponse.json(
        {
          error:
            'fromAgentId, toAgentId, subject, and body required for send',
        },
        { status: 400 }
      )
    }

    const sender = getAgentById(fromAgentId)
    const receiver = getAgentById(toAgentId)

    const blobId = await sendAgentMessage(
      fromAgentId,
      sender?.name || fromAgentId,
      toAgentId,
      receiver?.name || toAgentId,
      walletAddress,
      subject,
      msgBody
    )

    return NextResponse.json({
      action: 'send',
      from: { agentId: fromAgentId, name: sender?.name },
      to: { agentId: toAgentId, name: receiver?.name },
      subject,
      blobId,
      storedOn: 'Walrus Memory',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API /agents/message]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
