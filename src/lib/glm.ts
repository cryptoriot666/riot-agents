/**
 * GLM Chat Client — AI Inference Layer
 *
 * Powers agent personalities via GLM-4.5-Air through z.ai API.
 *
 * Memory flow (Walrus Memory SDK):
 * 1. BEFORE chat → recall() fetches relevant past conversations
 * 2. DURING chat → system prompt injects recalled memories as context
 * 3. AFTER chat → indexConversation() persists turns to Walrus Memory
 *
 * Fallback: legacy Walrus blob storage (walrus.ts) when MEMWAL not configured.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ChatResponse {
  reply: string
  tokenUsage: TokenUsage
}

const ZAI_ENDPOINT = 'https://api.z.ai/api/paas/v4/chat/completions'
const MODEL = 'glm-4.5-air'
const MAX_RETRIES = 3
const TOKEN_BUDGET = 8192

function getTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

function trimHistoryToBudget(messages: ChatMessage[]): ChatMessage[] {
  const systemMsgs = messages.filter((m) => m.role === 'system')
  const chatMsgs = messages.filter((m) => m.role !== 'system')

  let tokens = systemMsgs.reduce((sum, m) => sum + getTokenCount(m.content), 0)
  const keep: ChatMessage[] = [...systemMsgs]

  for (let i = chatMsgs.length - 1; i >= 0; i--) {
    const msgTokens = getTokenCount(chatMsgs[i].content)
    if (tokens + msgTokens > TOKEN_BUDGET) break
    tokens += msgTokens
    keep.unshift(chatMsgs[i])
  }

  return keep
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempts: number = MAX_RETRIES
): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, options)

    if (res.status === 401) {
      throw new Error(
        'ZAI_API_KEY invalid or missing credits at https://z.ai/manage-apikey/billing'
      )
    }

    if (res.status === 429 && i < attempts - 1) {
      const waitMs = 2000 * Math.pow(2, i)
      console.log(`[GLM] Rate limited. Retrying in ${waitMs}ms... (${i + 1}/${attempts})`)
      await new Promise((r) => setTimeout(r, waitMs))
      continue
    }

    if (!res.ok && i < attempts - 1) {
      const waitMs = 1000 * Math.pow(2, i)
      console.log(`[GLM] HTTP ${res.status}. Retrying in ${waitMs}ms... (${i + 1}/${attempts})`)
      await new Promise((r) => setTimeout(r, waitMs))
      continue
    }

    return res
  }

  throw new Error(`Failed after ${attempts} attempts`)
}

// ── Memory context builder ─────────────────────────────────────────

interface AgentInfo {
  id: string
  name: string
  role: string
  basePrompt: string
}

async function buildMemoryContext(
  agent: AgentInfo,
  walletAddress: string,
  userMessage: string,
  blobId?: string,
  encryptionKey?: string
): Promise<{
  recalledMemories: string[]
  conversationHistory: ChatMessage[]
  hasMemory: boolean
}> {
  const recalledMemories: string[] = []
  let conversationHistory: ChatMessage[] = []
  let hasMemory = false

  // ── Walrus Memory SDK recall ──────────────────────────────────
  if (
    process.env.MEMWAL_PRIVATE_KEY &&
    process.env.MEMWAL_ACCOUNT_ID &&
    walletAddress !== 'anonymous'
  ) {
    try {
      const { recall: memwalRecall } = await import('./memwal')
      const results = await memwalRecall(walletAddress, agent.id, userMessage, 5)

      if (results.length > 0) {
        hasMemory = true
        for (const r of results) {
          recalledMemories.push(r.text)
        }
        console.log(
          `[GLM] Walrus Memory recall: ${results.length} memories for ${agent.id}`
        )
      }
    } catch (e) {
      console.warn('[GLM] MemWal recall failed, trying legacy Walrus:', e)
    }
  }

  // ── Legacy Walrus blob retrieval ──────────────────────────────
  if (!hasMemory && blobId && encryptionKey) {
    try {
      const { retrieveMemory } = await import('./walrus')
      const stored = await retrieveMemory(blobId, encryptionKey)
      conversationHistory = stored as ChatMessage[]
      hasMemory = true
      console.log('[GLM] Legacy Walrus retrieval: loaded conversation history')
    } catch (e) {
      console.warn('[GLM] Legacy Walrus retrieval failed:', e)
    }
  }

  return { recalledMemories, conversationHistory, hasMemory }
}

// ── Main chat function ─────────────────────────────────────────────

export async function chat(
  agentId: string,
  userMessage: string,
  walletAddress: string,
  opts?: {
    history?: ChatMessage[]
    blobId?: string
    encryptionKey?: string
    onStore?: (blobId: string) => void
  }
): Promise<ChatResponse> {
  const apiKey = process.env.ZAI_API_KEY
  if (!apiKey) throw new Error('ZAI_API_KEY not set in environment')

  const { getAgentById } = await import('../data/agents')
  const agent = getAgentById(agentId)
  if (!agent) throw new Error(`Agent ${agentId} not found`)

  const { buildSystemPrompt, getSoul } = await import('./souls')

  // Step 1: Retrieve memories
  const { recalledMemories, conversationHistory, hasMemory } =
    await buildMemoryContext(
      { id: agentId, name: agent.name, role: agent.role, basePrompt: agent.system_prompt },
      walletAddress,
      userMessage,
      opts?.blobId,
      opts?.encryptionKey
    )

  // Step 2: Build system prompt with injected memories
  const memoryContext = recalledMemories.length > 0
    ? `\n\n--- RECALLED MEMORIES (use these naturally in conversation) ---\n${recalledMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n--- END MEMORIES ---`
    : ''

  const soul = getSoul(agentId)!
  const systemPrompt = buildSystemPrompt(soul, hasMemory, null) + memoryContext

  // Step 3: Build messages array
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  const trimmedMessages = trimHistoryToBudget(messages)

  // Step 4: Call GLM
  const response = await fetchWithRetry(ZAI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: trimmedMessages,
      max_tokens: 400,
      temperature: 0.8,
    }),
  })

  const data = (await response.json()) as {
    choices?: [{ message?: { content?: string } }]
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  }

  const reply = data.choices?.[0]?.message?.content || ''
  const usage: TokenUsage = {
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0,
    totalTokens: data.usage?.total_tokens || 0,
  }

  console.log(
    `[GLM] ${agentId} → tokens: ${usage.totalTokens} (in:${usage.promptTokens} out:${usage.completionTokens})`
  )

  // Step 5: Persist conversation
  const newTurns: ChatMessage[] = [
    { role: 'user', content: userMessage },
    { role: 'assistant', content: reply },
  ]

  // Primary: Walrus Memory indexing
  if (
    process.env.MEMWAL_PRIVATE_KEY &&
    process.env.MEMWAL_ACCOUNT_ID &&
    walletAddress !== 'anonymous'
  ) {
    try {
      const { indexConversation: memwalIndex } = await import('./memwal')
      await memwalIndex(walletAddress, agentId, newTurns)
      console.log(`[GLM] Conversation indexed to Walrus Memory for ${agentId}`)
    } catch (e) {
      console.error('[GLM] MemWal index failed:', e)
    }
  }

  // Legacy: Walrus blob storage (full history)
  if (opts?.encryptionKey) {
    try {
      const { storeMemory } = await import('./walrus')
      const fullHistory = [...conversationHistory, ...newTurns]
      const result = await storeMemory(agentId, fullHistory, opts.encryptionKey)
      opts.onStore?.(result.blobId)
      console.log(`[GLM] Legacy Walrus store: ${result.blobId}`)
    } catch (e) {
      console.error('[GLM] Legacy Walrus store failed:', e)
    }
  }

  return { reply, tokenUsage: usage }
}
