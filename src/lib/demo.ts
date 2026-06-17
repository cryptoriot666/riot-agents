export interface DemoTurn {
  speaker: string
  message: string
  timestamp: number
}

export interface DemoResult {
  agentId: string
  transcript: DemoTurn[]
  memoryVerified: boolean
}

const localCache = new Map<string, DemoTurn[]>()

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export async function runDemoFlow(
  walletAddress: string,
  signatureFn: (msg: string) => Promise<string>
): Promise<DemoResult> {
  const agentId = 'J4'
  const { deriveKeyFromWallet } = await import('./crypto')
  const { chat } = await import('./glm')
  const { storeMemory, retrieveMemory } = await import('./walrus')

  const encryptionKey = await deriveKeyFromWallet(walletAddress, agentId, signatureFn)
  const transcript: DemoTurn[] = []

  function push(speaker: string, message: string) {
    transcript.push({ speaker, message, timestamp: Date.now() })
    console.log(`[DEMO] ${speaker}: ${message}`)
  }

  push('user', 'Nama gue Nanda, hodl BTC, target $220k')

  let blobId: string | undefined

  try {
    const result1 = await chat(agentId, 'Nama gue Nanda, hodl BTC, target $220k', walletAddress, {
      encryptionKey,
      onStore: (id) => { blobId = id }
    })
    push('J4 (The Guide)', result1.reply)
  } catch (e) {
    push('J4 (The Guide)', `[error] ${(e as Error).message}`)
    return { agentId, transcript, memoryVerified: false }
  }

  if (!blobId) {
    push('system', 'WARNING: Walrus store did not return a blobId')
  }

  push('system', '--- Time passes (simulating reconnection) ---')
  await sleep(500)

  localCache.delete(`${agentId}:${walletAddress}`)

  push('user', 'eh J4, ingat gue?')

  try {
    const result2 = await chat(agentId, 'eh J4, ingat gue?', walletAddress, {
      blobId,
      encryptionKey
    })
    push('J4 (The Guide)', result2.reply)

    const memoryVerified =
      result2.reply.toLowerCase().includes('nanda') ||
      result2.reply.toLowerCase().includes('btc') ||
      result2.reply.includes('220')

    push('system', `Memory recall: ${memoryVerified ? 'VERIFIED ✓' : 'FAILED ✗'}`)

    return { agentId, transcript, memoryVerified }
  } catch (e) {
    push('J4 (The Guide)', `[error] ${(e as Error).message}`)
    return { agentId, transcript, memoryVerified: false }
  }
}
