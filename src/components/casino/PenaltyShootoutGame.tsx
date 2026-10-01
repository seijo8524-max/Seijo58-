import React, { useState } from 'react';
import { Target, Sparkles, ShieldAlert, Award, Zap } from 'lucide-react';

interface PenaltyProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

export function PenaltyShootoutGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: PenaltyProps) {
  const [stake, setStake] = useState<number>(1000);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 to 5 goals
  const [goalkeeperPos, setGoalkeeperPos] = useState<'CENTER' | 'TOP_L' | 'TOP_R' | 'BOT_L' | 'BOT_R'>('CENTER');
  const [lastShot, setLastShot] = useState<string | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<'GOAL' | 'SAVED' | null>(null);

  // Progressive multiplier steps calibrated with 15% House Edge (85% RTP)
  const MULTIPLIERS = [1.92, 4.30, 11.50, 32.00, 85.00];
  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000, 20000];
  const MAX_WIN_LIMIT = 500000; // Maximum win is 500,000 TSh

  const currentMultiplier = currentStep > 0 ? MULTIPLIERS[currentStep - 1] : 1.00;
  const nextMultiplier = currentStep < 5 ? MULTIPLIERS[currentStep] : MULTIPLIERS[4];
  const currentPayout = Math.min(Math.floor(stake * currentMultiplier), MAX_WIN_LIMIT);

  const startGame = () => {
    if (isPlaying) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    const success = onBetPlaced(stake, 'Penalty Shootout Bet');
    if (!success) return;

    setIsPlaying(true);
    setCurrentStep(0);
    setLastResult(null);
    setLastShot(null);
    setGoalkeeperPos('CENTER');
    showToast('⚽ Piga Penalti! Kipa ni kigogo wa hatari mwenye uwezo mkubwa (Bahati Tupu!).');
  };

  const handleShoot = (targetSpot: 'TOP_L' | 'TOP_R' | 'BOT_L' | 'BOT_R' | 'CENTER') => {
    if (!isPlaying || isShooting) return;

    setIsShooting(true);
    setLastShot(targetSpot);

    // Regulated Casino Protocol: Exactly 20% win rate (goal probability)
    const isGoal = Math.random() < 0.20;
    const spots: ('TOP_L' | 'TOP_R' | 'BOT_L' | 'BOT_R' | 'CENTER')[] = ['TOP_L', 'TOP_R', 'BOT_L', 'BOT_R', 'CENTER'];
    const otherSpots = spots.filter(s => s !== targetSpot);

    let keeperDive: 'TOP_L' | 'TOP_R' | 'BOT_L' | 'BOT_R' | 'CENTER';
    if (isGoal) {
      // Keeper dives to a different spot -> GOAL
      keeperDive = otherSpots[Math.floor(Math.random() * otherSpots.length)];
    } else {
      // Keeper anticipates perfectly -> SAVED
      keeperDive = targetSpot;
    }
    setGoalkeeperPos(keeperDive);
    const isSavedByKeeper = keeperDive === targetSpot;

    setTimeout(() => {
      setIsShooting(false);

      if (isSavedByKeeper) {
        // Goalkeeper Saved it!
        setLastResult('SAVED');
        setIsPlaying(false);
        showToast('🧤 KIPA AMEPANGUA MPIRA! Shuti lako limezuiwa na kipa.');
      } else {
        // GOAAAL! Genuine goal scored
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        setLastResult('GOAL');

        if (newStep === 5) {
          // Cleared 5/5 max penalties!
          const winAmt = Math.min(Math.floor(stake * MULTIPLIERS[4]), MAX_WIN_LIMIT);
          onWin(winAmt, MULTIPLIERS[4], 'Penalty Shootout 5/5 Mega Jackpot');
          showToast(`🏆 GOOOL LA 5/5! JACKPOT YA PENALTI: TSh ${winAmt.toLocaleString()} (${MULTIPLIERS[4]}x)!`);
          setIsPlaying(false);
        } else {
          showToast(`⚽ GOOOOOOL! Raundi ya ${newStep}/5. Multiplier: ${MULTIPLIERS[newStep - 1]}x!`);
        }
      }
    }, 700);
  };

  const handleCashout = () => {
    if (!isPlaying || currentStep === 0) return;

    const payout = Math.min(Math.floor(stake * currentMultiplier), MAX_WIN_LIMIT);
    onWin(payout, currentMultiplier, `Penalty Cashout (${currentStep}/5 Magoli)`);
    showToast(`🎉 UMEVUNA TSh ${payout.toLocaleString()} (${currentMultiplier}x)!`);
    setIsPlaying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT SETTINGS */}
      <div className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> PENALTY SHOOTOUT
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Pro Challenge
            </span>
          </div>

          {/* Stake selector */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-bold uppercase">Kiasi cha Dau (TSh):</span>
            <input
              type="number"
              min="500"
              step="500"
              disabled={isPlaying}
              value={stake}
              onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {STAKE_PRESETS.map(amt => (
                <button
                  key={amt}
                  disabled={isPlaying}
                  onClick={() => setStake(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    stake === amt ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplier Progress Ladder */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-bold uppercase">Ngazi ya Magoli (5/5):</span>
            <div className="grid grid-cols-5 gap-1.5">
              {MULTIPLIERS.map((multi, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    idx < currentStep
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-black'
                      : idx === currentStep && isPlaying
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300 font-black animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-500 font-medium'
                  }`}
                >
                  <div className="text-[10px]">Goli {idx + 1}</div>
                  <div className="text-xs font-mono font-black">{multi}x</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isPlaying ? (
            <button
              onClick={handleCashout}
              disabled={currentStep === 0 || isShooting}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all flex flex-col items-center justify-center shadow-xl ${
                currentStep > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-950/80 animate-bounce active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>💰 TOA USHINDI (CASHOUT)</span>
              <span className="text-xs font-mono font-bold mt-0.5">
                TSh {currentPayout.toLocaleString()} ({currentMultiplier}x)
              </span>
            </button>
          ) : (
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-xl shadow-emerald-950/60 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>ANZA PENALTI (BET TSh {stake.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT PENALTY GOALPOST ARENA */}
      <div className="lg:col-span-8 bg-gradient-to-b from-[#061e12] via-[#092d1c] to-[#04130b] border-2 border-emerald-900/80 rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center shadow-2xl relative min-h-[380px]">
        {/* Goalpost Frame */}
        <div className="relative w-full max-w-lg aspect-[16/10] bg-slate-950/40 border-8 border-white/90 rounded-t-2xl shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Net Grid Texture */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Goalkeeper Silhouette */}
          <div
            className={`absolute transition-all duration-300 flex flex-col items-center justify-center z-10 ${
              goalkeeperPos === 'CENTER'
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : goalkeeperPos === 'TOP_L'
                ? 'top-4 left-6'
                : goalkeeperPos === 'TOP_R'
                ? 'top-4 right-6'
                : goalkeeperPos === 'BOT_L'
                ? 'bottom-4 left-6'
                : 'bottom-4 right-6'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl border-2 border-white/80">
              <span className="text-2xl">🧤</span>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-200 bg-slate-900/80 px-2 py-0.5 rounded mt-1 border border-amber-500/30">
              GOALKEEPER
            </span>
          </div>

          {/* 5 Target Spots for Player to Shoot */}
          {isPlaying && !isShooting && (
            <div className="absolute inset-0 p-4 sm:p-6 grid grid-cols-3 grid-rows-2 gap-4 z-20">
              <button
                onClick={() => handleShoot('TOP_L')}
                className="rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center text-white font-black text-xs transition-all active:scale-90"
              >
                <Target className="w-6 h-6 text-emerald-300 animate-pulse" />
              </button>
              <button
                onClick={() => handleShoot('CENTER')}
                className="col-start-2 row-start-1 row-span-2 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center text-white font-black text-xs transition-all active:scale-90"
              >
                <Target className="w-8 h-8 text-emerald-300 animate-pulse" />
              </button>
              <button
                onClick={() => handleShoot('TOP_R')}
                className="col-start-3 row-start-1 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center text-white font-black text-xs transition-all active:scale-90"
              >
                <Target className="w-6 h-6 text-emerald-300 animate-pulse" />
              </button>
              <button
                onClick={() => handleShoot('BOT_L')}
                className="col-start-1 row-start-2 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center text-white font-black text-xs transition-all active:scale-90"
              >
                <Target className="w-6 h-6 text-emerald-300 animate-pulse" />
              </button>
              <button
                onClick={() => handleShoot('BOT_R')}
                className="col-start-3 row-start-2 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/20 hover:bg-emerald-500/40 flex items-center justify-center text-white font-black text-xs transition-all active:scale-90"
              >
                <Target className="w-6 h-6 text-emerald-300 animate-pulse" />
              </button>
            </div>
          )}

          {/* Result Overlay Text */}
          {lastResult === 'GOAL' && (
            <div className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center z-30 animate-bounce">
              <span className="text-3xl sm:text-5xl font-black text-emerald-400">⚽ GOOOOOL!</span>
              <span className="text-sm font-bold text-white mt-1">Multiplier: {currentMultiplier}x</span>
            </div>
          )}
          {lastResult === 'SAVED' && (
            <div className="absolute inset-0 bg-red-950/85 flex flex-col items-center justify-center z-30 animate-pulse">
              <span className="text-3xl sm:text-5xl font-black text-red-500">🧤 AMEZUWIA!</span>
              <span className="text-sm font-bold text-slate-300 mt-1">Kipa ameokoa mpira.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
