import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  Copy, 
  Check, 
  MessageCircle, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Calendar, 
  AlertTriangle,
  Sparkles,
  Info,
  ExternalLink,
  Trash2,
  Smartphone,
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react';
import { UserPaymentRequest } from './PostRegistrationPaymentModal';
import { persistUserWallet } from '../../utils/walletPersistence';
import { 
  getTodayTokens, 
  getCurrentDateString, 
  getUsedActivationCodes, 
  adminResetLockout, 
  adminClearUsedCodes,
  getLockoutStatus,
  formatCountdown,
  getTokensForDate
} from '../../utils/dailyTokenManager';

interface AdminDailyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const MASTER_ADMIN_PIN = "4A2CDC58V";

export const AdminDailyTokensModal: React.FC<AdminDailyTokensModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [lockoutStatus, setLockoutStatus] = useState(getLockoutStatus());
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateString());
  const [tokens, setTokens] = useState<string[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<UserPaymentRequest[]>([]);

  const refreshData = () => {
    setUsedCodes(getUsedActivationCodes());
    setLockoutStatus(getLockoutStatus());
    setTokens(getTokensForDate(selectedDate));
    try {
      const stored = JSON.parse(localStorage.getItem('seijo58_payment_requests') || '[]');
      setPaymentRequests(stored);
    } catch (e) {
      setPaymentRequests([]);
    }
  };

  const handleIssueTokenToRequest = (request: UserPaymentRequest) => {
    const availableToken = tokens.find(t => !usedCodes.includes(t)) || tokens[0] || 'SEIJO58V';
    
    const updated = paymentRequests.map(r => {
      if (r.id === request.id) {
        return { ...r, status: 'approved' as const, approvedToken: availableToken };
      }
      return r;
    });
    setPaymentRequests(updated);
    localStorage.setItem('seijo58_payment_requests', JSON.stringify(updated));

    const cleanPhone = request.phoneNumber.replace(/[^0-9]/g, '');

    // Update local user starting balance strictly to deposited amount
    try {
      const approvedAmount = request.amount || 1000;
      persistUserWallet(request.userEmail || cleanPhone, approvedAmount);

      const localUsers: any[] = JSON.parse(localStorage.getItem('seijo58_local_users') || '[]');
      const targetUser = localUsers.find(u => 
        (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone) ||
        (u.email && request.userEmail && u.email.toLowerCase() === request.userEmail.toLowerCase())
      );
      if (targetUser) {
        targetUser.walletBalance = approvedAmount;
        targetUser.activationStatus = 'ACTIVE';
        targetUser.isPremium = true;
        localStorage.setItem('seijo58_local_users', JSON.stringify(localUsers));
      }

      // If active session matches, sync immediately
      const activeSessionStr = localStorage.getItem('seijo58_active_session');
      if (activeSessionStr) {
        const sess = JSON.parse(activeSessionStr);
        if (
          (sess.email && request.userEmail && sess.email.toLowerCase() === request.userEmail.toLowerCase()) ||
          (sess.phoneNumber && sess.phoneNumber.replace(/[^0-9]/g, '') === cleanPhone)
        ) {
          sess.walletBalance = approvedAmount;
          sess.activationStatus = 'ACTIVE';
          localStorage.setItem('seijo58_active_session', JSON.stringify(sess));
          localStorage.setItem('seijo58_wallet_balance', approvedAmount.toString());
          localStorage.setItem('seijo58_casino_wallet', approvedAmount.toString());
          localStorage.setItem('seijo58_activation_status', 'ACTIVE');
        }
      }
    } catch (e) {
      console.warn("Could not sync approved user balance:", e);
    }

    // Copy to clipboard
    navigator.clipboard.writeText(availableToken);

    // Pre-fill WhatsApp link to customer
    const intlPhone = cleanPhone.startsWith('0') 
      ? '255' + cleanPhone.slice(1) 
      : cleanPhone.startsWith('255') 
        ? cleanPhone 
        : '255' + cleanPhone;

    const msg = encodeURIComponent(
      `Habari ${request.userName || 'Mteja'},\n` +
      `Malipo yako ya TSh ${request.amount.toLocaleString()} yamehakikiwa na Admin wa SEIJO58 BET.\n\n` +
      `🔑 Activation Code yako ya Leo ni: *${availableToken}*\n\n` +
      `Ingiza code hii sasa kwenye app kuwasha akaunti yako papo hapo!`
    );

    window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
    showToast(`✓ Kodi "${availableToken}" imetolewa kwa mteja ${request.phoneNumber}!`);
  };

  const handleClearPaymentRequests = () => {
    localStorage.removeItem('seijo58_payment_requests');
    setPaymentRequests([]);
    showToast("✓ Historia ya maombi ya malipo imefutwa.");
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    } else {
      // Reset PIN input when closed
      setPinInput('');
      setPinError('');
    }
  }, [isOpen, selectedDate]);

  // Live countdown timer for lockout status
  useEffect(() => {
    if (!isOpen || !lockoutStatus.isLocked) return;
    const interval = setInterval(() => {
      const status = getLockoutStatus();
      setLockoutStatus(status);
      if (!status.isLocked) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, lockoutStatus.isLocked]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().toLowerCase() === MASTER_ADMIN_PIN.toLowerCase()) {
      setIsUnlocked(true);
      setPinError('');
      showToast('✓ Master PIN imethibitishwa! Karibu kwenye Admin Portal.');
    } else {
      setPinError('Master PIN siyo sahihi! Tafadhali weka Master PIN sahihi.');
      showToast('❌ Master PIN siyo sahihi! Jaribu tena.');
    }
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    setPinInput('');
    setPinError('');
    showToast('Admin Portal imefungwa kwa usalama.');
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    showToast(`✓ Kodi "${token}" imenakiliwa!`);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCopyAll = () => {
    const text = `🔑 SEIJO58 BET - TODAY ACTIVATION PINs (${selectedDate}):\n${tokens.map((t, i) => `${i + 1}. ${t} - [${usedCodes.includes(t) ? '🔴 USED' : '🟢 AVAILABLE'}]`).join('\n')}`;
    navigator.clipboard.writeText(text);
    showToast('✓ Kodi zote 5 zimenakiliwa!');
  };

  const handleResetLockout = () => {
    adminResetLockout();
    refreshData();
    showToast('✓ Kifungo cha Anti-Brute Force (Lockout) kimeondolewa!');
  };

  const handleClearUsedCodes = () => {
    if (window.confirm('Je, una uhakika unataka kufuta kumbukumbu ya kodi zilizotumika?')) {
      adminClearUsedCodes();
      refreshData();
      showToast('✓ Historia ya kodi zilizotumika imefutwa.');
    }
  };

  const getWhatsAppShareLink = (token: string) => {
    const msg = `Habari mteja wa SEIJO58 BET,\n\nMalipo yako ya TSh 1,000 yamehakikiwa.\n🔑 Hii hapa Activation Code yako ya leo (${selectedDate}):\n\n👉 *${token}*\n\n(Zingatia: Kodi hii inatumika mara moja tu na inafanya kazi leo tu). Ingiza kwenye app kuwasha salio lako.`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const isToday = selectedDate === getCurrentDateString();

  // If Master PIN is not yet unlocked, render Master PIN challenge
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-md bg-[#0e1629] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl shadow-amber-950/70 text-slate-100 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-950/60 flex items-center justify-center">
                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-lg text-white">SECRET ADMIN PORTAL</h3>
                <p className="text-xs text-slate-400">Jopo la Siri la Mmiliki wa SEIJO58 BET</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Uthibitisho wa Usalama wa Mmiliki</span>
              </div>
              <p className="leading-relaxed">
                Ili kuona <strong>Kodi 5 za Leo za Uanzishaji (Today&apos;s Active PINs)</strong>, tafadhali ingiza Master PIN iliyowekwa:
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Ingiza Master PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="Weka Master PIN"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 font-mono text-center text-lg font-bold text-amber-400 tracking-widest outline-none transition-all"
                />
              </div>
              {pinError && (
                <p className="text-xs font-bold text-red-400 flex items-center gap-1 mt-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition-colors"
              >
                Ghairi
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-amber-950/50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Unlock className="w-4 h-4" />
                <span>Fungua Jopo</span>
              </button>
            </div>
          </form>

          {/* Quick Helper Note for Owner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-[11px] text-amber-300/90 text-center">
            🔒 Mmiliki pekee mwenye Master PIN ya siri anaruhusiwa kupata kodi hizi.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e1629] border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/70 text-slate-100 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">DAILY 5-TOKEN POOL</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">Kodi 5 za siri za kila siku na usalama wa Single-Use</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector & Info Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Tarehe ya Token:</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-slate-400 font-bold">Hali ya Siku:</span>
            <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
              isToday 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}>
              {isToday ? '🔥 LEO (ACTIVE)' : '⛔ EXPIRED (ZILIZOPITA)'}
            </span>
          </div>
        </div>

        {/* Anti-Brute Force Lockout Status Bar */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
          lockoutStatus.isLocked 
            ? 'bg-red-950/80 border-red-500/50 text-red-200' 
            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {lockoutStatus.isLocked ? (
              <Lock className="w-4 h-4 text-red-400 animate-pulse" />
            ) : (
              <Unlock className="w-4 h-4 text-emerald-400" />
            )}
            <div>
              <div className="font-bold">
                {lockoutStatus.isLocked 
                  ? `Anti-Brute Force: IMEFUNGWA (${formatCountdown(lockoutStatus.remainingMs)})` 
                  : `Anti-Brute Force: SALAMA (Majaribio Yasiyo Sahihi: ${lockoutStatus.failedAttempts}/3)`}
              </div>
              <div className="text-[10px] opacity-80">
                Majaribio 3 yasiyo sahihi yanafungia mtumiaji kwa saa 24.
              </div>
            </div>
          </div>

          {lockoutStatus.isLocked && (
            <button
              onClick={handleResetLockout}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-[11px] shrink-0 active:scale-95 transition-all flex items-center gap-1"
            >
              <Unlock className="w-3 h-3" />
              <span>Ondoa Lock</span>
            </button>
          )}
        </div>

        {/* 5 Secret Tokens Pool Card */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Kodi 5 za Siri za Leo ({selectedDate}):
            </span>
            <button
              onClick={handleCopyAll}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px]"
            >
              <Copy className="w-3 h-3" />
              <span>Nakili Zote</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {tokens.map((tok, idx) => {
              const isUsed = usedCodes.includes(tok);
              const isCopied = copiedToken === tok;

              return (
                <div
                  key={tok}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isUsed 
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-75' 
                      : 'bg-slate-900 border-slate-700/80 hover:border-amber-500/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-black">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-mono text-sm font-black text-amber-400 tracking-wider">
                        {tok}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isUsed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/40">
                            🔴 USED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            🟢 AVAILABLE
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {isUsed ? 'Kodi imetumika' : 'Single-Use Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp Share to Customer */}
                    <a
                      href={getWhatsAppShareLink(tok)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-all text-xs"
                      title="Tuma kwa mteja kupitia WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    {/* Copy Token */}
                    <button
                      onClick={() => handleCopy(tok)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all active:scale-95 ${
                        isCopied 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Imenakiliwa' : 'Nakili'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INCOMING USER PAYMENT REQUESTS (MAOMBI YA MALIPO YA WATUMIAJI) */}
        <div className="space-y-2.5 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Maombi ya Malipo ya Wateja ({paymentRequests.length}):
            </span>
            {paymentRequests.length > 0 && (
              <button
                onClick={handleClearPaymentRequests}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3 h-3" />
                <span>Futa Yote</span>
              </button>
            )}
          </div>

          {paymentRequests.length === 0 ? (
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center text-xs text-slate-400">
              Hakuna maombi mapya ya malipo kwa sasa. Mteja akituma ombi baada ya kujisajili litaonekana hapa papo hapo.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {paymentRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    req.status === 'approved'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-900 border-amber-500/40 shadow-md shadow-amber-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {req.phoneNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          TSh {req.amount.toLocaleString()}
                        </span>
                        {req.status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            IMETOLEWA: {req.approvedToken}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            INASUBIRI
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Jina: {req.userName || 'Mteja'} • {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleIssueTokenToRequest(req)}
                      className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl text-[11px] flex items-center gap-1 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                      title="Toa Kodi ya Leo na Tuma WhatsApp"
                    >
                      <Send className="w-3 h-3" />
                      <span>{req.status === 'approved' ? 'Tuma Tena' : 'Toa Kodi'}</span>
                    </button>
                  </div>

                  {/* Transaction SMS */}
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono break-words">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase font-sans">SMS ya Muamala:</span>
                    {req.smsText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security & System Rules Info */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Miongozo ya Mfumo wa Token:</span>
          </div>
          <p>• <strong>Daily Pool:</strong> Kodi za jana zinaacha kufanya kazi saa 6 usiku (00:00) kiotomatiki.</p>
          <p>• <strong>Single-Use:</strong> Kodi ikitumiwa mara moja haitakubaliwa tena na itatoa ujumbe wa kulipia TSh 1,000.</p>
          <p>• <strong>Anti-Brute Force:</strong> Majaribio 3 ya kubahatisha yanafungia kifaa masaa 24.</p>
        </div>

        {/* Admin Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs gap-2">
          <button
            onClick={handleClearUsedCodes}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Futa Historia ya Kodi Zilizotumika</span>
            <span className="sm:hidden">Futa Historia</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLockAgain}
              className="px-3 py-2 bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-amber-300 font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Funga Kifuli</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl active:scale-95 transition-all"
            >
              Funga
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
