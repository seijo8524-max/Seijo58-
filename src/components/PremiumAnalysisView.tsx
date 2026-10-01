import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MatchTip, BetSlipItem } from '../types';
import { 
  Crown, 
  Lock, 
  Unlock, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Plus, 
  Check, 
  KeyRound, 
  Layers, 
  Flame,
  ArrowRight,
  BarChart3,
  Target
} from 'lucide-react';

interface PremiumAnalysisViewProps {
  vipMatches: MatchTip[];
  onOpenPayment: () => void;
  onOpenActivationModal: () => void;
  onAddToSlip: (item: BetSlipItem) => void;
  onAddMultipleToSlip: (items: BetSlipItem[]) => void;
  isInSlip: (matchId: string, selection: string) => boolean;
}

export const PremiumAnalysisView: React.FC<PremiumAnalysisViewProps> = ({
  vipMatches,
  onOpenPayment,
  onOpenActivationModal,
  onAddToSlip,
  onAddMultipleToSlip,
  isInSlip,
}) => {
  const { isPremiumActive, userProfile } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<MatchTip | null>(vipMatches[0] || null);

  // Accumulator Total Odds
  const totalAccaOdds = vipMatches.reduce((acc, m) => acc * m.odds, 1);

  const handleLoadAllVIPToSlip = () => {
    const items: BetSlipItem[] = vipMatches.map((m) => ({
      matchId: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      matchTime: m.matchTime,
      predictionType: m.predictionType,
      selection: m.predictionSelection,
      odds: m.odds,
    }));
    onAddMultipleToSlip(items);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a142d] via-[#101e4a] to-[#2e0b17] border-2 border-amber-500/40 p-5 sm:p-7 shadow-xl shadow-blue-950/70">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black tracking-wider">
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span>VIP ELITE SPORTS ANALYSIS</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            Poisson Probability Distributions & Algorithmic Insights
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Exclusive tactical data, Expected Goals (xG) metrics, team fatigue indexes, and high-multiplier accumulator cards.
          </p>

          {isPremiumActive ? (
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Unlocked with your {userProfile?.premiumPlanName || 'VIP Club'} Membership</span>
            </div>
          ) : (
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenPayment}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-transform active:scale-95"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>UNLOCK VIP ACCESS</span>
              </button>

              <button
                onClick={onOpenActivationModal}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Enter Activation Code</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* If Not Premium: Locked Teaser Overlay */}
      {!isPremiumActive ? (
        <div className="relative rounded-3xl border-2 border-amber-500/30 bg-slate-950/90 p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-3 max-w-lg mx-auto py-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-950/60">
              <Lock className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black text-white">
              PREMIUM ANALYSIS IS LOCKED
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              This section contains proprietary mathematical models, exact score projections, and high-confidence VIP Banker signals with an average accuracy of <strong className="text-emerald-400">92%+</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenPayment}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-transform active:scale-95"
              >
                <Crown className="w-4 h-4" />
                <span>Unlock VIP Subscription</span>
              </button>

              <button
                onClick={onOpenActivationModal}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-black px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Redeem Activation Code</span>
              </button>
            </div>
          </div>

          {/* Blurred Teaser Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 filter blur-[2px] pointer-events-none opacity-50 select-none">
            {vipMatches.slice(0, 2).map((m) => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">{m.league}</span>
                  <span className="text-slate-400">{m.matchTime}</span>
                </div>
                <div className="text-base font-extrabold text-white">
                  {m.homeTeam} vs {m.awayTeam}
                </div>
                <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-1">
                  <div className="text-amber-300 font-mono font-bold">Prediction: [LOCKED VIP SIGNAL]</div>
                  <div className="text-slate-400 text-[11px]">Calculated Fair Value: 3.45 Odds</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* Unlocked VIP Analysis View */
        <div className="space-y-6">
          
          {/* Accumulator Callout Bar */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                  VIP COMBO
                </span>
                <span className="font-extrabold text-sm sm:text-base text-white">
                  Today's Super VIP Accumulator Slip
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {vipMatches.length} Matches Combined • Total Odds:{' '}
                <strong className="text-amber-300 font-bold font-mono text-sm">
                  {totalAccaOdds.toFixed(2)}x
                </strong>
              </p>
            </div>

            <button
              onClick={handleLoadAllVIPToSlip}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-transform active:scale-95 shrink-0"
            >
              <Layers className="w-4 h-4" />
              <span>Load VIP Slip to BetSlip ({totalAccaOdds.toFixed(2)} Odds)</span>
            </button>
          </div>

          {/* Matches List with Full Advanced Insights */}
          <div className="grid grid-cols-1 gap-5">
            {vipMatches.map((m) => {
              const inSlip = isInSlip(m.id, m.predictionSelection);

              return (
                <div
                  key={m.id}
                  className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl shadow-slate-950/80"
                >
                  {/* Top Match Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{m.leagueBadge}</span>
                      <span className="font-extrabold text-xs text-amber-300 uppercase tracking-wide">
                        {m.league} ({m.leagueCountry})
                      </span>
                      {m.isBanker && (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase">
                          BANKER
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span>{m.matchDate}</span>
                      <span>•</span>
                      <span>{m.matchTime}</span>
                    </div>
                  </div>

                  {/* Teams & Score / Matchup */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Teams */}
                    <div className="md:col-span-6 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                          <span className="font-extrabold text-base text-white">{m.homeTeam}</span>
                          <div className="flex items-center gap-1">
                            {m.homeForm.map((f, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                  f === 'W' ? 'bg-emerald-500 text-slate-950' : f === 'D' ? 'bg-amber-500 text-slate-950' : 'bg-red-500 text-white'
                                }`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                          <span className="font-extrabold text-base text-white">{m.awayTeam}</span>
                          <div className="flex items-center gap-1">
                            {m.awayForm.map((f, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                  f === 'W' ? 'bg-emerald-500 text-slate-950' : f === 'D' ? 'bg-amber-500 text-slate-950' : 'bg-red-500 text-white'
                                }`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                        <span>H2H History: <strong>{m.h2hSummary}</strong></span>
                      </div>
                    </div>

                    {/* Prediction Box & Odds */}
                    <div className="md:col-span-6 bg-gradient-to-br from-[#0c162e] to-[#150d1d] border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                          VIP PRIMARY TARGET
                        </span>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-extrabold">
                          <Target className="w-3.5 h-3.5" />
                          <span>{m.confidence}% Confidence</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs text-slate-400 font-medium">{m.predictionType}</span>
                        <div className="text-lg font-black text-amber-300">
                          {m.predictionSelection}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500">Value Odds</span>
                          <div className="text-2xl font-black text-white font-mono">{m.odds.toFixed(2)}</div>
                        </div>

                        <button
                          onClick={() => onAddToSlip({
                            matchId: m.id,
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            league: m.league,
                            matchTime: m.matchTime,
                            predictionType: m.predictionType,
                            selection: m.predictionSelection,
                            odds: m.odds,
                          })}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                            inSlip
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          }`}
                        >
                          {inSlip ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Added to Slip</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Add to Slip</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Deep Algorithmic Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                        Advanced Algorithmic Breakdown & xG Projection
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {m.aiAnalysis}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-xs">
                      {m.keyInsights.map((insight, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
