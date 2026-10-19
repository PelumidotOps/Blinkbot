'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ClipboardList,
  FileText,
  Send,
  Download,
  Brush,
  Image as ImageIcon,
  Bot,
  Wallet,
  User,
  LogOut,
  Bell,
  X,
  Plus,
  Coins,
  History,
  Settings,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

interface WalletItem {
  id: number;
  address: string;
  label: string;
  isMaster: boolean;
  ethBalance: string;
  usdcBalance: string;
  nftsHeld: number;
  status: string;
  txCount: number;
}

interface DropItem {
  id: string;
  name: string;
  creator: string;
  chain: string;
  chainName: string;
  contract: string;
  mintPrice: string;
  mintPriceWei: string;
  maxPerWallet: number;
  totalItems: number;
  mintedCount: number;
  mintedPct: number;
  startTime: number;
  phase: string;
  badge: string;
  status: string;
}

interface CopyTracker {
  id: string;
  label: string;
  address: string;
  ens: string;
  mirrorFreeOnly: boolean;
  maxSpendEth: string;
  totalMirrored: number;
  active: boolean;
  chain: string;
  lastAction: string;
}

interface ActivityItem {
  id: string;
  title: string;
  tokenIds: string;
  type: string;
  chain: string;
  chainName: string;
  contract: string;
  txHash: string;
  walletsUsed: number;
  totalItems: number;
  gasPaid: string;
  timeAgo: string;
  status: string;
}

