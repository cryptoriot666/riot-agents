/**
 * Walrus Memory SDK Client — Agent Memory Layer
 *
 * Replaces custom SQLite + aes-256-gcm Walrus blob storage with
 * Walrus Memory's first-class persistent memory for AI agents.
 *
 * Features:
 * - Server-side SEAL encryption (zero plaintext on our servers)
 * - Built-in semantic recall via embeddings
 * - Namespace isolation per wallet+agent
 * - Bulk operations for conversation indexing
 * - analyze() for automatic fact extraction from chat
 */

import { MemWal } from "@mysten-incubation/memwal"

let _memwal: MemWal | null = null

function getMemWal(): MemWal {
  if (_memwal) return _memwal

  const key = process.env.MEMWAL_PRIVATE_KEY
  const accountId = process.env.MEMWAL_ACCOUNT_ID
  const serverUrl =
    process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz"

  if (!key || !accountId) {
    throw new Error(
      "MEMWAL_PRIVATE_KEY and MEMWAL_ACCOUNT_ID required in .env.local"
    )
  }

  _memwal = MemWal.create({ key, accountId, serverUrl })
  console.log("[MemWal] Client initialized — account:", accountId)
  return _memwal
}

// ── Namespace helpers ──────────────────────────────────────────────

/**
 * Derive namespace from wallet address + agent ID.
 * One namespace per wallet-agent pair for clean isolation.
 */
export function agentNamespace(wallet: string, agentId: string): string {
  return `${wallet}:${agentId}`
}

/**
 * All namespaces for a given wallet (used for cross-agent recall).
 */
export function walletNamespaces(wallet: string, agentIds: string[]): string[] {
  return agentIds.map((id) => agentNamespace(wallet, id))
}

// ── Memory tags ────────────────────────────────────────────────────

function tagEntry(agentId: string, role: string): string {
  return `[agent:${agentId}] [role:${role}] `
}

function recallQuery(
  agentId: string,
  query: string,
  wallet?: string
): string {
  const prefix = wallet ? `[wallet:${wallet}] ` : ""
  return `${prefix}[agent:${agentId}] ${query}`
}

// ── Core Operations ────────────────────────────────────────────────

/**
 * Store a single memory entry (fire-and-forget).
 * Use rememberAndWait when you need the blob_id before continuing.
 */
export async function remember(
  wallet: string,
  agentId: string,
  role: string,
  content: string
): Promise<string> {
  const memwal = getMemWal()
  const namespace = agentNamespace(wallet, agentId)
  const text = tagEntry(agentId, role) + content

  const result = await memwal.rememberAndWait(text, namespace)
  return result.blob_id
}

/**
 * Index an entire conversation (bulk — one call per turn).
 * Uses bulk API for efficiency.
 */
export async function indexConversation(
  wallet: string,
  agentId: string,
  conversation: Array<{ role: string; content: string }>
): Promise<void> {
  const memwal = getMemWal()
  const namespace = agentNamespace(wallet, agentId)

  const items = conversation
    .filter((t) => t.role !== "system")
    .map((t) => ({
      text: tagEntry(agentId, t.role) + t.content,
      namespace,
    }))

  if (items.length === 0) return

  try {
    const result = await memwal.rememberBulkAndWait(items, {
      timeoutMs: 60_000,
      pollIntervalMs: 1500,
    })
    console.log(
      `[MemWal] Indexed ${result.succeeded}/${result.total} turns for ${agentId}`
    )
  } catch (e) {
    console.error(`[MemWal] Bulk index failed for ${agentId}:`, e)
  }
}

/**
 * Semantic recall — retrieve memories relevant to a query.
 */
export async function recall(
  wallet: string,
  agentId: string,
  query: string,
  topK: number = 5
): Promise<Array<{ text: string; distance: number; blobId: string }>> {
  const memwal = getMemWal()
  const namespace = agentNamespace(wallet, agentId)

  try {
    const result = await memwal.recall({
      query: recallQuery(agentId, query),
      limit: topK,
      namespace,
    })

    return result.results.map((r) => ({
      text: r.text,
      distance: r.distance,
      blobId: r.blob_id,
    }))
  } catch (e) {
    console.error(`[MemWal] Recall failed for ${agentId}:`, e)
    return []
  }
}

/**
 * Cross-agent recall — search across ALL agents for a wallet.
 * Calls recall() for multiple namespaces and merges results.
 */
export async function recallAcrossAgents(
  wallet: string,
  agentIds: string[],
  query: string,
  topK: number = 5
): Promise<Array<{ text: string; distance: number; blobId: string; agentId: string }>> {
  const namespaces = walletNamespaces(wallet, agentIds)
  const memwal = getMemWal()

  const allResults: Array<{
    text: string
    distance: number
    blobId: string
    agentId: string
  }> = []

  for (let i = 0; i < namespaces.length; i++) {
    try {
      const result = await memwal.recall({
        query,
        limit: topK,
        namespace: namespaces[i],
      })
      for (const r of result.results) {
        allResults.push({
          text: r.text,
          distance: r.distance,
          blobId: r.blob_id,
          agentId: agentIds[i],
        })
      }
    } catch (e) {
      // Skip namespaces that haven't been used yet
    }
  }

  allResults.sort((a, b) => a.distance - b.distance)
  return allResults.slice(0, topK)
}

/**
 * Auto-extract facts from conversation using Walrus Memory's analyze().
 * The server extracts entities, preferences, events etc. as structured facts.
 */
export async function extractFacts(
  wallet: string,
  agentId: string,
  conversationText: string
): Promise<string[]> {
  const memwal = getMemWal()
  const namespace = agentNamespace(wallet, agentId)

  try {
    const result = await memwal.analyzeAndWait(conversationText, namespace, {
      timeoutMs: 30_000,
      pollIntervalMs: 1500,
    })
    return result.facts.map((f) => f.text)
  } catch (e) {
    console.warn(`[MemWal] Fact extraction failed for ${agentId}:`, e)
    return []
  }
}

/**
 * Check Walrus Memory server health.
 */
export async function healthCheck(): Promise<{
  status: string
  version: string
}> {
  const memwal = getMemWal()
  const h = await memwal.health()
  return { status: h.status, version: h.version }
}

/**
 * Get delegate key public info.
 */
export async function getDelegateInfo(): Promise<{
  publicKey: string
  accountId: string
}> {
  const memwal = getMemWal()
  const pk = await memwal.getPublicKeyHex()
  return {
    publicKey: pk,
    accountId: process.env.MEMWAL_ACCOUNT_ID ?? "unknown",
  }
}
