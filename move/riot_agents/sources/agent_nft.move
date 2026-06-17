/// RIOT Agents — AgentNFT Module
///
/// On-chain agent ownership via Sui objects. Each agent is an NFT
/// that tracks evolution (immortalized memories) and soul hash.
///
/// Mint price: 1 SUI (paid via coin::split from gas coin or transferred coin).

module riot_agents::agent_nft {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::event;
    use riot_agents::events;

    const MINT_PRICE: u64 = 1_000_000_000; // 1 SUI
    const EWrongPrice: u64 = 0;

    /// The Agent NFT — your living AI agent on Sui.
    public struct AgentNFT has key, store {
        id: UID,
        agent_id: String,
        soul_hash: vector<u8>,
        owner: address,
        evolution_count: u64,
        created_at: u64,
    }

    /// Init — creates the shared state (no TreasuryCap needed for simple mint).
    fun init(_ctx: &mut TxContext) {
        // No-op: we don't need a TreasuryCap since we accept payment directly
    }

    /// Mint a new agent NFT. Costs 1 SUI.
    /// The coin is burned (sent to the package) as payment.
    public fun mint_agent(
        mut payment: Coin<SUI>,
        agent_id: String,
        soul_hash: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify payment amount
        assert!(coin::value(&payment) >= MINT_PRICE, EWrongPrice);

        // Split exactly MINT_PRICE, destroy it (payment collected)
        let paid: Coin<SUI> = coin::split(&mut payment, MINT_PRICE, ctx);
        coin::destroy_zero(paid);

        // Refund any excess
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        let ts = clock::timestamp_ms(clock);
        let owner = tx_context::sender(ctx);

        // Create the agent NFT
        let agent = AgentNFT {
            id: object::new(ctx),
            agent_id,
            soul_hash,
            owner,
            evolution_count: 0,
            created_at: ts,
        };

        // Emit event
        events::emit_soul_minted(agent.agent_id, agent.soul_hash, ts);

        // Transfer to minter
        transfer::transfer(agent, owner);
    }

    /// Immortalize a memory — record a Walrus blob ID on-chain.
    public fun immortalize_memory(
        agent: &mut AgentNFT,
        memory_blob_id: String,
        tx_hash: vector<u8>,
        clock: &Clock,
    ) {
        agent.evolution_count = agent.evolution_count + 1;

        let ts = clock::timestamp_ms(clock);

        events::emit_memory_immortalized(
            memory_blob_id,
            tx_hash,
            agent.evolution_count,
            ts,
        );
    }

    // ── Getters ──────────────────────────────────────────────────

    public fun get_agent_id(agent: &AgentNFT): &String {
        &agent.agent_id
    }

    public fun get_evolution_count(agent: &AgentNFT): u64 {
        agent.evolution_count
    }

    public fun get_owner(agent: &AgentNFT): address {
        agent.owner
    }
}
