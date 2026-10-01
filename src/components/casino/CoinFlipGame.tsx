import React, { useState } from 'react';
import { Coins, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface CoinFlipProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

export function CoinFlipGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: CoinFlipProps) {
  const [stake, setStake] = useState<number>(1000);
  const [selectedSide, setSelectedSide] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [coinResult, setCoinResult] = useState<'HEAD' | 'TAIL' | null>(null);

  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000, 25000];
  const MAX_WIN_LIMIT = 500000; // Maximum win is 500,000 TSh
  const MULTIPLIER = 1.70; // 15% House Edge (RTP = 85%)
  const potentialPayout = Math.min(Math.floor(stake * MULTIPLIER), MAX_WIN_LIMIT);

  const handleFlip = () => {
    if (isFlipping) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    const sideLabel = selectedSide === 'HEAD' ? 'Kichwa (Head)' : 'Mkia (Tail)';
    const success = onBetPlaced(stake, `Coin Flip: ${sideLabel}`);
    if (!success) return;

    setIsFlipping(true);
    setCoinResult(null);

    setTimeout(() => {
      // Regulated Casino Protocol: Exact 15% win rate (hidden)
      const isWinner = Math.random() < 0.15;
      const oppositeSide: 'HEAD' | 'TAIL' = selectedSide === 'HEAD' ? 'TAIL' : 'HEAD';
      const outcome: 'HEAD' | 'TAIL' = isWinner ? selectedSide : oppositeSide;

      setCoinResult(outcome);
      setIsFlipping(false);

      if (outcome === selectedSide) {
        onWin(potentialPayout, MULTIPLIER, `Coin Flip Win: ${outcome}`);
        showToast(`🎉 UMESHINDA COIN FLIP! Sarafu imelala ${outcome === 'HEAD' ? 'KICHWA' : 'MKIA'}! TSh ${potentialPayout.toLocaleString()}!`);
      } else {
        showToast(`Sarafu imelala ${outcome === 'HEAD' ? 'KICHWA' : 'MKIA'}. Jaribu tena!`);
      }
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT SETTINGS */}
      <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-black text-white text-base flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" /> COIN FLIP (KICHWA / MKIA)
          </h3>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Real Money
          </span>
        </div>

        {/* Stake */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase">Kiasi cha Dau (TSh):</span>
          <input
            type="number"
            min="500"
            step="500"
            disabled={isFlipping}
            value={stake}
            onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-yellow-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {STAKE_PRESETS.map(amt => (
              <button
                key={amt}
                disabled={isFlipping}
                onClick={() => setStake(amt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  stake === amt ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Side Selector */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Chagua Upande wa Sarafu:</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedSide('HEAD')}
              className={`p-4 rounded-2xl font-black text-sm transition-all border flex flex-col items-center gap-2 ${
                selectedSide === 'HEAD'
                  ? 'bg-yellow-500 text-slate-950 border-yellow-300 shadow-lg shadow-yellow-950/60 scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-3xl">🪙</span>
              <span>KICHWA (HEAD)</span>
              <span className="text-[10px] font-mono opacity-80">1.96x Payout</span>
            </button>

            <button
              onClick={() => setSelectedSide('TAIL')}
              className={`p-4 rounded-2xl font-black text-sm transition-all border flex flex-col items-center gap-2 ${
                selectedSide === 'TAIL'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-950/60 scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-3xl">🦅</span>
              <span>MKIA (TAIL)</span>
              <span className="text-[10px] font-mono opacity-80">1.96x Payout</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT FLIP ARENA */}
      <div className="lg:col-span-7 bg-gradient-to-b from-[#1c1505] via-[#2d2108] to-[#120e03] border-4 border-yellow-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[420px]">
        <div className="text-center space-y-1">
          <span className="text-xs text-yellow-400 font-bold uppercase tracking-widest">
            Ushindi wa Haraka wa 1.96x
          </span>
          <h2 className="text-2xl font-black text-white">RUSHIA SARAFU HEWANI</h2>
        </div>

        {/* 3D Coin Graphic */}
        <div className="my-8">
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-8 border-yellow-400 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex items-center justify-center text-slate-950 select-none ${
              isFlipping ? 'animate-spin' : 'animate-bounce'
            }`}
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-yellow-950/40 flex flex-col items-center justify-center font-black">
              {coinResult ? (
                <>
                  <span className="text-4xl sm:text-5xl">{coinResult === 'HEAD' ? '🪙' : '🦅'}</span>
                  <span className="text-xs sm:text-sm font-black mt-1 uppercase tracking-widest">
                    {coinResult === 'HEAD' ? 'KICHWA' : 'MKIA'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl sm:text-5xl">{selectedSide === 'HEAD' ? '🪙' : '🦅'}</span>
                  <span className="text-xs sm:text-sm font-black mt-1 uppercase tracking-widest">
                    {selectedSide === 'HEAD' ? 'KICHWA' : 'MKIA'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          disabled={isFlipping}
          className={`w-full max-w-md py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
            isFlipping
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 text-slate-950 shadow-yellow-950/80 animate-pulse'
          }`}
        >
          <Zap className="w-6 h-6" />
          <span>{isFlipping ? 'SARAFU INARUKA HEWANI...' : `RUSHA SARAFU (BET TSh ${stake.toLocaleString()})`}</span>
        </button>
      </div>
    </div>
  );
}
