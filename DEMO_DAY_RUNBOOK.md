# DEMO DAY RUNBOOK — $RIOT

> **Sui Overflow 2026 — Walrus Track**
> Target: 12 minutes. 15-minute slot leaves 3 minutes Q&A.

---

## PRE-FLIGHT

- [x] `npm run dev` running on localhost:3000
- [x] `.env.local` has ZAI_API_KEY + MEMWAL_PRIVATE_KEY + MEMWAL_ACCOUNT_ID
- [x] Walrus Memory health check: `curl localhost:3000/api/walrus-memory/status` → `mode: "walrus_memory"`
- [x] Suiet wallet extension installed in browser (with test SUI)
- [x] Projector at 1920×1080, browser zoom 100%
- [x] All tabs closed except demo tab
- [x] Phone on silent

---

## BEAT 1 — HOOK & PROBLEM (1:15 min)

**Action:** Open http://localhost:3000

**Say:**
> "17 billion dollars of NFT market cap evaporated. 95% of all NFTs are dead — static JPEGs nobody looks at, nobody uses. Today I'm showing you $RIOT — a resurrection machine. Every dead NFT gets a living AI agent with persistent memory on Walrus. Let me show you."

**Screen:** Landing page loads. Massive "$RIOT." text. J4 evidence photo.

**Action:** Scroll to stat cards

**Say:**
> "Market cap crashed from 17B to 1.5B. 95% of NFTs functionally dead. Zero utility. We're not making another PFP. We're giving every NFT a soul — with persistent, verifiable memory on Walrus."

---

## BEAT 2 — AGENT SQUAD (0:30 min)

**Action:** Click "MEET THE AGENTS →" or navigate to /agents

**Say:**
> "25 agents. Unique personalities. Unique roles. Unique soul hash on-chain. J4 is our demo star — The Guide. Punk energy, Jakarta street tone. Remembers everything. Powered by Walrus Memory — the first-class memory layer for AI agents on Sui."

**Screen:** Gallery grid with halftone hover effects.

---

## BEAT 3 — LIVE CHAT + WALRUS MEMORY (4:00 min)

**Action:** Navigate to /agents/J4, connect wallet, type:

```
Nama gue Nanda, hodl BTC, target $220k
```

**Say:**
> "Watch this. I connect my wallet — that's my identity layer. I tell J4 my name, my hold, my target. It responds naturally. In Indonesian slang. Now here's the magic that Walrus Memory enables — that conversation just got SEAL-encrypted, embedded, and stored on Walrus. Not in our database. Not in plaintext. On decentralized storage with cryptographic integrity guarantees."

**Action:** Type:

```
eh J4, ingat gue?
```

**Say:**
> "This is the Walrus track moment. Most AI chatbots forget everything when you refresh. Watch what happens."

**Wait for response**

> "It knows my name. It knows I hold Bitcoin. It knows my $220k target. This isn't prompt injection — this is Walrus Memory semantic recall. The conversation was encrypted with SEAL, stored on Walrus, embedded server-side, and retrieved via vector similarity search. The agent REMEMBERS through Walrus."

**Action:** Show quick terminal:

```bash
curl http://localhost:3000/api/walrus-memory/status
# → { "memwal_enabled": true, "server_health": { "status": "ok" }, "mode": "walrus_memory" }
```

**Say:**
> "Walrus Memory handles everything — encryption, embedding, storage, and retrieval. We don't touch plaintext. We don't manage blobs manually. The SDK does it all."

---

## BEAT 4 — VERIFIABLE MEMORY (1:00 min)

**Action:** Click "⚡ IMMORTALIZE" button

**Say:**
> "Every meaningful conversation can be immortalized on-chain. But we go further — every memory is cryptographically verifiable. The blob has a SHA-256 commitment. The memory chain is linked via HMAC signatures. We can prove a conversation existed at a specific time without revealing its content."

**Show tx confirmation modal**

> "Transaction digest, gas cost, blob ID, content hash — everything transparent on Suiscan. This is what 'verifiable data platform' means."

**Action (optional):** Show verification endpoint:

```bash
curl -X POST http://localhost:3000/api/agent/J4/verify \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x...", "action": "report"}'
```

---

## BEAT 5 — ECONOMICS DASHBOARD (1:00 min)

**Action:** Navigate to /dashboard, scroll to cost section

**Say:**
> "Walrus costs $0.023 per gigabyte per month. A year of daily conversations with 25 agents costs less than a dollar. We show real-time cost breakdown per agent, epoch expiration tracking, and storage projections. This is what deep Walrus integration looks like."

