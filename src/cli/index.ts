#!/usr/bin/env node
import {
  intro,
  outro,
  select,
  text,
  confirm,
  spinner,
  note,
  isCancel,
  cancel,
} from '@clack/prompts';
import chalk from 'chalk';
import Table from 'cli-table3';
import { parseEther, isAddress, formatEther, createPublicClient, http } from 'viem';
import { VaultManager } from '../core/vault.js';
import { ContractMinter } from '../core/minter.js';
import { DisperseManager } from '../core/disperse.js';
import { SweepManager } from '../core/sweep.js';
import { DropScheduler } from '../core/scheduler.js';
import { AnalyticsTracker } from '../core/analytics.js';
import { SeaDropMinter } from '../core/seadrop.js';
import { CopyMintEngine } from '../core/copymint.js';
import { MerkleAllowlist } from '../core/allowlist.js';
import { getAllChains, getChain, toViemChain, registerCustomChain } from '../config/chains.js';
import type { MintConfig } from '../types/index.js';

const vault = new VaultManager();
const analytics = new AnalyticsTracker();
const minter = new ContractMinter(analytics);
const disperseManager = new DisperseManager();
const sweepManager = new SweepManager();
const scheduler = new DropScheduler(minter);
const seaDropMinter = new SeaDropMinter(analytics);
const copyMintEngine = new CopyMintEngine(analytics);
let followedWallets: `0x${string}`[] = [];

