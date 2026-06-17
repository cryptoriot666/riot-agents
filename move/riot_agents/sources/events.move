/// RIOT Agents — Event Module
/// Emits on-chain events for agent lifecycle (mint, memory immortalization).

module riot_agents::events {
    use std::string::String;
    use sui::event;

    /// Emitted when a new agent is minted.
    public struct SoulMinted has copy, drop {
        agent_id: String,
        soul_hash: vector<u8>,
        timestamp_ms: u64,
    }

    /// Emitted when a conversation is immortalized on-chain.
    public struct MemoryImmortalized has copy, drop {
        blob_id: String,
        tx_hash: vector<u8>,
        evolution_count: u64,
        timestamp_ms: u64,
    }

    /// Emit a SoulMinted event.
    public fun emit_soul_minted(agent_id: String, soul_hash: vector<u8>, ts: u64) {
        event::emit(SoulMinted {
            agent_id,
            soul_hash,
            timestamp_ms: ts,
        });
    }

    /// Emit a MemoryImmortalized event.
    public fun emit_memory_immortalized(blob_id: String, tx_hash: vector<u8>, evolution_count: u64, ts: u64) {
        event::emit(MemoryImmortalized {
            blob_id,
            tx_hash,
            evolution_count,
            timestamp_ms: ts,
        });
    }
}
