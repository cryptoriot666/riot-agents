module riot_agents::agent_nft {
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::clock;
    use riot_agents::events;

    const EMintPriceInsufficient: u64 = 0;
    const EInvalidAgentId: u64 = 1;
    const ESoulHashEmpty: u64 = 2;
    const MINT_PRICE: u64 = 1_000_000_000;

    public struct AgentNFT has key, store {
        id: UID,
        agent_id: String,
        soul_hash: vector<u8>,
        minted_at: u64,
        owner: address,
        evolution_count: u64,
    }

    public struct AgentMinted has copy, drop {
        agent: ID,
        agent_id: String,
        soul_hash: vector<u8>,
        ts: u64,
    }

    public struct TreasuryCap has key {
        id: UID,
        cap: coin::TreasuryCap<SUI>,
    }

    fun init(ctx: &mut TxContext) {
        let treasury_cap = coin::TreasuryCap<SUI> { id: object::new(ctx) };
        transfer::share_object(TreasuryCap {
            id: object::new(ctx),
            cap: treasury_cap,
        })
    }

    public entry fun mint_agent(coin: Coin<SUI>, agent_id: String, soul_hash: vector<u8>, ctx: &mut TxContext) {
        assert!(string::length(&agent_id) > 0, EInvalidAgentId);
        assert!(vector::length(&soul_hash) > 0, ESoulHashEmpty);

        let value = coin::value(&coin);
        assert!(value >= MINT_PRICE, EMintPriceInsufficient);

        let minted_at = clock::timestamp_ms();
        let sender = tx_context::sender(ctx);

        let agent = AgentNFT {
            id: object::new(ctx),
            agent_id,
            soul_hash,
            minted_at,
            owner: sender,
            evolution_count: 0,
        };

        let agent_id_copy = agent.agent_id;
        let soul_hash_copy = agent.soul_hash;

        events::emit_soul_minted(object::id(&agent), agent_id_copy, soul_hash_copy, minted_at);

        coin::destroy_zero(coin);
        transfer::public_transfer(agent, sender)
    }

    public entry fun immortalize_memory(agent: &mut AgentNFT, memory_blob_id: String, tx_hash: vector<u8>, ctx: &mut TxContext) {
        agent.evolution_count = agent.evolution_count + 1;

        let ts = clock::timestamp_ms();
        events::emit_memory_immortalized(object::id(agent), memory_blob_id, tx_hash, ts)
    }

    public fun get_agent(agent: &AgentNFT): &AgentNFT {
        agent
    }

    public fun get_evolution_count(agent: &AgentNFT): u64 {
        agent.evolution_count
    }

    public fun agent_id(agent: &AgentNFT): &String {
        &agent.agent_id
    }

    public fun soul_hash(agent: &AgentNFT): &vector<u8> {
        &agent.soul_hash
    }

    public fun minted_at(agent: &AgentNFT): u64 {
        agent.minted_at
    }
}
