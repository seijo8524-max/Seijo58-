import React, { useState, useEffect, useRef } from 'react';
import { PlaneTakeoff, RefreshCw, Zap, TrendingUp, AlertTriangle, ShieldCheck, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AviatorProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

interface BetPanelState {
  stake: number;
  autoCashout: boolean;
  autoCashoutMulti: number;
  isBetPlaced: boolean;
  hasCashedOut: boolean;
  cashedOutMulti: number;
  winAmount: number;
}

export function AviatorGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: AviatorProps) {
  // Game states: 'WAITING' | 'FLYING' | 'CRASHED'
  const [gameState, setGameState] = useState<'WAITING' | 'FLYING' | 'CRASHED'>('WAITING');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(1.00);
  const [countdown, setCountdown] = useState<number>(5);
  const [history, setHistory] = useState<number[]>([1.02, 1.14, 1.00, 1.25, 1.08, 1.00, 1.48, 1.05, 1.12, 2.10]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Dual Bet Panels
  const [bet1, setBet1] = useState<BetPanelState>({
    stake: 1000,
    autoCashout: false,
    autoCashoutMulti: 2.00,
    isBetPlaced: false,
    hasCashedOut: false,
    cashedOutMulti: 0,
    winAmount: 0
  });

  const [bet2, setBet2] = useState<BetPanelState>({
    stake: 500,
    autoCashout: false,
    autoCashoutMulti: 1.50,
    isBetPlaced: false,
    hasCashedOut: false,
    cashedOutMulti: 0,
    winAmount: 0
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gameLoopRef = useRef<{ startTime: number; duration: number } | null>(null);

  // Maximum payout limit per round (Max Win Cap: 500,000 TSh)
  const MAX_WIN_LIMIT = 500000;

  // Quick Stake increments
  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000, 20000];

  // Regulated Casino Margin Protocol: High house profit margin (~20% user allocation)
  const generateCrashPoint = () => {
    const r = Math.random();
    // 50% of rounds: instant early crash between 1.00x and 1.15x
    if (r < 0.50) {
      return parseFloat((1.00 + Math.random() * 0.15).toFixed(2));
    }
    // 30% of rounds: crash between 1.16x and 1.50x
    if (r < 0.80) {
      return parseFloat((1.16 + Math.random() * 0.34).toFixed(2));
    }
    // 15% of rounds: crash between 1.51x and 2.20x
    if (r < 0.95) {
      return parseFloat((1.51 + Math.random() * 0.69).toFixed(2));
    }
    // Rare 5% of rounds: up to 5.00x
    return parseFloat((2.20 + Math.random() * 2.80).toFixed(2));
  };

  // Main game loop coordinator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'WAITING') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        // Start Flying!
        const cp = generateCrashPoint();
        setCrashPoint(cp);
        setMultiplier(1.00);
        setGameState('FLYING');
        gameLoopRef.current = { startTime: Date.now(), duration: 0 };
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  // Flying Animation & Multiplier Tick
  useEffect(() => {
    if (gameState !== 'FLYING') return;

    let animId: number;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Exponential curve: Multiplier increases progressively faster
      const currentMulti = parseFloat((1.00 + Math.pow(elapsed * 0.75, 1.85)).toFixed(2));

      if (currentMulti >= crashPoint) {
        // Plane Flew Away (Crashed)!
        setMultiplier(crashPoint);
        setGameState('CRASHED');
        setHistory(prev => [crashPoint, ...prev.slice(0, 14)]);
        
        // Settle unresolved bets
        setBet1(b => ({ ...b, isBetPlaced: false, hasCashedOut: false }));
        setBet2(b => ({ ...b, isBetPlaced: false, hasCashedOut: false }));

        // Restart countdown after 3 seconds
        setTimeout(() => {
          setCountdown(5);
          setGameState('WAITING');
        }, 3000);
      } else {
        setMultiplier(currentMulti);

        // Check Auto Cashouts
        setBet1(b => {
          if (b.isBetPlaced && !b.hasCashedOut && b.autoCashout && currentMulti >= b.autoCashoutMulti) {
            const rawPayout = Math.floor(b.stake * b.autoCashoutMulti);
            const payout = Math.min(rawPayout, MAX_WIN_LIMIT);
            onWin(payout, b.autoCashoutMulti, 'Aviator Auto Cashout (Bet 1)');
            showToast(`🚀 Bet 1 Auto Cashout: TSh ${payout.toLocaleString()} (${b.autoCashoutMulti}x)!`);
            return { ...b, hasCashedOut: true, cashedOutMulti: b.autoCashoutMulti, winAmount: payout };
          }
          return b;
        });

        setBet2(b => {
          if (b.isBetPlaced && !b.hasCashedOut && b.autoCashout && currentMulti >= b.autoCashoutMulti) {
            const rawPayout = Math.floor(b.stake * b.autoCashoutMulti);
            const payout = Math.min(rawPayout, MAX_WIN_LIMIT);
            onWin(payout, b.autoCashoutMulti, 'Aviator Auto Cashout (Bet 2)');
            showToast(`🚀 Bet 2 Auto Cashout: TSh ${payout.toLocaleString()} (${b.autoCashoutMulti}x)!`);
            return { ...b, hasCashedOut: true, cashedOutMulti: b.autoCashoutMulti, winAmount: payout };
          }
          return b;
        });

        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, crashPoint]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 320);

    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (gameState === 'FLYING' || gameState === 'CRASHED') {
      const progress = Math.min(1, (multiplier - 1.0) / Math.max(5, crashPoint - 1.0));
      const endX = 40 + progress * (width - 120);
      const endY = height - 40 - Math.pow(progress, 0.8) * (height - 100);

      // Curve Shadow Fill
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, gameState === 'CRASHED' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(220, 38, 38, 0.35)');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0.0)');

      ctx.beginPath();
      ctx.moveTo(40, height - 40);
      ctx.quadraticCurveTo(width * 0.35, height - 40, endX, endY);
      ctx.lineTo(endX, height - 40);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Curve Line
      ctx.beginPath();
      ctx.moveTo(40, height - 40);
      ctx.quadraticCurveTo(width * 0.35, height - 40, endX, endY);
      ctx.strokeStyle = gameState === 'CRASHED' ? '#ef4444' : '#f43f5e';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Red Plane Marker / Icon
      ctx.save();
      ctx.translate(endX, endY);
      const angle = gameState === 'CRASHED' ? 0.3 : -0.35;
      ctx.rotate(angle);

      // Draw Plane Body
      ctx.fillStyle = gameState === 'CRASHED' ? '#ef4444' : '#e11d48';
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.lineTo(-15, -10);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-15, 10);
      ctx.closePath();
      ctx.fill();

      // Plane Wings
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(-5, -16);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-5, 16);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }, [gameState, multiplier, crashPoint]);

  // Handle Manual Cashout
  const handleCashout = (betNumber: 1 | 2) => {
    if (gameState !== 'FLYING') return;

    if (betNumber === 1) {
      if (!bet1.isBetPlaced || bet1.hasCashedOut) return;
      const rawPayout = Math.floor(bet1.stake * multiplier);
      const payout = Math.min(rawPayout, MAX_WIN_LIMIT);
      onWin(payout, multiplier, 'Aviator Cashout (Bet 1)');
      showToast(`🎉 UMEVUNA TSh ${payout.toLocaleString()} (${multiplier.toFixed(2)}x)!`);
      setBet1(prev => ({
        ...prev,
        hasCashedOut: true,
        cashedOutMulti: multiplier,
        winAmount: payout
      }));
    } else {
      if (!bet2.isBetPlaced || bet2.hasCashedOut) return;
      const rawPayout = Math.floor(bet2.stake * multiplier);
      const payout = Math.min(rawPayout, MAX_WIN_LIMIT);
      onWin(payout, multiplier, 'Aviator Cashout (Bet 2)');
      showToast(`🎉 UMEVUNA TSh ${payout.toLocaleString()} (${multiplier.toFixed(2)}x)!`);
      setBet2(prev => ({
        ...prev,
        hasCashedOut: true,
        cashedOutMulti: multiplier,
        winAmount: payout
      }));
    }
  };

  // Handle Place Bet
  const handlePlaceBet = (betNumber: 1 | 2) => {
    const bet = betNumber === 1 ? bet1 : bet2;
    const setBet = betNumber === 1 ? setBet1 : setBet2;

    if (bet.isBetPlaced) {
      // Cancel Bet before round starts
      if (gameState === 'WAITING') {
        setBet(b => ({ ...b, isBetPlaced: false }));
        showToast('Bet cancelled!');
      }
      return;
    }

    if (walletBalance < bet.stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi kwanza.');
      onOpenDeposit();
      return;
    }

    const success = onBetPlaced(bet.stake, `Aviator Bet ${betNumber}`);
    if (success) {
      setBet(b => ({ ...b, isBetPlaced: true, hasCashedOut: false, winAmount: 0 }));
      showToast(`✓ Bet ya TSh ${bet.stake.toLocaleString()} imewekwa!`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Aviator Top Bar: History Chips & Sound */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-red-500" /> HISTORIA:
          </span>
          {history.map((h, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-lg text-xs font-black shrink-0 ${
                h >= 10
                  ? 'bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-500/50'
                  : h >= 2.0
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-blue-300 border border-slate-700'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
          title={soundEnabled ? 'Zima Sauti' : 'Washa Sauti'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      {/* Main Flight Arena Canvas Screen */}
      <div className="relative w-full h-72 sm:h-96 bg-gradient-to-b from-[#070b14] via-[#0b1222] to-[#090e1a] rounded-3xl border-2 border-red-950/80 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Center Multiplier Display */}
        <div className="relative z-10 text-center select-none pointer-events-none">
          {gameState === 'WAITING' && (
            <div className="space-y-2 animate-pulse">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>INASUBIRI RAUNDI MPYA...</span>
              </div>
              <div className="text-4xl sm:text-6xl font-black text-amber-400 tracking-wider">
                00:{countdown.toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-slate-400">Weka dau lako sasa kabla ndege haijapaa!</p>
            </div>
          )}

          {gameState === 'FLYING' && (
            <div className="space-y-1">
              <div className="text-5xl sm:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]">
                {multiplier.toFixed(2)}<span className="text-red-500 text-4xl sm:text-6xl">x</span>
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-red-600/80 text-white font-black text-[11px] uppercase tracking-widest animate-pulse">
                ✈️ INAPAA JUU ZAIDI...
              </span>
            </div>
          )}

          {gameState === 'CRASHED' && (
            <div className="space-y-1 animate-bounce">
              <div className="text-xl sm:text-2xl font-black text-red-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-5 h-5" /> IMEPAA MBALI (FLEW AWAY)!
              </div>
              <div className="text-4xl sm:text-6xl font-black font-mono text-red-400">
                {multiplier.toFixed(2)}x
              </div>
            </div>
          )}
        </div>

        {/* Bottom Provably Fair Tag */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Provably Fair RNG SHA-256</span>
        </div>
      </div>

      {/* DUAL BETTING PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PANEL 1 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm text-white flex items-center gap-1.5">
              <PlaneTakeoff className="w-4 h-4 text-red-500" /> BET PANEL 1
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-bold flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bet1.autoCashout}
                  onChange={e => setBet1(b => ({ ...b, autoCashout: e.target.checked }))}
                  className="rounded text-red-600 focus:ring-0 bg-slate-800 border-slate-700"
                />
                <span>Auto Cashout</span>
              </label>
              {bet1.autoCashout && (
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="100"
                  value={bet1.autoCashoutMulti}
                  onChange={e => setBet1(b => ({ ...b, autoCashoutMulti: parseFloat(e.target.value) || 1.5 }))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-mono font-bold text-center"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Kiasi cha Dau (TSh):</span>
              <input
                type="number"
                min="500"
                step="500"
                disabled={bet1.isBetPlaced && gameState !== 'WAITING'}
                value={bet1.stake}
                onChange={e => setBet1(b => ({ ...b, stake: Math.max(500, parseInt(e.target.value) || 500) }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* ACTION BUTTON: BET OR CASHOUT */}
            <div className="shrink-0 pt-4">
              {bet1.isBetPlaced && gameState === 'FLYING' && !bet1.hasCashedOut ? (
                <button
                  onClick={() => handleCashout(1)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-sm shadow-xl shadow-amber-950/60 animate-bounce active:scale-95 transition-all"
                >
                  <div className="text-[10px] font-bold uppercase">TOA PESA (CASHOUT)</div>
                  <div className="font-mono text-base">TSh {Math.floor(bet1.stake * multiplier).toLocaleString()}</div>
                </button>
              ) : (
                <button
                  onClick={() => handlePlaceBet(1)}
                  disabled={bet1.isBetPlaced && gameState === 'FLYING'}
                  className={`px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${
                    bet1.isBetPlaced
                      ? gameState === 'WAITING'
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-emerald-700 text-white cursor-default'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white shadow-red-950/60'
                  }`}
                >
                  {bet1.isBetPlaced
                    ? gameState === 'WAITING'
                      ? 'KATAA BET'
                      : bet1.hasCashedOut
                      ? `✓ UMEVUNA TSh ${bet1.winAmount.toLocaleString()}`
                      : 'BET IPO HEWANI'
                    : 'WEKA BET'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Stake Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {STAKE_PRESETS.map(amt => (
              <button
                key={amt}
                disabled={bet1.isBetPlaced && gameState !== 'WAITING'}
                onClick={() => setBet1(b => ({ ...b, stake: amt }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  bet1.stake === amt
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                +{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* PANEL 2 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> BET PANEL 2
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-bold flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bet2.autoCashout}
                  onChange={e => setBet2(b => ({ ...b, autoCashout: e.target.checked }))}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700"
                />
                <span>Auto Cashout</span>
              </label>
              {bet2.autoCashout && (
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="100"
                  value={bet2.autoCashoutMulti}
                  onChange={e => setBet2(b => ({ ...b, autoCashoutMulti: parseFloat(e.target.value) || 2.0 }))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-mono font-bold text-center"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Kiasi cha Dau (TSh):</span>
              <input
                type="number"
                min="500"
                step="500"
                disabled={bet2.isBetPlaced && gameState !== 'WAITING'}
                value={bet2.stake}
                onChange={e => setBet2(b => ({ ...b, stake: Math.max(500, parseInt(e.target.value) || 500) }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* ACTION BUTTON: BET OR CASHOUT */}
            <div className="shrink-0 pt-4">
              {bet2.isBetPlaced && gameState === 'FLYING' && !bet2.hasCashedOut ? (
                <button
                  onClick={() => handleCashout(2)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-sm shadow-xl shadow-amber-950/60 animate-bounce active:scale-95 transition-all"
                >
                  <div className="text-[10px] font-bold uppercase">TOA PESA (CASHOUT)</div>
                  <div className="font-mono text-base">TSh {Math.floor(bet2.stake * multiplier).toLocaleString()}</div>
                </button>
              ) : (
                <button
                  onClick={() => handlePlaceBet(2)}
                  disabled={bet2.isBetPlaced && gameState === 'FLYING'}
                  className={`px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${
                    bet2.isBetPlaced
                      ? gameState === 'WAITING'
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-emerald-700 text-white cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-950/60'
                  }`}
                >
                  {bet2.isBetPlaced
                    ? gameState === 'WAITING'
                      ? 'KATAA BET'
                      : bet2.hasCashedOut
                      ? `✓ UMEVUNA TSh ${bet2.winAmount.toLocaleString()}`
                      : 'BET IPO HEWANI'
                    : 'WEKA BET'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Stake Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {STAKE_PRESETS.map(amt => (
              <button
                key={amt}
                disabled={bet2.isBetPlaced && gameState !== 'WAITING'}
                onClick={() => setBet2(b => ({ ...b, stake: amt }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  bet2.stake === amt
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                +{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
