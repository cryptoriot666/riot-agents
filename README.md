# $RIOT — A Resurrection Machine for Dead NFTs

On-chain AI agents with persistent memory on Walrus (Sui Mainnet). Punk zine aesthetic. Demo-day ready.

## File Tree

```
riot-agents/
├── move/riot_agents/               # Sui Move contracts
│   ├── Move.toml
│   ├── sources/
│   │   ├── agent_nft.move           # AgentNFT struct, mint, immortalize_memory
│   │   └── events.move              # SoulMinted, MemoryImmortalized events
│   └── tests/
│       └── agent_nft_tests.move     # 4 tests: mint, immortalize, events, payment
├── src/
│   ├── app/
│   │   ├── layout.tsx               # SuietKit provider, Bebas Neue + IBM Plex Mono fonts
│   │   ├── page.tsx                 # Landing: hero, stats, CTA
│   │   ├── globals.css              # Punk zine styles, animations, utilities
│   │   ├── providers.tsx            # SuietWalletProvider wrapper
│   │   ├── agents/
│   │   │   ├── page.tsx             # 5×5 gallery grid with filter
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Chat interface + sidebar + immortalize modal
│   │   ├── dashboard/page.tsx       # Owned agents, analytics, export backup
│   │   ├── demo/page.tsx            # 7-beat self-contained demo flow
│   │   └── api/
│   │       ├── chat/route.ts        # POST → GLM chat + Walrus store
│   │       └── agent/[id]/
│   │           ├── introduce/route.ts  # POST → register alias
│   │           ├── recall/route.ts     # POST → semantic search
│   │           └── stats/route.ts      # GET → evolution + memory stats
│   ├── components/
│   │   ├── AgentTile.tsx            # Gallery card with halftone hover
│   │   ├── ChatBubble.tsx           # Message bubble + typing indicator
│   │   ├── WalletButton.tsx         # Suiet Kit connect/disconnect
│   │   ├── PunkPhoto.tsx            # B&W photo with multiply blend
│   │   ├── Stamp.tsx                # Red angled stamp overlay
│   │   ├── Tape.tsx                 # Yellow tape strip label
│   │   ├── Halftone.tsx             # Dot-pattern overlay div
│   │   ├── Marquee.tsx              # Scrolling text strip
│   │   └── ImmortalizeModal.tsx     # TX confirmation dialog
│   ├── lib/
│   │   ├── glm.ts                   # GLM-4.5-Air client (retry, token budget)
│   │   ├── souls.ts                 # 25 per-agent soul definitions
│   │   ├── crypto.ts                # PBKDF2 wallet-derived AES-256-GCM
│   │   ├── memory.ts                # SQLite embeddings + cosine recall
│   │   ├── walrus.ts                # Walrus blob encrypt/store/retrieve
│   │   ├── sui.ts                   # Sui PTB wrapper (mint, immortalize)
│   │   └── demo.ts                  # Nanda×J4 demo flow runner
│   └── data/
│       └── agents.ts                 # 25 agent registry + soul hash
├── public/
│   ├── agents/                      # J1.jpg–J10.jpg + placeholder.jpg
│   └── textures/
│       ├── paper.svg                # Paper grain texture
│       └── halftone.png             # Halftone dot pattern
├── tailwind.config.ts               # Custom colors, fonts, animations
├── next.config.js
├── package.json
├── tsconfig.json
├── .env.local.example
├── README.md
└── DEMO_DAY_RUNBOOK.md              # Step-by-step presenter script
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local — add ZAI_API_KEY from https://z.ai/manage-apikey/billing

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. (Optional) Compile & test Move contracts
npm run build:move
npm run test:move
```

## Build & Verify

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server on :3000 |
| `npm run build` | Production build (must pass clean) |
| `npm run build:move` | Compile Move package |
| `npm run test:move` | Run Move unit tests |
| `npm run typecheck` | TypeScript type checking |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — hero, stat cards, wallet CTA |
| `/agents` | Gallery — 25-agent grid with role filter |
| `/agents/[id]` | Chat — live interface with memory sidebar |
| `/dashboard` | Command center — owned agents, analytics |
| `/demo` | Self-contained 7-beat demo flow |

## API Routes

| Method | Path | Response |
|--------|------|----------|
| POST | `/api/chat` | `{reply, tokenUsage}` |
| POST | `/api/agent/:id/introduce` | `{alias, message}` |
| POST | `/api/agent/:id/recall` | `{memories[]}` |
| GET | `/api/agent/:id/stats` | `{evolutionCount, memoryCount}` |

## Architecture

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js 14 + Tailwind + Framer Motion | Punk zine UI, Suiet Kit wallet |
| On-chain | Sui Move | AgentNFT ownership, evolution tracking |
| Storage | Walrus | Encrypted conversation blobs (1000+ epochs) |
| AI | GLM-4.5-Air via z.ai | Chat completions ($0.20/1M tokens), embeddings |
| Memory | SQLite + cosine similarity | Semantic cross-session recall |
| Encryption | AES-256-GCM + PBKDF2 | Wallet-derived keys, zero plaintext |

## Design System

```
Colors:
  cream:    #F4EFE6  (background)
  ink:      #111111  (text, borders)
  blood:    #E63946  (accents, CTAs)
  highlight:#F4D35E  (tapes, badges)

Fonts:
  Display:  Bebas Neue (headings, stamps)
  Body:     IBM Plex Mono (UI, code, chat)

Effects:
  - Paper grain texture overlay
  - Halftone dot pattern on hover
  - Grayscale B&W photos with multiply blend
  - Random rotation (-3deg to 3deg) on cards
  - Red angled stamps, yellow tape strips
  - Marker highlight underlines
```

## Demo Day

See **[DEMO_DAY_RUNBOOK.md](./DEMO_DAY_RUNBOOK.md)** for the full presenter script:

- Pre-flight checklist
- 7-beat timed walkthrough (11 min total)
- Fallback procedures for every failure mode
- Q&A tech stack one-liners

## Constraints

- Every wallet action requires explicit user click
- Memory encryption MANDATORY before any storage
- All AI calls server-side only (`ZAI_API_KEY` never in client bundle)
- Loading states on every async operation — no blank screens
- Errors shown as punk-styled "SYSTEM FAILURE" cards with retry
- Chat disabled until wallet connected
- Token budget: 8K hard cap per conversation
- Optimized for 1920×1080 projector display
