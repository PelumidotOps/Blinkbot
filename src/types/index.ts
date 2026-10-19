export interface BotChainConfig {
  id: number;
  name: string;
  slug: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  wsRpcUrl?: string;
  explorerUrl: string;
  disperseAddress?: `0x${string}`;
  isGasTokenCustom?: boolean; // E.g., Arc using USDC
  isTestnet?: boolean;
}

export interface StoredWallet {
  address: `0x${string}`;
  privateKey: `0x${string}`;
  label: string;
  createdAt: number;
  isMaster?: boolean;
}

export interface EncryptedVaultPayload {
  version: number;
  salt: string; // hex
  iv: string;   // hex
  authTag: string; // hex
  ciphertext: string; // hex
}

export interface MintConfig {
  chainSlug: string;
  contractAddress: `0x${string}`;
  functionName?: string;
  args?: any[];
  pricePerTokenWei?: bigint;
  quantity?: number;
  customCalldata?: `0x${string}`;
  gasSpeed?: 'safe' | 'fast' | 'instant';
  simulateOnly?: boolean;
  walletAddresses?: `0x${string}`[];
}

export interface SingleMintResult {
  walletAddress: `0x${string}`;
  status: 'simulated' | 'success' | 'reverted' | 'failed';
  txHash?: `0x${string}`;
  error?: string;
  gasUsed?: bigint;
  latencyMs?: number;
}

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  chainSlug: string;
  contractAddress: `0x${string}`;
  walletCount: number;
  successCount: number;
  revertedCount: number;
  totalGasSpentWei: string;
  durationMs: number;
}