function handleCancel(value: any) {
  if (isCancel(value)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
}

async function unlockVaultPrompt(): Promise<void> {
  const envPassword = process.env.VAULT_PASSWORD;
  if (envPassword) {
    if (vault.unlock(envPassword)) return;
  }

  const promptMsg = vault.vaultExists()
    ? 'Enter Master Vault Password to unlock:'
    : 'Create a Master Vault Password (encrypts local wallets):';

  const password = await text({
    message: promptMsg,
    validate: (val) => (!val || val.length < 4 ? 'Password must be at least 4 characters' : undefined),
  });
  handleCancel(password);

  const s = spinner();
  s.start('Decrypting secure keystore...');
  const success = vault.unlock(password as string);
  if (!success) {
    s.stop(chalk.red('Incorrect master password'));
    process.exit(1);
  }
  s.stop(chalk.green('Vault unlocked successfully!'));
}

async function walletMenu() {
  while (true) {
    const action = await select({
      message: 'Wallet Manager:',
      options: [
        { value: 'list', label: '📋 List Wallets & Balances', hint: 'View all burner & master wallets' },
        { value: 'generate', label: '⚡ Generate Burner Wallets', hint: 'Create multiple new burner accounts' },
        { value: 'import', label: '📥 Import Wallet', hint: 'Import via private key' },
        { value: 'set-master', label: '👑 Set Master Wallet', hint: 'Designate cold/master storage' },
        { value: 'export', label: '🔑 Export Private Keys', hint: 'Display keys for backup' },
        { value: 'back', label: '⬅️ Back to Main Menu' },
      ],
    });
    handleCancel(action);

    if (action === 'back') break;

    if (action === 'list') {
      const chainSlug = await selectChainPrompt();
      const s = spinner();
      s.start(`Fetching balances on ${chainSlug}...`);
      const balances = await vault.fetchBalances(chainSlug);
      s.stop('Balances fetched');

      const table = new Table({
        head: [
          chalk.cyan('Label'),
          chalk.cyan('Role'),
          chalk.cyan('Address'),
          chalk.cyan('Balance'),
        ],
        style: { head: [], border: [] },
      });

      balances.forEach(({ wallet, balanceFormatted }) => {
        table.push([
          wallet.label,
          wallet.isMaster ? chalk.yellow('MASTER') : chalk.gray('BURNER'),
          wallet.address,
          chalk.green(balanceFormatted),
        ]);
      });

      console.log(table.toString());
    } else if (action === 'generate') {
      const countInput = await text({
        message: 'How many burner wallets to generate?',
        placeholder: '5',
        validate: (val) => (isNaN(Number(val)) || Number(val) < 1 ? 'Enter a valid number' : undefined),
      });
      handleCancel(countInput);

      const count = Number(countInput);
      const generated = vault.generateBurners(count);
      note(
        generated.map((w) => `${chalk.bold(w.label)}: ${w.address}`).join('\n'),
        `Generated ${count} Burner Wallets`
      );
    } else if (action === 'import') {
      const pk = await text({
        message: 'Enter 0x-prefixed private key:',
        validate: (val) => (!val || !val.startsWith('0x') || val.length !== 66 ? 'Invalid private key format' : undefined),
      });
      handleCancel(pk);

      const label = await text({
        message: 'Label for this wallet:',
        placeholder: 'Main Funder',
      });
      handleCancel(label);

      const isMaster = await confirm({ message: 'Set as Master Wallet?' });
      handleCancel(isMaster);

      try {
        const imported = vault.importWallet(pk as `0x${string}`, label as string, Boolean(isMaster));
        note(`Address: ${imported.address}\nMaster: ${imported.isMaster ? 'Yes' : 'No'}`, 'Wallet Imported');
      } catch (err: any) {
        note(chalk.red(err.message), 'Import Error');
      }
    } else if (action === 'set-master') {
      const wallets = vault.getUnlockedWallets();
      if (wallets.length === 0) {
        note('No wallets available to set as master.', 'Warning');
        continue;
      }

      const selectedAddress = await select({
        message: 'Select wallet to set as master:',
        options: wallets.map((w) => ({
          value: w.address,
          label: `${w.label} (${w.address.slice(0, 6)}...${w.address.slice(-4)})`,
        })),
      });
      handleCancel(selectedAddress);

      vault.setMaster(selectedAddress as `0x${string}`);
      note(`Master wallet updated to ${String(selectedAddress)}`, 'Success');
    } else if (action === 'export') {
      const confirmed = await confirm({
        message: chalk.red('Security Warning: This will display raw private keys. Continue?'),
      });
      handleCancel(confirmed);

      if (confirmed) {
        const wallets = vault.getUnlockedWallets();
        const output = wallets
          .map((w) => `${w.label} (${w.isMaster ? 'MASTER' : 'BURNER'})\nAddress: ${w.address}\nKey: ${w.privateKey}\n`)
          .join('\n');
        note(output, 'Exported Private Keys');
      }
    }
  }
}

async function selectChainPrompt(): Promise<string> {
  const chains = getAllChains();
  const selected = await select({
    message: 'Select target blockchain:',
    options: chains.map((c) => ({
      value: c.slug,
      label: `${c.name} ${c.isTestnet ? chalk.yellow('[Testnet]') : ''}`,
      hint: `${c.nativeCurrency.symbol} | ID: ${c.id}`,
    })),
  });
  handleCancel(selected);
  return selected as string;
}

async function mintMenu() {
  const chainSlug = await selectChainPrompt();
  const contractAddress = await text({
    message: 'Enter NFT contract address (0x...):',
    validate: (val) => (!val || !isAddress(val) ? 'Invalid EVM contract address' : undefined),
  });
  handleCancel(contractAddress);

  const funcName = await text({
    message: 'Mint function name (or leave default for auto-detect):',
    placeholder: 'mint',
  });
  handleCancel(funcName);

  const priceInput = await text({
    message: 'Price per token in ETH / native token (0 for free mint):',
    placeholder: '0',
    validate: (val) => (isNaN(Number(val)) || Number(val) < 0 ? 'Enter a valid number' : undefined),
  });
  handleCancel(priceInput);

  const qtyInput = await text({
    message: 'Quantity to mint per wallet:',
    placeholder: '1',
    validate: (val) => (isNaN(Number(val)) || Number(val) < 1 ? 'Enter valid quantity' : undefined),
  });
  handleCancel(qtyInput);

  const gasSpeed = await select({
    message: 'Select Gas Speed:',
    options: [
      { value: 'fast', label: '⚡ Fast (1.25x Priority Tip)', hint: 'Recommended for competitive drops' },
      { value: 'instant', label: '🚀 Instant (1.75x Priority Tip)', hint: 'Maximum speed' },
      { value: 'safe', label: '🛡️ Safe (Standard)', hint: 'Standard network base fee' },
    ],
  });
  handleCancel(gasSpeed);

  const simulateFirst = await confirm({
    message: 'Run pre-flight simulation before broadcasting?',
    initialValue: true,
  });
  handleCancel(simulateFirst);

  const burners = vault.getBurners();
  const allWallets = vault.getUnlockedWallets();
  const targetWalletList = burners.length > 0 ? burners : allWallets;

  if (targetWalletList.length === 0) {
    note('No wallets found. Please generate or import wallets first.', 'Error');
    return;
  }

  const mintConfig: MintConfig = {
    chainSlug,
    contractAddress: contractAddress as `0x${string}`,
    functionName: (funcName as string) || undefined,
    pricePerTokenWei: parseEther(priceInput as string),
    quantity: Number(qtyInput),
    gasSpeed: gasSpeed as any,
    simulateOnly: false,
  };

  if (simulateFirst) {
    const simSpinner = spinner();
    simSpinner.start('Simulating transaction on-chain...');
    const simResults = await minter.executeMint({ ...mintConfig, simulateOnly: true }, targetWalletList);
    const failedSim = simResults.find((r) => r.status === 'failed' || r.status === 'reverted');
    if (failedSim) {
      simSpinner.stop(chalk.red('Simulation reverted / failed!'));
      note(failedSim.error || 'Execution reverted', 'Simulation Error');
      const proceedAnyway = await confirm({ message: 'Proceed with broadcast anyway?' });
      if (!proceedAnyway) return;
    } else {
      simSpinner.stop(chalk.green('Simulation passed for all wallets!'));
    }
  }

  const s = spinner();
  s.start(`Broadcasting parallel mint across ${targetWalletList.length} wallets...`);
  const results = await minter.executeMint(mintConfig, targetWalletList);
  s.stop('Mint execution finished');

  const table = new Table({
    head: [chalk.cyan('Wallet'), chalk.cyan('Status'), chalk.cyan('Tx Hash / Error'), chalk.cyan('Latency')],
  });

  results.forEach((r) => {
    const statusColor =
      r.status === 'success'
        ? chalk.green('SUCCESS')
        : r.status === 'simulated'
        ? chalk.blue('SIMULATED')
        : chalk.red('REVERTED/FAIL');

    table.push([
      `${r.walletAddress.slice(0, 6)}...${r.walletAddress.slice(-4)}`,
      statusColor,
      r.txHash ? chalk.underline(r.txHash.slice(0, 18) + '...') : chalk.red(r.error?.slice(0, 30) || 'Failed'),
      `${r.latencyMs}ms`,
    ]);
  });

  console.log(table.toString());
}

async function scheduleMenu() {
  const chainSlug = await selectChainPrompt();
  const contractAddress = await text({
    message: 'Enter NFT contract address (0x...):',
    validate: (val) => (!val || !isAddress(val) ? 'Invalid address' : undefined),
  });
  handleCancel(contractAddress);

  const delaySecInput = await text({
    message: 'Seconds from now to trigger mint (or enter Unix timestamp):',
    placeholder: '60',
  });
  handleCancel(delaySecInput);

  let targetTimestampMs = 0;
  const numVal = Number(delaySecInput);
  if (numVal > 1_000_000_000_000) {
    targetTimestampMs = numVal;
  } else if (numVal > 1_000_000_000) {
    targetTimestampMs = numVal * 1000;
  } else {
    targetTimestampMs = Date.now() + numVal * 1000;
  }

  const burners = vault.getBurners();
  if (burners.length === 0) {
    note('Please generate burner wallets before scheduling.', 'Error');
    return;
  }

  const mintConfig: MintConfig = {
    chainSlug,
    contractAddress: contractAddress as `0x${string}`,
    quantity: 1,
    gasSpeed: 'instant',
  };

  const s = spinner();
  s.start(`Drop queued! Target: ${new Date(targetTimestampMs).toLocaleTimeString()}...`);

  await scheduler.scheduleMint(targetTimestampMs, mintConfig, burners, (remaining) => {
    s.message(`Drop countdown: ${(remaining / 1000).toFixed(0)}s remaining...`);
  });

  s.stop(chalk.green('Scheduled drop executed!'));
}

async function disperseMenu() {
  const chainSlug = await selectChainPrompt();
  const master = vault.getMasterWallet();
  if (!master) {
    note('No master wallet set. Please designate a master wallet in Wallet Manager first.', 'Error');
    return;
  }

  const burners = vault.getBurners();
  if (burners.length === 0) {
    note('No burner wallets found to fund.', 'Error');
    return;
  }

  const action = await select({
    message: 'Disperse & Consolidate Operations:',
    options: [
      { value: 'disperse', label: '💸 Disperse: Fund all burners from Master' },
      { value: 'consolidate', label: '🔄 Consolidate: Sweep remaining funds back to Master' },
      { value: 'back', label: '⬅️ Back' },
    ],
  });
  handleCancel(action);

  if (action === 'disperse') {
    const amountInput = await text({
      message: 'Amount to send to EACH burner (in ETH / native token):',
      placeholder: '0.01',
    });
    handleCancel(amountInput);

    const s = spinner();
    s.start(`Dispersing funds to ${burners.length} burners from master (${master.address})...`);
    const res = await disperseManager.disperseEther(
      chainSlug,
      master,
      burners.map((b) => b.address),
      parseEther(amountInput as string)
    );

    if (res.success) {
      s.stop(chalk.green('Disperse transaction confirmed!'));
      if (res.txHash) note(`Tx Hash: ${res.txHash}`, 'Confirmed');
    } else {
      s.stop(chalk.red('Disperse failed'));
      note(res.error || 'Unknown error', 'Error');
    }
  } else if (action === 'consolidate') {
    const s = spinner();
    s.start(`Consolidating funds from ${burners.length} burners to ${master.address}...`);
    const results = await disperseManager.consolidateFunds(chainSlug, burners, master.address);
    s.stop('Consolidation complete');

    const table = new Table({
      head: [chalk.cyan('Burner'), chalk.cyan('Status'), chalk.cyan('Amount Swept')],
    });

    results.forEach((r) => {
      table.push([
        `${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}`,
        r.status === 'success' ? chalk.green('SWEPT') : chalk.gray(r.status.toUpperCase()),
        r.amountEth ? `${r.amountEth} ETH` : '-',
      ]);
    });

    console.log(table.toString());
  }
}

async function sweepMenu() {
  const chainSlug = await selectChainPrompt();
  const master = vault.getMasterWallet();
  if (!master) {
    note('Please set a master wallet to receive swept NFTs.', 'Error');
    return;
  }

  const collection = await text({
    message: 'Enter NFT collection address to sweep (0x...):',
    validate: (val) => (!val || !isAddress(val) ? 'Invalid address' : undefined),
  });
  handleCancel(collection);

  const burners = vault.getBurners();
  const s = spinner();
  s.start(`Scanning ${burners.length} burners for NFTs and transferring to ${master.address}...`);

  try {
    const results = await sweepManager.sweepCollection(
      chainSlug,
      collection as `0x${string}`,
      burners,
      master.address
    );
    s.stop(`Sweep complete. Swept ${results.filter((r) => r.status === 'success').length} NFTs.`);

    if (results.length > 0) {
      const table = new Table({
        head: [chalk.cyan('From Burner'), chalk.cyan('Token ID'), chalk.cyan('Status'), chalk.cyan('Tx Hash')],
      });
      results.forEach((r) => {
        table.push([
          `${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}`,
          r.tokenId.toString(),
          r.status === 'success' ? chalk.green('SUCCESS') : chalk.red('FAILED'),
          r.txHash ? r.txHash.slice(0, 18) + '...' : r.error || '-',
        ]);
      });
      console.log(table.toString());
    } else {
      note('No NFTs found in burner wallets for this collection.', 'Sweep Result');
    }
  } catch (err: any) {
    s.stop(chalk.red('Sweep encountered an issue'));
    note(err.message, 'Sweep Notice');
  }
}

async function analyticsMenu() {
  const summary = analytics.getSummary();

  const table = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Value')],
  });

  table.push(
    ['Total Mint Runs', summary.totalRuns.toString()],
    ['Total Wallets Attempted', summary.totalWalletsAttempted.toString()],
    ['Successful Mints', chalk.green(summary.totalSuccess.toString())],
    ['Reverted / Failed Mints', chalk.red(summary.totalReverted.toString())],
    ['Overall Success Rate', chalk.bold(summary.overallSuccessRate)],
    ['Total Gas Spent', `${summary.totalGasSpentEth} ETH`],
    ['Average Latency', `${summary.avgLatencyMs} ms`]
  );

  console.log(chalk.bold.magenta('\n📊 Minting Telemetry & Performance Summary:'));
  console.log(table.toString());

  if (summary.recentEvents.length > 0) {
    console.log(chalk.bold.cyan('\n🕒 Recent Mint History:'));
    const histTable = new Table({
      head: [chalk.cyan('Time'), chalk.cyan('Chain'), chalk.cyan('Contract'), chalk.cyan('Success / Total'), chalk.cyan('Duration')],
    });

    summary.recentEvents.forEach((ev) => {
      histTable.push([
        new Date(ev.timestamp).toLocaleTimeString(),
        ev.chainSlug,
        `${ev.contractAddress.slice(0, 6)}...${ev.contractAddress.slice(-4)}`,
        `${ev.successCount} / ${ev.walletCount}`,
        `${ev.durationMs}ms`,
      ]);
    });
    console.log(histTable.toString());
  }
}

