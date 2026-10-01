import React, { useRef } from 'react';
import { CasinoGameId } from '../../types/casino';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { 
  Flame, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Crown, 
  Sparkles, 
  PlaneTakeoff, 
  Bomb, 
  Award, 
  Layers, 
  Disc, 
  History, 
  ShieldCheck,
  Gift,
  Coins,
  KeyRound,
  Gamepad2,
  Receipt
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  activeGameId: CasinoGameId | null;
  walletBalance: number;
  userExp: number;
  vipTierName: string;
  myBetsCount?: number;
  onNavigateTab: (tab: string) => void;
  onSelectGame: (gameId: CasinoGameId) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenVIPPass: () => void;
  onOpenAdminPortal?: () => void;
}

export function CasinoHeader({
  activeTab,
  activeGameId,
  walletBalance,
  vipTierName,
  myBetsCount = 0,
  onNavigateTab,
  onSelectGame,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenVIPPass,
  onOpenAdminPortal
}: HeaderProps) {
  const logoClicksRef = useRef<number[]>([]);

  const handleLogoClick = () => {
    const now = Date.now();
    // Keep clicks from the past 1200ms
    logoClicksRef.current = logoClicksRef.current.filter(t => now - t < 1200);
    logoClicksRef.current.push(now);

    // If triple-clicked (3 clicks in quick succession), open Secret Admin Portal
    if (logoClicksRef.current.length >= 3) {
      logoClicksRef.current = [];
      if (onOpenAdminPortal) {
        onOpenAdminPortal();
        return;
      }
    }

    onNavigateTab('lobby');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LOGO & BRAND (Triple-click opens Secret Admin Portal) */}
        <div 
          onClick={handleLogoClick}
          title="Bonyeza mara 3 mfululizo kufungua Admin Portal ya Siri"
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-amber-500 p-0.5 shadow-lg shadow-red-950/80 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <span className="font-teko text-2xl font-bold text-red-500 tracking-tighter">58</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-lg sm:text-xl tracking-wider text-white leading-none">
                SEIJO<span className="text-red-500">58</span> <span className="text-amber-400 text-xs sm:text-sm font-bold">BET</span>
              </h1>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wide">
                {vipTierName}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Tanzania Official Real Money Casino</p>
          </div>
        </div>

        {/* RIGHT ACTIONS: ADMIN PORTAL, DEPOSIT PROMO, WALLET & QUICK BUTTONS */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* SECRET ADMIN PORTAL BUTTON */}
          {onOpenAdminPortal && (
            <button
              onClick={onOpenAdminPortal}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 px-2 sm:px-2.5 py-1.5 rounded-2xl text-[11px] font-bold shadow-sm transition-all active:scale-95"
              title="Admin Code Generator Portal"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Admin Portal</span>
            </button>
          )}
          
          {/* DEPOSIT BONUS BADGE */}
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black shadow-sm transition-all active:scale-95"
            title="Weka TSh 5,000 Pata +2,000 | Weka TSh 10,000 Pata +3,000"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline text-[11px]">Deposit Bonus: <strong className="text-emerald-400">+TSh 3,000</strong></span>
            <span className="sm:hidden text-[10px]">+Bonus</span>
          </button>

          {/* WALLET BALANCE & QUICK ACTION */}
          <div 
            onClick={() => onNavigateTab('wallet')}
            className="flex items-center gap-2 bg-[#090d16] border border-emerald-500/40 hover:border-emerald-400 px-3 py-1.5 rounded-2xl cursor-pointer shadow-sm transition-all text-xs"
          >
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Salio Lako:</div>
              <div className="text-emerald-400 font-black text-xs sm:text-sm font-mono">
                TSh {walletBalance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* APP DOWNLOAD / INSTALL BUTTON */}
          <PWAInstallButton variant="header" />

          {/* DEPOSIT BUTTON */}
          <button
            onClick={onOpenDeposit}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/60 active:scale-95 transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Weka Pesa</span>
          </button>

          {/* WITHDRAW BUTTON */}
          <button
            onClick={onOpenWithdraw}
            className="hidden sm:flex bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Toa</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL CASINO NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        <button
          onClick={() => onNavigateTab('lobby')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'lobby' && !activeGameId
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>🎰 Casino Lobby</span>
        </button>

        <button
          onClick={() => onNavigateTab('efootball')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'efootball'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md font-black ring-1 ring-amber-400'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 font-bold border border-amber-500/30 bg-amber-500/10'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
          <span>🎮 SEIJO58 EFOOTBALL CAMP ™</span>
        </button>

        <button
          onClick={() => onNavigateTab('mybets')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all relative ${
            activeTab === 'mybets'
              ? 'bg-amber-600 text-white shadow-md font-black ring-1 ring-amber-300'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-amber-400" />
          <span>📋 Mikeka Yangu (My Bets)</span>
          {myBetsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
              {myBetsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectGame('aviator')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'game' && activeGameId === 'aviator'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <PlaneTakeoff className="w-3.5 h-3.5 text-red-500" />
          <span>✈️ Aviator</span>
        </button>

        <button
          onClick={() => onSelectGame('mines')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'game' && activeGameId === 'mines'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Bomb className="w-3.5 h-3.5 text-amber-400" />
          <span>💣 Mines</span>
        </button>

        <button
          onClick={() => onSelectGame('penalty')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'game' && activeGameId === 'penalty'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>⚽ Penalty Shootout</span>
        </button>

        <button
          onClick={() => onSelectGame('blackjack')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'game' && activeGameId === 'blackjack'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>🃏 Blackjack 21</span>
        </button>

        <button
          onClick={() => onSelectGame('slots')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'game' && activeGameId === 'slots'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>💎 Lucky Slots 777</span>
        </button>

        <button
          onClick={() => onSelectGame('roulette')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'game' && activeGameId === 'roulette'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Disc className="w-3.5 h-3.5 text-red-400" />
          <span>🎡 European Roulette</span>
        </button>

        <button
          onClick={() => onNavigateTab('vip')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'vip'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>👑 VIP Club</span>
        </button>

        <button
          onClick={() => onNavigateTab('history')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'history'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>📜 Historia ya Bet</span>
        </button>

        <button
          onClick={() => onNavigateTab('wallet')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'wallet'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span>💳 Pochi & Kutoa Pesa</span>
        </button>

        <button
          onClick={() => onNavigateTab('fairness')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'fairness'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>🛡️ Provably Fair</span>
        </button>
      </div>
    </header>
  );
}
