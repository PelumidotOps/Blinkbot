import { NextResponse } from 'next/server';
import { SUPPORTED_CHAINS, pingRpc } from '@/lib/blink-service';

export async function GET() {
  try {
    const chainEntries = Object.entries(SUPPORTED_CHAINS);

    const pingResults = await Promise.all(
      chainEntries.map(async ([slug, chain]) => {
        const ping = await pingRpc(chain.rpcUrl);
        return {
          slug,
          name: chain.name,
          id: chain.id,
          rpcUrl: chain.rpcUrl,
          latencyMs: ping.ok ? ping.latencyMs : 999,
          blockNumber: ping.blockNumber ? ping.blockNumber.toString() : 'Synced',
          status: ping.ok ? (ping.latencyMs < 300 ? 'HEALTHY' : 'SLOW') : 'DEGRADED',
          nativeSymbol: chain.nativeCurrency.symbol,
        };
      })
    );

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      networks: pingResults,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
