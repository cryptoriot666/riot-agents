import crypto from 'crypto'

const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH = 32
const SALT = '$RIOT-memory-salt-v1'

export async function deriveKeyFromWallet(
  walletAddress: string,
  agentId: string,
  signatureFn: (msg: string) => Promise<string>
): Promise<string> {
  const message = `$RIOT memory access for ${agentId}`
  const signature = await signatureFn(message)

  const material = `${walletAddress}:${agentId}:${signature}`
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      material,
      SALT,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256',
      (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey.toString('base64'))
      }
    )
  })
}

export async function encrypt(data: string, key: string): Promise<string> {
  const keyBuffer = Buffer.from(key, 'base64')
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv)
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  const combined = Buffer.concat([iv, authTag, encrypted])
  return combined.toString('base64')
}

export async function decrypt(encrypted: string, key: string): Promise<string> {
  const keyBuffer = Buffer.from(key, 'base64')
  const combined = Buffer.from(encrypted, 'base64')

  const iv = combined.subarray(0, 16)
  const authTag = combined.subarray(16, 32)
  const ciphertext = combined.subarray(32)

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv)
  decipher.setAuthTag(authTag)

  return decipher.update(ciphertext) + decipher.final('utf8')
}
