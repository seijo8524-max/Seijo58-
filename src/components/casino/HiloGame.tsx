import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Sparkles, ShieldCheck } from 'lucide-react';

interface HiloProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

interface HiloCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  rank: number; // 2 to 14 (Ace high = 14)
}

// 52-Card Deck for Authentic High Difficulty
const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♥', '♠', '♦', '♣'];
const RANKS = [
  { value: '2', rank: 2 }, { value: '3', rank: 3 }, { value: '4', rank: 4 }, { value: '5', rank: 5 },
  { value: '6', rank: 6 }, { value: '7', rank: 7 }, { value: '8', rank: 8 }, { value: '9', rank: 9 },
  { value: '10', rank: 10 }, { value: 'J', rank: 11 }, { value: 'Q', rank: 12 }, { value: 'K', rank: 13 },
  { value: 'A', rank: 14 }
];

const CARDS_DECK: HiloCard[] = SUITS.flatMap(suit =>
  RANKS.map(r => ({ suit, value: r.value, rank: r.rank }))
);

export function HiloGame({ walletBalance, onBetPlaced, onWin, onOpenDeposit, showToast }: HiloProps) {
  const [stake, setStake] = useState<number>(1000);
  const [currentCard, setCurrentCard] = useState<HiloCard>({ suit: '♠', value: '7', rank: 7 });
  const [historyCards, setHistoryCards] = useState<HiloCard[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [cumulativeMulti, setCumulativeMulti] = useState<number>(1.00);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000];
  const MAX_WIN_LIMIT = 500000; // Maximum win is 500,000 TSh

  // Dynamic odds calculation with 15% House Edge (RTP = 85%)
  const higherChance = Math.max(0.08, (14 - currentCard.rank) / 13);
  const lowerChance = Math.max(0.08, (currentCard.rank - 2) / 13);
  const higherOdds = parseFloat(Math.max(1.04, 0.85 / higherChance).toFixed(2));
  const lowerOdds = parseFloat(Math.max(1.04, 0.85 / lowerChance).toFixed(2));

  const startGame = () => {
    if (isPlaying) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    const success = onBetPlaced(stake, 'Hi-Lo Cards Bet');
    if (!success) return;

    const startC = CARDS_DECK[Math.floor(Math.random() * CARDS_DECK.length)];
    setCurrentCard(startC);
    setHistoryCards([startC]);
    setStreakCount(0);
    setCumulativeMulti(1.00);
    setIsPlaying(true);
    showToast('🎴 Karata ya Kwanza Imetolewa! Tabiri JUU (Higher) au CHINI (Lower). Sare inapoteza!');
  };

  const handleGuess = (guess: 'HIGHER' | 'LOWER') => {
    if (!isPlaying) return;

    // Authentic Card Draw from Standard 52-Card Deck
    const nextC = CARDS_DECK[Math.floor(Math.random() * CARDS_DECK.length)];

    // Strict requirement: Must strictly exceed or drop below (Tie is House Win)
    const isHigher = nextC.rank > currentCard.rank;
    const isLower = nextC.rank < currentCard.rank;

    const stepOdds = guess === 'HIGHER' ? higherOdds : lowerOdds;
    const isCorrect = guess === 'HIGHER' ? isHigher : isLower;

    setHistoryCards(prev => [nextC, ...prev.slice(0, 6)]);
    setCurrentCard(nextC);

    if (isCorrect) {
      const newMulti = parseFloat((cumulativeMulti * stepOdds).toFixed(2));
      setCumulativeMulti(newMulti);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      showToast(`✓ SAHIHI! Ushindi wa mfululizo: ${newStreak}. Multiplier: ${newMulti}x!`);
    } else {
      setIsPlaying(false);
      showToast(`❌ UMETABIRI VIBAYA! Karata ilikuwa ${nextC.value}${nextC.suit}. Raundi imeisha.`);
    }
  };

  const handleCashout = () => {
    if (!isPlaying || streakCount === 0) return;

    const payout = Math.min(Math.floor(stake * cumulativeMulti), MAX_WIN_LIMIT);
    onWin(payout, cumulativeMulti, `Hi-Lo Cashout (${streakCount} Karata)`);
    showToast(`🎉 UMEVUNA TSh ${payout.toLocaleString()} (${cumulativeMulti}x)!`);
    setIsPlaying(false);
  };

  const currentPayout = Math.min(Math.floor(stake * cumulativeMulti), MAX_WIN_LIMIT);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT CONTROLS */}
      <div className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" /> HI-LO CARDS
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              RTP: 85.0% (15% House Edge)
            </span>
          </div>

          {/* Stake */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-bold uppercase">Kiasi cha Dau (TSh):</span>
            <input
              type="number"
              min="500"
              step="500"
              disabled={isPlaying}
              value={stake}
              onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-teal-500 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {STAKE_PRESETS.map(amt => (
                <button
                  key={amt}
                  disabled={isPlaying}
                  onClick={() => setStake(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    stake === amt ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Live Multiplier & Streak Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Mfululizo wa Karata:</span>
              <span className="font-bold text-white font-mono">{streakCount} Karata</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Jumla ya Multiplier:</span>
              <span className="font-black text-emerald-400 font-mono">{cumulativeMulti.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Malipo Yanayowezekana:</span>
              <span className="font-black text-amber-300 font-mono">TSh {currentPayout.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          {isPlaying ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGuess('HIGHER')}
                  className="py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center"
                >
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-4 h-4" /> JUU (HIGHER)
                  </span>
                  <span className="text-[10px] opacity-80 mt-0.5 font-mono">+{higherOdds}x</span>
                </button>
                <button
                  onClick={() => handleGuess('LOWER')}
                  className="py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center"
                >
                  <span className="flex items-center gap-1">
                    <ArrowDown className="w-4 h-4" /> CHINI (LOWER)
                  </span>
                  <span className="text-[10px] opacity-80 mt-0.5 font-mono">+{lowerOdds}x</span>
                </button>
              </div>

              <button
                onClick={handleCashout}
                disabled={streakCount === 0}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl ${
                  streakCount > 0
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 animate-bounce'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                TOA USHINDI (TSh {currentPayout.toLocaleString()})
              </button>
            </div>
          ) : (
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 text-white shadow-xl shadow-teal-950/60 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>ANZA HI-LO (BET TSh {stake.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT CARDS ARENA */}
      <div className="lg:col-span-8 bg-gradient-to-b from-[#062424] via-[#093535] to-[#041a1a] border-4 border-teal-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[420px]">
        {/* History of cards */}
        <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <span className="text-[10px] text-teal-200 font-bold uppercase shrink-0">Karata Zilizopita:</span>
          {historyCards.map((c, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-teal-500/40 text-xs font-mono font-bold text-white shrink-0"
            >
              {c.value} {c.suit}
            </span>
          ))}
        </div>

        {/* Center Active Card */}
        <div className="my-6">
          <div className="w-32 h-48 sm:w-40 sm:h-56 rounded-3xl bg-white border-4 border-amber-400 shadow-2xl p-3 flex flex-col justify-between font-black text-slate-900 animate-fade-in">
            <div className={`text-xl sm:text-2xl leading-none ${currentCard.suit === '♥' || currentCard.suit === '♦' ? 'text-red-600' : 'text-slate-900'}`}>
              {currentCard.value}
              <span className="text-sm ml-0.5">{currentCard.suit}</span>
            </div>
            <div className={`text-5xl sm:text-6xl text-center ${currentCard.suit === '♥' || currentCard.suit === '♦' ? 'text-red-600' : 'text-slate-900'}`}>
              {currentCard.suit}
            </div>
            <div className={`text-lg text-right leading-none ${currentCard.suit === '♥' || currentCard.suit === '♦' ? 'text-red-600' : 'text-slate-900'}`}>
              {currentCard.value}
            </div>
          </div>
        </div>

        <div className="text-xs text-teal-300 font-bold">
          {isPlaying ? 'Tabiri ikiwa karata inayofuata itakuwa ya Juu au ya Chini' : 'Bofya Anza Hi-Lo kuanza kucheza'}
        </div>
      </div>
    </div>
  );
}
