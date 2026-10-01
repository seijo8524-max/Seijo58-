import React, { useState, useEffect } from 'react';
import { 
  EFOOTBALL_MATCHES, 
  EFOOTBALL_GRAND_FINAL,
  EFOOTBALL_GRAND_FINAL_2026,
  EFOOTBALL_ACTIVE_MATCHES,
  EFOOTBALL_QUARTER_FINALS_DATA, 
  EFOOTBALL_SEMI_FINALS_DATA,
  EFOOTBALL_COMPLETED_MATCHES,
  EFootballMatch, 
  checkSelectionResult, 
  evaluateMatchSelection 
} from '../../data/efootballMatches';
import { EFootballTicket, EFootballBetSelection } from '../../types/efootball';
import { MyBetsView } from './MyBetsView';
import { TournamentOutrightView } from './TournamentOutrightView';
import { useAuth } from '../../contexts/AuthContext';
import {
  isGrandFinalLocked,
  getGrandFinalCountdown,
  setGrandFinalLockByAdmin,
  resetGrandFinalCutoff,
  isQuarterFinalsLocked,
  getQuarterFinalsCountdown,
  setQuarterFinalsLockByAdmin,
  resetQuarterFinalsCutoff
} from '../../lib/quarterFinalsLock';
import { 
  Gamepad2, 
  Trophy, 
  Flame, 
  Shield, 
  Swords, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  ArrowRight,
  Info,
  Layers,
  ChevronRight,
  Award,
  Clock,
  Lock,
  Receipt,
  RotateCcw,
  Play,
  Check,
  XCircle,
  Crown,
  PlusCircle,
  Calendar,
  X,
  RefreshCw,
  Sliders,
  Zap
} from 'lucide-react';

interface EFootballCampViewProps {
  walletBalance: number;
  onBetPlaced: (stake: number, title: string) => boolean;
  onWinPayout: (amount: number, ticketId: string, title: string) => void;
  onOpenDeposit: () => void;
  showToast: (msg: string) => void;
  tickets: EFootballTicket[];
  setTickets: React.Dispatch<React.SetStateAction<EFootballTicket[]>>;
  defaultTab?: 'matches' | 'outright' | 'mybets' | 'history' | 'trader';
}

