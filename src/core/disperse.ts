import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain, toViemChain } from '../config/chains.js';
import { DISPERSE_ABI } from '../config/constants.js';
import type { StoredWallet } from '../types/index.js';

export class DisperseManager {
  public async disperseEther(
    chainSlug: string,
    masterWallet: StoredWallet,
    recipientAddresses: `0x${string}`[],
    amountPerWalletWei: bigint
  ): Promise<{ txHash?: `0x${string}`; success: boolean; error?: string }> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);

    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(chain.rpcUrl),
    });

    const account = privateKeyToAccount(masterWallet.privateKey);
    const walletClient = createWalletClient({
      account,
      chain: viemChain,
      transport: http(chain.rpcUrl),
    });

    const totalValue = amountPerWalletWei * BigInt(recipientAddresses.length);
    const values = recipientAddresses.map(() => amountPerWalletWei);

    try {
      if (chain.disperseAddress) {
        // Use canonical disperse contract
        const hash = await walletClient.writeContract({
          address: chain.disperseAddress,
          abi: DISPERSE_ABI,
          functionName: 'disperseEther',
          args: [recipientAddresses, values],
          value: totalValue,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        return { txHash: hash, success: true };
      } else {
        // Fallback: direct sequential transfers
        for (const recipient of recipientAddresses) {
          const hash = await walletClient.sendTransaction({
            to: recipient,
            value: amountPerWalletWei,
          });
          await publicClient.waitForTransactionReceipt({ hash });
        }
        return { success: true };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.shortMessage || err?.message || 'Disperse failed',
      };
    }
  }

  public async consolidateFunds(
    chainSlug: string,
    burnerWallets: StoredWallet[],
    destinationAddress: `0x${string}`
  ): Promise<Array<{ wallet: `0x${string}`; status: 'success' | 'failed' | 'skipped'; amountEth?: string; txHash?: `0x${string}`; error?: string }>> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);

    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(chain.rpcUrl),
    });

    const results = await Promise.all(
      burnerWallets.map(async (wallet) => {
        try {
          const balance = await publicClient.getBalance({ address: wallet.address });
          if (balance === 0n) {
            return { wallet: wallet.address, status: 'skipped' as const };
          }

          const account = privateKeyToAccount(wallet.privateKey);
          const walletClient = createWalletClient({
            account,
            chain: viemChain,
            transport: http(chain.rpcUrl),
          });

          // Estimate gas for a transfer
          const gasPrice = await publicClient.getGasPrice();
          const gasLimit = 21000n;
          const gasCost = gasPrice * gasLimit * 12n / 10n; // 20% buffer

          if (balance <= gasCost) {
            return {
              wallet: wallet.address,
              status: 'skipped' as const,
              error: 'Balance too low to cover gas',
            };
          }

          const amountToSend = balance - gasCost;
          const hash = await walletClient.sendTransaction({
            to: destinationAddress,
            value: amountToSend,
          });

          await publicClient.waitForTransactionReceipt({ hash });

          return {
            wallet: wallet.address,
            status: 'success' as const,
            amountEth: formatEther(amountToSend),
            txHash: hash,
          };
        } catch (err: any) {
          return {
            wallet: wallet.address,
            status: 'failed' as const,
            error: err?.shortMessage || err?.message || 'Consolidation failed',
          };
        }
      })
    );

    return results;
  }
}
