import { defineChain, type Chain } from 'viem';
import type { BotChainConfig } from '../types/index.js';
import dotenv from 'dotenv';
dotenv.config();

export const DEFAULT_CHAINS: Record<string, BotChainConfig> = {
  base: {
    id: 8453,
    name: 'Base',
    slug: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.RPC_BASE || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    disperseAddress: '0xD152f549545093347A152d042b947024ea56f606',
  },
  'base-sepolia': {
    id: 84532,
    name: 'Base Sepolia Testnet',
    slug: 'base-sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.RPC_BASE_SEPOLIA || 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    disperseAddress: '0xD152f549545093347A152d042b947024ea56f606',
    isTestnet: true,
  },
  ethereum: {
    id: 1,
    name: 'Ethereum Mainnet',
    slug: 'ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.RPC_ETHEREUM || 'https://ethereum-rpc.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    disperseAddress: '0xD152f549545093347A152d042b947024ea56f606',
  },
  ink: {
    id: 57073,
    name: 'Ink',
    slug: 'ink',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.RPC_INK || 'https://rpc-gel.inkonchain.com',
    explorerUrl: 'https://explorer.inkonchain.com',
  },
  robinhood: {
    id: 42161, // Arbitrum Orbit / L2 standard fallback
    name: 'Robinhood Chain',
    slug: 'robinhood',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.RPC_ROBINHOOD || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
  },
  arc: {
    id: 777777, // Arc network standard
    name: 'Arc',
    slug: 'arc',
    nativeCurrency: { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    rpcUrl: process.env.RPC_ARC || 'https://mainnet.base.org', // Fallback
    explorerUrl: '',
    isGasTokenCustom: true,
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    slug: 'arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    disperseAddress: '0xD152f549545093347A152d042b947024ea56f606',
  },
};

const customChains: Record<string, BotChainConfig> = {};

export function getChain(slugOrId: string | number): BotChainConfig {
  const all = { ...DEFAULT_CHAINS, ...customChains };
  if (typeof slugOrId === 'number') {
    const found = Object.values(all).find((c) => c.id === slugOrId);
    if (!found) throw new Error(`Chain with ID ${slugOrId} not found in registry`);
    return found;
  }
  const found = all[slugOrId.toLowerCase()];
  if (!found) throw new Error(`Chain "${slugOrId}" not found in registry`);
  return found;
}

export function getAllChains(): BotChainConfig[] {
  return Object.values({ ...DEFAULT_CHAINS, ...customChains });
}

export function registerCustomChain(config: BotChainConfig): void {
  customChains[config.slug.toLowerCase()] = config;
}

export function toViemChain(chain: BotChainConfig): Chain {
  return defineChain({
    id: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: {
      default: { http: [chain.rpcUrl] },
      public: { http: [chain.rpcUrl] },
    },
    blockExplorers: chain.explorerUrl
      ? {
          default: { name: `${chain.name} Explorer`, url: chain.explorerUrl },
        }
      : undefined,
  });
}
