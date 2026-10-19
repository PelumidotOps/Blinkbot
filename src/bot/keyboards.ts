import { InlineKeyboard } from 'grammy';
import { getAllChains } from '../config/chains.js';

export function getMainMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('👛 My Wallets', 'menu_wallets')
    .text('⚡ Mint Now', 'menu_mint')
    .row()
    .text('🌊 OpenSea Drops', 'menu_seadrop')
    .text('👥 Copy Mints', 'menu_copymint')
    .row()
    .text('💸 Fund & Sweep', 'menu_disperse')
    .text('📊 Stats', 'menu_analytics')
    .row()
    .text('🌐 Network Status', 'menu_nodes')
    .text('🔄 Refresh', 'menu_main');
}

export function getWalletsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('💰 Balances (Base)', 'wallets_bal_base')
    .text('💰 Balances (Ethereum)', 'wallets_bal_ethereum')
    .row()
    .text('➕ New Wallet', 'wallets_gen_1')
    .text('➕ 5 New Wallets', 'wallets_gen_5')
    .row()
    .text('👑 Set Main Wallet', 'wallets_set_master')
    .text('⬅️ Back', 'menu_main');
}

export function getChainsKeyboard(actionPrefix: string): InlineKeyboard {
  const chains = getAllChains();
  const kb = new InlineKeyboard();

  chains.forEach((c, idx) => {
    kb.text(`${c.name}`, `${actionPrefix}_${c.slug}`);
    if ((idx + 1) % 2 === 0) kb.row();
  });

  kb.row().text('⬅️ Back', 'menu_main');
  return kb;
}

export function getCopyMintKeyboard(isRunning: boolean): InlineKeyboard {
  return new InlineKeyboard()
    .text(isRunning ? '⏹️ Pause Auto-Copy' : '▶️ Start Auto-Copy', 'copymint_toggle')
    .text('📋 Wallets I Follow', 'copymint_list')
    .row()
    .text('➕ Follow a Wallet', 'copymint_add')
    .text('🗑️ Unfollow All', 'copymint_clear')
    .row()
    .text('⬅️ Back', 'menu_main');
}

export function getDisperseKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('💸 Send 0.005 ETH Each', 'disperse_fund_005')
    .text('💸 Send 0.01 ETH Each', 'disperse_fund_01')
    .row()
    .text('🔄 Sweep ETH', 'disperse_consolidate')
    .text('🖼️ Sweep NFTs', 'disperse_sweep')
    .row()
    .text('⬅️ Back', 'menu_main');
}
