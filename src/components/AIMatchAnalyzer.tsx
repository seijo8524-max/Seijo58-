import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Percent, 
  PlusCircle, 
  CheckCircle2, 
  BarChart3, 
  Cpu, 
  ShieldCheck, 
  Dices 
} from 'lucide-react';
import { POPULAR_TEAMS, generateCustomMatchTip } from '../utils/oddsEngine';
import { MatchTip, BetSlipItem } from '../types';

interface AIMatchAnalyzerProps {
  onAddToSlip: (item: BetSlipItem) => void;
  isInSlip: (matchId: string, selection: string) => boolean;
}

export const AIMatchAnalyzer: React.FC<AIMatchAnalyzerProps> = ({
  onAddToSlip,
  isInSlip,
}) => {
  const [homeTeam, setHomeTeam] = useState('Real Madrid');
  const [awayTeam, setAwayTeam] = useState('Manchester City');
  const [customLeague, setCustomLeague] = useState('UEFA Champions League');
  const [analyzedTip, setAnalyzedTip] = useState<MatchTip | null>(() => 
    generateCustomMatchTip('Real Madrid', 'Manchester City', 'UEFA Champions League')
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = generateCustomMatchTip(homeTeam.trim(), awayTeam.trim(), customLeague);
      setAnalyzedTip(result);
      setIsAnalyzing(false);
    }, 600);
  };

  const handleQuickMatch = (home: string, away: string, league: string) => {
    setHomeTeam(home);
    setAwayTeam(away);
    setCustomLeague(league);
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = generateCustomMatchTip(home, away, league);
      setAnalyzedTip(result);
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 border-2 border-sky-500/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            SEIJO58 AI ODDS ENGINE
          </span>
          <span className="text-xs text-sky-400 font-bold">
            Poisson & xG Probabilistic Simulation Model
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Algorithmic Match & Market Odds Generator
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Simulate any head-to-head match across European and global leagues. Our model calculates bookmaker-grade fair value odds, goal expectancies, and highest probability markets.
        </p>

        {/* Quick Simulation Presets */}
        <div className="pt-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
            Popular High-Profile Matchups:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleQuickMatch('Arsenal', 'Chelsea', 'Premier League')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Arsenal vs Chelsea
            </button>
            <button
              onClick={() => handleQuickMatch('Barcelona', 'Bayern Munich', 'UEFA Champions League')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Barcelona vs Bayern Munich
            </button>
            <button
              onClick={() => handleQuickMatch('Liverpool', 'Inter Milan', 'Champions League')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Liverpool vs Inter Milan
            </button>
            <button
              onClick={() => handleQuickMatch('Al Ahly SC', 'Al Nassr', 'Continental Clash')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Al Ahly vs Al Nassr
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Match Generator Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <form onSubmit={handleRunAnalysis} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Home Team
              </label>
              <input
                type="text"
                list="teams-list"
                value={homeTeam}
                onChange={e => setHomeTeam(e.target.value)}
                placeholder="e.g. Real Madrid"
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Away Team
              </label>
              <input
                type="text"
                list="teams-list"
                value={awayTeam}
                onChange={e => setAwayTeam(e.target.value)}
                placeholder="e.g. Manchester City"
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                League / Competition
              </label>
              <input
                type="text"
                value={customLeague}
                onChange={e => setCustomLeague(e.target.value)}
                placeholder="e.g. UEFA Champions League"
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
            </div>

            <datalist id="teams-list">
              {POPULAR_TEAMS.map(t => (
                <option key={t.name} value={t.name} />
              ))}
            </datalist>
          </div>

          <div className="flex justify-end">
            <button
              id="btn-run-ai-analysis"
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs tracking-wider shadow-lg shadow-sky-950/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Poisson Probabilities...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>RUN SEIJO58 ODDS SIMULATION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Match Results Display */}
      {analyzedTip && (
        <div className="bg-[#0c1220] border-2 border-sky-500/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5">
          {/* Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-wider block">
                {analyzedTip.league} • AI Simulated Output
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {analyzedTip.homeTeam} vs {analyzedTip.awayTeam}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
                {analyzedTip.confidence}% Confidence Rating
              </span>
            </div>
          </div>

          {/* Primary Banker Verdict Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-slate-950 border border-emerald-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Algorithm Recommended Value Bet:
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-300">
                {analyzedTip.predictionSelection} ({analyzedTip.predictionType})
              </div>
              <p className="text-xs text-slate-300">
                {analyzedTip.aiAnalysis}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fair Odds</span>
                <span className="text-xl font-black text-emerald-400">{analyzedTip.odds.toFixed(2)}</span>
              </div>

              <button
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: analyzedTip.predictionType,
                  selection: analyzedTip.predictionSelection,
                  odds: analyzedTip.odds,
                })}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  isInSlip(analyzedTip.id, analyzedTip.predictionSelection)
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40'
                }`}
              >
                {isInSlip(analyzedTip.id, analyzedTip.predictionSelection) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>In Bet Slip</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Add to Slip</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Full Calculated Market Odds Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              Comprehensive Bookmaker Market Odds:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* 1X2 Home */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: '1X2',
                  selection: `1 (${analyzedTip.homeTeam})`,
                  odds: analyzedTip.marketOdds.homeWin,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">1 (Home Win)</span>
                <span className="text-sm font-black text-white">{analyzedTip.marketOdds.homeWin.toFixed(2)}</span>
              </div>

              {/* 1X2 Draw */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: '1X2',
                  selection: 'X (Draw)',
                  odds: analyzedTip.marketOdds.draw,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">X (Draw)</span>
                <span className="text-sm font-black text-white">{analyzedTip.marketOdds.draw.toFixed(2)}</span>
              </div>

              {/* 1X2 Away */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: '1X2',
                  selection: `2 (${analyzedTip.awayTeam})`,
                  odds: analyzedTip.marketOdds.awayWin,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">2 (Away Win)</span>
                <span className="text-sm font-black text-white">{analyzedTip.marketOdds.awayWin.toFixed(2)}</span>
              </div>

              {/* Over 2.5 */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: 'Over/Under',
                  selection: 'Over 2.5 Goals',
                  odds: analyzedTip.marketOdds.over25,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">Over 2.5 Goals</span>
                <span className="text-sm font-black text-white">{analyzedTip.marketOdds.over25.toFixed(2)}</span>
              </div>

              {/* BTTS Yes */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: 'BTTS',
                  selection: 'Both Teams Score (Yes)',
                  odds: analyzedTip.marketOdds.bttsYes,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">BTTS - YES</span>
                <span className="text-sm font-black text-emerald-400">{analyzedTip.marketOdds.bttsYes.toFixed(2)}</span>
              </div>

              {/* Double Chance 1X */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: 'Double Chance',
                  selection: '1X (Home or Draw)',
                  odds: analyzedTip.marketOdds.doubleChance1X,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">1X Double Chance</span>
                <span className="text-sm font-black text-white">{analyzedTip.marketOdds.doubleChance1X.toFixed(2)}</span>
              </div>

              {/* Under 2.5 */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: 'Over/Under',
                  selection: 'Under 2.5 Goals',
                  odds: analyzedTip.marketOdds.under25,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">Under 2.5 Goals</span>
                <span className="text-sm font-black text-white">{analyzedTip.marketOdds.under25.toFixed(2)}</span>
              </div>

              {/* Correct Score 2-1 */}
              <div 
                onClick={() => onAddToSlip({
                  matchId: analyzedTip.id,
                  homeTeam: analyzedTip.homeTeam,
                  awayTeam: analyzedTip.awayTeam,
                  league: analyzedTip.league,
                  matchTime: analyzedTip.matchTime,
                  predictionType: 'Correct Score',
                  selection: 'Correct Score 2 - 1',
                  odds: analyzedTip.marketOdds.correctScore?.['2-1'] || 7.5,
                })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 font-semibold block">Score 2 - 1</span>
                <span className="text-sm font-black text-amber-400">
                  {(analyzedTip.marketOdds.correctScore?.['2-1'] || 7.5).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
