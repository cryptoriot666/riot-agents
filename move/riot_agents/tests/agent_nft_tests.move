/// RIOT Agents — Unit Tests

#[test_only]
module riot_agents::agent_nft_tests {
    use std::string;
    use sui::coin;
    use sui::sui::SUI;
    use sui::test_scenario::{Self, Scenario};
    use riot_agents::agent_nft;

    const ONE_SUI: u64 = 1_000_000_000;

    #[test]
    fun test_mint_agent() {
        let mut scenario = test_scenario::begin(@0xA);
        let clock = scenario.clock();

        // Create payment coin
        let coin = coin::mint_for_testing<SUI>(ONE_SUI, scenario.ctx());

        // Mint agent
        {
            agent_nft::mint_agent(
                coin,
                string::utf8(b"J4"),
                x"abcdef1234567890",
                &clock,
                scenario.ctx(),
            );
        };

        // Verify agent owned by @0xA
        let agent = scenario.take_owned<agent_nft::AgentNFT>(@0xA);
        assert!(agent_nft::get_agent_id(&agent) == &string::utf8(b"J4"));
        assert!(agent_nft::get_evolution_count(&agent) == 0);
        assert!(agent_nft::get_owner(&agent) == @0xA);

        test_scenario::return_owned(scenario, agent);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_immortalize_memory() {
        let mut scenario = test_scenario::begin(@0xA);
        let clock = scenario.clock();

        let coin = coin::mint_for_testing<SUI>(ONE_SUI, scenario.ctx());

        // Mint
        agent_nft::mint_agent(coin, string::utf8(b"J4"), x"abcdef", &clock, scenario.ctx());

        // Immortalize
        let mut agent = scenario.take_owned<agent_nft::AgentNFT>(@0xA);
        agent_nft::immortalize_memory(
            &mut agent,
            string::utf8(b"blob_abc123"),
            x"deadbeef",
            &clock,
        );
        assert!(agent_nft::get_evolution_count(&agent) == 1);

        test_scenario::return_owned(scenario, agent);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = riot_agents::agent_nft::EWrongPrice)]
    fun test_mint_insufficient_payment() {
        let mut scenario = test_scenario::begin(@0xA);
        let clock = scenario.clock();

        let coin = coin::mint_for_testing<SUI>(ONE_SUI / 2, scenario.ctx());
        agent_nft::mint_agent(coin, string::utf8(b"J4"), x"abcdef", &clock, scenario.ctx());

        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiple_mints_and_evolutions() {
        let mut scenario = test_scenario::begin(@0xA);
        let clock = scenario.clock();

        // Mint J4
        let coin1 = coin::mint_for_testing<SUI>(ONE_SUI, scenario.ctx());
        agent_nft::mint_agent(coin1, string::utf8(b"J4"), x"aaa", &clock, scenario.ctx());

        // Mint J1
        let coin2 = coin::mint_for_testing<SUI>(ONE_SUI, scenario.ctx());
        agent_nft::mint_agent(coin2, string::utf8(b"J1"), x"bbb", &clock, scenario.ctx());

        // Immortalize J4 twice
        let mut j4 = scenario.take_owned<agent_nft::AgentNFT>(@0xA);
        agent_nft::immortalize_memory(&mut j4, string::utf8(b"blob1"), x"1111", &clock);
        agent_nft::immortalize_memory(&mut j4, string::utf8(b"blob2"), x"2222", &clock);
        assert!(agent_nft::get_evolution_count(&j4) == 2);
        test_scenario::return_owned(scenario, j4);

        // J1 should have 0 evolutions
        let j1 = scenario.take_owned<agent_nft::AgentNFT>(@0xA);
        assert!(agent_nft::get_evolution_count(&j1) == 0);
        test_scenario::return_owned(scenario, j1);

        test_scenario::end(scenario);
    }
}
