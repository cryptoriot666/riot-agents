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
  const systemMsgs = messages.filter(m => m.role === 'system')
  const chatMsgs = messages.filter(m => m.role !== 'system')

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
      throw new Error('ZAI_API_KEY invalid or missing credits at https://z.ai/manage-apikey/billing')
    }

    if (res.status === 429 && i < attempts - 1) {
      const waitMs = 2000 * Math.pow(2, i)
      console.log(`[GLM] Rate limited. Retrying in ${waitMs}ms... (${i + 1}/${attempts})`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }

    if (!res.ok && i < attempts - 1) {
      const waitMs = 1000 * Math.pow(2, i)
      console.log(`[GLM] HTTP ${res.status}. Retrying in ${waitMs}ms... (${i + 1}/${attempts})`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }

    return res
  }

  throw new Error(`Failed after ${attempts} attempts`)
}

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

  const { buildSystemPrompt } = await import('./souls')
  const { deriveKeyFromWallet } = await import('./crypto')

  let conversationHistory: ChatMessage[] = opts?.history || []
  let hasMemory = false

  if (opts?.blobId && opts?.encryptionKey) {
    try {
      const { retrieveMemory } = await import('./walrus')
      const stored = await retrieveMemory(opts.blobId, opts.encryptionKey)
      conversationHistory = stored as ChatMessage[]
      hasMemory = true
    } catch (e) {
      console.warn(`[GLM] Walrus retrieval failed, using empty history:`, e)
    }
  }

  const systemPrompt = buildSystemPrompt(
    { id: agentId, name: agent.name, role: agent.role, basePrompt: agent.system_prompt },
    hasMemory,
    null
  )

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]

  const trimmedMessages = trimHistoryToBudget(messages)

  const response = await fetchWithRetry(ZAI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: trimmedMessages,
      max_tokens: 400,
      temperature: 0.8
    })
  })

  const data = await response.json() as {
    choices?: [{ message?: { content?: string } }]
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  }

  const reply = data.choices?.[0]?.message?.content || ''
  const usage: TokenUsage = {
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0,
    totalTokens: data.usage?.total_tokens || 0
  }

  console.log(`[GLM] ${agentId} → tokens: ${usage.totalTokens} (in:${usage.promptTokens} out:${usage.completionTokens})`)

  conversationHistory.push({ role: 'user', content: userMessage })
  conversationHistory.push({ role: 'assistant', content: reply })

  if (opts?.encryptionKey) {
    try {
      const { storeMemory } = await import('./walrus')
      const result = await storeMemory(agentId, conversationHistory, opts.encryptionKey)
      opts.onStore?.(result.blobId)
      console.log(`[GLM] Memory stored to Walrus: ${result.blobId}`)
    } catch (e) {
      console.error('[GLM] Walrus store failed, memory only in local cache:', e)
    }
  }

  return { reply, tokenUsage: usage }
}