async function nodeHealthMenu() {
  const chains = getAllChains();
  const s = spinner();
  s.start('Pinging all registered RPC nodes...');

  const table = new Table({
    head: [chalk.cyan('Chain'), chalk.cyan('ID'), chalk.cyan('RPC Latency'), chalk.cyan('Latest Block'), chalk.cyan('Status')],
  });

  for (const chain of chains) {
    const viemChain = toViemChain(chain);
    const client = createPublicClient({ chain: viemChain, transport: http(chain.rpcUrl) });
    const start = performance.now();
    try {
      const blockNumber = await client.getBlockNumber();
      const latency = Math.round(performance.now() - start);
      table.push([
        chain.name,
        chain.id.toString(),
        `${latency}ms`,
        blockNumber.toString(),
        chalk.green('ONLINE'),
      ]);
    } catch {
      table.push([chain.name, chain.id.toString(), 'Timeout', '-', chalk.red('OFFLINE')]);
    }
  }

  s.stop('Node health check complete');
  console.log(table.toString());
}

async function seadropMenu() {
  const chainSlug = await selectChainPrompt();
  const nftContract = await text({
    message: 'Enter NFT contract address deployed on SeaDrop (0x...):',
    validate: (val) => (!val || !isAddress(val) ? 'Invalid address' : undefined),
  });
  handleCancel(nftContract);

  const s = spinner();
  s.start('Fetching SeaDrop configuration...');
  const publicDrop = await seaDropMinter.getPublicDropDetails(chainSlug, nftContract as `0x${string}`);
  const allowList = await seaDropMinter.getAllowListDetails(chainSlug, nftContract as `0x${string}`);
  s.stop('SeaDrop data fetched');

  if (!publicDrop && !allowList) {
    note('No SeaDrop configuration found on-chain for this address.', 'Warning');
    return;
  }

  const infoTable = new Table({ head: [chalk.cyan('Stage'), chalk.cyan('Price'), chalk.cyan('Max/Wallet'), chalk.cyan('Status')] });
  if (publicDrop) {
    infoTable.push([
      'Public Drop',
      publicDrop.mintPriceFormatted,
      publicDrop.maxTotalMintableByWallet.toString(),
      publicDrop.isActive ? chalk.green('LIVE NOW') : chalk.yellow(`Opens at ${new Date(publicDrop.startTime * 1000).toLocaleTimeString()}`),
    ]);
  }
  if (allowList) {
    infoTable.push([
      'Allowlist Drop',
      allowList.mintPriceFormatted,
      allowList.maxTotalMintableByWallet.toString(),
      allowList.isActive ? chalk.green('LIVE NOW') : chalk.yellow(`Opens at ${new Date(allowList.startTime * 1000).toLocaleTimeString()}`),
    ]);
  }
  console.log(infoTable.toString());

  const burners = vault.getBurners();
  const allWallets = vault.getUnlockedWallets();
  const targetWallets = burners.length > 0 ? burners : allWallets;

  if (targetWallets.length === 0) {
    note('Please generate or import wallets before minting.', 'Error');
    return;
  }

  const action = await select({
    message: 'Select SeaDrop Action:',
    options: [
      { value: 'mint-public', label: '⚡ Mint Public Stage (Multi-Wallet)' },
      { value: 'simulate-public', label: '🛡️ Simulate Public Stage' },
      { value: 'back', label: '⬅️ Back' },
    ],
  });
  handleCancel(action);

  if (action === 'mint-public' || action === 'simulate-public') {
    const qtyInput = await text({
      message: 'Quantity to mint per wallet:',
      placeholder: '1',
      validate: (val) => (isNaN(Number(val)) || Number(val) < 1 ? 'Enter valid quantity' : undefined),
    });
    handleCancel(qtyInput);

    const isSimulate = action === 'simulate-public';
    const mintSpinner = spinner();
    mintSpinner.start(isSimulate ? 'Simulating SeaDrop mint...' : `Executing parallel SeaDrop mint across ${targetWallets.length} wallets...`);

    const results = await seaDropMinter.mintPublic(
      chainSlug,
      nftContract as `0x${string}`,
      Number(qtyInput),
      targetWallets,
      publicDrop?.feeRecipient,
      isSimulate
    );
    mintSpinner.stop(isSimulate ? 'Simulation complete' : 'SeaDrop mint complete');

    const resTable = new Table({
      head: [chalk.cyan('Wallet'), chalk.cyan('Status'), chalk.cyan('Tx Hash / Error'), chalk.cyan('Latency')],
    });
    results.forEach((r) => {
      resTable.push([
        `${r.walletAddress.slice(0, 6)}...${r.walletAddress.slice(-4)}`,
        r.status === 'success' ? chalk.green('SUCCESS') : r.status === 'simulated' ? chalk.blue('SIMULATED') : chalk.red('FAILED'),
        r.txHash ? r.txHash.slice(0, 18) + '...' : r.error || '-',
        `${r.latencyMs}ms`,
      ]);
    });
    console.log(resTable.toString());
  }
}

