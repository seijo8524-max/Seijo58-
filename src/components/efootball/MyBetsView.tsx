import React, { useState } from 'react';
import { EFootballTicket } from '../../types/efootball';
import { checkSelectionResult } from '../../data/efootballMatches';
import { 
  Receipt, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  ArrowRight, 
  Copy, 
  Check, 
  Gamepad2, 
  Sparkles, 
  AlertCircle, 
  ChevronRight,
  RefreshCw,
  Wallet
} from 'lucide-react';

interface MyBetsViewProps {
  tickets: EFootballTicket[];
  walletBalance: number;
  onNavigateToEFootball: () => void;
  onOpenDeposit: () => void;
  onSettleTicket: (ticketId: string, outcome: 'WON' | 'LOST') => void;
  showToast: (msg: string) => void;
}

export const MyBetsView: React.FC<MyBetsViewProps> = ({
  tickets,
  walletBalance,
  onNavigateToEFootball,
  onOpenDeposit,
  onSettleTicket,
  showToast,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'WON' | 'LOST'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTicket = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    showToast(`Namba ya Tiketi ${id} imenakiliwa!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const pendingCount = tickets.filter(t => t.status === 'PENDING').length;
  const wonCount = tickets.filter(t => t.status === 'WON').length;
  const lostCount = tickets.filter(t => t.status === 'LOST').length;

  const totalWonAmount = tickets
    .filter(t => t.status === 'WON')
    .reduce((sum, t) => sum + t.potentialPayout, 0);

  const totalStaked = tickets.reduce((sum, t) => sum + t.stake, 0);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & METRICS */}
      <div className="bg-gradient-to-r from-red-950 via-[#0a0f1d] to-slate-900 border-2 border-red-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow">
                <Receipt className="w-3.5 h-3.5" />
                MY BETS / MIKEKA YANGU
              </span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                SEIJO58 EFOOTBALL CAMP ™
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Tiketi Zako za eFootball &amp; Malipo ya Moja kwa Moja
            </h2>
            <p className="text-xs text-slate-300">
              Fuatilia hali ya mikeka yako, matokeo ya nusu fainali na malipo ya papo hapo kwenye pochi.
            </p>
          </div>

          <button
            onClick={onNavigateToEFootball}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>WEKA MKEKA MPYA</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* METRICS STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Jumla ya Mikeka</span>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              {tickets.length}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">TSh {totalStaked.toLocaleString()} staked</span>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase block">Inasubiri (Pending)</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-400 font-mono mt-0.5">
              {pendingCount}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Kabla ya Saa 2:00</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">Umeshinda (Won)</span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              {wonCount}
            </div>
            <span className="text-[10px] text-emerald-300 font-mono">+{totalWonAmount.toLocaleString()} TSh</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Salio la Pochi</span>
            <div className="text-lg sm:text-xl font-black text-sky-400 font-mono mt-0.5">
              TSh {walletBalance.toLocaleString()}
            </div>
            <button 
              onClick={onOpenDeposit}
              className="text-[10px] text-amber-400 hover:underline font-bold"
            >
              Weka Pesa
            </button>
          </div>

        </div>
      </div>

      {/* 2. FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'ALL'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Yote ({tickets.length})
          </button>

          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Inasubiri ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilter('WON')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filter === 'WON'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Umeshinda ({wonCount})</span>
          </button>

          <button
            onClick={() => setFilter('LOST')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filter === 'LOST'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-rose-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Umekosa ({lostCount})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Malipo huingizwa moja kwa moja bila kuchelewa</span>
        </div>
      </div>

      {/* 3. TICKETS LIST */}
      {filteredTickets.length === 0 ? (
        <div className="bg-[#0b101d] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Receipt className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white">
              Hakuna Tiketi Kwenye Sehemu Hii
            </h3>
            <p className="text-xs text-slate-400">
              Hujatengeneza mkeka au hakuna tiketi yenye hadhi ya {filter}. Fungua ukurasa wa eFootball kuchagua odds za nusu fainali.
            </p>
          </div>
          <button
            onClick={onNavigateToEFootball}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>FUNGUA EFOOTBALL MECHI &amp; WEKA MKEKA</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className={`bg-[#0b101d] border-2 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 transition-all relative overflow-hidden ${
                ticket.status === 'WON'
                  ? 'border-emerald-500/60 shadow-emerald-950/40'
                  : ticket.status === 'LOST'
                  ? 'border-rose-900/60 opacity-80'
                  : 'border-slate-800 hover:border-amber-500/50'
              }`}
            >
              {/* Ticket Top Ribbon / Header */}
              <div className={`-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 p-4 sm:p-5 rounded-t-3xl border-b flex items-center justify-between transition-colors ${
                ticket.status === 'WON'
                  ? 'bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-[#0b101d] border-emerald-500/60'
                  : ticket.status === 'LOST'
                  ? 'bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-[#0b101d] border-rose-600/50'
                  : 'bg-slate-900/40 border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-white flex items-center gap-1.5">
                    <Receipt className={`w-3.5 h-3.5 ${ticket.status === 'WON' ? 'text-emerald-400' : ticket.status === 'LOST' ? 'text-rose-400' : 'text-red-500'}`} />
                    <span>#{ticket.id}</span>
                  </span>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${
                    ticket.status === 'WON'
                      ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40'
                      : ticket.status === 'LOST'
                      ? 'text-rose-300 bg-rose-500/20 border-rose-500/40'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    Stake: TSh {Number(ticket.stake || (ticket as any).amount || 1000).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleCopyTicket(ticket.id)}
                    className="text-slate-500 hover:text-white transition-colors"
                    title="Nakili Namba ya Tiketi"
                  >
                    {copiedId === ticket.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Status Badges */}
                {ticket.status === 'PENDING' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 font-black text-xs uppercase shadow-md animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>🟡 INASUBIRI / PENDING</span>
                  </span>
                )}

                {ticket.status === 'WON' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-emerald-950/60 border border-emerald-300 ring-2 ring-emerald-500/50 animate-pulse">
                    <Trophy className="w-4 h-4 text-slate-950" />
                    <span>🟢 WON / UMESHINDA (+TSh {Number(ticket.potentialPayout || Math.floor((ticket.stake || 1000) * (ticket.totalOdds || 1))).toLocaleString()})</span>
                  </span>
                )}

                {ticket.status === 'LOST' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase shadow-lg border border-rose-400 ring-1 ring-rose-500/40">
                    <XCircle className="w-4 h-4 text-white" />
                    <span>🔴 LOST / UMEKOSA</span>
                  </span>
                )}
              </div>

              {/* Selections Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Mechi &amp; Machaguo ({ticket.selections.length})</span>
                  <span>Odds</span>
                </div>

                <div className="space-y-2">
                  {ticket.selections.map((sel, idx) => {
                    const verdict = checkSelectionResult(sel.matchId, sel.marketType, sel.selection);
                    return (
                      <div
                        key={idx}
                        className={`bg-slate-900/80 border rounded-2xl p-2.5 flex items-center justify-between gap-2 ${
                          verdict.isPending
                            ? 'border-amber-500/40 bg-amber-950/10'
                            : verdict.isWin 
                            ? 'border-emerald-500/40 bg-emerald-950/20' 
                            : 'border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-red-400 uppercase block">
                              {sel.stageName}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {verdict.scoreDisplay}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white">
                            {sel.matchTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.2 rounded">
                              {sel.selection}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {sel.marketName}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              verdict.isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : verdict.isWin
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {verdict.reason}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2 py-1 rounded-xl border font-mono font-black text-xs ${
                            verdict.isPending
                              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                              : verdict.isWin
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}>
                            {sel.odds.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Breakdown (Stake, Multiplier & Payout) */}
              {(() => {
                const stakeAmount = Number(ticket.stake) || Number((ticket as any).amount) || 1000;
                const totalOddsVal = Number(ticket.totalOdds) || 1.0;
                const payoutVal = Number(ticket.potentialPayout) || Math.floor(stakeAmount * totalOddsVal);
                return (
                  <div className="bg-gradient-to-r from-slate-950 via-[#0d162a] to-slate-950 border-2 border-amber-500/50 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="text-base">💰</span>
                        <span>Kiasi Kilichowekwa (Stake):</span>
                      </span>
                      <span className="font-mono font-black text-white text-sm sm:text-base bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        TSh {stakeAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="text-base">📊</span>
                        <span>Jumla ya Odds (Total Odds):</span>
                      </span>
                      <span className="font-mono font-black text-amber-400 text-sm sm:text-base bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {totalOddsVal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800">
                      <span className="font-black text-slate-100 flex items-center gap-1.5">
                        <span className="text-base">🎁</span>
                        <span>{ticket.status === 'WON' ? 'Malipo Yaliyolipwa (Payout):' : 'Tarajiwa / Ushindi (Payout):'}</span>
                      </span>
                      <span className={`font-mono font-black text-sm sm:text-base px-2.5 py-0.5 rounded-lg border ${
                        ticket.status === 'WON' 
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' 
                          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      }`}>
                        TSh {payoutVal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Action & Simulation Bar (for evaluating bets and testing win payouts) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <span className="text-slate-500 text-[10px]">
                  Iliwekwa: {ticket.createdAt} • Saa 2:00 Usiku
                </span>

                {ticket.status === 'PENDING' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSettleTicket(ticket.id, 'WON')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] flex items-center gap-1 shadow transition-transform active:scale-95"
                      title="Chezesha matokeo ya ushindi na pokea malipo papo hapo"
                    >
                      <Trophy className="w-3 h-3 text-amber-300" />
                      <span>Thibitisha Ushindi (WIN)</span>
                    </button>

                    <button
                      onClick={() => onSettleTicket(ticket.id, 'LOST')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 font-bold text-[10px] transition-colors"
                      title="Weka kama haikufanikiwa"
                    >
                      <span>Kosa (LOST)</span>
                    </button>
                  </div>
                )}

                {ticket.status === 'WON' && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Malipo yameingizwa kwenye pochi kikamilifu</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 4. FOOTER ADVISORY */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Mikeka yote huhifadhiwa kwenye kumbukumbu ya kifaa chako (localStorage). Hata ukifunga au ku-refresh ukurasa, tiketi zako hazipotei.
          </span>
        </div>
      </div>

    </div>
  );
};