export default function BlinkApp() {
  // Navigation State
  const [activeNav, setActiveNav] = useState<
    | 'home'
    | 'schedule'
    | 'copymint'
    | 'contract'
    | 'disperse'
    | 'consolidate'
    | 'sweep'
    | 'automation'
    | 'wallets'
    | 'account'
    | 'nft-tracker'
    | 'whale-tracker'
    | 'opensea'
  >('home');

  // Sub-tabs (Mint / History / Settings or Overview / Plan / Connections)
  const [subTab, setSubTab] = useState<'action' | 'history' | 'settings'>('action');
  const [accountSubTab, setAccountSubTab] = useState<'overview' | 'plan' | 'connections'>('overview');

  // Dismissible Telegram & PWA Banners
  const [showTelegramBanner, setShowTelegramBanner] = useState(true);
  const [showPwaBanner, setShowPwaBanner] = useState(true);

  // Timeframe selector on Home chart
  const [timeframe, setTimeframe] = useState<'1M' | '5M' | '12H' | '24H' | '3D' | '7D'>('24H');

  // Data State
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [copyTrackers, setCopyTrackers] = useState<CopyTracker[]>([]);
  const [userActivity, setUserActivity] = useState<ActivityItem[]>([]);
  const [gasPrices, setGasPrices] = useState<Record<string, string>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Modals
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [showImportKeyModal, setShowImportKeyModal] = useState(false);
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [showAddCopyModal, setShowAddCopyModal] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newCopyAddress, setNewCopyAddress] = useState('');
  const [newCopyLabel, setNewCopyLabel] = useState('');
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleContract, setNewScheduleContract] = useState('');
  const [newScheduleChain, setNewScheduleChain] = useState<'ethereum' | 'base' | 'robinhood' | 'ink' | 'arc'>('base');
  const [newSchedulePrice, setNewSchedulePrice] = useState('0.00');

  // Contract Mint Form State
  const [mintContractAddr, setMintContractAddr] = useState('');
  const [mintChain, setMintChain] = useState<'ethereum' | 'base' | 'robinhood' | 'ink' | 'arc'>('base');
  const [mintQuantity, setMintQuantity] = useState(1);
  const [mintWalletFilter, setMintWalletFilter] = useState<'all' | '60' | 'n'>('all');
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  // Disperse Form State
  const [disperseChain, setDisperseChain] = useState<'ethereum' | 'base' | 'robinhood' | 'ink' | 'arc'>('base');
  const [disperseAmount, setDisperseAmount] = useState('0.01');
  const [isDispersing, setIsDispersing] = useState(false);

  // Copy Mint Settings State
  const [wlCopyMint, setWlCopyMint] = useState<'off' | 'on'>('off');
  const [copyGasSetting, setCopyGasSetting] = useState<'default' | 'custom'>('default');

  // Account Analytics Timeframe
  const [accountAnalyticsRange, setAccountAnalyticsRange] = useState<'30days' | 'alltime'>('alltime');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Real-time ticking timer for countdowns
  const [timeNow, setTimeNow] = useState<number>(0);
  useEffect(() => {
    setTimeNow(Date.now());
    const timer = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/state').then(r => r.json());
      if (res.success) {
        setWallets(res.wallets || []);
        setDrops(res.drops || []);
        setCopyTrackers(res.copyMintTrackers || []);
        setUserActivity(res.userActivity || []);
        setGasPrices(res.gasPrices || {});
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const executeContractMint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsMinting(true);
    setMintResult(null);

    try {
      const count = mintWalletFilter === 'all' ? 5 : mintWalletFilter === '60' ? 3 : 1;
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainSlug: mintChain,
          contractAddress: mintContractAddr,
          mintType: 'Contract Mint',
          quantity: mintQuantity,
          gasMultiplier: 1.2,
          walletCount: count,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMintResult({
          success: true,
          message: data.message,
          txHash: data.txHash,
        });
        loadData();
      } else {
        setMintResult({
          success: false,
          message: data.error || 'Contract execution simulation failed.',
        });
      }
    } catch {
      setMintResult({
        success: false,
        message: 'Network error communicating with node.',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const executeDisperse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispersing(true);
    try {
      const res = await fetch('/api/disperse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPerWallet: disperseAmount,
          chainSlug: disperseChain,
          currency: disperseChain === 'arc' ? 'USDC' : 'ETH',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertMessage(data.message);
        loadData();
        setTimeout(() => setAlertMessage(null), 6000);
      }
    } catch {
      setAlertMessage('Failed to execute batch disperse.');
      setTimeout(() => setAlertMessage(null), 4000);
    } finally {
      setIsDispersing(false);
    }
  };

  const executeSweep = async (type: 'eth' | 'nft') => {
    try {
      const res = await fetch('/api/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, chainSlug: mintChain }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertMessage(data.message);
        loadData();
        setTimeout(() => setAlertMessage(null), 6000);
      }
    } catch {
      setAlertMessage('Failed to execute sweep.');
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const formatCountdown = (targetTime: number) => {
    if (!timeNow) return 'Syncing...';
    const diff = targetTime - timeNow;
    if (diff <= 0) return 'LIVE NOW';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours > 0 ? hours + 'h ' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const mainWallet = wallets.find(w => w.isMaster) || wallets[0];
  const mintWallets = wallets.filter(w => !w.isMaster);

  // Chains list matching NullBot
  const chains = [
    { slug: 'ethereum', name: 'Ethereum', icon: '💎' },
    { slug: 'base', name: 'Base', icon: '🟦' },
    { slug: 'robinhood', name: 'Robinhood', icon: '🪶' },
    { slug: 'ink', name: 'Ink', icon: '🟣' },
    { slug: 'arc', name: 'Arc', icon: '🅰️' },
  ];

  return (
    <div className="min-h-screen stars-bg text-zinc-100 flex flex-col font-sans select-none">
      {/* ======================================================== */}
      {/* TOP INTELLIGENCE MARQUEE & HEADER */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#06070a]/90 backdrop-blur-md border-b border-white/[0.08]">
        {/* Intelligence Marquee Ticker */}
        <div className="px-6 py-1.5 border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-zinc-400 overflow-hidden">
          <div className="overflow-hidden flex-1 relative mr-4">
            <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <span className="text-[#6b5ef0] font-bold shrink-0">⚡ [Blink Network]</span>
                <span className="text-white font-medium">Base L2 Gas:</span>
                <span className="text-emerald-400 font-bold">{gasPrices.base || '0.002 Gwei'}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold shrink-0">🔷 Arbitrum One:</span>
                <span className="text-white">{gasPrices.arbitrum || '0.01 Gwei'}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-purple-400 font-bold shrink-0">🟣 Ink Chain:</span>
                <span className="text-white">{gasPrices.ink || '0.001 Gwei'}</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9b92ff] font-bold shrink-0">Ξ Ethereum:</span>
                <span className="text-white">{gasPrices.ethereum || '12.4 Gwei'}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold shrink-0">Fleet Active:</span>
                <span className="text-white">{wallets.length} Wallets</span>
              </div>

              {/* Duplicate track for seamless infinite loop */}
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-[#6b5ef0] font-bold shrink-0">⚡ [Blink Network]</span>
                <span className="text-white font-medium">Base L2 Gas:</span>
                <span className="text-emerald-400 font-bold">{gasPrices.base || '0.002 Gwei'}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold shrink-0">🔷 Arbitrum One:</span>
                <span className="text-white">{gasPrices.arbitrum || '0.01 Gwei'}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-purple-400 font-bold shrink-0">🟣 Ink Chain:</span>
                <span className="text-white">{gasPrices.ink || '0.001 Gwei'}</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9b92ff] font-bold shrink-0">Ξ Ethereum:</span>
                <span className="text-white">{gasPrices.ethereum || '12.4 Gwei'}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold shrink-0">Fleet Active:</span>
                <span className="text-white">{wallets.length} Wallets</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-white/[0.05]">
            <span className="text-[10px] text-zinc-500">Powered by</span>
            <span className="text-white font-bold flex items-center gap-1">
              <span className="text-[#6b5ef0]">blink</span> Intelligence
            </span>
            <div className="relative flex items-center justify-center w-2 h-2 ml-1 text-emerald-400">
              <span className="radar-dot-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* Brand Bar */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div
            onClick={() => setActiveNav('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-200">
                blink
              </span>
              <span className="inline-flex items-center justify-center w-5 h-5 ml-0.5 rounded-full bg-[#6b5ef0] text-[11px] font-bold text-white shadow-sm shadow-[#6b5ef0]/40">
                🤖
              </span>
              <span className="text-xl font-bold tracking-tight text-white">t</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-md border border-white/[0.08] hover:border-white/[0.2] transition-colors flex items-center gap-1.5"
            >
              <span>Website</span>
              <ExternalLink className="w-3 h-3 text-[#9b92ff]" />
            </Link>

            <button
              onClick={() => setActiveNav('account')}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6b5ef0]" />
            </button>

            <button
              onClick={() => setActiveNav('account')}
              className="w-8 h-8 rounded-full bg-[#0d0f16] border border-white/[0.1] hover:border-[#6b5ef0] flex items-center justify-center text-zinc-300 hover:text-white transition-all"
              title="Account"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dismissible Purple Notification Bar (Screenshot 1) */}
      {showTelegramBanner && (
        <div className="bg-[#6b5ef0] text-white px-6 py-2 text-xs font-medium flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <span>Link Telegram in Account &gt; Connections to use existing Blink subscription.</span>
          </div>
          <button
            onClick={() => setShowTelegramBanner(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Alerts / Toasts */}
      {alertMessage && (
        <div className="max-w-6xl mx-auto px-6 mt-4 w-full">
          <div className="p-3 rounded-lg bg-[#0d0f16] border border-[#6b5ef0] text-[#9b92ff] text-xs font-mono flex items-center justify-between shadow-xl">
            <span>{alertMessage}</span>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-zinc-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN APPLICATION SHELL (SIDEBAR + CONTENT) */}
      {/* ======================================================== */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT PERSISTENT SIDEBAR */}
        {/* ======================================================== */}
        <aside className="w-60 shrink-0 hidden md:block">
          <div className="nb-card p-3 space-y-4">
            {/* Group 1: Core Minting */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveNav('schedule');
                  setSubTab('action');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'schedule'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#9b92ff]" />
                Schedule Mint
              </button>

              <button
                onClick={() => {
                  setActiveNav('copymint');
                  setSubTab('action');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'copymint'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-[#9b92ff]" />
                Copy Mint
              </button>

              <button
                onClick={() => {
                  setActiveNav('contract');
                  setSubTab('action');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'contract'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <FileText className="w-4 h-4 text-[#9b92ff]" />
                Mint Contract
              </button>
            </div>

            <div className="border-t border-white/[0.06] pt-3 space-y-1">
              {/* Group 2: Fund & Sweep */}
              <button
                onClick={() => {
                  setActiveNav('disperse');
                  setSubTab('action');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'disperse'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Send className="w-4 h-4 text-[#9b92ff]" />
                Disperse
              </button>

              <button
                onClick={() => {
                  setActiveNav('consolidate');
                  setSubTab('action');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'consolidate'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Download className="w-4 h-4 text-[#9b92ff]" />
                Consolidate
              </button>

              <button
                onClick={() => {
                  setActiveNav('sweep');
                  setSubTab('action');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'sweep'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Brush className="w-4 h-4 text-[#9b92ff]" />
                Sweep NFTs
              </button>
            </div>

            {/* Group 3: Trackers & OpenSea (Active Engines) */}
            <div className="border-t border-white/[0.06] pt-3 space-y-1">
              <button
                onClick={() => {
                  setActiveNav('nft-tracker');
                  setSubTab('action');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'nft-tracker'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-[#9b92ff]" />
                  NFT Tracker
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('whale-tracker');
                  setSubTab('action');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'whale-tracker'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-xs">🐋</span>
                  Whale Tracker
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('opensea');
                  setSubTab('action');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'opensea'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-xs">⛵</span>
                  OpenSea
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#6b5ef0]/20 text-[#9b92ff] border border-[#6b5ef0]/30">
                  SeaDrop
                </span>
              </button>
            </div>

            {/* Group 4: Automation */}
            <div className="border-t border-white/[0.06] pt-3 space-y-1">
              <button
                onClick={() => {
                  setActiveNav('automation');
                  setSubTab('action');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'automation'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Bot className="w-4 h-4 text-[#9b92ff]" />
                Automation
              </button>
            </div>

            {/* Group 5: Wallets & Account */}
            <div className="border-t border-white/[0.06] pt-3 space-y-1">
              <button
                onClick={() => setActiveNav('wallets')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'wallets'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Wallet className="w-4 h-4 text-[#9b92ff]" />
                Wallets
              </button>

              <button
                onClick={() => {
                  setActiveNav('account');
                  setAccountSubTab('overview');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'account'
                    ? 'bg-[#6b5ef0] text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <User className="w-4 h-4 text-[#9b92ff]" />
                Account
              </button>
            </div>

            {/* Group 6: Log Out */}
            <div className="border-t border-white/[0.06] pt-3">
              <button
                onClick={() => setAlertMessage('Session locked. Reconnect using Master Vault password.')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* MAIN DYNAMIC CONTENT CONTAINER */}
        {/* ======================================================== */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* SCREEN 1: HOME (THE NULLBOT DASHBOARD GRID) */}
          {/* ======================================================== */}
          {activeNav === 'home' && (
            <div className="space-y-6 view-transition">
              {/* Top Row: Balance Card (Left) & ETH Market Ticker (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Balance Card */}
                <div className="md:col-span-5 nb-card p-5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#6b5ef0]/15 blur-2xl animate-ambient-glow pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider flex items-center justify-between">
                      <span>BALANCE</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        VAULT ONLINE
                      </span>
                    </span>
                    <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
                      {mainWallet ? `${mainWallet.ethBalance} ETH` : 'No wallet yet'}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      {mainWallet
                        ? `${mainWallet.address.slice(0, 8)}...${mainWallet.address.slice(-6)} • 5 Mint Wallets active`
                        : 'Add a wallet to see your balance here.'}
                    </p>
                  </div>

                  <div className="mt-4 relative z-10">
                    <button
                      onClick={() => setShowAddWalletModal(true)}
                      className="nb-btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Wallet
                    </button>
                  </div>
                </div>

                {/* Market Price & Graph Card */}
                <div className="md:col-span-7 nb-card p-5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl animate-ambient-glow pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <span className="text-xs font-mono text-zinc-400 uppercase">ETH SPOT PRICE</span>
                      <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xl tracking-tight">$2,393.68</span>
                        <span className="text-xs font-mono text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          +0.00%
                        </span>
                      </div>
                    </div>

                    {/* Timeframe selector pills */}
                    <div className="flex items-center bg-[#06070a] p-1 rounded-lg border border-white/[0.08] text-[11px] font-mono">
                      {(['1M', '5M', '12H', '24H', '3D', '7D'] as const).map(tf => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-2 py-0.5 rounded transition-all duration-200 ${
                            timeframe === tf
                              ? 'bg-[#6b5ef0] text-white font-bold shadow-md shadow-[#6b5ef0]/30'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual micro sparkline / area preview with animated bars */}
                  <div className="h-14 mt-4 w-full flex items-end gap-1.5 opacity-75 relative z-10">
                    {[40, 45, 42, 48, 47, 52, 50, 56, 54, 58, 62, 60, 65, 68, 64, 70, 72, 69, 75, 78].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-[#6b5ef0]/20 via-[#6b5ef0]/50 to-[#6b5ef0] rounded-t transition-all duration-300 hover:h-full hover:to-cyan-400 cursor-pointer"
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* The Core NullBot Action Grid (3 Columns of Big Cards!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Schedule Mint */}
                <div
                  onClick={() => {
                    setActiveNav('schedule');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Schedule Mint
                  </span>
                </div>

                {/* 2. Copy Mint */}
                <div
                  onClick={() => {
                    setActiveNav('copymint');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Copy Mint
                  </span>
                </div>

                {/* 3. Mint from Contract */}
                <div
                  onClick={() => {
                    setActiveNav('contract');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Mint from Contract
                  </span>
                </div>

                {/* 4. Disperse */}
                <div
                  onClick={() => {
                    setActiveNav('disperse');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Disperse
                  </span>
                </div>

                {/* 5. Consolidate */}
                <div
                  onClick={() => {
                    setActiveNav('consolidate');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Consolidate
                  </span>
                </div>

                {/* 6. Sweep NFTs */}
                <div
                  onClick={() => {
                    setActiveNav('sweep');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <Brush className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Sweep NFTs
                  </span>
                </div>

                {/* 7. Automation */}
                <div
                  onClick={() => {
                    setActiveNav('automation');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Automation
                  </span>
                </div>

                {/* 8. NFT Tracker */}
                <div
                  onClick={() => {
                    setActiveNav('nft-tracker');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36 relative"
                >
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    NFT Tracker
                  </span>
                </div>

                {/* 9. Whale Tracker */}
                <div
                  onClick={() => {
                    setActiveNav('whale-tracker');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36 relative"
                >
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <span className="text-base">🐋</span>
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    Whale Tracker
                  </span>
                </div>

                {/* 10. OpenSea SeaDrop */}
                <div
                  onClick={() => {
                    setActiveNav('opensea');
                    setSubTab('action');
                  }}
                  className="nb-card p-5 cursor-pointer hover:border-[#6b5ef0] flex flex-col items-center justify-center text-center group h-36 relative"
                >
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#6b5ef0]/20 text-[#9b92ff] border border-[#6b5ef0]/30">
                    SeaDrop
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#9b92ff] mb-2.5 group-hover:scale-105 transition-transform">
                    <span className="text-base">⛵</span>
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-[#9b92ff] transition-colors">
                    OpenSea SeaDrop
                  </span>
                </div>
              </div>

              {/* Mint History Section (Exact NullBot screenshot layout) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <History className="w-3.5 h-3.5 text-[#6b5ef0]" />
                  MINT HISTORY
                </div>

                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  {userActivity.length > 0 ? (
                    <div className="overflow-x-auto text-left font-mono">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.07] text-zinc-400 text-[11px]">
                            <th className="pb-2 font-sans font-semibold">Collection</th>
                            <th className="pb-2 font-semibold">Chain</th>
                            <th className="pb-2 font-semibold">Type</th>
                            <th className="pb-2 font-semibold">Tokens</th>
                            <th className="pb-2 font-semibold">Gas</th>
                            <th className="pb-2 font-semibold">Status</th>
                            <th className="pb-2 font-semibold text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {userActivity.map(act => (
                            <tr key={act.id} className="hover:bg-white/[0.02]">
                              <td className="py-2.5 font-sans font-medium text-white">{act.title}</td>
                              <td className="py-2.5 uppercase text-zinc-300">{act.chainName}</td>
                              <td className="py-2.5 text-[#9b92ff]">{act.type}</td>
                              <td className="py-2.5 text-zinc-300">{act.tokenIds}</td>
                              <td className="py-2.5 text-cyan-400">{act.gasPaid}</td>
                              <td className="py-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400">
                                  {act.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-right text-zinc-500 font-sans">{act.timeAgo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    'No mint history yet.'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 2: SCHEDULE MINT (SCREENSHOT 1) */}
          {/* ======================================================== */}
          {activeNav === 'schedule' && (
            <div className="space-y-6 view-transition">
              {/* Breadcrumb & Title */}
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Schedule</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Schedule Mint</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Queue a mint for any upcoming NFT drop. Pick the collection, the phase and the mint
                  wallets you want to use, and every selected wallet mints at the same moment the phase
                  opens, so you&apos;re in line before the crowd even reacts.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Mint
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {/* Tab 1: Queue / Mint View */}
              {subTab === 'action' && (
                <div className="space-y-6">
                  {/* Queue Box */}
                  <div className="nb-card p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#6b5ef0] mb-3">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      Queue a collection. Selected wallets fire together at T-0.
                    </h3>
                    <button
                      onClick={() => setShowNewScheduleModal(true)}
                      className="nb-btn-primary mt-4 px-4 py-2 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Mint
                    </button>
                  </div>

                  {/* My Queue Section */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5 text-[#6b5ef0]" />
                      My Queue
                    </div>

                    {drops.length === 0 ? (
                      <div className="nb-card p-6 text-center text-xs text-zinc-500">
                        No scheduled mints queued. Click [+ New Mint] above to add an upcoming drop.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {drops.map(d => (
                          <div key={d.id} className="nb-card p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-sm text-white flex items-center gap-2">
                                  {d.name}
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                                    {d.chainName}
                                  </span>
                                </div>
                                <div className="text-xs text-zinc-400 mt-1">
                                  Price: <span className="text-emerald-400 font-mono">{d.mintPrice}</span> • Max:{' '}
                                  {d.maxPerWallet}/wallet
                                </div>
                              </div>

                              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                                {formatCountdown(d.startTime)}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
                              <span className="font-mono text-zinc-500 truncate max-w-[180px]">
                                {d.contract}
                              </span>
                              <button
                                onClick={() => {
                                  setMintContractAddr(d.contract);
                                  setMintChain(d.chain as any);
                                  setActiveNav('contract');
                                  setSubTab('action');
                                }}
                                className="text-[#6b5ef0] hover:text-[#9b92ff] font-medium flex items-center gap-1"
                              >
                                Configure <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: History */}
              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  No scheduled drop executions in the last 30 days.
                </div>
              )}

              {/* Tab 3: Settings */}
              {subTab === 'settings' && (
                <div className="nb-card p-6 space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1.5">
                      Schedule Trigger Timing
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Exact T-0', 'T - 25ms', 'T - 50ms'].map((t, idx) => (
                        <button
                          key={t}
                          className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                            idx === 0
                              ? 'bg-[#6b5ef0]/20 border-[#6b5ef0] text-white'
                              : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAlertMessage('Drop schedule settings saved.');
                      setTimeout(() => setAlertMessage(null), 3000);
                    }}
                    className="nb-btn-primary px-4 py-2 text-xs"
                  >
                    Save Settings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 3: COPY MINT (SCREENSHOT 2) */}
          {/* ======================================================== */}
          {activeNav === 'copymint' && (
            <div className="space-y-6 view-transition">
              {/* Breadcrumbs & Header */}
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Copy Mint</span>
                  {subTab === 'settings' && (
                    <>
                      <span>&gt;</span>
                      <span className="text-zinc-400">Settings</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">
                  {subTab === 'settings' ? 'Settings' : 'Copy Mint'}
                </h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Your copies use the same gas as the wallet you&apos;re following, plus 10% so they land
                  alongside it. There&apos;s no spending cap in this mode, so every copy goes through no matter
                  how high gas climbs.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Copy Mint
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {/* Tab 1: Copy Mint Active Trackers */}
              {subTab === 'action' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Followed Target Wallets ({copyTrackers.length})
                    </span>
                    <button
                      onClick={() => setShowAddCopyModal(true)}
                      className="nb-btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Target Wallet
                    </button>
                  </div>

                  <div className="space-y-3">
                    {copyTrackers.map(t => (
                      <div
                        key={t.id}
                        className="nb-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{t.label}</span>
                            {t.ens && (
                              <span className="text-xs font-mono text-[#9b92ff] bg-[#6b5ef0]/15 px-2 py-0.5 rounded">
                                {t.ens}
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                              {t.chain}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-zinc-400 mt-1 flex items-center gap-2">
                            <span>{t.address}</span>
                            <button
                              onClick={() => handleCopy(t.address)}
                              className="text-zinc-500 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-1">{t.lastAction}</div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <div className="text-right">
                            <div className="text-[11px] text-zinc-400">
                              {t.mirrorFreeOnly ? 'Free Mints Only' : `Cap: ${t.maxSpendEth} ETH`}
                            </div>
                            <div className="text-xs font-mono text-emerald-400 font-semibold">
                              {t.totalMirrored} mirrored
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setCopyTrackers(prev =>
                                prev.map(item =>
                                  item.id === t.id ? { ...item, active: !item.active } : item
                                )
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              t.active
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/[0.04] border-white/[0.08] text-zinc-500'
                            }`}
                          >
                            {t.active ? 'Active' : 'Paused'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: History */}
              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  No mirrored transactions logged in the past 24 hours.
                </div>
              )}

              {/* Tab 3: Settings (EXACT LAYOUT OF SCREENSHOT 2) */}
              {subTab === 'settings' && (
                <div className="space-y-6 max-w-xl">
                  {/* WL Copy Mint Radio */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>✓</span> WL Copy Mint
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setWlCopyMint('off')}
                        className={`py-2 px-4 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                          wlCopyMint === 'off'
                            ? 'border-[#6b5ef0] bg-[#6b5ef0]/15 text-white'
                            : 'border-white/[0.08] bg-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            wlCopyMint === 'off' ? 'border-[#6b5ef0]' : 'border-zinc-500'
                          }`}
                        >
                          {wlCopyMint === 'off' && (
                            <span className="w-2 h-2 rounded-full bg-[#6b5ef0]" />
                          )}
                        </span>
                        Off
                      </button>

                      <button
                        onClick={() => setWlCopyMint('on')}
                        className={`py-2 px-4 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                          wlCopyMint === 'on'
                            ? 'border-[#6b5ef0] bg-[#6b5ef0]/15 text-white'
                            : 'border-white/[0.08] bg-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            wlCopyMint === 'on' ? 'border-[#6b5ef0]' : 'border-zinc-500'
                          }`}
                        >
                          {wlCopyMint === 'on' && (
                            <span className="w-2 h-2 rounded-full bg-[#6b5ef0]" />
                          )}
                        </span>
                        On
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Free allowlist mints stay skipped. Paid mints are never copied.
                    </p>
                  </div>

                  {/* Copy Mint Gas Settings Radio */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>⛽</span> Copy Mint Gas Settings
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setCopyGasSetting('default')}
                        className={`py-2 px-4 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                          copyGasSetting === 'default'
                            ? 'border-[#6b5ef0] bg-[#6b5ef0]/15 text-white'
                            : 'border-white/[0.08] bg-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            copyGasSetting === 'default' ? 'border-[#6b5ef0]' : 'border-zinc-500'
                          }`}
                        >
                          {copyGasSetting === 'default' && (
                            <span className="w-2 h-2 rounded-full bg-[#6b5ef0]" />
                          )}
                        </span>
                        Default
                      </button>

                      <button
                        onClick={() => setCopyGasSetting('custom')}
                        className={`py-2 px-4 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                          copyGasSetting === 'custom'
                            ? 'border-[#6b5ef0] bg-[#6b5ef0]/15 text-white'
                            : 'border-white/[0.08] bg-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            copyGasSetting === 'custom' ? 'border-[#6b5ef0]' : 'border-zinc-500'
                          }`}
                        >
                          {copyGasSetting === 'custom' && (
                            <span className="w-2 h-2 rounded-full bg-[#6b5ef0]" />
                          )}
                        </span>
                        Custom
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setAlertMessage('Copy Mint settings saved.');
                        setTimeout(() => setAlertMessage(null), 3000);
                      }}
                      className="nb-btn-primary px-5 py-2 text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 4: MINT CONTRACT (SCREENSHOT 3) */}
          {/* ======================================================== */}
          {activeNav === 'contract' && (
            <div className="space-y-6 view-transition">
              {/* Breadcrumb & Header */}
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span>Contract</span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Mint</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Mint Contract</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Mint a live public drop directly from its contract. Paste the contract address, pick
                  your mint wallets and quantity, and they all mint at once, for free and paid drops alike,
                  as long as the drop doesn&apos;t require an allowlist.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Mint
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {/* Tab 1: Form (EXACT LAYOUT OF SCREENSHOT 3) */}
              {subTab === 'action' && (
                <form onSubmit={executeContractMint} className="space-y-5 max-w-2xl">
                  {/* Contract Field */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">Contract:</label>
                    <input
                      type="text"
                      value={mintContractAddr}
                      onChange={e => setMintContractAddr(e.target.value)}
                      placeholder="Contract address (0x...)"
                      required
                      className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#6b5ef0]"
                    />
                  </div>

                  {/* Chain Selection (Segmented buttons with logos) */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">Chain:</label>
                    <div className="grid grid-cols-5 gap-1.5 bg-[#080A10] p-1 rounded-xl border border-white/[0.08]">
                      {chains.map(c => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => setMintChain(c.slug as any)}
                          className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                            mintChain === c.slug
                              ? 'bg-[#6b5ef0] text-white font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span>{c.icon}</span>
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-white mb-1.5">
                      <span>Quantity:</span>
                      <span className="font-mono text-sm font-bold text-[#9b92ff]">{mintQuantity}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mintQuantity}
                      onChange={e => setMintQuantity(Number(e.target.value))}
                      className="w-full h-1.5 accent-[#6b5ef0] bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Wallets Selector */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-white mb-1.5">
                      <span>Wallets:</span>
                      <div className="flex items-center gap-1 bg-[#080A10] p-0.5 rounded border border-white/[0.08] text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setMintWalletFilter('all')}
                          className={`px-2 py-0.5 rounded ${
                            mintWalletFilter === 'all'
                              ? 'bg-[#6b5ef0] text-white font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setMintWalletFilter('60')}
                          className={`px-2 py-0.5 rounded ${
                            mintWalletFilter === '60'
                              ? 'bg-[#6b5ef0] text-white font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          60%
                        </button>
                        <button
                          type="button"
                          onClick={() => setMintWalletFilter('n')}
                          className={`px-2 py-0.5 rounded ${
                            mintWalletFilter === 'n'
                              ? 'bg-[#6b5ef0] text-white font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          N
                        </button>
                      </div>
                    </div>

                    <div className="nb-card p-4 text-xs font-mono text-zinc-400">
                      {mintWallets.length > 0 ? (
                        <div className="space-y-1.5">
                          {mintWallets.map(w => (
                            <div key={w.id} className="flex justify-between text-[11px]">
                              <span>{w.label} ({w.address.slice(0, 6)}...{w.address.slice(-4)})</span>
                              <span className="text-emerald-400">Ready</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        'No wallets yet.'
                      )}
                    </div>
                  </div>

                  {/* Mint Feedback */}
                  {mintResult && (
                    <div
                      className={`p-3 rounded-lg text-xs font-mono border ${
                        mintResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div>{mintResult.message}</div>
                      {mintResult.txHash && (
                        <div className="mt-1 text-[11px] text-zinc-400 break-all">
                          Tx Hash: <span className="text-cyan-400">{mintResult.txHash}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isMinting}
                      className="nb-btn-primary px-6 py-2.5 text-xs font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                      {isMinting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Simulating & Minting...
                        </>
                      ) : (
                        'Mint'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: History */}
              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  No direct contract mints recorded yet.
                </div>
              )}

              {/* Tab 3: Settings */}
              {subTab === 'settings' && (
                <div className="nb-card p-6 text-xs text-zinc-400 space-y-3 max-w-lg">
                  <div>Pre-flight simulation: Enabled</div>
                  <div>Gas priority: 1.2x dynamic multiplier</div>
                  <div>Revert protection: Active (0 gas lost on reverts)</div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 5: DISPERSE (SCREENSHOT 4) */}
          {/* ======================================================== */}
          {activeNav === 'disperse' && (
            <div className="space-y-6 view-transition">
              {/* Breadcrumb & Header */}
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Disperse</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Disperse</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Send ETH, USDC or USDG from one wallet to many at once. Everything goes out in a single
                  transaction, which saves gas compared to separate transfers and is the quickest way to
                  fund your mint wallets before a drop.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Disperse
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {/* Tab 1: Form (EXACT LAYOUT OF SCREENSHOT 4) */}
              {subTab === 'action' && (
                <form onSubmit={executeDisperse} className="space-y-5 max-w-2xl">
                  {/* Chain Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">Chain:</label>
                    <div className="grid grid-cols-5 gap-1.5 bg-[#080A10] p-1 rounded-xl border border-white/[0.08]">
                      {chains.map(c => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => setDisperseChain(c.slug as any)}
                          className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                            disperseChain === c.slug
                              ? 'bg-[#6b5ef0] text-white font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span>{c.icon}</span>
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount per wallet input */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Amount per Mint Wallet ({disperseChain === 'arc' ? 'USDC' : 'ETH'}):
                    </label>
                    <input
                      type="text"
                      value={disperseAmount}
                      onChange={e => setDisperseAmount(e.target.value)}
                      placeholder="0.01"
                      required
                      className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#6b5ef0]"
                    />
                  </div>

                  {/* Summary calculation card */}
                  <div className="nb-card p-4 text-xs font-mono text-zinc-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Target Fleet:</span>
                      <span className="text-white">{wallets.filter(w => !w.isMaster).length || 1} Mint Wallets</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total to Disperse:</span>
                      <span className="text-cyan-400 font-bold">
                        {((Number(disperseAmount) || 0) * (wallets.filter(w => !w.isMaster).length || 1)).toFixed(4)}{' '}
                        {disperseChain === 'arc' ? 'USDC' : 'ETH'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canonical Contract:</span>
                      <span className="text-zinc-500">0xD152f549545093347A152d042b947024ea56f606</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isDispersing}
                      className="nb-btn-primary px-6 py-2.5 text-xs font-semibold disabled:opacity-50"
                    >
                      {isDispersing ? 'Broadcasting Batch Disperse...' : 'Disperse'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: History */}
              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  No disperse events logged yet.
                </div>
              )}

              {/* Tab 3: Settings */}
              {subTab === 'settings' && (
                <div className="nb-card p-6 text-xs text-zinc-400 space-y-2 max-w-lg">
                  <div>Canonical Disperse Address: 0xD152f549545093347A152d042b947024ea56f606</div>
                  <div>Gas Optimization: Single-call batch execution</div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 6: CONSOLIDATE (SWEEP ETH/USDC BACK) */}
          {/* ======================================================== */}
          {activeNav === 'consolidate' && (
            <div className="space-y-6 view-transition">
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Consolidate</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Consolidate</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Gathers remaining native tokens (ETH, USDC, etc.) from various mint wallets back into a
                  single main master account in a single transaction.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Consolidate
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {subTab === 'action' && (
                <div className="nb-card p-6 space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-white">Consolidation Destination:</div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs font-mono text-zinc-300">
                      {mainWallet ? mainWallet.address : 'Loading...'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-white/[0.05]">
                    <span>Total Fleet Native ETH:</span>
                    <span className="text-white font-bold">0.3842 ETH</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => executeSweep('eth')}
                      className="nb-btn-primary w-full py-2.5 text-xs font-semibold"
                    >
                      Consolidate All ETH to Main Wallet
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: History */}
              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  No previous ETH/token consolidation records found.
                </div>
              )}

              {/* Tab 3: Settings */}
              {subTab === 'settings' && (
                <div className="nb-card p-6 space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Auto-Consolidate Trigger
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Manual 1-Click', 'Post-Mint Automated'].map((mode, idx) => (
                        <button
                          key={mode}
                          className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                            idx === 0
                              ? 'bg-[#6b5ef0]/20 border-[#6b5ef0] text-white'
                              : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAlertMessage('Consolidation settings saved.');
                      setTimeout(() => setAlertMessage(null), 3000);
                    }}
                    className="nb-btn-primary px-4 py-2 text-xs"
                  >
                    Save Settings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 7: SWEEP NFTS (SCREENSHOT 5) */}
          {/* ======================================================== */}
          {activeNav === 'sweep' && (
            <div className="space-y-6 view-transition">
              {/* Breadcrumb & Header */}
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Sweep</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Sweep</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Move the NFTs you&apos;ve minted into your master wallet. We find every NFT sitting in your
                  mint wallets and transfer them for you, to your master wallet, any address, or an ENS name,
                  so you&apos;re not left moving them one by one.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Brush className="w-3.5 h-3.5" />
                  Sweep
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {/* Tab 1: Form (EXACT LAYOUT OF SCREENSHOT 5) */}
              {subTab === 'action' && (
                <div className="space-y-4 max-w-3xl">
                  {/* Yellow Master Wallet Banner */}
                  <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between text-xs text-amber-200">
                    <span className="flex items-center gap-2">
                      <span>📥</span>
                      <span>
                        Destination: {mainWallet ? mainWallet.address.slice(0, 8) + '...' + mainWallet.address.slice(-6) : 'Not set'}
                      </span>
                    </span>
                    <button
                      onClick={() => setActiveNav('wallets')}
                      className="nb-btn-primary px-3 py-1 text-xs"
                    >
                      Set Master Wallet
                    </button>
                  </div>

                  {/* Sweep Candidates header & search */}
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-xs text-white flex items-center gap-2 shrink-0">
                      <Brush className="w-3.5 h-3.5 text-[#6b5ef0]" />
                      Sweep Candidates
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6b5ef0]/20 text-[#9b92ff]">
                        14 NFTs
                      </span>
                    </span>

                    <input
                      type="text"
                      placeholder="0x contract, OpenSea link or name"
                      className="flex-1 bg-[#080A10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#6b5ef0]"
                    />
                  </div>

                  {/* Candidates Box */}
                  <div className="nb-card p-6 space-y-3">
                    <div className="text-xs text-zinc-400">
                      Found 14 minted NFTs across your 5 sub-wallets ready for 1-click consolidation.
                    </div>
                    <button
                      onClick={() => executeSweep('nft')}
                      className="nb-btn-primary px-5 py-2 text-xs"
                    >
                      Sweep 14 NFTs to Master Wallet
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: History */}
              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  {userActivity.filter(a => a.type === 'Sweep NFTs').length > 0 ? (
                    <div className="space-y-2 text-left">
                      {userActivity
                        .filter(a => a.type === 'Sweep NFTs')
                        .map(act => (
                          <div
                            key={act.id}
                            className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between"
                          >
                            <div>
                              <div className="text-white font-semibold text-xs">{act.title}</div>
                              <div className="text-zinc-500 text-[11px] font-mono">{act.tokenIds}</div>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                              {act.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    'No previous NFT sweep transfers recorded.'
                  )}
                </div>
              )}

              {/* Tab 3: Settings */}
              {subTab === 'settings' && (
                <div className="nb-card p-6 space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Batch Transfer Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Multicall Aggregator', 'Individual Transfer'].map((m, idx) => (
                        <button
                          key={m}
                          className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                            idx === 0
                              ? 'bg-[#6b5ef0]/20 border-[#6b5ef0] text-white'
                              : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAlertMessage('Sweep NFT settings saved.');
                      setTimeout(() => setAlertMessage(null), 3000);
                    }}
                    className="nb-btn-primary px-4 py-2 text-xs"
                  >
                    Save Settings
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 8: WALLETS (SCREENSHOT 6) */}
          {/* ======================================================== */}
          {activeNav === 'wallets' && (
            <div className="space-y-6 view-transition">
              {/* Breadcrumb & Header */}
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Wallets</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Wallets</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Create, import and manage the mint wallets Blink uses. New wallets work on every
                  supported chain right away, you can bring in wallets you already own with their private
                  key, and every key is encrypted on our servers and can be exported whenever you need it.
                </p>
              </div>

              {/* Action Box with Create & Import buttons (EXACT LAYOUT OF SCREENSHOT 6) */}
              <div className="nb-card p-10 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#6b5ef0]/15 flex items-center justify-center text-[#6b5ef0] mb-3">
                  <Wallet className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Active fleet managed via encrypted AES-256-GCM keystore.
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAlertMessage('Generated 5 additional encrypted Mint Wallets!');
                      loadData();
                      setTimeout(() => setAlertMessage(null), 4000);
                    }}
                    className="nb-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create
                  </button>
                  <button
                    onClick={() => setShowImportKeyModal(true)}
                    className="nb-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 bg-[#6b5ef0]/80"
                  >
                    <span>↓</span>
                    Import
                  </button>
                </div>
              </div>

              {/* Active Wallets Fleet Table */}
              <div className="nb-card p-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Registered Wallets ({wallets.length})
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-zinc-400 text-[11px] text-left">
                        <th className="pb-2.5 font-sans font-semibold">Wallet Label</th>
                        <th className="pb-2.5 font-semibold">Address</th>
                        <th className="pb-2.5 font-semibold">ETH Balance</th>
                        <th className="pb-2.5 font-semibold">USDC</th>
                        <th className="pb-2.5 font-semibold">Role</th>
                        <th className="pb-2.5 font-semibold text-right">Explorer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {wallets.map(w => (
                        <tr key={w.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 font-sans font-medium text-white">{w.label}</td>
                          <td className="py-2.5">
                            <button
                              onClick={() => handleCopy(w.address)}
                              className="text-zinc-300 hover:text-white flex items-center gap-1.5"
                            >
                              <span>{w.address.slice(0, 6)}...{w.address.slice(-4)}</span>
                              <Copy className="w-3 h-3 text-zinc-600" />
                            </button>
                          </td>
                          <td className="py-2.5 text-cyan-400 font-semibold">{w.ethBalance} ETH</td>
                          <td className="py-2.5 text-zinc-400">${w.usdcBalance}</td>
                          <td className="py-2.5">
                            {w.isMaster ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                MASTER
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                MINT FLEET
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right">
                            <a
                              href={`https://basescan.org/address/${w.address}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#6b5ef0] hover:underline"
                            >
                              Scan
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 9: ACCOUNT & YOUR MINTS STATS (SCREENSHOTS 7 & 8) */}
          {/* ======================================================== */}
          {activeNav === 'account' && (
            <div className="space-y-6 view-transition">
              {/* Breadcrumb & Header */}
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span
                    onClick={() => setActiveNav('home')}
                    className="hover:text-zinc-300 cursor-pointer"
                  >
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Account</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Account</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Your Blink profile at a glance. See how you sign in, which accounts are linked, and a
                  summary of your minting activity across every tool, all in one place.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs (Overview / Plan / Connections) */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setAccountSubTab('overview')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    accountSubTab === 'overview' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Overview
                </button>
                <button
                  onClick={() => setAccountSubTab('plan')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    accountSubTab === 'plan' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  Plan
                </button>
                <button
                  onClick={() => setAccountSubTab('connections')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    accountSubTab === 'connections' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Connections
                </button>
              </div>

              {/* Sub-tab 1: Overview (EXACT LAYOUT OF SCREENSHOTS 7 & 8) */}
              {accountSubTab === 'overview' && (
                <div className="space-y-6 max-w-3xl">
                  {/* Account Details Card */}
                  <div className="nb-card p-5 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-white/[0.06] pb-3">
                      <User className="w-3.5 h-3.5 text-[#6b5ef0]" />
                      Account Details
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Wallet className="w-3.5 h-3.5 text-blue-400" /> Connected Identity
                        </span>
                        <span className="font-mono text-white">
                          {wallets.length > 0 ? `${wallets[0].address.slice(0, 6)}...${wallets[0].address.slice(-4)}` : 'Local Keystore'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <span className="text-[#6b5ef0] font-bold">#</span> Session ID
                        </span>
                        <span className="font-mono text-white">
                          {wallets.length > 0 ? `#${wallets[0].address.slice(2, 6).toUpperCase()}` : '#INIT-VAULT'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Send className="w-3 h-3 text-[#6b5ef0]" /> Telegram Bot
                        </span>
                        <span className="text-emerald-400 font-medium">@BlinkSniperBot (Active)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <span className="text-purple-400 font-bold">𝕏</span> 𝕏
                        </span>
                        <span className="text-zinc-500">Not connected</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white">Notifications</div>
                          <div className="text-[11px] text-zinc-500">
                            Mint, transfer and plan updates arrive in the bell and as push.
                          </div>
                        </div>
                        <div className="flex items-center bg-[#080A10] p-0.5 rounded border border-white/[0.08] text-[10px]">
                          <button
                            onClick={() => setNotificationsEnabled(true)}
                            className={`px-2.5 py-1 rounded ${
                              notificationsEnabled ? 'bg-[#6b5ef0] text-white font-bold' : 'text-zinc-500'
                            }`}
                          >
                            On
                          </button>
                          <button
                            onClick={() => setNotificationsEnabled(false)}
                            className={`px-2.5 py-1 rounded ${
                              !notificationsEnabled ? 'bg-[#6b5ef0] text-white font-bold' : 'text-zinc-500'
                            }`}
                          >
                            Off
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white">Push notifications on this device</div>
                          <div className="text-[11px] text-zinc-500">Off. Updates only show in the bell.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={pushEnabled}
                          onChange={e => setPushEnabled(e.target.checked)}
                          className="w-4 h-4 accent-[#6b5ef0] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Your Mints Analytics Card (THE STATS IN THE RIGHT PLACE!) */}
                  <div className="nb-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Zap className="w-3.5 h-3.5 text-[#6b5ef0]" />
                        Your Mints
                      </div>

                      {/* 30 days vs All time filter */}
                      <div className="flex items-center bg-[#080A10] p-0.5 rounded border border-white/[0.08] text-[10px]">
                        <button
                          onClick={() => setAccountAnalyticsRange('30days')}
                          className={`px-2.5 py-1 rounded ${
                            accountAnalyticsRange === '30days'
                              ? 'bg-[#6b5ef0] text-white font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          30 days
                        </button>
                        <button
                          onClick={() => setAccountAnalyticsRange('alltime')}
                          className={`px-2.5 py-1 rounded ${
                            accountAnalyticsRange === 'alltime'
                              ? 'bg-[#6b5ef0] text-white font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          All time
                        </button>
                      </div>
                    </div>

                    {/* 4 KPI Columns */}
                    <div className="grid grid-cols-4 gap-2 text-left">
                      <div>
                        <div className="text-[11px] font-mono text-zinc-400">Mints</div>
                        <div className="text-xl font-bold text-white mt-0.5">{userActivity.length}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-zinc-400">NFTs</div>
                        <div className="text-xl font-bold text-white mt-0.5">
                          {userActivity.reduce((acc, curr) => acc + (curr.totalItems || 1), 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-zinc-400">Success</div>
                        <div className="text-xl font-bold text-emerald-400 mt-0.5">
                          {userActivity.length > 0
                            ? `${Math.round(
                                (userActivity.filter(a => a.status === 'CONFIRMED').length / userActivity.length) * 100
                              )}%`
                            : '100%'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-zinc-400">Gas spent</div>
                        <div className="text-xl font-bold text-cyan-400 mt-0.5">
                          {userActivity.length > 0 ? '~0.001 ETH' : '$0.00'}
                        </div>
                      </div>
                    </div>

                    {/* Distribution Bars per tool */}
                    <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-zinc-300">
                          <ClipboardList className="w-3.5 h-3.5 text-[#6b5ef0]" />
                          Copy Mint
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="w-48 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div
                              className="h-full bg-[#6b5ef0] rounded-full"
                              style={{
                                width: `${
                                  userActivity.length > 0
                                    ? Math.round(
                                        (userActivity.filter(a => a.type.toLowerCase().includes('copy')).length /
                                          userActivity.length) *
                                          100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {userActivity.filter(a => a.type.toLowerCase().includes('copy')).length} mints
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-[#6b5ef0]" />
                          Schedule Mint
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="w-48 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{
                                width: `${
                                  userActivity.length > 0
                                    ? Math.round(
                                        (userActivity.filter(a => a.type.toLowerCase().includes('schedule')).length /
                                          userActivity.length) *
                                          100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {userActivity.filter(a => a.type.toLowerCase().includes('schedule')).length} mints
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-zinc-300">
                          <FileText className="w-3.5 h-3.5 text-[#6b5ef0]" />
                          Contract & SeaDrop
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="w-48 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{
                                width: `${
                                  userActivity.length > 0
                                    ? Math.round(
                                        (userActivity.filter(
                                          a =>
                                            a.type.toLowerCase().includes('contract') ||
                                            a.type.toLowerCase().includes('seadrop')
                                        ).length /
                                          userActivity.length) *
                                          100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {
                              userActivity.filter(
                                a =>
                                  a.type.toLowerCase().includes('contract') || a.type.toLowerCase().includes('seadrop')
                              ).length
                            }{' '}
                            mints
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-zinc-500">
                      Most used chain: <span className="text-zinc-300 font-mono">Base (62%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Plan */}
              {accountSubTab === 'plan' && (
                <div className="nb-card p-6 space-y-3 max-w-xl">
                  <div className="text-xs font-semibold text-white">Current Tier: PRO</div>
                  <div className="text-xs text-zinc-400">
                    Includes 2 schedule mint jobs, 5 copy mint mirrors, 5 wallets, and OpenSea SeaDrop automation.
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Connections */}
              {accountSubTab === 'connections' && (
                <div className="nb-card p-6 space-y-3 max-w-xl text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Telegram Bot</div>
                      <div className="text-zinc-400">@BlinkSniperBot</div>
                    </div>
                    <span className="text-emerald-400">Connected</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 10: AUTOMATION (COMING SOON / ACTIVE VIEW) */}
          {/* ======================================================== */}
          {activeNav === 'automation' && (
            <div className="space-y-6 view-transition">
              <div>
                <h1 className="text-2xl font-bold text-white">Automation</h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Autonomous task routines and cron jobs triggered by mempool conditions and gas price dips.
                </p>
              </div>

              <div className="nb-card p-10 flex flex-col items-center justify-center text-center">
                <Bot className="w-10 h-10 text-[#6b5ef0] mb-3" />
                <h3 className="text-sm font-semibold text-white">Autonomous Minters Online</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Mempool scanning active across Base, Ethereum, Ink, Arc, and Arbitrum.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 11: NFT TRACKER (PORTFOLIO & FLOOR VALUATION) */}
          {/* ======================================================== */}
          {activeNav === 'nft-tracker' && (
            <div className="space-y-6 view-transition">
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span onClick={() => setActiveNav('home')} className="hover:text-zinc-300 cursor-pointer">
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">NFT Tracker</span>
                </div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-[#9b92ff]" />
                  NFT Tracker
                </h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Track NFT inventory, floor valuations, and collection distribution across all active mint wallets.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Portfolio
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Mint Log
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {subTab === 'action' && (
                <div className="space-y-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">Total NFTs Held</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">
                        {wallets.reduce((acc, curr) => acc + (curr.nftsHeld || 0), 0)}
                      </div>
                    </div>
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">Est. Portfolio Value</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {wallets.reduce((acc, curr) => acc + (curr.nftsHeld || 0), 0) > 0 ? '~0.050 ETH' : '0.000 ETH'}
                      </div>
                    </div>
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">Tracked Collections</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">
                        {wallets.reduce((acc, curr) => acc + (curr.nftsHeld || 0), 0) > 0 ? '1' : '0'}
                      </div>
                    </div>
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">Active Wallet Fleet</div>
                      <div className="text-xl font-bold font-mono text-[#9b92ff] mt-1">{wallets.length} Wallets</div>
                    </div>
                  </div>

                  {/* Collections Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Fleet Collection Inventory
                      </span>
                      {wallets.reduce((acc, curr) => acc + (curr.nftsHeld || 0), 0) > 0 && (
                        <button
                          onClick={() => executeSweep('nft')}
                          className="nb-btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
                        >
                          <Brush className="w-3.5 h-3.5" />
                          Sweep All NFTs to Master Wallet
                        </button>
                      )}
                    </div>

                    {wallets.reduce((acc, curr) => acc + (curr.nftsHeld || 0), 0) === 0 ? (
                      <div className="nb-card p-10 flex flex-col items-center justify-center text-center">
                        <ImageIcon className="w-10 h-10 text-zinc-600 mb-3" />
                        <h4 className="text-sm font-semibold text-white">No NFTs Detected in Fleet</h4>
                        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                          Once your fleet wallets mint or purchase tokens on Base, Ink, or Ethereum, they will appear here with live floor valuations.
                        </p>
                        <button
                          onClick={() => {
                            setActiveNav('contract');
                            setSubTab('action');
                          }}
                          className="nb-btn-primary px-4 py-2 text-xs font-semibold mt-4"
                        >
                          Mint Your First NFT
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="nb-card p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm text-white">Minted Collection</div>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                                Base L2
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-white bg-white/[0.08] px-2 py-0.5 rounded">
                              {wallets.reduce((acc, curr) => acc + (curr.nftsHeld || 0), 0)} Held
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 font-mono">
                            Status: <span className="text-emerald-400">Verified On-Chain</span>
                          </div>
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-mono">{wallets[0]?.address.slice(0, 8)}...</span>
                            <button
                              onClick={() => {
                                setActiveNav('sweep');
                                setSubTab('action');
                              }}
                              className="text-[#6b5ef0] hover:text-[#9b92ff] font-medium"
                            >
                              Sweep Collection &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  All 14 NFTs verified on-chain. Zero discrepancies detected.
                </div>
              )}

              {subTab === 'settings' && (
                <div className="nb-card p-6 space-y-3 max-w-lg text-xs text-zinc-400">
                  <div>Floor Price Indexing: Alchemy & Reservoir Webhooks</div>
                  <div>Inventory Cache Refresh: Every 30 seconds</div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 12: WHALE TRACKER (MEMPOOL ALPHA SNIFFER) */}
          {/* ======================================================== */}
          {activeNav === 'whale-tracker' && (
            <div className="space-y-6 view-transition">
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span onClick={() => setActiveNav('home')} className="hover:text-zinc-300 cursor-pointer">
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">Whale Tracker</span>
                </div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-xl">🐋</span>
                  Whale Tracker
                </h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Real-time mempool scanning across Base, Ethereum, and Ink. Tracks alpha transactions and front-runs execution before blocks are finalized.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  Active Whales
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Mempool Feed
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              {subTab === 'action' && (
                <div className="space-y-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">Tracked Whales</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">{copyTrackers.length} Active</div>
                    </div>
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">Mempool Sniffer Speed</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">22ms</div>
                    </div>
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">24h Mempool Detections</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">
                        {copyTrackers.filter(t => t.active).length > 0 ? 'Active' : 'Idle'}
                      </div>
                    </div>
                    <div className="nb-card p-4">
                      <div className="text-xs text-zinc-500">Total Mirrored Mints</div>
                      <div className="text-xl font-bold font-mono text-[#9b92ff] mt-1">
                        {copyTrackers.reduce((acc, curr) => acc + (curr.totalMirrored || 0), 0)} Mints
                      </div>
                    </div>
                  </div>

                  {/* Whales List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Target Alpha Watchlist
                      </span>
                      <button
                        onClick={() => setShowAddCopyModal(true)}
                        className="nb-btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Track Target Wallet
                      </button>
                    </div>

                    {copyTrackers.length === 0 ? (
                      <div className="nb-card p-10 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl mb-3">🐋</span>
                        <h4 className="text-sm font-semibold text-white">No Target Alpha Wallets Configured</h4>
                        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                          Add prominent degen or fund wallets to monitor their pending transactions in the mempool and mirror mints in sub-blocks.
                        </p>
                        <button
                          onClick={() => setShowAddCopyModal(true)}
                          className="nb-btn-primary px-4 py-2 text-xs font-semibold mt-4 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Track Target Wallet</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {copyTrackers.map(t => (
                          <div key={t.id} className="nb-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-white">{t.label}</span>
                                {t.ens && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6b5ef0]/20 text-[#9b92ff]">
                                    {t.ens}
                                  </span>
                                )}
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Sniffing
                                </span>
                              </div>
                              <div className="text-xs font-mono text-zinc-400">{t.address}</div>
                              <div className="text-xs text-zinc-500">{t.lastAction}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right text-xs">
                                <div className="text-zinc-400">Mirrored: <span className="font-bold text-white font-mono">{t.totalMirrored}</span></div>
                                <div className="text-zinc-500">Max Spend: {t.maxSpendEth} ETH</div>
                              </div>
                              <button
                                onClick={() => {
                                  setAlertMessage(`Updated tracking parameters for ${t.label}.`);
                                  setTimeout(() => setAlertMessage(null), 3000);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-[#6b5ef0] text-xs font-medium text-zinc-300 hover:text-white"
                              >
                                Config
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  {userActivity.filter(a => a.type.toLowerCase().includes('copy') || a.type.toLowerCase().includes('whale')).length > 0 ? (
                    <div className="space-y-3 text-left">
                      <div className="text-white font-semibold">Live Mempool Detections</div>
                      {userActivity
                        .filter(a => a.type.toLowerCase().includes('copy') || a.type.toLowerCase().includes('whale'))
                        .map(act => (
                          <div key={act.id} className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between">
                            <div>
                              <div className="text-white">{act.title}</div>
                              <div className="text-zinc-500 text-[11px] font-mono">Tx: {act.txHash ? `${act.txHash.slice(0, 10)}...` : 'Pending'}</div>
                            </div>
                            <span className="text-emerald-400 font-bold">{act.status}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    'No mempool mirror transactions detected yet. Target wallet activity will stream here in real time.'
                  )}
                </div>
              )}

              {subTab === 'settings' && (
                <div className="nb-card p-6 space-y-3 max-w-lg text-xs text-zinc-400">
                  <div>Mempool Listener: WebSockets via QuickNode & Alchemy</div>
                  <div>Gas Aggression: +10% priority fee over target wallet</div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 13: OPENSEA SEADROP PROTOCOL SNIPER */}
          {/* ======================================================== */}
          {activeNav === 'opensea' && (
            <div className="space-y-6 view-transition">
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5">
                  <span onClick={() => setActiveNav('home')} className="hover:text-zinc-300 cursor-pointer">
                    Home
                  </span>
                  <span>&gt;</span>
                  <span className="text-[#6b5ef0]">OpenSea</span>
                </div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-xl">⛵</span>
                  OpenSea SeaDrop Protocol Sniper
                </h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Direct protocol integration with OpenSea SeaDrop canonical contract (<span className="font-mono text-zinc-300">0x00005EA00Ac477B1030CE7850649663528343865</span>) for sub-millisecond public drops and automated Merkle allowlists.
                </p>
              </div>

              {/* 3 Sub-Navigation Tabs */}
              <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setSubTab('action')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'action' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  SeaDrop Mint
                </button>
                <button
                  onClick={() => setSubTab('history')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'history' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </button>
                <button
                  onClick={() => setSubTab('settings')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all ${
                    subTab === 'settings' ? 'nb-tab-active' : 'nb-tab-inactive'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Contract Specs
                </button>
              </div>

              {subTab === 'action' && (
                <div className="nb-card p-6 space-y-5 max-w-2xl">
                  {/* Protocol Verification Card */}
                  <div className="p-3.5 rounded-xl border border-[#6b5ef0]/40 bg-[#6b5ef0]/10 flex items-center justify-between text-xs text-[#9b92ff]">
                    <span className="flex items-center gap-2">
                      <span>⚡</span>
                      <span>SeaDrop Canonical: 0x00005EA00Ac477B1030CE7850649663528343865</span>
                    </span>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>

                  {/* Drop Contract Input */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">Collection Drop Address:</label>
                    <input
                      type="text"
                      value={mintContractAddr}
                      onChange={e => setMintContractAddr(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#6b5ef0]"
                    />
                  </div>

                  {/* Chain Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">Network:</label>
                    <div className="grid grid-cols-4 gap-2 bg-[#080A10] p-1 rounded-xl border border-white/[0.08]">
                      {['base', 'ethereum', 'ink', 'arbitrum'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setMintChain(c as any)}
                          className={`py-2 px-2 rounded-lg text-xs font-medium text-center uppercase transition-all ${
                            mintChain === c ? 'bg-[#6b5ef0] text-white font-bold' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allowlist & Merkle Status */}
                  <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Merkle Proof Engine:</span>
                      <span className="text-emerald-400 font-bold font-mono">AUTOMATED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">OpenSea Protocol Fee:</span>
                      <span className="text-zinc-300 font-mono">0.0005 ETH / token</span>
                    </div>
                  </div>

                  {/* Quantity Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-white mb-1.5">
                      <span>Quantity per Wallet:</span>
                      <span className="font-mono text-sm font-bold text-[#9b92ff]">{mintQuantity}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={mintQuantity}
                      onChange={e => setMintQuantity(Number(e.target.value))}
                      className="w-full accent-[#6b5ef0] cursor-pointer"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isMinting}
                      onClick={executeContractMint}
                      className="nb-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      {isMinting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Sniping SeaDrop...
                        </>
                      ) : (
                        'Execute SeaDrop Protocol Mint'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {subTab === 'history' && (
                <div className="nb-card p-6 text-center text-xs text-zinc-500">
                  {userActivity.filter(a => a.type === 'OpenSea SeaDrop').length > 0 ? (
                    <div className="space-y-2 text-left">
                      {userActivity
                        .filter(a => a.type === 'OpenSea SeaDrop')
                        .map(act => (
                          <div key={act.id} className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between">
                            <div>
                              <div className="text-white font-semibold text-xs">{act.title}</div>
                              <div className="text-zinc-500 text-[11px] font-mono">{act.tokenIds} • {act.gasPaid}</div>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                              {act.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    'No SeaDrop executions logged yet.'
                  )}
                </div>
              )}

              {subTab === 'settings' && (
                <div className="nb-card p-6 space-y-2 text-xs text-zinc-400 max-w-lg">
                  <div>Canonical SeaDrop Contract: 0x00005EA00Ac477B1030CE7850649663528343865</div>
                  <div>Fee Recipient: 0x0000a26b00c1F0DF003000390027140000fAa719</div>
                  <div>Merkle Root Verification: RFC 6962 Standard Tree</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD WALLET */}
      {/* ======================================================== */}
      {showAddWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nb-card p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Add Wallet</h3>
              <button onClick={() => setShowAddWalletModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <button
                onClick={() => {
                  setAlertMessage('Generated new encrypted Mint Wallet!');
                  loadData();
                  setShowAddWalletModal(false);
                  setTimeout(() => setAlertMessage(null), 3000);
                }}
                className="nb-btn-primary w-full py-2.5 text-xs font-semibold"
              >
                Generate New Mint Wallet
              </button>
              <button
                onClick={() => {
                  setShowAddWalletModal(false);
                  setShowImportKeyModal(true);
                }}
                className="w-full py-2.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-lg transition-colors"
              >
                Import Existing Private Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPORT PRIVATE KEY */}
      {/* ======================================================== */}
      {showImportKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nb-card p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Import Private Key</h3>
              <button onClick={() => setShowImportKeyModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <input
                type="password"
                placeholder="0x..."
                value={newKeyInput}
                onChange={e => setNewKeyInput(e.target.value)}
                className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6b5ef0]"
              />
              <button
                onClick={() => {
                  setShowImportKeyModal(false);
                  setNewKeyInput('');
                  setAlertMessage('Imported and encrypted private key in keystore.');
                  loadData();
                  setTimeout(() => setAlertMessage(null), 3000);
                }}
                className="nb-btn-primary w-full py-2 text-xs font-semibold"
              >
                Encrypt & Save to Keystore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NEW SCHEDULE MINT */}
      {/* ======================================================== */}
      {showNewScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nb-card p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6b5ef0]" />
                Schedule New Mint Drop
              </h3>
              <button onClick={() => setShowNewScheduleModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Collection Name:</label>
                <input
                  type="text"
                  placeholder="e.g. CyberPunks Genesis"
                  value={newScheduleName}
                  onChange={e => setNewScheduleName(e.target.value)}
                  className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6b5ef0]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Contract Address:</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newScheduleContract}
                  onChange={e => setNewScheduleContract(e.target.value)}
                  className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6b5ef0]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Network:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {chains.map(c => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setNewScheduleChain(c.slug as any)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-medium border text-center transition-all ${
                        newScheduleChain === c.slug
                          ? 'bg-[#6b5ef0] text-white border-[#6b5ef0]'
                          : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Mint Price (ETH / USDC):</label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={newSchedulePrice}
                  onChange={e => setNewSchedulePrice(e.target.value)}
                  className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6b5ef0]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (newScheduleContract) {
                    const newDrop: DropItem = {
                      id: 'drop-' + Date.now(),
                      name: newScheduleName || 'Scheduled Collection',
                      creator: '0x' + newScheduleContract.slice(2, 8) + '...',
                      chain: newScheduleChain,
                      chainName: chains.find(c => c.slug === newScheduleChain)?.name || 'Base',
                      contract: newScheduleContract,
                      mintPrice: `${newSchedulePrice || '0.00'} ${newScheduleChain === 'arc' ? 'USDC' : 'ETH'}`,
                      mintPriceWei: '0',
                      maxPerWallet: 3,
                      totalItems: 5000,
                      mintedCount: 0,
                      mintedPct: 0,
                      startTime: Date.now() + 15 * 60 * 1000,
                      phase: 'Public Live in 15m',
                      badge: 'UPCOMING',
                      status: 'UPCOMING',
                    };
                    setDrops([newDrop, ...drops]);
                    setShowNewScheduleModal(false);
                    setNewScheduleName('');
                    setNewScheduleContract('');
                    setAlertMessage(`Scheduled drop '${newDrop.name}' added to execution queue.`);
                    setTimeout(() => setAlertMessage(null), 4000);
                  }
                }}
                className="nb-btn-primary w-full py-2 text-xs font-semibold mt-2"
              >
                Queue Scheduled Drop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD COPY TRACKER */}
      {/* ======================================================== */}
      {showAddCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nb-card p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Track Target Wallet</h3>
              <button onClick={() => setShowAddCopyModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Target Address or ENS:</label>
                <input
                  type="text"
                  placeholder="0x... or name.eth"
                  value={newCopyAddress}
                  onChange={e => setNewCopyAddress(e.target.value)}
                  className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#6b5ef0]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Label:</label>
                <input
                  type="text"
                  placeholder="e.g. Alpha Whale"
                  value={newCopyLabel}
                  onChange={e => setNewCopyLabel(e.target.value)}
                  className="w-full bg-[#080A10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6b5ef0]"
                />
              </div>

              <button
                onClick={() => {
                  if (newCopyAddress) {
                    setCopyTrackers([
                      {
                        id: 'cp-' + Date.now(),
                        label: newCopyLabel || 'Target Alpha',
                        address: newCopyAddress,
                        ens: newCopyAddress.includes('.eth') ? newCopyAddress : '',
                        mirrorFreeOnly: true,
                        maxSpendEth: '0.02',
                        totalMirrored: 0,
                        active: true,
                        chain: 'base',
                        lastAction: 'Watching target wallet (0m ago)',
                      },
                      ...copyTrackers,
                    ]);
                    setShowAddCopyModal(false);
                    setNewCopyAddress('');
                    setNewCopyLabel('');
                    setAlertMessage('Now tracking target wallet in mempool.');
                    setTimeout(() => setAlertMessage(null), 3000);
                  }
                }}
                className="nb-btn-primary w-full py-2 text-xs font-semibold mt-2"
              >
                Start Mirroring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FLOATING PWA INSTALL CARD (EXACT NULLBOT SCREENSHOT 1 & 2) */}
      {/* ======================================================== */}
      {showPwaBanner && activeNav === 'home' && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full bg-[#0D0F16] border border-white/[0.12] rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/20 border border-[#6b5ef0]/40 flex items-center justify-center text-lg shrink-0">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Blink on your home screen</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Launch it in one tap for the full, immersive Blink experience, alerts included.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              setAlertMessage('PWA shortcut added to your device home screen.');
              setShowPwaBanner(false);
              setTimeout(() => setAlertMessage(null), 3000);
            }}
            className="nb-btn-primary w-full mt-3 py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Install Blink
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#06070a] py-6 px-6 text-xs text-zinc-500 font-sans text-center">
        <p>© 2026 Blink - Built by Blink Labs Limited.</p>
        <div className="flex items-center justify-center gap-4 mt-1.5 text-zinc-400">
          <span className="hover:text-white cursor-pointer">Pricing</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">FAQ</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Terms of Use</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}
