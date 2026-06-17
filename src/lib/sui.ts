import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { fromHex } from '@mysten/sui/utils'

export const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') })

const PACKAGE_ID = process.env.NEXT_PUBLIC_RIOT_PACKAGE_ID || '0x0'
const MINT_PRICE = 1_000_000_000n

export interface MintResult {
  digest: string
  objectId: string
}

export async function mintAgentOnChain(
  agentId: string,
  soulHash: string,
  signer: { signAndExecuteTransaction: (tx: Transaction) => Promise<{ digest: string }> }
): Promise<MintResult> {
  const tx = new tx()
  const coin = tx.splitCoins(tx.gas, [MINT_PRICE])

  tx.moveCall({
    target: `${PACKAGE_ID}::agent_nft::mint_agent`,
    arguments: [
      coin,
      tx.pure.string(agentId),
      tx.pure.vector('u8', Array.from(fromHex(soulHash)))
    ]
  })

  const result = await signer.signAndExecuteTransaction(tx)
  await suiClient.waitForTransaction({ digest: result.digest })

  const effects = await suiClient.getTransactionBlock({ digest: result.digest })
  const objectId = (effects as any)?.objectChanges?.find(
    (c: any) => c.type === 'created' && c.objectType?.includes('AgentNFT')
  )?.objectId || ''

  return { digest: result.digest, objectId }
}

export interface ImmortalizeResult {
  digest: string
  evolutionCount: number
}

export async function immortalizeMemoryOnChain(
  agentObjectId: string,
  memoryBlobId: string,
  txHash: string,
  signer: { signAndExecuteTransaction: (tx: Transaction) => Promise<{ digest: string }> }
): Promise<ImmortalizeResult> {
  const tx = new tx()

  tx.moveCall({
    target: `${PACKAGE_ID}::agent_nft::immortalize_memory`,
    arguments: [
      tx.object(agentObjectId),
      tx.pure.string(memoryBlobId),
      tx.pure.vector('u8', Array.from(fromHex(txHash)))
    ]
  })

  const result = await signer.signAndExecuteTransaction(tx)
  await suiClient.waitForTransaction({ digest: result.digest })

  const object = await suiClient.getObject({ id: agentObjectId, options: { showContent: true } })
  const fields = (object.data?.content as any)?.fields || {}
  const evolutionCount = Number(fields.evolution_count ?? 0)

  return { digest: result.digest, evolutionCount }
}
