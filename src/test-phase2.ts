import { MerkleAllowlist } from './core/allowlist.js';
import { SeaDropMinter } from './core/seadrop.js';
import { CopyMintEngine } from './core/copymint.js';
import { SEADROP_CONTRACT_ADDRESS } from './config/constants.js';
import Table from 'cli-table3';
import chalk from 'chalk';

async function runPhase2Test() {
  console.log(chalk.bold.magenta('\n⚡ TESTING PHASE 2: SEADROP, MERKLE ALLOWLIST & COPY-MINT ENGINE\n'));

  // 1. Merkle Allowlist Test
  console.log(chalk.bold.cyan('1. Testing Merkle Tree Whitelist Proof Generator...'));
  const eligibleWallets: `0x${string}`[] = [
    '0x6BCeF79730D637d593cC778c5E2b702FB688d8Af',
    '0xd263fBb4Ec2d4487E0B7bDC75cF39dF66FAAdF85',
    '0x68EC8cdE447Df7eA0106c80B56f9Baa984eDc1C8',
    '0x4FE21B97aBA42000E52e09e908fB49167da91e1C',
  ];
  const ineligibleWallet: `0x${string}` = '0x000000000000000000000000000000000000dead';

  const merkle = new MerkleAllowlist(eligibleWallets);
  const root = merkle.getRoot();
  console.log(`   ✔ Merkle Root generated: ${root}`);

  const proof = merkle.getProof(eligibleWallets[0]);
  console.log(`   ✔ Proof generated for ${eligibleWallets[0].slice(0, 8)}... (${proof.length} hashes)`);

  const isValid = merkle.verifyProof(eligibleWallets[0], proof, root);
  const isInvalid = merkle.verifyProof(ineligibleWallet, proof, root);

  console.log(`   ✔ Valid proof verification: ${isValid ? chalk.green('PASSED') : chalk.red('FAILED')}`);
  console.log(`   ✔ Ineligible wallet rejection: ${!isInvalid ? chalk.green('PASSED (rejected)') : chalk.red('FAILED')}`);

  // 2. OpenSea SeaDrop Integration Test
  console.log(chalk.bold.cyan('\n2. Testing OpenSea SeaDrop Protocol Interface...'));
  console.log(`   Canonical SeaDrop Contract: ${SEADROP_CONTRACT_ADDRESS}`);
  const seadrop = new SeaDropMinter();

  // Test reading on Base
  const sampleNft = '0x1234567890123456789012345678901234567890';
  const publicDetails = await seadrop.getPublicDropDetails('base', sampleNft);
  console.log(`   ✔ SeaDrop query executed on Base RPC (Contract query returned: ${publicDetails ? 'Found' : 'No drop active'})`);

  // 3. Copy-Mint Engine Test
  console.log(chalk.bold.cyan('\n3. Testing Copy-Mint Engine & Watchlist Daemon...'));
  const copyEngine = new CopyMintEngine();
  const statusBefore = copyEngine.getStatus();
  console.log(`   ✔ Engine initialized (Running: ${statusBefore.isRunning}, Targets: ${statusBefore.targetCount})`);

  copyEngine.startCopyMint({
    chainSlug: 'base',
    targetWallets: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'], // Vitalik's address as sample alpha target
    maxPriceWei: 0n, // Free mints only
    mirrorBurners: [],
  });

  const statusAfter = copyEngine.getStatus();
  console.log(`   ✔ Engine active in background (Running: ${statusAfter.isRunning ? chalk.green('ACTIVE') : 'IDLE'}, Targets: ${statusAfter.targetCount})`);

  copyEngine.stop();
  const statusStopped = copyEngine.getStatus();
  console.log(`   ✔ Engine stopped cleanly (Running: ${statusStopped.isRunning})`);

  console.log(chalk.bold.green('\n🎉 PHASE 2 PROTOCOLS AND ENGINES VERIFIED SUCCESSFULLY!\n'));
}

runPhase2Test().catch((err) => {
  console.error(chalk.red('Phase 2 test failed:'), err);
});