export const EFootballCampView: React.FC<EFootballCampViewProps> = ({
  walletBalance,
  onBetPlaced,
  onWinPayout,
  onOpenDeposit,
  showToast,
  tickets,
  setTickets,
  defaultTab = 'matches'
}) => {
  const [selections, setSelections] = useState<EFootballBetSelection[]>([]);
  const [stake, setStake] = useState<number>(1000);
  const [isPlacing, setIsPlacing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'outright' | 'mybets' | 'history' | 'trader'>(defaultTab);

  const { currentUser, userProfile } = useAuth();
  const currentUserId = currentUser?.uid || userProfile?.uid;
  const currentUserEmail = currentUser?.email || userProfile?.email;

  // Helper to ensure tickets belong explicitly to the logged-in user account or local session
  const isTicketOwnedByCurrentUser = (ticket: EFootballTicket) => {
    if (!currentUserId && !currentUserEmail) {
      return !ticket.userId || ticket.userId === 'guest' || ticket.userId === 'current_user';
    }
    const idMatch = currentUserId && ticket.userId === currentUserId;
    const emailMatch = currentUserEmail && ticket.userEmail && ticket.userEmail.toLowerCase() === currentUserEmail.toLowerCase();
    const guestMatch = !ticket.userId || ticket.userId === 'guest';
    return Boolean(idMatch || emailMatch || guestMatch);
  };

  // Status mode: FORCE_UPCOMING is the default for active Robo Fainali live betting
  const [matchMode, setMatchMode] = useState<'AUTO' | 'FORCE_UPCOMING' | 'FORCE_LIVE' | 'FORCE_FINISHED'>('FORCE_UPCOMING');
  // Default to false: Never popup false champion celebrations unless user explicitly won
  const [showChampionModal, setShowChampionModal] = useState<boolean>(false);

  // Dynamic Matches & Betting Cycle State Management
  // Active Matches: Strictly shows the single Grand Final match only (ISAAC vs MAN U)
  const [activeMatches, setActiveMatches] = useState<EFootballMatch[]>(() => {
    try {
      const saved = localStorage.getItem('seijo58_efootball_active_matches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 1 && parsed[0]?.id === 'efb-final-2026') {
          return parsed;
        }
      }
      localStorage.setItem('seijo58_efootball_active_matches', JSON.stringify([EFOOTBALL_GRAND_FINAL_2026]));
      return [EFOOTBALL_GRAND_FINAL_2026];
    } catch (e) {
      return [EFOOTBALL_GRAND_FINAL_2026];
    }
  });

  const [archivedMatches, setArchivedMatches] = useState<EFootballMatch[]>(() => {
    try {
      const saved = localStorage.getItem('seijo58_efootball_archived_matches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure all completed rounds (Quarter Finals & Semi Finals) are preserved in history
          const ids = new Set(parsed.map(m => m.id));
          const missing = EFOOTBALL_COMPLETED_MATCHES.filter(m => !ids.has(m.id));
          return [...parsed, ...missing];
        }
      }
      return EFOOTBALL_COMPLETED_MATCHES;
    } catch (e) {
      return EFOOTBALL_COMPLETED_MATCHES;
    }
  });

  const [isCycleConcluded, setIsCycleConcluded] = useState<boolean>(() => {
    return localStorage.getItem('seijo58_efootball_cycle_concluded') === 'true';
  });

  // Admin Controls & Modals
  const [isPostMatchModalOpen, setIsPostMatchModalOpen] = useState<boolean>(false);
  const [isSetScoreModalOpen, setIsSetScoreModalOpen] = useState<boolean>(false);
  const [selectedScoreMatchId, setSelectedScoreMatchId] = useState<string>('');
  const [scoreHomeInput, setScoreHomeInput] = useState<number>(0);
  const [scoreAwayInput, setScoreAwayInput] = useState<number>(0);

  // Admin New Match Form State
  const [newMatchForm, setNewMatchForm] = useState({
    homeTeam: '',
    awayTeam: '',
    stageName: 'SEIJO58 EFOOTBALL CAMP ™ • MZUNGUKO MPYA',
    scheduledTime: 'Leo Saa 4:00 Usiku (22:00 EAT)',
    homeOdds: 2.15,
    drawOdds: 3.20,
    awayOdds: 2.75,
    overOdds: 1.75,
    underOdds: 1.95,
    ggOdds: 1.65,
    ngOdds: 2.05
  });

  // Real-time Countdown & Strict Bet Closing Lock System towards 21:30 (Saa 3:30 Usiku)
  const [isBettingLocked, setIsBettingLocked] = useState<boolean>(() => isQuarterFinalsLocked());
  const [countdown, setCountdown] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isLive: boolean;
    totalSeconds: number;
  }>(() => {
    const cd = getQuarterFinalsCountdown();
    return {
      hours: cd.hours,
      minutes: cd.minutes,
      seconds: cd.seconds,
      isLive: cd.isLocked,
      totalSeconds: cd.totalSeconds
    };
  });

  const isMatchFinished = activeMatches.length > 0 && activeMatches.every(m => m.status === 'FT');
  const isMatchLive = isBettingLocked && !isMatchFinished;

  useEffect(() => {
    const updateCountdown = () => {
      const cd = getQuarterFinalsCountdown();
      const locked = isQuarterFinalsLocked();

      setCountdown({
        hours: cd.hours,
        minutes: cd.minutes,
        seconds: cd.seconds,
        isLive: locked,
        totalSeconds: cd.totalSeconds
      });

      setIsBettingLocked(locked);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    const handleLockEvent = () => {
      updateCountdown();
    };
    window.addEventListener('seijo58_qf_lock_changed', handleLockEvent);

    return () => {
      clearInterval(timer);
      window.removeEventListener('seijo58_qf_lock_changed', handleLockEvent);
    };
  }, []);

  // AUTOMATIC BET SETTLEMENT ENGINE: Evaluates placed tickets against official FT results
  // STRICT RULE: Only awards prizes if participant placed bet with actual money and predicted outcome correctly
  const settleAllTicketsAutomatically = (notifyIfNone = false) => {
    const pendingTickets = tickets.filter(t => t.status === 'PENDING' || !t.paidOut);
    if (pendingTickets.length === 0) {
      if (notifyIfNone) {
        showToast('Mikeka yote imeshasuluhishwa kikamilifu!');
      }
      return;
    }

    let wonCount = 0;
    let lostCount = 0;
    let totalPayout = 0;
    let anySettled = false;

    // Combine all known matches to evaluate against
    const allKnownMatches = [...activeMatches, ...archivedMatches, ...EFOOTBALL_MATCHES];

    const updated = tickets.map(ticket => {
      // If already finalized WON and paid out, or LOST, keep as is
      if (ticket.status === 'WON' && ticket.paidOut) return ticket;
      if (ticket.status === 'LOST') return ticket;

      // Real money check: Must have placed a valid bet
      if (!ticket.stake || ticket.stake <= 0) {
        return {
          ...ticket,
          status: 'LOST' as const,
          paidOut: false,
          settledAt: new Date().toLocaleTimeString(),
          outcomeNotes: 'Haijalipiwa kiasi halisi cha pesa.'
        };
      }

      const isOwned = isTicketOwnedByCurrentUser(ticket);

      let anyPending = false;
      let allWon = true;
      let failureReason = '';

      for (const sel of ticket.selections) {
        // Direct selection evaluation (for outright, semi-finals, quarter-finals)
        const directRes = checkSelectionResult(sel.matchId, sel.marketType, sel.selection);
        if (directRes.isPending) {
          anyPending = true;
          break;
        }

        const foundMatch = allKnownMatches.find(m => m.id === sel.matchId);
        // If match is still upcoming or live, keep ticket pending
        if (!foundMatch || foundMatch.status !== 'FT') {
          anyPending = true;
          break;
        }

        const evaluation = evaluateMatchSelection(foundMatch, sel.marketType, sel.selection);
        if (evaluation.isPending) {
          anyPending = true;
          break;
        }
        if (!directRes.isWin && !evaluation.isWin) {
          allWon = false;
          failureReason = directRes.reason || `${sel.selection} haikufanikiwa (${evaluation.scoreDisplay})`;
          break;
        }
      }

      if (anyPending) {
        return ticket; // Ticket remains pending until match completes
      }

      anySettled = true;

      if (allWon) {
        const payout = ticket.potentialPayout || Math.floor((ticket.stake || 1000) * (ticket.totalOdds || 1));

        // ONLY award payout if the ticket was explicitly placed with actual money by the logged-in user
        if (isOwned && !ticket.paidOut) {
          wonCount++;
          totalPayout += payout;
          onWinPayout(payout, ticket.id, `SEIJO58 eFootball Won: Ticket #${ticket.id}`);
        }

        return {
          ...ticket,
          status: 'WON' as const,
          settled: true,
          paidOut: true,
          settledAt: new Date().toLocaleTimeString(),
          outcomeNotes: 'Utabiri wote umeshinda matokeo rasmi ya Nusu Fainali!'
        };
      } else {
        if (isOwned) {
          lostCount++;
        }
        return {
          ...ticket,
          status: 'LOST' as const,
          settled: true,
          paidOut: false,
          settledAt: new Date().toLocaleTimeString(),
          outcomeNotes: failureReason || 'Utabiri haukulingana na matokeo rasmi ya FT.'
        };
      }
    });

    if (anySettled) {
      setTickets(updated);
      try {
        localStorage.setItem('seijo58_efootball_tickets', JSON.stringify(updated));
        localStorage.setItem('my_bets', JSON.stringify(updated));
        localStorage.setItem('user_tickets', JSON.stringify(updated));
      } catch (e) {}

      showToast("🎉 Hongera! Matokeo ya Nusu Fainali yamesasishwa na ushindi wako umeongezwa kwenye Wallet!");
      sessionStorage.setItem('seijo58_sf_toast_shown', 'true');
    } else if (notifyIfNone) {
      showToast('Hakuna mechi mpya zilizomalizika za kusuluhisha kwa sasa.');
    }
  };

  // Run automatic bet settlement when component mounts for finished matches
  useEffect(() => {
    settleAllTicketsAutomatically(false);
    const hasShownToast = sessionStorage.getItem('seijo58_sf_toast_shown');
    if (!hasShownToast) {
      showToast("🎉 Hongera! Matokeo ya Nusu Fainali yamesasishwa na ushindi wako umeongezwa kwenye Wallet!");
      sessionStorage.setItem('seijo58_sf_toast_shown', 'true');
    }
  }, []);

  // Handle Odd Selection (Add / Toggle)
  const handleSelectOdd = (
    match: EFootballMatch,
    marketType: string,
    marketName: string,
    selection: string,
    odds: number
  ) => {
    if (isBettingLocked) {
      showToast('🔒 FAINALI IMEANZA! Soko limefungwa.');
      return;
    }

    if (match.status === 'FT') {
      showToast('🔒 Mechi imeshamalizika (FT). Hauwezi kuchagua odds kwenye mechi iliyomalizika.');
      return;
    }

    setSelections(prev => {
      const existsIndex = prev.findIndex(
        s => s.matchId === match.id && s.marketType === marketType && s.selection === selection
      );

      if (existsIndex >= 0) {
        return prev.filter((_, idx) => idx !== existsIndex);
      }

      const filtered = prev.filter(
        s => !(s.matchId === match.id && s.marketType === marketType)
      );

      const newSelection: EFootballBetSelection = {
        matchId: match.id,
        matchTitle: `${match.player1.name} 🆚 ${match.player2.name}`,
        stageName: match.stageName,
        marketType,
        marketName,
        selection,
        odds
      };

      showToast(`🎯 Imeongezwa: ${selection} (${odds.toFixed(2)}) kwenye Bet Slip!`);
      return [...filtered, newSelection];
    });
  };

  const handleRemoveSelection = (matchId: string, marketType: string) => {
    setSelections(prev => prev.filter(s => !(s.matchId === matchId && s.marketType === marketType)));
  };

  const handleClearSlip = () => {
    setSelections([]);
    showToast('Bet Slip imefutwa.');
  };

  // Multiplier calculation (Accumulator)
  const totalOdds = selections.length > 0 
    ? Number(selections.reduce((acc, curr) => acc * curr.odds, 1).toFixed(2))
    : 0;

  const potentialWinnings = Math.floor(stake * totalOdds);

  const isSelected = (matchId: string, marketType: string, selection: string) => {
    return selections.some(
      s => s.matchId === matchId && s.marketType === marketType && s.selection === selection
    );
  };

  // Place Bet Execution
  const handlePlaceBet = () => {
    if (typeof (window as any).enforceUserBlocked === 'function' && (window as any).enforceUserBlocked(currentUserEmail || currentUserId)) {
      return;
    }

    if (isBettingLocked) {
      showToast('🔒 FAINALI IMEANZA! Soko limefungwa.');
      return;
    }

    if (selections.length === 0) {
      showToast('⚠️ Tafadhali chagua angalau odds moja kabla ya kubeti!');
      return;
    }

    const allMatches = [...activeMatches, ...archivedMatches, ...EFOOTBALL_MATCHES];
    const hasFinishedMatch = selections.some(s => {
      const m = allMatches.find(match => match.id === s.matchId);
      return m?.status === 'FT';
    });
    if (hasFinishedMatch) {
      showToast('⚠️ Bet Slip yako ina mechi iliyokamilika. Tafadhali ondoa mechi hiyo ili kuweka mkeka wako!');
      return;
    }

    const hasOutright = selections.some(s => s.matchId.startsWith('tournament-outright'));
    if (hasOutright) {
      const isLocked = localStorage.getItem('seijo58_tournament_outright_locked') === 'true';
      const deadline = parseInt(localStorage.getItem('seijo58_tournament_outright_deadline') || '0', 10);
      if (isLocked || (deadline > 0 && Date.now() > deadline)) {
        showToast('🔒 Soko la Mashindano (Outright) limefungwa kwa sababu Robo Fainali zimeanza. Tafadhali ondoa machaguo hayo!');
        return;
      }
    }

    if (stake < 500) {
      showToast('⚠️ Kiwango cha chini cha kubeti ni TSh 500!');
      return;
    }

    if (walletBalance < stake) {
      showToast('❌ Salio halitoshi kwenye pochi yako! Weka pesa uendelee.');
      onOpenDeposit();
      return;
    }

    setIsPlacing(true);

    setTimeout(() => {
      const matchSummary = selections.map(s => `${s.selection} @ ${s.odds.toFixed(2)}`).join(' | ');
      const betTitle = `eFootball Bet: ${selections.length} Pick(s) (${matchSummary})`;

      const success = onBetPlaced(stake, betTitle);

      if (success) {
        const ticketRef = `MK-${Math.floor(100000 + Math.random() * 900000)}`;

        const newTicket: EFootballTicket = {
          id: ticketRef,
          userId: currentUserId || 'user_guest',
          userEmail: currentUserEmail || '',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          kickoffTime: 'Mechi Iliyopangwa',
          stake: stake,
          totalOdds: totalOdds,
          potentialPayout: potentialWinnings,
          status: 'PENDING',
          selections: [...selections],
          settled: false,
          paidOut: false
        };

        const updatedTickets = [newTicket, ...tickets];
        setTickets(updatedTickets);
        try {
          localStorage.setItem('seijo58_efootball_tickets', JSON.stringify(updatedTickets));
          localStorage.setItem('my_bets', JSON.stringify(updatedTickets));
          localStorage.setItem('user_tickets', JSON.stringify(updatedTickets));
        } catch (e) {}

        showToast(
          `🎉 BINGO! Tiketi #${ticketRef} imewekwa! Malipo yanayotarajiwa: TSh ${potentialWinnings.toLocaleString()}`
        );
        setSelections([]);
      }
      setIsPlacing(false);
    }, 500);
  };

  // Settle individual ticket
  const handleSettleTicket = (ticketId: string, outcome: 'WON' | 'LOST') => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (!targetTicket) return;

    if (outcome === 'WON' && !targetTicket.paidOut && isTicketOwnedByCurrentUser(targetTicket)) {
      onWinPayout(
        targetTicket.potentialPayout, 
        targetTicket.id, 
        `SEIJO58 eFootball Won: Ticket #${targetTicket.id}`
      );
      showToast(`🎉 Hongera! Mkeka wako umebeba TSh ${targetTicket.potentialPayout.toLocaleString()}!`);
    } else if (outcome === 'LOST') {
      showToast(`Tiketi #${ticketId} imehitimishwa kama UMEKOSA.`);
    }

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: outcome,
          paidOut: outcome === 'WON',
          settledAt: new Date().toLocaleTimeString()
        };
      }
      return t;
    });

    setTickets(updated);
    try {
      localStorage.setItem('seijo58_efootball_tickets', JSON.stringify(updated));
    } catch (e) {}
  };

  // 🏁 CONCLUDE BETTING CYCLE & CLEAR PAST MATCHES
  // Moves bet details to the history section and clears past finished matches from active feed
  const handleConcludeCycleAndClearMatches = () => {
    // 1. Settle all placed tickets strictly against FT results
    settleAllTicketsAutomatically(false);

    // 2. Identify finished matches to archive
    const finishedMatches = activeMatches.filter(m => m.status === 'FT');
    const remainingUpcoming = activeMatches.filter(m => m.status !== 'FT');

    const updatedArchive = [...archivedMatches];
    [...finishedMatches, ...EFOOTBALL_MATCHES].forEach(m => {
      if (!updatedArchive.some(a => a.id === m.id)) {
        updatedArchive.push(m);
      }
    });

    setArchivedMatches(updatedArchive);
    setActiveMatches(remainingUpcoming);
    setIsCycleConcluded(true);

    try {
      localStorage.setItem('seijo58_efootball_archived_matches', JSON.stringify(updatedArchive));
      localStorage.setItem('seijo58_efootball_active_matches', JSON.stringify(remainingUpcoming));
      localStorage.setItem('seijo58_efootball_cycle_concluded', 'true');
    } catch (e) {}

    showToast('✓ Mzunguko wa betting umekamilika! Mechi zilizopita zimesafishwa na kuhamishiwa kwenye Historia. Ubao sasa upo tayari kwa Admin kuposti mechi mpya!');
    setActiveTab('history');
  };

  // ➕ ADMIN: POST NEW UPCOMING MATCH
  const handlePostNewMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchForm.homeTeam.trim() || !newMatchForm.awayTeam.trim()) {
      showToast('Tafadhali weka majina ya timu/wachezaji wote wawili.');
      return;
    }

    const home = newMatchForm.homeTeam.trim().toUpperCase();
    const away = newMatchForm.awayTeam.trim().toUpperCase();

    const newMatch: EFootballMatch = {
      id: `efb-match-${Date.now()}`,
      stageName: newMatchForm.stageName.trim() || 'SEIJO58 EFOOTBALL CAMP ™',
      scheduledTime: newMatchForm.scheduledTime.trim() || 'Leo Saa 4:00 Usiku',
      status: 'UPCOMING',
      player1: {
        name: home,
        tagline: 'Home Team',
        avatarSeed: home.toLowerCase(),
        groupRecord: 'Fomu Nzuri ya Ushambuliaji',
        quarterFinals: 'Tayari kwa Mechi',
        totalGoals: 5,
        playStyle: 'Offensive Precision',
        winProbability: 45,
        recentForm: ['W', 'D', 'W', 'W', 'W']
      },
      player2: {
        name: away,
        tagline: 'Away Team',
        avatarSeed: away.toLowerCase(),
        groupRecord: 'Ulinzi Madhubuti & Counter Attack',
        quarterFinals: 'Tayari kwa Ushindani',
        totalGoals: 4,
        playStyle: 'Tactical Defense',
        winProbability: 35,
        recentForm: ['W', 'W', 'D', 'L', 'W']
      },
      traderAnalysis: `Mechi rasmi ya ${home} dhidi ya ${away}. Masoko yote ya 1X2, Over/Under 2.5, na GG/NG yapo wazi kwa ajili ya kubeti.`,
      keyStats: [
        `1 (${home} Win) @ ${newMatchForm.homeOdds.toFixed(2)}`,
        `X (Sare) @ ${newMatchForm.drawOdds.toFixed(2)}`,
        `2 (${away} Win) @ ${newMatchForm.awayOdds.toFixed(2)}`,
        `Over 2.5 Goals @ ${newMatchForm.overOdds.toFixed(2)} | Under 2.5 @ ${newMatchForm.underOdds.toFixed(2)}`,
        `GG (Wote Wafunge) @ ${newMatchForm.ggOdds.toFixed(2)} | NG @ ${newMatchForm.ngOdds.toFixed(2)}`
      ],
      odds: {
        homeWin: Number(newMatchForm.homeOdds) || 2.15,
        draw: Number(newMatchForm.drawOdds) || 3.20,
        awayWin: Number(newMatchForm.awayOdds) || 2.75,
        overUnderThreshold: 2.5,
        overOdds: Number(newMatchForm.overOdds) || 1.75,
        underOdds: Number(newMatchForm.underOdds) || 1.95,
        bttsLabel: 'Both Teams To Score (GG / NG)',
        ggOdds: Number(newMatchForm.ggOdds) || 1.65,
        ngOdds: Number(newMatchForm.ngOdds) || 2.05
      },
      bookmakerMargin: '12% Bookmaker Margin Included'
    };

    const updated = [newMatch, ...activeMatches];
    setActiveMatches(updated);
    try {
      localStorage.setItem('seijo58_efootball_active_matches', JSON.stringify(updated));
    } catch (e) {}

    setIsPostMatchModalOpen(false);
    showToast(`✓ Mechi mpya (${home} vs ${away}) imechapishwa! Wachezaji wanaweza kubeti sasa.`);
    setActiveTab('matches');
  };

  // ⚽ ADMIN: SET FT SCORE AND TRIGGER RESULT SETTLEMENT
  const handleSetMatchResult = (matchId: string, homeScore: number, awayScore: number) => {
    const targetMatch = activeMatches.find(m => m.id === matchId);
    if (!targetMatch) return;

    const totalGoals = homeScore + awayScore;
    const isBothScore = homeScore > 0 && awayScore > 0;
    const winningPicks: string[] = [];
    const losingPicks: string[] = [];

    if (homeScore > awayScore) {
      winningPicks.push(`1 (${targetMatch.player1.name} Win)`);
      losingPicks.push(`2 (${targetMatch.player2.name} Win)`, 'X (Draw)');
    } else if (awayScore > homeScore) {
      winningPicks.push(`2 (${targetMatch.player2.name} Win)`);
      losingPicks.push(`1 (${targetMatch.player1.name} Win)`, 'X (Draw)');
    } else {
      winningPicks.push('X (Draw)');
      losingPicks.push(`1 (${targetMatch.player1.name} Win)`, `2 (${targetMatch.player2.name} Win)`);
    }

    if (totalGoals > 2.5) {
      winningPicks.push(`Over 2.5 Goals (${totalGoals} Goals)`);
      losingPicks.push('Under 2.5 Goals');
    } else {
      winningPicks.push(`Under 2.5 Goals (${totalGoals} Goals)`);
      losingPicks.push('Over 2.5 Goals');
    }

    if (isBothScore) {
      winningPicks.push('GG (Both Teams Score)');
      losingPicks.push('NG (No Goal)');
    } else {
      winningPicks.push('NG (No Goal)');
      losingPicks.push('GG (Both Teams Score)');
    }

    const updatedMatch: EFootballMatch = {
      ...targetMatch,
      status: 'FT',
      scheduledTime: 'FT / MATCH FINISHED',
      finalScore: {
        homeScore,
        awayScore,
        display: `${homeScore} – ${awayScore}`,
        statusText: 'FT / MATCH FINISHED (Full Time)',
        winningPicks,
        losingPicks
      }
    };

    const updatedList = activeMatches.map(m => m.id === matchId ? updatedMatch : m);
    setActiveMatches(updatedList);
    try {
      localStorage.setItem('seijo58_efootball_active_matches', JSON.stringify(updatedList));
    } catch (e) {}

    setIsSetScoreModalOpen(false);
    showToast(`✓ Matokeo ya FT (${updatedMatch.player1.name} ${homeScore} - ${awayScore} ${updatedMatch.player2.name}) yamethibitishwa!`);

    setTimeout(() => {
      settleAllTicketsAutomatically(true);
    }, 400);
  };

  // 🔄 RESTORE INITIAL MATCHES
  const handleRestoreInitialMatches = () => {
    setActiveMatches([EFOOTBALL_GRAND_FINAL_2026]);
    setIsCycleConcluded(false);
    try {
      localStorage.setItem('seijo58_efootball_active_matches', JSON.stringify([EFOOTBALL_GRAND_FINAL_2026]));
      localStorage.setItem('seijo58_efootball_cycle_concluded', 'false');
    } catch (e) {}
    showToast('✓ Fainali Kuu (ISAAC 🆚 MAN U) imerejeshwa kikamilifu!');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HERO BANNER: SEIJO58 EFOOTBALL CAMP ™ - GRAND FINAL 2026 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-[#0a0f1d] to-amber-950 border-2 border-amber-500/80 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-red-950/50">
              <Gamepad2 className="w-3.5 h-3.5" />
              SEIJO58 EFOOTBALL CAMP ™
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-300 text-[11px] font-black uppercase shadow-lg shadow-amber-950/40 animate-pulse">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              🏆 GRAND FINAL • FAINALI KUU 2026
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${
              isBettingLocked 
                ? 'bg-red-500/20 border-2 border-red-500 text-red-300 animate-pulse' 
                : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {isBettingLocked 
                ? '🔒 FAINALI IMEANZA! Soko limefungwa.' 
                : '⏳ MUDA WA KUFUNGA BET: LEO SAA 4:00 USIKU (22:00)'}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              🏆 SEIJO58 eFOOTBALL CAMP ™ — <span className="text-amber-400">GRAND FINAL 2026</span> 🏆
            </h2>
            {/* 🏆 THE GRAND FINAL CLASH BANNER: ISAAC 🆚 MAN U */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-2 border-amber-500/60 shadow-xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  PAMBANO KUU LA FAINALI (THE GRAND FINAL)
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Leo Saa 4:00 Usiku (22:00 EAT)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/30 text-center sm:text-left">
                <p className="text-sm sm:text-base font-black text-amber-300 tracking-wide font-mono flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-950 to-slate-900 border border-red-500/60 px-3.5 py-1.5 rounded-xl text-red-300 shadow-md">
                    ⚽ ISAAC (Powerhouse Attack • 13 Goals)
                  </span>
                  <span className="text-amber-400 font-black text-lg">🆚</span>
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-500/60 px-3.5 py-1.5 rounded-xl text-amber-300 shadow-md">
                    ⚽ MAN U (Dominant Knockout Performance)
                  </span>
                </p>
                <p className="text-xs text-slate-300 mt-2">
                  High-stakes final between ISAAC (powerhouse attack, 13 goals in aggregate stages) and MAN U (dominant performance through Quarter &amp; Semi-Finals). Expect a tight, high-intensity showdown!
                </p>
              </div>
            </div>
          </div>

          {/* QUICK LINKS & STATS */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setActiveTab('mybets')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Tazama Mikeka Yangu ({tickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Historia ya Mechi Zilizopita ({archivedMatches.length})</span>
            </button>
          </div>

          {/* ADMIN & CYCLE MANAGEMENT TOOLBAR */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Admin: Usimamizi wa Mechi &amp; Mzunguko wa Betting
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeMatches.length} Mechi Zinazoendelea | {archivedMatches.length} Zilizohitimishwa
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Conclude Cycle & Clear Matches */}
              <button
                onClick={handleConcludeCycleAndClearMatches}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                title="Kamilisha mzunguko wa sasa, suluhisha mikeka yote, hamisha matokeo kwenye Historia na safisha mechi zilizopita"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kamilisha Mzunguko &amp; Safisha Mechi</span>
              </button>

              {/* Post New Match */}
              <button
                onClick={() => setIsPostMatchModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Weka Mechi Mpya (Post New Match)</span>
              </button>

              {/* Set Match FT Score */}
              {activeMatches.some(m => m.status !== 'FT') && (
                <button
                  onClick={() => {
                    const firstNonFt = activeMatches.find(m => m.status !== 'FT');
                    if (firstNonFt) setSelectedScoreMatchId(firstNonFt.id);
                    setIsSetScoreModalOpen(true);
                  }}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Weka Matokeo ya FT</span>
                </button>
              )}

              {/* Settle All */}
              <button
                onClick={() => settleAllTicketsAutomatically(true)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Suluhisha Zawadi</span>
              </button>

              {/* Admin Lock / Unlock Toggle for 21:30 Robo Fainali */}
              {isBettingLocked ? (
                <button
                  onClick={() => {
                    setQuarterFinalsLockByAdmin(false);
                    showToast('🔓 Masoko ya Robo Fainali yamefunguliwa tena na Admin!');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                  title="Admin: Fungua masoko kwa majaribio au mzunguko mpya"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Admin: Fungua Masoko (Unlock)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuarterFinalsLockByAdmin(true);
                    showToast('🔒 Masoko ya Robo Fainali yamefungwa na Admin (Saa 3:30 Usiku imeigwa)!');
                  }}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                  title="Admin: Funga masoko (Simulate 21:30 Saa 3:30 Usiku Lock)"
                >
                  <Lock className="w-3.5 h-3.5 text-red-200" />
                  <span>Admin: Funga Masoko (Lock 21:30)</span>
                </button>
              )}

              {/* Restore Matches */}
              <button
                onClick={handleRestoreInitialMatches}
                className="text-slate-400 hover:text-white text-[11px] underline flex items-center gap-1 ml-auto"
                title="Rejesha mechi za awali za Mashindano"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rejesha Mechi za Awali</span>
              </button>
            </div>
          </div>

        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none hidden sm:block">
          <Gamepad2 className="w-64 h-64 text-red-500" />
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS (Mechi, Outrights, Mikeka Yangu, Historia, Trader) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'matches'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Mechi &amp; Masoko (Robo Fainali)</span>
          </button>

          <button
            onClick={() => setActiveTab('outright')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all relative ${
              activeTab === 'outright'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/50'
                : 'text-amber-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>🏆 Mashindano Maalum (Siku 3 Soko)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
              SIKU 3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mybets')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all relative ${
              activeTab === 'mybets'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Mikeka Yangu (My Bets)</span>
            {tickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                {tickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Takwimu &amp; Historia</span>
          </button>

          <button
            onClick={() => setActiveTab('trader')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'trader'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Trader Model (12% Margin)</span>
          </button>
        </div>

        {/* Settle Tickets Button */}
        {tickets.some(t => t.status === 'PENDING') && (
          <button
            onClick={() => settleAllTicketsAutomatically(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95"
            title="Suluhisha mikeka kulingana na matokeo rasmi ya FT"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Suluhisha Mikeka ({tickets.filter(t => t.status === 'PENDING').length})</span>
          </button>
        )}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB: SPECIAL TOURNAMENT OUTRIGHT BETS (SIKU 3 FLAGGED MARKET) */}
      {activeTab === 'outright' && (
        <TournamentOutrightView
          walletBalance={walletBalance}
          onSelectOdd={(sel) => {
            setSelections(prev => {
              const exists = prev.findIndex(
                s => s.matchId === sel.matchId && s.marketType === sel.marketType && s.selection === sel.selection
              );
              if (exists >= 0) {
                return prev.filter((_, idx) => idx !== exists);
              }
              const filtered = prev.filter(
                s => !(s.matchId === sel.matchId && s.marketType === sel.marketType)
              );
              return [...filtered, sel];
            });
          }}
          isSelectionInSlip={(matchId, marketType, selection) => isSelected(matchId, marketType, selection)}
          onBetPlaced={onBetPlaced}
          onWinPayout={onWinPayout}
          onOpenDeposit={onOpenDeposit}
          showToast={showToast}
          tickets={tickets}
          setTickets={setTickets}
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
        />
      )}

      {/* TAB: MY BETS / MIKEKA YANGU DASHBOARD */}
      {activeTab === 'mybets' && (
        <MyBetsView
          tickets={tickets}
          walletBalance={walletBalance}
          onNavigateToEFootball={() => setActiveTab('matches')}
          onOpenDeposit={onOpenDeposit}
          onSettleTicket={handleSettleTicket}
          showToast={showToast}
        />
      )}

      {/* TAB: MATCHES & BET SLIP */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: FIXTURES (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SPECIAL TOURNAMENT OUTRIGHT CALLOUT BANNER (SIKU 3 FLAGGED MARKET) */}
            <div className="bg-gradient-to-r from-red-950 via-[#0e1628] to-amber-950 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                    🔥 SIKU 3 FLAGGED MARKET
                  </span>
                  <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Masaa 72 Kabla ya Robo Fainali
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  🏆 Ubashiri Maalum wa Mashindano (Bingwa &amp; Wafainali 2)
                </h3>
                <p className="text-xs text-slate-300">
                  Timu 12 za SEIJO58 EFOOTBALL CAMP ™ zipo tayari. Tabiri Bingwa (@ 3.50 – 12.00) au Timu 2 zitakazoingia Fainali (@ 8.50 – 25.00)!
                </p>
              </div>

              <button
                onClick={() => setActiveTab('outright')}
                className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs px-4 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 shrink-0"
              >
                <Trophy className="w-4 h-4 text-amber-200" />
                <span>WEKA MKEKA WA MASHINDANO</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 🔒 STRICT BET CLOSING NOTICE: LIVE LOCK SYSTEM (LEO SAA 4:00 USIKU) */}
            {isBettingLocked && (
              <div className="bg-gradient-to-r from-red-950 via-[#180a0a] to-red-950 border-2 border-red-500 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 border border-red-400 flex items-center justify-center shrink-0 shadow-lg shadow-red-950/80 animate-pulse">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-base sm:text-lg text-red-200 flex items-center gap-2">
                      <span>🔒 FAINALI IMEANZA! Soko limefungwa.</span>
                    </h4>
                    <p className="text-xs text-red-300 mt-1 leading-relaxed">
                      Muda wa mwisho wa kubeti ulikuwa <strong>Leo Saa 4:00 Usiku (22:00 EAT)</strong>. Fainali Kuu kati ya <strong>ISAAC 🆚 MAN U</strong> sasa ipo LIVE! Masoko yote (1X2, Double Chance, Over/Under 2.5, GG/NG, Kutwaa Ubingwa) yamefungwa rasmi hadi matokeo ya mwisho yatakapothibitishwa.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('mybets')}
                  className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Angalia Mikeka Yako ({tickets.length})</span>
                </button>
              </div>
            )}

            {/* ⏰ LIVE COUNTDOWN TIMER TO TONIGHT 22:00 (SAA 4:00 USIKU) */}
            {!isBettingLocked && (
              <div className="bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow">
                        ⏰ BET DEADLINE • SAA 4:00 USIKU
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        Cutoff: Leo Saa 4:00 Usiku (22:00 EAT)
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white mt-1">
                      ⏳ MUDA WA KUFUNGA BET: LEO SAA 4:00 USIKU (22:00)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Weka mkeka wako wa Fainali Kuu (ISAAC 🆚 MAN U) sasa kabla ya saa 4:00 usiku. Hakuna tiketi mpya itakayopokelewa baada ya saa 22:00.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/90 px-4 py-2.5 rounded-2xl border border-amber-500/40 font-mono text-center shadow-inner shrink-0">
                  <div className="text-center px-1">
                    <span className="block text-xl font-black text-white">{countdown.hours}</span>
                    <span className="text-[9px] text-slate-400 font-sans uppercase">Masaa</span>
                  </div>
                  <span className="text-amber-400 font-black text-lg">:</span>
                  <div className="text-center px-1">
                    <span className="block text-xl font-black text-white">{countdown.minutes}</span>
                    <span className="text-[9px] text-slate-400 font-sans uppercase">Dakika</span>
                  </div>
                  <span className="text-amber-400 font-black text-lg">:</span>
                  <div className="text-center px-1">
                    <span className="block text-xl font-black text-amber-400 animate-pulse">{countdown.seconds}</span>
                    <span className="text-[9px] text-slate-400 font-sans uppercase">Sekunde</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* BOLD SECTION TITLE: GRAND FINAL 2026 */}
              <div className="bg-[#0b101d] border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isBettingLocked ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow">
                        🏆 THE GRAND FINAL • FAINALI KUU
                      </span>
                      <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Kickoff Leo Saa 4:00 Usiku (22:00 EAT)
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                      <span>🏆 SEIJO58 eFOOTBALL CAMP ™ — GRAND FINAL 2026 🏆</span>
                    </h2>
                    <p className="text-xs text-slate-300">
                      Pambano Kuu: <strong>ISAAC 🆚 MAN U</strong>! Masoko yote kamili: <strong>1X2</strong>, <strong>Double Chance</strong>, <strong>Over/Under 2.5</strong>, <strong>Both Teams To Score (GG/NG)</strong> na <strong>Kutwaa Ubingwa (To Lift The Trophy)</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isBettingLocked ? (
                      <span className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <Lock className="w-3.5 h-3.5 text-red-400" />
                        <span>🔒 FAINALI IMEANZA! Soko limefungwa.</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Masoko Yapo Wazi (Hadi Saa 22:00 Leo)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Finalists Qualifier Callout */}
                <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">
                        THE 2 GRAND FINALISTS (WANAOWANIA TAJI KUU LA UBINGWA 2026)
                      </span>
                      <p className="text-xs sm:text-sm font-black text-white font-mono flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-red-400 font-bold">🥇 ISAAC (13 Goals Agg Stages)</span>
                        <span className="text-amber-400 font-black">VS</span>
                        <span className="text-emerald-300 font-bold">🥈 MAN U (Dominant QF &amp; SF Winner)</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-[11px] text-amber-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-xl border border-amber-500/30 shrink-0 font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Angalia Matokeo ya Nusu &amp; Robo Fainali</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Quick Fixture Cards */}
                <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold block">⚽ THE GRAND FINAL (FAINALI KUU)</span>
                    <span className="font-black text-white text-sm sm:text-base">ISAAC 🆚 MAN U</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Leo Saa 4:00 Usiku (22:00 EAT) • Soko linafungwa saa 22:00</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-end">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-xs font-mono">
                      1 @ 2.45 | X @ 3.30 | 2 @ 2.75
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-black text-xs font-mono">
                      Over 2.5 @ 1.85 | GG @ 1.70
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-black text-xs font-mono">
                      Trophy: ISAAC @ 1.78 | MAN U @ 1.98
                    </span>
                  </div>
                </div>
              </div>

              {(() => {
                const matchesToRender = activeMatches;

                if (matchesToRender.length === 0) {
                  return (
                    <div className="bg-[#0b101d] border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
                        🏁
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="text-lg font-black text-white">
                          Mzunguko Uliopita Umehitimishwa!
                        </h3>
                        <p className="text-xs text-slate-300">
                          Mechi zilizopita zimesafishwa na kuhamishiwa kwenye sehemu ya <strong>Historia</strong> ili kupisha mechi mpya za mzunguko unaofuata.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => setActiveTab('history')}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>Tazama Historia ya Mikeka &amp; Mechi</span>
                        </button>
                        <button
                          onClick={() => setIsPostMatchModalOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Admin: Weka Mechi Mpya Sasa</span>
                        </button>
                        <button
                          onClick={handleRestoreInitialMatches}
                          className="text-slate-400 hover:text-white text-xs underline px-3 py-2 flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Rejesha Mechi za Awali</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return matchesToRender.map((match) => {
                  const isThisMatchFinished = match.status === 'FT';
                  const isThisMatchLive = match.status === 'LIVE' || (!isThisMatchFinished && isBettingLocked);
                  const isThisMatchLocked = isThisMatchFinished || isThisMatchLive || isBettingLocked;
                  const isThisMatchFinal = match.id === 'efb-final-1';

                return (
                  <div 
                    key={match.id}
                    className={`bg-[#0b101d] border-2 rounded-3xl p-4 sm:p-6 shadow-xl transition-all space-y-5 relative overflow-hidden ${
                      isThisMatchFinal
                        ? 'border-amber-500/80 shadow-2xl shadow-amber-950/40 ring-1 ring-amber-500/40'
                        : isThisMatchLocked 
                        ? 'border-red-950/60 bg-[#090d16]/95' 
                        : 'border-slate-800 hover:border-red-500/40'
                    }`}
                  >
                    {/* Top Bar: Stage, Countdown & Trader Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          isThisMatchFinal 
                            ? 'bg-amber-400 animate-ping' 
                            : isThisMatchFinished 
                            ? 'bg-emerald-500' 
                            : isThisMatchLive 
                            ? 'bg-red-500 animate-ping' 
                            : 'bg-emerald-500 animate-pulse'
                        }`} />
                        <span className={`text-xs font-black tracking-wide uppercase flex items-center gap-1.5 ${
                          isThisMatchFinal ? 'text-amber-400' : 'text-white'
                        }`}>
                          {isThisMatchFinal && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                          {match.stageName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          • {isThisMatchLive ? '🔴 LIVE (Masoko Yamefungwa)' : 'Leo Saa 3:30 Usiku (21:30 EAT)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isThisMatchFinal ? (
                          <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span>Kickoff: {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
                          </span>
                        ) : isThisMatchFinished ? (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>FT / MATCH FINISHED</span>
                          </span>
                        ) : isThisMatchLive ? (
                          <span className="text-[10px] font-black text-red-400 bg-red-500/20 border border-red-500/50 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                            <span>🔴 LIVE / MATCHES IN PROGRESS</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>UPCOMING / INASUBIRI • {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          {match.bookmakerMargin}
                        </span>
                      </div>
                    </div>

                    {/* Players Matchup Clash Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-4 py-2">
                      
                      {/* Player 1 Card */}
                      <div className={`sm:col-span-3 border rounded-2xl p-4 text-center space-y-2 transition-all ${
                        match.finalScore && match.finalScore.homeScore > match.finalScore.awayScore
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                          : isThisMatchFinal
                          ? 'bg-slate-900/90 border-amber-500/30 shadow-inner'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xl shadow-lg">
                          {match.player1.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1.5">
                            <h4 className="font-black text-base sm:text-lg text-white">
                              {match.player1.name}
                            </h4>
                            {match.finalScore && match.finalScore.homeScore > match.finalScore.awayScore && (
                              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                                WINNER
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            {match.player1.tagline}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {match.player1.groupRecord}
                        </p>
                        <div className="flex justify-center gap-1 text-[10px] font-bold">
                          {match.player1.recentForm.map((f, i) => (
                            <span 
                              key={i} 
                              className={`w-4 h-4 rounded flex items-center justify-center ${
                                f === 'W' ? 'bg-emerald-500 text-slate-950' : f === 'D' ? 'bg-amber-500 text-slate-950' : 'bg-red-500 text-white'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Official Final Score Display / VS */}
                      <div className="sm:col-span-1 flex flex-col items-center justify-center py-2 sm:py-0">
                        {match.finalScore ? (
                          <div className="flex flex-col items-center text-center space-y-1.5">
                            <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-emerald-600 text-white font-mono font-black text-xl shadow-xl border border-amber-400/50">
                              {match.finalScore.display}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              FT / FINISHED
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center font-black text-sm shadow-inner">
                              VS
                            </div>
                            <span className="text-[10px] text-amber-400 font-mono font-bold">
                              {isThisMatchLive ? '🔴 LIVE' : 'Leo 21:30'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-sans">
                              {isThisMatchLive ? 'Uwanjani' : 'Saa 3:30 Usiku'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Player 2 Card */}
                      <div className={`sm:col-span-3 border rounded-2xl p-4 text-center space-y-2 transition-all ${
                        match.finalScore && match.finalScore.awayScore > match.finalScore.homeScore
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                          : isThisMatchFinal
                          ? 'bg-slate-900/90 border-amber-500/30 shadow-inner'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-emerald-600 text-white font-black text-xl shadow-lg">
                          {match.player2.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1.5">
                            <h4 className="font-black text-base sm:text-lg text-white">
                              {match.player2.name}
                            </h4>
                            {match.finalScore && match.finalScore.awayScore > match.finalScore.homeScore && (
                              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                                WINNER
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {match.player2.tagline}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {match.player2.groupRecord}
                        </p>
                        <div className="flex justify-center gap-1 text-[10px] font-bold">
                          {match.player2.recentForm.map((f, i) => (
                            <span 
                              key={i} 
                              className={`w-4 h-4 rounded flex items-center justify-center ${
                                f === 'W' ? 'bg-emerald-500 text-slate-950' : f === 'D' ? 'bg-amber-500 text-slate-950' : 'bg-red-500 text-white'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* OFFICIAL RESULTS & WINNING PREDICTIONS VERIFICATION BOX */}
                    {match.finalScore && (
                      <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            Matokeo Rasmi ya Mechi: {match.player1.name} {match.finalScore.display} {match.player2.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            Matokeo Yamethibitishwa
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Winning Picks */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Official Winning Predictions (Machaguo Yaliyoshinda):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {match.finalScore.winningPicks.map((pick, pIdx) => (
                                <span 
                                  key={pIdx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-[11px]"
                                >
                                  🟢 {pick}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Losing Picks */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              Losing Predictions (Machaguo Yaliokosa):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {match.finalScore.losingPicks.map((pick, pIdx) => (
                                <span 
                                  key={pIdx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[11px]"
                                >
                                  🔴 {pick}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATISTICAL INSIGHT PREVIEW */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                        <Info className="w-3.5 h-3.5" />
                        <span>Uchambuzi wa Kitaalamu wa Historia:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {match.traderAnalysis}
                      </p>
                    </div>

                    {/* ODDS MARKETS SECTION WITH OFFICIAL RESULT VERIFICATION */}
                    <div className="space-y-3 pt-2">
                      
                      {/* MARKET 1: 1X2 FULL TIME ODDS */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>1X2 Ushindi wa Mechi (Full Time)</span>
                          {isThisMatchFinished ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Matokeo Yamekamilika (FT)
                            </span>
                          ) : isThisMatchLocked ? (
                            <span className="text-red-400 flex items-center gap-1 text-[10px]">
                              <Lock className="w-3 h-3" /> Soko Limefungwa
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold">1 = ISAAC Win | X = Sare | 2 = MAN U Win</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {/* 1 (Home Win) */}
                          <button
                            disabled={isThisMatchLocked}
                            onClick={() => handleSelectOdd(
                              match,
                              '1X2',
                              'Matokeo ya Mechi (1X2)',
                              `1 (${match.player1.name} Win)`,
                              match.odds.homeWin
                            )}
                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative ${
                              isThisMatchLocked 
                                ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                : isSelected(match.id, '1X2', `1 (${match.player1.name} Win)`)
                                ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-950/80 scale-[1.02]'
                                : 'bg-slate-900/90 border-slate-800 hover:border-red-500/60 text-slate-200'
                            }`}
                          >
                            <span className="text-[10px] font-semibold text-slate-400 block truncate max-w-[90px]">
                              1 ({match.player1.name})
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                              {match.odds.homeWin.toFixed(2)}
                            </span>
                          </button>

                          {/* X (Draw) */}
                          <button
                            disabled={isThisMatchLocked}
                            onClick={() => handleSelectOdd(
                              match,
                              '1X2',
                              'Matokeo ya Mechi (1X2)',
                              'X (Draw)',
                              match.odds.draw
                            )}
                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative ${
                              isThisMatchLocked 
                                ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                : isSelected(match.id, '1X2', 'X (Draw)')
                                ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-950/80 scale-[1.02]'
                                : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 text-slate-200'
                            }`}
                          >
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              X (Draw)
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-amber-400">
                              {match.odds.draw.toFixed(2)}
                            </span>
                          </button>

                          {/* 2 (Away Win) */}
                          <button
                            disabled={isThisMatchLocked}
                            onClick={() => handleSelectOdd(
                              match,
                              '1X2',
                              'Matokeo ya Mechi (1X2)',
                              `2 (${match.player2.name} Win)`,
                              match.odds.awayWin
                            )}
                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative ${
                              isThisMatchLocked 
                                ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                : isSelected(match.id, '1X2', `2 (${match.player2.name} Win)`)
                                ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-950/80 scale-[1.02]'
                                : 'bg-slate-900/90 border-slate-800 hover:border-red-500/60 text-slate-200'
                            }`}
                          >
                            <span className="text-[10px] font-semibold text-slate-400 block truncate max-w-[90px]">
                              2 ({match.player2.name})
                            </span>
                            <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                              {match.odds.awayWin.toFixed(2)}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* MARKET: DOUBLE CHANCE (NAFASI MBILI) */}
                      {(match.odds.doubleChance1X || match.odds.doubleChanceX2 || match.odds.doubleChance12) && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span className="text-amber-400 font-bold">Double Chance (Nafasi Mbili)</span>
                            <span className="text-[10px] text-slate-400">1X: ISAAC au Sare | X2: MAN U au Sare | 12: Timu Yoyote Ishinde</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {/* 1X */}
                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'DC',
                                'Double Chance',
                                `1X (${match.player1.name} or Draw)`,
                                match.odds.doubleChance1X || 1.42
                              )}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'DC', `1X (${match.player1.name} or Draw)`)
                                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-[1.02]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 text-slate-200'
                              }`}
                            >
                              <span className="text-[10px] font-semibold text-slate-400 block truncate">1X ({match.player1.name} / Draw)</span>
                              <span className="text-base font-black font-mono text-amber-400">{(match.odds.doubleChance1X || 1.42).toFixed(2)}</span>
                            </button>

                            {/* X2 */}
                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'DC',
                                'Double Chance',
                                `X2 (${match.player2.name} or Draw)`,
                                match.odds.doubleChanceX2 || 1.51
                              )}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'DC', `X2 (${match.player2.name} or Draw)`)
                                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-[1.02]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 text-slate-200'
                              }`}
                            >
                              <span className="text-[10px] font-semibold text-slate-400 block truncate">X2 ({match.player2.name} / Draw)</span>
                              <span className="text-base font-black font-mono text-amber-400">{(match.odds.doubleChanceX2 || 1.51).toFixed(2)}</span>
                            </button>

                            {/* 12 */}
                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'DC',
                                'Double Chance',
                                '12 (Either Team Wins)',
                                match.odds.doubleChance12 || 1.28
                              )}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'DC', '12 (Either Team Wins)')
                                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-[1.02]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 text-slate-200'
                              }`}
                            >
                              <span className="text-[10px] font-semibold text-slate-400 block truncate">12 (Mshindi Yeyote)</span>
                              <span className="text-base font-black font-mono text-amber-400">{(match.odds.doubleChance12 || 1.28).toFixed(2)}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* MARKET 3: OVER / UNDER 2.5 GOALS */}
                      {match.odds.overOdds && match.odds.underOdds && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>{match.odds.overUnderLabel || 'Total Goals Over / Under 2.5'}</span>
                            <span className="text-[10px] text-amber-400">Over 2.5 (Mabao 3+) | Under 2.5 (Mabao 0-2)</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'OU25',
                                'Total Goals Over/Under 2.5',
                                'Over 2.5 Goals',
                                match.odds.overOdds!
                              )}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex items-center justify-between px-4 ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'OU25', 'Over 2.5 Goals')
                                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-[1.01]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60 text-slate-200'
                              }`}
                            >
                              <span className="text-xs font-bold text-slate-300 block">Over 2.5 Goals</span>
                              <span className="text-base font-black font-mono text-emerald-400">
                                {match.odds.overOdds.toFixed(2)}
                              </span>
                            </button>

                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'OU25',
                                'Total Goals Over/Under 2.5',
                                'Under 2.5 Goals',
                                match.odds.underOdds!
                              )}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex items-center justify-between px-4 ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'OU25', 'Under 2.5 Goals')
                                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-[1.01]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 text-slate-200'
                              }`}
                            >
                              <span className="text-xs font-bold text-slate-300 block">Under 2.5 Goals</span>
                              <span className="text-base font-black font-mono text-amber-400">
                                {match.odds.underOdds.toFixed(2)}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* MARKET 4: BOTH TEAMS TO SCORE (GG / NG) */}
                      {match.odds.ggOdds && match.odds.ngOdds && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>{match.odds.bttsLabel || 'Both Teams To Score (GG / NG)'}</span>
                            <span className="text-[10px] text-emerald-400">GG: Wote Wafunge (Yes) | NG: Asifunge (No)</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'BTTS',
                                'Both Teams To Score (GG/NG)',
                                'GG (Yes)',
                                match.odds.ggOdds!
                              )}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex items-center justify-between px-4 ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'BTTS', 'GG (Yes)')
                                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-[1.01]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60 text-slate-200'
                              }`}
                            >
                              <span className="text-xs font-bold text-slate-300 block">GG (Yes)</span>
                              <span className="text-base font-black font-mono text-emerald-400">
                                {match.odds.ggOdds.toFixed(2)}
                              </span>
                            </button>

                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'BTTS',
                                'Both Teams To Score (GG/NG)',
                                'NG (No)',
                                match.odds.ngOdds!
                              )}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex items-center justify-between px-4 ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'BTTS', 'NG (No)')
                                  ? 'bg-slate-800 border-slate-600 text-white shadow-lg scale-[1.01]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 text-slate-200'
                              }`}
                            >
                              <span className="text-xs font-bold text-slate-300 block">NG (No)</span>
                              <span className="text-base font-black font-mono text-slate-400">
                                {match.odds.ngOdds.toFixed(2)}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* MARKET 5: TO LIFT THE TROPHY (KUTWAA UBINGWA / WINNER OUTRIGHT) */}
                      {(match.odds.homeTrophyOdds || match.odds.homeQualifyOdds) && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1.5 text-amber-400 font-black">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              <span>To Lift The Trophy (Kutwaa Ubingwa / Winner Outright)</span>
                            </span>
                            <span className="text-[10px] text-amber-300">
                              Bingwa wa Fainali Kuu 2026
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'TROPHY',
                                'To Lift The Trophy',
                                `${match.player1.name} To Lift Trophy`,
                                match.odds.homeTrophyOdds || match.odds.homeQualifyOdds || 1.78
                              )}
                              className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-between px-4 ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'TROPHY', `${match.player1.name} To Lift Trophy`)
                                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-950/80 scale-[1.01]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 text-slate-200'
                              }`}
                            >
                              <div className="text-left">
                                <span className="text-xs font-bold text-slate-300 block">{match.player1.name}</span>
                                <span className="text-[9px] text-amber-300">Kutwaa Taji la Ubingwa</span>
                              </div>
                              <span className="text-base font-black font-mono text-amber-400">
                                {(match.odds.homeTrophyOdds || match.odds.homeQualifyOdds || 1.78).toFixed(2)}
                              </span>
                            </button>

                            <button
                              disabled={isThisMatchLocked}
                              onClick={() => handleSelectOdd(
                                match,
                                'TROPHY',
                                'To Lift The Trophy',
                                `${match.player2.name} To Lift Trophy`,
                                match.odds.awayTrophyOdds || match.odds.awayQualifyOdds || 1.98
                              )}
                              className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-between px-4 ${
                                isThisMatchLocked 
                                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500'
                                  : isSelected(match.id, 'TROPHY', `${match.player2.name} To Lift Trophy`)
                                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-950/80 scale-[1.01]'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 text-slate-200'
                              }`}
                            >
                              <div className="text-left">
                                <span className="text-xs font-bold text-slate-300 block">{match.player2.name}</span>
                                <span className="text-[9px] text-amber-300">Kutwaa Taji la Ubingwa</span>
                              </div>
                              <span className="text-base font-black font-mono text-amber-400">
                                {(match.odds.awayTrophyOdds || match.odds.awayQualifyOdds || 1.98).toFixed(2)}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                );
              });
            })()}
            </div>
          </div>

          {/* RIGHT COLUMN: INTEGRATED BET SLIP (4 cols on lg) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            
            <div className="bg-[#0b101d] border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              
              {/* Bet Slip Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white">eFootball Bet Slip</h4>
                    <span className="text-[10px] text-slate-400">Robo Fainali Accumulator</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                    {selections.length}
                  </span>
                  {selections.length > 0 && (
                    <button
                      onClick={handleClearSlip}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Futa Chaguo Zote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slip Items List */}
              {selections.length === 0 ? (
                <div className="py-8 text-center space-y-2 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-600">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Bet Slip Haina Chaguo Bado</p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                    {isBettingLocked 
                      ? 'Fainali Kuu ipo LIVE kwa sasa (22:00 cutoff). Soko limefungwa.' 
                      : 'Bonyeza odd yoyote (1X2, Double Chance, Over/Under 2.5, GG/NG, Kutwaa Ubingwa) kuongeza kwenye tiketi yako kabla ya Saa 4:00 Usiku.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {selections.map((sel) => (
                    <div
                      key={`${sel.matchId}-${sel.marketType}`}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-1.5 relative group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide block">
                            {sel.stageName}
                          </span>
                          <h5 className="text-xs font-extrabold text-white">
                            {sel.matchTitle}
                          </h5>
                        </div>
                        <button
                          onClick={() => handleRemoveSelection(sel.matchId, sel.marketType)}
                          className="text-slate-500 hover:text-red-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-[11px] font-bold text-emerald-400">
                          {sel.selection}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs">
                          {sel.odds.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Odds Multiplier & Stake Section */}
              {selections.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  
                  {/* Total Odds Multiplier */}
                  <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400">Jumla ya Odds:</span>
                    <span className="text-base font-black font-mono text-emerald-400">
                      {totalOdds.toFixed(2)} Odds
                    </span>
                  </div>

                  {/* Stake Input (Min 500 TSh) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-slate-200 flex items-center gap-1">
                        <span>💰</span>
                        <span>Weka Kiasi cha Bet (TSh):</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">Kiwango cha chini: 500 TSh</span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="500"
                        step="100"
                        value={stake}
                        onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-900 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                        TSh
                      </span>
                    </div>

                    {/* Quick Stake Preset Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[500, 1000, 2000, 5000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setStake(val)}
                          className={`text-[10px] py-1 rounded-lg font-bold transition-all ${
                            stake === val 
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Potential Return Display */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 border-2 border-emerald-500/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <span>💰</span> Kiasi Kilichowekwa (Stake):
                      </span>
                      <span className="font-mono font-black text-white">
                        TSh {stake.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <span>📊</span> Jumla ya Odds (Total Odds):
                      </span>
                      <span className="font-mono font-black text-amber-400">
                        {totalOdds.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                      <span className="font-black text-emerald-300 flex items-center gap-1">
                        <span>🎁</span> Tarajiwa / Ushindi (Payout):
                      </span>
                      <span className="text-base font-black font-mono text-emerald-300">
                        TSh {potentialWinnings.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Place Bet Action Button */}
                  <button
                    id="btn-place-efootball-bet"
                    disabled={isPlacing || selections.length === 0 || isBettingLocked}
                    onClick={handlePlaceBet}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 ${
                      isBettingLocked
                        ? 'bg-red-950/80 border-2 border-red-500 text-red-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 shadow-emerald-950/50'
                    }`}
                  >
                    {isPlacing ? (
                      <span>INAPROCESI TIKETI...</span>
                    ) : isBettingLocked ? (
                      <span className="flex items-center gap-2 text-red-200">
                        <Lock className="w-4 h-4 text-red-400 animate-pulse" />
                        <span>🔒 BETTING CLOSED! Mechi ziko LIVE</span>
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-slate-950" />
                        <span>PLACE BET / TUMA MKEKA (TSh {stake.toLocaleString()})</span>
                      </>
                    )}
                  </button>

                  {/* Wallet Balance Info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Salio la Pochi: <strong>TSh {walletBalance.toLocaleString()}</strong></span>
                    {walletBalance < stake && (
                      <button
                        onClick={onOpenDeposit}
                        className="text-amber-400 font-bold underline hover:text-amber-300"
                      >
                        Weka Pesa
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Quick Link to My Bets */}
            <div 
              onClick={() => setActiveTab('mybets')}
              className="cursor-pointer bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between text-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div>
                  <h5 className="font-bold text-white text-[11px]">Mikeka Yangu ({tickets.length})</h5>
                  <p className="text-[10px] text-slate-400">Tazama tiketi zako na hali ya ushindi</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>

          </div>

        </div>
      )}

      {/* TAB: HISTORIA NA TAKWIMU */}
      {activeTab === 'history' && (
        <div className="space-y-6">

          {/* 1. CONCLUDED BET TICKETS SECTION (WON / LOST) */}
          <div className="bg-[#0b101d] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  Historia ya Mikeka ya Betting (Concluded Bet Details)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {tickets.filter(t => t.status === 'WON' || t.status === 'LOST').length} Tiketi Zilizohitimishwa
              </span>
            </div>

            {(() => {
              const settledTickets = tickets.filter(t => t.status === 'WON' || t.status === 'LOST');
              if (settledTickets.length === 0) {
                return (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-slate-400 font-medium">
                      Hakuna mikeka iliyohitimishwa kwa sasa.
                    </p>
                    <p className="text-xs text-slate-500">
                      Mara baada ya mzunguko wa mechi kukamilika na matokeo kutangazwa, taarifa zote za ushindi au kukosa zitaonekana hapa.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {settledTickets.map(t => {
                    const isWon = t.status === 'WON';
                    const payout = t.potentialPayout || Math.floor(t.stake * t.totalOdds);

                    return (
                      <div 
                        key={t.id}
                        className={`rounded-2xl border p-4 transition-all space-y-3 ${
                          isWon 
                            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30' 
                            : 'bg-rose-950/10 border-rose-900/30'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">#{t.id}</span>
                            <span className="text-[11px] text-slate-400">• {t.createdAt || 'Leo'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                              isWon 
                                ? 'bg-emerald-500 text-slate-950' 
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isWon ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{isWon ? 'UMESHINDA (WON)' : 'UMEKOSA (LOST)'}</span>
                            </span>
                            {isWon && (
                              <span className="text-xs font-black font-mono text-emerald-400">
                                +TSh {payout.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stake, Odds, Payout Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/60">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Kiasi Ulichoweka (Stake):</span>
                            <span className="font-mono font-bold text-white">TSh {t.stake.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Jumla ya Odds:</span>
                            <span className="font-mono font-bold text-amber-400">{t.totalOdds.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Malipo / Zawadi:</span>
                            <span className={`font-mono font-bold ${isWon ? 'text-emerald-400' : 'text-slate-400'}`}>
                              TSh {payout.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Hali ya Malipo:</span>
                            <span className="text-[11px] font-semibold text-slate-300">
                              {t.paidOut ? '✓ Imelipwa Kwenye Wallet' : 'Haijalipwa'}
                            </span>
                          </div>
                        </div>

                        {/* Selections breakdown */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-400 block">Machaguo Yaliyowekwa:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {t.selections.map((sel, idx) => (
                              <div key={idx} className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-xs flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-slate-200 text-[11px]">{sel.matchTitle}</div>
                                  <div className="text-[10px] text-amber-400 font-mono">{sel.selection}</div>
                                </div>
                                <span className="font-mono font-bold text-emerald-400 text-xs">
                                  @{sel.odds.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {t.outcomeNotes && (
                          <p className="text-[11px] text-slate-400 italic">
                            Taarifa ya matokeo: {t.outcomeNotes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* 2. ARCHIVED MATCHES SECTION */}
          <div className="bg-[#0b101d] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  Historia ya Mechi Zilizopita (Archived Matches)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {archivedMatches.length} Mechi Zilizohitimishwa
              </span>
            </div>

            {archivedMatches.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Hakuna mechi zilizohifadhiwa kwenye kumbukumbu bado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {archivedMatches.map(m => (
                  <div key={m.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-400 uppercase">{m.stageName}</span>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black text-[10px]">
                        FT / FINISHED
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-y border-slate-800">
                      <div className="text-left">
                        <span className="font-bold text-white text-xs block">{m.player1.name}</span>
                        <span className="text-[10px] text-slate-400">{m.player1.tagline}</span>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-slate-950 font-mono font-black text-lg text-emerald-400 border border-slate-800">
                        {m.finalScore ? m.finalScore.display : (m.id === 'efb-final-1' ? '1 – 2' : 'FT')}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white text-xs block">{m.player2.name}</span>
                        <span className="text-[10px] text-slate-400">{m.player2.tagline}</span>
                      </div>
                    </div>

                    <div className="text-[11px] space-y-1">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Masoko Yaliyoshinda:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.finalScore?.winningPicks ? (
                          m.finalScore.winningPicks.map((pick, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                              🟢 {pick}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px]">Matokeo rasmi ya FT yamesajiliwa</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. PLAYER STATS SECTION */}
          <div className="bg-[#0b101d] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <span>Historia ya Wachezaji &amp; Takwimu Rasmi za Nusu Fainali</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-400">I$AAC17</span>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">19 Goals Scored</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Hatua ya Makundi:</strong> Ushindi 2, Sare 1 (Mabao 7 yaliyofungwa).</li>
                  <li><strong>Robo Fainali:</strong> Matokeo ya jumla (Aggregate) 12–7 dhidi ya Constantine.</li>
                  <li><strong>Mfumo wa Uchezaji:</strong> Kushambulia kwa kasi kubwa na ufanisi wa hali ya juu.</li>
                </ul>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400">DOUBLE J</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Defensive Wall</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Hatua ya Makundi:</strong> Ushindi 0, Sare 3 (0 Conceded - Clean sheets zote 3).</li>
                  <li><strong>Robo Fainali:</strong> Ushindi mkali wa 11–10 dhidi ya Nasri.</li>
                  <li><strong>Mfumo wa Uchezaji:</strong> Ulinzi madhubuti na counter-attack ya uhakika.</li>
                </ul>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-yellow-400">MDUDU JR</span>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-bold">Clean Sheet Record</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Hatua ya Makundi:</strong> Ushindi 1, Sare 2 (Mabao 7, Hakuruhusu bao hata moja).</li>
                  <li><strong>Mechi Maarufu:</strong> Ushindi mnono wa 7–0 dhidi ya Benny Kizzy.</li>
                  <li><strong>Robo Fainali:</strong> Walkover win dhidi ya Evari65 (Rekodi ya clean sheet inaendelea).</li>
                </ul>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400">MSODOKII</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Resilient Battler</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Hatua ya Makundi:</strong> Sare ngumu ya 1–1 dhidi ya I$AAC17.</li>
                  <li><strong>Uwezo:</strong> Kuzuia mashambulizi na kushambulia kwa kushtukiza.</li>
                  <li><strong>Nusu Fainali:</strong> Anakabiliana na MDUDU JR kuamua atakayeingia fainali.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TRADER REPORT */}
      {activeTab === 'trader' && (
        <div className="bg-[#0b101d] border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Mchakato wa Ukokotoaji wa Odds (12% Bookmaker Margin)</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kila odd kwenye jukwaa la <strong>SEIJO58 BET</strong> inazingatia uwezekano wa takwimu (probability) zilizowekwa kwenye kanuni ya uwiano wa 12% overround bookmaker margin. Hii inahakikisha wachezaji wanapata thamani kubwa zaidi ya ushindi huku masoko yakibaki thabiti na salama.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <h4 className="font-bold text-white">1. I$AAC17 vs DOUBLE J (1.75 | 3.60 | 3.90)</h4>
              <p className="text-slate-400">
                I$AAC17 anapewa 1.75 kwa sababu ya rekodi yake ya kufunga mabao 19 katika mashindano yote. Chaguo la Over 5.5 Goals (1.65) lina uwezekano mkubwa kutokana na matokeo ya robo fainali ya 12-7 na 11-10.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <h4 className="font-bold text-white">2. MSODOKII vs MDUDU JR (3.20 | 3.10 | 2.05)</h4>
              <p className="text-slate-400">
                MDUDU JR anapendelewa kwa 2.05 kutokana na ukuta wa ulinzi ambao haujawahi kuruhusu goli na ushindi mnono wa 7-0. Hata hivyo, GG (1.70) inatoa fursa nzuri kwa kuwa MSODOKII alifunga dhidi ya I$AAC17.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BET SLIP BAR WHEN SELECTIONS EXIST IN OTHER TABS */}
      {activeTab !== 'matches' && selections.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg bg-gradient-to-r from-slate-950 via-[#0c1427] to-slate-950 border-2 border-emerald-500 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg">
              {selections.length}
            </span>
            <div>
              <span className="text-xs font-black text-white block">Kuponi ya Bet ({selections.length} Pick):</span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {totalOdds.toFixed(2)} Odds • Tarajiwa: TSh {(stake * totalOdds).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <span>Fungua Bet Slip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 🏆 GRAND FINAL CHAMPION CELEBRATION POPUP MODAL */}
      {showChampionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-[#160d2b] via-[#0b101d] to-[#050811] border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-center relative overflow-hidden">
            {/* Background glow & confetti effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Trophy Icon with animations */}
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-[#0b101d] rounded-3xl flex items-center justify-center">
                <Trophy className="w-12 h-12 text-amber-400 fill-amber-400/20" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/40">
                🏆 SEIJO58 EFOOTBALL CAMP ™ — GRAND FINAL RESULT
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                DOUBLE J NI BINGWA! 👑
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Mechi imekamilika rasmi (<strong>FT / MATCH FINISHED</strong>). DOUBLE J ametwaa Ubingwa wa SEIJO58 EFOOTBALL CAMP ™ baada ya ushindi wa mabao 2–1 dhidi ya MSODOKII!
              </p>
            </div>

            {/* Official Scoreboard */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-around">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold block">MSODOKII</span>
                <span className="text-3xl sm:text-4xl font-mono font-black text-white">1</span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  FT / FINISHED
                </span>
                <span className="text-xs font-mono text-slate-500 block mt-1">VS</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[10px] text-amber-400 font-bold">DOUBLE J</span>
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
                <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">2</span>
              </div>
            </div>

            {/* Winning Selections Breakdown */}
            <div className="text-left bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-400 flex items-center gap-1 font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Masoko Yaliyoshinda (🟢 WON):
                </span>
                <span className="text-slate-400 text-[10px]">MSODOKII 1 – 2 DOUBLE J</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  🟢 2 (DOUBLE J Win) @ 2.25
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  🟢 Over 2.5 Goals (Mabao 3) @ 1.85
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  🟢 GG (Wote Wamefunga - 1:2) @ 1.65
                </span>
              </div>
            </div>

            {/* Winning celebration banner if user won */}
            {(() => {
              const gfWon = tickets.filter(t => t.status === 'WON' && isTicketOwnedByCurrentUser(t) && t.selections.some(s => s.matchId === 'efb-final-1'));
              const gfPayout = gfWon.reduce((sum, t) => sum + (t.potentialPayout || Math.floor(t.stake * t.totalOdds)), 0);

              if (gfPayout > 0) {
                return (
                  <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-4 text-emerald-300 shadow-xl space-y-1 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      🎉 Hongera! Mkeka Wako Umeshinda!
                    </p>
                    <p className="text-base sm:text-lg font-black text-white">
                      🎉 Hongera! DOUBLE J ameshinda Fainali! Mkeka wako umebeba TSh {gfPayout.toLocaleString()}!
                    </p>
                    <p className="text-[11px] text-emerald-400/90">
                      Fedha za ushindi zimeongezwa moja kwa moja kwenye Wallet yako!
                    </p>
                  </div>
                );
              }

              return (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300">
                  Mikeka yote ya Fainali Kuu imeshasuluhishwa kiotomatiki kwa mujibu wa matokeo rasmi ya FT.
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowChampionModal(false);
                  setActiveTab('mybets');
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>ANGALIA MIKEKA YANGU ILIYOSULUHISHWA</span>
              </button>

              <button
                onClick={() => setShowChampionModal(false)}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ➕ ADMIN MODAL: POST NEW MATCH */}
      {isPostMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0b101d] border-2 border-emerald-500/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  Admin: Weka Mechi Mpya (Post New Match)
                </h3>
              </div>
              <button
                onClick={() => setIsPostMatchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostNewMatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Timu / Mchezaji 1 (Home):</label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: DOUBLE J"
                    value={newMatchForm.homeTeam}
                    onChange={e => setNewMatchForm(prev => ({ ...prev, homeTeam: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Timu / Mchezaji 2 (Away):</label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: I$AAC17"
                    value={newMatchForm.awayTeam}
                    onChange={e => setNewMatchForm(prev => ({ ...prev, awayTeam: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Hatua / Jina la Mechi:</label>
                  <input
                    type="text"
                    placeholder="SEIJO58 EFOOTBALL CAMP ™"
                    value={newMatchForm.stageName}
                    onChange={e => setNewMatchForm(prev => ({ ...prev, stageName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Muda wa Mechi:</label>
                  <input
                    type="text"
                    placeholder="Leo Saa 4:00 Usiku"
                    value={newMatchForm.scheduledTime}
                    onChange={e => setNewMatchForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Odds Configuration */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-black uppercase text-amber-400 block">
                  ⚙️ Mpangilio wa Odds za Mechi:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">1 (Home Win):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newMatchForm.homeOdds}
                      onChange={e => setNewMatchForm(prev => ({ ...prev, homeOdds: parseFloat(e.target.value) || 2.0 }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">X (Draw):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newMatchForm.drawOdds}
                      onChange={e => setNewMatchForm(prev => ({ ...prev, drawOdds: parseFloat(e.target.value) || 3.0 }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-amber-400 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">2 (Away Win):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newMatchForm.awayOdds}
                      onChange={e => setNewMatchForm(prev => ({ ...prev, awayOdds: parseFloat(e.target.value) || 2.5 }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-bold text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Over 2.5:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newMatchForm.overOdds}
                      onChange={e => setNewMatchForm(prev => ({ ...prev, overOdds: parseFloat(e.target.value) || 1.8 }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Under 2.5:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newMatchForm.underOdds}
                      onChange={e => setNewMatchForm(prev => ({ ...prev, underOdds: parseFloat(e.target.value) || 1.9 }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block">GG (Both Score):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newMatchForm.ggOdds}
                      onChange={e => setNewMatchForm(prev => ({ ...prev, ggOdds: parseFloat(e.target.value) || 1.65 }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">NG (No Goal):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newMatchForm.ngOdds}
                      onChange={e => setNewMatchForm(prev => ({ ...prev, ngOdds: parseFloat(e.target.value) || 2.05 }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all"
                >
                  ✓ Chapisha Mechi Mpya Sasa
                </button>
                <button
                  type="button"
                  onClick={() => setIsPostMatchModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚽ ADMIN MODAL: SET FT SCORE & TRIGGER PAYOUTS */}
      {isSetScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b101d] border-2 border-sky-500/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-black text-white">
                  Admin: Weka Matokeo ya FT
                </h3>
              </div>
              <button
                onClick={() => setIsSetScoreModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Chagua Mechi:</label>
                <select
                  value={selectedScoreMatchId}
                  onChange={e => setSelectedScoreMatchId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-sky-500 focus:outline-none"
                >
                  {activeMatches.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.player1.name} vs {m.player2.name} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const target = activeMatches.find(m => m.id === selectedScoreMatchId) || activeMatches[0];
                if (!target) {
                  return <p className="text-slate-400">Hakuna mechi inayoweza kuwekewa matokeo kwa sasa.</p>;
                }

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                      <span className="text-[11px] text-amber-400 uppercase font-black">
                        Ingiza Mabao ya FT (Full Time)
                      </span>

                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <span className="text-xs font-bold text-white block mb-1">{target.player1.name}</span>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={scoreHomeInput}
                            onChange={e => setScoreHomeInput(parseInt(e.target.value) || 0)}
                            className="w-16 h-14 bg-slate-900 border-2 border-sky-500/50 rounded-xl text-center text-2xl font-mono font-black text-white focus:outline-none focus:border-sky-400"
                          />
                        </div>

                        <span className="text-xl font-bold text-slate-500 mt-5">-</span>

                        <div className="text-center">
                          <span className="text-xs font-bold text-white block mb-1">{target.player2.name}</span>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={scoreAwayInput}
                            onChange={e => setScoreAwayInput(parseInt(e.target.value) || 0)}
                            className="w-16 h-14 bg-slate-900 border-2 border-sky-500/50 rounded-xl text-center text-2xl font-mono font-black text-white focus:outline-none focus:border-sky-400"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ⚠️ <strong>Kumbuka:</strong> Kuwasilisha matokeo haya kutaanzisha ukaguzi wa tiketi zote kiotomatiki. Wale waliotabiri kwa usahihi kwa kutumia pesa halisi pekee ndio watapewa zawadi kwenye pochi zao.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSetMatchResult(target.id, scoreHomeInput, scoreAwayInput)}
                        className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-lg transition-all"
                      >
                        ✓ Hifadhi FT &amp; Suluhisha Zawadi
                      </button>
                      <button
                        onClick={() => setIsSetScoreModalOpen(false)}
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                      >
                        Ghairi
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
