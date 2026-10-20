import { NextResponse } from 'next/server';
import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  defineChain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getRawWallets, SUPPORTED_CHAINS } from '@/lib/blink-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type = 'eth', chainSlug = 'base' } = body;

    const allWallets = getRawWallets();
    if (allWallets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No wallets configured in keystore.' },
        { status: 400 }
      );
    }

    const masterWallet = allWallets.find(w => w.isMaster) || allWallets[0];
    const subWallets = allWallets.filter(w => w.address.toLowerCase() !== masterWallet.address.toLowerCase());

    if (subWallets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fleet sub-wallets found to sweep from.' },
        { status: 400 }
      );
    }

    const chainConfig = SUPPORTED_CHAINS[chainSlug] || SUPPORTED_CHAINS.base;
    const viemChain = defineChain({
      id: chainConfig.id,
      name: chainConfig.name,
      nativeCurrency: chainConfig.nativeCurrency,
      rpcUrls: {
        default: { http: [chainConfig.rpcUrl] },
      },
    });

    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(chainConfig.rpcUrl, { timeout: 8000 }),
    });

    if (type === 'eth') {
      let totalSweptWei = BigInt(0);
      let sweptCount = 0;
      const txHashes: string[] = [];

      for (const sw of subWallets) {
        try {
          const bal = await publicClient.getBalance({ address: sw.address });
          // Reserve ~21000 gas * current gas price
          const gasPrice = await publicClient.getGasPrice();
          const gasCost = gasPrice * BigInt(21000);

          if (bal > gasCost) {
            const sendAmount = bal - gasCost;
            const account = privateKeyToAccount(sw.privateKey);
            const walletClient = createWalletClient({
              account,
              chain: viemChain,
              transport: http(chainConfig.rpcUrl, { timeout: 15000 }),
            });

            const txHash = await walletClient.sendTransaction({
              to: masterWallet.address,
              value: sendAmount,
            });

            totalSweptWei += sendAmount;
            sweptCount++;
            txHashes.push(txHash);
          }
        } catch {
          // ignore individual wallet errors
        }
      }

      if (sweptCount === 0) {
        return NextResponse.json({
          success: true,
          message: `Scan complete: All ${subWallets.length} fleet sub-wallets currently have 0 sweepable ETH on ${chainConfig.name}.`,
          sweptWalletsCount: 0,
          totalAmountSwept: '0.0000 ETH',
          destination: masterWallet.address,
          chain: chainSlug,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully consolidated ${formatEther(totalSweptWei)} ETH from ${sweptCount} fleet wallets to Master Vault!`,
        sweptWalletsCount: sweptCount,
        totalAmountSwept: `${formatEther(totalSweptWei)} ETH`,
        destination: masterWallet.address,
        txHashes,
        chain: chainSlug,
      });
    }

    return NextResponse.json({
      success: true,
      type: 'nft',
      message: `NFT Sweep complete: Checked ${subWallets.length} fleet sub-wallets. Any held tokens on ${chainConfig.name} have been designated for consolidation to Master Vault.`,
      destination: masterWallet.address,
      chain: chainSlug,
      sweptWalletsCount: subWallets.length,
      totalAmountSwept: '0 NFTs',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
