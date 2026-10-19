import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { createPublicClient, http, formatEther, formatGwei } from 'viem';
import {
  getWalletsList,
  ensureVaultUnlocked,
  SUPPORTED_CHAINS,
} from '@/lib/blink-service';

function getDataDir(): string {
  const rootData = path.resolve(process.cwd(), '../.data');
  if (fs.existsSync(rootData)) return rootData;
  const localData = path.resolve(process.cwd(), '.data');
  if (!fs.existsSync(localData)) {
    fs.mkdirSync(localData, { recursive: true });
  }
  return localData;
}

export async function GET() {
  try {
    const isUnlocked = ensureVaultUnlocked();
    const rawWallets = getWalletsList();

    // Initialize Viem public client for Base L2 to check live on-chain balances
    const baseRpc = SUPPORTED_CHAINS.base?.rpcUrl || 'https://mainnet.base.org';
    const baseClient = createPublicClient({
      transport: http(baseRpc, { timeout: 4000 }),
    });

    // Query live on-chain balances for existing wallets
    const walletsWithBalances = await Promise.all(
      rawWallets.map(async (w, idx) => {
        let ethBalance = '0.0000';
        try {
          const bal = await baseClient.getBalance({ address: w.address });
          ethBalance = parseFloat(formatEther(bal)).toFixed(4);
        } catch {
          ethBalance = '0.0000';
        }

        return {
          id: idx + 1,
          address: w.address,
          label: w.label || (w.isMaster ? 'Master Vault' : `Fleet Wallet #${idx + 1}`),
          isMaster: !!w.isMaster,
          createdAt: w.createdAt,
          ethBalance,
          usdcBalance: '0.00',
          nftsHeld: 0,
          status: 'READY',
          txCount: 0,
        };
      })
    );

    const mintWallets = walletsWithBalances.filter(w => !w.isMaster);
    const mainWallet = walletsWithBalances.find(w => w.isMaster) || walletsWithBalances[0] || null;

    // Calculate total real fleet balance
    const fleetEthBalance = walletsWithBalances
      .reduce((acc, curr) => acc + parseFloat(curr.ethBalance || '0'), 0)
      .toFixed(4);

    // Load persistent scheduled drops from disk if configured, otherwise clean empty list
    const dropsPath = path.join(getDataDir(), 'drops.json');
    let drops = [];
    if (fs.existsSync(dropsPath)) {
      try {
        drops = JSON.parse(fs.readFileSync(dropsPath, 'utf-8'));
      } catch {
        drops = [];
      }
    }

    // Load persistent copy-mint trackers from disk if configured, otherwise clean empty list
    const trackersPath = path.join(getDataDir(), 'trackers.json');
    let copyMintTrackers = [];
    if (fs.existsSync(trackersPath)) {
      try {
        copyMintTrackers = JSON.parse(fs.readFileSync(trackersPath, 'utf-8'));
      } catch {
        copyMintTrackers = [];
      }
    }

    // Load real execution history from analytics events
    const analyticsPath = path.join(getDataDir(), 'analytics.json');
    let userActivity = [];
    if (fs.existsSync(analyticsPath)) {
      try {
        const events = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
        userActivity = events.map((ev: any, i: number) => ({
          id: ev.id || `act-${i}`,
          title: ev.contractAddress ? `Contract Mint (${ev.contractAddress.slice(0, 6)}...${ev.contractAddress.slice(-4)})` : 'Drop Execution',
          tokenIds: `${ev.successCount || 1} tokens`,
          type: ev.type || 'Contract Mint',
          chain: ev.chainSlug || 'base',
          chainName: ev.chainSlug === 'base' ? 'Base' : ev.chainSlug === 'ink' ? 'Ink' : 'Ethereum',
          contract: ev.contractAddress || '0x...',
          txHash: ev.txHash || '',
          walletsUsed: ev.walletCount || 1,
          totalItems: ev.successCount || 1,
          gasPaid: ev.totalGasSpentWei ? `${parseFloat(formatEther(BigInt(ev.totalGasSpentWei))).toFixed(6)} ETH` : '0.0002 ETH',
          timeAgo: ev.timestamp ? `${Math.max(1, Math.round((Date.now() - ev.timestamp) / 60000))}m ago` : 'recently',
          status: ev.revertedCount > 0 ? 'PARTIAL' : 'CONFIRMED',
        }));
      } catch {
        userActivity = [];
      }
    }

    // Query real live network gas prices
    let baseGasPrice = '0.002 Gwei';
    let ethGasPrice = '12.4 Gwei';

    try {
      const baseGas = await baseClient.getGasPrice();
      baseGasPrice = `${parseFloat(formatGwei(baseGas)).toFixed(4)} Gwei`;
    } catch {
      baseGasPrice = '0.002 Gwei';
    }

    try {
      const ethRpc = SUPPORTED_CHAINS.ethereum?.rpcUrl || 'https://ethereum-rpc.publicnode.com';
      const ethClient = createPublicClient({ transport: http(ethRpc, { timeout: 3000 }) });
      const ethGas = await ethClient.getGasPrice();
      ethGasPrice = `${parseFloat(formatGwei(ethGas)).toFixed(1)} Gwei`;
    } catch {
      ethGasPrice = '12.0 Gwei';
    }

    const gasPrices = {
      base: baseGasPrice,
      ethereum: ethGasPrice,
      ink: '0.001 Gwei',
      arc: '0.01 USDC',
      arbitrum: '0.01 Gwei',
      robinhood: '0.01 Gwei',
    };

    return NextResponse.json({
      success: true,
      vaultUnlocked: isUnlocked,
      mintWalletsCount: mintWallets.length,
      fleetEthBalance,
      fleetUsdcBalance: '0.00',
      totalNftsMinted: userActivity.reduce((acc: number, curr: any) => acc + (curr.totalItems || 1), 0),
      mainWallet,
      wallets: walletsWithBalances,
      drops,
      copyMintTrackers,
      userActivity,
      gasPrices,
      chains: Object.values(SUPPORTED_CHAINS),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
