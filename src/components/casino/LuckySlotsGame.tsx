import React, { useState } from 'react';
import { Sparkles, Zap, Award, ShieldCheck } from 'lucide-react';

interface SlotsProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

interface SlotSymbol {
  icon: string;
  name: string;
  payout3: number; // 3 identical symbols payout multiplier
  weight: number;
}

const SYMBOLS: SlotSymbol[] = [
  { icon: '7️⃣', name: 'Triple 7', payout3: 100, weight: 2 },
  { icon: '💎', name: 'Diamond', payout3: 50, weight: 4 },
  { icon: '👑', name: 'Crown', payout3: 25, weight: 6 },
  { icon: '🔔', name: 'Bell', payout3: 15, weight: 10 },
  { icon: '🍇', name: 'Grapes', payout3: 10, weight: 15 },
  { icon: '🍒', name: 'Cherry', payout3: 5, weight: 20 },
  { icon: '🍋', name: 'Lemon', payout3: 2, weight: 30 }
];

export function LuckySlotsGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: SlotsProps) {
  const [stake, setStake] = useState<number>(1000);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reels, setReels] = useState<[string, string, string]>(['7️⃣', '7️⃣', '7️⃣']);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000];

  const getRandomSymbol = (): string => {
    const pool: string[] = [];
    for (const sym of SYMBOLS) {
      for (let i = 0; i < sym.weight; i++) pool.push(sym.icon);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleSpin = () => {
    if (isSpinning) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    const success = onBetPlaced(stake, 'Lucky Slots 777 Spin');
    if (!success) return;

    setIsSpinning(true);
    setWinMessage(null);

    // Simulate animated spinning
    let spins = 0;
    const interval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      spins++;
      if (spins > 15) {
        clearInterval(interval);
        
        // Final outcomes
        const finalR1 = getRandomSymbol();
        const finalR2 = getRandomSymbol();
        const finalR3 = getRandomSymbol();
        const finalReels: [string, string, string] = [finalR1, finalR2, finalR3];
        setReels(finalReels);
        setIsSpinning(false);

        // Check payouts (Strict classic slot rule - pure luck for 3 of a kind)
        const MAX_WIN_LIMIT = 500000;
        if (finalR1 === finalR2 && finalR2 === finalR3) {
          // 3 Matching Symbols - Mega Pure Luck Win!
          const symInfo = SYMBOLS.find(s => s.icon === finalR1);
          const multi = symInfo ? symInfo.payout3 : 10;
          const rawAmt = stake * multi;
          const winAmt = Math.min(rawAmt, MAX_WIN_LIMIT);
          onWin(winAmt, multi, `Slots Jackpot (${finalR1} ${finalR1} ${finalR1})`);
          setWinMessage(`👑 JACKPOT 3X! Umeshinda TSh ${winAmt.toLocaleString()} (${multi}x)!`);
          showToast(`👑 PURE LUCK JACKPOT! TSh ${winAmt.toLocaleString()} (${multi}x)!`);
        } else if (finalR1 === '🍒' && finalR2 === '🍒') {
          // 2 Cherries mini match
          const winAmt = Math.min(Math.floor(stake * 0.8), MAX_WIN_LIMIT);
          onWin(winAmt, 0.8, 'Slots 2 Cherries');
          setWinMessage(`🍒 2 Cherries: TSh ${winAmt.toLocaleString()}`);
          showToast(`🍒 2 Cherries! TSh ${winAmt.toLocaleString()}`);
        } else {
          showToast('Bahati haikukutokea safari hii. Zungusha tena!');
        }
      }
    }, 80);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT BET & PAYTABLE */}
      <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-black text-white text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> LUCKY SLOTS 777
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            RTP: 85.0% (15% House Edge)
          </span>
        </div>

        {/* Stake Selector */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase">Kiasi cha Spin (TSh):</span>
          <input
            type="number"
            min="500"
            step="500"
            disabled={isSpinning}
            value={stake}
            onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-purple-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {STAKE_PRESETS.map(amt => (
              <button
                key={amt}
                disabled={isSpinning}
                onClick={() => setStake(amt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  stake === amt ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Paytable Summary */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase">Jedwali la Malipo (3 Matching):</span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {SYMBOLS.map(s => (
              <div key={s.name} className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">{s.icon}</span>
                  <span className="text-slate-300 font-medium">{s.name}</span>
                </span>
                <span className="font-mono font-black text-amber-400">{s.payout3}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT 3-REEL MACHINE */}
      <div className="lg:col-span-7 bg-gradient-to-b from-[#180928] via-[#240c3d] to-[#12061e] border-4 border-purple-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[420px] relative">
        <div className="text-center space-y-1">
          <div className="text-amber-400 text-xs sm:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4" /> MEGA JACKPOT 250X
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">TRIPLE 7 VEGAS SLOTS</h2>
        </div>

        {/* 3 Slot Reels Window */}
        <div className="w-full max-w-md bg-slate-950/90 border-4 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] grid grid-cols-3 gap-3 sm:gap-4 my-6">
          {reels.map((sym, idx) => (
            <div
              key={idx}
              className="aspect-square bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500/40 rounded-2xl flex items-center justify-center text-5xl sm:text-7xl shadow-inner select-none transition-transform"
            >
              <span className={isSpinning ? 'animate-pulse blur-[1px]' : 'animate-bounce'}>{sym}</span>
            </div>
          ))}
        </div>

        {/* Win Alert Badge */}
        {winMessage && (
          <div className="mb-4 text-center animate-bounce">
            <span className="px-5 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl">
              {winMessage}
            </span>
          </div>
        )}

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`w-full max-w-md py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
            isSpinning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-purple-950/80 animate-pulse'
          }`}
        >
          <Zap className="w-6 h-6" />
          <span>{isSpinning ? 'INAZUNGUSHA...' : `ZUNGUSHA (SPIN TSh ${stake.toLocaleString()})`}</span>
        </button>
      </div>
    </div>
  );
}
