import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain, toViemChain } from '../config/chains.js';
import { SEADROP_CONTRACT_ADDRESS, SEADROP_ABI } from '../config/constants.js';
import type { StoredWallet, SingleMintResult } from '../types/index.js';
import { MerkleAllowlist } from './allowlist.js';
import { AnalyticsTracker } from './analytics.js';

export interface SeaDropPublicDetails {
  mintPriceWei: bigint;
  mintPriceFormatted: string;
  startTime: number;
  endTime: number;
  maxTotalMintableByWallet: number;
  feeRecipient: `0x${string}`;
  isActive: boolean;
  timeRemainingSec?: number;
}

export interface SeaDropAllowListDetails {
  merkleRoot: `0x${string}`;
  mintPriceWei: bigint;
  mintPriceFormatted: string;
  startTime: number;
  endTime: number;
  maxTotalMintableByWallet: number;
  isActive: boolean;
  rawDropData: any;
}

export class SeaDropMinter {
  private analytics: AnalyticsTracker;

  constructor(analytics?: AnalyticsTracker) {
    this.analytics = analytics || new AnalyticsTracker();
  }

  public async getPublicDropDetails(chainSlug: string, nftContract: `0x${string}`): Promise<SeaDropPublicDetails | null> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);
    const client = createPublicClient({ chain: viemChain, transport: http(chain.rpcUrl) });

    try {
      const data: any = await client.readContract({
        address: SEADROP_CONTRACT_ADDRESS,
        abi: SEADROP_ABI,
        functionName: 'getPublicDrop',
        args: [nftContract],
      });

      const mintPriceWei = BigInt(data[0]);
      const startTime = Number(data[1]);
      const endTime = Number(data[2]);
      const maxTotalMintableByWallet = Number(data[3]);
      const nowSec = Math.floor(Date.now() / 1000);

      const isActive = nowSec >= startTime && nowSec <= endTime && startTime > 0;
      const timeRemainingSec = startTime > nowSec ? startTime - nowSec : 0;

      return {
        mintPriceWei,
        mintPriceFormatted: `${formatEther(mintPriceWei)} ${chain.nativeCurrency.symbol}`,
        startTime,
        endTime,
        maxTotalMintableByWallet,
        feeRecipient: '0x0000a26b00c1F0DF003000390027140000fAa719', // Standard OpenSea fee recipient fallback
        isActive,
        timeRemainingSec,
      };
    } catch {
      return null;
    }
  }

  public async getAllowListDetails(chainSlug: string, nftContract: `0x${string}`): Promise<SeaDropAllowListDetails | null> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);
    const client = createPublicClient({ chain: viemChain, transport: http(chain.rpcUrl) });

    try {
      const data: any = await client.readContract({
        address: SEADROP_CONTRACT_ADDRESS,
        abi: SEADROP_ABI,
        functionName: 'getAllowListDrop',
        args: [nftContract],
      });

      const merkleRoot = data[0] as `0x${string}`;
      const dropData = data[2];
      const mintPriceWei = BigInt(dropData[0]);
      const startTime = Number(dropData[1]);
      const endTime = Number(dropData[2]);
      const maxTotalMintableByWallet = Number(dropData[3]);
      const nowSec = Math.floor(Date.now() / 1000);

      const isActive = nowSec >= startTime && nowSec <= endTime && startTime > 0;

      return {
        merkleRoot,
        mintPriceWei,
        mintPriceFormatted: `${formatEther(mintPriceWei)} ${chain.nativeCurrency.symbol}`,
        startTime,
        endTime,
        maxTotalMintableByWallet,
        isActive,
        rawDropData: dropData,
      };
    } catch {
      return null;
    }
  }

  public async mintPublic(
    chainSlug: string,
    nftContract: `0x${string}`,
    quantity: number,
    wallets: StoredWallet[],
    feeRecipient: `0x${string}` = '0x0000a26b00c1F0DF003000390027140000fAa719',
    simulateOnly: boolean = false
  ): Promise<SingleMintResult[]> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);
    const publicClient = createPublicClient({ chain: viemChain, transport: http(chain.rpcUrl) });

    const dropDetails = await this.getPublicDropDetails(chainSlug, nftContract);
    const pricePerToken = dropDetails ? dropDetails.mintPriceWei : 0n;
    const totalValue = pricePerToken * BigInt(quantity);

    const startTime = performance.now();

    const results = await Promise.all(
      wallets.map(async (wallet): Promise<SingleMintResult> => {
        const walletStart = performance.now();
        const account = privateKeyToAccount(wallet.privateKey);
        const walletClient = createWalletClient({
          account,
          chain: viemChain,
          transport: http(chain.rpcUrl),
        });

        try {
          if (simulateOnly) {
            await publicClient.simulateContract({
              account,
              address: SEADROP_CONTRACT_ADDRESS,
              abi: SEADROP_ABI,
              functionName: 'mintPublic',
              args: [nftContract, feeRecipient, account.address, BigInt(quantity)],
              value: totalValue,
            });

            return {
              walletAddress: wallet.address,
              status: 'simulated',
              latencyMs: Math.round(performance.now() - walletStart),
            };
          }

          const hash = await walletClient.writeContract({
            address: SEADROP_CONTRACT_ADDRESS,
            abi: SEADROP_ABI,
            functionName: 'mintPublic',
            args: [nftContract, feeRecipient, account.address, BigInt(quantity)],
            value: totalValue,
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          return {
            walletAddress: wallet.address,
            status: receipt.status === 'success' ? 'success' : 'reverted',
            txHash: hash,
            gasUsed: receipt.gasUsed * (receipt.effectiveGasPrice || 0n),
            latencyMs: Math.round(performance.now() - walletStart),
          };
        } catch (err: any) {
          return {
            walletAddress: wallet.address,
            status: 'failed',
            error: err?.shortMessage || err?.message || 'SeaDrop mint failed',
            latencyMs: Math.round(performance.now() - walletStart),
          };
        }
      })
    );

    const duration = Math.round(performance.now() - startTime);
    this.analytics.recordMintRun(chainSlug, nftContract, results, duration);

    return results;
  }

  public async mintAllowList(
    chainSlug: string,
    nftContract: `0x${string}`,
    quantity: number,
    wallets: StoredWallet[],
    merkle: MerkleAllowlist,
    feeRecipient: `0x${string}` = '0x0000a26b00c1F0DF003000390027140000fAa719',
    simulateOnly: boolean = false
  ): Promise<SingleMintResult[]> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);
    const publicClient = createPublicClient({ chain: viemChain, transport: http(chain.rpcUrl) });

    const allowListDetails = await this.getAllowListDetails(chainSlug, nftContract);
    if (!allowListDetails) {
      throw new Error('No SeaDrop allowlist configuration found for this NFT contract.');
    }

    const pricePerToken = allowListDetails.mintPriceWei;
    const totalValue = pricePerToken * BigInt(quantity);
    const startTime = performance.now();

    const results = await Promise.all(
      wallets.map(async (wallet): Promise<SingleMintResult> => {
        const walletStart = performance.now();
        const account = privateKeyToAccount(wallet.privateKey);
        const proof = merkle.getProof(wallet.address);

        if (proof.length === 0 && !merkle.isEligible(wallet.address)) {
          return {
            walletAddress: wallet.address,
            status: 'failed',
            error: 'Wallet not eligible in Merkle allowlist',
            latencyMs: Math.round(performance.now() - walletStart),
          };
        }

        const walletClient = createWalletClient({
          account,
          chain: viemChain,
          transport: http(chain.rpcUrl),
        });

        try {
          if (simulateOnly) {
            await publicClient.simulateContract({
              account,
              address: SEADROP_CONTRACT_ADDRESS,
              abi: SEADROP_ABI,
              functionName: 'mintAllowList',
              args: [
                nftContract,
                feeRecipient,
                account.address,
                BigInt(quantity),
                allowListDetails.rawDropData,
                proof,
              ],
              value: totalValue,
            });

            return {
              walletAddress: wallet.address,
              status: 'simulated',
              latencyMs: Math.round(performance.now() - walletStart),
            };
          }

          const hash = await walletClient.writeContract({
            address: SEADROP_CONTRACT_ADDRESS,
            abi: SEADROP_ABI,
            functionName: 'mintAllowList',
            args: [
              nftContract,
              feeRecipient,
              account.address,
              BigInt(quantity),
              allowListDetails.rawDropData,
              proof,
            ],
            value: totalValue,
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          return {
            walletAddress: wallet.address,
            status: receipt.status === 'success' ? 'success' : 'reverted',
            txHash: hash,
            gasUsed: receipt.gasUsed * (receipt.effectiveGasPrice || 0n),
            latencyMs: Math.round(performance.now() - walletStart),
          };
        } catch (err: any) {
          return {
            walletAddress: wallet.address,
            status: 'failed',
            error: err?.shortMessage || err?.message || 'Allowlist mint failed',
            latencyMs: Math.round(performance.now() - walletStart),
          };
        }
      })
    );

    const duration = Math.round(performance.now() - startTime);
    this.analytics.recordMintRun(chainSlug, nftContract, results, duration);

    return results;
  }
}
