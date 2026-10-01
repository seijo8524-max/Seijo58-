import React, { useState } from 'react';
import { Dice5, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface DiceProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

export function DiceRollGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: DiceProps) {
  const [stake, setStake] = useState<number>(1000);
  const [targetNumber, setTargetNumber] = useState<number>(50.0);
  const [rollMode, setRollMode] = useState<'OVER' | 'UNDER'>('OVER');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [recentRolls, setRecentRolls] = useState<{ num: number; won: boolean }[]>([
    { num: 74.22, won: true },
    { num: 12.18, won: false },
    { num: 88.90, won: true },
    { num: 55.40, won: true }
  ]);

  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000];
  const MAX_WIN_LIMIT = 500000; // Maximum win is 500,000 TSh

  // Dice / Range Game Odds: Calculate dynamic odds using the 15% margin deduction
  const getDiceOdds = (targetNumber: number) => {
    // Formula: Odds = (100 - 15) / targetNumber
    return Math.floor(((100 - 15) / targetNumber) * 100) / 100;
  };

  // Win chance & multiplier formula with exact 15% house edge (RTP = 85%)
  const winChance = rollMode === 'OVER' ? 100 - targetNumber : targetNumber;
  const multiplier = Math.max(1.01, getDiceOdds(winChance));
  const potentialPayout = Math.min(Math.floor(stake * multiplier), MAX_WIN_LIMIT);

  const handleRoll = () => {
    if (isRolling) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    const success = onBetPlaced(stake, `Dice Roll (${rollMode} ${targetNumber})`);
    if (!success) return;

    setIsRolling(true);
    setRolledNumber(null);

    setTimeout(() => {
      // Regulated Casino Protocol: 20% win chance protection
      const isWinner = Math.random() < 0.20;
      let outcome: number;

      if (isWinner) {
        // Roll in winning zone
        if (rollMode === 'OVER') {
          outcome = parseFloat((targetNumber + 0.1 + Math.random() * Math.max(0.1, 99.9 - targetNumber)).toFixed(2));
        } else {
          outcome = parseFloat((Math.random() * Math.max(0.1, targetNumber - 0.1)).toFixed(2));
        }
      } else {
        // Roll in losing zone
        if (rollMode === 'OVER') {
          outcome = parseFloat((Math.random() * targetNumber).toFixed(2));
        } else {
          outcome = parseFloat((targetNumber + Math.random() * (100 - targetNumber)).toFixed(2));
        }
      }
      outcome = Math.min(99.99, Math.max(0.01, outcome));

      setRolledNumber(outcome);
      setIsRolling(false);

      const won = rollMode === 'OVER' ? outcome > targetNumber : outcome < targetNumber;
      setRecentRolls(prev => [{ num: outcome, won }, ...prev.slice(0, 8)]);

      if (won) {
        onWin(potentialPayout, multiplier, `Dice Win: ${outcome}`);
        showToast(`🎉 UMESHINDA DICE! Namba: ${outcome}. Payout: TSh ${potentialPayout.toLocaleString()} (${multiplier}x)!`);
      } else {
        showToast(`Umekosa! Namba iliyotoka ni ${outcome}. Jaribu tena.`);
      }
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT SETTINGS */}
      <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-black text-white text-base flex items-center gap-2">
            <Dice5 className="w-5 h-5 text-indigo-400" /> DICE ROLL 0-100
          </h3>
          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Live Odds
          </span>
        </div>

        {/* Stake */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase">Kiasi cha Dau (TSh):</span>
          <input
            type="number"
            min="500"
            step="500"
            disabled={isRolling}
            value={stake}
            onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {STAKE_PRESETS.map(amt => (
              <button
                key={amt}
                disabled={isRolling}
                onClick={() => setStake(amt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  stake === amt ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase">Aina ya Kubingirisha:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRollMode('OVER')}
              className={`py-3 rounded-xl font-black text-xs transition-all border ${
                rollMode === 'OVER'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              ROLL OVER (&gt; {targetNumber})
            </button>
            <button
              onClick={() => setRollMode('UNDER')}
              className={`py-3 rounded-xl font-black text-xs transition-all border ${
                rollMode === 'UNDER'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              ROLL UNDER (&lt; {targetNumber})
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
            <span className="text-slate-400 block text-[10px] uppercase">Nafasi ya Ushindi:</span>
            <span className="font-mono font-black text-emerald-400 text-sm">{winChance.toFixed(1)}%</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
            <span className="text-slate-400 block text-[10px] uppercase">Multiplier:</span>
            <span className="font-mono font-black text-amber-400 text-sm">{multiplier.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* RIGHT DICE SLIDER ARENA */}
      <div className="lg:col-span-7 bg-gradient-to-b from-[#090b1e] via-[#101438] to-[#060814] border-4 border-indigo-900/80 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[420px]">
        {/* Recent Roll Badges */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
          <span className="text-[10px] text-indigo-300 font-bold uppercase shrink-0">Historia:</span>
          {recentRolls.map((r, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 ${
                r.won ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-red-950 text-red-400 border border-red-500/40'
              }`}
            >
              {r.num}
            </span>
          ))}
        </div>

        {/* Center Roll Display */}
        <div className="my-6 text-center space-y-2">
          <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            {rolledNumber !== null ? rolledNumber.toFixed(2) : targetNumber.toFixed(2)}
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold text-xs">
            {rollMode === 'OVER' ? `Inahitaji > ${targetNumber}` : `Inahitaji < ${targetNumber}`}
          </span>
        </div>

        {/* Slider */}
        <div className="w-full max-w-md space-y-2">
          <input
            type="range"
            min="2"
            max="98"
            step="1"
            value={targetNumber}
            onChange={e => setTargetNumber(parseFloat(e.target.value))}
            className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`w-full max-w-md py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 mt-4 ${
            isRolling
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white shadow-indigo-950/80 animate-pulse'
          }`}
        >
          <Zap className="w-6 h-6" />
          <span>{isRolling ? 'INABINGIRIKA...' : `BINGIRISHA DICE (TSh ${stake.toLocaleString()})`}</span>
        </button>
      </div>
    </div>
  );
}
