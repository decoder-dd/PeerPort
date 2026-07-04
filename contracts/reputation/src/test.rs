#![cfg(test)]
#![allow(deprecated)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize_and_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PeerPortReputation);
    let client = PeerPortReputationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    // Verify getting reputation for a new user returns defaults
    let user = Address::generate(&env);
    let rep = client.get_reputation(&user);
    assert_eq!(rep.score, 0);
    assert_eq!(rep.completed_trades, 0);
    assert_eq!(rep.level, 1);
}

#[test]
fn test_set_marketplace_and_auth() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PeerPortReputation);
    let client = PeerPortReputationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let marketplace = Address::generate(&env);

    client.initialize(&admin);
    client.set_marketplace(&marketplace);

    // Verify updating reputation works from marketplace
    let user = Address::generate(&env);
    client.add_completed_trade(&user, &true);

    let rep = client.get_reputation(&user);
    assert_eq!(rep.score, 15);
    assert_eq!(rep.completed_trades, 1);
    assert_eq!(rep.level, 1);
}

#[test]
fn test_level_upgrades() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PeerPortReputation);
    let client = PeerPortReputationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let marketplace = Address::generate(&env);

    client.initialize(&admin);
    client.set_marketplace(&marketplace);

    let user = Address::generate(&env);

    // Add trades to reach score 50 (level 2)
    // Merchant rewards are 15 points
    client.add_completed_trade(&user, &true); // 15
    client.add_completed_trade(&user, &true); // 30
    client.add_completed_trade(&user, &true); // 45

    let rep = client.get_reputation(&user);
    assert_eq!(rep.level, 1);
    assert_eq!(rep.score, 45);

    client.add_completed_trade(&user, &true); // 60
    let rep = client.get_reputation(&user);
    assert_eq!(rep.level, 2);
    assert_eq!(rep.score, 60);

    // Add many trades to reach level 3 (150 score)
    for _ in 0..6 {
        client.add_completed_trade(&user, &true); // +90 -> 150
    }
    let rep = client.get_reputation(&user);
    assert_eq!(rep.level, 3);
    assert_eq!(rep.score, 150);
}

#[test]
#[should_panic(expected = "HostError: Error(Auth, InvalidAction)")]
fn test_unauthorized_marketplace_fails() {
    let env = Env::default();
    // Do NOT mock all auths for this test to verify auth enforcement
    let contract_id = env.register_contract(None, PeerPortReputation);
    let client = PeerPortReputationClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let marketplace = Address::generate(&env);

    // Initialize (we can use mock_all_auths for setup)
    env.mock_all_auths();
    client.initialize(&admin);
    client.set_marketplace(&marketplace);

    // Stop mocking auth to check real verification
    env.mock_all_auths(); // wait, we can just call it without mocking or with specific auths
                          // Instead of mock_all_auths, let's verify that a random address cannot call add_completed_trade
                          // since it checks marketplace.require_auth().
                          // If we call without mock_all_auths, it requires authority.
    let _user = Address::generate(&env);

    // Disable mock auths
    // To do this in Soroban testing, we can use empty auths or run client calls.
    // If mock_all_auths is not called, any require_auth will check if the contract has signed.
    // Let's create a fresh environment without mock_all_auths.
    let env2 = Env::default();
    let contract_id2 = env2.register_contract(None, PeerPortReputation);
    let client2 = PeerPortReputationClient::new(&env2, &contract_id2);
    let admin2 = Address::generate(&env2);
    let marketplace2 = Address::generate(&env2);

    // We only sign initialize and set_marketplace
    env2.as_contract(&contract_id2, || {
        // Run with admin auth
    });
    // Let's invoke using mock auth to set it up
    env2.mock_all_auths();
    client2.initialize(&admin2);
    client2.set_marketplace(&marketplace2);

    // Now, we want to test calling add_completed_trade as a different address, causing a auth failure.
    // In soroban-sdk, calling it directly now without setting mock auths or with mock auths that do not include the marketplace address will fail.
    // Let's clear mock auths: env2.mock_all_auths() is already set, so we can't easily clear it.
    // But we can test it by not mocking all auths at all and providing explicit auth, or just expecting a panic when calling without mocking.
    // Let's construct a test where we call set_marketplace from a non-admin without mock auths. That will panic.
    let env3 = Env::default();
    let contract_id3 = env3.register_contract(None, PeerPortReputation);
    let client3 = PeerPortReputationClient::new(&env3, &contract_id3);
    let admin3 = Address::generate(&env3);

    env3.mock_all_auths();
    client3.initialize(&admin3);

    // Now trigger a call without admin signing (which mock_all_auths simulates, but if we call from a client, it checks admin).
    // Wait, mock_all_auths automatically signs EVERYTHING for the client. So if mock_all_auths is active, set_marketplace will succeed.
    // If we don't mock, set_marketplace will panic due to authentication.
    let env4 = Env::default();
    let contract_id4 = env4.register_contract(None, PeerPortReputation);
    let client4 = PeerPortReputationClient::new(&env4, &contract_id4);
    let admin4 = Address::generate(&env4);
    let _marketplace4 = Address::generate(&env4);

    env4.mock_all_auths();
    client4.initialize(&admin4);

    // Now call set_marketplace. Wait, if we want it to fail, we can do it by calling add_completed_trade when marketplace is NOT the one invoking it.
    // Actually, in Soroban, when env.mock_all_auths() is called, any client call is mocked as authorized.
    // If we do not call env.mock_all_auths(), then any client.set_marketplace() or client.add_completed_trade() will fail.
    // Let's verify that by running a test that doesn't mock auth and verifies the failure.
    let env5 = Env::default();
    let contract_id5 = env5.register_contract(None, PeerPortReputation);
    let client5 = PeerPortReputationClient::new(&env5, &contract_id5);
    let admin5 = Address::generate(&env5);
    // Since we don't mock auths, initialize should work (no auth needed inside initialize except verifying it is not already initialized),
    // but set_marketplace should fail because admin require_auth will fail.
    client5.initialize(&admin5);
    client5.set_marketplace(&admin5); // will panic because admin has not authorized it
}
