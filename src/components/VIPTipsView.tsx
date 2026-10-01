import React, { useState } from 'react';
import { Crown, Sparkles, ShieldCheck, Zap, Lock, Unlock, CheckCircle, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { MatchTip, VIPSubscription, BetSlipItem } from '../types';
import { MatchCard } from './MatchCard';
import { VIP_PLANS, CHANNEL_CONFIG } from '../data/mockMatches';
import { calculateAccumulatorOdds } from '../utils/oddsEngine';

interface VIPTipsViewProps {
  vipMatches: MatchTip[];
  vipSub: VIPSubscription;
  onOpenPayment: () => void;
  onToggleDemoVIP: () => void;
  onAddToSlip: (item: BetSlipItem) => void;
  onAddMultipleToSlip: (items: BetSlipItem[]) => void;
  isInSlip: (matchId: string, selection: string) => boolean;
}

export const VIPTipsView: React.FC<VIPTipsViewProps> = ({
  vipMatches,
  vipSub,
  onOpenPayment,
  onToggleDemoVIP,
  onAddToSlip,
  onAddMultipleToSlip,
  isInSlip,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredVIPMatches = selectedTier === 'all'
    ? vipMatches
    : vipMatches.filter(m => m.vipLevel === selectedTier);

  const totalVIPOdds = calculateAccumulatorOdds(vipMatches.map(m => m.odds));

  const handleLoadVIPAcca = () => {
    if (!vipSub.isActive) {
      onOpenPayment();
      return;
    }

    const items: BetSlipItem[] = vipMatches.map(m => ({
      matchId: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      matchTime: `${m.matchDate} ${m.matchTime}`,
      predictionType: m.predictionType,
      selection: m.predictionSelection,
      odds: m.odds,
    }));

    onAddMultipleToSlip(items);
  };

  return (
    <div className="space-y-6">
      {/* VIP Club Showcase Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-[#120f06] border-2 border-amber-500/50 p-4 sm:p-6 shadow-2xl shadow-amber-950/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                SEIJO58 VIP HIGH-ROLLER CLUB
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {CHANNEL_CONFIG.vipTipsWinRate} Win Rate
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Exclusive High Multipliers & Exact Odds ({CHANNEL_CONFIG.vipOddsAverage} Odds)
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Curated by professional match modelers & Poisson probability nodes. Includes Banker Halftime/Fulltime, Correct Scores, and 100% Value Combos.
            </p>

            {/* Quick VIP Status Pill */}
            <div className="pt-1 flex items-center gap-3">
              {vipSub.isActive ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>VIP ACTIVE ({vipSub.planName || 'Full Access'})</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP LOCKED — Activate via Mobile Money (0764220155)</span>
                </div>
              )}

              {/* Developer / Demo toggle for user testing */}
              <button
                onClick={onToggleDemoVIP}
                title="Instant preview test toggle"
                className="text-[11px] font-semibold text-slate-400 hover:text-amber-300 underline transition-colors flex items-center gap-1"
              >
                {vipSub.isActive ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                <span>{vipSub.isActive ? 'Simulate Locked View' : 'Demo Instant Unlock'}</span>
              </button>
            </div>
          </div>

          {/* Right Action: Today's Combined Multiplier */}
          <div className="w-full md:w-auto bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-center shrink-0 space-y-2.5">
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
              Today's VIP Mega Ticket
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {totalVIPOdds.toFixed(2)} <span className="text-xs font-normal text-slate-400">Total Odds</span>
            </div>
            <p className="text-[11px] text-slate-400">4 Top Statistical Picks</p>

            <button
              onClick={vipSub.isActive ? handleLoadVIPAcca : onOpenPayment}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-950/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
            >
              {vipSub.isActive ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Add VIP Slip ({totalVIPOdds.toFixed(2)} Odds)</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Unlock VIP Slip Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Pricing Plans Highlight */}
      {!vipSub.isActive && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              Choose Your VIP Pass Tier
            </h3>
            <span className="text-xs text-amber-400 font-bold">Momo: 0764220155</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VIP_PLANS.map(plan => (
              <div
                key={plan.id}
                onClick={onOpenPayment}
                className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-950/20 hover:scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-1 mb-3">
                  <h4 className="font-extrabold text-sm text-white">{plan.name}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-amber-400">{plan.priceUgx}</span>
                    <span className="text-xs text-slate-400">({plan.price})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{plan.durationLabel}</p>
                </div>

                <div className="space-y-1.5 mb-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Target: {plan.oddsTarget}</span>
                  </div>
                  {plan.features.slice(0, 2).map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onOpenPayment}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black text-xs border border-amber-500/40 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Select & Pay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIP Match Predictions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Today's VIP Locked Slips ({vipMatches.length} Matches)
          </h3>
          <span className="text-xs text-slate-400">Instant Release 10:00 GMT</span>
        </div>

        {filteredVIPMatches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            vipSub={vipSub}
            onOpenPayment={onOpenPayment}
            onAddToSlip={onAddToSlip}
            isInSlip={isInSlip}
          />
        ))}
      </div>
    </div>
  );
};
