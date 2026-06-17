import { NextRequest, NextResponse } from 'next/server'
import { handleMcpToolCall, getMcpManifest, MCP_TOOLS } from '@/lib/mcp-server'

/**
 * MCP (Model Context Protocol) Server
 *
 * GET  /api/mcp → manifest (tools list)
 * POST /api/mcp → tool execution
 *
 * Enables AI tools (Claude, Cursor, etc.) to query RIOT agent memories.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const manifest = getMcpManifest(`${protocol}://${host}/api/mcp`)

  // Return the manifest as executable tool definitions
  return NextResponse.json(manifest)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MCP initialize request
    if (body.method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'riot-agents',
            version: '0.2.0',
          },
        },
      })
    }

    // MCP tools/list
    if (body.method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: { tools: MCP_TOOLS },
      })
    }

    // MCP tools/call
    if (body.method === 'tools/call') {
      const { name, arguments: args } = body.params || {}
      const walletAddress =
        args?.walletAddress ||
        req.headers.get('x-riot-wallet') ||
        'anonymous'

      const result = await handleMcpToolCall(
        { name, arguments: args || {} },
        walletAddress
      )

      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result,
      })
    }

    // MCP notifications/initialized
    if (body.method === 'notifications/initialized') {
      return NextResponse.json({ jsonrpc: '2.0', id: body.id, result: {} })
    }

    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id,
        error: { code: -32601, message: `Unknown method: ${body.method}` },
      },
      { status: 404 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message },
      },
      { status: 500 }
    )
  }
}
