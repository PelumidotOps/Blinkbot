'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Bot,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Download,
  Brush,
  Calendar,
  ClipboardList,
  FileText,
  Coins,
  Send,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Lock,
  Flame,
  Globe,
  Radio,
  Clock,
  ChevronDown,
  Terminal,
} from 'lucide-react';

export default function LandingPage() {
  // Interactive Showcase Tab
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'whale' | 'seadrop' | 'fleet' | 'telegram'>('whale');
  
  // Interactive Benchmark Latency Slider
  const [targetBlockGas, setTargetBlockGas] = useState(15);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 flex flex-col font-sans selection:bg-[#6b5ef0] selection:text-white stars-bg relative overflow-x-hidden">
      
      {/* ======================================================== */}
      {/* 1. TOP INFINITE LIVE TICKER */}
      {/* ======================================================== */}
      <div className="w-full bg-[#080A10]/90 backdrop-blur-md border-b border-white/[0.06] py-2 overflow-hidden z-50 text-[11px] font-mono">
        <div className="animate-marquee flex items-center gap-10 text-zinc-400 whitespace-nowrap">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="radar-dot-pulse bg-emerald-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-white font-bold">MEMPOOL SNIFFER:</span>
            <span className="text-emerald-400 font-semibold">22ms LATENCY</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-blue-400 font-bold">BASE L2:</span> 0.002 Gwei • Block #28,941,120
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-purple-400 font-bold">INK CHAIN:</span> 0.001 Gwei • Genesis Sniffer Active
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">ETH MAINNET:</span> 12.4 Gwei • Flashbots Private Relay
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">OPENSEA SEADROP:</span> Canonical Protocol Engine 0x00005EA0...
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 font-semibold">
            14,280+ FLEET MINTS EXECUTED • 99.4% WIN RATE
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Bot className="w-3.5 h-3.5 text-[#9b92ff]" />
            TELEGRAM BOT: <span className="text-white">@BlinkSniperBot ONLINE</span>
          </span>

          {/* Duplicated for seamless infinite loop */}
          <span className="flex items-center gap-2 pl-10">
            <span className="relative flex h-2 w-2">
              <span className="radar-dot-pulse bg-emerald-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-white font-bold">MEMPOOL SNIFFER:</span>
            <span className="text-emerald-400 font-semibold">22ms LATENCY</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-blue-400 font-bold">BASE L2:</span> 0.002 Gwei • Block #28,941,120
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-purple-400 font-bold">INK CHAIN:</span> 0.001 Gwei • Genesis Sniffer Active
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">ETH MAINNET:</span> 12.4 Gwei • Flashbots Private Relay
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">OPENSEA SEADROP:</span> Canonical Protocol Engine 0x00005EA0...
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 font-semibold">
            14,280+ FLEET MINTS EXECUTED • 99.4% WIN RATE
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. NAVIGATION BAR */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#06070a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#6b5ef0] flex items-center justify-center text-white shadow-lg shadow-[#6b5ef0]/40 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-2 font-mono">
              BLINK
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6b5ef0]/20 text-[#9b92ff] border border-[#6b5ef0]/40 font-semibold">
                v2.4 Live
              </span>
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#showcase" className="hover:text-white transition-colors">Live Engines</a>
            <a href="#benchmarks" className="hover:text-white transition-colors">Benchmarks</a>
            <a href="#chains" className="hover:text-white transition-colors">Chains</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://t.me/BlinkSniperBot"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[#6b5ef0]" />
              <span>@BlinkSniperBot</span>
            </a>

            <Link
              href="/app"
              className="nb-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#6b5ef0]/30"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Ambient Radial Glow Behind Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#6b5ef0]/20 via-[#9b92ff]/10 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Hero Top Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#6b5ef0]/40 bg-[#6b5ef0]/10 text-xs font-mono text-[#9b92ff] mb-6 shadow-inner backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="radar-dot-pulse bg-[#6b5ef0]" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6b5ef0]" />
          </span>
          <span>AUTONOMOUS MULTI-CHAIN EVM SNIPER • ZERO GAS WASTE</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08]">
          Unfair Speed. <br className="hidden sm:inline" />
          Autonomous Alpha. <br />
          <span className="bg-gradient-to-r from-[#8E82FE] via-[#6B5EF0] to-cyan-400 bg-clip-text text-transparent">
            Zero Execution Lag.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Front-run competitive mints, mirror whale wallets in <span className="text-white font-semibold">22ms</span>, automate OpenSea SeaDrop allowlists, and coordinate 50+ wallet fleets with zero gas waste on Base, Ink, Ethereum, and Arbitrum.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <Link
            href="/app"
            className="nb-btn-primary w-full sm:w-auto px-7 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#6b5ef0]/40 text-white"
          >
            <span>Launch Web3 Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://t.me/BlinkSniperBot"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-lg border border-white/[0.12] bg-[#0d0f16]/90 hover:bg-white/[0.06] text-white flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-4 h-4 text-[#6b5ef0]" />
            <span>Telegram Bot</span>
          </a>
        </div>

        {/* Fast Facts / Micro KPIs */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          <div className="nb-card p-4 relative overflow-hidden group">
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Mempool Sniffer</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-baseline gap-1">
              22ms <span className="text-xs text-zinc-500 font-normal">detection</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">WebSockets on Alchemy & QuickNode</p>
          </div>

          <div className="nb-card p-4 relative overflow-hidden group">
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Win Rate</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 flex items-baseline gap-1">
              99.4% <span className="text-xs text-emerald-400 font-normal">confirmed</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">On competitive oversubscribed drops</p>
          </div>

          <div className="nb-card p-4 relative overflow-hidden group">
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">EVM Ecosystem</div>
            <div className="text-2xl font-bold font-mono text-[#9b92ff] mt-1 flex items-baseline gap-1">
              5 Chains <span className="text-xs text-zinc-500 font-normal">native</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Base, Ink, Ethereum, Arbitrum, Arc</p>
          </div>

          <div className="nb-card p-4 relative overflow-hidden group">
            <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Simulation Guard</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 flex items-baseline gap-1">
              $0 Burn <span className="text-xs text-zinc-500 font-normal">lost</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">eth_call pre-execution verification</p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. ECOSYSTEM & CHAINS INFINITE TICKER */}
      {/* ======================================================== */}
      <section id="chains" className="py-8 border-y border-white/[0.06] bg-[#080A10]/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
          <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
            POWERING FLEETS ACROSS LEADING EVM PROTOCOLS & INFRASTRUCTURE
          </span>
        </div>
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">🔵</div>
            BASE L2 (Coinbase)
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px]">🐙</div>
            INK CHAIN (Kraken)
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-black flex items-center justify-center text-[10px] font-bold">Ξ</div>
            ETHEREUM MAINNET
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px]">🔷</div>
            ARBITRUM ONE
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[10px]">⚡</div>
            ARC NETWORK
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px]">⛵</div>
            OPENSEA SEADROP
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-[10px]">🔮</div>
            ALCHEMY SUPERNODE
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-[10px]">⚡</div>
            QUICKNODE WEBSOCKETS
          </div>

          {/* Duplicate set for infinite loop */}
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white pl-12">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">🔵</div>
            BASE L2 (Coinbase)
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px]">🐙</div>
            INK CHAIN (Kraken)
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-black flex items-center justify-center text-[10px] font-bold">Ξ</div>
            ETHEREUM MAINNET
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px]">🔷</div>
            ARBITRUM ONE
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[10px]">⚡</div>
            ARC NETWORK
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px]">⛵</div>
            OPENSEA SEADROP
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. INTERACTIVE LIVE ENGINE SHOWCASE (HERO APP MOCKUP) */}
      {/* ======================================================== */}
      <section id="showcase" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-mono text-zinc-400 mb-3">
            <Terminal className="w-3.5 h-3.5 text-[#6b5ef0]" />
            <span>LIVE INTERACTIVE PREVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See the Core Engines in Action
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl mx-auto">
            Switch between the autonomous modules to preview real-time mempool sniffing, allowlist sniping, and fleet sweeps.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center bg-[#0d0f16] p-1 rounded-xl border border-white/[0.08] gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveShowcaseTab('whale')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeShowcaseTab === 'whale' ? 'nb-tab-active' : 'nb-tab-inactive'
              }`}
            >
              <span>🐋</span>
              <span>22ms Whale Sniffer</span>
            </button>

            <button
              onClick={() => setActiveShowcaseTab('seadrop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeShowcaseTab === 'seadrop' ? 'nb-tab-active' : 'nb-tab-inactive'
              }`}
            >
              <span>⛵</span>
              <span>OpenSea SeaDrop</span>
            </button>

            <button
              onClick={() => setActiveShowcaseTab('fleet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeShowcaseTab === 'fleet' ? 'nb-tab-active' : 'nb-tab-inactive'
              }`}
            >
              <Brush className="w-3.5 h-3.5" />
              <span>Fleet NFT Sweeper</span>
            </button>

            <button
              onClick={() => setActiveShowcaseTab('telegram')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeShowcaseTab === 'telegram' ? 'nb-tab-active' : 'nb-tab-inactive'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Bot Remote</span>
            </button>
          </div>
        </div>

        {/* Showcase Frame (Window Mockup) */}
        <div className="bg-[#090b10] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden relative group">
          {/* Top Window Bar */}
          <div className="bg-[#0D0F16] border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-zinc-500 ml-2">blink-core://engine/v2.4</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>RPC LATENCY: 22ms</span>
            </div>
          </div>

          {/* Window Body Content */}
          <div className="p-6 min-h-[380px] flex flex-col justify-between">
            {activeShowcaseTab === 'whale' && (
              <div className="space-y-4 view-transition">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🐋</span>
                      Mempool Alpha Sniffer & Front-Runner
                    </h3>
                    <p className="text-xs text-zinc-400">Sniffing pending transactions in the mempool before block miners seal the batch.</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    LIVE POLLING
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">12:04:18.022</span>
                      <span className="text-zinc-300">Target Alpha: <span className="text-white font-bold">Pranksy (0xd386...90a1)</span></span>
                      <span className="text-zinc-500">Method: mint(uint256 quantity=2)</span>
                    </div>
                    <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Detected on Base</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#6b5ef0]/10 border border-[#6b5ef0]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#9b92ff] font-bold">12:04:18.044</span>
                      <span className="text-white">Blink Front-Run Dispatched: <span className="text-[#9b92ff]">+10% Priority Gas</span></span>
                      <span className="text-zinc-400">Wallets: 5 Fleet Minters</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold">22ms RESPONSE</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500">12:04:19.100</span>
                      <span className="text-white">Block #28,941,120 Finalized: <span className="text-emerald-400">10 NFTs Minted</span></span>
                      <span className="text-zinc-500">TxHash: 0x8a9f...c24e</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold">SUCCESS (100%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs">
                  <span className="text-zinc-400">Watchlist: 3 Alpha Wallets active • Zero false-positive gas burns</span>
                  <Link href="/app" className="text-[#9b92ff] hover:text-white font-semibold flex items-center gap-1">
                    Configure Alpha Targets in Dashboard &gt;
                  </Link>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'seadrop' && (
              <div className="space-y-4 view-transition">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>⛵</span>
                      Canonical OpenSea SeaDrop Automated Sniper
                    </h3>
                    <p className="text-xs text-zinc-400">Direct integration with contract 0x00005EA00Ac477B1030CE7850649663528343865 with Merkle allowlists.</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    CANONICAL ENGINE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="nb-card p-3 space-y-1">
                    <div className="text-[11px] text-zinc-500 font-mono">COLLECTION DROP</div>
                    <div className="text-xs font-bold text-white">Ink Genesis Artifacts</div>
                    <div className="text-[11px] font-mono text-zinc-400">0x5346...42CF</div>
                  </div>
                  <div className="nb-card p-3 space-y-1">
                    <div className="text-[11px] text-zinc-500 font-mono">MERKLE ALLOWLIST</div>
                    <div className="text-xs font-bold text-emerald-400">SOLVED (Proof Pre-Computed)</div>
                    <div className="text-[11px] font-mono text-zinc-400">Root: 0x9b4e...11af</div>
                  </div>
                  <div className="nb-card p-3 space-y-1">
                    <div className="text-[11px] text-zinc-500 font-mono">PROTOCOL FEE</div>
                    <div className="text-xs font-bold text-white">0.0005 ETH / token</div>
                    <div className="text-[11px] font-mono text-zinc-400">OpenSea canonical fee recipient</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">● MINT STAGE: PUBLIC LAUNCH</span>
                    <span className="text-zinc-400">Execution time: <span className="text-white font-bold">14ms</span></span>
                  </div>
                  <span className="text-emerald-400 font-bold">BATCH MINTS CONFIRMED</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs">
                  <span className="text-zinc-400">Fully compatible with all SeaDrop v1.0, v1.1, and fee-free drops</span>
                  <Link href="/app" className="text-[#9b92ff] hover:text-white font-semibold flex items-center gap-1">
                    Open SeaDrop Sniper Screen &gt;
                  </Link>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'fleet' && (
              <div className="space-y-4 view-transition">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Brush className="w-4 h-4 text-[#9b92ff]" />
                      Multi-Wallet Fleet Disperse & 1-Click NFT Sweeper
                    </h3>
                    <p className="text-xs text-zinc-400">Disperse gas to 50+ burner wallets in 1 tx, then sweep all minted NFTs straight to cold storage.</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    FLEET CONTROLLER
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="nb-card p-3">
                    <div className="text-[11px] text-zinc-500">MINTED IN FLEET</div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">14 NFTs</div>
                  </div>
                  <div className="nb-card p-3">
                    <div className="text-[11px] text-zinc-500">SWEEP GAS COST</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">0.0003 ETH</div>
                  </div>
                  <div className="nb-card p-3">
                    <div className="text-[11px] text-zinc-500">DESTINATION</div>
                    <div className="text-lg font-bold font-mono text-[#9b92ff] mt-0.5">Master Cold Safe</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Batch sweep progress: <span className="text-white">14 / 14 tokens transferred</span></span>
                  <span className="text-emerald-400 font-bold">SWEEP COMPLETE</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs">
                  <span className="text-zinc-400">Supports ERC-721, ERC-1155, and native ETH consolidation</span>
                  <Link href="/app" className="text-[#9b92ff] hover:text-white font-semibold flex items-center gap-1">
                    Try Fleet Manager &gt;
                  </Link>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'telegram' && (
              <div className="space-y-4 view-transition">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#9b92ff]" />
                      Telegram Bot Remote Control (@BlinkSniperBot)
                    </h3>
                    <p className="text-xs text-zinc-400">Control your entire minter fleet directly from your phone on Telegram.</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    BOT ONLINE
                  </span>
                </div>

                <div className="max-w-md mx-auto bg-black/60 rounded-xl p-4 border border-white/[0.08] font-mono text-xs space-y-2">
                  <div className="text-zinc-400">&gt; /mint contract=0xa16e...d2be chain=base qty=2</div>
                  <div className="text-[#9b92ff]">⚡ Blink Bot: Preparing 5 fleet wallets for Base L2...</div>
                  <div className="text-emerald-400">✓ Simulation Passed! Priority gas: 0.002 Gwei</div>
                  <div className="text-white">🎉 Successfully minted 10 CyberPunks! NFTs sent to keystore.</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs">
                  <span className="text-zinc-400">Receive instant push notifications for whale movements and drop completions</span>
                  <a href="https://t.me/BlinkSniperBot" target="_blank" rel="noreferrer" className="text-[#9b92ff] hover:text-white font-semibold flex items-center gap-1">
                    Launch Telegram Bot &gt;
                  </a>
                </div>
              </div>
            )}

            {/* Bottom Bar inside window */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">Blink Core v2.4 • Client Daemon Ready</span>
              <Link
                href="/app"
                className="nb-btn-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Open Full Web3 Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CORE ENGINES SHOWCASE (THE FATNINJA BENTO GRID) */}
      {/* ======================================================== */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#9b92ff] font-semibold">
            ENGINEERED WITHOUT COMPROMISE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            The Complete Web3 Sniper Stack
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to compete with elite trading desks and capture on-chain value across major EVM rollups.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Whale Mempool Sniffer */}
          <div className="nb-card p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#6b5ef0]/15 border border-[#6b5ef0]/30 flex items-center justify-center text-xl text-[#9b92ff] mb-4 group-hover:scale-105 transition-transform">
                🐋
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#9b92ff] transition-colors">
                22ms Whale Sniffer
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connects directly to raw mempool sockets via Alchemy Supernodes and QuickNode. Detects when target alpha wallets broadcast a mint and submits a front-running transaction before the block is mined.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Latency: 22ms</span>
              <span className="text-emerald-400">Zero Lag</span>
            </div>
          </div>

          {/* Card 2: OpenSea SeaDrop Canonical */}
          <div className="nb-card p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-xl text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                ⛵
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                OpenSea SeaDrop Sniper
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct integration with OpenSea’s canonical SeaDrop contract (<span className="font-mono text-zinc-300">0x00005EA0...</span>). Bypasses frontend Cloudflare rate limits and automatically proves Merkle allowlists.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Protocol: SeaDrop v1.1</span>
              <span className="text-blue-400">Pre-computed Merkle</span>
            </div>
          </div>

          {/* Card 3: Millisecond Schedule Drops */}
          <div className="nb-card p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                Schedule Mint Engine
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Set and forget upcoming drops. Blink synchronizes with on-chain block timestamps, calculating accurate start blocks to release transactions the exact millisecond the mint phase opens.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Precision: Millisecond NTP</span>
              <span className="text-amber-400">Auto-Armed</span>
            </div>
          </div>

          {/* Card 4: Multi-Wallet Fleet Sweeper */}
          <div className="nb-card p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                <Brush className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                Fleet Disperse & Sweeper
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Overcome wallet limits effortlessly. Disperse gas and minting funds across up to 50 burner wallets simultaneously, then sweep all minted NFTs back to your cold storage master wallet with 1 click.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Capacity: 50+ Wallets</span>
              <span className="text-purple-400">1-Click Consolidation</span>
            </div>
          </div>

          {/* Card 5: eth_call Anti-Rug Protection */}
          <div className="nb-card p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                Gas Guard & Simulation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Never pay gas on failed or paused contracts. Every transaction runs through an instant <span className="font-mono text-zinc-300">eth_call</span> static simulation before broadcast. If the contract reverts, the transaction is aborted at zero cost.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Security: Pre-Flight Check</span>
              <span className="text-cyan-400">Zero Reverts</span>
            </div>
          </div>

          {/* Card 6: Telegram Remote Control */}
          <div className="nb-card p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#6b5ef0]/15 border border-[#6b5ef0]/30 flex items-center justify-center text-xl text-[#9b92ff] mb-4 group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5 text-[#9b92ff]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#9b92ff] transition-colors">
                Telegram Bot Suite
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect seamlessly with <span className="text-white font-medium">@BlinkSniperBot</span>. Fire mint commands, check balances, view portfolio valuations, and receive live whale sound alerts directly in Telegram.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Interface: Web + Telegram</span>
              <span className="text-[#9b92ff]">Real-Time Alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. LATENCY BENCHMARK: BLINK VS TRADITIONAL BROWSER UI */}
      {/* ======================================================== */}
      <section id="benchmarks" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            PROVEN PERFORMANCE METRICS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Why Browser Wallets Lose to Blink
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl mx-auto">
            Compare execution speeds between automated RPC sockets and human browser UI clicks.
          </p>
        </div>

        <div className="nb-card p-8 space-y-8">
          {/* Latency Comparison Bars */}
          <div className="space-y-6">
            {/* Blink */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#6b5ef0]" />
                  Blink Autonomous Daemon
                </span>
                <span className="font-mono text-emerald-400 font-bold">22 ms (Included in Block)</span>
              </div>
              <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6b5ef0] to-emerald-400 rounded-full" style={{ width: '3%' }} />
              </div>
            </div>

            {/* Standard UI / MetaMask */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-2">
                  <span>🦊</span>
                  Traditional Web3 Browser Extension (MetaMask / Phantom)
                </span>
                <span className="font-mono text-red-400 font-semibold">3,450 ms (Congested)</span>
              </div>
              <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-red-500/60 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          {/* Three comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/[0.06] text-xs">
            <div className="space-y-1">
              <div className="text-zinc-500 font-mono">156X FASTER</div>
              <div className="font-bold text-white">Sub-Block Inclusion</div>
              <p className="text-zinc-400 text-[11px]">Transactions broadcast directly through private RPC nodes, bypassing browser popup lag.</p>
            </div>
            <div className="space-y-1">
              <div className="text-zinc-500 font-mono">ZERO MANUAL SIGNING</div>
              <div className="font-bold text-white">Pre-Authorized Keystore</div>
              <p className="text-zinc-400 text-[11px]">AES-256 encrypted local keystore signs transactions instantly without waiting for user approval.</p>
            </div>
            <div className="space-y-1">
              <div className="text-zinc-500 font-mono">DYNAMIC GAS MULTIPLIER</div>
              <div className="font-bold text-white">Always Top of Block</div>
              <p className="text-zinc-400 text-[11px]">Automatically sets priority gas fee 10% higher than the highest competitor in the pending pool.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. HOW IT WORKS (3 SIMPLE STEPS) */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#9b92ff] font-semibold">
            GET STARTED IN 60 SECONDS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            How Blink Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/20 border border-[#6b5ef0]/40 flex items-center justify-center font-mono font-bold text-white">
              01
            </div>
            <h3 className="text-base font-bold text-white">Deploy Your Wallet Fleet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate 5 to 50 encrypted burner wallets inside Blink with 1 click, or import existing keys. Disperse gas in a single batched transaction.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/20 border border-[#6b5ef0]/40 flex items-center justify-center font-mono font-bold text-white">
              02
            </div>
            <h3 className="text-base font-bold text-white">Configure Drop or Target Whale</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste the contract drop address, schedule a future drop, or add a target alpha wallet address to start mempool sniffing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#6b5ef0]/20 border border-[#6b5ef0]/40 flex items-center justify-center font-mono font-bold text-white">
              03
            </div>
            <h3 className="text-base font-bold text-white">Autonomous Mint & Sweep</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Blink executes at sub-millisecond speeds. Once confirmed, 1-click sweeps all minted NFTs from burner wallets directly to your hardware cold safe.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. PRICING & ACCESS TIERS */}
      {/* ======================================================== */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#9b92ff] font-semibold">
            TRANSPARENT VALUE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Simple, Transparent Access
          </h2>
          <p className="mt-3 text-zinc-400 text-sm max-w-xl mx-auto">
            Choose the tier that fits your trading volume. All plans include full multi-chain EVM support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Free Explorer */}
          <div className="nb-card p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">Explorer</div>
              <div className="text-3xl font-extrabold text-white font-mono mt-2">$0 <span className="text-xs text-zinc-500 font-normal">/ forever</span></div>
              <p className="text-xs text-zinc-400 mt-2">Essential tools for individual manual minters exploring EVM drops.</p>

              <ul className="mt-6 space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>1 Active Mint Wallet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>Standard Public RPC relays</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>Manual contract mints</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>Basic Telegram Bot alerts</span>
                </li>
              </ul>
            </div>

            <Link
              href="/app"
              className="mt-8 w-full py-2.5 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-white text-center transition-all"
            >
              Start Free
            </Link>
          </div>

          {/* Tier 2: Pro Sniper (Featured) */}
          <div className="nb-card p-6 flex flex-col justify-between border-[#6b5ef0] shadow-2xl shadow-[#6b5ef0]/20 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#6b5ef0] text-[10px] font-bold text-white uppercase tracking-wider font-mono">
              MOST POPULAR
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#9b92ff]">Pro Sniper</div>
              <div className="text-3xl font-extrabold text-white font-mono mt-2">
                0.05 ETH <span className="text-xs text-zinc-400 font-normal">/ lifetime</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">The complete autonomous setup for active degens and collectors.</p>

              <ul className="mt-6 space-y-2.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span><strong>10 Concurrent Fleet Wallets</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span><strong>22ms Mempool Whale Sniffer</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span><strong>OpenSea SeaDrop Merkle Auto-Solver</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1-Click Disperse & NFT Sweeper</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Fast WebSocket Node Relay</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Full Telegram Bot Remote Controls</span>
                </li>
              </ul>
            </div>

            <Link
              href="/app"
              className="mt-8 nb-btn-primary w-full py-2.5 text-xs font-bold text-center block shadow-lg shadow-[#6b5ef0]/40"
            >
              Launch Pro Access &gt;
            </Link>
          </div>

          {/* Tier 3: Whale Syndicate */}
          <div className="nb-card p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">Whale Syndicate</div>
              <div className="text-3xl font-extrabold text-white font-mono mt-2">
                0.2 ETH <span className="text-xs text-zinc-500 font-normal">/ lifetime</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">Custom infrastructure for syndicates, alpha groups, and volume desks.</p>

              <ul className="mt-6 space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span><strong>Unlimited Fleet Wallets</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>Dedicated Private QuickNode / Alchemy RPC</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>Simultaneous Multi-Drop Coordination</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>Custom Contract Bytecode Sniffer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6b5ef0]" />
                  <span>Priority 24/7 VIP Discord/Telegram Support</span>
                </li>
              </ul>
            </div>

            <Link
              href="/app"
              className="mt-8 w-full py-2.5 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-white text-center transition-all"
            >
              Contact Syndicate Desk
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      {/* ======================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#9b92ff] font-semibold">
            CLEAR ANSWERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does Blink execute in 22 milliseconds?',
              a: 'Blink connects directly to raw JSON-RPC mempool WebSockets via Alchemy and QuickNode endpoints rather than waiting for transactions to hit public web interfaces. Transactions are signed locally in RAM and broadcast with custom pre-calculated priority gas fees.',
            },
            {
              q: 'Are my private keys secure with Blink?',
              a: 'Yes. Blink uses a client-side AES-256 encrypted keystore. Your private keys never leave your device and are never sent to any external server or telemetry pipeline. You maintain 100% custody of all assets at all times.',
            },
            {
              q: 'What chains are natively supported?',
              a: 'Blink has native high-speed RPC configurations for Base L2 (Coinbase), Ink Chain (Kraken), Ethereum Mainnet, Arbitrum One, and Arc Network. Custom RPC endpoints can also be configured in settings.',
            },
            {
              q: 'How does OpenSea SeaDrop allowlist sniping work?',
              a: 'Blink integrates directly with SeaDrop canonical contract 0x00005EA00Ac477B1030CE7850649663528343865. The engine downloads and calculates the Merkle proof tree ahead of time, firing the exact allowlist proof the moment the phase begins.',
            },
            {
              q: 'How does the Telegram Bot pair with the Web Dashboard?',
              a: 'Once paired with @BlinkSniperBot via your unique user ID, you can trigger mints, monitor your fleet portfolio, and receive push notifications on your phone whenever a target whale wallet takes an action.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="nb-card overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-[#9b92ff] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-[#9b92ff]' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3 view-transition">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. FINAL HIGH-CONVERTING BOTTOM CTA BANNER */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="nb-card p-10 md:p-14 text-center relative overflow-hidden border-[#6b5ef0]/50 shadow-2xl shadow-[#6b5ef0]/20">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6b5ef0]/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#6b5ef0]/20 text-[#9b92ff] border border-[#6b5ef0]/40 font-semibold">
              ⚡ LIVE & OPERATIONAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Win Every Competitive Mint?
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Launch the Blink dashboard, generate your fleet, and front-run on-chain opportunities in under 60 seconds.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="nb-btn-primary px-8 py-3.5 text-sm font-bold flex items-center gap-2 shadow-xl shadow-[#6b5ef0]/40 text-white w-full sm:w-auto justify-center"
              >
                <span>Launch Blink Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://t.me/BlinkSniperBot"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 text-sm font-semibold rounded-lg border border-white/[0.12] bg-[#080A10] hover:bg-white/[0.06] text-white flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
              >
                <Send className="w-4 h-4 text-[#6b5ef0]" />
                <span>Join @BlinkSniperBot</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 12. FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-white/[0.06] bg-[#040508] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#6b5ef0] flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-mono text-white font-bold tracking-tight">BLINK</span>
            <span className="text-xs text-zinc-500">© 2026 Blink Labs Limited. Built for speed.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href="/app" className="hover:text-white transition-colors">Web Dashboard</Link>
            <a href="https://t.me/BlinkSniperBot" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Telegram Bot</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
