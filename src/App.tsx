import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CasinoHeader } from './components/casino/CasinoHeader';
import { CasinoLobby } from './components/casino/CasinoLobby';
import { AviatorGame } from './components/casino/AviatorGame';
import { MinesGame } from './components/casino/MinesGame';
import { PenaltyShootoutGame } from './components/casino/PenaltyShootoutGame';
import { BlackjackGame } from './components/casino/BlackjackGame';
import { LuckySlotsGame } from './components/casino/LuckySlotsGame';
import { RouletteGame } from './components/casino/RouletteGame';
import { HiloGame } from './components/casino/HiloGame';
import { DiceRollGame } from './components/casino/DiceRollGame';
import { CoinFlipGame } from './components/casino/CoinFlipGame';
import { VIPClubView } from './components/casino/VIPClubView';
import { GameHistoryView } from './components/casino/GameHistoryView';
import { CasinoWalletView } from './components/casino/CasinoWalletView';
import { FairPlayView } from './components/casino/FairPlayView';
import { DepositModal } from './components/casino/DepositModal';
import { WithdrawModal } from './components/casino/WithdrawModal';
import { VIPActivationModal } from './components/casino/VIPActivationModal';
import { AdminDailyTokensModal } from './components/casino/AdminDailyTokensModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MandatoryOnboardingGate } from './components/casino/MandatoryOnboardingGate';
import { PostRegistrationPaymentModal } from './components/casino/PostRegistrationPaymentModal';
import { OnlineOnlyBarrier } from './components/casino/OnlineOnlyBarrier';
import { PWAInstallButton } from './components/pwa/PWAInstallButton';
import { EFootballCampView } from './components/efootball/EFootballCampView';
import { MyBetsView } from './components/efootball/MyBetsView';
import { EFootballTicket } from './types/efootball';
import { checkSelectionResult } from './data/efootballMatches';
import { useAuth } from './contexts/AuthContext';
import { getTodayTokens } from './utils/dailyTokenManager';
import { 
  getUserWalletStorageKey, 
  getUserTransactionsStorageKey, 
  getUserBetHistoryStorageKey, 
  getPersistedUserWallet, 
  persistUserWallet, 
  isIsaacUser,
  getScopedUserKey,
  getUserWallet
} from './utils/walletPersistence';
import { recordGamePlayed } from './lib/withdrawalRestrictions';

import { CasinoGameId, GameBetRecord, WalletTransaction } from './types/casino';
import { CASINO_GAMES, VIP_TIERS } from './data/casinoGames';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Send, 
  MessageCircle, 
  ShieldCheck, 
  Gift, 
  Flame,
  Award,
  Wallet,
  Crown
} from 'lucide-react';

