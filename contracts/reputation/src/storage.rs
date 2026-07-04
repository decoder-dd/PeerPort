use soroban_sdk::{contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationInfo {
    pub score: u32,
    pub completed_trades: u32,
    pub level: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Marketplace,
    Reputation(Address),
}

pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Admin)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn get_marketplace(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Marketplace)
}

pub fn set_marketplace(env: &Env, marketplace: &Address) {
    env.storage().instance().set(&DataKey::Marketplace, marketplace);
}

pub fn get_reputation(env: &Env, user: &Address) -> ReputationInfo {
    let key = DataKey::Reputation(user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(ReputationInfo {
            score: 0,
            completed_trades: 0,
            level: 1,
        })
}

pub fn set_reputation(env: &Env, user: &Address, info: &ReputationInfo) {
    let key = DataKey::Reputation(user.clone());
    env.storage().persistent().set(&key, info);
    // Extend ttl for persistent storage
    env.storage().persistent().extend_ttl(&key, 10000, 50000);
}
