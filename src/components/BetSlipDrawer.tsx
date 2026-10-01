import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Send, 
  MessageCircle, 
  TrendingUp, 
  Ticket, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { BetSlipItem } from '../types';
import { calculateAccumulatorOdds, calculatePayout } from '../utils/oddsEngine';
import { CHANNEL_CONFIG } from '../data/mockMatches';

interface BetSlipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BetSlipItem[];
  onRemoveItem: (matchId: string, selection: string) => void;
  onClearSlip: () => void;
}

export const BetSlipDrawer: React.FC<BetSlipDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearSlip,
}) => {
  const [stake, setStake] = useState<number>(10000); // 10,000 UGX / units
  const [copiedCode, setCopiedCode] = useState(false);

  const totalOdds = calculateAccumulatorOdds(items.map(i => i.odds));
  const potentialPayout = calculatePayout(stake, totalOdds);

  const bookingCode = `SEIJO58-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCopySlip = () => {
    if (items.length === 0) return;

    let slipText = `🔥 SEIJO58 BET ACCUMULATOR SLIP 🔥\n`;
    slipText += `🔖 Booking Code: ${bookingCode}\n`;
    slipText += `📊 Total Odds: ${totalOdds.toFixed(2)}\n\n`;

    items.forEach((item, index) => {
      slipText += `${index + 1}. ${item.homeTeam} vs ${item.awayTeam}\n   👉 Pick: ${item.selection} @ ${item.odds.toFixed(2)}\n`;
    });

    slipText += `\n💰 Potential Return on ${stake.toLocaleString()}: ${potentialPayout.toLocaleString()}\n`;
    slipText += `🚀 Join Official Channel: ${CHANNEL_CONFIG.telegramLink}`;

    navigator.clipboard.writeText(slipText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0b0f19] border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>SEIJO58 Bet Slip</span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                  {items.length} {items.length === 1 ? 'Pick' : 'Picks'}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Live Accumulator Multiplier</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearSlip}
                className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold transition-colors flex items-center gap-1"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slip Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Your Bet Slip is Empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Tap the odds button on any Free or VIP match card to build your winning accumulator ticket.
                </p>
              </div>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.matchId}-${item.selection}`}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 relative group space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      {item.league}
                    </span>
                    <h5 className="text-xs font-bold text-white">
                      {item.homeTeam} vs {item.awayTeam}
                    </h5>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.matchId, item.selection)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <div className="text-xs font-black text-emerald-400">
                    {item.selection}
                  </div>
                  <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-xs">
                    {item.odds.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payout & Actions Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
            {/* Multiplier & Stake Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Total Accumulator Multiplier:</span>
                <span className="text-lg font-black text-emerald-400">{totalOdds.toFixed(2)} Odds</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Stake Amount (UGX / Currency)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={stake}
                    onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[5000, 10000, 20000, 50000].map(val => (
                      <button
                        key={val}
                        onClick={() => setStake(val)}
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                          stake === val ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Potential Return</span>
                  <span className="text-base sm:text-lg font-black text-emerald-300 font-mono">
                    {potentialPayout.toLocaleString()} UGX
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                  +{((totalOdds - 1) * 100).toFixed(0)}% ROI
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                id="btn-copy-slip"
                onClick={handleCopySlip}
                className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                  copiedCode
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>SLIP COPIED TO CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY BET SLIP & SHARE</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={CHANNEL_CONFIG.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
                <a
                  href={CHANNEL_CONFIG.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
