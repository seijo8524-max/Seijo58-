import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Flame, 
  Crown, 
  TrendingUp, 
  Award, 
  Calendar, 
  Filter, 
  BarChart2, 
  Percent 
} from 'lucide-react';
import { MatchTip } from '../types';
import { CHANNEL_CONFIG } from '../data/mockMatches';

interface MatchHistoryViewProps {
  historyMatches: MatchTip[];
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({
  historyMatches,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'free' | 'vip'>('all');

  const filteredList = historyMatches.filter(m => {
    if (filterType === 'free') return !m.isVIP;
    if (filterType === 'vip') return m.isVIP;
    return true;
  });

  const wonCount = historyMatches.filter(m => m.result?.outcome === 'WON').length;
  const winRatePercent = Math.round((wonCount / (historyMatches.length || 1)) * 100);
  const totalOddsSum = historyMatches.reduce((acc, curr) => acc + (curr.result?.outcome === 'WON' ? curr.odds : 0), 0);
  const profitUnits = (totalOddsSum - historyMatches.length).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Statistics Analytics Card */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED SETTLED ARCHIVE
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                100% Transparent Record
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              SEIJO58 Official Match History & Win Metrics
            </h2>
            <p className="text-xs text-slate-300">
              Every past tip is permanently recorded with exact final scores, odds multipliers, and proof of green outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-emerald-900/40 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] text-emerald-300 uppercase font-extrabold block">Current Streak</span>
              <span className="text-base font-black text-emerald-400">🔥 7 WON IN A ROW</span>
            </div>
          </div>
        </div>

        {/* Statistical Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span>Overall Win Rate</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{winRatePercent}%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{wonCount} Won / {historyMatches.length} Settled</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>VIP Club Win Rate</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{CHANNEL_CONFIG.vipTipsWinRate}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">High Multiplier Slips</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Profit Yield</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-300">+{profitUnits} Units</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Level Stake ROI +34%</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>Avg Odds Smashed</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-sky-400">2.68 Odds</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Single & Acca blend</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Results ({historyMatches.length})
          </button>

          <button
            onClick={() => setFilterType('vip')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'vip'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Crown className="w-3 h-3" />
            VIP Slips ({historyMatches.filter(m => m.isVIP).length})
          </button>

          <button
            onClick={() => setFilterType('free')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'free'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Flame className="w-3 h-3" />
            Free Banker Tips ({historyMatches.filter(m => !m.isVIP).length})
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing {filteredList.length} verified fixtures
        </span>
      </div>

      {/* History Fixtures Feed */}
      <div className="space-y-3">
        {filteredList.map(match => (
          <div
            key={match.id}
            id={`history-card-${match.id}`}
            className="bg-[#0b101c] border border-slate-800/90 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all space-y-3"
          >
            {/* Header: League & Settled Date */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-base">{match.leagueBadge}</span>
                <span className="font-bold text-slate-200">{match.league}</span>
                {match.isVIP && (
                  <span className="px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase border border-amber-500/30">
                    VIP TICKET
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{match.result?.settledAt || match.matchDate}</span>
              </div>
            </div>

            {/* Teams, Result Scores & Green WON Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
              {/* Teams & Scores */}
              <div className="sm:col-span-6 flex items-center justify-between sm:justify-start gap-4">
                <div className="space-y-1">
                  <p className="font-extrabold text-sm sm:text-base text-white">
                    {match.homeTeam}
                  </p>
                  <p className="font-extrabold text-sm sm:text-base text-white">
                    {match.awayTeam}
                  </p>
                </div>

                {/* Scoreline */}
                {match.result && (
                  <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-center font-black text-emerald-400 text-sm sm:text-base">
                    <div>{match.result.homeScore}</div>
                    <div>{match.result.awayScore}</div>
                  </div>
                )}
              </div>

              {/* Prediction Pick */}
              <div className="sm:col-span-4 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  Tip Selection: {match.predictionType}
                </div>
                <div className="text-xs sm:text-sm font-black text-emerald-300 truncate">
                  {match.predictionSelection}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  Odds: <strong className="text-white">{match.odds.toFixed(2)}</strong> (Conf: {match.confidence}%)
                </div>
              </div>

              {/* Status Outcome Badge */}
              <div className="sm:col-span-2 flex sm:justify-end">
                {match.result?.outcome === 'WON' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase shadow-md shadow-emerald-950/50">
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>WON (+{match.odds.toFixed(2)})</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs uppercase border border-rose-500/40">
                    <span>LOST</span>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Result Note */}
            {match.aiAnalysis && (
              <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                {match.aiAnalysis}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
