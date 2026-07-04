use soroban_sdk::{contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Listing {
    pub id: u32,
    pub seller: Address,
    pub buyer: Option<Address>,
    pub price: i128,
    pub status: u32, // 1 = Open, 2 = Locked, 3 = Completed, 4 = Cancelled
    pub title: String,
    pub description: String,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    Reputation,
    ListingCounter,
    Listing(u32),
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

pub fn get_token(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Token)
}

pub fn set_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::Token, token);
}

pub fn get_reputation(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Reputation)
}

pub fn set_reputation(env: &Env, reputation: &Address) {
    env.storage()
        .instance()
        .set(&DataKey::Reputation, reputation);
}

pub fn get_listing_counter(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::ListingCounter)
        .unwrap_or(0)
}

pub fn increment_listing_counter(env: &Env) -> u32 {
    let next = get_listing_counter(env) + 1;
    env.storage()
        .instance()
        .set(&DataKey::ListingCounter, &next);
    next
}

pub fn get_listing(env: &Env, id: u32) -> Option<Listing> {
    let key = DataKey::Listing(id);
    env.storage().persistent().get(&key)
}

pub fn set_listing(env: &Env, id: u32, listing: &Listing) {
    let key = DataKey::Listing(id);
    env.storage().persistent().set(&key, listing);
    env.storage().persistent().extend_ttl(&key, 10000, 50000);
}
