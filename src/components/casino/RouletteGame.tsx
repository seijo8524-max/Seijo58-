import React, { useState } from 'react';
import { Disc, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface RouletteProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
// 38 pockets in American High Difficulty Roulette: 0 to 36, and 37 represents '00'

export function RouletteGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: RouletteProps) {
  const [stake, setStake] = useState<number>(1000);
  const [gameMode, setGameMode] = useState<'WHEEL' | 'ROULETTE'>('WHEEL');
  const [betType, setBetType] = useState<'RED' | 'BLACK' | 'EVEN' | 'ODD' | 'NUMBER'>('RED');
  const [selectedNumber, setSelectedNumber] = useState<number>(7);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const [recentNumbers, setRecentNumbers] = useState<number[]>([14, 0, 32, 19, 37, 26, 3]);

  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000];
  const MAX_WIN_LIMIT = 500000; // Maximum win is 500,000 TSh

  // Lucky Wheel / Roulette Weighted Odds: Expected Value (EV) = 0.85 (15% House Edge)
  const spinWheelOutcome = (): number => {
    const rand = Math.random() * 100;
    if (rand < 45) return 0.0;    // 45% chance: Loss (0x)
    if (rand < 70) return 0.5;    // 25% chance: Partial return (0.5x)
    if (rand < 88) return 1.2;    // 18% chance: Small win (1.2x)
    if (rand < 96) return 2.0;    // 8% chance: Double (2.0x)
    if (rand < 99.2) return 5.0;  // 3.2% chance: (5.0x)
    return 10.0;                  // 0.8% chance: Jackpot (10.0x)
  };

  const handleSpin = () => {
    if (isSpinning) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    if (gameMode === 'WHEEL') {
      const success = onBetPlaced(stake, 'Lucky Wheel Spin (EV = 0.85)');
      if (!success) return;

      setIsSpinning(true);
      setWheelResult(null);

      setTimeout(() => {
        const multi = spinWheelOutcome();
        setWheelResult(multi);
        setIsSpinning(false);

        if (multi > 0) {
          const rawPayout = Math.floor(stake * multi);
          const winAmt = Math.min(rawPayout, MAX_WIN_LIMIT);
          onWin(winAmt, multi, `Lucky Wheel Win (${multi}x)`);
          showToast(`🎉 UMESHINDA GURUDUMU! Multiplier: ${multi}x. Payout: TSh ${winAmt.toLocaleString()}!`);
        } else {
          showToast('Umekosa (0.0x). Zungusha tena upate ushindi!');
        }
      }, 1500);
      return;
    }

    // Classic Roulette Mode
    const betLabel = betType === 'NUMBER' ? `Namba ${selectedNumber === 37 ? '00' : selectedNumber} (30.6x)` : `${betType} (1.70x)`;
    const success = onBetPlaced(stake, `Roulette Bet: ${betLabel}`);
    if (!success) return;

    setIsSpinning(true);
    setWinningNumber(null);

    setTimeout(() => {
      const outcome = Math.floor(Math.random() * 38); // Pure uniform random 0 to 37 (37 = '00')
      setWinningNumber(outcome);
      setRecentNumbers(prev => [outcome, ...prev.slice(0, 8)]);
      setIsSpinning(false);

      const isGreen = outcome === 0 || outcome === 37;
      const isRed = !isGreen && RED_NUMBERS.includes(outcome);
      const isBlack = !isGreen && !isRed;
      const isEven = !isGreen && outcome % 2 === 0;
      const isOdd = !isGreen && outcome % 2 === 1;

      let won = false;
      let multi = 0;

      // 15% House Edge (RTP = 85%) Odds
      if (betType === 'RED' && isRed) {
        won = true;
        multi = 1.70;
      } else if (betType === 'BLACK' && isBlack) {
        won = true;
        multi = 1.70;
      } else if (betType === 'EVEN' && isEven) {
        won = true;
        multi = 1.70;
      } else if (betType === 'ODD' && isOdd) {
        won = true;
        multi = 1.70;
      } else if (betType === 'NUMBER' && outcome === selectedNumber) {
        won = true;
        multi = 30.60;
      }

      const displayOutcome = outcome === 37 ? '00' : outcome.toString();

      if (won) {
        const rawPayout = Math.floor(stake * multi);
        const winAmt = Math.min(rawPayout, MAX_WIN_LIMIT);
        onWin(winAmt, multi, `Roulette Win: Namba ${displayOutcome}`);
        showToast(`🎉 UMESHINDA ROULETTE! Namba ${displayOutcome} imetoka! Payout: TSh ${winAmt.toLocaleString()} (${multi}x)!`);
      } else {
        showToast(`Namba ${displayOutcome} imetoka (${isGreen ? 'Kijani House ' + displayOutcome : isRed ? 'Nyekundu' : 'Nyeusi'}). Jaribu tena!`);
      }
    }, 1500);
  };

  const getNumberColor = (num: number) => {
    if (num === 0 || num === 37) return 'bg-emerald-600 text-white';
    return RED_NUMBERS.includes(num) ? 'bg-red-600 text-white' : 'bg-slate-900 text-white border border-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* MODE SELECTOR */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setGameMode('WHEEL')}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
              gameMode === 'WHEEL'
                ? 'bg-gradient-to-r from-amber-500 to-red-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎡</span> LUCKY WHEEL (EV = 0.85)
          </button>
          <button
            onClick={() => setGameMode('ROULETTE')}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
              gameMode === 'ROULETTE'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" /> AMERICAN ROULETTE (0 & 00)
          </button>
        </div>
        <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          RTP: 85.0% (15% House Edge)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT BETTING BOARD */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              {gameMode === 'WHEEL' ? (
                <><span>🎡</span> LUCKY WHEEL</>
              ) : (
                <><Disc className="w-5 h-5 text-red-500" /> AMERICAN ROULETTE</>
              )}
            </h3>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
              KIKOMO: 500k TSh
            </span>
          </div>

          {/* Stake */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-bold uppercase">Kiasi cha Dau (TSh):</span>
            <input
              type="number"
              min="500"
              step="500"
              disabled={isSpinning}
              value={stake}
              onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-red-500 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {STAKE_PRESETS.map(amt => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => setStake(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    stake === amt ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Wheel Segments Overview or Roulette Bet Selection */}
          {gameMode === 'WHEEL' ? (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Mgawanyo wa Gurudumu (EV = 0.85):</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">0.0x (Loss)</span>
                  <span className="font-mono font-bold text-red-400">45.0%</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">0.5x (Nusu)</span>
                  <span className="font-mono font-bold text-amber-400">25.0%</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">1.2x (Win)</span>
                  <span className="font-mono font-bold text-emerald-400">18.0%</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">2.0x (Double)</span>
                  <span className="font-mono font-bold text-blue-400">8.0%</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">5.0x (Mega)</span>
                  <span className="font-mono font-bold text-purple-400">3.2%</span>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-amber-300 font-black">10.0x (Jackpot)</span>
                  <span className="font-mono font-black text-amber-400">0.8%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Chagua Dau la Roulette:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBetType('RED')}
                  className={`p-3 rounded-xl font-black text-xs transition-all border ${
                    betType === 'RED'
                      ? 'bg-red-600 text-white border-red-400 shadow-lg'
                      : 'bg-red-950/40 text-red-300 border-red-900/50 hover:bg-red-900/50'
                  }`}
                >
                  🔴 NYEKUNDU (1.70x)
                </button>
                <button
                  onClick={() => setBetType('BLACK')}
                  className={`p-3 rounded-xl font-black text-xs transition-all border ${
                    betType === 'BLACK'
                      ? 'bg-slate-950 text-white border-slate-500 shadow-lg'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  ⚫ NYEUSI (1.70x)
                </button>
                <button
                  onClick={() => setBetType('EVEN')}
                  className={`p-3 rounded-xl font-black text-xs transition-all border ${
                    betType === 'EVEN'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  EVEN (1.70x)
                </button>
                <button
                  onClick={() => setBetType('ODD')}
                  className={`p-3 rounded-xl font-black text-xs transition-all border ${
                    betType === 'ODD'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  ODD (1.70x)
                </button>
              </div>

              <button
                onClick={() => setBetType('NUMBER')}
                className={`w-full p-3 rounded-xl font-black text-xs transition-all border ${
                  betType === 'NUMBER'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🎯 NAMBA MOJA KWA MOJA (30.6x JACKPOT)
              </button>

              {betType === 'NUMBER' && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-slate-400 font-bold">Chagua Namba (0, 00, 1-36):</span>
                  <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {Array.from({ length: 38 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedNumber(i)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-black ${
                          selectedNumber === i
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-white'
                            : getNumberColor(i)
                        }`}
                      >
                        {i === 37 ? '00' : i}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT WHEEL ARENA */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#180707] via-[#2d0e0e] to-[#0d0404] border-4 border-red-900/80 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[420px]">
          {/* Recent History */}
          <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Hivi Karibuni:</span>
            {recentNumbers.map((n, idx) => (
              <span
                key={idx}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-black shrink-0 ${getNumberColor(
                  n
                )}`}
              >
                {n}
              </span>
            ))}
          </div>

          {/* Center Wheel Visual */}
          <div className="my-6 relative flex flex-col items-center justify-center">
            <div
              className={`w-52 h-52 sm:w-64 sm:h-64 rounded-full border-8 border-amber-500/80 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex items-center justify-center bg-slate-950 relative ${
                isSpinning ? 'animate-spin' : ''
              }`}
            >
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-red-600 bg-[#090d16] flex items-center justify-center text-center p-2">
                <div className="text-center">
                  {isSpinning ? (
                    <span className="text-4xl animate-bounce">🎡</span>
                  ) : gameMode === 'WHEEL' ? (
                    wheelResult !== null ? (
                      <div className="space-y-1">
                        <div className={`text-4xl sm:text-5xl font-black font-mono ${
                          wheelResult >= 2.0 ? 'text-amber-400 animate-pulse' : wheelResult > 0 ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {wheelResult.toFixed(1)}x
                        </div>
                        <span className="text-[11px] font-black uppercase text-slate-300">
                          {wheelResult === 10.0
                            ? '👑 MEGA JACKPOT!'
                            : wheelResult === 5.0
                            ? '⭐ BIG WIN!'
                            : wheelResult === 2.0
                            ? '🔥 DOUBLE WIN!'
                            : wheelResult === 1.2
                            ? '✅ SMALL WIN'
                            : wheelResult === 0.5
                            ? '🪙 NUSU YA DAU'
                            : '❌ HAUJASHINDA'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">LUCKY WHEEL<br />EV = 0.85</span>
                    )
                  ) : winningNumber !== null ? (
                    <div className="space-y-1">
                      <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
                        {winningNumber === 37 ? '00' : winningNumber}
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-300">
                        {winningNumber === 0 || winningNumber === 37
                          ? `KIJANI HOUSE (${winningNumber === 37 ? '00' : '0'})`
                          : RED_NUMBERS.includes(winningNumber)
                          ? 'NYEKUNDU'
                          : 'NYEUSI'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">ZUNGUSHA ROULETTE</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full max-w-md py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/80 animate-pulse'
            }`}
          >
            <Zap className="w-6 h-6" />
            <span>
              {isSpinning
                ? 'GURUDUMU LINA ZUNGUKA...'
                : gameMode === 'WHEEL'
                ? `ZUNGUSHA LUCKY WHEEL (BET TSh ${stake.toLocaleString()})`
                : `ZUNGUSHA ROULETTE (BET TSh ${stake.toLocaleString()})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
