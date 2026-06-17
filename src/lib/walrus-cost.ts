/**
 * Walrus Storage Economics — Cost & Epoch Management
 *
 * Walrus pricing: $0.023/GB/month (USD-denominated, paid in WAL tokens).
 * This module calculates costs, estimates epoch needs, and manages
 * storage lifecycle for agent memories.
 */

// Walrus Mainnet constants
const WALRUS_COST_PER_GB_MONTH_USD = 0.023
const WALRUS_COST_PER_KB_MONTH_USD = WALRUS_COST_PER_GB_MONTH_USD / (1024 * 1024)
const BYTES_PER_KB = 1024
const DEFAULT_WAL_PRICE_USD = 0.05 // approximate WAL token price in USD
const EPOCH_DURATION_DAYS = 1 // Walrus epochs are ~1 day

export interface StorageCost {
  /** Total bytes stored */
  totalBytes: number
  /** Human-readable size */
  sizeFormatted: string
  /** Cost per epoch in WAL tokens */
  costPerEpochWAL: number
  /** Cost per month in WAL tokens */
  costPerMonthWAL: number
  /** Cost per month in USD */
  costPerMonthUSD: number
  /** Number of epochs currently paid for */
  epochsPurchased: number
  /** Days remaining until expiration */
  daysRemaining: number
  /** Expiration date (estimated) */
  expiresAt: string | null
  /** Is storage expired? */
  isExpired: boolean
}

export interface CostBreakdown {
  agentId: string
  name: string
  memoryCount: number
  storage: StorageCost
}

/**
 * Calculate storage cost for a given byte size.
 */
export function calculateStorageCost(
  totalBytes: number,
  epochsPurchased: number,
  currentEpoch: number,
  startEpoch: number
): StorageCost {
  const sizeKB = totalBytes / BYTES_PER_KB
  const costPerEpochUSD = sizeKB * WALRUS_COST_PER_KB_MONTH_USD / 30
  const costPerEpochWAL = costPerEpochUSD / DEFAULT_WAL_PRICE_USD
  const costPerMonthWAL = costPerEpochWAL * 30
  const costPerMonthUSD = costPerEpochUSD * 30

  const endEpoch = startEpoch + epochsPurchased
  const epochsRemaining = Math.max(0, endEpoch - currentEpoch)
  const daysRemaining = epochsRemaining * EPOCH_DURATION_DAYS

  const expiresAt = epochsRemaining > 0
    ? new Date(Date.now() + daysRemaining * 86400000).toISOString()
    : null

  return {
    totalBytes,
    sizeFormatted: formatBytes(totalBytes),
    costPerEpochWAL: Math.round(costPerEpochWAL * 1e6) / 1e6,
    costPerMonthWAL: Math.round(costPerMonthWAL * 1e6) / 1e6,
    costPerMonthUSD: Math.round(costPerMonthUSD * 100) / 100,
    epochsPurchased,
    daysRemaining,
    expiresAt,
    isExpired: epochsRemaining <= 0,
  }
}

/**
 * Estimate epochs needed for a target retention period.
 */
export function estimateEpochsForDuration(targetDays: number): {
  epochs: number
  costWAL: number
  costUSD: number
} {
  const epochs = Math.ceil(targetDays / EPOCH_DURATION_DAYS)
  return {
    epochs,
    costWAL: 0, // Depends on data size
    costUSD: 0,
  }
}

/**
 * Calculate storage cost estimate for a conversation.
 * Average LLM conversation turn: ~500 bytes of text.
 */
export function estimateConversationCost(
  turnsPerDay: number,
  avgBytesPerTurn: number = 500,
  retentionDays: number = 365
): {
  dailyBytes: number
  monthlyBytes: number
  yearlyBytes: number
  monthlyCostWAL: number
  monthlyCostUSD: number
  yearlyCostWAL: number
  yearlyCostUSD: number
} {
  const dailyBytes = turnsPerDay * avgBytesPerTurn
  const monthlyBytes = dailyBytes * 30
  const yearlyBytes = dailyBytes * 365

  const monthlyKB = monthlyBytes / BYTES_PER_KB
  const yearlyKB = yearlyBytes / BYTES_PER_KB

  const monthlyCostUSD = monthlyKB * WALRUS_COST_PER_KB_MONTH_USD
  const yearlyCostUSD = yearlyKB * WALRUS_COST_PER_KB_MONTH_USD * 12

  return {
    dailyBytes,
    monthlyBytes,
    yearlyBytes,
    monthlyCostWAL: Math.round((monthlyCostUSD / DEFAULT_WAL_PRICE_USD) * 1e6) / 1e6,
    monthlyCostUSD: Math.round(monthlyCostUSD * 100) / 100,
    yearlyCostWAL: Math.round((yearlyCostUSD / DEFAULT_WAL_PRICE_USD) * 1e6) / 1e6,
    yearlyCostUSD: Math.round(yearlyCostUSD * 100) / 100,
  }
}

/**
 * Get epoch info from Walrus system object.
 * (Stub — in production, read from Sui)
 */
export async function getCurrentEpoch(): Promise<number> {
  // Approximate: 1 epoch per day since Walrus mainnet launch (March 2025)
  const WALRUS_LAUNCH = new Date('2025-03-27').getTime()
  const now = Date.now()
  return Math.floor((now - WALRUS_LAUNCH) / 86400000)
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

/**
 * Calculate total storage across all agent memories for a wallet.
 */
export function aggregateWalletCosts(
  agentCosts: CostBreakdown[]
): {
  totalAgents: number
  totalMemories: number
  totalBytes: number
  totalSizeFormatted: string
  monthlyCostWAL: number
  monthlyCostUSD: number
  expiringCount: number
} {
  const totalBytes = agentCosts.reduce((s, c) => s + c.storage.totalBytes, 0)
  const totalMemories = agentCosts.reduce((s, c) => s + c.memoryCount, 0)
  const expiringCount = agentCosts.filter((c) => c.storage.daysRemaining < 30).length

  return {
    totalAgents: agentCosts.length,
    totalMemories,
    totalBytes,
    totalSizeFormatted: formatBytes(totalBytes),
    monthlyCostWAL: Math.round(
      agentCosts.reduce((s, c) => s + c.storage.costPerMonthWAL, 0) * 1e6
    ) / 1e6,
    monthlyCostUSD: Math.round(
      agentCosts.reduce((s, c) => s + c.storage.costPerMonthUSD, 0) * 100
    ) / 100,
    expiringCount,
  }
}
