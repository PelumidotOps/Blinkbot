import { ContractMinter } from './minter.js';
import type { MintConfig, SingleMintResult, StoredWallet } from '../types/index.js';

export interface ScheduledJob {
  id: string;
  targetTimestampMs: number;
  config: MintConfig;
  wallets: StoredWallet[];
  status: 'pending' | 'firing' | 'completed' | 'cancelled';
  results?: SingleMintResult[];
}

export class DropScheduler {
  private activeJobs: Map<string, { job: ScheduledJob; timer: NodeJS.Timeout }> = new Map();
  private minter: ContractMinter;

  constructor(minter?: ContractMinter) {
    this.minter = minter || new ContractMinter();
  }

  public scheduleMint(
    targetTimestampMs: number,
    config: MintConfig,
    wallets: StoredWallet[],
    onTick?: (remainingMs: number) => void
  ): Promise<SingleMintResult[]> {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const delay = targetTimestampMs - now;

      if (delay <= 0) {
        // Fire immediately
        this.minter.executeMint(config, wallets).then(resolve).catch(reject);
        return;
      }

      const jobId = Math.random().toString(36).substring(2, 9);
      const job: ScheduledJob = {
        id: jobId,
        targetTimestampMs,
        config,
        wallets,
        status: 'pending',
      };

      // Periodic tick interval for progress updates
      const tickInterval = setInterval(() => {
        const remaining = targetTimestampMs - Date.now();
        if (remaining > 0 && onTick) {
          onTick(remaining);
        } else {
          clearInterval(tickInterval);
        }
      }, 1000);

      const timer = setTimeout(async () => {
        clearInterval(tickInterval);
        job.status = 'firing';
        try {
          const results = await this.minter.executeMint(config, wallets);
          job.status = 'completed';
          job.results = results;
          this.activeJobs.delete(jobId);
          resolve(results);
        } catch (err) {
          job.status = 'cancelled';
          this.activeJobs.delete(jobId);
          reject(err);
        }
      }, delay);

      this.activeJobs.set(jobId, { job, timer });
    });
  }

  public cancelJob(jobId: string): boolean {
    const active = this.activeJobs.get(jobId);
    if (!active) return false;
    clearTimeout(active.timer);
    active.job.status = 'cancelled';
    this.activeJobs.delete(jobId);
    return true;
  }

  public getActiveJobs(): ScheduledJob[] {
    return Array.from(this.activeJobs.values()).map((a) => a.job);
  }
}
