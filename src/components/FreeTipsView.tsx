import React, { useState } from 'react';
import { MatchTip, VIPSubscription, BetSlipItem } from '../types';
import { MatchCard } from './MatchCard';
import { Flame, Filter, Calendar, Sparkles, PlusCircle, CheckCircle2 } from 'lucide-react';
import { calculateAccumulatorOdds } from '../utils/oddsEngine';

interface FreeTipsViewProps {
  todayMatches: MatchTip[];
  tomorrowMatches: MatchTip[];
  vipSub: VIPSubscription;
  onOpenPayment: () => void;
  onAddToSlip: (item: BetSlipItem) => void;
  onAddMultipleToSlip: (items: BetSlipItem[]) => void;
  isInSlip: (matchId: string, selection: string) => boolean;
}

export const FreeTipsView: React.FC<FreeTipsViewProps> = ({
  todayMatches,
  tomorrowMatches,
  vipSub,
  onOpenPayment,
  onAddToSlip,
  onAddMultipleToSlip,
  isInSlip,
}) => {
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const currentList = selectedDay === 'today' ? todayMatches : tomorrowMatches;
  const freeMatches = currentList.filter(m => !m.isVIP);

  const leagues = ['all', ...Array.from(new Set(freeMatches.map(m => m.league)))];

  const filteredMatches = selectedLeague === 'all'
    ? freeMatches
    : freeMatches.filter(m => m.league === selectedLeague);

  // Banker of the day
  const bankerMatch = freeMatches.find(m => m.isBanker) || freeMatches[0];

  // Combined Free Accumulator calculation
  const freeSlipItems: BetSlipItem[] = freeMatches.map(m => ({
    matchId: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    league: m.league,
    matchTime: `${m.matchDate} ${m.matchTime}`,
    predictionType: m.predictionType,
    selection: m.predictionSelection,
    odds: m.odds,
  }));

  const totalFreeOdds = calculateAccumulatorOdds(freeMatches.map(m => m.odds));

  const handleAddAllFreeAcca = () => {
    onAddMultipleToSlip(freeSlipItems);
  };

  return (
    <div className="space-y-6">
      {/* Date Toggle & Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDay('today')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              selectedDay === 'today'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Today's Predictions ({todayMatches.filter(m => !m.isVIP).length})
          </button>

          <button
            onClick={() => setSelectedDay('tomorrow')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              selectedDay === 'tomorrow'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Tomorrow's Early Tips ({tomorrowMatches.filter(m => !m.isVIP).length})
          </button>
        </div>

        {/* 1-Click Acca Generator CTA */}
        {freeMatches.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Daily Free Multiplier</span>
              <span className="text-sm font-black text-emerald-400">{totalFreeOdds.toFixed(2)} Combined Odds</span>
            </div>
            <button
              onClick={handleAddAllFreeAcca}
              className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Load Full Free Acca</span>
            </button>
          </div>
        )}
      </div>

      {/* Daily Banker Spotlight Card */}
      {bankerMatch && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl shadow-emerald-950/30">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                SEIJO58 BANKER OF THE DAY
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                Highest Statistical Probability
              </span>
            </div>

            <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
              Confidence: {bankerMatch.confidence}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <div className="sm:col-span-2 space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase">{bankerMatch.league} • {bankerMatch.matchTime}</p>
              <h3 className="text-base sm:text-lg font-black text-white">
                {bankerMatch.homeTeam} <span className="text-emerald-400 font-normal">vs</span> {bankerMatch.awayTeam}
              </h3>
              <p className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Banker Pick: <span className="underline decoration-emerald-500 font-extrabold">{bankerMatch.predictionSelection}</span> ({bankerMatch.odds.toFixed(2)} Odds)
              </p>
            </div>

            <div className="flex sm:justify-end">
              <button
                onClick={() => onAddToSlip({
                  matchId: bankerMatch.id,
                  homeTeam: bankerMatch.homeTeam,
                  awayTeam: bankerMatch.awayTeam,
                  league: bankerMatch.league,
                  matchTime: `${bankerMatch.matchDate} ${bankerMatch.matchTime}`,
                  predictionType: bankerMatch.predictionType,
                  selection: bankerMatch.predictionSelection,
                  odds: bankerMatch.odds,
                })}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                  isInSlip(bankerMatch.id, bankerMatch.predictionSelection)
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/50 hover:scale-105 active:scale-95'
                }`}
              >
                {isInSlip(bankerMatch.id, bankerMatch.predictionSelection) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Banker in Slip</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Banker @ {bankerMatch.odds.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* League Filter Pills */}
      {leagues.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            League:
          </span>
          {leagues.map(lg => (
            <button
              key={lg}
              onClick={() => setSelectedLeague(lg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedLeague === lg
                  ? 'bg-slate-200 text-slate-950 shadow'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {lg === 'all' ? 'All Leagues' : lg}
            </button>
          ))}
        </div>
      )}

      {/* List of Match Cards */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-300 text-sm">No matches found for this filter</h4>
            <p className="text-xs text-slate-500 mt-1">Try selecting another league or day tab.</p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              vipSub={vipSub}
              onOpenPayment={onOpenPayment}
              onAddToSlip={onAddToSlip}
              isInSlip={isInSlip}
            />
          ))
        )}
      </div>
    </div>
  );
};
