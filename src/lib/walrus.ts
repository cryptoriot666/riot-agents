import crypto from 'crypto'

const WALRUS_AGGREGATOR = 'https://aggregator.walrus-test.walrus.space'
const WALRUS_PUBLISHER = 'https://publisher.walrus-test.walrus.space'
const MIN_EPOCHS = 1000

export interface StoredMemory {
  blobId: string
  endEpoch: number
}

async function deriveKey(encryptionKey: string): Promise<{ key: Buffer; iv: Buffer }> {
  const hash = crypto.createHash('sha256').update(encryptionKey).digest()
  return { key: hash, iv: hash.subarray(0, 16) }
}

function encrypt(plaintext: string, key: Buffer, iv: Buffer): { ciphertext: Buffer; authTag: Buffer } {
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return { ciphertext: encrypted, authTag: cipher.getAuthTag() }
}

function decrypt(ciphertext: Buffer, authTag: Buffer, key: Buffer, iv: Buffer): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(ciphertext) + decipher.final('utf8')
}

export async function storeMemory(
  agentId: string,
  conversation: unknown[],
  encryptionKey: string
): Promise<StoredMemory> {
  const { key, iv } = await deriveKey(encryptionKey)
  const plaintext = JSON.stringify(conversation)
  const { ciphertext, authTag } = encrypt(plaintext, key, iv)

  const payload = Buffer.concat([iv, authTag, ciphertext])
  const response = await fetch(`${WALRUS_PUBLISHER}/v1/store?epochs=${MIN_EPOCHS}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: payload
  })

  if (!response.ok) throw new Error(`Walrus store failed: ${response.statusText}`)

  const result = await response.json() as {
    newlyCreated?: { blobObject?: { blobId: string; endEpoch: number } }
  }
  const info = result.newlyCreated?.blobObject
  if (!info?.blobId || !info.endEpoch) throw new Error('Invalid Walrus response')

  return { blobId: info.blobId, endEpoch: info.endEpoch }
}

export async function retrieveMemory(
  blobId: string,
  encryptionKey: string
): Promise<unknown[]> {
  const response = await fetch(`${WALRUS_AGGREGATOR}/v1/${blobId}`)
  if (!response.ok) throw new Error(`Walrus retrieve failed: ${response.statusText}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  const iv = buffer.subarray(0, 16)
  const authTag = buffer.subarray(16, 32)
  const ciphertext = buffer.subarray(32)

  const { key } = await deriveKey(encryptionKey)
  const plaintext = decrypt(ciphertext, authTag, key, iv)
  return JSON.parse(plaintext) as unknown[]
}

export async function extendStorage(blobId: string, additionalEpochs: number): Promise<void> {
  const response = await fetch(`${WALRUS_PUBLISHER}/v1/${blobId}?epochs=${additionalEpochs}`, {
    method: 'PUT'
  })
  if (!response.ok) throw new Error(`Walrus extend failed: ${response.statusText}`)
}
