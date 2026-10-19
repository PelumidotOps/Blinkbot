# Blink ⚡

> **The Autonomous Multi-Chain EVM NFT Bot & Fleet Automation Suite**  
> Engineered for Base, Ink, Ethereum, Arbitrum, and Arc with sub-millisecond mempool detection, OpenSea SeaDrop allowlist automation, and high-volume wallet fleets.

---

## 🚀 Complete Suite Components

1. **High-Converting Landing Page (`/`)**:
   - Styled after the luxury Framer **FatNinja** dark design system and **nullbot.io**.
   - Features real-time animated mempool tickers, interactive engine showcase, latency benchmark comparison, transparent pricing tiers, and interactive FAQ accordion.

2. **Web3 Dark Dashboard (`/app`)**:
   - Deep space pitch-black canvas (`#06070A`) with subtle cosmic starfield coordinates and electric violet accents (`#6B5EF0`).
   - Standardized 3-tab layout (`[Action]`, `[History]`, `[Settings]`) across all 13 core engines.
   - **Engines**: Schedule Mint, Copy Mint (Whale Tracker), Mint from Contract, Disperse Gas, Consolidate Funds, Sweep NFTs, NFT Portfolio Tracker, OpenSea SeaDrop Canonical Protocol, Autonomous Routines, Keystore Wallets, and Account.

3. **Multi-Chain Plug & Play EVM Engine**:
   - **Base L2** (`base`)
   - **Ink Chain** (`ink`, Kraken Superchain)
   - **Ethereum Mainnet** (`ethereum`)
   - **Arbitrum One** (`arbitrum`)
   - **Arc Network** (`arc`, USDC-native gas)
   - **Robinhood Chain** (`robinhood`)
   - **Base Sepolia** (`base-sepolia`, testnet)

4. **Telegram Bot Remote (`@BlinkSniperBot`)**:
   - Execute mints on the go, view fleet balances, and receive real-time whale mempool alerts on Telegram.
   - Run: `npm run bot`

5. **Interactive Terminal CLI**:
   - Terminal interface with `@clack/prompts` and formatted ASCII tables.
   - Run: `npm run dev`

---

## ⚙️ Quickstart & Environment Setup

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd blink
npm install
npm --prefix web install
```

### 2. Configure Environment Variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration:
- `VAULT_PASSWORD`: Master password used to encrypt/decrypt your fleet keys locally with AES-256-GCM.
- `RPC_BASE_WS` & `RPC_ETHEREUM_WS`: Alchemy or QuickNode WebSocket URLs for real-time 22ms mempool sniffing.
- `TELEGRAM_BOT_TOKEN`: Token obtained from `@BotFather` to run the Telegram remote bot.

### 3. Launch Services

#### Web Application (Landing Page + Web Dashboard)
```bash
# Development mode:
npm run web

# Or production build & start:
npm run web:build
npm run web:start
```
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Dashboard**: [http://localhost:3000/app](http://localhost:3000/app)

#### Live Telegram Bot
```bash
npm run bot
```

#### Terminal CLI Suite
```bash
npm start
```

---

## 🔒 Security & Custody Architecture

- **Zero Remote Key Storage**: All private keys are encrypted locally using `scrypt` key derivation and `AES-256-GCM`. Private keys never leave your local environment and are never transmitted over telemetry.
- **Pre-Flight Simulation**: Blink executes static `eth_call` simulations before broadcasting transactions to protect against reverted contract calls and wasted gas fees.
- **Git Ignore Protection**: Keystores (`.data/`), `.env` secrets, and build logs are strictly excluded in `.gitignore`.

---

## 📄 License
MIT © 2026 Blink Labs Limited.
