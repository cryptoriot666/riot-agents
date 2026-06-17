/**
 * MCP (Model Context Protocol) Integration for RIOT Agent Memory
 *
 * Exposes Walrus Memory agent recall as MCP tools so external AI
 * applications (Claude, Cursor, etc.) can query agent memories.
 *
 * MCP Tools exposed:
 * - riot.recall — semantic search across agent memories
 * - riot.agent_info — get agent personality + stats
 * - riot.list_agents — list all 25 agents
 * - riot.cross_agent_recall — search across all agents
 */

import { getAgentById, agents } from "@/data/agents"

// ── MCP Types ──────────────────────────────────────────────────────

export interface McpToolDef {
  name: string
  description: string
  inputSchema: {
    type: "object"
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required: string[]
  }
}

export interface McpToolCall {
  name: string
  arguments: Record<string, unknown>
}

export interface McpContentItem {
  type: "text"
  text: string
}

export interface McpToolResult {
  content: McpContentItem[]
  isError?: boolean
}

// ── Tool Definitions ───────────────────────────────────────────────

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "riot.recall",
    description:
      "Search agent memories on Walrus. Returns past conversations stored with persistent, verifiable memory.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Agent ID (J1-J25) to search memories for",
          enum: agents.map((a) => a.id),
        },
        walletAddress: {
          type: "string",
          description: "Sui wallet address whose memories to search",
        },
        query: {
          type: "string",
          description: "Natural language query for semantic search",
        },
        topK: {
          type: "number",
          description: "Number of results (default: 3, max: 10)",
        },
      },
      required: ["agentId", "walletAddress", "query"],
    },
  },
  {
    name: "riot.cross_agent_recall",
    description:
      "Search across ALL agents' memories for a wallet simultaneously.",
    inputSchema: {
      type: "object",
      properties: {
        walletAddress: {
          type: "string",
          description: "Sui wallet address whose memories to search",
        },
        query: {
          type: "string",
          description: "Natural language query",
        },
        topK: {
          type: "number",
          description: "Number of results per agent (default: 5)",
        },
      },
      required: ["walletAddress", "query"],
    },
  },
  {
    name: "riot.agent_info",
    description: "Get agent personality, role, and memory statistics.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Agent ID (J1-J25)",
          enum: agents.map((a) => a.id),
        },
      },
      required: ["agentId"],
    },
  },
  {
    name: "riot.list_agents",
    description: "List all 25 RIOT agents with their roles and personalities.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "riot.verify_memory",
    description:
      "Cryptographically verify that a memory exists on Walrus and hasn't been tampered with.",
    inputSchema: {
      type: "object",
      properties: {
        blobId: {
          type: "string",
          description: "Walrus blob ID to verify",
        },
        expectedHash: {
          type: "string",
          description: "Expected SHA-256 hash of the blob content",
        },
      },
      required: ["blobId", "expectedHash"],
    },
  },
]

// ── Tool Handler ───────────────────────────────────────────────────

export async function handleMcpToolCall(
  call: McpToolCall,
  walletAddress: string
): Promise<McpToolResult> {
  try {
    switch (call.name) {
      case "riot.recall": {
        const { agentId, query, topK } = call.arguments as {
          agentId: string
          query: string
          topK?: number
        }
        const { semanticRecall } = await import("./memory")
        const memories = await semanticRecall(
          agentId,
          walletAddress,
          query,
          topK || 3
        )
        return {
          content: [
            {
              type: "text",
              text:
                memories.length > 0
                  ? `Found ${memories.length} memories for agent ${agentId}:\n\n${memories
                      .map((m, i) => `${i + 1}. ${m}`)
                      .join("\n\n")}`
                  : `No memories found for agent ${agentId} matching "${query}"`,
            },
          ],
        }
      }

      case "riot.cross_agent_recall": {
        const { query, topK } = call.arguments as {
          query: string
          topK?: number
        }
        const { recallAcrossAllAgents } = await import("./memory")
        const results = await recallAcrossAllAgents(
          walletAddress,
          query,
          topK || 5
        )
        return {
          content: [
            {
              type: "text",
              text:
                results.length > 0
                  ? `Found ${results.length} memories across agents:\n\n${results
                      .map(
                        (r, i) =>
                          `${i + 1}. [${r.agentId}] (score: ${r.score.toFixed(3)})\n   ${r.content}`
                      )
                      .join("\n\n")}`
                  : `No memories found across agents matching "${query}"`,
            },
          ],
        }
      }

      case "riot.agent_info": {
        const { agentId } = call.arguments as { agentId: string }
        const agent = getAgentById(agentId)
        if (!agent) {
          return {
            content: [{ type: "text", text: `Agent ${agentId} not found` }],
            isError: true,
          }
        }
        const { getMemoryStats } = await import("./memory")
        const stats = getMemoryStats(agentId, walletAddress)
        return {
          content: [
            {
              type: "text",
              text: [
                `# ${agent.name} (${agent.id})`,
                `Role: ${agent.role}`,
                `Personality: ${agent.personality_prompt}`,
                `Memories: ${stats.memoryCount}`,
                `Last interaction: ${stats.lastInteraction ? new Date(stats.lastInteraction * 1000).toISOString() : "Never"}`,
                `Voice: ${agent.voice_traits}`,
              ].join("\n"),
            },
          ],
        }
      }

      case "riot.list_agents": {
        const { getMemoryStats } = await import("./memory")
        const list = agents.map((a) => {
          const stats = getMemoryStats(a.id, walletAddress)
          return `- **${a.name}** (${a.id}) — ${a.role} — ${stats.memoryCount} memories`
        })
        return {
          content: [
            {
              type: "text",
              text: `# RIOT Agents (${agents.length} total)\n\n${list.join("\n")}`,
            },
          ],
        }
      }

      case "riot.verify_memory": {
        const { blobId, expectedHash } = call.arguments as {
          blobId: string
          expectedHash: string
        }
        // Download from Walrus aggregator and verify
        try {
          const aggregator =
            process.env.WALRUS_AGGREGATOR_URL ||
            "https://aggregator.mainnet.walrus.site"
          const res = await fetch(`${aggregator}/v1/${blobId}`)
          if (!res.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: `Blob ${blobId} not found on Walrus aggregator`,
                },
              ],
              isError: true,
            }
          }
          const { verifyBlobIntegrity } = await import("./verifiability")
          const buffer = Buffer.from(await res.arrayBuffer())
          const valid = await verifyBlobIntegrity(buffer, expectedHash)
          return {
            content: [
              {
                type: "text",
                text: valid
                  ? `✅ Blob ${blobId} verified — content matches expected hash`
                  : `❌ BLOB TAMPERED — content does NOT match expected hash ${expectedHash.slice(0, 16)}...`,
              },
            ],
          }
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Verification failed: ${e instanceof Error ? e.message : "Unknown error"}`,
              },
            ],
            isError: true,
          }
        }
      }

      default:
        return {
          content: [
            { type: "text", text: `Unknown tool: ${call.name}` },
          ],
          isError: true,
        }
    }
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err instanceof Error ? err.message : "Unknown"}`,
        },
      ],
      isError: true,
    }
  }
}

// ── MCP Server Manifest ────────────────────────────────────────────

export function getMcpManifest(serverUrl: string) {
  return {
    name: "riot-agents",
    version: "0.2.0",
    description:
      "RIOT — Resurrection Machine for Dead NFTs. Living AI agents on Sui with persistent memory on Walrus. MCP integration for agent memory access.",
    vendor: "cryptoriot666",
    url: serverUrl,
    tools: MCP_TOOLS,
  }
}
