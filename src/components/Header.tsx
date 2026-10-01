import React from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Send, 
  MessageCircle, 
  Ticket, 
  Zap, 
  Crown, 
  User as UserIcon, 
  KeyRound, 
  Settings,
  Sparkles,
  Wallet,
  Coins,
  History
} from 'lucide-react';
import { CHANNEL_CONFIG } from '../data/mockMatches';
import { useAuth } from '../contexts/AuthContext';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderProps {
  onOpenPayment: () => void;
  onOpenActivationModal: () => void;
  onOpenAuthModal: () => void;
  betSlipCount: number;
  onOpenBetSlip: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPayment,
  onOpenActivationModal,
  onOpenAuthModal,
  betSlipCount,
  onOpenBetSlip,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, userProfile, isPremiumActive, isAdmin, isAccountActive, walletBalance } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Ticker Bar */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 px-3 py-1.5 text-xs border-b border-red-900/40 text-slate-300 flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 font-bold tracking-wider text-[10px] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-0.5" />
            LIVE ODDS
          </span>
          <span className="text-slate-300 font-medium">
            Daily Odds Updated • VIP Accuracy <strong className="text-emerald-400 font-bold">{CHANNEL_CONFIG.vipTipsWinRate}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <a
            href={CHANNEL_CONFIG.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 transition-colors"
          >
            <Send className="w-3 h-3" />
            Telegram
          </a>
          <a
            href="https://wa.me/255764220155"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            WhatsApp (+255764220155)
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('free')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="brand-logo-btn"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-blue-700 to-amber-500 p-0.5 shadow-lg shadow-red-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <span className="font-teko text-xl font-black tracking-wider text-red-500 group-hover:scale-110 transition-transform">
                58
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-red-500 via-white to-blue-400 bg-clip-text text-transparent">
                SEIJO58
              </span>
              <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-black text-xs tracking-wider">
                BET
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Official Sports Predictions & VIP Club
            </p>
          </div>
        </div>

        {/* Right Actions: Wallet Balance, Activation, Slip */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Wallet Balance Display */}
          <div 
            onClick={onOpenActivationModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer shadow-sm transition-all text-xs"
            title="Wallet Balance / Top Up"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 text-left">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Salio:</span>
              <span className="text-emerald-400 font-black text-xs sm:text-sm">
                TSh {(walletBalance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* App Download / Install Button */}
          <PWAInstallButton variant="header" />

          {/* Activation Code / Status Button */}
          {!isAccountActive ? (
            <button
              onClick={onOpenActivationModal}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-xs shadow-md transition-transform active:scale-95 animate-pulse"
              title="Washa Akaunti yako (TSh 500)"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Washa Akaunti (TSh 500)</span>
              <span className="sm:hidden">Washa</span>
            </button>
          ) : (
            <div 
              onClick={() => setActiveTab('account')}
              className="hidden md:flex items-center gap-1 bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 font-extrabold px-2.5 py-1 rounded-xl text-[11px] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ACTIVE</span>
            </div>
          )}

          {/* User Account / Auth Button */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                activeTab === 'account'
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-slate-300" />
              )}
              <span className="hidden sm:inline max-w-[90px] truncate">
                {userProfile?.name?.split(' ')[0] || 'Account'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          {/* Bet Slip Drawer Button */}
          <button
            id="header-betslip-btn"
            onClick={onOpenBetSlip}
            className="relative flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md shadow-red-950/60 transition-transform active:scale-95"
          >
            <Ticket className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Bet Slip</span>
            {betSlipCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-red-600 text-[11px] font-black flex items-center justify-center animate-bounce">
                {betSlipCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-between border-t border-slate-800/60 overflow-x-auto scrollbar-none py-1 gap-1">
          <button
            id="tab-free-tips"
            onClick={() => setActiveTab('free')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'free'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-blue-400" />
            Free Predictions
          </button>

          <button
            id="tab-premium-analysis"
            onClick={() => setActiveTab('premium')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'premium'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            ⭐ Premium VIP Tips
          </button>

          <button
            id="tab-my-slips"
            onClick={() => setActiveTab('my-slips')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'my-slips'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-400" />
            🎟️ My Slips (Historia ya Bet)
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Results & History
          </button>

          <button
            id="tab-subscription"
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'subscription'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            VIP Subscription
          </button>

          <button
            id="tab-ai-analyzer"
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'analyzer'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Match Analyzer
          </button>

          {isAdmin && (
            <button
              id="tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