async function copymintMenu() {
  while (true) {
    const status = copyMintEngine.getStatus();
    const action = await select({
      message: `Copy-Mint Manager (Status: ${status.isRunning ? chalk.green('WATCHING') : chalk.gray('IDLE')}, ${followedWallets.length} Wallets):`,
      options: [
        { value: 'toggle', label: status.isRunning ? '⏹️ Stop Copy-Mint Watcher' : '▶️ Start Copy-Mint Watcher' },
        { value: 'add', label: '➕ Add Followed Wallet', hint: 'Follow a new alpha wallet' },
        { value: 'list', label: '📋 List Followed Wallets' },
        { value: 'remove', label: '🗑️ Remove Followed Wallet' },
        { value: 'back', label: '⬅️ Back' },
      ],
    });
    handleCancel(action);

    if (action === 'back') break;

    if (action === 'toggle') {
      if (status.isRunning) {
        copyMintEngine.stop();
        note('Copy-mint watcher stopped.', 'Stopped');
      } else {
        if (followedWallets.length === 0) {
          note('Please add at least one wallet to follow first.', 'Error');
          continue;
        }

        const chainSlug = await selectChainPrompt();
        const burners = vault.getBurners();
        if (burners.length === 0) {
          note('No burner wallets found to execute copy-mints with.', 'Error');
          continue;
        }

        const maxPriceInput = await text({
          message: 'Max mint price in ETH (0 for free mints only):',
          placeholder: '0',
          validate: (val) => (isNaN(Number(val)) || Number(val) < 0 ? 'Enter valid price' : undefined),
        });
        handleCancel(maxPriceInput);

        const gasCapInput = await text({
          message: 'Max gas price cap in Gwei (e.g. 50):',
          placeholder: '50',
        });
        handleCancel(gasCapInput);

        copyMintEngine.startCopyMint(
          {
            chainSlug,
            targetWallets: followedWallets,
            maxPriceWei: parseEther(maxPriceInput as string),
            maxGasPriceGwei: BigInt(gasCapInput as string || '50'),
            mirrorBurners: burners,
          },
          (ev) => {
            console.log(chalk.bold.green(`\n🎯 TARGET MINT DETECTED from ${ev.targetWallet} on ${ev.contractAddress}`));
            ev.mirroredResults.forEach((r) => {
              console.log(`   Mirror result [${r.walletAddress.slice(0, 6)}...]: ${r.status.toUpperCase()} ${r.txHash || r.error}`);
            });
          }
        );

        note(`Watching ${followedWallets.length} target wallets on ${chainSlug} in background...`, 'Started');
      }
    } else if (action === 'add') {
      const addr = await text({
        message: 'Enter wallet address to copy (0x...):',
        validate: (val) => (!val || !isAddress(val) ? 'Invalid address' : undefined),
      });
      handleCancel(addr);

      followedWallets.push(addr as `0x${string}`);
      note(`Added ${String(addr)} to watchlist.`, 'Success');
    } else if (action === 'list') {
      if (followedWallets.length === 0) {
        note('No wallets currently followed.', 'Watchlist');
      } else {
        const table = new Table({ head: [chalk.cyan('#'), chalk.cyan('Target Address')] });
        followedWallets.forEach((w, i) => table.push([(i + 1).toString(), w]));
        console.log(table.toString());
      }
    } else if (action === 'remove') {
      if (followedWallets.length === 0) {
        note('Watchlist is empty.', 'Notice');
        continue;
      }
      const selected = await select({
        message: 'Select wallet to remove:',
        options: followedWallets.map((w) => ({ value: w, label: w })),
      });
      handleCancel(selected);
      followedWallets = followedWallets.filter((w) => w.toLowerCase() !== String(selected).toLowerCase());
      note(`Removed ${String(selected)} from watchlist.`, 'Success');
    }
  }
}

