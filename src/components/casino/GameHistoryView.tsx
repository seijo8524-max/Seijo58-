import React, { useState } from 'react';
import { GameBetRecord } from '../../types/casino';
import { History, TrendingUp, Filter, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';

interface GameHistoryProps {
  betHistory: GameBetRecord[];
}

export function GameHistoryView({ betHistory }: GameHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WON' | 'LOST' | 'CASHOUT'>('ALL');

  const filteredHistory = betHistory.filter(b => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const totalBets = betHistory.length;
  const totalWon = betHistory.filter(b => b.status === 'WON' || b.status === 'CASHOUT').length;
  const winRate = totalBets > 0 ? Math.round((totalWon / totalBets) * 100) : 0;
  const totalStaked = betHistory.reduce((acc, curr) => acc + curr.stake, 0);
  const totalPayout = betHistory.reduce((acc, curr) => acc + curr.payout, 0);
  const netProfit = totalPayout - totalStaked;

  return (
    <div className="space-y-5">
      {/* TOP SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Jumla ya Raundi:</span>
          <div className="font-mono font-black text-xl sm:text-2xl text-white">{totalBets}</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Kiwango cha Ushindi:</span>
          <div className="font-mono font-black text-xl sm:text-2xl text-emerald-400">{winRate}%</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Jumla ya Dau:</span>
          <div className="font-mono font-black text-xl sm:text-2xl text-slate-200">
            TSh {totalStaked.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Faida Halisi (Net Profit):</span>
          <div
            className={`font-mono font-black text-xl sm:text-2xl ${
              netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}TSh {netProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-[#0f172a] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Chuja kwa Matokeo:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['ALL', 'WON', 'CASHOUT', 'LOST'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'Zote' : st === 'WON' ? 'Ushindi' : st === 'CASHOUT' ? 'Cashouts' : 'Uliopoteza'}
            </button>
          ))}
        </div>
      </div>

      {/* HISTORY TABLE / LIST */}
      {filteredHistory.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-10 text-center space-y-2">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="font-bold text-white text-base">Hakuna rekodi za michezo bado</h4>
          <p className="text-xs text-slate-400">
            Anza kucheza Aviator, Mines au Slots ili kuona historia ya raundi zako hapa.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800/80">
            {filteredHistory.map(b => {
              const isWin = b.status === 'WON' || b.status === 'CASHOUT';
              return (
                <div key={b.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isWin
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-950/80 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {isWin ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{b.gameName}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isWin ? 'bg-emerald-600 text-white' : 'bg-red-900/60 text-red-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Dau: <strong className="text-slate-300 font-mono">TSh {b.stake.toLocaleString()}</strong> • Multiplier: <strong className="text-amber-400 font-mono">{b.multiplier.toFixed(2)}x</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5 shrink-0">
                    <div className={`font-mono font-black text-sm sm:text-base ${isWin ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {isWin ? `+TSh ${b.payout.toLocaleString()}` : 'TSh 0'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{b.timestamp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
