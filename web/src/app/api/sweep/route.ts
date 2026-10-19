import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, chainSlug, targetAddress } = body; // type: 'eth' | 'nft'

    const simulatedTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return NextResponse.json({
      success: true,
      type: type || 'eth',
      message: type === 'nft'
        ? 'All minted NFTs from all Mint Wallets successfully swept to Main Wallet!'
        : 'All available ETH swept and consolidated to Main Wallet!',
      destination: targetAddress || '0x71C8364F3B39C10F0757E70a8489E58941fE6F90',
      chain: chainSlug || 'base',
      sweptWalletsCount: 5,
      totalAmountSwept: type === 'nft' ? '14 NFTs' : '0.3620 ETH',
      txHash: simulatedTxHash,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
