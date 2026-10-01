import React, { useState, useEffect } from 'react';
import { WalletTransaction } from '../../types/casino';
import { Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, History, Phone, Copy, Check, KeyRound, MessageCircle, Sparkles, AlertCircle, Lock, Clock } from 'lucide-react';
import { validateAndRedeemToken, getLockoutStatus, formatCountdown } from '../../utils/dailyTokenManager';
import { calculateDepositBonus } from './DepositModal';

interface WalletViewProps {
  walletBalance: number;
  transactions: WalletTransaction[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onDepositSuccess: (amount: number, ref: string, bonus?: number) => void;
  showToast: (msg: string) => void;
}

export function CasinoWalletView({
  walletBalance,
  transactions,
  onOpenDeposit,
  onOpenWithdraw,
  onDepositSuccess,
  showToast
}: WalletViewProps) {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [quickNetwork, setQuickNetwork] = useState<string>('Vodacom M-Pesa');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickTxRef, setQuickTxRef] = useState<string>('');
  const [quickCode, setQuickCode] = useState<string>('');
  const [quickAmount, setQuickAmount] = useState<number>(5000);
  const [quickError, setQuickError] = useState<string>('');
  const [lockoutStatus, setLockoutStatus] = useState(getLockoutStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setLockoutStatus(getLockoutStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    showToast(`✓ Namba ${num} imenakiliwa!`);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    return digitsOnly.length >= 9 && digitsOnly.length <= 13;
  };

  const getWhatsAppQuickMessage = () => {
    const text = `Habari Admin SEIJO58,\nNimetuma malipo ya TSh ${quickAmount.toLocaleString()} kupitia ${quickNetwork}.\n📱 Namba ya Simu: ${quickPhone || 'Haijawekwa'}\n🔖 SMS ya Muamala: ${quickTxRef || 'Haijawekwa'}\n\nTafadhali thibitisha na unitumie Activation Code ya kuwasha salio langu la Casino.`;
    return encodeURIComponent(text);
  };

  const handleQuickActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError('');

    const currentLockout = getLockoutStatus();
    if (currentLockout.isLocked) {
      setQuickError(`⚠️ Sehemu ya kodi imefungwa kwa saa 24 (Anti-Brute Force). Subiri: ${formatCountdown(currentLockout.remainingMs)}`);
      return;
    }

    if (quickAmount < 500) {
      setQuickError('Kiwango cha chini cha kuweka ni TSh 500.');
      showToast('Kiwango cha chini ni TSh 500.');
      return;
    }

    if (!quickPhone.trim() || !validatePhone(quickPhone)) {
      setQuickError('Tafadhali ingiza namba yako sahihi ya simu uliyotumia kufanya malipo kabla ya kuendelea.');
      showToast('Ingiza namba ya simu iliyolipa!');
      return;
    }

    if (!quickTxRef.trim() || quickTxRef.trim().length < 4) {
      setQuickError('Tafadhali ingiza ujumbe wa muamala (SMS ya malipo au Transaction ID) uliopokea kutoka kwa mtandao.');
      showToast('Weka taarifa za SMS ya muamala!');
      return;
    }

    const sanitized = quickCode.trim().toUpperCase();
    const result = validateAndRedeemToken(sanitized);

    if (result.success) {
      const bonus = calculateDepositBonus(quickAmount);
      const total = quickAmount + bonus;
      const ref = `Lipa: ${quickNetwork} | Simu: ${quickPhone.trim()} | Muamala: ${quickTxRef.trim()} | Kodi: ${sanitized}${bonus > 0 ? ` | Bonus: +TSh ${bonus}` : ''}`;
      onDepositSuccess(quickAmount, ref, bonus);
      showToast(`✓ Hongera! Malipo na kodi vimethibitishwa. TSh ${quickAmount.toLocaleString()}${bonus > 0 ? ` + Bonasi TSh ${bonus.toLocaleString()} (Jumla: TSh ${total.toLocaleString()})` : ''} zimewekwa kwenye pochi yako!`);
      setQuickCode('');
      setQuickPhone('');
      setQuickTxRef('');
    } else {
      setQuickError(result.message);
      setLockoutStatus(getLockoutStatus());
      showToast(result.message);
    }
  };

  const quickBonus = calculateDepositBonus(quickAmount);
  const quickTotal = quickAmount + quickBonus;

  return (
    <div className="space-y-6">
      {/* TOP BIG BALANCE HERO CARD */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0f172a] to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
              <Wallet className="w-4 h-4" /> SEIJO58 CASINO WALLET
            </div>
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Salio Linalopatikana:</div>
            <h2 className="text-3xl sm:text-5xl font-black font-mono text-emerald-400">
              TSh {walletBalance.toLocaleString()}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenDeposit}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black px-5 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/80 active:scale-95 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
              <span>WEKA PESA & WASHA (DEPOSIT)</span>
            </button>

            <button
              onClick={onOpenWithdraw}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-5 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-950/80 active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>TOA PESA (WITHDRAW)</span>
            </button>
          </div>
        </div>

