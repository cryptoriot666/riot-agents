import Database from 'better-sqlite3'
import { join } from 'path'
import crypto from 'crypto'

const EMBEDDING_ENDPOINT = 'https://api.z.ai/api/paas/v4/embeddings'
const EMBEDDING_MODEL = 'embedding-3'
const EMBEDDING_DIM = 1536

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

export async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.ZAI_API_KEY
  if (!apiKey) throw new Error('ZAI_API_KEY not set')

  const res = await fetch(EMBEDDING_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000)
    })
  })

  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${res.statusText}`)

  const data = await res.json() as {
    data?: [{ embedding?: number[] }]
  }
  return data.data?.[0]?.embedding || []
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dotProduct / denominator
}

export async function indexConversation(
  agentId: string,
  wallet: string,
  conversation: Array<{ role: string; content: string }>
): Promise<void> {
  const database = getDb()
  const upsert = database.prepare(`
    INSERT OR REPLACE INTO embeddings (agent_id, wallet, turn_idx, role, content, embedding)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  for (let i = 0; i < conversation.length; i++) {
    const turn = conversation[i]
    if (turn.role === 'system') continue

    try {
      const vector = await embed(turn.content)
      const blob = Buffer.new(Float64Array(vector).buffer)

      upsert.run(agentId, wallet, i, turn.role, turn.content, blob)
    } catch (e) {
      console.warn(`[Memory] Failed to embed turn ${i} for ${agentId}:`, e)
    }
  }
}

export async function semanticRecall(
  agentId: string,
  wallet: string,
  query: string,
  topK: number = 3
): Promise<string[]> {
  const database = getDb()
  const queryVector = await embed(query)

  const rows = database.prepare(
    'SELECT role, content, embedding FROM embeddings WHERE agent_id = ? AND wallet = ?'
  ).all(agentId, wallet) as Array<{ role: string; content: string; embedding: Buffer }>

  const scored = rows.map(row => {
    const stored = Array.from(new Float64Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.length / 8))
    return {
      content: `[${row.role}] ${row.content}`,
      score: cosineSimilarity(queryVector, stored)
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK).map(s => s.content)
}

export async function recallAcrossAllAgents(
  wallet: string,
  query: string,
  topK: number = 5
): Promise<Array<{ agentId: string; content: string; score: number }>> {
  const database = getDb()
  const queryVector = await embed(query)

  const rows = database.prepare(
    'SELECT agent_id, role, content, embedding FROM embeddings WHERE wallet = ?'
  ).all(wallet) as Array<{ agent_id: string; role: string; content: string; embedding: Buffer }>

  const scored = rows.map(row => {
    const stored = Array.from(new Float64Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.length / 8))
    return {
      agentId: row.agent_id,
      content: `[${row.agent_id}|${row.role}] ${row.content}`,
      score: cosineSimilarity(queryVector, stored)
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

export function getMemoryStats(agentId: string, wallet: string): {
  memoryCount: number
  lastInteraction: number | null
} {
  const database = getDb()

  const countRow = database.prepare(
    'SELECT COUNT(*) as cnt FROM embeddings WHERE agent_id = ? AND wallet = ?'
  ).get(agentId, wallet) as { cnt: number } | undefined

  const lastRow = database.prepare(
    'SELECT MAX(created_at) as last FROM embeddings WHERE agent_id = ? AND wallet = ?'
  ).get(agentId, wallet) as { last: number | null } | undefined

  return {
    memoryCount: countRow?.cnt || 0,
    lastInteraction: lastRow?.last ?? null
  }
}
