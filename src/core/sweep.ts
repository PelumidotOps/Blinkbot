import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain, toViemChain } from '../config/chains.js';
import { ERC721_ABI } from '../config/constants.js';
import type { StoredWallet } from '../types/index.js';

export interface SweepResult {
  wallet: `0x${string}`;
  tokenId: bigint;
  status: 'success' | 'failed';
  txHash?: `0x${string}`;
  error?: string;
}

export class SweepManager {
  public async sweepCollection(
    chainSlug: string,
    collectionAddress: `0x${string}`,
    burnerWallets: StoredWallet[],
    destinationAddress: `0x${string}`,
    tokenIds?: bigint[]
  ): Promise<SweepResult[]> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);

    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(chain.rpcUrl),
    });

    const results: SweepResult[] = [];

    for (const wallet of burnerWallets) {
      const account = privateKeyToAccount(wallet.privateKey);
      const walletClient = createWalletClient({
        account,
        chain: viemChain,
        transport: http(chain.rpcUrl),
      });

      try {
        const balance = await publicClient.readContract({
          address: collectionAddress,
          abi: ERC721_ABI,
          functionName: 'balanceOf',
          args: [wallet.address],
        });

        if (balance === 0n) continue;

        // If specific token IDs were passed, check ownership and transfer
        if (tokenIds && tokenIds.length > 0) {
          for (const tid of tokenIds) {
            try {
              const owner = await publicClient.readContract({
                address: collectionAddress,
                abi: ERC721_ABI,
                functionName: 'ownerOf',
                args: [tid],
              });

              if (owner.toLowerCase() === wallet.address.toLowerCase()) {
                const hash = await walletClient.writeContract({
                  address: collectionAddress,
                  abi: ERC721_ABI,
                  functionName: 'transferFrom',
                  args: [wallet.address, destinationAddress, tid],
                });
                await publicClient.waitForTransactionReceipt({ hash });
                results.push({ wallet: wallet.address, tokenId: tid, status: 'success', txHash: hash });
              }
            } catch (err: any) {
              results.push({
                wallet: wallet.address,
                tokenId: tid,
                status: 'failed',
                error: err?.shortMessage || err?.message || 'Transfer failed',
              });
            }
          }
        } else {
          // Attempt enumerable tokenOfOwnerByIndex
          try {
            for (let i = 0n; i < balance; i++) {
              const tid = await publicClient.readContract({
                address: collectionAddress,
                abi: ERC721_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [wallet.address, 0n], // Always index 0 as previous transfers out
              });

              const hash = await walletClient.writeContract({
                address: collectionAddress,
                abi: ERC721_ABI,
                functionName: 'transferFrom',
                args: [wallet.address, destinationAddress, tid],
              });
              await publicClient.waitForTransactionReceipt({ hash });
              results.push({ wallet: wallet.address, tokenId: tid, status: 'success', txHash: hash });
            }
          } catch (enumerableErr) {
            // Non-enumerable: manual token IDs required
            throw new Error(
              'This contract does not support ERC721Enumerable. Please supply the specific token IDs to sweep.'
            );
          }
        }
      } catch (err: any) {
        // Log skip or error
        continue;
      }
    }

    return results;
  }
}