        {/* Payment Channels Supported */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Miamala ya simu 24/7 Tanzania:</span>
          </div>

          <div className="flex items-center gap-2 font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-red-950 text-red-300 border border-red-800/60">Vodacom M-Pesa</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/60">Tigo Pesa</span>
            <span className="px-2.5 py-1 rounded-lg bg-red-950 text-red-400 border border-red-800/60">Airtel Money</span>
            <span className="px-2.5 py-1 rounded-lg bg-orange-950 text-orange-300 border border-orange-800/60">Halopesa</span>
          </div>
        </div>
      </div>

      {/* QUICK CODE ACTIVATION CARD & GUIDE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* HOW TO DEPOSIT & ACTIVATE GUIDE */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" /> MWONGOZO WA KULIPA & KUWASHA SALIO
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
                <div className="font-bold text-amber-300">1. Tuma Pesa kwa Namba Rasmi:</div>
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="font-mono font-black text-emerald-400 text-sm">+255 764 220 155</span>
                  <button
                    onClick={() => handleCopy('+255764220155')}
                    className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedNumber === '+255764220155' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber === '+255764220155' ? 'Imenakiliwa' : 'Nakili'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">Jina la Akaunti: <strong className="text-white">SEIJO58</strong></div>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
                <div className="font-bold text-emerald-400">2. Tuma Taarifa za Muamala / SMS kwa Admin:</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Baada ya kutuma, mtumie Admin namba yako na ujumbe wa SMS wa muamala kupitia WhatsApp (+255 764 220 155) ili akutumie <strong>Activation Code</strong> ya kuwasha salio lako.
                </p>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
                <div className="font-bold text-amber-300">3. Uthibitisho & Kuingiza Pesa:</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Mfumo hautoi salio hadi uweke namba ya simu, SMS ya muamala, na kodi rasmi ya uthibitisho kutoka kwa Admin.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={onOpenDeposit}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Weka Pesa Hatua kwa Hatua</span>
            </button>

            <a
              href="https://wa.me/255764220155?text=Habari%20Admin%20SEIJO58%2C%20nahitaji%20msaada%20kuhusu%20malipo%20na%20kuwasha%20salio%20langu%20la%20Casino%3A"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Msaada WhatsApp</span>
            </a>
          </div>
        </div>

        {/* QUICK CODE ACTIVATION FORM */}
        <div className="bg-[#0f172a] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
              <KeyRound className="w-4 h-4" /> KUWASHA SALIO KWA KODI YA ADMIN
            </div>
            <h3 className="font-black text-white text-base">INGIZA TAARIFA ZA MALIPO NA KODI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jaza taarifa za namba ya simu uliyolipia, SMS ya muamala, na kodi uliyopewa na Admin ili kuingiza salio kwenye pochi:
            </p>

            <form onSubmit={handleQuickActivate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase">Mtandao Uliotumia:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Vodacom M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa'].map(net => (
                    <button
                      type="button"
                      key={net}
                      onClick={() => setQuickNetwork(net)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                        quickNetwork === net
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Kiasi (TSh):</span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    value={quickAmount}
                    onChange={e => setQuickAmount(parseInt(e.target.value) || 500)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
                  />
                  {quickBonus > 0 && (
                    <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>+TSh {quickBonus.toLocaleString()} Bonasi (Jumla: TSh {quickTotal.toLocaleString()})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Namba Yako ya Simu:</span>
                  <input
                    type="tel"
                    required
                    placeholder="0764220155"
                    value={quickPhone}
                    onChange={e => {
                      setQuickPhone(e.target.value);
                      setQuickError('');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase">SMS ya Muamala / Transaction ID:</span>
                <input
                  type="text"
                  required
                  placeholder="Mfano: 9H76GF342 au SMS ya malipo"
                  value={quickTxRef}
                  onChange={e => {
                    setQuickTxRef(e.target.value);
                    setQuickError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Anti-Brute Force Lockout Banner */}
              {lockoutStatus.isLocked && (
                <div className="p-3 bg-red-950/90 border border-red-500 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-pulse">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-red-300">Anti-Brute Force: Sehemu Imefungwa kwa Saa 24!</p>
                    <p className="text-[10px] text-red-300">Umeingiza kodi isiyo sahihi mara 3. Muda uliobaki: {formatCountdown(lockoutStatus.remainingMs)}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-400 font-bold uppercase">
                  <span>Kodi ya Kuwezesha (Activation Code):</span>
                  {!lockoutStatus.isLocked && lockoutStatus.failedAttempts > 0 && (
                    <span className="text-red-400 text-[10px] font-mono">
                      Majaribio: {lockoutStatus.failedAttempts}/3
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  disabled={lockoutStatus.isLocked}
                  placeholder="e.g. X9K2P1"
                  value={quickCode}
                  onChange={e => {
                    setQuickCode(e.target.value);
                    setQuickError('');
                  }}
                  className="w-full bg-slate-900 border-2 border-amber-500/70 rounded-xl px-3.5 py-2.5 text-white font-mono font-black text-center text-base tracking-widest uppercase focus:border-amber-400 focus:outline-none placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-normal disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 italic text-right">
                  Kodi ni ya matumizi moja (Single-Use). Kodi za jana haziwezi kutumika leo.
                </p>
              </div>

              {quickError && !lockoutStatus.isLocked && (
                <div className="p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{quickError}</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={lockoutStatus.isLocked}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-950/80 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                        THIBITISHA & WASHA SALIO LA TSh {quickTotal.toLocaleString()}
                        {quickBonus > 0 && ` (+${quickBonus.toLocaleString()} Bonasi)`}
                      </span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/255764220155?text=${getWhatsAppQuickMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Tuma SMS ya Muamala WhatsApp kupata Kodi</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS HISTORY LEDGER */}
      <div className="space-y-3">
        <h3 className="font-black text-white text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" /> HISTORIA YA MIAMALA YA POCHI
        </h3>

        {transactions.length === 0 ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400">
            Hakuna miamala iliyofanyika bado. Fanya malipo na uwashe pochi ili kuanza.
          </div>
        ) : (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
            {transactions.map(tx => {
              const isPositive = tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'BONUS';
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span>{tx.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {tx.timestamp} • Salio Baada ya Muamala: TSh {tx.balanceAfter.toLocaleString()}
                    </div>
                  </div>

                  <div className={`text-sm sm:text-base font-black font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : '-'} TSh {tx.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
