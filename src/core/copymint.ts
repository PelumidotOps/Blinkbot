import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseGwei,
  type PublicClient,
  type WalletClient,
  type Transaction,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain, toViemChain } from '../config/chains.js';
import type { StoredWallet, SingleMintResult } from '../types/index.js';
import { AnalyticsTracker } from './analytics.js';

export interface CopyMintConfig {
  chainSlug: string;
  targetWallets: `0x${string}`[];
  maxPriceWei: bigint; // 0n = free mints only
  maxGasPriceGwei?: bigint;
  mirrorBurners: StoredWallet[];
  quantity?: number;
}

export interface CopyMintEvent {
  targetWallet: `0x${string}`;
  contractAddress: `0x${string}`;
  targetTxHash: `0x${string}`;
  mintValueWei: bigint;
  timestamp: number;
  mirroredResults: SingleMintResult[];
}

export class CopyMintEngine {
  private isRunning: boolean = false;
  private watchedTargets: Set<string> = new Set();
  private analytics: AnalyticsTracker;
  private lastProcessedBlock: bigint = 0n;
  private pollingTimer?: NodeJS.Timeout;

  constructor(analytics?: AnalyticsTracker) {
    this.analytics = analytics || new AnalyticsTracker();
  }

  public startCopyMint(
    config: CopyMintConfig,
    onEvent?: (event: CopyMintEvent) => void
  ): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.watchedTargets = new Set(config.targetWallets.map((w) => w.toLowerCase()));

    const chain = getChain(config.chainSlug);
    const viemChain = toViemChain(chain);
    const publicClient = createPublicClient({ chain: viemChain, transport: http(chain.rpcUrl) });

    const poll = async () => {
      if (!this.isRunning) return;

      try {
        const latestBlock = await publicClient.getBlock({ includeTransactions: true });

        if (this.lastProcessedBlock === 0n) {
          this.lastProcessedBlock = latestBlock.number;
          return;
        }

        if (latestBlock.number > this.lastProcessedBlock) {
          this.lastProcessedBlock = latestBlock.number;

          for (const tx of latestBlock.transactions as Transaction[]) {
            if (!tx.to || !tx.from) continue;
            const fromLower = tx.from.toLowerCase();

            if (this.watchedTargets.has(fromLower)) {
              // Found a transaction from a followed wallet!
              if (tx.value <= config.maxPriceWei) {
                // Check gas price cap if set
                if (config.maxGasPriceGwei && tx.gasPrice) {
                  if (tx.gasPrice > parseGwei(config.maxGasPriceGwei.toString())) {
                    continue; // Skip: exceeds gas cap
                  }
                }

                // Mirror the mint call with our burner wallets!
                const mirrored = await this.executeMirror(
                  publicClient,
                  viemChain,
                  chain.rpcUrl,
                  tx,
                  config.mirrorBurners
                );

                const event: CopyMintEvent = {
                  targetWallet: tx.from as `0x${string}`,
                  contractAddress: tx.to as `0x${string}`,
                  targetTxHash: tx.hash,
                  mintValueWei: tx.value,
                  timestamp: Date.now(),
                  mirroredResults: mirrored,
                };

                this.analytics.recordMintRun(config.chainSlug, tx.to as `0x${string}`, mirrored, 500);

                if (onEvent) onEvent(event);
              }
            }
          }
        }
      } catch {
        // Polling retry
      }
    };

    // Poll every 1.5s for fast L2 / L1 blocks
    this.pollingTimer = setInterval(poll, 1500);
  }

  private async executeMirror(
    publicClient: PublicClient,
    chain: any,
    rpcUrl: string,
    tx: Transaction,
    burners: StoredWallet[]
  ): Promise<SingleMintResult[]> {
    const results: SingleMintResult[] = [];

    for (const burner of burners) {
      const start = performance.now();
      const account = privateKeyToAccount(burner.privateKey);
      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(rpcUrl),
      });

      try {
        // Pre-flight check
        await publicClient.call({
          account,
          to: tx.to as `0x${string}`,
          data: tx.input,
          value: tx.value,
        });

        const hash = await (walletClient as any).sendTransaction({
          to: tx.to as `0x${string}`,
          data: tx.input,
          value: tx.value,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        results.push({
          walletAddress: burner.address,
          status: receipt.status === 'success' ? 'success' : 'reverted',
          txHash: hash,
          latencyMs: Math.round(performance.now() - start),
        });
      } catch (err: any) {
        results.push({
          walletAddress: burner.address,
          status: 'failed',
          error: err?.shortMessage || err?.message || 'Mirror execution failed',
          latencyMs: Math.round(performance.now() - start),
        });
      }
    }

    return results;
  }

  public stop(): void {
    this.isRunning = false;
    if (this.pollingTimer) clearInterval(this.pollingTimer);
  }

  public getStatus(): { isRunning: boolean; targetCount: number } {
    return {
      isRunning: this.isRunning,
      targetCount: this.watchedTargets.size,
    };
  }
}
