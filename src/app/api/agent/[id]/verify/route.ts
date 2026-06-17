import { NextRequest, NextResponse } from 'next/server'
import { getAgentById } from '@/data/agents'
import {
  createMemoryLink,
  verifyMemoryChain,
  createVerificationReport,
  computeBlobCommitment,
  type MemoryLink,
} from '@/lib/verifiability'

/**
 * POST /api/agent/[id]/verify
 *
 * Verify the integrity of agent memories stored on Walrus.
 * Body: { walletAddress, chain?: MemoryLink[], blobContent?: string, expectedHash?: string }
 *
 * Modes:
 * 1. chain verification — pass chain array → verify entire memory chain
 * 2. single blob — pass blobContent + expectedHash → verify single blob
 * 3. report — no extra params → generate full verification report
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
    const { walletAddress, chain, blobContent, expectedHash, action } =
      body as {
        walletAddress?: string
        chain?: MemoryLink[]
        blobContent?: string
        expectedHash?: string
        action?: 'chain' | 'single' | 'report' | 'commit'
      }

    // ── Mode: Compute commitment (before storing) ──
    if (action === 'commit' && blobContent) {
      const commit = computeBlobCommitment(blobContent)
      return NextResponse.json({
        agentId,
        ...commit,
        action: 'commit',
      })
    }

    // ── Mode: Single blob verification ──
    if (action === 'single' && blobContent && expectedHash) {
      const { verifyBlobIntegrity } = await import('@/lib/verifiability')
      const valid = await verifyBlobIntegrity(
        Buffer.from(blobContent),
        expectedHash
      )
      return NextResponse.json({
        agentId,
        verified: valid,
        expectedHash: expectedHash.slice(0, 16) + '...',
        action: 'single',
      })
    }

    // ── Mode: Chain verification ──
    if (action === 'chain' && chain && chain.length > 0) {
      const result = verifyMemoryChain(chain)
      return NextResponse.json({
        agentId,
        chainLength: chain.length,
        valid: result.valid,
        invalidAt: result.invalidAt,
        action: 'chain',
      })
    }

    // ── Mode: Full report ──
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress required for report mode' },
        { status: 400 }
      )
    }

    const report = createVerificationReport(
      chain || [],
      agentId,
      walletAddress
    )
    return NextResponse.json({
      ...report,
      action: 'report',
      note: chain
        ? undefined
        : 'No memory chain provided. Run with action=chain for full verification.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API /verify]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
