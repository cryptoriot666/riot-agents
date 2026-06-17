# $RIOT — Resurrection Machine for Dead NFTs

**Living AI agents on Sui Mainnet with persistent memory on Walrus.**

Punk zine aesthetic. Walrus Memory SDK. Demo-day ready.

> **Sui Overflow 2026 — Walrus Track**

---

## 🧠 Walrus Memory Integration (NEW)

RIOT now uses **Walrus Memory SDK** (`@mysten-incubation/memwal`) as its primary memory backend:

- **Server-side SEAL encryption** — zero plaintext touches our servers
- **Semantic recall built-in** — no external embedding API needed
- **Bulk conversation indexing** — up to 20 turns per batch
- **Cross-agent recall** — search memories across all 25 agents
- **Automatic fact extraction** via `analyze()` — the server extracts entities, preferences, and events from conversation
- **Dual backend** — falls back to SQLite when MEMWAL not configured

### Architecture

```
User Chat → GLM-4.5-Air → reply
                ↑
        Walrus Memory recall()
        (injects past memories as context)
                ↓
        Walrus Memory rememberBulk()
        (persists each turn, SEAL encrypted)
```

### Quick Test

```bash
# Check Walrus Memory health
curl http://localhost:3000/api/walrus-memory/status
```

Expected response:
```json
{
  "memwal_enabled": true,
  "server_health": { "status": "ok", "version": "..." },
  "mode": "walrus_memory"
}
```

---

## 🔧 Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `ZAI_API_KEY` | z.ai API key for GLM-4.5-Air |
| `MEMWAL_PRIVATE_KEY` | Walrus Memory delegate key (Ed25519 hex) |
| `MEMWAL_ACCOUNT_ID` | Walrus Memory account object ID |
| `MEMWAL_SERVER_URL` | Relayer URL (default: https://relayer.memory.walrus.xyz) |

```bash
npm run dev   # → http://localhost:3000
```

---

## 📁 Project Structure

```
riot-agents/
├── move/riot_agents/          # Sui Move contracts
│   └── sources/
│       ├── agent_nft.move     # AgentNFT, mint, immortalize
│       └── events.move        # SoulMinted, MemoryImmortalized
├── src/
│   ├── lib/
│   │   ├── memwal.ts          # 🆕 Walrus Memory SDK client
│   │   ├── memory.ts          # Dual backend: MemWal + SQLite fallback
│   │   ├── glm.ts             # GLM-4.5-Air chat + memory context injection
│   │   ├── walrus.ts          # Legacy Walrus blob storage
│   │   ├── sui.ts             # Sui PTB wrapper (mint, immortalize)
│   │   ├── crypto.ts          # PBKDF2 wallet-derived AES-256-GCM
│   │   ├── souls.ts           # 25 agent personality definitions
│   │   └── demo.ts            # Demo flow runner
│   ├── app/api/
│   │   ├── chat/route.ts      # Chat endpoint (MemWal-backed)
│   │   ├── agent/[id]/
│   │   │   ├── recall/route.ts    # Semantic recall endpoint
│   │   │   ├── stats/route.ts     # Memory stats
│   │   │   └── introduce/route.ts # Agent introduction
│   │   └── walrus-memory/
│   │       └── status/route.ts    # 🆕 Walrus Memory health check
│   └── ...
└── .env.local.example
```

---

## 🛠 Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run build:move` | Compile Move package |
| `npm run test:move` | Run Move unit tests |
| `npm run typecheck` | TypeScript type checking |

---

## 🎯 Demo Flow

1. **Landing** → hero, stats, wallet CTA
2. **Gallery** → 25-agent grid
3. **Chat** → live conversation with Walrus Memory recall
4. **Immortalize** → on-chain proof via Sui Move
5. **Dashboard** → owned agents, analytics, backup

---

## 📊 Tech Stack

| Layer | Tech | Purpose |
|---|---|---|
| Frontend | Next.js 14 + Tailwind + Framer Motion | Punk zine UI, Suiet Kit wallet |
| On-chain | Sui Move | AgentNFT ownership, evolution tracking |
| **Memory** | **Walrus Memory SDK** | SEAL-encrypted AI memory, semantic recall |
| AI | GLM-4.5-Air via z.ai | Chat ($0.20/1M tokens), embeddings |
| Storage | Walrus (legacy) | Encrypted blob backup |
| Encryption | SEAL (Walrus Memory) + AES-256-GCM | Zero plaintext guarantee |

---

*Built for Sui Overflow 2026 — Walrus Track*
