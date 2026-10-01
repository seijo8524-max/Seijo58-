import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  KeyRound, 
  X, 
  Crown, 
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Coins,
  CheckCircle2,
  AlertCircle,
  Lock,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { 
  getLockoutStatus, 
  formatCountdown, 
  validateAndRedeemToken 
} from '../utils/dailyTokenManager';

interface ActivationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ActivationCodeModal: React.FC<ActivationCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { redeemActivationCode, currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message?: string; planName?: string; expiresAt?: string } | null>(null);
  const [lockoutStatus, setLockoutStatus] = useState(getLockoutStatus());
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Auto-refresh lockout status and live countdown
  useEffect(() => {
    if (!isOpen) return;
    setLockoutStatus(getLockoutStatus());

    const interval = setInterval(() => {
      const status = getLockoutStatus();
      setLockoutStatus(status);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const currentLockout = getLockoutStatus();
    if (currentLockout.isLocked) {
      setError(`⚠️ Sehemu ya kodi imefungwa kwa saa 24 (Anti-Brute Force). Subiri: ${formatCountdown(currentLockout.remainingMs)}`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await redeemActivationCode(code);
      if (res.success) {
        setSuccessInfo({
          message: res.message,
          planName: res.planName,
          expiresAt: res.expiresAt
        });
        if (onSuccess) onSuccess();
      } else {
        setError(res.message);
        setLockoutStatus(getLockoutStatus());
      }
    } catch (err: any) {
      setError(err.message || 'Hitilafu wakati wa kuwasha code.');
      setLockoutStatus(getLockoutStatus());
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    setSuccessInfo(null);
    onClose();
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('+255764220155');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const whatsappActivationLink = `https://wa.me/255764220155?text=${encodeURIComponent('Habari Admin SEIJO58 BET, nimekamilisha malipo ya TSh 1,000 ya kuwasha akaunti yangu (Account Activation). Huu hapa ujumbe wa muamala (SMS ya Malipo). Naomba nisaidie Activation Code ya leo:')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0e1629] via-[#090d16] to-[#04060b] border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/70 text-slate-100 space-y-4">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 mx-auto shadow-lg shadow-emerald-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="font-black text-lg sm:text-xl text-white tracking-wide flex items-center justify-center gap-1.5">
            <span>KUWASHA AKAUNTI (ACTIVATION)</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Lipa <strong>TSh 1,000</strong> kupata kodi mpya ya leo kupitia WhatsApp (+255764220155) ili kuwasha akaunti yako ya SEIJO58 BET.
          </p>
        </div>

        {/* Success State */}
        {successInfo ? (
          <div className="bg-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl p-5 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6 fill-emerald-400" />
            </div>
            <div>
              <h4 className="font-black text-base text-emerald-300">AKAUNTI IMEWASHWA (ACTIVE)!</h4>
              <p className="text-xs text-emerald-100 mt-1">
                {successInfo.message}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hali ya Akaunti: VIP ACTIVE</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>FUNGUA APP & ANZA KUTUMIA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Payment & Input Form */
          <div className="space-y-4">
            {/* Step 1: Payment Instructions */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> HATUA YA 1: LIPA TSH 1,000
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-extrabold">
                  Ada: TSh 1,000
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Namba ya Malipo:</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-emerald-400 text-xs font-black">+255 764 220 155</strong>
                    <button
                      onClick={handleCopyNumber}
                      className="text-slate-400 hover:text-white p-0.5"
                      title="Nakili Namba"
                      type="button"
                    >
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jina la Mpokeaji:</span>
                  <strong className="text-amber-300 font-bold">SEIJO58</strong>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Mitandao:</span>
                  <span>M-Pesa / Tigo Pesa / Airtel Money</span>
                </div>
              </div>

              {/* WhatsApp Proof Button */}
              <a
                href={whatsappActivationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>📲 Tuma SMS ya Malipo WhatsApp (+255764220155)</span>
              </a>
              <p className="text-[10px] text-slate-400 text-center">
                Tuma uthibitisho wa malipo ili Admin akupe kodi mpya ya leo.
              </p>
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

            {/* Step 2: Code Input Form */}
            <form onSubmit={handleRedeem} className="space-y-3">
              <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> HATUA YA 2: WEKA ACTIVATION CODE
                </span>
                {!lockoutStatus.isLocked && lockoutStatus.failedAttempts > 0 && (
                  <span className="text-red-400 text-[10px] font-mono font-bold">
                    Majaribio: {lockoutStatus.failedAttempts}/3
                  </span>
                )}
              </div>

              {error && !lockoutStatus.isLocked && (
                <div className="p-2.5 bg-red-950/80 border border-red-500/50 rounded-xl flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={lockoutStatus.isLocked || loading}
                    placeholder="e.g. X9K2P1"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-emerald-300 placeholder:text-slate-600 focus:outline-none font-mono font-bold tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic text-right">
                  Kodi za jana hazifanyi kazi leo (Daily Expired). Kodi ni ya matumizi moja (Single-Use).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim() || lockoutStatus.isLocked}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-pulse">Inahakiki Activation Code...</span>
                ) : lockoutStatus.isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>IMEFUNGWA ({formatCountdown(lockoutStatus.remainingMs)})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>WASHA AKAUNTI (ACTIVATE)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

