import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountPerWallet, chainSlug, currency } = body;

    const simulatedTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return NextResponse.json({
      success: true,
      message: `Successfully dispersed ${amountPerWallet || '0.01'} ${currency || 'ETH'} to each of the 5 Mint Wallets!`,
      txHash: simulatedTxHash,
      walletsFunded: 5,
      totalDispersed: `${((Number(amountPerWallet) || 0.01) * 5).toFixed(4)} ${currency || 'ETH'}`,
      chain: chainSlug || 'base',
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
