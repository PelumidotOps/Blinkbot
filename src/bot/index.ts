import { Bot, Context } from 'grammy';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { parseEther, isAddress, createPublicClient, http } from 'viem';
import { VaultManager } from '../core/vault.js';
import { ContractMinter } from '../core/minter.js';
import { SeaDropMinter } from '../core/seadrop.js';
import { CopyMintEngine } from '../core/copymint.js';
import { DisperseManager } from '../core/disperse.js';
import { SweepManager } from '../core/sweep.js';
import { AnalyticsTracker } from '../core/analytics.js';
import { getAllChains, toViemChain } from '../config/chains.js';
import {
  getMainMenuKeyboard,
  getWalletsKeyboard,
  getCopyMintKeyboard,
  getDisperseKeyboard,
} from './keyboards.js';

dotenv.config();

const vault = new VaultManager();
const analytics = new AnalyticsTracker();
const minter = new ContractMinter(analytics);
const seaDropMinter = new SeaDropMinter(analytics);
const copyMintEngine = new CopyMintEngine(analytics);
const disperseManager = new DisperseManager();
const sweepManager = new SweepManager();

let followedWallets: `0x${string}`[] = [];

// Try to auto-unlock with the password from .env
const vaultPassword = process.env.VAULT_PASSWORD || 'BlinkMasterVault2026!';
vault.unlock(vaultPassword);

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token || token.trim() === '') {
  console.log(chalk.bold.yellow('\n⚠️ TELEGRAM_BOT_TOKEN is not set in .env!'));
}

export const bot = new Bot(token || 'dummy_token_for_compilation');

const LOCKED_MSG = '🔒 <b>Your wallets are locked.</b>\nSend <code>/unlock &lt;password&gt;</code> to continue.';
const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

// Global error handler (ignores Telegram's harmless "message is not modified")
bot.catch((err) => {
  const errMsg = err.error instanceof Error ? err.error.message : String(err.error);
  if (errMsg.includes('message is not modified')) return;
  console.error(chalk.red(`Telegram Bot Error [${err.ctx?.update?.update_id}]:`), err.error);
  err.ctx
    ?.reply(`⚠️ <b>Something went wrong:</b> ${errMsg}`, { parse_mode: 'HTML' })
    .catch(() => {});
});

async function safeEditMessage(ctx: Context, text: string, options?: any) {
  try {
    await ctx.editMessageText(text, options);
  } catch (err: any) {
    if (err?.message?.includes('message is not modified')) return;
    throw err;
  }
}

function getHeader(): string {
  const top =
    `⚡ <b>BLINK</b> ⚡\n` +
    `<i>Fast NFT minting across multiple chains</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`;

  if (!vault.isUnlockedStatus()) {
    return top + `🔒 <b>Wallets locked</b>\n━━━━━━━━━━━━━━━━━━━━\n👉 Send <code>/unlock &lt;password&gt;</code> to get started.\n\n`;
  }

  const wallets = vault.getBurners();
  const main = vault.getMasterWallet();
  return (
    top +
    `• <b>Mint Wallets:</b> <code>${wallets.length}</code>\n` +
    `• <b>Main Wallet:</b> <code>${main ? short(main.address) : 'Not set'}</code>\n` +
    `• <b>Chains:</b> Base • Ethereum • Ink • Arc • Robinhood\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`
  );
}

