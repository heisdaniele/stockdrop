# StockDrop

StockDrop is a programmable distribution protocol for Coinbase Tokenized Stocks on Base. One vault contract powers time-locked personal gifts and immediately claimable business rewards.

## What works

- Coinbase Smart Wallet and injected-wallet connection through Wagmi
- Exact ERC-20 approval followed by a vault deposit
- Recipient, asset, amount, unlock time, and memo stored onchain
- Recipient-only claims after the unlock time
- Duration-zero rewards through the same contract primitive
- Connected-wallet inbox for discovering and claiming StockDrops

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The UI can run without contract addresses and will show a setup notice. To enable transactions, add a deployed vault address and the verified Base Sepolia token addresses to `.env`.

Never invent or substitute tokenized-stock addresses. Use the addresses published by the hackathon or Coinbase for the selected network.

## Smart contracts

```bash
npm run contracts:compile
npm run contracts:test
```

For a local demonstration, deploy `MockStock` and use its address as `VITE_NVDA_TOKEN_ADDRESS`. The mock is test-only and is not an official tokenized stock.

The current Base Sepolia deployments are recorded in `deployments/base-sepolia.json`. The application uses these mock addresses by default and labels them as test assets.

To deploy the vault to Base Sepolia, set `BASE_SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in your local environment, fund the deployer with Base Sepolia ETH, then run:

```bash
npm run contracts:deploy:base-sepolia
```

Copy the printed vault address into `VITE_STOCKDROP_VAULT_ADDRESS`, restart Vite, and verify the deployed contract before sharing the app.

## Safety notes

- The contract rejects transfer-fee tokens so recorded amounts remain fully collateralized.
- Gifts are immutable after deposit and cannot be reclaimed by the sender.
- Only the named recipient can claim, and each gift can be claimed once.
- This hackathon contract has automated tests but has not received an independent security audit.
