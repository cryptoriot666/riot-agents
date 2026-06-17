/**
 * Sui Blockchain Client — PTB Wrapper
 *
 * v2.x API: SuiJsonRpcClient replaces SuiClient.
 * getJsonRpcFullnodeUrl replaces getFullnodeUrl.
 * Transaction class imported from @mysten/sui/transactions.
 */
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc'
import { Transaction } from '@mysten/sui/transactions'
import { fromHex } from '@mysten/sui/utils'

export const suiClient = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl('mainnet'),
  network: 'mainnet',
})

const PACKAGE_ID = process.env.NEXT_PUBLIC_RIOT_PACKAGE_ID || '0xae8d59bff9c4d19c82e4058d747c03308db2c02e6a6288c9977c82df1a0cc820'
const MINT_PRICE = 1_000_000_000n

export interface MintResult {
  digest: string
  objectId: string
}

export async function mintAgentOnChain(
  agentId: string,
  soulHash: string,
  signer: {
    signAndExecuteTransaction: (tx: Transaction) => Promise<{ digest: string }>
  }
): Promise<MintResult> {
  const tx = new Transaction()
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(MINT_PRICE)])

  tx.moveCall({
    target: `${PACKAGE_ID}::agent_nft::mint_agent`,
    arguments: [
      coin,
      tx.pure.string(agentId),
      tx.pure.vector('u8', Array.from(fromHex(soulHash))),
    ],
  })

  const result = await signer.signAndExecuteTransaction(tx)
  await suiClient.waitForTransaction({ digest: result.digest })

  const block = await suiClient.getTransactionBlock({
    digest: result.digest,
    options: { showObjectChanges: true },
  })

  const objectId =
    (block as any)?.objectChanges?.find(
      (c: any) =>
        c.type === 'created' && c.objectType?.includes('AgentNFT')
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
  signer: {
    signAndExecuteTransaction: (tx: Transaction) => Promise<{ digest: string }>
  }
): Promise<ImmortalizeResult> {
  const tx = new Transaction()

  tx.moveCall({
    target: `${PACKAGE_ID}::agent_nft::immortalize_memory`,
    arguments: [
      tx.object(agentObjectId),
      tx.pure.string(memoryBlobId),
      tx.pure.vector('u8', Array.from(fromHex(txHash))),
    ],
  })

  const result = await signer.signAndExecuteTransaction(tx)
  await suiClient.waitForTransaction({ digest: result.digest })

  const object = await suiClient.getObject({
    id: agentObjectId,
    options: { showContent: true },
  })

  const fields = (object.data?.content as any)?.fields || {}
  const evolutionCount = Number(fields.evolution_count ?? 0)

  return { digest: result.digest, evolutionCount }
}
