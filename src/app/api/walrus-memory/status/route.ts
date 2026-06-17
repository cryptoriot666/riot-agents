import { NextResponse } from 'next/server'

/**
 * Walrus Memory Health & Config API
 *
 * GET /api/walrus-memory/status
 * Returns:
 * - memwal_enabled: boolean
 * - server_health: { status, version } | null
 * - delegate_info: { publicKey, accountId } | null
 * - namespace_count: currently tracked namespaces
 */
export async function GET() {
  const enabled = !!(
    process.env.MEMWAL_PRIVATE_KEY && process.env.MEMWAL_ACCOUNT_ID
  )

  if (!enabled) {
    return NextResponse.json({
      memwal_enabled: false,
      server_health: null,
      delegate_info: null,
      mode: 'legacy_sqlite',
    })
  }

  try {
    const { healthCheck, getDelegateInfo } = await import('@/lib/memwal')
    const [health, delegate] = await Promise.all([
      healthCheck(),
      getDelegateInfo(),
    ])

    return NextResponse.json({
      memwal_enabled: true,
      server_health: health,
      delegate_info: {
        publicKey: delegate.publicKey,
        accountId: delegate.accountId.slice(0, 10) + '...',
      },
      mode: 'walrus_memory',
    })
  } catch (e) {
    return NextResponse.json({
      memwal_enabled: true,
      server_health: { status: 'error', error: String(e) },
      delegate_info: null,
      mode: 'walrus_memory_degraded',
    })
  }
}
