import { VaultManager } from './core/vault.js';
import { AnalyticsTracker } from './core/analytics.js';
import { getAllChains, getChain, toViemChain } from './config/chains.js';
import { createPublicClient, http } from 'viem';

async function runSmokeTest() {
  console.log('🧪 Starting NullBot Engine Smoke Test...\n');

  // 1. Vault test
  const vault = new VaultManager();
  const unlocked = vault.unlock('test-master-password-123');
  console.log('🔐 Vault unlocked:', unlocked);

  // Generate burners
  const burners = vault.generateBurners(3, 'TestBurner');
  console.log(`✅ Generated ${burners.length} burners:`);
  burners.forEach((b) => console.log(`   - ${b.label}: ${b.address}`));

  // Set master
  vault.setMaster(burners[0].address);
  console.log(`👑 Master wallet set: ${vault.getMasterWallet()?.address}`);

  // 2. Multi-chain registry test
  const chains = getAllChains();
  console.log(`\n🌐 Registered Chains (${chains.length} total):`);
  chains.forEach((c) => console.log(`   - [${c.slug}] ${c.name} (Chain ID: ${c.id}, Gas: ${c.nativeCurrency.symbol})`));

  // 3. RPC Node Connectivity Test (Base)
  const base = getChain('base');
  const client = createPublicClient({
    chain: toViemChain(base),
    transport: http(base.rpcUrl),
  });

  try {
    const block = await client.getBlockNumber();
    console.log(`\n⚡ Base RPC connection verified! Current block: ${block}`);
  } catch (err: any) {
    console.log(`\n⚠️ Base RPC check: ${err.message}`);
  }

  // 4. Analytics Tracker test
  const analytics = new AnalyticsTracker();
  analytics.recordMintRun(
    'base',
    '0x0000000000000000000000000000000000000000',
    [
      { walletAddress: burners[0].address, status: 'success', latencyMs: 140 },
      { walletAddress: burners[1].address, status: 'success', latencyMs: 155 },
      { walletAddress: burners[2].address, status: 'reverted', latencyMs: 120, error: 'Max mint per wallet reached' },
    ],
    415
  );

  const summary = analytics.getSummary();
  console.log('\n📊 Analytics Tracker Verification:');
  console.log(`   - Total Wallets Attempted: ${summary.totalWalletsAttempted}`);
  console.log(`   - Success Rate: ${summary.overallSuccessRate}`);
  console.log(`   - Average Latency: ${summary.avgLatencyMs}ms`);

  console.log('\n✨ Smoke test completed successfully!');
}

runSmokeTest().catch(console.error);