function statsText(): string {
  const s = analytics.getSummary();
  return (
    `📊 <b>YOUR STATS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `• <b>Mint Attempts:</b> <code>${s.totalRuns}</code>\n` +
    `• <b>Wallets Used:</b> <code>${s.totalWalletsAttempted}</code>\n` +
    `• <b>Successful:</b> 🟢 <code>${s.totalSuccess}</code>\n` +
    `• <b>Failed:</b> 🔴 <code>${s.totalReverted}</code>\n` +
    `• <b>Success Rate:</b> <code>${s.overallSuccessRate}</code>\n` +
    `• <b>Gas Spent:</b> <code>${s.totalGasSpentEth} ETH</code>\n` +
    `• <b>Avg Speed:</b> <code>${s.avgLatencyMs} ms</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`
  );
}

async function networkStatusText(): Promise<string> {
  let text = `🌐 <b>NETWORK STATUS</b>\n<i>Response time for each chain</i>\n\n`;
  for (const c of getAllChains()) {
    const client = createPublicClient({ chain: toViemChain(c), transport: http(c.rpcUrl) });
    const start = performance.now();
    try {
      await client.getBlockNumber();
      text += `• <b>${c.name}:</b> 🟢 <code>${Math.round(performance.now() - start)}ms</code>\n`;
    } catch {
      text += `• <b>${c.name}:</b> 🔴 <i>Not responding</i>\n`;
    }
  }
  return text;
}

function walletsText(limit = 8): string {
  const wallets = vault.getBurners();
  const main = vault.getMasterWallet();
  let text = `👛 <b>MY WALLETS</b>\n\n`;
  text += `👑 <b>Main Wallet</b> <i>(where NFTs & funds are collected)</i>\n<code>${main ? main.address : 'Not set'}</code>\n\n`;
  text += `🔥 <b>Mint Wallets (${wallets.length})</b> <i>(used to mint)</i>\n`;
  if (wallets.length === 0) {
    text += `<i>You have no mint wallets yet. Tap "➕ 5 New Wallets" below.</i>\n`;
  } else {
    wallets.slice(0, limit).forEach((w) => {
      text += `• <b>${w.label}:</b> <code>${w.address}</code>\n`;
    });
    if (wallets.length > limit) text += `<i>...and ${wallets.length - limit} more</i>\n`;
  }
  return text;
}

// ----------------------------------------------------
// COMMANDS
// ----------------------------------------------------
bot.command('unlock', async (ctx) => {
  const password = ctx.message?.text?.split(' ')[1];
  if (!password) {
    await ctx.reply('🔒 <b>How to unlock:</b> <code>/unlock &lt;password&gt;</code>', { parse_mode: 'HTML' });
    return;
  }
  if (vault.unlock(password)) {
    await ctx.reply(`✅ <b>Unlocked!</b>\n\n` + getHeader() + `What would you like to do?`, {
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard(),
    });
  } else {
    await ctx.reply('❌ <b>Wrong password.</b> Use the password you set when you first created your wallets.', {
      parse_mode: 'HTML',
    });
  }
});

bot.command('resetvault', async (ctx) => {
  const newPass = ctx.message?.text?.split(' ')[1];
  if (!newPass || newPass.length < 8) {
    await ctx.reply('🔒 <b>How to use:</b> <code>/resetvault &lt;new_password&gt;</code> (at least 8 characters)', { parse_mode: 'HTML' });
    return;
  }
  vault.resetVault(newPass);
  await ctx.reply(`✅ <b>Password updated and keystore re-encrypted.</b>\n\n` + getHeader(), {
    parse_mode: 'HTML',
    reply_markup: getMainMenuKeyboard(),
  });
});

bot.command(['start', 'menu'], async (ctx) => {
  await ctx.reply(getHeader() + `What would you like to do?`, {
    parse_mode: 'HTML',
    reply_markup: getMainMenuKeyboard(),
  });
});

bot.command(['wallets', 'wallet'], async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));
  await ctx.reply(walletsText(10), { parse_mode: 'HTML', reply_markup: getWalletsKeyboard() });
});

bot.command(['disperse', 'fund'], async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));
  const main = vault.getMasterWallet();
  const textArgs = ctx.message?.text?.split(' ').slice(1) || [];
  
  if (textArgs.length > 0 && !isNaN(parseFloat(textArgs[0]))) {
    return void (await fundWallets(ctx, textArgs[0]));
  }

  await ctx.reply(
    `💸 <b>FUND & DISPERSE</b>\n\n` +
      `• <b>Main Wallet:</b> <code>${main ? main.address : 'Not set (use /setmain)'}</code>\n` +
      `• <b>Mint Wallets:</b> <code>${vault.getBurners().length}</code>\n\n` +
      `Send <code>/disperse 0.01</code> or choose an option below:`,
    { parse_mode: 'HTML', reply_markup: getDisperseKeyboard() }
  );
});

bot.command(['stats', 'analytics'], async (ctx) => {
  await ctx.reply(statsText(), { parse_mode: 'HTML', reply_markup: getMainMenuKeyboard() });
});

bot.command(['status', 'nodes'], async (ctx) => {
  await ctx.reply(await networkStatusText(), { parse_mode: 'HTML', reply_markup: getMainMenuKeyboard() });
});

// /mint <chain> <contract> [quantity]
bot.command('mint', async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));

  const args = ctx.message?.text?.split(' ').slice(1) || [];
  if (args.length < 2) {
    await ctx.reply(
      `⚡ <b>How to mint:</b>\n<code>/mint &lt;chain&gt; &lt;contract address&gt; [amount]</code>\n\nExample:\n<code>/mint base 0x1234...7890 1</code>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  const [chainSlug, contractAddress, qtyStr] = args;
  if (!isAddress(contractAddress)) return void (await ctx.reply('❌ That contract address doesn\'t look right.'));

  const wallets = vault.getBurners();
  if (wallets.length === 0) return void (await ctx.reply('❌ You have no mint wallets yet. Open /wallets to create some.'));

  const statusMsg = await ctx.reply(
    `⚡ Minting from <code>${wallets.length}</code> wallets on <b>${chainSlug}</b>...`,
    { parse_mode: 'HTML' }
  );

  try {
    const results = await minter.executeMint(
      { chainSlug, contractAddress: contractAddress as `0x${string}`, quantity: Number(qtyStr || '1'), gasSpeed: 'instant' },
      wallets
    );

    let report = `🎉 <b>MINT COMPLETE</b>\n• Contract: <code>${contractAddress}</code>\n\n`;
    results.forEach((r) => {
      const icon = r.status === 'success' ? '🟢' : r.status === 'simulated' ? '🔵' : '🔴';
      const label = r.status === 'success' ? 'Minted' : r.status === 'simulated' ? 'Test OK' : 'Failed';
      report += `${icon} <code>${short(r.walletAddress)}</code>: <b>${label}</b> (${r.latencyMs}ms)\n`;
      if (r.txHash) report += `   Tx: <code>${r.txHash.slice(0, 20)}...</code>\n`;
      if (r.error) report += `   <i>${r.error.slice(0, 50)}</i>\n`;
    });

    await ctx.api.editMessageText(ctx.chat.id, statusMsg.message_id, report, { parse_mode: 'HTML' });
  } catch (err: any) {
    await ctx.api.editMessageText(ctx.chat.id, statusMsg.message_id, `❌ Mint failed: ${err.message}`);
  }
});