async function main() {
  console.clear();
  intro(chalk.bold.magenta('⚡ BLINK ENGINE — Ultra-Fast EVM Mint & Multi-Wallet Automation'));

  await unlockVaultPrompt();

  while (true) {
    const choice = await select({
      message: 'Main Menu:',
      options: [
        { value: 'wallets', label: '👛 Wallet Manager', hint: 'Generate burners, check balances, set master' },
        { value: 'mint', label: '⚡ Direct Contract Mint', hint: 'Instant multi-wallet parallel execution' },
        { value: 'seadrop', label: '🌊 OpenSea SeaDrop Minter', hint: 'Auto-mint OpenSea public & allowlist drops' },
        { value: 'copymint', label: '👥 Copy-Mint Manager', hint: 'Follow alpha wallets and auto-mirror mints' },
        { value: 'schedule', label: '⏳ Schedule Mint', hint: 'Precision countdown drop execution' },
        { value: 'disperse', label: '💸 Disperse & Consolidate', hint: 'Batch fund or sweep balances' },
        { value: 'sweep', label: '🧹 Sweep NFTs', hint: 'Consolidate minted NFTs to master cold wallet' },
        { value: 'analytics', label: '📊 Analytics & Telemetry', hint: 'PnL, gas spent, success rates' },
        { value: 'nodes', label: '🌐 RPC Node Health & Chains', hint: 'Ping RPCs, check block heights' },
        { value: 'exit', label: '🚪 Exit' },
      ],
    });
    handleCancel(choice);

    if (choice === 'exit') {
      outro(chalk.magenta('Blink engine standing by. Blinking fast minting!'));
      process.exit(0);
    }

    if (choice === 'wallets') await walletMenu();
    if (choice === 'mint') await mintMenu();
    if (choice === 'seadrop') await seadropMenu();
    if (choice === 'copymint') await copymintMenu();
    if (choice === 'schedule') await scheduleMenu();
    if (choice === 'disperse') await disperseMenu();
    if (choice === 'sweep') await sweepMenu();
    if (choice === 'analytics') await analyticsMenu();
    if (choice === 'nodes') await nodeHealthMenu();
  }
}

main().catch((err) => {
  console.error(chalk.red('Fatal Error:'), err);
  process.exit(1);
});
