#[test_only]
module riot_agents::agent_nft_tests {
    use sui::test_scenario;
    use riot_agents::agent_nft::{Self, AgentNFT};
    use std::string;
    use std::vector;
    use sui::coin;

    const MINT_PRICE: u64 = 1_000_000_000;

    #[test]
    fun test_mint_creates_valid_agent() {
        let mut scenario = test_scenario::begin(@0xA11CE);
        let ctx = scenario.ctx();

        let coin = coin::mint_for_testing<MINT_PRICE>(ctx);
        let agent_id = string::utf8(b"J4");
        let soul_hash = x"deadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef";

        agent_nft::mint_agent(coin, agent_id, soul_hash, ctx);

        scenario.next_tx(@0xA11CE);

        let agent: AgentNFT = scenario.take_from_sender<AgentNFT>();

        assert!(*agent_nft::agent_id(&agent) == string::utf8(b"J4"), 0);
        assert!(agent_nft::get_evolution_count(&agent) == 0, 1);
        assert!(vector::length(agent_nft::soul_hash(&agent)) == 32, 2);

        scenario.return_to_sender(agent)
    }

    #[test]
    fun test_immortalize_increments_evolution_count() {
        let mut scenario = test_scenario::begin(@0xB0B);
        let ctx = scenario.ctx();

        let coin = coin::mint_for_testing<MINT_PRICE>(ctx);
        agent_nft::mint_agent(coin, string::utf8(b"J1"), x"aa", ctx);

        scenario.next_tx(@0xB0B);

        let mut agent: AgentNFT = scenario.take_from_sender<AgentNFT>();
        assert!(agent_nft::get_evolution_count(&agent) == 0, 10);

        agent_nft::immortalize_memory(
            &mut agent,
            string::utf8(b"blob_001"),
            x"txhash_001",
            scenario.ctx()
        );

        assert!(agent_nft::get_evolution_count(&agent) == 1, 11);

        agent_nft::immortalize_memory(
            &mut agent,
            string::utf8(b"blob_002"),
            x"txhash_002",
            scenario.ctx()
        );

        assert!(agent_nft::get_evolution_count(&agent) == 2, 12);

        scenario.return_to_sender(agent)
    }

    #[test]
    fun test_event_emission_on_mint() {
        let mut scenario = test_scenario::begin(@0xEVNT);
        let ctx = scenario.ctx();

        let coin = coin::mint_for_testing<MINT_PRICE>(ctx);
        agent_nft::mint_agent(coin, string::utf8(b"J7"), x"bb", ctx);

        scenario.next_tx(@0xEVNT);

        let _: AgentNFT = scenario.take_from_sender<AgentNFT>();
        scenario.return_to_sender(_);

        scenario.next_tx(@0xEVNT);

        let emitted_soul_minted = scenario::event::<riot_agents::events::SoulMinted>(&scenario);
        assert!(emitted_soul_minted.agent_id == string::utf8(b"J7"), 20)
    }

    #[test]
    #[expected_failure(abort_code = riot_agents::agent_nft::EMintPriceInsufficient)]
    fun test_insufficient_payment_fails() {
        let mut scenario = test_scenario::begin(@0xCHEAP);
        let ctx = scenario.ctx();

        let coin = coin::mint_for_testing(100)(ctx);
        agent_nft::mint_agent(coin, string::utf8(b"J99"), x"cc", ctx);

        abort 99
    }
}
