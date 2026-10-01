import React, { useState } from 'react';
import { 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Percent, 
  Flame, 
  Clock, 
  BarChart3,
  Copy,
  CheckCheck
} from 'lucide-react';
import { MatchTip, VIPSubscription, BetSlipItem } from '../types';
import { CHANNEL_CONFIG } from '../data/mockMatches';

interface MatchCardProps {
  match: MatchTip;
  vipSub: VIPSubscription;
  onOpenPayment: () => void;
  onAddToSlip: (item: BetSlipItem) => void;
  isInSlip: (matchId: string, selection: string) => boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  vipSub,
  onOpenPayment,
  onAddToSlip,
  isInSlip,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMarketTab, setSelectedMarketTab] = useState<'main' | 'all'>('main');
  const [copiedTip, setCopiedTip] = useState(false);

  const isLocked = match.isVIP && !vipSub.isActive;
  const isSelectedInSlip = isInSlip(match.id, match.predictionSelection);

  const handleCopyTip = () => {
    const text = `⚽ SEIJO58 BET TIP: ${match.homeTeam} vs ${match.awayTeam}\n🏆 League: ${match.league}\n🎯 Pick: ${match.predictionSelection}\n📈 Odds: ${match.odds.toFixed(2)} | Conf: ${match.confidence}%\n🔥 Join Channel: ${CHANNEL_CONFIG.telegramLink}`;
    navigator.clipboard.writeText(text);
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2000);
  };

  const handleAddCustomSelection = (type: string, selection: string, odds: number) => {
    onAddToSlip({
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.league,
      matchTime: `${match.matchDate} ${match.matchTime}`,
      predictionType: type,
      selection,
      odds,
    });
  };

  return (
    <div 
      id={`match-card-${match.id}`}
      className={`relative overflow-hidden rounded-2xl transition-all duration-200 border ${
        match.isBanker
          ? 'bg-gradient-to-b from-slate-900 via-[#0d1424] to-[#090e1a] border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : match.isVIP
          ? 'bg-gradient-to-b from-slate-900 via-[#16120b] to-[#0d0f18] border-amber-500/40 shadow-lg shadow-amber-950/20'
          : 'bg-[#0c1220]/90 hover:bg-[#0f172a]/95 border-slate-800/90 hover:border-slate-700/80 shadow-md'
      }`}
    >
      {/* Top Match Header: League, Date & Status Badges */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-base sm:text-lg shrink-0">{match.leagueBadge}</span>
          <div className="truncate">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              {match.league}
            </span>
            <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
              ({match.leagueCountry})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {match.isBanker && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px] uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              BANKER
            </span>
          )}

          {match.isVIP && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[10px] uppercase flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
              VIP TICKET
            </span>
          )}

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{match.matchDate}, {match.matchTime}</span>
          </div>
        </div>
      </div>

      {/* Main Match Body */}
      <div className="p-3.5 sm:p-5">
        {/* Teams Display */}
        <div className="grid grid-cols-7 items-center gap-2 mb-4">
          {/* Home Team */}
          <div className="col-span-3 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-slate-200 shrink-0">
                {match.homeTeam.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="font-extrabold text-sm sm:text-base text-white truncate">
                  {match.homeTeam}
                </p>
                {/* Form Dots */}
                <div className="flex items-center gap-1 mt-1">
                  {match.homeForm.map((f, i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center ${
                        f === 'W'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : f === 'D'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center VS Indicator */}
          <div className="col-span-1 text-center">
            <span className="inline-block px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 tracking-wider">
              VS
            </span>
          </div>

          {/* Away Team */}
          <div className="col-span-3 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="truncate">
                <p className="font-extrabold text-sm sm:text-base text-white truncate">
                  {match.awayTeam}
                </p>
                {/* Form Dots */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  {match.awayForm.map((f, i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center ${
                        f === 'W'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : f === 'D'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-slate-200 shrink-0">
                {match.awayTeam.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Box or Locked VIP Teaser */}
        {isLocked ? (
          <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 p-4 text-center my-3">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/50 flex flex-col items-center justify-center p-3 z-10">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mb-2">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-black text-amber-300 text-sm sm:text-base tracking-tight mb-1">
                SEIJO58 VIP HIGH-VALUE PICK
              </h4>
              <p className="text-xs text-slate-300 max-w-xs mb-3">
                Locked: High odds mathematical banker (Estimated Odds: <strong>{match.odds.toFixed(2)}</strong>) with 92%+ historical win probability.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={onOpenPayment}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-950/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  <span>Unlock VIP (Momo: 0764220155)</span>
                </button>
              </div>
            </div>

            {/* Blurred placeholder underneath */}
            <div className="filter blur-md opacity-30 select-none pointer-events-none">
              <div className="h-6 bg-amber-500/20 rounded mb-2"></div>
              <div className="h-10 bg-slate-800 rounded"></div>
            </div>
          </div>
        ) : (
          /* Unlocked Prediction Details */
          <div className="space-y-3">
            {/* Primary Recommended Tip Banner */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    SEIJO58 Algorithm Tip:
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {match.predictionType}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-400 tracking-tight">
                  {match.predictionSelection}
                </div>
              </div>

              {/* Odds Button & Confidence Indicator */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 shrink-0">
                {/* Confidence Bar */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-200">
                    <Percent className="w-3 h-3 text-amber-400" />
                    <span>{match.confidence}% Win Prob</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 ml-auto">
                    <div 
                      className={`h-full rounded-full ${
                        match.confidence >= 90 
                          ? 'bg-emerald-500' 
                          : match.confidence >= 85 
                          ? 'bg-teal-400' 
                          : 'bg-amber-400'
                      }`} 
                      style={{ width: `${match.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Add to Bet Slip Button */}
                <button
                  id={`btn-add-slip-${match.id}`}
                  onClick={() => handleAddCustomSelection(match.predictionType, match.predictionSelection, match.odds)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    isSelectedInSlip
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 active:scale-95'
                  }`}
                >
                  {isSelectedInSlip ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>IN SLIP ({match.odds.toFixed(2)})</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>ODDS {match.odds.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick 1X2 and Goals Market Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
              <button
                onClick={() => handleAddCustomSelection('1X2', `1 (${match.homeTeam})`, match.marketOdds.homeWin)}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 p-2 rounded-lg text-center transition-colors group"
              >
                <span className="text-[10px] text-slate-400 font-semibold block group-hover:text-slate-200">1 (Home)</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400">{match.marketOdds.homeWin.toFixed(2)}</span>
              </button>

              <button
                onClick={() => handleAddCustomSelection('1X2', 'X (Draw)', match.marketOdds.draw)}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 p-2 rounded-lg text-center transition-colors group"
              >
                <span className="text-[10px] text-slate-400 font-semibold block group-hover:text-slate-200">X (Draw)</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400">{match.marketOdds.draw.toFixed(2)}</span>
              </button>

              <button
                onClick={() => handleAddCustomSelection('1X2', `2 (${match.awayTeam})`, match.marketOdds.awayWin)}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 p-2 rounded-lg text-center transition-colors group"
              >
                <span className="text-[10px] text-slate-400 font-semibold block group-hover:text-slate-200">2 (Away)</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400">{match.marketOdds.awayWin.toFixed(2)}</span>
              </button>

              <button
                onClick={() => handleAddCustomSelection('Over/Under', 'Over 2.5 Goals', match.marketOdds.over25)}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 p-2 rounded-lg text-center transition-colors group"
              >
                <span className="text-[10px] text-slate-400 font-semibold block group-hover:text-slate-200">Over 2.5</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400">{match.marketOdds.over25.toFixed(2)}</span>
              </button>

              <button
                onClick={() => handleAddCustomSelection('BTTS', 'Both Teams Score (Yes)', match.marketOdds.bttsYes)}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 p-2 rounded-lg text-center transition-colors group col-span-3 sm:col-span-1"
              >
                <span className="text-[10px] text-slate-400 font-semibold block group-hover:text-slate-200">BTTS Yes</span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400">{match.marketOdds.bttsYes.toFixed(2)}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions: AI Reasoning Accordion & Copy Share */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExpanded ? 'Hide AI Analysis' : 'View AI Match Analysis & H2H'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleCopyTip}
            className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors font-medium text-[11px]"
            title="Copy Tip to share on Telegram/WhatsApp"
          >
            {copiedTip ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share Tip</span>
              </>
            )}
          </button>
        </div>

        {/* Expanded Analysis Drawer */}
        {isExpanded && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5 animate-fadeIn">
            <div>
              <p className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                SEIJO58 Algorithm Verdict & Tactical Breakdown
              </p>
              <p className="leading-relaxed text-slate-300">
                {match.aiAnalysis}
              </p>
            </div>

            {match.keyInsights && match.keyInsights.length > 0 && (
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                  Key Statistical Indicators
                </p>
                <ul className="space-y-1">
                  {match.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>H2H History: <strong className="text-slate-200">{match.h2hSummary}</strong></span>
              <span className="text-emerald-400 font-semibold">Reliability: High</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
