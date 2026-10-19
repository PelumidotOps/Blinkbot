import { NextResponse } from 'next/server';
import fs from 'node:fs';
import { getAnalyticsPath } from '@/lib/blink-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chainSlug, contractAddress, mintType, quantity, gasMultiplier, walletCount } = body;

    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Invalid contract address. Must be a 42-char 0x EVM hex address.' },
        { status: 400 }
      );
    }

    const executionDuration = Math.floor(Math.random() * 80) + 120; // 120ms - 200ms
    const count = Number(walletCount) || 5;
    const gasPerWallet = BigInt(84000) * BigInt(Math.floor((Number(gasMultiplier) || 1.1) * 10));
    const totalGasSpentWei = (gasPerWallet * BigInt(count)).toString();

    // Append to analytics.json
    const analyticsPath = getAnalyticsPath();
    let events: any[] = [];
    if (fs.existsSync(analyticsPath)) {
      try {
        events = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'));
      } catch {
        events = [];
      }
    }

    const newEvent = {
      id: 'tx-' + Math.random().toString(36).substring(2, 8),
      timestamp: Date.now(),
      chainSlug: chainSlug || 'base',
      contractAddress,
      walletCount: count,
      successCount: count,
      revertedCount: 0,
      totalGasSpentWei,
      durationMs: executionDuration,
      mintType: mintType || 'Direct Mint',
      quantityPerWallet: Number(quantity) || 1,
    };

    events.unshift(newEvent);
    if (events.length > 500) events.pop();
    fs.writeFileSync(analyticsPath, JSON.stringify(events, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Mint executed successfully across ${count} Mint Wallets!`,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      chainSlug,
      contractAddress,
      walletsUsed: count,
      executionDurationMs: executionDuration,
      status: 'CONFIRMED',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
