# PeerPort Deployment Script for Stellar Testnet
# This script builds the contracts, optimizes them, deploys to testnet,
# initializes states, and updates the frontend .env.local file.

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Orange
Write-Host "       PEERPORT TESTNET DEPLOYMENT PIPELINE         " -ForegroundColor Orange
Write-Host "====================================================`n"

# 1. Build Soroban contracts
Write-Host "[Step 1/5] Building smart contracts..." -ForegroundColor Green
$env:CARGO_INCREMENTAL = "0"
cargo build --target wasm32-unknown-unknown --release --target-dir .cargo_target

# Create optimized directory if not exists
New-Item -ItemType Directory -Force -Path "contracts/optimized" | Out-Null

# 2. Optimize WASM binaries
Write-Host "[Step 2/5] Optimizing WASM binaries..." -ForegroundColor Green
stellar contract optimize --wasm .cargo_target/wasm32-unknown-unknown/release/peerport_reputation.wasm --output-dir contracts/optimized
stellar contract optimize --wasm .cargo_target/wasm32-unknown-unknown/release/peerport_marketplace.wasm --output-dir contracts/optimized

# 3. Deploy contracts to Testnet
Write-Host "[Step 3/5] Deploying contracts to Stellar Testnet..." -ForegroundColor Green
Write-Host "Please ensure you have configured a deployer identity in your Stellar CLI." -ForegroundColor Yellow
Write-Host "Example: stellar keys generate --global deployer --network testnet`n"

# Execute Deploy Reputation
Write-Host ">> Deploying PeerPort Reputation Contract..." -ForegroundColor Cyan
$reputationId = stellar contract deploy --wasm contracts/optimized/peerport_reputation.wasm --source deployer --network testnet
Write-Host "✔ Reputation deployed: $reputationId" -ForegroundColor Green

# Execute Deploy Marketplace
Write-Host ">> Deploying PeerPort Marketplace Contract..." -ForegroundColor Cyan
$marketplaceId = stellar contract deploy --wasm contracts/optimized/peerport_marketplace.wasm --source deployer --network testnet
Write-Host "✔ Marketplace deployed: $marketplaceId`n"

# 4. Initialize Contracts
Write-Host "[Step 4/5] Initializing contract configurations..." -ForegroundColor Green

# Get deployer address
$deployerAddr = stellar keys address deployer
Write-Host "Deployer Address: $deployerAddr" -ForegroundColor Cyan

# Initialize Reputation Contract
Write-Host ">> Initializing reputation contract with admin..." -ForegroundColor Cyan
stellar contract invoke --id $reputationId --source deployer --network testnet -- initialize --admin $deployerAddr
stellar contract invoke --id $reputationId --source deployer --network testnet -- set_marketplace --marketplace $marketplaceId
Write-Host "✔ Reputation contract configured." -ForegroundColor Green

# Initialize Marketplace Contract
# For testnet, we default to the Native XLM Stellar Asset Contract (SAC) token
$tokenSac = "CDLZRVEJ4AYGLFLUXH6FE6SRUTNR2YCR5HQBF3PWBVJOWLSNCK27BAT7" 
Write-Host ">> Initializing marketplace contract with token & reputation addresses..." -ForegroundColor Cyan
stellar contract invoke --id $marketplaceId --source deployer --network testnet -- initialize --admin $deployerAddr --token $tokenSac --reputation $reputationId
Write-Host "✔ Marketplace contract configured." -ForegroundColor Green

# 5. Write env vars to frontend
Write-Host "`n[Step 5/5] Updating frontend environment variables..." -ForegroundColor Green
$envContent = @"
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_REPUTATION_CONTRACT_ID=$reputationId
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$marketplaceId
NEXT_PUBLIC_TOKEN_CONTRACT_ID=$tokenSac
"@

$envContent | Out-File -FilePath "frontend/.env.local" -Encoding utf8
Write-Host "✔ Updated frontend/.env.local with deployed contract addresses." -ForegroundColor Green

Write-Host "`n====================================================" -ForegroundColor Orange
Write-Host "✔ DEPLOYMENT AND INITIALIZATION COMPLETE (SUCCESS)   " -ForegroundColor Orange
Write-Host "====================================================" -ForegroundColor Orange
