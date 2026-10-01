import React, { useState, useEffect } from 'react';
import { 
  TOURNAMENT_TEAMS, 
  TournamentTeam, 
  calculateFinalistPairOdds, 
  FEATURED_FINALIST_PAIRS 
} from '../../data/efootballMatches';
import { EFootballBetSelection, EFootballTicket } from '../../types/efootball';
import { 
  Trophy, 
  Clock, 
  Lock, 
  Unlock, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Swords, 
  Zap, 
  Check, 
  Layers, 
  ChevronRight, 
  RotateCcw,
  Sliders,
  Wallet
} from 'lucide-react';

interface TournamentOutrightViewProps {
  walletBalance: number;
  onSelectOdd: (selection: EFootballBetSelection) => void;
  isSelectionInSlip: (matchId: string, marketType: string, selection: string) => boolean;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWinPayout: (amount: number, ticketId: string, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
  tickets: EFootballTicket[];
  setTickets: React.Dispatch<React.SetStateAction<EFootballTicket[]>>;
  currentUserId?: string;
  currentUserEmail?: string;
}

export const TournamentOutrightView: React.FC<TournamentOutrightViewProps> = ({
  walletBalance,
  onSelectOdd,
  isSelectionInSlip,
  onBetPlaced,
  onWinPayout,
  onOpenDeposit,
  showToast,
  tickets,
  setTickets,
  currentUserId,
  currentUserEmail
}) => {
  // 1. THREE-DAY TIMER & LOCK LOGIC (SIKU 3 DRILL)
  // 72 hours window until Quarter-Finals commence
  const [deadlineMs, setDeadlineMs] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('seijo58_tournament_outright_deadline');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch (e) {}
    const defaultDeadline = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 Days (72 Hours)
    try {
      localStorage.setItem('seijo58_tournament_outright_deadline', String(defaultDeadline));
    } catch (e) {}
    return defaultDeadline;
  });

  const [isAdminLocked, setIsAdminLocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('seijo58_tournament_outright_locked') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [timeRemaining, setTimeRemaining] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    totalSeconds: number;
    isExpired: boolean;
  }>({
    days: '03',
    hours: '00',
    minutes: '00',
    seconds: '00',
    totalSeconds: 259200,
    isExpired: false
  });

  // Calculate Countdown Clock every second
  useEffect(() => {
    const updateTimer = () => {
      if (isAdminLocked) {
        setTimeRemaining({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          totalSeconds: 0,
          isExpired: true
        });
        return;
      }

      const now = Date.now();
      const diff = deadlineMs - now;

      if (diff <= 0) {
        setTimeRemaining({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          totalSeconds: 0,
          isExpired: true
        });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const d = Math.floor(totalSec / (3600 * 24));
      const h = Math.floor((totalSec % (3600 * 24)) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      setTimeRemaining({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
        totalSeconds: totalSec,
        isExpired: false
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs, isAdminLocked]);

  const isMarketLocked = isAdminLocked || timeRemaining.isExpired;

  // 2. INTERACTIVE FINALIST BUILDER STATE
  const [finalistTeam1, setFinalistTeam1] = useState<string>('DOUBLE J');
  const [finalistTeam2, setFinalistTeam2] = useState<string>('MSODOKI');

  // Quick Stake Modal State for direct betting
  const [quickStakeModal, setQuickStakeModal] = useState<{
    isOpen: boolean;
    selection?: EFootballBetSelection;
    stake: number;
  }>({
    isOpen: false,
    stake: 1000
  });

  // 3. ADMIN SETTLEMENT STATE
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [settledData, setSettledData] = useState<{
    isSettled: boolean;
    champion?: string;
    finalist1?: string;
    finalist2?: string;
    settledAt?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('seijo58_tournament_settlement');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { isSettled: false };
  });

  const [adminSelectedChampion, setAdminSelectedChampion] = useState<string>('DOUBLE J');
  const [adminSelectedFinalist1, setAdminSelectedFinalist1] = useState<string>('DOUBLE J');
  const [adminSelectedFinalist2, setAdminSelectedFinalist2] = useState<string>('MSODOKI');

  // Interactive Pair Odds
  const currentPairOdds = calculateFinalistPairOdds(finalistTeam1, finalistTeam2);

  // Helper to handle Odd Pick
  const handlePickChampion = (team: TournamentTeam) => {
    if (isMarketLocked) {
      showToast('🔒 Soko hili limefungwa! Robo Fainali zimeanza na hakuna ubashiri mpya unaoruhusiwa.');
      return;
    }

    const sel: EFootballBetSelection = {
      matchId: 'tournament-outright-champion',
      matchTitle: '🏆 SEIJO58 SPECIAL TOURNAMENT: BINGWA WA MASHINDANO',
      stageName: 'SIKU 3 FLAGGED MARKET • ROBO FAINALI INAKARIBIA',
      marketType: 'OUTRIGHT_CHAMPION',
      marketName: 'Bingwa wa Mashindano (12 Teams)',
      selection: team.name,
      odds: team.championOdds
    };

    onSelectOdd(sel);
    setQuickStakeModal({
      isOpen: true,
      selection: sel,
      stake: 1000
    });
    showToast(`🎯 Imeongezwa: Bingwa - ${team.name} (@ ${team.championOdds.toFixed(2)}). Weka kiasi cha bet!`);
  };

  const handlePickFinalists = (teamA: string, teamB: string, odds: number) => {
    if (isMarketLocked) {
      showToast('🔒 Soko hili limefungwa! Robo Fainali zimeanza na hakuna ubashiri mpya unaoruhusiwa.');
      return;
    }

    if (teamA === teamB) {
      showToast('⚠️ Tafadhali chagua timu mbili tofauti zitakazoingia Fainali.');
      return;
    }

    const pairLabel = `${teamA} & ${teamB}`;
    const sel: EFootballBetSelection = {
      matchId: 'tournament-outright-finalists',
      matchTitle: '🏆 SEIJO58 SPECIAL TOURNAMENT: TIMU MBILI ZA FAINALI',
      stageName: 'SIKU 3 FLAGGED MARKET • ROBO FAINALI INAKARIBIA',
      marketType: 'OUTRIGHT_FINALISTS',
      marketName: 'Timu Mbili Zitakazoingia Fainali (Grand Finalists)',
      selection: pairLabel,
      odds: odds
    };

    onSelectOdd(sel);
    setQuickStakeModal({
      isOpen: true,
      selection: sel,
      stake: 1000
    });
    showToast(`🎯 Imeongezwa: Wafainali - ${pairLabel} (@ ${odds.toFixed(2)}). Weka kiasi cha bet!`);
  };

  // Direct Bet Execution for Outright
  const handleExecuteQuickBet = () => {
    if (!quickStakeModal.selection) return;
    if (isMarketLocked) {
      showToast('🔒 Soko limefungwa.');
      return;
    }

    const stake = quickStakeModal.stake;
    if (stake < 500) {
      showToast('⚠️ Kiwango cha chini cha kubeti ni TSh 500!');
      return;
    }

    if (walletBalance < stake) {
      showToast('❌ Salio halitoshi kwenye pochi yako! Weka pesa uendelee.');
      onOpenDeposit();
      return;
    }

    const sel = quickStakeModal.selection;
    const betTitle = `Tournament Outright: ${sel.selection} (@ ${sel.odds.toFixed(2)})`;
    const success = onBetPlaced(stake, betTitle);

    if (success) {
      const ticketRef = `MK-TRN-${Math.floor(100000 + Math.random() * 900000)}`;
      const potentialPayout = Math.floor(stake * sel.odds);

      const newTicket: EFootballTicket = {
        id: ticketRef,
        userId: currentUserId || 'user_guest',
        userEmail: currentUserEmail || '',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        kickoffTime: 'Siku 3 • Robo Fainali',
        stake: stake,
        totalOdds: sel.odds,
        potentialPayout: potentialPayout,
        status: 'PENDING',
        selections: [sel],
        paidOut: false,
        outcomeNotes: 'Inasubiri Hatua ya Robo Fainali na Uamuzi wa Fainali Kuu ⏳'
      };

      const updated = [newTicket, ...tickets];
      setTickets(updated);
      try {
        localStorage.setItem('seijo58_efootball_tickets', JSON.stringify(updated));
      } catch (e) {}

      showToast(`🎉 Mkeka #${ticketRef} umewekwa! Unasubiri Robo Fainali na Fainali Kuu.`);
      setQuickStakeModal({ isOpen: false, stake: 1000 });
    }
  };

  // ADMIN ACTIONS
  const handleToggleLock = () => {
    const next = !isAdminLocked;
    setIsAdminLocked(next);
    try {
      localStorage.setItem('seijo58_tournament_outright_locked', String(next));
    } catch (e) {}
    showToast(next ? '🔒 Soko la Mashindano limefungwa (Robo Fainali zimeanza)!' : '🔓 Soko limefunguliwa tena!');
  };

  const handleResetThreeDays = () => {
    const newDeadline = Date.now() + 3 * 24 * 60 * 60 * 1000;
    setDeadlineMs(newDeadline);
    setIsAdminLocked(false);
    try {
      localStorage.setItem('seijo58_tournament_outright_deadline', String(newDeadline));
      localStorage.setItem('seijo58_tournament_outright_locked', 'false');
    } catch (e) {}
    showToast('⏱️ Kipima muda cha Siku 3 kimerudishwa upya (Masaa 72)!');
  };

  // ADMIN SETTLE OUTRIGHT BETS (AWARDS PAYOUTS)
  const handleConfirmSettlement = () => {
    if (adminSelectedFinalist1 === adminSelectedFinalist2) {
      showToast('⚠️ Tafadhali chagua timu mbili tofauti za Wafainali.');
      return;
    }

    const settlement = {
      isSettled: true,
      champion: adminSelectedChampion,
      finalist1: adminSelectedFinalist1,
      finalist2: adminSelectedFinalist2,
      settledAt: new Date().toLocaleTimeString()
    };

    setSettledData(settlement);
    try {
      localStorage.setItem('seijo58_tournament_settlement', JSON.stringify(settlement));
    } catch (e) {}

    // Iterate through all tickets and settle outright bets
    let wonTicketsCount = 0;
    let lostTicketsCount = 0;
    let totalPaidOut = 0;

    const updatedTickets = tickets.map(ticket => {
      const hasOutrightSel = ticket.selections.some(
        s => s.matchId.startsWith('tournament-outright') || s.marketType.startsWith('OUTRIGHT')
      );

      if (!hasOutrightSel) return ticket;
      if (ticket.status === 'WON' && ticket.paidOut) return ticket;
      if (ticket.status === 'LOST') return ticket;

      const isOwned = Boolean(
        (currentUserId && ticket.userId === currentUserId) ||
        (currentUserEmail && ticket.userEmail && ticket.userEmail.toLowerCase() === currentUserEmail.toLowerCase())
      );

      let allPicksWon = true;
      let reasonText = '';

      for (const sel of ticket.selections) {
        if (sel.marketType === 'OUTRIGHT_CHAMPION') {
          const pick = sel.selection.trim().toUpperCase();
          const target = adminSelectedChampion.trim().toUpperCase();
          if (pick !== target && !pick.includes(target)) {
            allPicksWon = false;
            reasonText = `Bingwa rasmi aliyetawazwa ni ${adminSelectedChampion}`;
            break;
          }
        } else if (sel.marketType === 'OUTRIGHT_FINALISTS') {
          const pick = sel.selection.trim().toUpperCase();
          const f1 = adminSelectedFinalist1.trim().toUpperCase();
          const f2 = adminSelectedFinalist2.trim().toUpperCase();
          if (!pick.includes(f1) || !pick.includes(f2)) {
            allPicksWon = false;
            reasonText = `Wafainali rasmi walikuwa ${adminSelectedFinalist1} & ${adminSelectedFinalist2}`;
            break;
          }
        }
      }

      if (allPicksWon) {
        wonTicketsCount++;
        const payout = ticket.potentialPayout || Math.floor(ticket.stake * ticket.totalOdds);
        totalPaidOut += payout;

        if (isOwned && !ticket.paidOut) {
          onWinPayout(payout, ticket.id, `SEIJO58 Tournament Outright Won: #${ticket.id}`);
        }

        return {
          ...ticket,
          status: 'WON' as const,
          paidOut: true,
          settledAt: new Date().toLocaleTimeString(),
          outcomeNotes: `🏆 Bingwa: ${adminSelectedChampion} | Wafainali: ${adminSelectedFinalist1} & ${adminSelectedFinalist2} (Umeshinda!)`
        };
      } else {
        lostTicketsCount++;
        return {
          ...ticket,
          status: 'LOST' as const,
          paidOut: false,
          settledAt: new Date().toLocaleTimeString(),
          outcomeNotes: reasonText || 'Utabiri wa mashindano haukufanikiwa.'
        };
      }
    });

    setTickets(updatedTickets);
    try {
      localStorage.setItem('seijo58_efootball_tickets', JSON.stringify(updatedTickets));
    } catch (e) {}

    showToast(`✅ Mashindano yamesuluhishwa! Bingwa: ${adminSelectedChampion}. Mikeka ${wonTicketsCount} imeshinda, ${lostTicketsCount} imekosa.`);
    setIsAdminPanelOpen(false);
  };

  const handleResetSettlement = () => {
    setSettledData({ isSettled: false });
    try {
      localStorage.removeItem('seijo58_tournament_settlement');
    } catch (e) {}
    showToast('Usuluhishi wa Mashindano umerejeshwa nyuma (Inasubiri).');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SIKU 3 FLAGGED MARKET COUNTDOWN BANNER */}
      <div className={`relative overflow-hidden rounded-3xl border-2 p-5 sm:p-7 shadow-2xl transition-all ${
        isMarketLocked 
          ? 'bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 border-rose-500/60 shadow-rose-950/40' 
          : 'bg-gradient-to-r from-red-950 via-[#0c1222] to-amber-950 border-amber-500/70 shadow-amber-950/40'
      }`}>
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                SIKU 3 FLAGGED MARKET
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase shadow">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                SEIJO58 TOURNAMENT OUTRIGHTS
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase border ${
                isMarketLocked
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              }`}>
                {isMarketLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    🔒 LIMEFUNGWA (QUARTER-FINALS BEGUN)
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    🟢 SOKO LIKO WAZI (OPEN TO BET)
                  </>
                )}
              </span>
            </div>

            {/* Admin Toggle button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Usimamizi</span>
              </button>
            </div>
          </div>

          {/* Banner Title & Description */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
              <span>🏆 UBASHIRI MAALUM WA MASHINDANO (OUTRIGHT BETS)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Soko hili linafungwa kiotomatiki baada ya <strong className="text-amber-300">Siku 3 (Masaa 72)</strong> pale hatua ya <strong className="text-white">Robo Fainali (Quarter-Finals)</strong> inapoanza rasmi! Weka mkeka wa <strong className="text-emerald-400">Bingwa wa Mashindano</strong> au <strong className="text-sky-400">Timu 2 Zitakazoingia Fainali</strong>.
            </p>
          </div>

          {/* COUNTDOWN CLOCK TILES */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                {isMarketLocked 
                  ? 'MUDA WA KUWEKA MKEKA UMEKWISHA' 
                  : 'KIPIMA MUDA: MUDA ULIOBAKI KABLA SOKO HALIJAFUNGWA (SIKU 3 DRILL)'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                12 TEAMS • QUARTER-FINALS LOCK
              </span>
            </div>

            {/* Digital Timer Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-inner">
                <div className="text-2xl sm:text-4xl font-black font-mono text-amber-400 tracking-wider">
                  {timeRemaining.days}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  SIKU (DAYS)
                </div>
              </div>

              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-inner">
                <div className="text-2xl sm:text-4xl font-black font-mono text-white tracking-wider">
                  {timeRemaining.hours}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  MASAA (HRS)
                </div>
              </div>

              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-inner">
                <div className="text-2xl sm:text-4xl font-black font-mono text-white tracking-wider">
                  {timeRemaining.minutes}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  DAKIKA (MINS)
                </div>
              </div>

              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-inner">
                <div className="text-2xl sm:text-4xl font-black font-mono text-red-500 tracking-wider">
                  {timeRemaining.seconds}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  SEKUNDE (SECS)
                </div>
              </div>

            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isMarketLocked 
                      ? 'bg-rose-600' 
                      : 'bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500'
                  }`}
                  style={{
                    width: isMarketLocked 
                      ? '100%' 
                      : `${Math.min(100, Math.max(5, (timeRemaining.totalSeconds / 259200) * 100))}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Mwanzo wa Kipindi (Day 1)</span>
                <span>{isMarketLocked ? 'LOCKED / MECHI ZINAANZA' : 'Robo Fainali Zitaanza Baada ya Masaa Haya'}</span>
                <span>Fainali Kuu (Day 3)</span>
              </div>
            </div>

            {/* Lock Notice if Locked */}
            {isMarketLocked && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
                <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="text-xs text-rose-300">
                  <span className="font-black">SOKO LIMEFUNGWA RASMI!</span> Hatua ya Robo Fainali imeanza. Mikeka yote iliyowekwa imehifadhiwa kama <span className="font-bold text-amber-300">PENDING (IN WAITING)</span> kwenye "My Bets / Mikeka Yangu" hadi mashindano yatakapomalizika.
                </div>
              </div>
            )}

            {/* Settlement Status Banner if already settled */}
            {settledData.isSettled && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs text-emerald-300">
                  <span className="font-black">MASHINDANO YAMESULUHISHWA!</span> 
                  👑 Bingwa: <strong className="text-amber-300 font-mono">{settledData.champion}</strong> | 
                  🏁 Wafainali: <strong className="text-white font-mono">{settledData.finalist1} &amp; {settledData.finalist2}</strong>. Malipo yote yameingizwa kwenye pochi!
                </div>
              </div>
            )}
          </div>

          {/* ADMIN MANAGEMENT DRAWER */}
          {isAdminPanelOpen && (
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase">
                    Admin: Usimamizi wa Soko la Mashindano &amp; Usuluhishi
                  </h3>
                </div>
                <button
                  onClick={() => setIsAdminPanelOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Funga
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Control 1: Lock Toggle & Reset */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <h4 className="text-xs font-black text-amber-300 uppercase">
                    1. Udhibiti wa Muda &amp; Kufunga Soko
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Funga soko kwa mkono kabla ya muda ikiwa Robo Fainali zimeanza, au rejesha upya masaa 72 kwa ajili ya majaribio au mzunguko mpya.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleToggleLock}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow ${
                        isAdminLocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      {isAdminLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{isAdminLocked ? 'Fungua Soko (Unlock Market)' : 'Funga Soko Sasa (Lock Market)'}</span>
                    </button>

                    <button
                      onClick={handleResetThreeDays}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all border border-slate-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Weka Upya Siku 3 (Reset 72h)</span>
                    </button>
                  </div>
                </div>

                {/* Control 2: Settle Winners */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <h4 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    2. Suluhisha Washindi &amp; Lipa Zawadi
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Chagua timu iliyotwaa Ubingwa na timu 2 zilizocheza Fainali Kuu. Hii itabadilisha mikeka ya Outright kuwa WON/LOST na kulipa washindi moja kwa moja kwenye wallet!
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        👑 BINGWA WA MASHINDANO (CHAMPION):
                      </label>
                      <select
                        value={adminSelectedChampion}
                        onChange={(e) => setAdminSelectedChampion(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                      >
                        {TOURNAMENT_TEAMS.map(t => (
                          <option key={t.id} value={t.name}>
                            {t.name} (Odds @ {t.championOdds.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">
                          🏁 Mfainali 1:
                        </label>
                        <select
                          value={adminSelectedFinalist1}
                          onChange={(e) => setAdminSelectedFinalist1(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                        >
                          {TOURNAMENT_TEAMS.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">
                          🏁 Mfainali 2:
                        </label>
                        <select
                          value={adminSelectedFinalist2}
                          onChange={(e) => setAdminSelectedFinalist2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                        >
                          {TOURNAMENT_TEAMS.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleConfirmSettlement}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Suluhisha &amp; Toa Malipo</span>
                      </button>

                      {settledData.isSettled && (
                        <button
                          onClick={handleResetSettlement}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                          title="Rejesha usuluhishi"
                        >
                          Rejesha Nyuma
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2. MARKET A: TOURNAMENT CHAMPION (BINGWA WA MASHINDANO) */}
      <div className="bg-[#0b101e] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase">
                SOKO A
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>BINGWA WA MASHINDANO (TOURNAMENT CHAMPION)</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Chagua timu 1 kati ya 12 itakayotwaa Ubingwa mzima wa SEIJO58 EFOOTBALL CAMP ™. Odds zimewekwa kitaalamu kulingana na uwezo na rekodi za kila timu.
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>12 TEAMS PARTICIPATING</span>
          </div>
        </div>

        {/* 12 TEAMS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {TOURNAMENT_TEAMS.map(team => {
            const isSelected = isSelectionInSlip(
              'tournament-outright-champion',
              'OUTRIGHT_CHAMPION',
              team.name
            );

            const isChampionWinner = settledData.isSettled && settledData.champion === team.name;

            return (
              <div
                key={team.id}
                className={`bg-slate-950/80 border-2 rounded-2xl p-3.5 space-y-3 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isChampionWinner
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/50'
                    : isSelected
                    ? 'border-red-500 bg-red-950/20 shadow-lg shadow-red-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top ribbon: Team Tier & Form */}
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full font-black uppercase ${
                    team.tier === 'FAVORITE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : team.tier === 'CONTENDER'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {team.tier === 'FAVORITE' ? '🔥 FAVORITE' : team.tier === 'CONTENDER' ? '⚡ CONTENDER' : '🎲 UNDERDOG'}
                  </span>

                  {/* Form icons */}
                  <div className="flex items-center gap-0.5">
                    {team.recentForm.slice(-3).map((f, i) => (
                      <span
                        key={i}
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-black ${
                          f === 'W'
                            ? 'bg-emerald-600 text-white'
                            : f === 'D'
                            ? 'bg-amber-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-white tracking-wide">
                      {team.name}
                    </h3>
                    {isChampionWinner && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1">
                        👑 BINGWA
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-400/90 font-medium">
                    {team.tagline}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {team.description}
                  </p>
                </div>

                {/* Power Bar */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                    <span>Power Rating:</span>
                    <span className="text-white font-mono">{team.powerRating}/10</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full"
                      style={{ width: `${(team.powerRating / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Odds Selection Action Button */}
                <div className="pt-1">
                  <button
                    disabled={isMarketLocked}
                    onClick={() => handlePickChampion(team)}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-between transition-all active:scale-95 ${
                      isMarketLocked
                        ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60'
                        : 'bg-slate-900 hover:bg-red-600/30 text-white border border-slate-700 hover:border-red-500'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isMarketLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      ) : (
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{isSelected ? 'IMECHAGULIWA' : isMarketLocked ? 'LOCKED' : 'CHAGUA BINGWA'}</span>
                    </span>

                    <span className="font-mono font-black text-sm text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                      {team.championOdds.toFixed(2)}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MARKET B: TOP 2 FINALISTS (TIMU MBILI ZITAKAZOINGIA FAINALI) */}
      <div className="bg-[#0b101e] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-600/20 text-sky-400 border border-sky-500/30 text-[10px] font-black uppercase">
                SOKO B
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>TIMU MBILI ZITAKAZOINGIA FAINALI (TOP 2 FINALISTS)</span>
                <Swords className="w-4 h-4 text-sky-400" />
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Tabiri mchanganyiko wa timu 2 zitakazofuzu kucheza Fainali Kuu (Grand Final). Unaweza kuchagua mchanganyiko wowote wa timu 2 kwa kutumia Builder, au chagua combinations maarufu hapa chini zenye odds kuanzia <strong className="text-amber-400">8.50 hadi 25.00</strong>!
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ODDS 8.50 – 25.00</span>
          </div>
        </div>

        {/* DUAL INTERACTIVE FINALIST BUILDER */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0d162b] to-slate-950 border-2 border-sky-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-sky-400" />
              Interactive Finalist Pair Builder (Tengeneza Jozi Yako ya Fainali):
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Chagua Timu A na Timu B
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Team 1 Selector (5 cols) */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Timu ya Kwanza ya Fainali:
              </label>
              <select
                value={finalistTeam1}
                disabled={isMarketLocked}
                onChange={(e) => {
                  setFinalistTeam1(e.target.value);
                  if (e.target.value === finalistTeam2) {
                    const other = TOURNAMENT_TEAMS.find(t => t.name !== e.target.value);
                    if (other) setFinalistTeam2(other.name);
                  }
                }}
                className="w-full bg-slate-900 border-2 border-slate-700 hover:border-sky-500 rounded-xl px-3 py-2.5 text-sm text-white font-black focus:outline-none focus:border-sky-400 transition-colors"
              >
                {TOURNAMENT_TEAMS.map(team => (
                  <option key={team.id} value={team.name}>
                    {team.name} ({team.tagline})
                  </option>
                ))}
              </select>
            </div>

            {/* VS divider (2 cols) */}
            <div className="md:col-span-2 flex flex-col items-center justify-center py-1">
              <span className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-black text-sky-300 text-xs shadow">
                &amp;
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">FINAL PAIR</span>
            </div>

            {/* Team 2 Selector (5 cols) */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Timu ya Pili ya Fainali:
              </label>
              <select
                value={finalistTeam2}
                disabled={isMarketLocked}
                onChange={(e) => {
                  setFinalistTeam2(e.target.value);
                  if (e.target.value === finalistTeam1) {
                    const other = TOURNAMENT_TEAMS.find(t => t.name !== e.target.value);
                    if (other) setFinalistTeam1(other.name);
                  }
                }}
                className="w-full bg-slate-900 border-2 border-slate-700 hover:border-sky-500 rounded-xl px-3 py-2.5 text-sm text-white font-black focus:outline-none focus:border-sky-400 transition-colors"
              >
                {TOURNAMENT_TEAMS.map(team => (
                  <option key={team.id} value={team.name} disabled={team.name === finalistTeam1}>
                    {team.name} ({team.tagline}) {team.name === finalistTeam1 ? '(Tayari imechaguliwa)' : ''}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Builder Result Banner & Add to Bet Slip */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white">
                  {finalistTeam1} &amp; {finalistTeam2}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Grand Final Pairing
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Odds zilizokokotolewa: Weka TSh 1,000 upate malipo ya <strong className="text-amber-400 font-mono">TSh {(1000 * currentPairOdds).toLocaleString()}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Odds za Jozi Hii:</span>
                <span className="font-mono text-xl font-black text-amber-400">
                  @{currentPairOdds.toFixed(2)}
                </span>
              </div>

              <button
                disabled={isMarketLocked || finalistTeam1 === finalistTeam2}
                onClick={() => handlePickFinalists(finalistTeam1, finalistTeam2, currentPairOdds)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg ${
                  isMarketLocked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isSelectionInSlip('tournament-outright-finalists', 'OUTRIGHT_FINALISTS', `${finalistTeam1} & ${finalistTeam2}`)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white'
                }`}
              >
                {isMarketLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {isSelectionInSlip('tournament-outright-finalists', 'OUTRIGHT_FINALISTS', `${finalistTeam1} & ${finalistTeam2}`)
                    ? 'IMEONGEZWA KWENYE MKEKA'
                    : isMarketLocked
                    ? 'LOCKED'
                    : 'WEKA KWENYE BET SLIP'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* FEATURED FINALIST COMBINATIONS GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-300 uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Combinations Maarufu Zaidi za Wafainali (Featured Pairs):
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Bofya kuongeza moja kwa moja
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURED_FINALIST_PAIRS.map((pair, idx) => {
              const pairTitle = `${pair.team1} & ${pair.team2}`;
              const isSelected = isSelectionInSlip(
                'tournament-outright-finalists',
                'OUTRIGHT_FINALISTS',
                pairTitle
              );

              const isWinningFinalist = settledData.isSettled && 
                ((settledData.finalist1 === pair.team1 && settledData.finalist2 === pair.team2) ||
                 (settledData.finalist1 === pair.team2 && settledData.finalist2 === pair.team1));

              return (
                <div
                  key={idx}
                  className={`bg-slate-950/80 border-2 rounded-2xl p-3.5 space-y-2.5 transition-all flex flex-col justify-between ${
                    isWinningFinalist
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/50'
                      : isSelected
                      ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-950/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider block">
                      {pair.label}
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {pair.team1} <span className="text-amber-400">&amp;</span> {pair.team2}
                    </h4>
                  </div>

                  <button
                    disabled={isMarketLocked}
                    onClick={() => handlePickFinalists(pair.team1, pair.team2, pair.odds)}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-between transition-all active:scale-95 ${
                      isMarketLocked
                        ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-sky-600/30 text-white border border-slate-700 hover:border-sky-500'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {isMarketLocked ? (
                        <Lock className="w-3 h-3 text-slate-500" />
                      ) : isSelected ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Swords className="w-3 h-3 text-sky-400" />
                      )}
                      <span>{isSelected ? 'IMECHAGULIWA' : 'CHAGUA'}</span>
                    </span>

                    <span className="font-mono font-black text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-xs">
                      @{pair.odds.toFixed(2)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. RULES & INFORMATION CARD */}
      <div className="bg-slate-950/90 border border-amber-500/40 rounded-3xl p-5 space-y-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>VIGEZO &amp; MASHARTI YA SOKO LA OUTRIGHT (SIKU 3 FLAGGED MARKET):</span>
        </div>
        <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px] leading-relaxed">
          <li>Soko hili linafungwa kiotomatiki siku 3 tangu lilipotangazwa au mara tu mechi za Robo Fainali (Quarter-Finals) zinapoanza kuchezwa. Hakuna kubeti kunakoruhusiwa baada ya muda kuisha.</li>
          <li>Mikeka yote iliyowekwa inahifadhiwa kwenye <strong>My Bets / Mikeka Yangu</strong> ikiwa na hadhi ya <strong>PENDING / IN WAITING</strong> hadi fainali itakapokamilika.</li>
          <li>Ushindi wa <strong>Bingwa wa Mashindano</strong> unalipwa kwa mtu aliyetabiri timu 1 itakayotwaa kombe.</li>
          <li>Ushindi wa <strong>Timu 2 za Fainali</strong> unalipwa kwa mtu aliyetabiri timu mbili zitakazocheza mechi ya Fainali Kuu (bila kujali ni nani atashinda au kushindwa fainalini).</li>
          <li>Pesa za ushindi huingizwa mara moja moja kwa moja kwenye Salio la Wallet yako baada ya Admin kuthibitisha matokeo rasmi ya Fainali Kuu.</li>
        </ul>
      </div>

      {/* 5. VISIBLE STAKE INPUT & BET SLIP MODAL FOR OUTRIGHT BETS */}
      {quickStakeModal.isOpen && quickStakeModal.selection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b101e] border-2 border-amber-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Header Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    Kuponi ya Bet: Ubashiri wa Mashindano
                  </h3>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    SEIJO58 EFOOTBALL CAMP ™ OUTRIGHT
                  </span>
                </div>
              </div>

              <button
                onClick={() => setQuickStakeModal({ isOpen: false, stake: 1000 })}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold rounded-lg hover:bg-slate-800"
              >
                ✕ Funga
              </button>
            </div>

            {/* Selected Pick Details Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                  {quickStakeModal.selection.stageName}
                </span>
                <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-700">
                  @{quickStakeModal.selection.odds.toFixed(2)} Odds
                </span>
              </div>
              <h4 className="text-sm font-black text-white">
                {quickStakeModal.selection.matchTitle}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/40">
                  {quickStakeModal.selection.selection}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({quickStakeModal.selection.marketName})
                </span>
              </div>
            </div>

            {/* Visible Stake Input Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-black text-slate-200 flex items-center gap-1.5">
                  <span>💰</span>
                  <span>Weka Kiasi cha Bet (TSh):</span>
                </label>
                <span className="text-[10px] font-bold text-amber-400">
                  Kiwango cha chini: TSh 500
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={quickStakeModal.stake}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setQuickStakeModal(prev => ({ ...prev, stake: Math.max(0, val) }));
                  }}
                  placeholder="Mfano: 1,000"
                  className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-base font-mono font-black text-white focus:outline-none shadow-inner"
                />
                <span className="absolute right-4 top-3 text-xs font-black text-slate-400">
                  TSh
                </span>
              </div>

              {/* Quick Stake Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuickStakeModal(prev => ({ ...prev, stake: amt }))}
                    className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                      quickStakeModal.stake === amt
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Calculation Breakdown Display */}
            {(() => {
              const currentStake = quickStakeModal.stake || 0;
              const odds = quickStakeModal.selection.odds || 1;
              const payout = Math.floor(currentStake * odds);
              return (
                <div className="bg-gradient-to-r from-slate-950 via-[#0d162a] to-slate-950 border-2 border-amber-500/50 rounded-2xl p-3.5 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <span>💰</span> Kiasi Kilichowekwa (Stake):
                    </span>
                    <span className="font-mono font-black text-white">
                      TSh {currentStake.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <span>📊</span> Jumla ya Odds (Total Odds):
                    </span>
                    <span className="font-mono font-black text-amber-400">
                      {odds.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800">
                    <span className="font-black text-emerald-300 flex items-center gap-1.5">
                      <span>🎁</span> Tarajiwa / Ushindi (Payout):
                    </span>
                    <span className="font-mono font-black text-base sm:text-lg text-emerald-400">
                      TSh {payout.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Wallet Balance Check */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Salio la Pochi: <strong className="text-white font-mono">TSh {walletBalance.toLocaleString()}</strong></span>
              {walletBalance < quickStakeModal.stake ? (
                <span className="text-rose-400 font-bold">Salio halitoshi!</span>
              ) : (
                <span className="text-emerald-400 font-bold">Salio linatosha</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickStakeModal({ isOpen: false, stake: 1000 })}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs"
              >
                Ghairi
              </button>

              <button
                type="button"
                disabled={isMarketLocked || quickStakeModal.stake < 500}
                onClick={handleExecuteQuickBet}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-emerald-600 hover:from-red-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>PLACE BET / TUMA MKEKA (TSh {quickStakeModal.stake.toLocaleString()})</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
