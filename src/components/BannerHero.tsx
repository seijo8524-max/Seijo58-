import React from 'react';
import { Send, MessageCircle, TrendingUp, Sparkles, Award, ArrowUpRight } from 'lucide-react';
import { CHANNEL_CONFIG } from '../data/mockMatches';

interface BannerHeroProps {
  onJoinTelegram: () => void;
  onJoinWhatsApp: () => void;
  onExploreVIP: () => void;
}

export const BannerHero: React.FC<BannerHeroProps> = ({
  onJoinTelegram,
  onJoinWhatsApp,
  onExploreVIP,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0b1329] to-emerald-950/70 border border-slate-800 p-4 sm:p-6 mb-6 shadow-xl">
      {/* Subtle background ambient glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Left Headline & Value Proposition */}
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold tracking-wide uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              DAILY BANKER & VIP ACCA
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              Verified {CHANNEL_CONFIG.vipTipsWinRate} Accuracy
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            Stop Guessing. Bet With High Probability{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              SEIJO58 Algorithm Picks
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Free daily value predictions, high-yield over/under goals, and private VIP high-roller slips curated daily with mathematical xG analytics.
          </p>

          {/* Key Channel Metric Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-1 sm:pt-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 sm:p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Free Win Rate</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">{CHANNEL_CONFIG.freeTipsWinRate}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 sm:p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">VIP Odds Avg</span>
              <span className="text-sm sm:text-base font-black text-amber-400">{CHANNEL_CONFIG.vipOddsAverage}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 sm:p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Active Subscribers</span>
              <span className="text-sm sm:text-base font-black text-sky-400">12,400+</span>
            </div>
          </div>
        </div>

        {/* Right Conversion & Quick Channel Actions */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <a
            id="hero-join-telegram-btn"
            href={CHANNEL_CONFIG.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onJoinTelegram}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-sky-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>Join Official Telegram Channel</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>

          <a
            id="hero-join-whatsapp-btn"
            href={CHANNEL_CONFIG.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onJoinWhatsApp}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Join Seijo58 Casino™ WhatsApp Group</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>

          <button
            id="hero-unlock-vip-btn"
            onClick={onExploreVIP}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Today's VIP 25+ Odds Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
