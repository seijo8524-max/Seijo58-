import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  KeyRound, 
  Users, 
  CreditCard, 
  Settings, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  RefreshCw, 
  Search, 
  Trash2,
  TrendingUp,
  Sparkles,
  Lock,
  Unlock,
  Wallet,
  Ban,
  TrendingDown,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PaymentRequest, ActivationCode, UserProfile, VIPPlan } from '../types';
import { SUBSCRIPTION_PLANS } from './SubscriptionPage';
import { EFootballTicket } from '../types/efootball';

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const { isAdmin: isAuthAdmin, currentUser } = useAuth();
  
  // Password unlock state for direct #admin hash or modal access
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('seijo58_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const isAdmin = isAuthAdmin || isPinUnlocked;

  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'tickets' | 'codes' | 'settings'>('users');

  // Firestore Data State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [ticketsList, setTicketsList] = useState<EFootballTicket[]>([]);
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'all' | 'WON' | 'LOST' | 'PENDING'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Forms
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [newCodePlan, setNewCodePlan] = useState<VIPPlan>(SUBSCRIPTION_PLANS[1]);
  const [customDays, setCustomDays] = useState(7);
  const [assignedEmail, setAssignedEmail] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Wallet Adjustment Modal
  const [adjustingUser, setAdjustingUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(5000);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('Uhakiki wa Malipo ya SMS');
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string>('');

  // Rejection note modal
  const [rejectingReq, setRejectingReq] = useState<PaymentRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('SMS ya muamala haikulingana na taarifa za benki.');

  // Global settings state
  const [paymentPhone, setPaymentPhone] = useState('0764220155');
  const [accountName, setAccountName] = useState('SEIJO58');
  const [supportPhone, setSupportPhone] = useState('+255 764 220 155');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Helper generator for random serial activation code
  const generateSerialCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    return `SEIJO58-${p1}-${p2}`;
  };

  // Calculate Account Age
  const getAccountAge = (createdAt?: string): string => {
    if (!createdAt) return 'Leo';
    try {
      const createdTime = new Date(createdAt).getTime();
      if (isNaN(createdTime)) return 'Leo';
      const diffMs = Date.now() - createdTime;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) return 'Masaa machache yaliyopita (Leo)';
        return `Masaa ${diffHours} yaliyopita (Leo)`;
      }
      if (diffDays === 1) return 'Siku 1 (Jana)';
      if (diffDays >= 30) {
        const months = Math.floor(diffDays / 30);
        return `Siku ${diffDays} (~Miezi ${months})`;
      }
      return `Siku ${diffDays}`;
    } catch {
      return 'Leo';
    }
  };

  // Get effective wallet balance for a user
  const getUserLiveBalance = (u: UserProfile): number => {
    if (typeof u.walletBalance === 'number' && u.walletBalance >= 0) {
      return u.walletBalance;
    }
    try {
      const key = `wallet_balance_${u.email.toLowerCase().trim()}`;
      const saved = localStorage.getItem(key);
      if (saved) return parseInt(saved, 10) || 0;
      const altKey = `seijo58_wallet_${u.uid}`;
      const altSaved = localStorage.getItem(altKey);
      if (altSaved) return parseInt(altSaved, 10) || 0;
    } catch (e) {
      console.warn("Wallet read note:", e);
    }
    return 0;
  };

  // Password / PIN Submit
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (adminPinInput === '4A2CDC58V') {
      setIsPinUnlocked(true);
      try {
        sessionStorage.setItem('seijo58_admin_authenticated', 'true');
        sessionStorage.setItem('seijo58_admin_unlocked', 'true');
      } catch (err) {
        console.warn("Session storage note:", err);
      }
    } else {
      setPinError('❌ Neno la siri siyo sahihi! Huwezi kuingia sehemu ya Admin.');
    }
  };

  // Logout & Session Lock
  const handleLockAdmin = () => {
    try {
      sessionStorage.removeItem('seijo58_admin_authenticated');
      sessionStorage.removeItem('seijo58_admin_unlocked');
      window.location.hash = '';
    } catch {}
    setIsPinUnlocked(false);
    onBackToApp();
  };

  // 1. Stream Payment Requests from Firestore & Local Storage
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const unsub = onSnapshot(collection(db, 'paymentRequests'), (snapshot) => {
        const list: PaymentRequest[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as PaymentRequest);
        });
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setPaymentRequests(list);
      }, (err) => {
        console.warn("Firestore payment requests note:", err);
        // Fallback to local storage
        try {
          const localReqs = JSON.parse(localStorage.getItem('seijo58_payment_requests') || '[]');
          if (Array.isArray(localReqs)) setPaymentRequests(localReqs);
        } catch (e) {
          console.error(e);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, [isAdmin]);

  // 2. Stream Activation Codes
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const unsub = onSnapshot(collection(db, 'activationCodes'), (snapshot) => {
        const list: ActivationCode[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as ActivationCode);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivationCodes(list);
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, [isAdmin]);

  // 3. Stream Registered Users
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data() } as UserProfile);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUsersList(list);
        try {
          localStorage.setItem('registered_users_list', JSON.stringify(list));
          localStorage.setItem('seijo58_registered_users', JSON.stringify(list));
        } catch {}
      }, (err) => {
        console.warn("Firestore users stream note:", err);
        // Fallback to local user profiles
        try {
          const localUsers = JSON.parse(localStorage.getItem('registered_users_list') || localStorage.getItem('seijo58_registered_users') || '[]');
          if (Array.isArray(localUsers) && localUsers.length > 0) {
            setUsersList(localUsers);
          }
        } catch (e) {
          console.error(e);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, [isAdmin]);

  // 4. Load Tickets for Betting Overview & Profit/Loss Analytics
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const raw = localStorage.getItem('seijo58_efootball_tickets') || localStorage.getItem('my_bets') || localStorage.getItem('user_tickets');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setTicketsList(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Also try streaming tickets from Firestore if collection exists
    try {
      const unsub = onSnapshot(collection(db, 'tickets'), (snapshot) => {
        if (!snapshot.empty) {
          const list: EFootballTicket[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as unknown as EFootballTicket);
          });
          setTicketsList(list);
        }
      }, (err) => {
        console.warn("Tickets collection note:", err);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Tickets snapshot note:", e);
    }
  }, [isAdmin]);

  // 5. Fetch / Stream Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'subscriptionConfig'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.paymentPhone) setPaymentPhone(d.paymentPhone);
          if (d.paymentRecipient) setAccountName(d.paymentRecipient);
          if (d.whatsappSupport) setSupportPhone(d.whatsappSupport);
        }
      } catch (err) {
        console.warn("Settings fetch note:", err);
      }
    };
    fetchSettings();
  }, []);

  // PASSWORD / PIN UNLOCK GATE
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-red-600/50 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl animate-fade-in relative">
          <div className="w-16 h-16 rounded-3xl bg-red-600/20 border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto shadow-2xl shadow-red-950">
            <Lock className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              🔒 INGIZA NENO LA SIRI LA ADMIN
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Weka Master Key ya Admin ili kupata ruhusa ya kutazama na kusimamia watumiaji, salio la pochi, na kuidhinisha maombi ya amana.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <input
                type="password"
                placeholder="Ingiza neno la siri la admin..."
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 outline-none"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-bold bg-red-950/80 p-3 rounded-xl border border-red-800">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>INGIA ADMIN PANEL</span>
            </button>
          </form>

          <button
            onClick={onBackToApp}
            className="text-slate-400 hover:text-white text-xs font-bold underline"
          >
            ← Ghairi &amp; Rudi Kwenye App
          </button>
        </div>
      </div>
    );
  }

  // Handle Approve Deposit & Credit Wallet
  const handleApprovePayment = async (req: PaymentRequest) => {
    try {
      const creditAmount = req.amount || 3000;
      const targetEmail = req.userEmail ? req.userEmail.toLowerCase().trim() : '';

      // 1. Mark payment request as approved in Firestore
      await updateDoc(doc(db, 'paymentRequests', req.id), {
        status: 'approved',
        reviewedBy: currentUser?.email || 'admin',
        reviewedAt: new Date().toISOString(),
        adminNote: `Deposit Approved by Admin. Credited TSh ${creditAmount.toLocaleString()}.`
      });

      // 2. Credit user's wallet in Firestore
      if (req.userId) {
        try {
          const userDocRef = doc(db, 'users', req.userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const currentBal = userDoc.data().walletBalance || 0;
            const updatedBal = currentBal + creditAmount;
            await updateDoc(userDocRef, {
              walletBalance: updatedBal,
              isPremium: true,
              activationStatus: 'ACTIVE',
              updatedAt: new Date().toISOString()
            });
          }
        } catch (uErr) {
          console.warn("Could not update user doc directly:", uErr);
        }
      }

      // 3. Update localStorage & Audit
      if (targetEmail) {
        const emailKey = `wallet_balance_${targetEmail}`;
        const prevBal = parseInt(localStorage.getItem(emailKey) || '0', 10);
        const newBal = prevBal + creditAmount;
        localStorage.setItem(emailKey, String(newBal));
        localStorage.setItem(`seijo58_wallet_${targetEmail}`, String(newBal));
        
        console.log(`SECURITY AUDIT: Wallet updated for ${targetEmail} -> New Balance: TSh ${newBal}`);
        
        // Dispatch wallet update
        window.dispatchEvent(new CustomEvent('seijo58_wallet_updated', {
          detail: { newBalance: newBal, userEmail: targetEmail }
        }));
      }

      alert(`✓ Malipo ya TSh ${creditAmount.toLocaleString()} ya ${req.userName || req.userEmail} yamethibitishwa na kuongezwa kwenye Wallet!`);

    } catch (err) {
      console.error("Error approving payment:", err);
      alert("Error approving payment. Please check Firestore permissions.");
    }
  };

  // Handle Reject Payment
  const handleRejectPayment = async () => {
    if (!rejectingReq) return;
    try {
      await updateDoc(doc(db, 'paymentRequests', rejectingReq.id), {
        status: 'rejected',
        reviewedBy: currentUser?.email || 'admin',
        reviewedAt: new Date().toISOString(),
        adminNote: rejectNote
      });
      setRejectingReq(null);
    } catch (err) {
      console.error("Error rejecting payment:", err);
    }
  };

  // Handle Adjust User Wallet Balance
  const handleSaveWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;

    try {
      const current = getUserLiveBalance(adjustingUser);
      const safeAmt = Math.max(0, Math.floor(adjustAmount));
      const newBal = adjustType === 'add' ? current + safeAmt : Math.max(0, current - safeAmt);
      const email = adjustingUser.email.toLowerCase().trim();

      // 1. Update in Firestore
      try {
        await updateDoc(doc(db, 'users', adjustingUser.uid), {
          walletBalance: newBal,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore wallet update note:", err);
      }

      // 2. Update localStorage strictly
      const emailKey = `wallet_balance_${email}`;
      localStorage.setItem(emailKey, String(newBal));
      localStorage.setItem(`seijo58_wallet_${email}`, String(newBal));
      localStorage.setItem(`seijo58_wallet_${adjustingUser.uid}`, String(newBal));

      // 3. Security Audit Log
      console.log(`SECURITY AUDIT: Wallet updated for ${email} -> New Balance: TSh ${newBal} (${adjustType.toUpperCase()} TSh ${safeAmt}, Sababu: ${adjustReason})`);

      // 4. Update local state
      setUsersList(prev => prev.map(u => u.uid === adjustingUser.uid ? { ...u, walletBalance: newBal } : u));
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('seijo58_wallet_updated', {
        detail: { newBalance: newBal, userEmail: email }
      }));

      setAdjustSuccessMsg(`✓ Salio la ${adjustingUser.name || email} limebadilishwa kuwa TSh ${newBal.toLocaleString()}!`);
      setTimeout(() => {
        setAdjustSuccessMsg('');
        setAdjustingUser(null);
      }, 1500);

    } catch (err) {
      console.error("Adjustment error:", err);
    }
  };

  // Handle Toggle Freeze Account
  const handleToggleFreeze = async (user: UserProfile) => {
    const nextFrozen = !user.isFrozen;
    const nextStatus = nextFrozen ? 'BLOCKED' : 'ACTIVE';
    const actionLabel = nextFrozen ? 'kufungia (freeze)' : 'kufungua (unfreeze)';
    if (!confirm(`Je, una uhakika unataka ${actionLabel} akaunti ya ${user.name || user.email}?`)) {
      return;
    }

    try {
      const cleanEmail = (user.email || '').toLowerCase().trim();
      if (cleanEmail) {
        localStorage.setItem(`account_status_${cleanEmail}`, nextStatus);
        localStorage.setItem(`seijo58_blocked_${cleanEmail}`, nextFrozen ? 'true' : 'false');
      }

      await updateDoc(doc(db, 'users', user.uid), {
        isFrozen: nextFrozen,
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });

      setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, isFrozen: nextFrozen, status: nextStatus } : u));
      
      // Update global block guard immediately
      if (typeof (window as any).enforceAccountBlock === 'function') {
        (window as any).enforceAccountBlock();
      }
      if (typeof (window as any).renderAdminUserList === 'function') {
        (window as any).renderAdminUserList();
      }

      alert(`✓ Akaunti ya ${user.name || user.email} imebadilishwa hali kuwa: ${nextFrozen ? 'BLOCKED (IMEFUNGWA)' : 'ACTIVE (INAFANYA KAZI)'}`);
    } catch (err) {
      console.error("Freeze toggle error:", err);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'subscriptionConfig'), {
        paymentPhone,
        paymentRecipient: accountName,
        whatsappSupport: supportPhone,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin'
      });
      setSettingsSavedMsg(true);
      setTimeout(() => setSettingsSavedMsg(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Metrics & Calculations
  const totalUsers = usersList.length;
  const pendingRequests = paymentRequests.filter(p => p.status === 'pending').length;
  const approvedRequests = paymentRequests.filter(p => p.status === 'approved').length;
  const totalSystemBalance = usersList.reduce((acc, u) => acc + getUserLiveBalance(u), 0);

  // Betting & Profit/Loss Analytics
  const totalStakesPlaced = ticketsList.reduce((acc, t) => acc + (t.stake || 1000), 0);
  const wonTickets = ticketsList.filter(t => t.status === 'WON');
  const totalWonPayouts = wonTickets.reduce((acc, t) => acc + (t.potentialPayout || (t.stake * t.totalOdds)), 0);
  const operatorGrossProfit = totalStakesPlaced - totalWonPayouts;

  const filteredRequests = paymentRequests.filter(req => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        req.userName?.toLowerCase().includes(term) ||
        req.userEmail?.toLowerCase().includes(term) ||
        req.transactionRef?.toLowerCase().includes(term) ||
        req.planName?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredUsers = usersList.filter(u => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phoneNumber?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredTickets = ticketsList.filter(t => {
    if (ticketFilterStatus !== 'all' && t.status !== ticketFilterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.id?.toLowerCase().includes(term) ||
        t.userEmail?.toLowerCase().includes(term) ||
        t.userId?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-100 pb-16">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#0d162d] via-[#101e4a] to-[#2b0c16] border-2 border-red-600/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500 text-red-400 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>SEIJO58 ADMIN DASHBOARD</span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                CENTRAL DB
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              User Management, Live Wallets, SMS Deposit Verification &amp; Betting Profit/Loss Analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLockAdmin}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/80 transition-transform active:scale-95"
            title="Toka na Funga Admin Session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>🔒 Funga Admin</span>
          </button>
          <button
            onClick={onBackToApp}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 transition-colors"
          >
            ← Rudi Front App
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Pending SMS Deposits</span>
          <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <span>{pendingRequests}</span>
            {pendingRequests > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <p className="text-[10px] text-slate-400">Inasubiri Uhakiki wa Admin</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total Registered Users</span>
          <div className="text-2xl font-black text-sky-400">{totalUsers}</div>
          <p className="text-[10px] text-slate-400">Watumiaji Kwenye Firestore DB</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total Wallet Balances</span>
          <div className="text-2xl font-black text-emerald-400">TSh {totalSystemBalance.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400">Salio la Watumiaji Wote</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Bookmaker Profit / Loss</span>
          <div className={`text-2xl font-black flex items-center gap-1.5 ${operatorGrossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{operatorGrossProfit >= 0 ? '+' : ''}TSh {operatorGrossProfit.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-slate-400">Dau Zilizowekwa - Malipo ya Ushindi</p>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory &amp; Wallets ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'deposits'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>SMS Deposits Verification</span>
          {pendingRequests > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingRequests}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'tickets'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Betting &amp; Profit/Loss Analytics ({ticketsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('codes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'codes'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Activation Codes</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Payment Desk Settings</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT DIRECTORY & LIVE WALLET MONITORING */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>User Directory &amp; Real-time Wallet Control</span>
              </h3>
              <p className="text-xs text-slate-400">
                Orodha ya watumiaji wote waliosajiliwa, Namba za Simu, Tarehe ya Usajili, Umri wa Akaunti, na Udhibiti wa Salio.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Tafuta jina, simu, au barua pepe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Jina la Mtumiaji</th>
                  <th className="p-3">Namba ya Simu</th>
                  <th className="p-3">Barua Pepe</th>
                  <th className="p-3">Tarehe ya Usajili</th>
                  <th className="p-3">Umri wa Akaunti</th>
                  <th className="p-3 text-right">Salio la Pochi (Wallet)</th>
                  <th className="p-3 text-center">Hali</th>
                  <th className="p-3 text-right">Vitendo (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      Hakuna mtumiaji aliyepatikana kwa utafutaji huu.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const balance = getUserLiveBalance(u);
                    const age = getAccountAge(u.createdAt);
                    return (
                      <tr key={u.uid} className="hover:bg-slate-950/50 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-amber-400 font-black">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="block">{u.name || 'Mtumiaji'}</span>
                            <span className="text-[10px] text-slate-400">{u.role === 'admin' ? '🛡️ Admin' : 'Mchezaji'}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">
                          {u.phoneNumber || '—'}
                        </td>
                        <td className="p-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-3 text-amber-300 font-medium text-[11px]">
                          {age}
                        </td>
                        <td className="p-3 text-right font-black font-mono text-sm text-white">
                          TSh {balance.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          {u.isFrozen ? (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
                              FROZEN
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setAdjustingUser(u);
                              setAdjustAmount(5000);
                              setAdjustType('add');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition-transform active:scale-95"
                            title="Rekebisha Salio la Mtumiaji"
                          >
                            Rekebisha Salio
                          </button>

                          <button
                            onClick={() => handleToggleFreeze(u)}
                            className={`font-bold px-2.5 py-1 rounded-lg text-[10px] transition-transform active:scale-95 ${
                              u.isFrozen || u.status === 'BLOCKED'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' 
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                            }`}
                          >
                            {u.isFrozen || u.status === 'BLOCKED' ? '🟢 Fungua' : '🔴 Fungia'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SMS DEPOSIT VERIFICATION FLOW */}
      {activeTab === 'deposits' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Mandatory Deposit SMS Verification Flow</span>
              </h3>
              <p className="text-xs text-slate-400">
                Wateja wanapoomba kuweka pesa, hakuna salio linaloingizwa moja kwa moja bila Admin kuthibitisha SMS ya muamala.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filterStatus === st 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Mteja / Simu</th>
                  <th className="p-3">Mtandao</th>
                  <th className="p-3">SMS / Ref Code</th>
                  <th className="p-3">Kiasi Kilichoombwa</th>
                  <th className="p-3">Tarehe &amp; Muda</th>
                  <th className="p-3">Hali (Status)</th>
                  <th className="p-3 text-right">Uhakiki wa Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      Hakuna maombi ya kuweka pesa kwa kichujio hiki.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-white block">{req.userName || 'Mteja'}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{req.userEmail}</span>
                      </td>
                      <td className="p-3 text-slate-300 font-bold">
                        {req.planName || 'Mobile Money'}
                      </td>
                      <td className="p-3 font-mono font-black text-amber-400 bg-slate-950/50 px-2 py-1 rounded w-fit">
                        {req.transactionRef}
                      </td>
                      <td className="p-3 font-black font-mono text-white text-sm">
                        TSh {(req.amount || 3000).toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {req.submittedAt ? new Date(req.submittedAt).toLocaleString() : 'Leo'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : req.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprovePayment(req)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-md transition-transform active:scale-95"
                            >
                              ✓ Thibitisha &amp; Weka Salio
                            </button>
                            <button
                              onClick={() => setRejectingReq(req)}
                              className="bg-red-950/80 hover:bg-red-900 text-red-300 font-bold px-3 py-1.5 rounded-xl text-xs border border-red-800 transition-transform active:scale-95"
                            >
                              ✗ Kataa
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            {req.status === 'approved' ? '✓ Salio Limeshaingizwa' : '✗ Limekataliwa'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BETTING & TICKET HISTORY OVERVIEW */}
      {activeTab === 'tickets' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-400" />
                <span>Betting &amp; Ticket History Overview &amp; P&amp;L</span>
              </h3>
              <p className="text-xs text-slate-400">
                Uchambuzi wa kina wa dau zote zilizowekwa, Malipo ya Ushindi, na Faida ya Uendeshaji.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'WON', 'LOST', 'PENDING'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setTicketFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    ticketFilterStatus === st 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Operator Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Stakes In (Mapato ya Dau)</span>
              <div className="text-2xl font-black text-white mt-1">TSh {totalStakesPlaced.toLocaleString()}</div>
              <p className="text-[10px] text-slate-400">Jumla ya Dau Zilizowekwa</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Payouts Won (Malipo Yaliyolipwa)</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">TSh {totalWonPayouts.toLocaleString()}</div>
              <p className="text-[10px] text-slate-400">Malipo Rasmi ya Ushindi</p>
            </div>

            <div className={`p-4 rounded-2xl border ${operatorGrossProfit >= 0 ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-red-950/40 border-red-500/40'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400">Net Operator Profit (Faida ya App)</span>
              <div className={`text-2xl font-black mt-1 ${operatorGrossProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {operatorGrossProfit >= 0 ? '+' : ''}TSh {operatorGrossProfit.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400">Mapato - Malipo ya Ushindi</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Tiketi ID</th>
                  <th className="p-3">Mchezaji / Mtumiaji</th>
                  <th className="p-3">Machaguo / Mechi</th>
                  <th className="p-3">Kiasi (Stake)</th>
                  <th className="p-3">Jumla Odds</th>
                  <th className="p-3">Malipo Yatarajiwayo</th>
                  <th className="p-3 text-center">Hali</th>
                  <th className="p-3">Muda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      Hakuna tiketi zilizopatikana.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">
                        #{t.id}
                      </td>
                      <td className="p-3 text-slate-300 font-mono text-[11px]">
                        {t.userEmail || t.userId || 'Guest'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {Array.isArray(t.selections) ? t.selections.map(s => s.selection).join(', ') : 'Chaguo'}
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        TSh {(t.stake || 1000).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-amber-400 font-bold">
                        {(t.totalOdds || 1.0).toFixed(2)}
                      </td>
                      <td className="p-3 font-mono font-black text-emerald-400 text-sm">
                        TSh {(t.potentialPayout || Math.floor((t.stake || 1000) * (t.totalOdds || 1))).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          t.status === 'WON'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : t.status === 'LOST'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {t.status === 'WON' ? 'UMESHINDA 🟢' : t.status === 'LOST' ? 'UMEKOSA 🔴' : 'PENDING ⏳'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {t.createdAt || 'Leo'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Activation Codes */}
      {activeTab === 'codes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>VIP Activation Codes ({activationCodes.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activationCodes.map(c => (
              <div key={c.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-mono font-black text-sm text-amber-400">{c.code}</span>
                  <span className="text-[11px] text-slate-400 block">{c.planName} • {c.durationDays} Days</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.isUsed ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {c.isUsed ? 'USED' : 'AVAILABLE'}
                  </span>
                </div>

                <button
                  onClick={() => copyToClipboard(c.code, c.id)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
                >
                  {copiedCodeId === c.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Payment Desk Settings */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 max-w-2xl">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Mobile Money &amp; Support Desk Settings</span>
            </h3>
            <p className="text-xs text-slate-400">
              Changes made here are stored in Firestore and will reflect immediately across user payment views.
            </p>
          </div>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Settings successfully saved in Firestore database!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Tanzania Mobile Money Number</label>
              <input
                type="text"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Account Recipient Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">WhatsApp Support Contact</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {savingSettings ? 'Saving to Database...' : 'Save Settings to Firestore'}
            </button>
          </form>
        </div>
      )}

      {/* ADJUST WALLET MODAL */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Rekebisha Salio la Mtumiaji</span>
              </h4>
              <button
                onClick={() => setAdjustingUser(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Funga
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-300 font-bold">Mchezaji: <span className="text-white">{adjustingUser.name || 'Mtumiaji'}</span></p>
              <p className="text-slate-400 font-mono text-[11px]">{adjustingUser.email}</p>
              <p className="text-amber-400 font-bold">Salio la Sasa: TSh {getUserLiveBalance(adjustingUser).toLocaleString()}</p>
            </div>

            {adjustSuccessMsg && (
              <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold">
                {adjustSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveWalletAdjustment} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Ongeza (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    adjustType === 'deduct'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Punguza (-)</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Kiasi cha TSh</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Sababu ya Marekebisho (Audit Reason)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Uhakiki wa Malipo ya SMS / Bonasi ya Rufaa..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold py-3 rounded-xl text-xs uppercase shadow-md transition-transform active:scale-95"
              >
                HIFADHI MAREKEBISHO YA POCHI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-600/50 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-sm text-white">Kataa Ombi la Malipo</h4>
            <p className="text-xs text-slate-400">
              Ref: <strong className="text-amber-300">{rejectingReq.transactionRef}</strong> ({rejectingReq.userName})
            </p>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Sababu ya kukataa:</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingReq(null)}
                className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs"
              >
                Ghairi
              </button>
              <button
                onClick={handleRejectPayment}
                className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Thibitisha Kukataa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
