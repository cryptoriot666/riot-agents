# $RIOT — DEMO DAY RUNBOOK

## SUI Overflow 2026 — Live Demo Script

### PRE-FLIGHT CHECKLIST (10 min before)

- [ ] `npm run dev` running on localhost:3000
- [ ] `.env.local` has `ZAI_API_KEY` set
- [ ] Suiet wallet extension installed in browser (with test SUI)
- [ ] Projector at 1920×1080
- [ ] Browser zoom at 100%
- [ ] All tabs closed except demo tab
- [ ] Phone on silent

---

### BEAT 0: THE HOOK (30 sec)

**Action:** Open http://localhost:3000

**Say:** 
> "17 billion dollars of NFT market cap evaporated. 95% of all NFTs are dead — static JPEGs nobody looks at, nobody uses. Today I'm showing you $RIOT — a resurrection machine. Every dead NFT gets a living AI agent with persistent memory stored on Walrus. Let me show you."

**Screen:** Landing page loads. Massive "$RIOT." text. J4 evidence photo.

---

### BEAT 1: THE PROBLEM (45 sec)

**Action:** Scroll to stat cards

**Say:**
> "Look at these numbers. Market cap crashed from 17B to 1.5B. 95% of NFTs are functionally dead. Zero utility for holders. The model is broken. We're not making another PFP collection. We're giving every NFT a soul."

---

### BEAT 2: MEET THE SQUAD (30 sec)

**Action:** Click "MEET THE AGENTS →" or navigate to /agents

**Say:**
> "25 agents. Each one has a unique personality, a unique role, and a unique soul hash on-chain. J4 here is our demo star — The Guide. Punk energy, Jakarta street tone, remembers everything you tell it. Click any agent to chat."

---

### BEAT 3: LIVE CHAT (2 min)

**Action:** Navigate to /agents/J4, connect wallet, type:

```
Nama gue Nanda, hodl BTC, target $220k
```

**Say:**
> "Watch this. I connect my wallet — that's my identity, my encryption key source. I tell J4 my name, my hold, my target. It responds naturally. In Indonesian slang. And here's the key — that conversation just got AES-256 encrypted and stored on Walrus. Not in our database. On decentralized storage. With 1000+ epoch retention."

---

### BEAT 4: MEMORY TEST (2 min)

**Action:** Type:

```
eh J4, ingat gue?
```

**Say:**
> "Now the moment of truth. Most AI chatbots forget everything when you refresh. Watch what happens when I ask J4 if it remembers me."

**Wait for response**

> "It knows my name. It knows I hold Bitcoin. It knows my $220k target. This isn't a prompt injection — this is real memory retrieved from Walrus, decrypted with my wallet-derived key, and injected into context. The agent REMEMBERS."

---

### BEAT 5: IMMORTALIZE (1 min)

**Action:** Click "⚡ IMMORTALIZE" button

**Say:**
> "Every meaningful conversation can be immortalized on-chain. When I click this, we write the Walrus blob ID to the Sui blockchain via our Move contract. The evolution count increments. This creates an auditable, permanent proof that this memory exists."

**Show tx confirmation modal**

> "Transaction digest, gas cost, blob ID — everything transparent on Suiscan."

---

### BEAT 6: DEMO PAGE (3 min)

**Action:** Navigate to /demo, click "RUN DEMO"

**Say:**
> "For the judges who want the full story without live API calls, I built a self-contained demo mode. Seven beats. Each one tells part of the resurrection story."

**Walk through each beat clicking NEXT ▶:**

| Beat | What to say |
|------|------------|
| **Beat 1 - Dead NFT** | "This is what we're fixing. A static image. No soul." |
| **Beat 2 - Connect Wallet** | "Wallet = identity = encryption key. No passwords." |
| **Beat 3 - J4 Wakes Up** | "GLM-4.5-Air powers the mind. Cheap, fast, smart." |
| **Beat 4 - First Memory** | "Conversation encrypted, stored on Walrus. Done." |
| **Beat 5 - Time Passes** | "Six months of silence. The blob waits." |
| **Beat 6 - Reconnection** | "**This is the money shot.** J4 remembers Nanda. BTC target. Everything." |
| **Beat 7 - Immortalized** | "On-chain proof. Suiscan link. Undeniable." |

---

### BEAT 7: DASHBOARD (1 min)

**Action:** Navigate to /dashboard

**Say:**
> "Your command center. Every agent you've talked to, every evolution count, every kilobyte of encrypted memory. One-click backup export. Tatum-powered analytics coming soon. Full transparency."

---

### CLOSING (30 sec)

**Say:**
> "$RIOT turns dead NFTs into living agents with persistent memory. Built on Sui Mainnet, stored on Walrus, powered by GLM-4.5-Air. The code is open. The contracts are verifiable. The future of NFT utility isn't another picture — it's a relationship. Thank you."

**Screen:** Back to landing page. Big "$RIOT." 

---

### FALLBACK PROCEDURES

| Problem | Solution |
|---------|----------|
| ZAI API rate limited (429) | Switch to `/demo` page — it works offline |
| Wallet won't connect | Use demo page, explain "in production this connects to Suiet" |
| Walrus store fails | Show error card with retry — explain fallback to local cache |
| GLM returns garbage | Explain it's a cheap model ($0.20/1M tokens), show retry works |
| Projector glitch | App is mobile-responsive, can present from laptop screen |
| Judge asks about tokenomics | "No token. SUI payments only. Mint price is 1 SUI." |
| Judge asks about scaling | "Walrus handles storage. GLM handles inference. Sui handles state. Each layer scales independently." |

---

### TECH STACK ONE-LINERS FOR Q&A

- **Why Sui?** Object-centric model = each AgentNFT is a first-class object. Fast finality. Low gas.
- **Why Walrus?** Decentralized file storage with programmable retention. AES-256-GCM before upload.
- **Why GLM-4.5-Air?** $0.20 per 1M tokens. Good enough for personality-driven chat. OpenAI-compatible API.
- **How does memory work?** Chat → encrypt with wallet-derived key → store on Walrus blob → retrieve + decrypt on next session → inject into GLM context window.
- **What's the business model?** 1 SUI mint fee per agent. Future: subscription for extended memory, custom agent training, agent-to-agent communication.
- **Is this production ready?** Smart contracts tested and compiled. Frontend functional. Memory system working end-to-end. This is MVP for demo day — mainnet publish ready.

---

### TIMING SUMMARY

| Section | Duration | Cumulative |
|---------|----------|-----------|
| Hook + Problem | 1m 15s | 1:15 |
| Agent Squad | 0m 30s | 1:45 |
| Live Chat + Memory | 4m 00s | 5:45 |
| Immortalize | 1m 00s | 6:45 |
| Demo Page Walkthrough | 3m 00s | 9:45 |
| Dashboard | 1m 00s | 10:45 |
| Closing | 0m 30s | **11:15** |

**Target: under 12 minutes. Leaves 3 minutes for Q&A in a 15-minute slot.**
