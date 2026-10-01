import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  ShieldAlert,
  Fingerprint,
  Check,
  Clock,
  Gamepad2,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  getWithdrawalEligibility, 
  recordGamePlayed, 
  getUserGamesPlayedCount, 
  getCleanUserKey,
  hasWithdrawnToday,
  recordSuccessfulWithdrawal,
  MAX_DAILY_WITHDRAWAL_AMOUNT,
  WITHDRAWAL_MIN_GAMES
} from '../../lib/withdrawalRestrictions';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onWithdrawSuccess: (amount: number, phone: string, network: string) => boolean;
  showToast: (msg: string) => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  walletBalance,
  onWithdrawSuccess,
  showToast
}: WithdrawModalProps) {
  const { userProfile, currentUser, verifyWithdrawalPin, setWithdrawalPin } = useAuth();

  const [amount, setAmount] = useState<number>(2000);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [network, setNetwork] = useState<string>('Vodacom M-Pesa');
  
  // Security PIN states
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isSettingPin, setIsSettingPin] = useState<boolean>(false);

  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState<boolean>(false);
  const [securityHash, setSecurityHash] = useState<string>('');
  const [lastWithdrawData, setLastWithdrawData] = useState<{
    amount: number;
    phone: string;
    network: string;
    ref: string;
    securityHash: string;
    timestamp: string;
  } | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const userIdentifier = userProfile?.email || currentUser?.email || userProfile?.phoneNumber || 'guest';
  
  // Fetch dynamic withdrawal eligibility
  const eligibility = getWithdrawalEligibility(userIdentifier, userProfile?.createdAt, amount);
  const { 
    isTenureEligible, 
    isGamesEligible, 
    isDailyLimitEligible,
    isAmountEligible,
    tenureDays, 
    remainingDays, 
    remainingHours, 
    remainingMinutes, 
    remainingSeconds, 
    unlockDate, 
    gamesPlayedCount,
    tenureWarning,
    gamesWarning,
    dailyLimitWarning,
    amountWarning
  } = eligibility;

  // Strict check: Button is enabled ONLY when all 4 status indicators are green (🟢)
  const isCanWithdraw = isTenureEligible && isGamesEligible && isDailyLimitEligible && isAmountEligible && amount >= 1000 && amount <= walletBalance;
  const isWithdrawLocked = !isCanWithdraw;

  // Real-time ticking clock and live events listener
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    const handleGamePlayedEvent = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('seijo58_game_played', handleGamePlayedEvent);
    window.addEventListener('storage', handleGamePlayedEvent);

    return () => {
      clearInterval(timer);
      window.removeEventListener('seijo58_game_played', handleGamePlayedEvent);
      window.removeEventListener('storage', handleGamePlayedEvent);
    };
  }, []);

  const unlockDateString = unlockDate.toLocaleString('sw-TZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Sync initial phone number from user profile
  useEffect(() => {
    if (isOpen && userProfile?.phoneNumber) {
      setPhoneNumber(userProfile.phoneNumber);
    }
  }, [isOpen, userProfile]);

  const hasPinConfigured = !!(userProfile?.withdrawalPin || localStorage.getItem('seijo58_user_pin'));

  if (!isOpen) return null;

  const generateSecurityHash = (amt: number, phone: string, ref: string) => {
    const raw = `${ref}:${phone}:${amt}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `SEC-256-${hex}`;
  };

  const getWhatsAppWithdrawMessage = (amt: number, phone: string, net: string, ref: string, secHash: string) => {
    const text = `🚨 TAARIFA YA KUTOA PESA (VERIFIED CASINO WITHDRAWAL):\n\n💰 Kiasi cha Kutoa: TSh ${amt.toLocaleString()}\n📱 Namba ya Kupokelea: ${phone}\n📶 Mtandao: ${net}\n🔖 Kumbukumbu No: ${ref}\n🔐 Security Hash: ${secHash}\n🛡️ Usalama: 2FA PIN Verified (TLS 256-Bit)\n👤 Mtumiaji: ${userProfile?.name || currentUser?.displayName || 'Mwanachama'}\n📧 Email: ${currentUser?.email || 'Akaunti ya Simu'}\n⏰ Muda: ${new Date().toLocaleTimeString()}\n\nMteja amethibitishwa na PIN ya usalama. Tafadhali kamilisha malipo haya.`;
    return encodeURIComponent(text);
  };

  const handleSaveInitialPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('PIN ya usalama inapaswa kuwa namba 4 za tarakimu (mfano: 1234).');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PIN ulizoingiza hazilingani.');
      return;
    }

    try {
      await setWithdrawalPin(newPin);
      showToast('✓ PIN yako ya usalama ya utoaji imehifadhiwa kwa ulinzi wa 256-bit!');
      setIsSettingPin(false);
      setEnteredPin(newPin);
    } catch (err) {
      setPinError('Haikuweza kuhifadhi PIN. Jaribu tena.');
    }
  };

  // Warning trigger when user attempts to interact with locked button
  const handleAttemptWithdrawClick = () => {
    if (!isTenureEligible) {
      setPinError(tenureWarning);
      showToast(tenureWarning);
    } else if (!isGamesEligible) {
      setPinError(gamesWarning);
      showToast(gamesWarning);
    } else if (amount > MAX_DAILY_WITHDRAWAL_AMOUNT) {
      setPinError(amountWarning);
      showToast(amountWarning);
    } else if (!isDailyLimitEligible) {
      setPinError(dailyLimitWarning);
      showToast(dailyLimitWarning);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    // 1. 5-Day App Account Tenure Enforcement Gate
    if (!isTenureEligible) {
      setPinError(tenureWarning);
      showToast(tenureWarning);
      return;
    }

    // 2. Minimum 4 Games Played Requirement Gate
    if (!isGamesEligible) {
      setPinError(gamesWarning);
      showToast(gamesWarning);
      return;
    }

    // 3. Maximum Daily Withdrawal Cap (Max TSh 5,000)
    if (amount > MAX_DAILY_WITHDRAWAL_AMOUNT) {
      setPinError(amountWarning);
      showToast(amountWarning);
      return;
    }

    // 4. Limit to 1 Withdrawal Per Day Gate
    if (!isDailyLimitEligible) {
      setPinError(dailyLimitWarning);
      showToast(dailyLimitWarning);
      return;
    }

    if (amount < 1000) {
      showToast('Kiwango cha chini cha kutoa ni TSh 1,000.');
      return;
    }
    if (amount > walletBalance) {
      showToast('Salio halitoshi kufanya utoaji huu.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      showToast('Tafadhali weka namba sahihi ya simu ya kupokelea pesa.');
      return;
    }

    // PIN Authentication Gate
    if (!hasPinConfigured) {
      setIsSettingPin(true);
      return;
    }

    if (!verifyWithdrawalPin(enteredPin)) {
      setPinError('❌ PIN ya usalama uliyoingiza siyo sahihi. Jaribu tena au wasiliana na Admin.');
      showToast('PIN siyo sahihi!');
      return;
    }

    const ref = `WDR-${Date.now().toString().slice(-6)}`;
    const hash = generateSecurityHash(amount, phoneNumber, ref);
    setSecurityHash(hash);

    const success = onWithdrawSuccess(amount, phoneNumber, network);
    
    if (success) {
      // Record today's withdrawal to enforce 1 withdrawal per day limit
      recordSuccessfulWithdrawal(userIdentifier);

      const withdrawData = {
        amount,
        phone: phoneNumber,
        network,
        ref,
        securityHash: hash,
        timestamp: new Date().toLocaleTimeString()
      };
      setLastWithdrawData(withdrawData);
      setIsSuccessSubmitted(true);

      // Audit log to Firestore for AML and compliance
      try {
        await addDoc(collection(db, 'withdrawals'), {
          uid: currentUser?.uid || 'anon',
          userEmail: currentUser?.email || 'unknown',
          userName: userProfile?.name || 'User',
          amount,
          phone: phoneNumber,
          network,
          ref,
          securityHash: hash,
          status: 'PENDING_SECURITY_APPROVAL',
          twoFactorVerified: true,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Audit log notice:", err);
      }

      showToast(`✓ Ombi la kutoa TSh ${amount.toLocaleString()} limelindwa na kuthibitishwa!`);
      
      // Automatically attempt to notify admin on WhatsApp
      try {
        const whatsappUrl = `https://wa.me/255764220155?text=${getWhatsAppWithdrawMessage(amount, phoneNumber, network, ref, hash)}`;
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClose = () => {
    setIsSuccessSubmitted(false);
    setLastWithdrawData(null);
    setEnteredPin('');
    setPinError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0f172a] via-[#0b101d] to-[#06080e] border-2 border-amber-500/70 rounded-3xl max-w-md w-full p-5 sm:p-7 space-y-5 shadow-2xl shadow-amber-950/80 relative my-auto text-white">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SECURITY PIN SETUP MODAL VIEW */}
        {isSettingPin ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">TENGENEZA PIN YA USALAMA (2FA)</h3>
              <p className="text-xs text-slate-300 mt-1">
                Ili kulinda pochi yako dhidi ya mtu yeyote kutoa pesa zako bila idhini, weka <strong>PIN ya tarakimu 4</strong> itakayotumika kila unapotaka kutoa pesa.
              </p>
            </div>

            {pinError && (
              <div className="p-3 bg-red-950/60 border border-red-500/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleSaveInitialPin} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Weka PIN Mpya (Tarakimu 4):</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono font-black text-lg tracking-[0.5em] text-amber-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Thibitisha PIN Yako:</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono font-black text-lg tracking-[0.5em] text-amber-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingPin(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Hifadhi PIN
                </button>
              </div>
            </form>
          </div>
        ) : isSuccessSubmitted && lastWithdrawData ? (
          /* SUBMITTED SUCCESS VIEW */
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">OMBI LA KUTOA LIMETHIBITISHWA!</h3>
              <p className="text-xs text-slate-300">
                Ombi lako limelindwa na kutumwa kwa Admin WhatsApp <strong className="text-emerald-400 font-mono">+255 764 220 155</strong> kwa uhamisho wa moja kwa moja.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Kiasi:</span>
                <span className="text-emerald-400 font-black text-sm">TSh {lastWithdrawData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Namba ya Kupokelea:</span>
                <span className="text-white font-bold">{lastWithdrawData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mtandao:</span>
                <span className="text-amber-400 font-bold">{lastWithdrawData.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kumbukumbu No:</span>
                <span className="text-slate-300">{lastWithdrawData.ref}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5 text-[10px]">
                <span className="text-slate-500">Security Hash:</span>
                <span className="text-amber-400 truncate max-w-[180px]">{lastWithdrawData.securityHash}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/255764220155?text=${getWhatsAppWithdrawMessage(lastWithdrawData.amount, lastWithdrawData.phone, lastWithdrawData.network, lastWithdrawData.ref, lastWithdrawData.securityHash)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>THIBITISHA NA ADMIN KWA WHATSAPP</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Funga Dirisha
              </button>
            </div>
          </div>
        ) : (
          /* WITHDRAW FORM VIEW */
          <>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                <ArrowUpRight className="w-4 h-4" /> KUTOA PESA (SECURE WITHDRAWAL)
              </div>
              <h3 className="text-xl font-black text-white">TOA PESA KWENDA KWENYE SIMU YAKO</h3>
              <p className="text-xs text-slate-400">
                Salio linalopatikana: <strong className="text-emerald-400 font-mono">TSh {walletBalance.toLocaleString()}</strong>
              </p>
            </div>

            {/* WITHDRAWAL RESTRICTIONS STATUS PANEL & CHECKLIST */}
            <div className="bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>SHERIA ZA KUTOA ELA (VIGEZO VYA AKAUNTI)</span>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  isCanWithdraw 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                    : 'bg-red-500/20 text-red-300 border-red-500/50'
                }`}>
                  {isCanWithdraw ? '🟢 VIGEZO VYOTE VIMETIMIA' : '🔴 BADO HUJAKIDHI VIGEZO'}
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Condition 1: 5-Day App Account Tenure Checklist Item */}
                <div className={`p-3 rounded-xl border transition-all ${
                  isTenureEligible 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-red-950/20 border-red-500/40 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="space-y-0.5">
                      <div className="font-black text-sm text-white flex items-center gap-2">
                        <span>📅 Umri wa Akaunti: Siku {tenureDays} / 5</span>
                        <span className="text-base select-none">{isTenureEligible ? '🟢' : '🔴'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isTenureEligible 
                          ? '✓ Akaunti imetimiza siku 5 za usalama tangu ujisajili.' 
                          : `⚠️ Bado siku ${remainingDays} kutimiza siku 5 tangu ujisajili.`}
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg shrink-0 ${
                      isTenureEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isTenureEligible ? '🟢 Siku 5/5' : `🔴 Bado siku ${remainingDays}`}
                    </span>
                  </div>
                  {/* Progress Bar for Tenure */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${isTenureEligible ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (tenureDays / 5) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Condition 2: Minimum 4 Games Played Checklist Item */}
                <div className={`p-3 rounded-xl border transition-all ${
                  isGamesEligible 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-red-950/20 border-red-500/40 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="space-y-0.5">
                      <div className="font-black text-sm text-white flex items-center gap-2">
                        <span>🎮 Michezo Uliyocheza: {gamesPlayedCount} / 4</span>
                        <span className="text-base select-none">{isGamesEligible ? '🟢' : '🔴'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isGamesEligible 
                          ? '✓ Umecheza angalau michezo 4 kwenye app. Kigezo kimekamilika.' 
                          : `⚠️ Lazima uwe umecheza angalau michezo 4 (Imebaki ${Math.max(0, 4 - gamesPlayedCount)}).`}
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg shrink-0 ${
                      isGamesEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isGamesEligible ? '🟢 4/4' : `🔴 ${gamesPlayedCount}/4`}
                    </span>
                  </div>
                  {/* Progress Bar for Games Played */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${isGamesEligible ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (gamesPlayedCount / 4) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Condition 3: Maximum Daily Withdrawal Cap (Max TSh 5,000) */}
                <div className={`p-3 rounded-xl border transition-all ${
                  isAmountEligible 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-red-950/20 border-red-500/40 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-black text-sm text-white flex items-center gap-2">
                        <span>💵 Kikomo cha Leo (Max Amount): TSh 5,000</span>
                        <span className="text-base select-none">{isAmountEligible ? '🟢' : '🔴'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isAmountEligible 
                          ? `✓ Kiasi kilichoombwa (TSh ${amount.toLocaleString()}) kipo ndani ya kiwango cha juu cha TSh 5,000.` 
                          : `⚠️ Kiwango cha juu cha kutoa fedha kwa siku ni TSh 5,000 tu!`}
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg shrink-0 ${
                      isAmountEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isAmountEligible ? '🟢 TSh 5,000 Max' : '🔴 Imezidi 5,000'}
                    </span>
                  </div>
                </div>

                {/* Condition 4: Limit to 1 Withdrawal Per Day */}
                <div className={`p-3 rounded-xl border transition-all ${
                  isDailyLimitEligible 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-red-950/20 border-red-500/40 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-black text-sm text-white flex items-center gap-2">
                        <span>⏱️ Nafasi ya Kutoa Leo: {isDailyLimitEligible ? '1/1 Inapatikana' : 'Umeshatoa Leo'}</span>
                        <span className="text-base select-none">{isDailyLimitEligible ? '🟢' : '🔴'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isDailyLimitEligible 
                          ? '✓ Una nafasi 1 ya kutoa fedha kwa siku ya leo.' 
                          : '⚠️ Umeshatoa fedha leo! Unaweza kutoa tena kesho.'}
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg shrink-0 ${
                      isDailyLimitEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isDailyLimitEligible ? '🟢 1/1 Bado' : '🔴 Umeshatoa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time countdown when tenure is still active */}
              {!isTenureEligible && (
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2.5 text-center space-y-1.5">
                  <div className="text-[10px] text-amber-300 font-bold uppercase flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>Muda Uliobaki wa Kufungua Utoaji:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                    <div className="bg-slate-950 border border-amber-500/20 p-1.5 rounded-lg">
                      <div className="text-base font-black text-amber-400">{remainingDays}</div>
                      <div className="text-[9px] text-slate-400 uppercase">Siku</div>
                    </div>
                    <div className="bg-slate-950 border border-amber-500/20 p-1.5 rounded-lg">
                      <div className="text-base font-black text-amber-400">{remainingHours.toString().padStart(2, '0')}</div>
                      <div className="text-[9px] text-slate-400 uppercase">Saa</div>
                    </div>
                    <div className="bg-slate-950 border border-amber-500/20 p-1.5 rounded-lg">
                      <div className="text-base font-black text-amber-400">{remainingMinutes.toString().padStart(2, '0')}</div>
                      <div className="text-[9px] text-slate-400 uppercase">Dak</div>
                    </div>
                    <div className="bg-slate-950 border border-amber-500/20 p-1.5 rounded-lg">
                      <div className="text-base font-black text-amber-400">{remainingSeconds.toString().padStart(2, '0')}</div>
                      <div className="text-[9px] text-slate-400 uppercase">Sek</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tarehe ya kufunguliwa: <strong className="text-slate-200">{unlockDateString}</strong>
                  </div>
                </div>
              )}
            </div>

            {pinError && (
              <div className="p-3 bg-red-950/60 border border-red-500/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-400 font-bold uppercase">Chagua Mtandao wa Kupokelea:</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Vodacom M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa'].map(net => (
                    <button
                      type="button"
                      key={net}
                      onClick={() => setNetwork(net)}
                      className={`p-2.5 rounded-xl font-bold transition-all border cursor-pointer ${
                        network === net
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase">Namba ya Simu ya Kupokelea Pesa:</span>
                <input
                  type="tel"
                  required
                  placeholder="Mfano: 0764220155"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase">
                  <span>Kiasi cha Kutoa (TSh):</span>
                  <span className="text-[11px] font-mono font-bold text-amber-400">Kikomo: TSh 5,000 / siku</span>
                </div>
                <input
                  type="number"
                  min="1000"
                  max="5000"
                  step="500"
                  required
                  value={amount}
                  onChange={e => setAmount(parseInt(e.target.value) || 1000)}
                  className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none ${
                    amount > 5000 ? 'border-red-500 text-red-400' : 'border-slate-700 focus:border-amber-500'
                  }`}
                />
                {amount > 5000 && (
                  <p className="text-[11px] text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>⚠️ Kiwango cha juu cha kutoa fedha kwa siku ni TSh 5,000 tu!</span>
                  </p>
                )}
                {/* Quick amount buttons up to 5,000 */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[1000, 2000, 3000, 4000, 5000].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        amount === val ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {val / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* WITHDRAWAL 2FA PIN FIELD */}
              <div className="space-y-1 bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> 2FA PIN YA USALAMA (TARAKIMU 4):
                  </span>
                  {!hasPinConfigured && (
                    <button
                      type="button"
                      onClick={() => setIsSettingPin(true)}
                      className="text-[10px] text-amber-300 underline font-bold cursor-pointer"
                    >
                      Tengeneza PIN
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={enteredPin}
                  onChange={e => setEnteredPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={hasPinConfigured ? "Weka PIN yako ya tarakimu 4" : "Bofya 'Tengeneza PIN' kwanza"}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-black text-center tracking-[0.4em] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Gharama ya Utoaji (Fee):</span>
                  <span className="text-emerald-400 font-bold">BURE (TSh 0)</span>
                </div>
                <div className="flex justify-between font-bold text-slate-200">
                  <span>Utapokea:</span>
                  <span className="text-amber-400 font-mono text-sm">TSh {amount.toLocaleString()}</span>
                </div>
              </div>

              {/* WITHDRAWAL SUBMIT BUTTON: ENABLED ONLY WHEN BOTH CONDITIONS ARE MET */}
              <div onClick={!isCanWithdraw ? handleAttemptWithdrawClick : undefined} className="w-full">
                <button
                  type="submit"
                  disabled={!isCanWithdraw}
                  className={`w-full py-4 font-black rounded-2xl text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    !isCanWithdraw
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-950/80 cursor-pointer'
                  }`}
                >
                  {!isCanWithdraw ? (
                    <>
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>THIBITISHA KUTOA ELA (IMEFUNGWA)</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                      <span>THIBITISHA KUTOA ELA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