// /opensea <chain> <contract> [quantity]
bot.command(['opensea', 'seadrop'], async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));

  const args = ctx.message?.text?.split(' ').slice(1) || [];
  if (args.length < 2) {
    await ctx.reply(
      `🌊 <b>How to mint an OpenSea drop:</b>\n<code>/opensea &lt;chain&gt; &lt;contract address&gt; [amount]</code>\n\nExample:\n<code>/opensea base 0x1234...7890 1</code>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  const [chainSlug, nftContract, qtyStr] = args;
  if (!isAddress(nftContract)) return void (await ctx.reply('❌ That contract address doesn\'t look right.'));

  const wallets = vault.getBurners();
  const waitMsg = await ctx.reply('🌊 Checking the drop on OpenSea...');

  try {
    const details = await seaDropMinter.getPublicDropDetails(chainSlug, nftContract as `0x${string}`);
    if (!details) {
      await ctx.api.editMessageText(ctx.chat.id, waitMsg.message_id, '❌ No OpenSea drop found for this contract.');
      return;
    }

    await ctx.api.editMessageText(
      ctx.chat.id,
      waitMsg.message_id,
      `🌊 <b>Drop found!</b>\n` +
        `• Price: <code>${details.mintPriceFormatted}</code>\n` +
        `• Status: ${details.isActive ? '🟢 Live' : '⏳ Not open yet'}\n` +
        `• Minting from <code>${wallets.length}</code> wallets...`,
      { parse_mode: 'HTML' }
    );

    const results = await seaDropMinter.mintPublic(chainSlug, nftContract as `0x${string}`, Number(qtyStr || '1'), wallets, details.feeRecipient);

    let report = `🎉 <b>OPENSEA MINT RESULTS</b>\n\n`;
    results.forEach((r) => {
      report += `• <code>${short(r.walletAddress)}</code>: <b>${r.status === 'success' ? 'Minted' : 'Failed'}</b>\n`;
      if (r.txHash) report += `   Tx: <code>${r.txHash.slice(0, 18)}...</code>\n`;
    });
    await ctx.reply(report, { parse_mode: 'HTML' });
  } catch (err: any) {
    await ctx.reply(`❌ OpenSea mint failed: ${err.message}`);
  }
});

// /setmain <address>
bot.command(['setmain', 'setmaster'], async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));
  const addr = ctx.message?.text?.split(' ')[1];
  if (!addr || !isAddress(addr)) {
    await ctx.reply('👑 <b>How to set your main wallet:</b> <code>/setmain &lt;wallet address&gt;</code>', { parse_mode: 'HTML' });
    return;
  }
  vault.setMaster(addr as `0x${string}`);
  await ctx.reply(`👑 <b>Main wallet set:</b>\n<code>${addr}</code>`, { parse_mode: 'HTML' });
});

// /follow <address>
bot.command(['follow', 'copyadd'], async (ctx) => {
  const addr = ctx.message?.text?.split(' ')[1];
  if (!addr || !isAddress(addr)) {
    await ctx.reply('👥 <b>How to follow a wallet:</b> <code>/follow &lt;wallet address&gt;</code>', { parse_mode: 'HTML' });
    return;
  }
  followedWallets.push(addr as `0x${string}`);
  await ctx.reply(`👥 Now following <code>${addr}</code>\nYou follow <b>${followedWallets.length}</b> wallet(s).`, {
    parse_mode: 'HTML',
  });
});

// /sweep <chain> <collection>
bot.command(['sweep', 'collectnfts'], async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));
  const args = ctx.message?.text?.split(' ').slice(1) || [];
  if (args.length < 2) {
    await ctx.reply('🖼️ <b>How to sweep NFTs:</b> <code>/sweep &lt;chain&gt; &lt;collection address&gt;</code>', { parse_mode: 'HTML' });
    return;
  }
  const [chainSlug, colAddr] = args;
  const main = vault.getMasterWallet();
  if (!main) return void (await ctx.reply('❌ Set your main wallet first with /setmain.'));

  const wallets = vault.getBurners();
  const waitMsg = await ctx.reply(`🖼️ Moving NFTs from ${wallets.length} wallets to your main wallet...`);
  try {
    const results = await sweepManager.sweepCollection(chainSlug, colAddr as `0x${string}`, wallets, main.address);
    const moved = results.filter((r) => r.status === 'success').length;
    await ctx.api.editMessageText(ctx.chat.id, waitMsg.message_id, `🖼️ Done! Moved <b>${moved}</b> NFTs to <code>${main.address}</code>`, { parse_mode: 'HTML' });
  } catch (err: any) {
    await ctx.api.editMessageText(ctx.chat.id, waitMsg.message_id, `❌ Couldn't collect NFTs: ${err.message}`);
  }
});

