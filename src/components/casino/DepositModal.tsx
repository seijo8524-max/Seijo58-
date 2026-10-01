import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  AlertCircle, 
  Sparkles,
  Lock,
  CheckCircle2,
  ArrowRight,
  Clock
} from 'lucide-react';
import { 
  validateAndRedeemToken, 
  getLockoutStatus, 
  formatCountdown 
} from '../../utils/dailyTokenManager';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export function calculateDepositBonus(depositAmount: number): number {
  if (depositAmount === 5000) return 2000;
  if (depositAmount === 10000) return 3000;
  if (depositAmount >= 10000) return 3000;
  if (depositAmount >= 5000) return 2000;
  return 0;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, ref: string, bonus?: number) => void;
  showToast: (msg: string) => void;
}

export function DepositModal({ isOpen, onClose, onDepositSuccess, showToast }: DepositModalProps) {
  const { userProfile, currentUser } = useAuth();
  const [step, setStep] = useState<'pay' | 'activate'>('pay');
  const [amount, setAmount] = useState<number>(5000);
  const [network, setNetwork] = useState<string>('Vodacom M-Pesa');
  const [userPhone, setUserPhone] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [hasSentToAdmin, setHasSentToAdmin] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  
  const [activationCode, setActivationCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [lockoutStatus, setLockoutStatus] = useState(getLockoutStatus());

  const bonusAmount = calculateDepositBonus(amount);
  const totalCreditAmount = amount + bonusAmount;

  useEffect(() => {
    if (isOpen && userProfile?.phoneNumber && !userPhone) {
      setUserPhone(userProfile.phoneNumber);
    }
  }, [isOpen, userProfile]);

  useEffect(() => {
    if (!isOpen) return;
    setLockoutStatus(getLockoutStatus());
    const interval = setInterval(() => {
      setLockoutStatus(getLockoutStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('+255764220155');
    setCopiedNumber(true);
    showToast('✓ Namba +255 764 220 155 imenakiliwa!');
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const getWhatsAppMessage = () => {
    const cleanPhone = userPhone.trim() || 'Haijawekwa';
    const cleanTx = transactionRef.trim() || 'Haijawekwa';
    const bonusText = bonusAmount > 0 
      ? `\n🎁 Bonasi Inayostahili: +TSh ${bonusAmount.toLocaleString()} (Jumla Utakayopokea: TSh ${totalCreditAmount.toLocaleString()})`
      : '';
    const text = `Habari Admin SEIJO58,\nNimekamilisha malipo ya TSh ${amount.toLocaleString()} kwa ajili ya kuweka kwenye akaunti yangu ya Casino.${bonusText}\n\n📱 Namba ya Simu Iliyolipa: ${cleanPhone}\n📶 Mtandao: ${network}\n🔖 Taarifa za Muamala / SMS: ${cleanTx}\n💰 Kiasi Kilicholipwa: TSh ${amount.toLocaleString()}\n\nTafadhali thibitisha muamala huu na unitumie Activation Code ili niweze kuwasha salio langu kwenye pochi.`;
    return encodeURIComponent(text);
  };

  const getSmsHref = () => {
    const text = `Habari Admin SEIJO58, Nimelipa TSh ${amount} kwa ${network}. Namba: ${userPhone}, SMS ya Muamala: ${transactionRef}. Tafadhali nitumie Activation Code ya kuwasha salio langu.`;
    return `sms:+255764220155?body=${encodeURIComponent(text)}`;
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    return digitsOnly.length >= 9 && digitsOnly.length <= 13;
  };

  const handleSendToAdminWhatsApp = () => {
    setValidationError('');
    if (!userPhone.trim() || !validatePhone(userPhone)) {
      setValidationError('Tafadhali ingiza namba yako sahihi ya simu uliyotumia kufanya malipo kabla ya kuwasiliana na Admin.');
      showToast('Ingiza namba yako sahihi ya simu!');
      return;
    }

    if (!transactionRef.trim() || transactionRef.trim().length < 4) {
      setValidationError('Tafadhali ingiza ujumbe wa muamala (SMS au Transaction ID) uliopokea kutoka mtandao wa simu.');
      showToast('Weka taarifa za muamala/SMS ya malipo!');
      return;
    }

    setHasSentToAdmin(true);
    showToast('✓ Unaelekezwa WhatsApp kutuma taarifa za malipo kwa Admin...');
    const url = `https://wa.me/255764220155?text=${getWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  const handleSendToAdminSms = () => {
    setValidationError('');
    if (!userPhone.trim() || !validatePhone(userPhone)) {
      setValidationError('Tafadhali ingiza namba yako sahihi ya simu uliyotumia kufanya malipo kabla ya kutuma SMS.');
      showToast('Ingiza namba yako sahihi ya simu!');
      return;
    }

    if (!transactionRef.trim() || transactionRef.trim().length < 4) {
      setValidationError('Tafadhali ingiza ujumbe wa muamala (SMS au Transaction ID) uliopokea kutoka mtandao wa simu.');
      showToast('Weka taarifa za muamala/SMS ya malipo!');
      return;
    }

    setHasSentToAdmin(true);
    showToast('✓ Inafungua ujumbe wa SMS kutuma kwa Admin...');
    window.location.href = getSmsHref();
  };

  const handleProceedToActivation = () => {
    setValidationError('');
    
    if (amount < 3000) {
      setValidationError('Kiwango cha chini cha malipo/akiba ni TSh 3,000.');
      showToast('Kiwango cha chini ni TSh 3,000.');
      return;
    }

    if (!userPhone.trim() || !validatePhone(userPhone)) {
      setValidationError('Huwezi kuendelea: Lazima uweke namba yako ya simu uliyotumia kufanya malipo (angalau tarakimu 9 au 10).');
      showToast('Tafadhali ingiza namba ya simu iliyolipa!');
      return;
    }

    if (!transactionRef.trim() || transactionRef.trim().length < 4) {
      setValidationError('Huwezi kuendelea: Lazima uweke taarifa za muamala / SMS ya malipo uliyopokea kutoka kwa mtandao wako.');
      showToast('Weka taarifa za muamala/SMS!');
      return;
    }

    setStep('activate');
    setCodeError('');
  };

  const handleVerifyActivationCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    // Check anti-brute force lockout
    const currentLockout = getLockoutStatus();
    if (currentLockout.isLocked) {
      setCodeError(`⚠️ Sehemu ya kodi imefungwa kwa saa 24 (Anti-Brute Force). Subiri: ${formatCountdown(currentLockout.remainingMs)}`);
      return;
    }

    // Extra safeguard check
    if (!userPhone.trim() || !transactionRef.trim()) {
      setCodeError('Taarifa za simu na muamala hazijakamilika. Tafadhali rudi nyuma ukamilishe hatua zote.');
      return;
    }

    const sanitizedCode = activationCode.trim().toUpperCase();
    const result = validateAndRedeemToken(sanitizedCode);
    
    if (result.success) {
      const bonus = calculateDepositBonus(amount);
      const total = amount + bonus;
      const ref = `Lipa: ${network} | Simu: ${userPhone.trim()} | Muamala: ${transactionRef.trim()} | Kodi: ${sanitizedCode}${bonus > 0 ? ` | Bonus: +TSh ${bonus}` : ''}`;
      onDepositSuccess(amount, ref, bonus);
      showToast(`✓ Hongera! Malipo na Kodi vimethibitishwa. TSh ${amount.toLocaleString()}${bonus > 0 ? ` + Bonasi TSh ${bonus.toLocaleString()} (Jumla: TSh ${total.toLocaleString()})` : ''} zimewekwa kwenye pochi yako!`);
      setStep('pay');
      setActivationCode('');
      setTransactionRef('');
      setUserPhone('');
      setHasSentToAdmin(false);
      onClose();
    } else {
      setCodeError(result.message);
      setLockoutStatus(getLockoutStatus());
      showToast(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border-2 border-emerald-500/60 rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
            <ArrowDownLeft className="w-4 h-4" /> MFUMO WA MALIPO & KUWASHA POCHI
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {step === 'pay' ? 'HATUA YA 1: LIPA NA TUMA SMS YA MUAMALA KWA ADMIN' : 'HATUA YA 2: INGIZA KODI YA KUWASHA SALIO'}
          </h3>
          <p className="text-xs text-slate-400">
            {step === 'pay' 
              ? 'Salio halitaingizwa hadi ukamilishe malipo, uweke namba ya simu na SMS ya muamala, na umtumie Admin.' 
              : 'Ingiza kodi uliyopewa na Admin baada ya kuthibitisha malipo yako.'}
          </p>
        </div>

        {/* STEP 1: PAYMENT & CONTACT ADMIN */}
        {step === 'pay' && (
          <div className="space-y-4 text-xs">
            {/* Payment Network Selection */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-bold uppercase">1. Chagua Mtandao Unaolipa Nao:</span>
              <div className="grid grid-cols-2 gap-2">
                {['Vodacom M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa'].map(net => (
                  <button
                    type="button"
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`p-2.5 rounded-xl font-bold transition-all border text-left flex items-center justify-between ${
                      network === net
                        ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{net}</span>
                    {network === net && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Number Box */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5">
              <div className="text-slate-300 font-bold flex items-center justify-between">
                <span>2. Tuma pesa unayotaka kuweka kwenda namba hii:</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">Namba Rasmi</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Namba ya Malipo ya Admin:</div>
                  <span className="font-mono font-black text-emerald-400 text-base sm:text-lg">+255 764 220 155</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs transition-colors"
                >
                  {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNumber ? 'Imenakiliwa' : 'Nakili Namba'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Jina la Akaunti: <strong className="text-white font-bold">SEIJO58</strong></span>
                <span className="text-emerald-400 font-semibold">Masaa 24/7</span>
              </div>
            </div>

            {/* DEPOSIT BONUS PROMOTION BANNER */}
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-emerald-500/20 border-2 border-amber-400/70 rounded-2xl p-3.5 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>OFA MAALUM: BONASI YA KUWEKA PESA</span>
                </div>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  EXTRA BONUS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div 
                  onClick={() => setAmount(5000)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    amount === 5000 
                      ? 'bg-amber-500/30 border-amber-400 shadow-md text-amber-100 ring-1 ring-amber-400' 
                      : 'bg-slate-900/90 border-slate-700 hover:border-amber-500/60 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-white text-xs">Weka TSh 5,000</div>
                  <div className="text-emerald-400 font-black text-xs">+ TSh 2,000 Bonus</div>
                  <div className="text-[10px] text-slate-400 pt-0.5 font-sans">Jumla Unapata: <strong className="text-amber-300 font-mono">TSh 7,000</strong></div>
                </div>

                <div 
                  onClick={() => setAmount(10000)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    amount === 10000 
                      ? 'bg-amber-500/30 border-amber-400 shadow-md text-amber-100 ring-1 ring-amber-400' 
                      : 'bg-slate-900/90 border-slate-700 hover:border-amber-500/60 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-white text-xs">Weka TSh 10,000</div>
                  <div className="text-emerald-400 font-black text-xs">+ TSh 3,000 Bonus</div>
                  <div className="text-[10px] text-slate-400 pt-0.5 font-sans">Jumla Unapata: <strong className="text-amber-300 font-mono">TSh 13,000</strong></div>
                </div>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-bold uppercase">3. Kiasi Ulichotuma (TSh - Min 3,000):</span>
              <input
                type="number"
                min="3000"
                step="500"
                required
                value={amount}
                onChange={e => setAmount(parseInt(e.target.value) || 3000)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-base focus:border-emerald-500 focus:outline-none"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  { amt: 3000, label: '3k (Kiwango cha Chini)' },
                  { amt: 5000, label: '5k (+2k Bonus)' },
                  { amt: 10000, label: '10k (+3k Bonus)' },
                  { amt: 20000, label: '20k (+3k Bonus)' },
                  { amt: 50000, label: '50k (+3k Bonus)' }
                ].map(item => (
                  <button
                    type="button"
                    key={item.amt}
                    onClick={() => setAmount(item.amt)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                      amount === item.amt ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {bonusAmount > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold mt-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    Bonasi ya Kuweka Pesa:
                  </span>
                  <span className="font-mono text-amber-300 font-black">
                    + TSh {bonusAmount.toLocaleString()} (Jumla Utapata: TSh {totalCreditAmount.toLocaleString()})
                  </span>
                </div>
              )}
            </div>

            {/* User Phone & SMS Ref Inputs - REQUIRED */}
            <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                <Lock className="w-3.5 h-3.5" /> 4. Taarifa za Lazima Kabla ya Kuendelea:
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase flex items-center justify-between">
                  <span>Namba Yako ya Simu Uliyolipia: <strong className="text-red-500">*</strong></span>
                  <span className="text-[10px] text-slate-500 font-normal">Mfano: 0764220155 au 0655...</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ingiza namba yako ya simu..."
                  value={userPhone}
                  onChange={e => {
                    setUserPhone(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase flex items-center justify-between">
                  <span>SMS ya Muamala / Transaction ID: <strong className="text-red-500">*</strong></span>
                  <span className="text-[10px] text-slate-500 font-normal">Mfano: 9H76GF342 au SMS ya malipo</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Weka SMS ya muamala uliyopokea kutoka kwenye simu..."
                  value={transactionRef}
                  onChange={e => {
                    setTransactionRef(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="font-bold">{validationError}</p>
              </div>
            )}

            {/* Admin Notification Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="text-slate-400 font-bold uppercase text-[11px]">
                5. Tuma taarifa za muamala kwa Admin ili upokee Activation Code:
              </div>

              <button
                type="button"
                onClick={handleSendToAdminWhatsApp}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-[#25D366] hover:from-emerald-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/80 active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                <span>TUMA TAARIFA KWA ADMIN WHATSAPP (+255 764 220 155)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendToAdminSms}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Tuma kwa SMS</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToActivation}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-95"
                >
                  <span>Endelea Kuweka Kodi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {hasSentToAdmin && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Taarifa za muamala zimetumwa kwa Admin. Bonyeza <strong>"Endelea Kuweka Kodi"</strong> kuingiza kodi utakayopewa.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: ENTER ACTIVATION CODE GIVEN BY ADMIN */}
        {step === 'activate' && (
          <form onSubmit={handleVerifyActivationCode} className="space-y-4 text-xs">
            {/* Summary of what is being activated */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
                <span>Kiasi Kilicholipwa:</span>
                <span className="text-white font-mono font-black text-base">TSh {amount.toLocaleString()}</span>
              </div>
              {bonusAmount > 0 && (
                <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
                  <span className="text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Bonasi ya Ziada:
                  </span>
                  <span className="text-emerald-400 font-mono font-black text-sm">+ TSh {bonusAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs font-black bg-emerald-950/50 p-2 rounded-xl border border-emerald-500/40">
                <span className="text-slate-200">Jumla Itakayowekwa Pochi:</span>
                <span className="text-emerald-400 font-mono font-black text-base">TSh {totalCreditAmount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div>
                  <span>Namba ya Simu:</span>
                  <p className="text-white font-mono font-bold">{userPhone}</p>
                </div>
                <div>
                  <span>Mtandao:</span>
                  <p className="text-amber-400 font-bold">{network}</p>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Taarifa ya SMS/Muamala:</span>
                <p className="text-slate-200 font-mono break-all">{transactionRef}</p>
              </div>
            </div>

            {/* Anti-Brute Force Lockout Banner */}
            {lockoutStatus.isLocked && (
              <div className="p-3 bg-red-950/90 border-2 border-red-500 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 animate-pulse">
                <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-red-300 uppercase">
                    Anti-Brute Force: Sehemu Imefungwa kwa Saa 24!
                  </p>
                  <p className="text-[11px] text-red-200 leading-tight">
                    Umeingiza kodi isiyo sahihi mara 3 mfululizo. Sehemu ya kodi imefungwa kuzuia kubahatisha.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-900/60 rounded-lg text-amber-300 font-mono font-black text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Muda Uliobaki: {formatCountdown(lockoutStatus.remainingMs)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-200 font-black uppercase text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Ingiza Kodi ya Uthibitisho (Activation Code):</span>
                </span>
                {!lockoutStatus.isLocked && lockoutStatus.failedAttempts > 0 && (
                  <span className="text-red-400 text-[10px] font-mono font-bold">
                    Majaribio: {lockoutStatus.failedAttempts}/3
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                autoFocus
                disabled={lockoutStatus.isLocked}
                placeholder="e.g. X9K2P1"
                value={activationCode}
                onChange={e => {
                  setActivationCode(e.target.value);
                  setCodeError('');
                }}
                className="w-full bg-slate-900 border-2 border-amber-500/70 rounded-2xl px-4 py-3.5 text-white font-mono font-black text-center text-lg tracking-widest uppercase focus:border-amber-400 focus:outline-none placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-normal disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-500 italic text-right">
                Kodi ni ya matumizi moja (Single-Use). Kodi za jana zimeisha muda wake.
              </p>
            </div>

            {codeError && !lockoutStatus.isLocked && (
              <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{codeError}</p>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={lockoutStatus.isLocked || !activationCode.trim()}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-amber-950/80 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lockoutStatus.isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>IMEFUNGWA ({formatCountdown(lockoutStatus.remainingMs)})</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      THIBITISHA NA WASHA SALIO LA TSh {totalCreditAmount.toLocaleString()}
                      {bonusAmount > 0 && ` (Ikiwemo Bonasi +${bonusAmount.toLocaleString()})`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('pay')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  ← Rekebisha Taarifa za Malipo
                </button>

                <a
                  href={`https://wa.me/255764220155?text=${getWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Omba Kodi WhatsApp</span>
                </a>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


