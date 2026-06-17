/**
 * Agent Memory System — Dual Backend
 *
 * PRIMARY: Walrus Memory SDK (memwal.ts)
 *   - Server-side SEAL encryption + embeddings + Walrus storage
 *   - Semantic recall built-in (no external embedding API needed)
 *   - Bulk indexing for conversation persistence
 *   - Cross-agent recall across all namespaces
 *
 * LEGACY (fallback): SQLite + cosine similarity
 *   - Kept for offline/demo mode when MEMWAL_PRIVATE_KEY is not configured
 *   - Same interface, automatic fallback
 */

import Database from 'better-sqlite3'
import { join } from 'path'

// ── Legacy SQLite (fallback) ───────────────────────────────────────

const EMBEDDING_ENDPOINT = 'https://api.z.ai/api/paas/v4/embeddings'
const EMBEDDING_MODEL = 'embedding-3'

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    const dbPath = join(process.cwd(), '.data', 'memory.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        wallet TEXT NOT NULL,
        turn_idx INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding BLOB NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(agent_id, wallet, turn_idx, role)
      );
      CREATE INDEX IF NOT EXISTS idx_embeddings_agent_wallet ON embeddings(agent_id, wallet);
      CREATE INDEX IF NOT EXISTS idx_embeddings_wallet ON embeddings(wallet);
    `)
  }
  return db
}

async function legacyEmbed(text: string): Promise<number[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set')

  const res = await fetch(EMBEDDING_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text.slice(0, 8000) }),
  })

  if (!res.ok) throw new Error(`Embedding failed: ${res.status}`)
  const data = (await res.json()) as { data?: [{ embedding?: number[] }] }
  return data.data?.[0]?.embedding || []
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, nA = 0, nB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; nA += a[i] * a[i]; nB += b[i] * b[i]
  }
  const denom = Math.sqrt(nA) * Math.sqrt(nB)
  return denom === 0 ? 0 : dot / denom
}

// ── Unified Interface ──────────────────────────────────────────────

/**
 * Check if Walrus Memory SDK is available.
 */
function hasMemWal(): boolean {
  return !!(process.env.MEMWAL_PRIVATE_KEY && process.env.MEMWAL_ACCOUNT_ID)
}

/**
 * Index a conversation — Walrus Memory (primary) or SQLite (fallback).
 */
export async function indexConversation(
  agentId: string,
  wallet: string,
  conversation: Array<{ role: string; content: string }>
): Promise<void> {
  // Primary: Walrus Memory bulk indexing
  if (hasMemWal()) {
    try {
      const { indexConversation: memwalIndex } = await import('./memwal')
      await memwalIndex(wallet, agentId, conversation)
      return
    } catch (e) {
      console.warn('[Memory] MemWal index failed, falling back to SQLite:', e)
    }
  }

  // Fallback: SQLite + GLM embeddings
  const database = getDb()
  const upsert = database.prepare(`
    INSERT OR REPLACE INTO embeddings (agent_id, wallet, turn_idx, role, content, embedding)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  for (let i = 0; i < conversation.length; i++) {
    const turn = conversation[i]
    if (turn.role === 'system') continue
    try {
      const vector = await legacyEmbed(turn.content)
      const blob = Buffer.from(new Float64Array(vector).buffer)
      upsert.run(agentId, wallet, i, turn.role, turn.content, blob)
    } catch (e) {
      console.warn(`[Memory] Failed to embed turn ${i} for ${agentId}:`, e)
    }
  }
}

/**
 * Semantic recall for a specific agent.
 * Walrus Memory (primary) or SQLite cosine similarity (fallback).
 */
export async function semanticRecall(
  agentId: string,
  wallet: string,
  query: string,
  topK: number = 3
): Promise<string[]> {
  // Primary: Walrus Memory
  if (hasMemWal()) {
    try {
      const { recall } = await import('./memwal')
      const results = await recall(wallet, agentId, query, topK)
      return results.map((r) => r.text)
    } catch (e) {
      console.warn('[Memory] MemWal recall failed, falling back to SQLite:', e)
    }
  }

  // Fallback: SQLite
  const database = getDb()
  const queryVector = await legacyEmbed(query)
  const rows = database
    .prepare('SELECT role, content, embedding FROM embeddings WHERE agent_id = ? AND wallet = ?')
    .all(agentId, wallet) as Array<{ role: string; content: string; embedding: Buffer }>

  const scored = rows.map((row) => {
    const stored = Array.from(
      new Float64Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.length / 8)
    )
    return {
      content: `[${row.role}] ${row.content}`,
      score: cosineSimilarity(queryVector, stored),
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK).map((s) => s.content)
}

/**
 * Cross-agent recall — search across ALL agents for a wallet.
 */
export async function recallAcrossAllAgents(
  wallet: string,
  query: string,
  topK: number = 5
): Promise<Array<{ agentId: string; content: string; score: number }>> {
  // Primary: Walrus Memory cross-agent recall
  if (hasMemWal()) {
    try {
      const { getAgentById } = await import('../data/agents')
      const { agents } = await import('../data/agents')
      const { recallAcrossAgents } = await import('./memwal')

      const agentIds = agents.map((a) => a.id)
      const results = await recallAcrossAgents(wallet, agentIds, query, topK)

      return results.map((r) => ({
        agentId: r.agentId,
        content: r.text,
        score: 1 - r.distance,
      }))
    } catch (e) {
      console.warn('[Memory] MemWal cross-agent recall failed:', e)
    }
  }

  // Fallback: SQLite
  const database = getDb()
  const queryVector = await legacyEmbed(query)
  const rows = database
    .prepare('SELECT agent_id, role, content, embedding FROM embeddings WHERE wallet = ?')
    .all(wallet) as Array<{ agent_id: string; role: string; content: string; embedding: Buffer }>

  const scored = rows.map((row) => {
    const stored = Array.from(
      new Float64Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.length / 8)
    )
    return {
      agentId: row.agent_id,
      content: `[${row.agent_id}|${row.role}] ${row.content}`,
      score: cosineSimilarity(queryVector, stored),
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

/**
 * Get memory stats for an agent + wallet.
 */
export function getMemoryStats(
  agentId: string,
  wallet: string
): { memoryCount: number; lastInteraction: number | null } {
  // For MemWal, stats require querying. Use SQLite for quick local stats.
  const database = getDb()
  const countRow = database
    .prepare('SELECT COUNT(*) as cnt FROM embeddings WHERE agent_id = ? AND wallet = ?')
    .get(agentId, wallet) as { cnt: number } | undefined

  const lastRow = database
    .prepare('SELECT MAX(created_at) as last FROM embeddings WHERE agent_id = ? AND wallet = ?')
    .get(agentId, wallet) as { last: number | null } | undefined

  return {
    memoryCount: countRow?.cnt || 0,
    lastInteraction: lastRow?.last ?? null,
  }
}

// ── Re-export for backward compatibility ───────────────────────────
export { legacyEmbed as embed }
