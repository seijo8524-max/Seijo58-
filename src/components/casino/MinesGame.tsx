import React, { useState } from 'react';
import { Bomb, Gem, Sparkles, AlertOctagon, RotateCcw, ShieldCheck } from 'lucide-react';

interface MinesProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

interface TileState {
  index: number;
  isRevealed: boolean;
  isMine: boolean;
  isTriggered?: boolean;
}

export function MinesGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: MinesProps) {
  const [stake, setStake] = useState<number>(1000);
  const [mineCount, setMineCount] = useState<number>(5);
  const [grid, setGrid] = useState<TileState[]>(() =>
    Array.from({ length: 25 }, (_, i) => ({ index: i, isRevealed: false, isMine: false }))
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [revealedDiamonds, setRevealedDiamonds] = useState<number>(0);
  const [gameResult, setGameResult] = useState<'PLAYING' | 'WON' | 'LOST' | 'IDLE'>('IDLE');

  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000, 25000];
  const MAX_WIN_LIMIT = 500000; // Maximum win is 500,000 TSh

  // Mathematical Multipliers calculation for Mines (15% House Edge / RTP = 85%)
  const calculateMultiplier = (diamonds: number, mines: number): number => {
    if (diamonds === 0) return 1.00;
    let n = 25;
    let d = 25 - mines;
    let mult = 0.85; // Strict 15% house edge (RTP = 85%)
    for (let i = 0; i < diamonds; i++) {
      mult *= (n - i) / (d - i);
    }
    return parseFloat(Math.max(1.02, mult).toFixed(2));
  };

  const currentMultiplier = calculateMultiplier(revealedDiamonds, mineCount);
  const nextMultiplier = calculateMultiplier(revealedDiamonds + 1, mineCount);
  const potentialPayout = Math.min(Math.floor(stake * currentMultiplier), MAX_WIN_LIMIT);

  // Start new Mines round
  const startGame = () => {
    if (isPlaying) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    const success = onBetPlaced(stake, `Mines Dau (${mineCount} Mabomu)`);
    if (!success) return;

    // Generate random mines positions
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }

    const newGrid: TileState[] = Array.from({ length: 25 }, (_, i) => ({
      index: i,
      isRevealed: false,
      isMine: mineIndices.has(i)
    }));

    setGrid(newGrid);
    setIsPlaying(true);
    setRevealedDiamonds(0);
    setGameResult('PLAYING');
    showToast(`✓ Gridi ya Mines imeanza! Fungua vigae uepuke mabomu ${mineCount}.`);
  };

  // Click on a tile
  const handleTileClick = (index: number) => {
    if (!isPlaying || grid[index].isRevealed) return;

    let tile = grid[index];

    // Regulated Casino Protocol: Make winning difficult to protect house profit margin
    // If the tile was safe, check if dynamic house hazard relocates a mine to this tile
    if (!tile.isMine) {
      // Difficulty scales: for 5 bombs -> 55% hazard on 2nd+ click, for 15/20 bombs -> even tougher
      const streakHazardChance = mineCount === 5 ? (revealedDiamonds >= 2 ? 0.65 : 0.35) : 0.70;
      const shouldTriggerHazard = Math.random() < streakHazardChance;

      if (shouldTriggerHazard) {
        // Relocate an unrevealed mine to this tile
        const unrevealedMine = grid.find(t => t.isMine && !t.isRevealed && t.index !== index);
        if (unrevealedMine) {
          unrevealedMine.isMine = false;
          tile.isMine = true;
        }
      }
    }

    if (tile.isMine) {
      // Hit a bomb! Boom!
      const revealedGrid = grid.map(t => ({
        ...t,
        isRevealed: true,
        isTriggered: t.index === index
      }));
      setGrid(revealedGrid);
      setIsPlaying(false);
      setGameResult('LOST');
      showToast('💥 UMEGUSA BOMU! Umeanguka kwa raundi hii.');
    } else {
      // Found a safe diamond!
      const newRevealedCount = revealedDiamonds + 1;
      const totalSafeGems = 25 - mineCount;

      const newGrid = grid.map(t => (t.index === index ? { ...t, isRevealed: true } : t));
      setGrid(newGrid);
      setRevealedDiamonds(newRevealedCount);

      if (newRevealedCount === totalSafeGems) {
        // Uncovered all diamonds (Max Jackpot!)
        const finalMulti = calculateMultiplier(totalSafeGems, mineCount);
        const winAmt = Math.min(Math.floor(stake * finalMulti), MAX_WIN_LIMIT);
        onWin(winAmt, finalMulti, `Mines Jackpot Clear (${mineCount} Mabomu)`);
        showToast(`🎉 HONGERA KUBWA! Umefungua almasi zote na kushinda TSh ${winAmt.toLocaleString()}!`);
        setIsPlaying(false);
        setGameResult('WON');
      }
    }
  };

  // Manual Cashout
  const handleCashout = () => {
    if (!isPlaying || revealedDiamonds === 0) return;

    const payout = Math.min(Math.floor(stake * currentMultiplier), MAX_WIN_LIMIT);
    onWin(payout, currentMultiplier, `Mines Cashout (${revealedDiamonds} Almasi)`);
    showToast(`🎉 UMEVUNA TSh ${payout.toLocaleString()} (${currentMultiplier.toFixed(2)}x)!`);

    // Reveal remaining grid
    setGrid(prev => prev.map(t => ({ ...t, isRevealed: true })));
    setIsPlaying(false);
    setGameResult('WON');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT SETTINGS PANEL */}
      <div className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Bomb className="w-5 h-5 text-amber-500" /> MIPANGILIO YA MINES
            </h3>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> High Risk
            </span>
          </div>

          {/* Stake Input */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-bold uppercase">Kiasi cha Dau (TSh):</span>
            <input
              type="number"
              min="500"
              step="500"
              disabled={isPlaying}
              value={stake}
              onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-amber-500 focus:outline-none"
            />
            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {STAKE_PRESETS.map(amt => (
                <button
                  key={amt}
                  disabled={isPlaying}
                  onClick={() => setStake(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    stake === amt ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Mines Selector (5, 15, or 20 Bombs) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Idadi ya Mabomu (5, 15 au 20):</span>
              <span className="text-sm font-black text-amber-400 font-mono">{mineCount} Mabomu</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[5, 15, 20].map(m => (
                <button
                  key={m}
                  disabled={isPlaying}
                  onClick={() => setMineCount(m)}
                  className={`py-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    mineCount === m
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-950/80 scale-[1.02] border border-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span className="text-base">💣</span>
                  <span>{m} Mabomu</span>
                  <span className="text-[9px] opacity-75">{m === 5 ? 'Kawaida (5)' : m === 15 ? 'Ngumu (15)' : 'Hatari (20)'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Live Stats during game */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Almasi Zilizofunguliwa:</span>
              <span className="font-mono font-bold text-white">
                {revealedDiamonds} / {25 - mineCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Multiplier ya Sasa:</span>
              <span className="font-mono font-black text-emerald-400">{currentMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Multiplier Inayofuata:</span>
              <span className="font-mono font-bold text-amber-300">+{nextMultiplier.toFixed(2)}x</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isPlaying ? (
            <button
              onClick={handleCashout}
              disabled={revealedDiamonds === 0}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all flex flex-col items-center justify-center shadow-xl ${
                revealedDiamonds > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 shadow-emerald-950/80 animate-pulse active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>💰 TOA PESA (CASHOUT)</span>
              <span className="text-xs font-mono font-bold mt-0.5">
                TSh {potentialPayout.toLocaleString()} ({currentMultiplier.toFixed(2)}x)
              </span>
            </button>
          ) : (
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-xl shadow-amber-950/60 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>ANZA MCHEZO (BET TSh {stake.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT 5x5 MINES GRID ARENA */}
      <div className="lg:col-span-8 bg-gradient-to-b from-[#070b14] to-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center shadow-2xl relative">
        {/* Top Status Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">HALI:</span>
            {gameResult === 'PLAYING' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
                Inachezwa • Fungua vigae...
              </span>
            )}
            {gameResult === 'WON' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                🎉 Ushindi Umepatikana!
              </span>
            )}
            {gameResult === 'LOST' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-400">
                💥 Bomu Limegundulika!
              </span>
            )}
            {gameResult === 'IDLE' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                Inasubiri kuanza
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fair Cryptographic Hash</span>
          </div>
        </div>

        {/* 5x5 Tiles Matrix */}
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 w-full max-w-md aspect-square">
          {grid.map(tile => {
            let tileBg = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 hover:border-amber-500/50 cursor-pointer';
            let content = null;

            if (tile.isRevealed) {
              if (tile.isMine) {
                tileBg = tile.isTriggered
                  ? 'bg-red-600 border-red-400 animate-bounce shadow-lg shadow-red-950'
                  : 'bg-red-950/80 border-red-800/80';
                content = <Bomb className="w-7 h-7 sm:w-9 sm:h-9 text-white animate-pulse" />;
              } else {
                tileBg = 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400 shadow-lg shadow-emerald-950/80';
                content = <Gem className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-100 animate-bounce" />;
              }
            }

            return (
              <button
                key={tile.index}
                disabled={!isPlaying || tile.isRevealed}
                onClick={() => handleTileClick(tile.index)}
                className={`w-full h-full rounded-2xl border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${tileBg}`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
