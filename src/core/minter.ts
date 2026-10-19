import {
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
  parseAbi,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain, toViemChain } from '../config/chains.js';
import { COMMON_MINT_SIGNATURES } from '../config/constants.js';
import type { MintConfig, SingleMintResult, StoredWallet } from '../types/index.js';
import { AnalyticsTracker } from './analytics.js';

export class ContractMinter {
  private analytics: AnalyticsTracker;

  constructor(analytics?: AnalyticsTracker) {
    this.analytics = analytics || new AnalyticsTracker();
  }

  public async executeMint(config: MintConfig, wallets: StoredWallet[]): Promise<SingleMintResult[]> {
    const chain = getChain(config.chainSlug);
    const viemChain = toViemChain(chain);

    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(chain.rpcUrl),
    });

    const startTime = performance.now();
    const gasParams = await this.resolveGasFees(publicClient, config.gasSpeed || 'fast');

    // Filter wallets if specific addresses passed
    const targetWallets = config.walletAddresses
      ? wallets.filter((w) => config.walletAddresses!.some((addr) => addr.toLowerCase() === w.address.toLowerCase()))
      : wallets;

    if (targetWallets.length === 0) {
      throw new Error('No wallets available to execute mint.');
    }

    // Resolve the function selector / ABI
    const resolvedFunction = this.resolveFunctionData(config);

    // Concurrently execute across all selected wallets
    const results = await Promise.all(
      targetWallets.map(async (wallet): Promise<SingleMintResult> => {
        const walletStartTime = performance.now();
        const account = privateKeyToAccount(wallet.privateKey);
        const walletClient = createWalletClient({
          account,
          chain: viemChain,
          transport: http(chain.rpcUrl),
        });

        const value = (config.pricePerTokenWei || 0n) * BigInt(config.quantity || 1);

        try {
          // Pre-flight simulation check
          if (config.simulateOnly) {
            await publicClient.call({
              account,
              to: config.contractAddress,
              data: resolvedFunction.data,
              value,
            });

            return {
              walletAddress: wallet.address,
              status: 'simulated',
              latencyMs: Math.round(performance.now() - walletStartTime),
            };
          }

          // Optional pre-check simulation to prevent gas waste on revert
          try {
            await publicClient.call({
              account,
              to: config.contractAddress,
              data: resolvedFunction.data,
              value,
            });
          } catch (simErr: any) {
            return {
              walletAddress: wallet.address,
              status: 'reverted',
              error: `Simulation reverted: ${simErr?.shortMessage || simErr?.message || 'Execution reverted'}`,
              latencyMs: Math.round(performance.now() - walletStartTime),
            };
          }

          // Broadcast live transaction
          const hash = await walletClient.sendTransaction({
            to: config.contractAddress,
            data: resolvedFunction.data,
            value,
            maxFeePerGas: gasParams.maxFeePerGas,
            maxPriorityFeePerGas: gasParams.maxPriorityFeePerGas,
          });

          // Wait for receipt
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          return {
            walletAddress: wallet.address,
            status: receipt.status === 'success' ? 'success' : 'reverted',
            txHash: hash,
            gasUsed: receipt.gasUsed * (receipt.effectiveGasPrice || 0n),
            latencyMs: Math.round(performance.now() - walletStartTime),
          };
        } catch (err: any) {
          return {
            walletAddress: wallet.address,
            status: 'failed',
            error: err?.shortMessage || err?.message || 'Transaction submission failed',
            latencyMs: Math.round(performance.now() - walletStartTime),
          };
        }
      })
    );

    const totalDuration = Math.round(performance.now() - startTime);
    this.analytics.recordMintRun(config.chainSlug, config.contractAddress, results, totalDuration);

    return results;
  }

  private resolveFunctionData(config: MintConfig): { data: `0x${string}` } {
    if (config.customCalldata) {
      return { data: config.customCalldata };
    }

    const funcName = config.functionName || 'mint';
    const qty = BigInt(config.quantity || 1);

    // Try standard candidate signatures
    const signaturesToTry = [
      `function ${funcName}(uint256 quantity) external payable`,
      `function ${funcName}() external payable`,
      `function ${funcName}(address to, uint256 quantity) external payable`,
      ...COMMON_MINT_SIGNATURES,
    ];

    for (const sig of signaturesToTry) {
      try {
        const parsed = parseAbi([sig]);
        let data: `0x${string}`;

        if (sig.includes('uint256')) {
          data = encodeFunctionData({
            abi: parsed as any,
            functionName: funcName as any,
            args: [qty] as any,
          });
        } else {
          data = encodeFunctionData({
            abi: parsed as any,
            functionName: funcName as any,
            args: [] as any,
          });
        }
        return { data };
      } catch {
        continue;
      }
    }

    throw new Error(
      `Could not encode function "${funcName}". Please provide a specific ABI or raw customCalldata.`
    );
  }

  private async resolveGasFees(publicClient: PublicClient, speed: 'safe' | 'fast' | 'instant') {
    try {
      const fees = await publicClient.estimateFeesPerGas();
      const multiplier = speed === 'instant' ? 1.75 : speed === 'fast' ? 1.25 : 1.0;

      const priorityFee = fees.maxPriorityFeePerGas
        ? BigInt(Math.round(Number(fees.maxPriorityFeePerGas) * multiplier))
        : undefined;

      const maxFee = fees.maxFeePerGas
        ? BigInt(Math.round(Number(fees.maxFeePerGas) * multiplier))
        : undefined;

      return {
        maxPriorityFeePerGas: priorityFee,
        maxFeePerGas: maxFee,
      };
    } catch {
      return {
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
      };
    }
  }
}
