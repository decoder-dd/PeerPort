#![no_std]

pub mod storage;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, BytesN, String, token};
use crate::storage::{
    get_admin, set_admin, has_admin,
    get_token, set_token,
    get_reputation, set_reputation,
    increment_listing_counter,
    get_listing, set_listing, Listing
};

#[soroban_sdk::contractclient(name = "ReputationClient")]
pub trait ReputationInterface {
    fn add_completed_trade(env: soroban_sdk::Env, user: soroban_sdk::Address, is_merchant: bool);
}

#[contract]
pub struct PeerPortMarketplace;

#[contractimpl]
impl PeerPortMarketplace {
    pub fn initialize(env: Env, admin: Address, token: Address, reputation: Address) {
        if has_admin(&env) {
            panic!("Already initialized");
        }
        set_admin(&env, &admin);
        set_token(&env, &token);
        set_reputation(&env, &reputation);
    }

    pub fn create_listing(env: Env, seller: Address, price: i128, title: String, description: String) -> u32 {
        seller.require_auth();
        if price <= 0 {
            panic!("Price must be positive");
        }

        let id = increment_listing_counter(&env);
        let listing = Listing {
            id,
            seller: seller.clone(),
            buyer: None,
            price,
            status: 1, // Open
            title: title.clone(),
            description: description.clone(),
        };

        set_listing(&env, id, &listing);

        // Emit ListingCreated event
        env.events().publish(
            (symbol_short!("lst_cred"), id),
            (seller, price, title),
        );

        id
    }

    pub fn buy_listing(env: Env, buyer: Address, listing_id: u32) {
        buyer.require_auth();
        
        let mut listing = get_listing(&env, listing_id).expect("Listing not found");
        if listing.status != 1 {
            panic!("Listing is not open");
        }

        let token_addr = get_token(&env).expect("Token not initialized");
        let token_client = token::Client::new(&env, &token_addr);

        // Transfer funds from buyer to this contract (escrow lock)
        token_client.transfer(&buyer, &env.current_contract_address(), &listing.price);

        listing.buyer = Some(buyer.clone());
        listing.status = 2; // Locked/Paid

        set_listing(&env, listing_id, &listing);

        // Emit ListingLocked event
        env.events().publish(
            (symbol_short!("lst_lock"), listing_id),
            (buyer, listing.price),
        );
    }

    pub fn complete_listing(env: Env, buyer: Address, listing_id: u32) {
        buyer.require_auth();

        let mut listing = get_listing(&env, listing_id).expect("Listing not found");
        if listing.status != 2 {
            panic!("Listing is not locked");
        }

        let listing_buyer = listing.buyer.clone().expect("Listing has no buyer");
        if listing_buyer != buyer {
            panic!("Only the buyer can complete the listing");
        }

        let token_addr = get_token(&env).expect("Token not initialized");
        let token_client = token::Client::new(&env, &token_addr);

        // Release escrowed funds from contract to seller
        token_client.transfer(&env.current_contract_address(), &listing.seller, &listing.price);

        listing.status = 3; // Completed
        set_listing(&env, listing_id, &listing);

        // Call reputation contract to award trade points
        let reputation_addr = get_reputation(&env).expect("Reputation contract address not set");
        let reputation_client = ReputationClient::new(&env, &reputation_addr);
        
        // Reward seller (merchant: true)
        reputation_client.add_completed_trade(&listing.seller, &true);
        // Reward buyer (merchant: false)
        reputation_client.add_completed_trade(&buyer, &false);

        // Emit ListingCompleted event
        env.events().publish(
            (symbol_short!("lst_comp"), listing_id),
            (listing.seller, buyer),
        );
    }

    pub fn cancel_listing(env: Env, seller: Address, listing_id: u32) {
        seller.require_auth();

        let mut listing = get_listing(&env, listing_id).expect("Listing not found");
        if listing.status != 1 {
            panic!("Only open listings can be cancelled");
        }
        if listing.seller != seller {
            panic!("Only the seller can cancel the listing");
        }

        listing.status = 4; // Cancelled
        set_listing(&env, listing_id, &listing);

        // Emit ListingCancelled event
        env.events().publish(
            (symbol_short!("lst_canc"), listing_id),
            seller,
        );
    }

    pub fn get_listing(env: Env, listing_id: u32) -> Option<Listing> {
        get_listing(&env, listing_id)
    }

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin = get_admin(&env).expect("Contract not initialized");
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }
}