export default function App() {
  const { 
    isAccountActive, 
    isAdmin, 
    currentUser, 
    userProfile, 
    walletBalance: authWallet, 
    setWalletBalanceDirectly,
    addWalletBalance,
    deductWalletBalance,
    logout
  } = useAuth();

  const currentUserId = currentUser?.uid || userProfile?.uid;
  const currentUserEmail = currentUser?.email || userProfile?.email;

  const isIsaacAccount = Boolean(
    (currentUserEmail && currentUserEmail.toLowerCase() === 'isaacfanuelmnicco@gmail.com') ||
    (userProfile?.phoneNumber && userProfile.phoneNumber.replace(/[^0-9]/g, '').includes('759420946')) ||
    (userProfile?.name && userProfile.name.toLowerCase().includes('isaac') && userProfile.name.toLowerCase().includes('mnicco'))
  );

  // 1. WALLET & VIP EXP STATE
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const activeSessionStr = localStorage.getItem('seijo58_active_session');
      if (activeSessionStr) {
        const sess = JSON.parse(activeSessionStr);
        if (sess && (sess.email || sess.uid)) {
          return getPersistedUserWallet(sess.email || sess.uid, isIsaacUser(sess));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return 0; // Starts strictly at 0 for guest mode
  });

  const [userExp, setUserExp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('seijo58_casino_exp');
      if (saved) return parseInt(saved, 10);
    } catch (e) {
      console.error(e);
    }
    return 0;
  });

  // Keep local wallet state strictly in sync with AuthContext authoritative balance
  useEffect(() => {
    if (typeof authWallet === 'number' && authWallet >= 0) {
      setWalletBalance(authWallet);
    }
  }, [authWallet]);

  // 2. TRANSACTIONS & BET HISTORY
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('seijo58_casino_txs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [betHistory, setBetHistory] = useState<GameBetRecord[]>(() => {
    try {
      const saved = localStorage.getItem('seijo58_casino_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // eFootball Tickets State: Clean start, strictly exclude unassigned/mock tickets
  const [efootballTickets, setEfootballTickets] = useState<EFootballTicket[]>(() => {
    try {
      const saved = localStorage.getItem('seijo58_efootball_tickets') || localStorage.getItem('my_bets') || localStorage.getItem('user_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly filter out mock/fake tickets
          return parsed.filter(t => t.id !== 'MK-882914' && t.id !== 'MK-552103' && t.id !== 'MK-331908' && (t.userId || t.userEmail));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // 3. NAVIGATION & MODALS
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && (window.location.hash === '#admin' || window.location.hash.includes('admin'))) {
        return 'admin';
      }
    } catch {}
    return 'lobby';
  });
  const [activeGameId, setActiveGameId] = useState<CasinoGameId | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [isVIPModalOpen, setIsVIPModalOpen] = useState<boolean>(false);
  const [isAdminTokensModalOpen, setIsAdminTokensModalOpen] = useState<boolean>(false);
  const [isPostRegPaymentOpen, setIsPostRegPaymentOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleOpenAdminPortal = () => {
    setActiveTab('admin');
    try {
      window.location.hash = '#admin';
    } catch {}
  };

  // Listen for hashchange to switch to admin view
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.hash.includes('admin')) {
        setActiveTab('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Clear Console Logging: Print today's 5 active tokens directly into browser console on startup
  useEffect(() => {
    const todayTokensArray = getTodayTokens();
    console.log("TODAY TOKENS:", todayTokensArray);

    // Provide global window access for admin convenience
    try {
      (window as unknown as { todayTokensArray: string[]; openAdminPortal: () => void }).todayTokensArray = todayTokensArray;
      (window as unknown as { todayTokensArray: string[]; openAdminPortal: () => void }).openAdminPortal = handleOpenAdminPortal;
    } catch (e) {}

    // Listen for custom event from external/embedded triggers
    const handleOpenAdmin = () => handleOpenAdminPortal();
    const handleShowPaymentModal = () => setIsPostRegPaymentOpen(true);
    const handleUserBlocked = () => {
      showToast("⚠️ Akaunti yako imefungiwa na Admin! Wasiliana na huduma kwa wateja.");
      if (logout) {
        logout();
      }
    };

    window.addEventListener('open-seijo58-admin', handleOpenAdmin);
    window.addEventListener('seijo58-show-payment-modal', handleShowPaymentModal);
    window.addEventListener('seijo58_user_blocked', handleUserBlocked);

    return () => {
      window.removeEventListener('open-seijo58-admin', handleOpenAdmin);
      window.removeEventListener('seijo58-show-payment-modal', handleShowPaymentModal);
      window.removeEventListener('seijo58_user_blocked', handleUserBlocked);
    };
  }, []);

  // USER-ISOLATED DATA SYNCHRONIZATION
  useEffect(() => {
    if (!currentUserEmail && !currentUserId) {
      setWalletBalance(0);
      setTransactions([]);
      setBetHistory([]);
      return;
    }

    const userKey = currentUserEmail || currentUserId;
    const isIsaac = isIsaacUser({ email: currentUserEmail, phoneNumber: userProfile?.phoneNumber, name: userProfile?.name });

    if (isIsaac) {
      const isAlreadyInit = localStorage.getItem(`seijo58_init_${getScopedUserKey(userKey)}`);
      const savedWallet = localStorage.getItem(getUserWalletStorageKey(userKey));

      if (!isAlreadyInit || savedWallet === '3780') {
        localStorage.setItem(`seijo58_init_${getScopedUserKey(userKey)}`, 'true');
        persistUserWallet(userKey, 1000);
        setWalletBalance(1000);
        if (setWalletBalanceDirectly) {
          setWalletBalanceDirectly(1000);
        }

        const depositTx: WalletTransaction = {
          id: 'tx-isaac-activation-deposit',
          type: 'DEPOSIT',
          amount: 1000,
          title: 'Malipo ya Awali ya Kuanzisha Akaunti (Activation Deposit)',
          timestamp: 'Leo',
          balanceAfter: 1000
        };
        setTransactions([depositTx]);
        setBetHistory([]);
        try {
          localStorage.setItem(getUserTransactionsStorageKey(userKey), JSON.stringify([depositTx]));
          localStorage.setItem(getUserBetHistoryStorageKey(userKey), JSON.stringify([]));
        } catch (e) {}
      } else {
        const bal = getPersistedUserWallet(userKey, true);
        setWalletBalance(bal);
      }
    } else {
      let effectiveBal = 0;
      const keyEmail = currentUserEmail || currentUserId;
      // First check getUserWallet from wallet_balance_ storage to prevent wiping credited winnings
      const localVal = getUserWallet(keyEmail);
      if (localVal > 0) {
        effectiveBal = localVal;
      } else if (typeof userProfile?.walletBalance === 'number' && userProfile.walletBalance >= 0) {
        effectiveBal = userProfile.walletBalance;
      } else {
        effectiveBal = getPersistedUserWallet(userKey, false);
      }
      setWalletBalance(effectiveBal);
      persistUserWallet(userKey, effectiveBal);

      try {
        const savedTxs = localStorage.getItem(getUserTransactionsStorageKey(userKey));
        if (savedTxs) setTransactions(JSON.parse(savedTxs));
        else setTransactions([]);

        const savedHist = localStorage.getItem(getUserBetHistoryStorageKey(userKey));
        if (savedHist) setBetHistory(JSON.parse(savedHist));
        else setBetHistory([]);
      } catch (e) {}
    }
  }, [currentUserEmail, currentUserId]);

  // Persist user-isolated EXP, Transactions, and Bet History
  useEffect(() => {
    const userKey = currentUserEmail || currentUserId;
    if (!userKey) return;

    try {
      localStorage.setItem(`seijo58_exp_${getScopedUserKey(userKey)}`, userExp.toString());
      localStorage.setItem(getUserTransactionsStorageKey(userKey), JSON.stringify(transactions));
      localStorage.setItem(getUserBetHistoryStorageKey(userKey), JSON.stringify(betHistory));
    } catch (e) {
      console.error(e);
    }
  }, [userExp, transactions, betHistory, currentUserEmail, currentUserId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  // Determine VIP Tier
  const currentTier = [...VIP_TIERS].reverse().find(t => userExp >= t.minExp) || VIP_TIERS[0];

  // GAME BET PLACEMENT HANDLER
  const handleBetPlaced = (stake: number, title: string): boolean => {
    const userKey = currentUserEmail || currentUserId;
    if (typeof (window as any).enforceUserBlocked === 'function' && (window as any).enforceUserBlocked(userKey)) {
      showToast("⚠️ Akaunti yako imefungiwa na Admin! Wasiliana na huduma kwa wateja.");
      return false;
    }

    if (walletBalance < stake) {
      showToast('Salio halitoshi! Tafadhali weka pesa kwenye pochi.');
      setIsDepositModalOpen(true);
      return false;
    }

    let newBalance = walletBalance - stake;

    // Use unified global function if available
    if (typeof (window as any).deductBetStake === 'function') {
      const res = (window as any).deductBetStake(stake, userKey);
      if (typeof res === 'number') {
        newBalance = res;
      }
    } else {
      persistUserWallet(userKey, newBalance);
    }

    setWalletBalance(newBalance);
    if (deductWalletBalance) {
      deductWalletBalance(stake);
    }
    if (typeof (window as any).updateWalletUI === 'function') {
      (window as any).updateWalletUI(newBalance);
    }

    // Add EXP (1 EXP per 100 TSh staked)
    const expGained = Math.max(5, Math.floor(stake / 100));
    setUserExp(prev => prev + expGained);

    // Record Transaction
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'BET',
      amount: stake,
      title: title,
      timestamp: new Date().toLocaleTimeString(),
      balanceAfter: newBalance
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 49)]);

    // Track total games played for strict withdrawal qualification
    recordGamePlayed(userKey);

    return true;
  };

  // HARD CAP MAXIMUM WINNINGS PER ROUND
  const MAX_WIN_LIMIT = 500000; // Maximum win is 500,000 TSh

  // GAME WIN HANDLER (WITH MATHEMATICAL MAX WIN CAP = 500,000 TSh)
  const handleWin = (rawPayout: number, multiplier: number, title: string) => {
    // Automatically limit the payout credited to the user's wallet to exactly 500,000 TSh if exceeded
    const isCapped = rawPayout > MAX_WIN_LIMIT;
    const payout = isCapped ? MAX_WIN_LIMIT : rawPayout;
    const newBalance = walletBalance + payout;
    setWalletBalance(newBalance);
    const userKey = currentUserEmail || currentUserId;
    persistUserWallet(userKey, newBalance);
    if (addWalletBalance) {
      addWalletBalance(payout);
    }
    if (typeof (window as any).updateWalletUI === 'function') {
      (window as any).updateWalletUI(newBalance);
    }

    if (isCapped) {
      showToast(`⚠️ KIKOMO CHA USHINDI: Ushindi umefikia kikomo cha juu cha TSh ${MAX_WIN_LIMIT.toLocaleString()} kwa raundi moja!`);
    }

    if (multiplier >= 2.0) {
      triggerConfetti();
    }

    // Record Transaction
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'WIN',
      amount: payout,
      title: isCapped ? `${title} (Kikomo 500k TSh)` : title,
      timestamp: new Date().toLocaleTimeString(),
      balanceAfter: newBalance
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 49)]);

    // Record Bet History
    const selectedGame = CASINO_GAMES.find(g => g.id === activeGameId);
    const newHistory: GameBetRecord = {
      id: `rec-${Date.now()}`,
      gameId: activeGameId || 'aviator',
      gameName: selectedGame ? selectedGame.name : 'Casino Game',
      stake: Math.max(1, Math.floor(rawPayout / multiplier)),
      payout: payout,
      multiplier: multiplier,
      status: 'WON',
      timestamp: new Date().toLocaleTimeString()
    };
    setBetHistory(prev => [newHistory, ...prev.slice(0, 49)]);
  };

  // AUTOMATIC WIN PAYOUT ENGINE FOR EFOOTBALL TICKETS
  const handleSportsWinPayout = (rawPayout: number, ticketId: string, title: string) => {
    const payout = Math.floor(rawPayout);
    const userKey = currentUserEmail || currentUserId;

    // Trigger explicit global settlement function with strict idempotency
    if (typeof (window as any).creditWinningTicket === 'function') {
      const res = (window as any).creditWinningTicket(ticketId, payout);
      if (typeof res === 'number') {
        setWalletBalance(res);
        triggerConfetti();
        if (addWalletBalance) {
          addWalletBalance(payout);
        }
        return;
      }
    }

    const newBalance = walletBalance + payout;
    setWalletBalance(newBalance);
    persistUserWallet(userKey, newBalance);
    
    // Strict user wallet persistence & security audit log
    if (currentUserEmail) {
      localStorage.setItem(`wallet_balance_${currentUserEmail.toLowerCase().trim()}`, String(newBalance));
      console.log(`PAYOUT SUCCESS: Credited TSh ${payout} to ${currentUserEmail}. New Total: TSh ${newBalance}`);
    }

    if (addWalletBalance) {
      addWalletBalance(payout);
    }
    triggerConfetti();

    if (typeof (window as any).updateWalletUI === 'function') {
      (window as any).updateWalletUI(newBalance);
    }

    // Look up actual ticket to record exact stake
    const ticket = efootballTickets.find(t => t.id === ticketId);
    const actualStake = ticket ? ticket.stake : 1000;

    // Record Transaction
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'WIN',
      amount: payout,
      title: title,
      timestamp: new Date().toLocaleTimeString(),
      balanceAfter: newBalance
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 49)]);

    // Record Bet History with exact stake
    const newHistory: GameBetRecord = {
      id: `rec-${Date.now()}`,
      gameId: 'penalty',
      gameName: 'eFootball Camp',
      stake: actualStake,
      payout: payout,
      multiplier: Number((payout / (actualStake || 1)).toFixed(2)),
      status: 'WON',
      timestamp: new Date().toLocaleTimeString()
    };
    setBetHistory(prev => [newHistory, ...prev.slice(0, 49)]);
  };

  const handleSettleTicket = (ticketId: string, outcome: 'WON' | 'LOST') => {
    const targetTicket = efootballTickets.find(t => t.id === ticketId);
    if (!targetTicket) return;

    if (outcome === 'WON' && !targetTicket.paidOut) {
      handleSportsWinPayout(
        targetTicket.potentialPayout, 
        targetTicket.id, 
        `SEIJO58 eFootball Won: Ticket #${targetTicket.id}`
      );
      showToast(`🎉 Hongera! Mkeka wako umebeba TSh ${targetTicket.potentialPayout.toLocaleString()}!`);
    } else if (outcome === 'LOST') {
      showToast(`Tiketi #${ticketId} imehitimishwa kama UMEKOSA.`);
    }

    const updated = efootballTickets.map(t => {
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

    setEfootballTickets(updated);
    try {
      localStorage.setItem('seijo58_efootball_tickets', JSON.stringify(updated));
    } catch (e) {}
  };

  // Helper to ensure tickets belong explicitly to the logged-in user account or guest session
  const isTicketOwnedByCurrentUser = (ticket: EFootballTicket) => {
    if (!currentUserId && !currentUserEmail) {
      return !ticket.userId || ticket.userId === 'guest' || ticket.userId === 'current_user';
    }
    const idMatch = currentUserId && ticket.userId === currentUserId;
    const emailMatch = currentUserEmail && ticket.userEmail && ticket.userEmail.toLowerCase() === currentUserEmail.toLowerCase();
    const guestMatch = !ticket.userId || ticket.userId === 'guest';
    return Boolean(idMatch || emailMatch || guestMatch);
  };

  // Only tickets explicitly placed by the current logged-in user
  const userTickets = efootballTickets.filter(isTicketOwnedByCurrentUser);

  // AUTOMATIC BET SETTLEMENT ENGINE & CELEBRATION TOAST ON STARTUP
  useEffect(() => {
    if (!efootballTickets || efootballTickets.length === 0) {
      const hasShownToast = sessionStorage.getItem('seijo58_final_toast_shown');
      if (!hasShownToast) {
        showToast("🎉 HONGERA! Matokeo ya Fainali yamesasishwa na ushindi wako umeongezwa kwenye Wallet!");
        sessionStorage.setItem('seijo58_final_toast_shown', 'true');
      }
      return;
    }

    let totalQfPayout = 0;
    let anySettled = false;

    const updated = efootballTickets.map(ticket => {
      // If already settled WON and paid out/credited, or LOST, keep as is
      if (ticket.status === 'WON' && (ticket.paidOut || ticket.credited)) return ticket;
      if (ticket.status === 'LOST') return ticket;

      const isOwned = isTicketOwnedByCurrentUser(ticket);

      let hasPending = false;
      let allWon = true;
      let failureReason = '';

      for (const sel of ticket.selections) {
        const res = checkSelectionResult(sel.matchId, sel.marketType, sel.selection);
        if (res.isPending) {
          hasPending = true;
          break;
        }
        if (!res.isWin) {
          allWon = false;
          failureReason = res.reason;
          break;
        }
      }

      // If any match or outright market is still pending, keep the ticket pending
      if (hasPending) {
        return ticket;
      }

      anySettled = true;

      if (allWon) {
        const payout = ticket.potentialPayout || Math.floor((ticket.stake || 1000) * (ticket.totalOdds || 1));
        
        // ONLY credit payout if the ticket was explicitly placed by this authenticated user
        if (isOwned && !ticket.paidOut && !ticket.credited) {
          handleSportsWinPayout(payout, ticket.id, `SEIJO58 eFootball Won: Ticket #${ticket.id}`);
          totalQfPayout += payout;
        }

        return {
          ...ticket,
          status: 'WON' as const,
          settled: true,
          paidOut: true,
          credited: true,
          settledAt: new Date().toLocaleTimeString(),
          outcomeNotes: 'Utabiri wote umeshinda matokeo rasmi ya Fainali Kuu (ISAAC 4-6 MAN U)!'
        };
      } else {
        return {
          ...ticket,
          status: 'LOST' as const,
          settled: true,
          paidOut: false,
          settledAt: new Date().toLocaleTimeString(),
          outcomeNotes: failureReason || 'Kuna chaguo lililokosa matokeo rasmi ya Fainali.'
        };
      }
    });

    if (anySettled) {
      setEfootballTickets(updated);
      try {
        localStorage.setItem('seijo58_efootball_tickets', JSON.stringify(updated));
        localStorage.setItem('my_bets', JSON.stringify(updated));
        localStorage.setItem('user_tickets', JSON.stringify(updated));
      } catch (e) {}

      showToast("🎉 HONGERA! Matokeo ya Fainali yamesasishwa na ushindi wako umeongezwa kwenye Wallet!");
      sessionStorage.setItem('seijo58_final_toast_shown', 'true');
    } else {
      const hasShownToast = sessionStorage.getItem('seijo58_final_toast_shown');
      if (!hasShownToast) {
        showToast("🎉 HONGERA! Matokeo ya Fainali yamesasishwa na ushindi wako umeongezwa kwenye Wallet!");
        sessionStorage.setItem('seijo58_final_toast_shown', 'true');
      }
    }
  }, [currentUserId, currentUserEmail]);

  // Listen for settlement and wallet updates dispatched by index.html startup script
  useEffect(() => {
    const handleSettledEvent = (e: any) => {
      try {
        const raw = localStorage.getItem('seijo58_efootball_tickets') || localStorage.getItem('my_bets') || localStorage.getItem('user_tickets');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            setEfootballTickets(list);
          }
        }
      } catch (err) {}
    };

    const handleWalletUpdated = (e: any) => {
      if (e?.detail?.newBalance !== undefined) {
        setWalletBalance(e.detail.newBalance);
      }
    };

    const handleToastEvent = (e: any) => {
      if (e?.detail?.message) {
        showToast(e.detail.message);
      }
    };

    window.addEventListener('seijo58_tickets_settled', handleSettledEvent);
    window.addEventListener('seijo58_sync_tickets', handleSettledEvent);
    window.addEventListener('seijo58_wallet_updated', handleWalletUpdated);
    window.addEventListener('seijo58_show_toast', handleToastEvent);

    return () => {
      window.removeEventListener('seijo58_tickets_settled', handleSettledEvent);
      window.removeEventListener('seijo58_sync_tickets', handleSettledEvent);
      window.removeEventListener('seijo58_wallet_updated', handleWalletUpdated);
      window.removeEventListener('seijo58_show_toast', handleToastEvent);
    };
  }, []);

  // GAME REFUND (PUSH) HANDLER
  const handleRefund = (amount: number, title: string) => {
    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    const userKey = currentUserEmail || currentUserId;
    persistUserWallet(userKey, newBalance);
    if (addWalletBalance) {
      addWalletBalance(amount);
    }

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'REFUND',
      amount: amount,
      title: title,
      timestamp: new Date().toLocaleTimeString(),
      balanceAfter: newBalance
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
  };

  // DEPOSIT HANDLER (WITH DEPOSIT BONUS)
  const handleDepositSuccess = (amount: number, ref: string, bonus: number = 0) => {
    let calculatedBonus = bonus;
    if (calculatedBonus === 0) {
      if (amount === 5000) calculatedBonus = 2000;
      else if (amount === 10000) calculatedBonus = 3000;
      else if (amount >= 10000) calculatedBonus = 3000;
      else if (amount >= 5000) calculatedBonus = 2000;
    }

    const totalCredited = amount + calculatedBonus;
    const newBalance = walletBalance + totalCredited;
    setWalletBalance(newBalance);
    const userKey = currentUserEmail || currentUserId;
    persistUserWallet(userKey, newBalance);
    if (addWalletBalance) {
      addWalletBalance(totalCredited);
    }

    if (calculatedBonus > 0) {
      triggerConfetti();
    }

    // Extra VIP EXP on deposit
    const bonusExp = Math.floor(amount / 50);
    setUserExp(prev => prev + bonusExp);

    const nowStr = new Date().toLocaleTimeString();
    const depositTx: WalletTransaction = {
      id: `tx-dep-${Date.now()}`,
      type: 'DEPOSIT',
      amount: amount,
      title: `Deposit (${ref})`,
      timestamp: nowStr,
      balanceAfter: walletBalance + amount
    };

    const newTxs: WalletTransaction[] = [depositTx];

    if (calculatedBonus > 0) {
      const bonusTx: WalletTransaction = {
        id: `tx-bon-${Date.now() + 1}`,
        type: 'BONUS',
        amount: calculatedBonus,
        title: `Bonasi ya Kuweka Pesa (Weka ${amount.toLocaleString()} Pata +${calculatedBonus.toLocaleString()})`,
        timestamp: nowStr,
        balanceAfter: newBalance
      };
      newTxs.unshift(bonusTx);
    }

    setTransactions(prev => [...newTxs, ...prev.slice(0, 48)]);
  };

  // WITHDRAW HANDLER
  const handleWithdrawSuccess = (amount: number, phone: string, network: string): boolean => {
    if (amount > walletBalance) {
      showToast('Salio halitoshi kufanya utoaji huu.');
      return false;
    }

    const newBalance = walletBalance - amount;
    setWalletBalance(newBalance);
    const userKey = currentUserEmail || currentUserId;
    persistUserWallet(userKey, newBalance);
    if (deductWalletBalance) {
      deductWalletBalance(amount);
    }

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'WITHDRAW',
      amount: amount,
      title: `Utoaji kwenda ${network} (${phone})`,
      timestamp: new Date().toLocaleTimeString(),
      balanceAfter: newBalance
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
    return true;
  };

  // BONUS CLAIM
  const handleClaimReward = (amount: number, title: string) => {
    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    const userKey = currentUserEmail || currentUserId;
    persistUserWallet(userKey, newBalance);
    if (addWalletBalance) {
      addWalletBalance(amount);
    }
    triggerConfetti();

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'BONUS',
      amount: amount,
      title: title,
      timestamp: new Date().toLocaleTimeString(),
      balanceAfter: newBalance
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
  };

  // Navigation Handlers
  const handleSelectGame = (gameId: CasinoGameId) => {
    if (typeof (window as any).enforceAccountBlock === 'function' && (window as any).enforceAccountBlock()) {
      showToast("⚠️ Akaunti yako imefungiwa na Admin! Wasiliana na huduma kwa wateja.");
      return;
    }
    setActiveGameId(gameId);
    setActiveTab('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTab = (tab: string) => {
    if (typeof (window as any).enforceAccountBlock === 'function' && (window as any).enforceAccountBlock()) {
      showToast("⚠️ Akaunti yako imefungiwa na Admin! Wasiliana na huduma kwa wateja.");
      return;
    }
    setActiveTab(tab);
    if (tab !== 'game') {
      setActiveGameId(null);
    }
    if (tab === 'mybets') {
      // Force real-time sync & auto-settlement on tab switch
      if (typeof window !== 'undefined' && (window as any).SeijoSemiFinalsSettlement) {
        (window as any).SeijoSemiFinalsSettlement.settleAllTickets();
      }
      try {
        const raw = localStorage.getItem('seijo58_efootball_tickets') || localStorage.getItem('my_bets') || localStorage.getItem('user_tickets');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setEfootballTickets(parsed);
          }
        }
      } catch (e) {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedGameInfo = CASINO_GAMES.find(g => g.id === activeGameId);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-red-600 selection:text-white">
      {/* EXCLUSIVELY ONLINE ENFORCEMENT BARRIER */}
      <OnlineOnlyBarrier />

      {/* MANDATORY REGISTRATION (GOOGLE + PHONE) AND PAYMENT ACTIVATION GATE */}
      <MandatoryOnboardingGate
        onActivated={() => {
          showToast('✓ Akaunti imewashwa rasmi! Furahia SEIJO58 BET.');
        }}
        showToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-2xl shadow-red-950/90 flex items-center gap-2 border border-amber-400/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <CasinoHeader
        activeTab={activeTab}
        activeGameId={activeGameId}
        walletBalance={walletBalance}
        userExp={userExp}
        vipTierName={currentTier.name}
        myBetsCount={efootballTickets.filter(t => t.status === 'PENDING').length}
        onNavigateTab={handleNavigateTab}
        onSelectGame={handleSelectGame}
        onOpenDeposit={() => {
          if (typeof (window as any).enforceAccountBlock === 'function' && (window as any).enforceAccountBlock()) {
            showToast("⚠️ Akaunti yako imefungiwa na Admin! Wasiliana na huduma kwa wateja.");
            return;
          }
          setIsDepositModalOpen(true);
        }}
        onOpenWithdraw={() => {
          const userKey = currentUserEmail || currentUserId;
          if (typeof (window as any).enforceAccountBlock === 'function' && (window as any).enforceAccountBlock(userKey)) {
            showToast("⚠️ Akaunti yako imefungiwa na Admin! Wasiliana na huduma kwa wateja.");
            return;
          }
          setIsWithdrawModalOpen(true);
        }}
        onOpenVIPPass={() => setIsVIPModalOpen(true)}
        onOpenAdminPortal={handleOpenAdminPortal}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 pb-28 sm:pb-16 space-y-6">
        
        {/* VIEW: ADMIN DASHBOARD (CENTRAL DATABASE & LIVE WALLET CONTROL) */}
        {activeTab === 'admin' && (
          <AdminDashboard
            onBackToApp={() => {
              setActiveTab('lobby');
              try {
                window.location.hash = '';
              } catch {}
            }}
          />
        )}

        {/* VIEW 1: CASINO LOBBY */}
        {activeTab === 'lobby' && (
          <CasinoLobby
            onSelectGame={handleSelectGame}
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {/* VIEW: SEIJO58 EFOOTBALL CAMP ™ */}
        {activeTab === 'efootball' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#0f172a] border border-slate-800 p-3.5 rounded-2xl">
              <button
                onClick={() => handleNavigateTab('lobby')}
                className="flex items-center gap-2 text-xs font-black text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-red-500" />
                <span>RUDI KWENYE CASINO LOBBY</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  🎮 SEIJO58 EFOOTBALL CAMP ™
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40 font-bold">
                  GRAND FINAL 2026
                </span>
              </div>
            </div>

            <EFootballCampView
              walletBalance={walletBalance}
              onBetPlaced={handleBetPlaced}
              onWinPayout={handleSportsWinPayout}
              onOpenDeposit={() => setIsDepositModalOpen(true)}
              showToast={showToast}
              tickets={efootballTickets}
              setTickets={setEfootballTickets}
              defaultTab="matches"
            />
          </div>
        )}

        {/* VIEW: MY BETS / MIKEKA YANGU DASHBOARD */}
        {activeTab === 'mybets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#0f172a] border border-slate-800 p-3.5 rounded-2xl">
              <button
                onClick={() => handleNavigateTab('efootball')}
                className="flex items-center gap-2 text-xs font-black text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-red-500" />
                <span>RUDI KWENYE MECHI &amp; MASOKO</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  📋 MIKEKA YANGU (MY BETS)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40 font-bold">
                  {userTickets.length} MKEKA
                </span>
              </div>
            </div>

            <MyBetsView
              tickets={userTickets}
              walletBalance={walletBalance}
              onNavigateToEFootball={() => handleNavigateTab('efootball')}
              onOpenDeposit={() => setIsDepositModalOpen(true)}
              onSettleTicket={handleSettleTicket}
              showToast={showToast}
            />
          </div>
        )}

        {/* VIEW 2: ACTIVE GAME VIEW */}
        {activeTab === 'game' && activeGameId && (
          <div className="space-y-4">
            {/* Top Back to Lobby Nav Header */}
            <div className="flex items-center justify-between bg-[#0f172a] border border-slate-800 p-3.5 rounded-2xl">
              <button
                onClick={() => handleNavigateTab('lobby')}
                className="flex items-center gap-2 text-xs font-black text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-red-500" />
                <span>RUDI KWENYE CASINO LOBBY</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white hidden sm:inline">
                  {selectedGameInfo?.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40 font-bold">
                  RTP {selectedGameInfo?.rtp}
                </span>
              </div>
            </div>

            {/* Render Specific Game */}
            {activeGameId === 'aviator' && (
              <AviatorGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'mines' && (
              <MinesGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'penalty' && (
              <PenaltyShootoutGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'blackjack' && (
              <BlackjackGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onRefund={handleRefund}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'slots' && (
              <LuckySlotsGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'roulette' && (
              <RouletteGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'hilo' && (
              <HiloGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'dice' && (
              <DiceRollGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}

            {activeGameId === 'coinflip' && (
              <CoinFlipGame
                walletBalance={walletBalance}
                onBetPlaced={handleBetPlaced}
                onWin={handleWin}
                onOpenDeposit={() => setIsDepositModalOpen(true)}
                showToast={showToast}
              />
            )}
          </div>
        )}

        {/* VIEW 3: VIP CLUB & CASHBACK */}
        {activeTab === 'vip' && (
          <VIPClubView
            userExp={userExp}
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            showToast={showToast}
          />
        )}

        {/* VIEW 4: BET HISTORY */}
        {activeTab === 'history' && (
          <GameHistoryView betHistory={betHistory} />
        )}

        {/* VIEW 5: WALLET & CASH OUT */}
        {activeTab === 'wallet' && (
          <CasinoWalletView
            walletBalance={walletBalance}
            transactions={transactions}
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
            onDepositSuccess={handleDepositSuccess}
            showToast={showToast}
          />
        )}

        {/* VIEW 6: PROVABLY FAIR */}
        {activeTab === 'fairness' && (
          <FairPlayView />
        )}

        {/* BOTTOM COMMUNITY & SUPPORT CALLOUT */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <div className="bg-gradient-to-r from-red-950/60 via-[#0b1222] to-amber-950/60 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-sm sm:text-base text-white">
                  Jumuika na Wachezaji wa Casino wa SEIJO58 Tanzania
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Huduma ya wateja masaa 24/7, miamala ya haraka ya Vodacom M-Pesa, Tigo Pesa, Airtel Money na Halopesa.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <a
                href="https://t.me/seijo58official"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-950/40 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Telegram Rasmi</span>
              </a>

              <a
                href="https://chat.whatsapp.com/HL87kuFZoeq2h2pHcYV8Qr?s=cl&p=a&mlu=0&ilr=4"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Group la WhatsApp (Seijo58 Casino™)</span>
              </a>

              <PWAInstallButton variant="header" />

              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Weka Pesa (+Bonus)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around text-[10px] font-bold">
        <button
          onClick={() => handleNavigateTab('lobby')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'lobby' ? 'text-red-500' : 'text-slate-400'
          }`}
        >
          <span className="text-base">🎰</span>
          <span>Lobby</span>
        </button>

        <button
          onClick={() => handleNavigateTab('efootball')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'efootball' ? 'text-amber-400 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-base">🎮</span>
          <span>eFootball</span>
        </button>

        <button
          onClick={() => handleNavigateTab('mybets')}
          className={`flex flex-col items-center gap-0.5 relative ${
            activeTab === 'mybets' ? 'text-amber-400 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📋</span>
          <span>Mikeka</span>
          {efootballTickets.filter(t => t.status === 'PENDING').length > 0 && (
            <span
              id="mikeka-badge"
              className="absolute -top-1 right-2 px-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]"
            >
              {efootballTickets.filter(t => t.status === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectGame('aviator')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'game' && activeGameId === 'aviator' ? 'text-red-500' : 'text-slate-400'
          }`}
        >
          <span className="text-base">🚀</span>
          <span>Aviator</span>
        </button>

        <button
          onClick={() => handleSelectGame('mines')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'game' && activeGameId === 'mines' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base">💣</span>
          <span>Mines</span>
        </button>

        <button
          onClick={() => handleNavigateTab('wallet')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'wallet' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base">💳</span>
          <span>Pochi</span>
        </button>

        <button
          onClick={() => handleNavigateTab('vip')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'vip' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base">👑</span>
          <span>VIP</span>
        </button>
      </div>

      {/* MODALS */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDepositSuccess={handleDepositSuccess}
        showToast={showToast}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        walletBalance={walletBalance}
        onWithdrawSuccess={handleWithdrawSuccess}
        showToast={showToast}
      />

      <VIPActivationModal
        isOpen={isVIPModalOpen}
        onClose={() => setIsVIPModalOpen(false)}
        onActivateSuccess={tier => {
          setUserExp(prev => prev + 5000);
          showToast(`✓ Umewezesha ${tier}!`);
        }}
        showToast={showToast}
      />

      {/* SECRET ADMIN DAILY TOKENS GENERATOR MODAL */}
      <AdminDailyTokensModal
        isOpen={isAdminTokensModalOpen}
        onClose={() => setIsAdminTokensModalOpen(false)}
        showToast={showToast}
      />

      {/* POST-REGISTRATION PAYMENT & CODE REQUEST MODAL */}
      <PostRegistrationPaymentModal
        isOpen={isPostRegPaymentOpen}
        onClose={() => setIsPostRegPaymentOpen(false)}
        onActivated={() => {
          setIsPostRegPaymentOpen(false);
          showToast('✓ Akaunti imewashwa kikamilifu!');
        }}
        showToast={showToast}
      />

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-2">
        <p className="font-extrabold text-slate-300 tracking-wider">
          SEIJO58 BET • TANZANIA OFFICIAL CASINO & CRASH PLATFORM
        </p>
        <p className="text-[11px] text-slate-500">
          Malipo ya Haraka: M-Pesa, Tigo Pesa, Airtel Money, Halopesa • Msaada wa WhatsApp: +255 764 220 155 • 18+ Cheza Kistaarabu.
        </p>
        <div className="flex items-center justify-center gap-3 text-[11px] pt-1">
          <button
            onClick={handleOpenAdminPortal}
            className="text-amber-500 hover:text-amber-300 font-bold transition-colors flex items-center gap-1 cursor-pointer bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30"
            title="Admin Dashboard (Mmiliki Pekee)"
          >
            <span>🔑 Admin Dashboard (#admin)</span>
          </button>
          <span>•</span>
          <span className="text-slate-400 font-medium">Central Firestore Database</span>
        </div>
      </footer>
    </div>
  );
}