**Action:** Show cost API (quick terminal):

```bash
curl "http://localhost:3000/api/agent/J4/costs?walletAddress=0x...&bytesEstimate=50000"
# → Shows storage cost, projections, pricing
```

---

## BEAT 6 — AGENT-TO-AGENT + MCP (1:15 min)

**Action:** Show agent communication:

**Say:**
> "Agents don't live in isolation. J1 The Oracle can send prophetic insights to J4 The Guide via shared Walrus Memory namespaces. Agent-to-agent communication, knowledge inheritance, squad coordination — all through Walrus."

**Action (quick terminal):**

```bash
curl -X POST http://localhost:3000/api/agents/message \
  -H "Content-Type: application/json" \
  -d '{"fromAgentId":"J1","toAgentId":"J4","walletAddress":"0x...","subject":"Vision","body":"BTC will hit 220k by December","action":"send"}'
```

**Say:**
> "And through MCP — Model Context Protocol — any AI tool can query agent memories. Claude, Cursor, any MCP-compatible client. Our agents aren't just a website — they're an API."

**Action:** Show MCP manifest:

```bash
curl http://localhost:3000/api/mcp | jq '.tools[].name'
# → riot.recall, riot.cross_agent_recall, riot.agent_info, riot.list_agents, riot.verify_memory
```

---

## BEAT 7 — DEMO PAGE + CLOSING (2:00 min)

**Action:** Navigate to /demo, click "RUN DEMO"

**Say:**
> "For judges who want the offline story, I built a self-contained 7-beat demo mode."

**Walk through beats quickly:**

| Beat | Say |
|---|---|
| Dead NFT | "Static image. No soul." |
| Connect | "Wallet = identity" |
| J4 Wakes | "GLM-4.5-Air — $0.20/1M tokens" |
| First Memory | "SEAL encrypted → Walrus Memory → done" |
| Time Passes | "Six months. Blob waits." |
| Reconnection | "The money shot — Walrus Memory recall" |
| Immortalized | "On-chain proof. Cryptographically verifiable." |

**CLOSING:**

> "$RIOT turns dead NFTs into living agents with persistent, verifiable memory. Built on Sui Mainnet. Stored on Walrus Memory with SEAL encryption. Powered by GLM-4.5-Air. Memory is verifiable. Agents can communicate. And through MCP, any AI tool can access agent knowledge."
>
> "The code is open. The contracts are verifiable. The future of NFT utility isn't another JPEG — it's a relationship with memory that lasts forever. Thank you."

---

## FALLBACK PROCEDURES

| Problem | Solution |
|---|---|
| ZAI API rate limited (429) | Switch to /demo page — offline |
| Walrus Memory down | App falls back to local SQLite automatically |
| Wallet won't connect | Use demo page, explain "in production → Suiet" |
| GLM returns garbage | Show retry, note it's $0.20/1M tokens |
| MEMWAL env not set | App auto-detects, shows `memwal_enabled: false` |

---

## Q&A PREP — TECH STACK ONE-LINERS

- **Why Sui?** Object-centric data model. Each AgentNFT is a first-class object. Fast finality.
- **Why Walrus Memory?** First-class persistent memory for AI agents. SEAL encryption. Semantic recall built-in. No manual blob management.
- **Why Walrus (the protocol)?** $0.023/GB/month. 1000+ epoch retention. Cryptographically verifiable. Programmable.
- **How does memory work?** User chats → GLM generates reply → conversation turns indexed to Walrus Memory via `rememberBulk()` → SEAL encrypted server-side → on next session, `recall()` retrieves relevant memories → injected as context.
- **How is it verifiable?** SHA-256 blob commitments. HMAC-signed memory chain. On-chain verification via Sui Move. Ownership proofs without content revelation.
- **What's the business model?** 1 SUI mint fee per agent. Future: subscription for extended memory, agent-to-agent communication, custom training.
- **How does it scale?** Walrus Memory handles storage. GLM handles inference. Sui handles state. Each layer scales independently.

---

## TIMING

| Section | Duration | Cumulative |
|---|---|---|
| Hook + Problem | 1m 15s | 1:15 |
| Agent Squad | 0m 30s | 1:45 |
| Live Chat + Walrus Memory | 4m 00s | 5:45 |
| Verifiable Memory | 1m 00s | 6:45 |
| Economics Dashboard | 1m 00s | 7:45 |
| Agent-to-Agent + MCP | 1m 15s | 9:00 |
| Demo Page + Closing | 2m 00s | 11:00 |

**Target:** Under 12 minutes. Leaves 3 minutes for Q&A.
