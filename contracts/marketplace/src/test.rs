#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events},
    Address, Env, IntoVal, String,
    token
};

// We define a mock reputation contract structure to test calls from the marketplace.
#[contract]
pub struct MockReputation;

#[contractimpl]
impl MockReputation {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }
    
    pub fn set_marketplace(env: Env, marketplace: Address) {
        env.storage().instance().set(&symbol_short!("mkt"), &marketplace);
    }

    pub fn add_completed_trade(env: Env, user: Address, is_merchant: bool) {
        // Assert caller is verified (or just track updates)
        let key = symbol_short!("trades");
        let current: u32 = env.storage().instance().get(&key).unwrap_or(0);
        env.storage().instance().set(&key, &(current + 1));
        
        // Publish reputation event
        env.events().publish(
            (symbol_short!("rep_upd"), user),
            (10u32, 1u32, current + 1),
        );
    }

    pub fn get_trades(env: Env) -> u32 {
        env.storage().instance().get(&symbol_short!("trades")).unwrap_or(0)
    }
}

#[test]
fn test_initialize_and_create_listing() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin);
    let rep_id = env.register_contract(None, MockReputation);

    let mkt_id = env.register_contract(None, PeerPortMarketplace);
    let client = PeerPortMarketplaceClient::new(&env, &mkt_id);

    client.initialize(&admin, &token_id, &rep_id);

    let seller = Address::generate(&env);
    let title = String::from_str(&env, "Premium NFT");
    let desc = String::from_str(&env, "A rare collectible");
    let price = 100i128;

    let listing_id = client.create_listing(&seller, &price, &title, &desc);
    assert_eq!(listing_id, 1);

    let listing = client.get_listing(&1).unwrap();
    assert_eq!(listing.id, 1);
    assert_eq!(listing.seller, seller);
    assert_eq!(listing.price, 100i128);
    assert_eq!(listing.status, 1); // Open
    assert_eq!(listing.title, title);
}

#[test]
fn test_buy_and_escrow_locking() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    
    // Setup Stellar Asset Contract (Token)
    let token_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = token::StellarAssetClient::new(&env, &token_id);
    let token_util_client = token::Client::new(&env, &token_id);

    let rep_id = env.register_contract(None, MockReputation);
    let mkt_id = env.register_contract(None, PeerPortMarketplace);
    let client = PeerPortMarketplaceClient::new(&env, &mkt_id);

    client.initialize(&admin, &token_id, &rep_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    // Mint tokens to buyer
    token_client.mint(&buyer, &500i128);
    assert_eq!(token_util_client.balance(&buyer), 500i128);

    let title = String::from_str(&env, "Developer Service");
    let desc = String::from_str(&env, "Soroban Smart Contract Auditing");
    let price = 200i128;

    let listing_id = client.create_listing(&seller, &price, &title, &desc);

    // Buy Listing
    client.buy_listing(&buyer, &listing_id);

    // Assert funds are locked in marketplace contract address
    assert_eq!(token_util_client.balance(&buyer), 300i128);
    assert_eq!(token_util_client.balance(&mkt_id), 200i128);

    // Verify listing state
    let listing = client.get_listing(&listing_id).unwrap();
    assert_eq!(listing.status, 2); // Locked
    assert_eq!(listing.buyer.unwrap(), buyer);
}

#[test]
fn test_complete_listing_releases_escrow_and_triggers_reputation() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    
    let token_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = token::StellarAssetClient::new(&env, &token_id);
    let token_util_client = token::Client::new(&env, &token_id);

    let rep_id = env.register_contract(None, MockReputation);
    let rep_client = MockReputationClient::new(&env, &rep_id);
    
    let mkt_id = env.register_contract(None, PeerPortMarketplace);
    let client = PeerPortMarketplaceClient::new(&env, &mkt_id);

    client.initialize(&admin, &token_id, &rep_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    
    token_client.mint(&buyer, &1000i128);

    let title = String::from_str(&env, "Physical Good");
    let desc = String::from_str(&env, "Handmade leather wallet");
    let price = 400i128;

    let listing_id = client.create_listing(&seller, &price, &title, &desc);
    client.buy_listing(&buyer, &listing_id);

    // Verify initial balances
    assert_eq!(token_util_client.balance(&buyer), 600i128);
    assert_eq!(token_util_client.balance(&mkt_id), 400i128);
    assert_eq!(token_util_client.balance(&seller), 0i128);
    assert_eq!(rep_client.get_trades(), 0);

    // Complete Listing
    client.complete_listing(&buyer, &listing_id);

    // Verify funds released to seller
    assert_eq!(token_util_client.balance(&mkt_id), 0i128);
    assert_eq!(token_util_client.balance(&seller), 400i128);

    // Verify reputation contract completed trades incremented
    // Complete listing triggers two trade updates (one for seller, one for buyer)
    assert_eq!(rep_client.get_trades(), 2);

    let listing = client.get_listing(&listing_id).unwrap();
    assert_eq!(listing.status, 3); // Completed
}

#[test]
fn test_cancel_listing() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin);
    let rep_id = env.register_contract(None, MockReputation);

    let mkt_id = env.register_contract(None, PeerPortMarketplace);
    let client = PeerPortMarketplaceClient::new(&env, &mkt_id);

    client.initialize(&admin, &token_id, &rep_id);

    let seller = Address::generate(&env);
    let title = String::from_str(&env, "Listing to cancel");
    let desc = String::from_str(&env, "Will not sell this");
    let price = 50i128;

    let listing_id = client.create_listing(&seller, &price, &title, &desc);
    
    // Cancel listing
    client.cancel_listing(&seller, &listing_id);

    let listing = client.get_listing(&listing_id).unwrap();
    assert_eq!(listing.status, 4); // Cancelled
}
