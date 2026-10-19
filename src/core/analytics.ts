import nodeFs from 'node:fs';
import path from 'node:path';
import { formatEther } from 'viem';
import type { TelemetryEvent, SingleMintResult } from '../types/index.js';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

export class AnalyticsTracker {
  private events: TelemetryEvent[] = [];

  constructor() {
    if (!nodeFs.existsSync(DATA_DIR)) {
      nodeFs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.load();
  }

  private load(): void {
    if (nodeFs.existsSync(ANALYTICS_FILE)) {
      try {
        const raw = nodeFs.readFileSync(ANALYTICS_FILE, 'utf-8');
        this.events = JSON.parse(raw);
      } catch {
        this.events = [];
      }
    }
  }

  private save(): void {
    nodeFs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.events, null, 2), 'utf-8');
  }

  public recordMintRun(
    chainSlug: string,
    contractAddress: `0x${string}`,
    results: SingleMintResult[],
    durationMs: number
  ): TelemetryEvent {
    let totalGasSpentWei = 0n;
    let successCount = 0;
    let revertedCount = 0;

    for (const res of results) {
      if (res.status === 'success') successCount++;
      if (res.status === 'reverted' || res.status === 'failed') revertedCount++;
      if (res.gasUsed) totalGasSpentWei += res.gasUsed;
    }

    const event: TelemetryEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      chainSlug,
      contractAddress,
      walletCount: results.length,
      successCount,
      revertedCount,
      totalGasSpentWei: totalGasSpentWei.toString(),
      durationMs,
    };

    this.events.unshift(event);
    // Keep max 500 recent events
    if (this.events.length > 500) this.events.pop();
    this.save();
    return event;
  }

  public getSummary() {
    const totalRuns = this.events.length;
    let totalWalletsAttempted = 0;
    let totalSuccess = 0;
    let totalReverted = 0;
    let totalGasWei = 0n;
    let totalLatency = 0;
    const chainCounts: Record<string, number> = {};

    for (const ev of this.events) {
      totalWalletsAttempted += ev.walletCount;
      totalSuccess += ev.successCount;
      totalReverted += ev.revertedCount;
      totalGasWei += BigInt(ev.totalGasSpentWei || '0');
      totalLatency += ev.durationMs;
      chainCounts[ev.chainSlug] = (chainCounts[ev.chainSlug] || 0) + ev.walletCount;
    }

    const overallSuccessRate =
      totalWalletsAttempted > 0 ? ((totalSuccess / totalWalletsAttempted) * 100).toFixed(1) : '100.0';
    const avgLatencyMs = totalRuns > 0 ? Math.round(totalLatency / totalRuns) : 0;

    return {
      totalRuns,
      totalWalletsAttempted,
      totalSuccess,
      totalReverted,
      overallSuccessRate: `${overallSuccessRate}%`,
      totalGasSpentEth: formatEther(totalGasWei),
      avgLatencyMs,
      chainCounts,
      recentEvents: this.events.slice(0, 10),
    };
  }

  public clear(): void {
    this.events = [];
    this.save();
  }
}
