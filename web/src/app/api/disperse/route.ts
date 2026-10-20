import { NextResponse } from 'next/server';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  defineChain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getRawWallets, SUPPORTED_CHAINS } from '@/lib/blink-service';

const DISPERSE_ABI = [
  {
    inputs: [
      { internalType: 'address[]', name: 'recipients', type: 'address[]' },
      { internalType: 'uint256[]', name: 'values', type: 'uint256[]' },
    ],
    name: 'disperseEther',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const DISPERSE_ADDRESS = '0xD152f549545093347A152d042b947024ea56f606' as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountPerWallet, chainSlug = 'base', currency = 'ETH' } = body;

    const amountNum = parseFloat(amountPerWallet);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid disperse amount. Please specify a positive number (e.g. 0.005).' },
        { status: 400 }
      );
    }

    const allWallets = getRawWallets();
    if (allWallets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No wallets found in keystore. Please create or import wallets in the Wallets tab first.' },
        { status: 400 }
      );
    }

    const masterWallet = allWallets.find(w => w.isMaster) || allWallets[0];
    const recipients = allWallets.filter(w => w.address.toLowerCase() !== masterWallet.address.toLowerCase());

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fleet sub-wallets found to fund. Please generate at least 1 mint wallet to disperse to.' },
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

    const masterBalance = await publicClient.getBalance({ address: masterWallet.address });
    const masterBalanceFormatted = parseFloat(formatEther(masterBalance)).toFixed(4);

    const valPerWalletWei = parseEther(amountNum.toString());
    const totalWeiNeeded = valPerWalletWei * BigInt(recipients.length);
    const totalEthNeededFormatted = parseFloat(formatEther(totalWeiNeeded)).toFixed(4);

    // If master has insufficient funds, inform user with their exact address and needed funds
    if (masterBalance < totalWeiNeeded) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient funds on ${chainConfig.name}: Master wallet ${masterWallet.address.slice(0, 6)}...${masterWallet.address.slice(-4)} has ${masterBalanceFormatted} ETH, but needs at least ${totalEthNeededFormatted} ETH to fund ${recipients.length} fleet wallets. Please send ETH to your master wallet.`,
          masterAddress: masterWallet.address,
          currentBalance: masterBalanceFormatted,
          neededBalance: totalEthNeededFormatted,
        },
        { status: 400 }
      );
    }

    // Execute real Disperse transaction using Master private key
    const masterAccount = privateKeyToAccount(masterWallet.privateKey);
    const walletClient = createWalletClient({
      account: masterAccount,
      chain: viemChain,
      transport: http(chainConfig.rpcUrl, { timeout: 15000 }),
    });

    const recipientAddresses = recipients.map(r => r.address);
    const values = recipients.map(() => valPerWalletWei);

    const txHash = await walletClient.writeContract({
      address: DISPERSE_ADDRESS,
      abi: DISPERSE_ABI,
      functionName: 'disperseEther',
      args: [recipientAddresses, values],
      value: totalWeiNeeded,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully broadcasted disperse of ${amountPerWallet} ${currency} to ${recipients.length} fleet wallets!`,
      txHash,
      walletsFunded: recipients.length,
      totalDispersed: `${totalEthNeededFormatted} ${currency}`,
      chain: chainSlug,
      masterAddress: masterWallet.address,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
