#![no_std]

pub mod storage;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, BytesN, Symbol};
use crate::storage::{
    get_admin, set_admin, has_admin,
    get_marketplace, set_marketplace,
    get_reputation, set_reputation,
    ReputationInfo
};

#[contract]
pub struct PeerPortReputation;

#[contractimpl]
impl PeerPortReputation {
    pub fn initialize(env: Env, admin: Address) {
        if has_admin(&env) {
            panic!("Already initialized");
        }
        set_admin(&env, &admin);
    }

    pub fn set_marketplace(env: Env, marketplace: Address) {
        let admin = get_admin(&env).expect("Contract not initialized");
        admin.require_auth();
        set_marketplace(&env, &marketplace);
    }

    pub fn add_completed_trade(env: Env, user: Address, is_merchant: bool) {
        // Authenticate that caller is the authorized marketplace
        let marketplace = get_marketplace(&env).expect("Marketplace contract not set");
        marketplace.require_auth();

        let mut rep = get_reputation(&env, &user);
        rep.completed_trades += 1;
        
        let reward = if is_merchant { 15 } else { 10 };
        rep.score += reward;

        // Upgrade level based on score threshold
        // Level 1: 0-49, Level 2: 50-149, Level 3: 150-399, Level 4: 400+
        let new_level = if rep.score >= 400 {
            4
        } else if rep.score >= 150 {
            3
        } else if rep.score >= 50 {
            2
        } else {
            1
        };

        if new_level > rep.level {
            rep.level = new_level;
        }

        set_reputation(&env, &user, &rep);

        // Emit ReputationUpdated event
        env.events().publish(
            (symbol_short!("rep_upd"), user.clone()),
            (rep.score, rep.level, rep.completed_trades),
        );
    }

    pub fn get_reputation(env: Env, user: Address) -> ReputationInfo {
        get_reputation(&env, &user)
    }

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin = get_admin(&env).expect("Contract not initialized");
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }
}