// ----------------------------------------------------
// BUTTONS
// ----------------------------------------------------
bot.callbackQuery('menu_main', async (ctx) => {
  await ctx.answerCallbackQuery();
  await safeEditMessage(ctx, getHeader() + `What would you like to do?`, {
    parse_mode: 'HTML',
    reply_markup: getMainMenuKeyboard(),
  });
});

bot.callbackQuery('menu_mint', async (ctx) => {
  await ctx.answerCallbackQuery();
  await safeEditMessage(
    ctx,
    `⚡ <b>MINT NOW</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
      `Mint any live NFT from all your mint wallets at once.\n\n` +
      `👉 <b>Send:</b>\n<code>/mint &lt;chain&gt; &lt;contract address&gt; [amount]</code>\n\n` +
      `<b>Examples:</b>\n• <code>/mint base 0x1234... 1</code>\n• <code>/mint ethereum 0xabcd... 2</code>\n\n` +
      `<i>Chains: base, ethereum, ink, arc, robinhood, arbitrum</i>`,
    { parse_mode: 'HTML', reply_markup: getMainMenuKeyboard() }
  );
});

bot.callbackQuery('menu_seadrop', async (ctx) => {
  await ctx.answerCallbackQuery();
  await safeEditMessage(
    ctx,
    `🌊 <b>OPENSEA DROPS</b>\n━━━━━━━━━━━━━━━━━━━━\n` +
      `Mint drops launched on OpenSea. Blink checks the price and whether the drop is open before minting.\n\n` +
      `👉 <b>Send:</b>\n<code>/opensea &lt;chain&gt; &lt;contract address&gt; [amount]</code>\n\n` +
      `<b>Example:</b>\n<code>/opensea base 0x1234...7890 1</code>`,
    { parse_mode: 'HTML', reply_markup: getMainMenuKeyboard() }
  );
});

bot.callbackQuery('menu_wallets', async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));
  await safeEditMessage(ctx, walletsText(), { parse_mode: 'HTML', reply_markup: getWalletsKeyboard() });
});

bot.callbackQuery('wallets_gen_1', async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.answerCallbackQuery({ text: 'Wallets locked. Send /unlock <password>' }));
  await ctx.answerCallbackQuery({ text: 'Creating wallet...' });
  const w = vault.generateBurners(1)[0];
  await ctx.reply(`✅ <b>New mint wallet created:</b>\n<code>${w.address}</code>`, {
    parse_mode: 'HTML',
    reply_markup: getWalletsKeyboard(),
  });
});

bot.callbackQuery('wallets_gen_5', async (ctx) => {
  if (!vault.isUnlockedStatus()) return void (await ctx.answerCallbackQuery({ text: 'Wallets locked. Send /unlock <password>' }));
  await ctx.answerCallbackQuery({ text: 'Creating 5 wallets...' });
  const ws = vault.generateBurners(5);
  let text = `✅ <b>5 new mint wallets created:</b>\n\n`;
  ws.forEach((w) => (text += `• <code>${w.address}</code>\n`));
  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: getWalletsKeyboard() });
});

async function showBalances(ctx: Context, chain: string, label: string) {
  if (!vault.isUnlockedStatus()) return void (await ctx.answerCallbackQuery({ text: 'Wallets locked. Send /unlock <password>' }));
  await ctx.answerCallbackQuery({ text: `Checking ${label} balances...` });
  const balances = await vault.fetchBalances(chain);
  let text = `💰 <b>BALANCES ON ${label.toUpperCase()}</b>\n\n`;
  balances.slice(0, 10).forEach(({ wallet, balanceFormatted }) => {
    text += `• <b>${wallet.label}:</b> <code>${balanceFormatted}</code>\n`;
  });
  await safeEditMessage(ctx, text, { parse_mode: 'HTML', reply_markup: getWalletsKeyboard() });
}

bot.callbackQuery('wallets_bal_base', (ctx) => showBalances(ctx, 'base', 'Base'));
bot.callbackQuery('wallets_bal_ethereum', (ctx) => showBalances(ctx, 'ethereum', 'Ethereum'));

bot.callbackQuery('wallets_set_master', async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));
  await ctx.reply(
    `👑 <b>Set your main wallet</b>\nThis is where your NFTs and leftover ETH get collected.\n\nSend: <code>/setmain &lt;wallet address&gt;</code>`,
    { parse_mode: 'HTML' }
  );
});

function copyMintText(): string {
  const { isRunning } = copyMintEngine.getStatus();
  return (
    `👥 <b>COPY MINTS</b>\n` +
    `<i>Follow other wallets and automatically mint what they mint.</i>\n\n` +
    `• <b>Auto-Copy:</b> ${isRunning ? '🟢 <b>On</b>' : '⚪ <b>Off</b>'}\n` +
    `• <b>Wallets you follow:</b> <code>${followedWallets.length}</code>\n\n` +
    `<i>Only free mints are copied by default.</i>`
  );
}

bot.callbackQuery('menu_copymint', async (ctx) => {
  await ctx.answerCallbackQuery();
  await safeEditMessage(ctx, copyMintText(), {
    parse_mode: 'HTML',
    reply_markup: getCopyMintKeyboard(copyMintEngine.getStatus().isRunning),
  });
});

bot.callbackQuery('copymint_toggle', async (ctx) => {
  if (copyMintEngine.getStatus().isRunning) {
    copyMintEngine.stop();
    await ctx.answerCallbackQuery({ text: 'Auto-Copy paused.' });
  } else {
    if (followedWallets.length === 0) {
      await ctx.answerCallbackQuery({ text: 'Follow a wallet first.' });
      await ctx.reply('👥 <b>Follow a wallet first:</b>\nSend <code>/follow &lt;wallet address&gt;</code>', { parse_mode: 'HTML' });
      return;
    }
    copyMintEngine.startCopyMint(
      { chainSlug: 'base', targetWallets: followedWallets, maxPriceWei: 0n, mirrorBurners: vault.getBurners() },
      (ev) => {
        ctx
          .reply(`🎯 <b>Copied a mint!</b>\nFrom: <code>${ev.targetWallet}</code>\nContract: <code>${ev.contractAddress}</code>`, { parse_mode: 'HTML' })
          .catch(() => {});
      }
    );
    await ctx.answerCallbackQuery({ text: 'Auto-Copy is on (Base).' });
  }
  await safeEditMessage(ctx, copyMintText(), {
    parse_mode: 'HTML',
    reply_markup: getCopyMintKeyboard(copyMintEngine.getStatus().isRunning),
  });
});

bot.callbackQuery('copymint_list', async (ctx) => {
  await ctx.answerCallbackQuery();
  if (followedWallets.length === 0) {
    await ctx.reply('👥 <b>You aren\'t following anyone yet.</b>\nSend <code>/follow &lt;wallet address&gt;</code>', { parse_mode: 'HTML' });
    return;
  }
  let text = `👥 <b>WALLETS YOU FOLLOW</b>\n\n`;
  followedWallets.forEach((w, i) => (text += `${i + 1}. <code>${w}</code>\n`));
  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: getCopyMintKeyboard(copyMintEngine.getStatus().isRunning) });
});

bot.callbackQuery('copymint_add', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `➕ <b>Follow a wallet</b>\nSend: <code>/follow &lt;wallet address&gt;</code>\n\nExample:\n<code>/follow 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</code>`,
    { parse_mode: 'HTML' }
  );
});

bot.callbackQuery('copymint_clear', async (ctx) => {
  followedWallets = [];
  copyMintEngine.stop();
  await ctx.answerCallbackQuery({ text: 'Unfollowed all wallets.' });
  await safeEditMessage(ctx, copyMintText(), { parse_mode: 'HTML', reply_markup: getCopyMintKeyboard(false) });
});

bot.callbackQuery('menu_disperse', async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!vault.isUnlockedStatus()) return void (await ctx.reply(LOCKED_MSG, { parse_mode: 'HTML' }));
  const main = vault.getMasterWallet();
  await safeEditMessage(
    ctx,
    `💸 <b>FUND & COLLECT</b>\n\n` +
      `• <b>Main Wallet:</b> <code>${main ? main.address : 'Not set'}</code>\n` +
      `• <b>Mint Wallets:</b> <code>${vault.getBurners().length}</code>\n\n` +
      `<b>Fund</b> sends ETH from your main wallet to every mint wallet in one transaction.\n` +
      `<b>Collect</b> moves leftover ETH or NFTs back to your main wallet.`,
    { parse_mode: 'HTML', reply_markup: getDisperseKeyboard() }
  );
});

async function fundWallets(ctx: Context, amount: string) {
  await ctx.answerCallbackQuery({ text: `Sending ${amount} ETH to each wallet...` });
  const main = vault.getMasterWallet();
  const wallets = vault.getBurners();
  if (!main || wallets.length === 0) return void (await ctx.reply('❌ Set a main wallet and create mint wallets first.'));

  const res = await disperseManager.disperseEther('base', main, wallets.map((w) => w.address), parseEther(amount));
  await ctx.reply(
    res.success
      ? `💸 <b>Sent ${amount} ETH to ${wallets.length} wallets.</b>\nTx: <code>${res.txHash}</code>`
      : `❌ Funding failed: ${res.error}`,
    { parse_mode: 'HTML' }
  );
}

bot.callbackQuery('disperse_fund_005', (ctx) => fundWallets(ctx, '0.005'));
bot.callbackQuery('disperse_fund_01', (ctx) => fundWallets(ctx, '0.01'));

bot.callbackQuery('disperse_consolidate', async (ctx) => {
  await ctx.answerCallbackQuery({ text: 'Collecting ETH...' });
  const main = vault.getMasterWallet();
  if (!main) return void (await ctx.reply('❌ Set your main wallet first with /setmain.'));
  const results = await disperseManager.consolidateFunds('base', vault.getBurners(), main.address);
  const done = results.filter((r) => r.status === 'success').length;
  await ctx.reply(`🔄 <b>Done!</b> Collected ETH from <b>${done}</b> wallets into your main wallet.`, { parse_mode: 'HTML' });
});

bot.callbackQuery('disperse_sweep', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `🖼️ <b>Collect NFTs</b>\nSend: <code>/collectnfts &lt;chain&gt; &lt;collection address&gt;</code>\n\nExample:\n<code>/collectnfts base 0x1234...</code>`,
    { parse_mode: 'HTML' }
  );
});

bot.callbackQuery('menu_analytics', async (ctx) => {
  await ctx.answerCallbackQuery();
  await safeEditMessage(ctx, statsText(), { parse_mode: 'HTML', reply_markup: getMainMenuKeyboard() });
});

bot.callbackQuery('menu_nodes', async (ctx) => {
  await ctx.answerCallbackQuery({ text: 'Checking networks...' });
  await safeEditMessage(ctx, await networkStatusText(), { parse_mode: 'HTML', reply_markup: getMainMenuKeyboard() });
});

// ----------------------------------------------------
// START
// ----------------------------------------------------
export async function startBot() {
  if (!token || token.trim() === '') {
    console.log(chalk.yellow('Skipping Telegram bot launch: No TELEGRAM_BOT_TOKEN provided.'));
    return;
  }

  // Shows the command list in Telegram's "/" menu
  await bot.api.setMyCommands([
    { command: 'start', description: 'Open the main menu' },
    { command: 'wallets', description: 'View and manage your wallets' },
    { command: 'disperse', description: 'Fund fleet wallets in one transaction' },
    { command: 'mint', description: 'Mint an NFT from a contract' },
    { command: 'opensea', description: 'Mint an OpenSea drop' },
    { command: 'follow', description: 'Follow a wallet to copy its mints' },
    { command: 'setmain', description: 'Set your main wallet' },
    { command: 'collectnfts', description: 'Move NFTs to your main wallet' },
    { command: 'stats', description: 'View your minting stats' },
    { command: 'status', description: 'Check network status' },
    { command: 'unlock', description: 'Unlock your wallets' },
  ]).catch(() => {});

  console.log(chalk.bold.green('🚀 Starting Blink Telegram Bot...'));
  bot.start({
    onStart: (info) => console.log(chalk.bold.cyan(`✨ Bot online as @${info.username}!`)),
  });
}

startBot().catch((err) => console.error(chalk.red('Bot startup error:'), err));
