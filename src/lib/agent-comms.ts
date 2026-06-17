/**
 * Agent-to-Agent Communication via Walrus Memory
 *
 * Agents can communicate asynchronously through shared Walrus Memory spaces.
 * Each agent writes messages to another agent's namespace.
 *
 * Use cases:
 * - Agent J4 asks Agent J1 for oracle insight
 * - Agent squad coordination on shared tasks
 * - Cross-agent memory inheritance (new agent learns from old)
 */

import { MemWal } from "@mysten-incubation/memwal"

let _memwal: MemWal | null = null

function getMemWal(): MemWal {
  if (_memwal) return _memwal
  const key = process.env.MEMWAL_PRIVATE_KEY!
  const accountId = process.env.MEMWAL_ACCOUNT_ID!
  _memwal = MemWal.create({
    key,
    accountId,
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
  })
  return _memwal
}

export interface AgentMessage {
  fromAgentId: string
  fromAgentName: string
  toAgentId: string
  toAgentName: string
  subject: string
  body: string
  timestamp: number
  blobId?: string
}

export interface AgentConversation {
  participants: string[]
  messages: AgentMessage[]
  startedAt: number
  lastActivity: number
}

// ── Messaging ──────────────────────────────────────────────────────

/**
 * Agent A sends a message to Agent B via Walrus Memory.
 * Stored in Agent B's namespace under a special [comm] tag.
 */
export async function sendAgentMessage(
  fromAgentId: string,
  fromAgentName: string,
  toAgentId: string,
  toAgentName: string,
  walletAddress: string,
  subject: string,
  body: string
): Promise<string> {
  const memwal = getMemWal()
  const namespace = `${walletAddress}:${toAgentId}`

  const entry = [
    `[comm:from=${fromAgentId}]`,
    `[comm:to=${toAgentId}]`,
    `[comm:subject=${subject}]`,
    `[comm:ts=${Date.now()}]`,
    body,
  ].join(" ")

  const result = await memwal.rememberAndWait(entry, namespace)
  return result.blob_id
}

/**
 * Agent B checks their inbox — retrieves messages from other agents.
 */
export async function getAgentInbox(
  agentId: string,
  walletAddress: string,
  limit: number = 10
): Promise<AgentMessage[]> {
  const memwal = getMemWal()
  const namespace = `${walletAddress}:${agentId}`

  try {
    const result = await memwal.recall({
      query: `[comm:from=`,
      limit,
      namespace,
    })

    const messages: AgentMessage[] = []
    for (const r of result.results) {
      const fromMatch = r.text.match(/\[comm:from=(\w+)\]/)
      const toMatch = r.text.match(/\[comm:to=(\w+)\]/)
      const subjectMatch = r.text.match(/\[comm:subject=(.+?)\]/)
      const tsMatch = r.text.match(/\[comm:ts=(\d+)\]/)

      if (fromMatch && subjectMatch) {
        // Extract body (everything after the last tag)
        const lastTagEnd = r.text.lastIndexOf("] ")
        const body = lastTagEnd > 0 ? r.text.slice(lastTagEnd + 2) : r.text

        messages.push({
          fromAgentId: fromMatch[1],
          fromAgentName: fromMatch[1],
          toAgentId: toMatch?.[1] || agentId,
          toAgentName: agentId,
          subject: subjectMatch[1],
          body,
          timestamp: tsMatch ? parseInt(tsMatch[1]) : Date.now(),
          blobId: r.blob_id,
        })
      }
    }

    return messages.sort((a, b) => b.timestamp - a.timestamp)
  } catch {
    return []
  }
}

// ── Knowledge Inheritance ──────────────────────────────────────────

/**
 * When a new agent is born, inherit knowledge from an older agent.
 * Copies relevant memories from source agent's namespace.
 */
export async function inheritAgentKnowledge(
  parentAgentId: string,
  childAgentId: string,
  walletAddress: string,
  maxMemories: number = 20
): Promise<number> {
  const memwal = getMemWal()
  const parentNamespace = `${walletAddress}:${parentAgentId}`
  const childNamespace = `${walletAddress}:${childAgentId}`

  try {
    // Recall parent's core memories (excluding comm messages)
    const parentMemories = await memwal.recall({
      query: `[agent:${parentAgentId}]`,
      limit: maxMemories,
      namespace: parentNamespace,
    })

    let inherited = 0
    for (const mem of parentMemories.results) {
      // Re-tag with child agent ID and store in child namespace
      const reTagged = mem.text.replace(
        `[agent:${parentAgentId}]`,
        `[agent:${childAgentId}] [inherited_from:${parentAgentId}]`
      )
      try {
        await memwal.rememberAndWait(reTagged, childNamespace)
        inherited++
      } catch {
        // Skip individual failures
      }
    }

    return inherited
  } catch {
    return 0
  }
}

// ── Squad Coordination ─────────────────────────────────────────────

/**
 * Broadcast a message to ALL agents in a wallet (like a squad announcement).
 */
export async function broadcastToAllAgents(
  fromAgentId: string,
  fromAgentName: string,
  walletAddress: string,
  allAgentIds: string[],
  subject: string,
  body: string
): Promise<{ agentId: string; blobId: string }[]> {
  const results: { agentId: string; blobId: string }[] = []

  for (const toAgentId of allAgentIds) {
    if (toAgentId === fromAgentId) continue
    try {
      const blobId = await sendAgentMessage(
        fromAgentId,
        fromAgentName,
        toAgentId,
        toAgentId,
        walletAddress,
        subject,
        body
      )
      results.push({ agentId: toAgentId, blobId })
    } catch {
      results.push({ agentId: toAgentId, blobId: "" })
    }
  }

  return results
}
