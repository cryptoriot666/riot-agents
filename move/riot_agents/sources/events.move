module riot_agents::events {
    use sui::event;

    public struct SoulMinted has copy, drop {
        agent: ID,
        agent_id: String,
        soul_hash: vector<u8>,
        ts: u64,
    }

    public struct MemoryImmortalized has copy, drop {
        agent: ID,
        blob_id: String,
        tx_hash: vector<u8>,
        ts: u64,
    }

    public fun emit_soul_minted(agent: ID, agent_id: String, soul_hash: vector<u8>, ts: u64) {
        event::emit(SoulMinted { agent, agent_id, soul_hash, ts })
    }

    public fun emit_memory_immortalized(agent: ID, blob_id: String, tx_hash: vector<u8>, ts: u64) {
        event::emit(MemoryImmortalized { agent, blob_id, tx_hash, ts })
    }
}
