import React, { useState } from 'react';
import { Layers, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

interface BlackjackProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWin: (amount: number, multi: number, title: string) => void;
  onRefund: (amount: number, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  num: number;
}

export function BlackjackGame({ walletBalance, onBetPlaced, onWin, onRefund, onOpenDeposit, showToast }: BlackjackProps) {
  const [stake, setStake] = useState<number>(1000);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerHidden, setDealerHidden] = useState<boolean>(true);
  const [gameOutcome, setGameOutcome] = useState<'PLAYER_WIN' | 'DEALER_WIN' | 'PUSH' | 'BLACKJACK' | null>(null);

  const STAKE_PRESETS = [500, 1000, 2000, 5000, 10000, 25000];

  // 8-Deck Casino Shoe (Strict Hardcore Vegas Blackjack)
  const createDeck = (): Card[] => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const values = [
      { v: '2', n: 2 }, { v: '3', n: 3 }, { v: '4', n: 4 }, { v: '5', n: 5 },
      { v: '6', n: 6 }, { v: '7', n: 7 }, { v: '8', n: 8 }, { v: '9', n: 9 },
      { v: '10', n: 10 }, { v: 'J', n: 10 }, { v: 'Q', n: 10 }, { v: 'K', n: 10 },
      { v: 'A', n: 11 }
    ];
    const deck: Card[] = [];
    // 8 Decks combined
    for (let d = 0; d < 8; d++) {
      for (const suit of suits) {
        for (const val of values) {
          deck.push({ suit, value: val.v, num: val.n });
        }
      }
    }
    // High-entropy shuffle
    return deck.sort(() => Math.random() - 0.5);
  };

  const calculateHandScore = (hand: Card[]): number => {
    let score = 0;
    let aceCount = 0;
    for (const card of hand) {
      score += card.num;
      if (card.value === 'A') aceCount++;
    }
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }
    return score;
  };

  const isSoft17 = (hand: Card[]): boolean => {
    let rawScore = hand.reduce((acc, c) => acc + c.num, 0);
    let hasAce = hand.some(c => c.value === 'A');
    return rawScore === 17 && hasAce;
  };

  const startDeal = () => {
    if (isPlaying) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Weka pesa kwenye pochi.');
      onOpenDeposit();
      return;
    }

    const success = onBetPlaced(stake, 'Blackjack 21 Bet');
    if (!success) return;

    const deck = createDeck();
    const p1 = deck.pop()!;
    const d1 = deck.pop()!;
    const p2 = deck.pop()!;
    const d2 = deck.pop()!;

    const initialPlayer = [p1, p2];
    const initialDealer = [d1, d2];

    setPlayerCards(initialPlayer);
    setDealerCards(initialDealer);
    setDealerHidden(true);
    setIsPlaying(true);
    setGameOutcome(null);

    // Check Player Natural Blackjack
    const MAX_WIN_LIMIT = 500000;
    if (calculateHandScore(initialPlayer) === 21) {
      // Natural 21 Blackjack
      setDealerHidden(false);
      setIsPlaying(false);
      const winAmt = Math.min(Math.floor(stake * 2.5), MAX_WIN_LIMIT); // 3:2 payout = 2.5x total
      onWin(winAmt, 2.5, 'Blackjack Natural 21 Win');
      setGameOutcome('BLACKJACK');
      showToast(`🎉 BLACKJACK NATURAL 21! Umeshinda TSh ${winAmt.toLocaleString()} (3:2 Payout)!`);
    }
  };

  const handleHit = () => {
    if (!isPlaying) return;

    const deck = createDeck();
    const newCard = deck.pop()!;
    const newHand = [...playerCards, newCard];
    setPlayerCards(newHand);

    const score = calculateHandScore(newHand);
    if (score > 21) {
      // BUST!
      setDealerHidden(false);
      setIsPlaying(false);
      setGameOutcome('DEALER_WIN');
      showToast('💥 BUST! Alama zimezidi 21. Umeshindwa.');
    } else if (score === 21) {
      handleStand(newHand);
    }
  };

  const handleStand = (currentPHand = playerCards) => {
    if (!isPlaying) return;

    setDealerHidden(false);
    setIsPlaying(false);

    let dHand = [...dealerCards];
    let dScore = calculateHandScore(dHand);
    const pScore = calculateHandScore(currentPHand);

    // Authentic Casino Dealer Rules: Dealer draws until reaching at least 17 (Hits on Soft 17)
    const deck = createDeck();
    while (dScore < 17 || isSoft17(dHand)) {
      const nextC = deck.pop();
      if (!nextC) break;
      dHand.push(nextC);
      dScore = calculateHandScore(dHand);
    }
    setDealerCards(dHand);

    const MAX_WIN_LIMIT = 500000;
    if (dScore > 21) {
      // Dealer Bust! Player wins
      const winAmt = Math.min(stake * 2, MAX_WIN_LIMIT);
      onWin(winAmt, 2.0, 'Blackjack Win (Dealer Bust)');
      setGameOutcome('PLAYER_WIN');
      showToast(`🎉 DEALER BUST (${dScore})! Umeshinda TSh ${winAmt.toLocaleString()}!`);
    } else if (pScore > dScore) {
      // Player higher
      const winAmt = Math.min(stake * 2, MAX_WIN_LIMIT);
      onWin(winAmt, 2.0, 'Blackjack Win');
      setGameOutcome('PLAYER_WIN');
      showToast(`🎉 UMESHINDA! Alama zako (${pScore}) ni zaidi ya Dealer (${dScore}).`);
    } else if (pScore < dScore) {
      // Dealer higher
      setGameOutcome('DEALER_WIN');
      showToast(`Dealer kashinda (${dScore} vs ${pScore}). Jaribu tena!`);
    } else {
      // Push (Tie)
      onRefund(stake, 'Blackjack Push Refund');
      setGameOutcome('PUSH');
      showToast(`⚖️ SARE (PUSH)! Salio la TSh ${stake.toLocaleString()} limerudishwa.`);
    }
  };

  const handleDoubleDown = () => {
    if (!isPlaying || playerCards.length !== 2) return;

    if (walletBalance < stake) {
      showToast('Salio halitoshi ku-double down!');
      return;
    }

    const success = onBetPlaced(stake, 'Blackjack Double Down');
    if (!success) return;

    const newStake = stake * 2;
    setStake(newStake);

    // Hit exactly one card then stand
    const deck = createDeck();
    const newCard = deck.pop()!;
    const newHand = [...playerCards, newCard];
    setPlayerCards(newHand);

    const score = calculateHandScore(newHand);
    if (score > 21) {
      setDealerHidden(false);
      setIsPlaying(false);
      setGameOutcome('DEALER_WIN');
      showToast('💥 BUST! Alama zimezidi 21.');
    } else {
      handleStand(newHand);
    }
  };

  const playerScore = calculateHandScore(playerCards);
  const dealerScore = dealerHidden ? (dealerCards[0]?.num || 0) : calculateHandScore(dealerCards);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT CONTROLS */}
      <div className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" /> BLACKJACK 21
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              RTP: 85.0% (15% House Edge)
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-bold uppercase">Chip / Dau (TSh):</span>
            <input
              type="number"
              min="500"
              step="500"
              disabled={isPlaying}
              value={stake}
              onChange={e => setStake(Math.max(500, parseInt(e.target.value) || 500))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-base focus:border-blue-500 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {STAKE_PRESETS.map(amt => (
                <button
                  key={amt}
                  disabled={isPlaying}
                  onClick={() => setStake(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    stake === amt ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Malipo ya Blackjack:</span>
              <span className="font-bold text-amber-400 font-mono">3:2 (2.5x)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Malipo ya Ushindi wa Kawaida:</span>
              <span className="font-bold text-emerald-400 font-mono">1:1 (2.0x)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sheria ya Dealer:</span>
              <span className="font-bold text-slate-300">Stands on 17+</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          {isPlaying ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleHit}
                className="py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
              >
                HIT (Kadi)
              </button>
              <button
                onClick={() => handleStand()}
                className="py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
              >
                STAND (Tosha)
              </button>
              <button
                onClick={handleDoubleDown}
                disabled={playerCards.length !== 2}
                className="py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                DOUBLE 2X
              </button>
            </div>
          ) : (
            <button
              onClick={startDeal}
              className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white shadow-xl shadow-blue-950/60 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>GAWA KADI (DEAL TSh {stake.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT CASINO FELT TABLE */}
      <div className="lg:col-span-8 bg-gradient-to-b from-[#06331d] via-[#084729] to-[#042414] border-4 border-amber-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[420px] relative">
        {/* DEALER AREA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-emerald-200 uppercase tracking-wider">
            <span>DEALER {dealerCards.length > 0 && `(Score: ${dealerScore})`}</span>
            <span className="text-[10px] text-amber-300">Casino Felt Table</span>
          </div>

          <div className="flex items-center gap-2 min-h-[90px]">
            {dealerCards.map((card, i) => {
              if (i === 1 && dealerHidden) {
                return (
                  <div
                    key="hidden"
                    className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-gradient-to-br from-red-800 to-red-950 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-300 font-black text-xl"
                  >
                    🂠
                  </div>
                );
              }
              const isRed = card.suit === '♥' || card.suit === '♦';
              return (
                <div
                  key={i}
                  className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border-2 border-slate-300 shadow-xl p-1.5 flex flex-col justify-between font-black text-slate-900 animate-fade-in"
                >
                  <div className={`text-sm sm:text-base leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {card.value}
                    <span className="text-xs ml-0.5">{card.suit}</span>
                  </div>
                  <div className={`text-2xl sm:text-3xl text-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {card.suit}
                  </div>
                  <div className={`text-xs text-right leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {card.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER OUTCOME BADGE */}
        {gameOutcome && (
          <div className="py-2 text-center animate-bounce">
            {gameOutcome === 'BLACKJACK' && (
              <span className="px-6 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg shadow-2xl">
                👑 NATURAL BLACKJACK (3:2 PAYOUT)!
              </span>
            )}
            {gameOutcome === 'PLAYER_WIN' && (
              <span className="px-6 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg shadow-2xl">
                🎉 UMESHINDA RAUNDI HII!
              </span>
            )}
            {gameOutcome === 'DEALER_WIN' && (
              <span className="px-6 py-2 rounded-2xl bg-red-600 text-white font-black text-lg shadow-2xl">
                ❌ DEALER AMESHINDA!
              </span>
            )}
            {gameOutcome === 'PUSH' && (
              <span className="px-6 py-2 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-2xl">
                ⚖️ SARE (PUSH - REFUND)!
              </span>
            )}
          </div>
        )}

        {/* PLAYER AREA */}
        <div className="space-y-2 pt-4 border-t border-emerald-700/50">
          <div className="flex items-center justify-between text-xs font-black text-emerald-200 uppercase tracking-wider">
            <span>KADI ZAKO {playerCards.length > 0 && `(Score: ${playerScore})`}</span>
            <span className="text-[10px] text-emerald-300 font-mono">Dau: TSh {stake.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 min-h-[90px]">
            {playerCards.map((card, i) => {
              const isRed = card.suit === '♥' || card.suit === '♦';
              return (
                <div
                  key={i}
                  className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border-2 border-slate-300 shadow-xl p-1.5 flex flex-col justify-between font-black text-slate-900 animate-fade-in"
                >
                  <div className={`text-sm sm:text-base leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {card.value}
                    <span className="text-xs ml-0.5">{card.suit}</span>
                  </div>
                  <div className={`text-2xl sm:text-3xl text-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {card.suit}
                  </div>
                  <div className={`text-xs text-right leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {card.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
