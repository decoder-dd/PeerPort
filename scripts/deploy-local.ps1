# PeerPort Deployment Script for Local Sandbox
# This script builds the contracts, optimizes them, deploys to local standalone RPC,
# initializes states, and updates the frontend .env.local file.

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Orange
Write-Host "       PEERPORT LOCAL SANDBOX DEPLOYMENT PIPELINE    " -ForegroundColor Orange
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

# 3. Deploy contracts locally
Write-Host "[Step 3/5] Deploying contracts to Local Sandbox..." -ForegroundColor Green

# Execute Deploy Reputation
Write-Host ">> Deploying PeerPort Reputation Contract..." -ForegroundColor Cyan
$reputationId = stellar contract deploy --wasm contracts/optimized/peerport_reputation.wasm --source alice --network local
Write-Host "✔ Reputation deployed: $reputationId" -ForegroundColor Green

# Execute Deploy Marketplace
Write-Host ">> Deploying PeerPort Marketplace Contract..." -ForegroundColor Cyan
$marketplaceId = stellar contract deploy --wasm contracts/optimized/peerport_marketplace.wasm --source alice --network local
Write-Host "✔ Marketplace deployed: $marketplaceId`n"

# 4. Initialize Contracts
Write-Host "[Step 4/5] Initializing contract configurations..." -ForegroundColor Green

# Get local account address
$aliceAddr = stellar keys address alice
Write-Host "Alice Address (Admin): $aliceAddr" -ForegroundColor Cyan

# Initialize Reputation Contract
Write-Host ">> Initializing reputation contract with admin..." -ForegroundColor Cyan
stellar contract invoke --id $reputationId --source alice --network local -- initialize --admin $aliceAddr
stellar contract invoke --id $reputationId --source alice --network local -- set_marketplace --marketplace $marketplaceId
Write-Host "✔ Reputation contract configured." -ForegroundColor Green

# Initialize Marketplace Contract
# Create a local test token (SAC)
Write-Host ">> Creating local test asset contract (SAC)..." -ForegroundColor Cyan
$tokenSac = stellar contract asset deploy-stellar-asset --asset native --source alice --network local
Write-Host "✔ Local Test Token: $tokenSac" -ForegroundColor Green

Write-Host ">> Initializing marketplace contract with token & reputation addresses..." -ForegroundColor Cyan
stellar contract invoke --id $marketplaceId --source alice --network local -- initialize --admin $aliceAddr --token $tokenSac --reputation $reputationId
Write-Host "✔ Marketplace contract configured." -ForegroundColor Green

# 5. Write env vars to frontend
Write-Host "`n[Step 5/5] Updating frontend environment variables..." -ForegroundColor Green
$envContent = @"
NEXT_PUBLIC_STELLAR_RPC_URL=http://localhost:8000/soroban/rpc
NEXT_PUBLIC_REPUTATION_CONTRACT_ID=$reputationId
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$marketplaceId
NEXT_PUBLIC_TOKEN_CONTRACT_ID=$tokenSac
"@

$envContent | Out-File -FilePath "frontend/.env.local" -Encoding utf8
Write-Host "✔ Updated frontend/.env.local with local contract addresses." -ForegroundColor Green

Write-Host "`n====================================================" -ForegroundColor Orange
Write-Host "✔ LOCAL SANDBOX DEPLOYMENT COMPLETE (SUCCESS)       " -ForegroundColor Orange
Write-Host "====================================================" -ForegroundColor Orange
