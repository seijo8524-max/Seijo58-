import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Copy, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  KeyRound, 
  Smartphone, 
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export interface UserPaymentRequest {
  id: string;
  phoneNumber: string;
  amount: number;
  smsText: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  userName?: string;
  userEmail?: string;
  approvedToken?: string;
}

interface PostRegistrationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated?: () => void;
  showToast: (msg: string) => void;
}

const ADMIN_PAYMENT_PHONE = "+255764220155";
const ADMIN_PAYMENT_DISPLAY = "+255 764 220 155";
const ADMIN_ACCOUNT_NAME = "SEIJO58";

export const PostRegistrationPaymentModal: React.FC<PostRegistrationPaymentModalProps> = ({
  isOpen,
  onClose,
  onActivated,
  showToast
}) => {
  const { 
    currentUser, 
    userProfile, 
    redeemActivationCode, 
    updatePhoneNumber, 
    submitPaymentVerification,
    isAccountActive 
  } = useAuth();

  // Payment Tier Selection (Min 3,000 TSh)
  const [selectedTier, setSelectedTier] = useState<number | 'custom'>(3000);
  const [customAmount, setCustomAmount] = useState<string>('3000');
  
  // Verification details
  const [paymentPhone, setPaymentPhone] = useState<string>('');
  const [transactionSms, setTransactionSms] = useState<string>('');
  
  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Code redemption
  const [activationCode, setActivationCode] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Copy helper
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  // Initialize phone from user profile or localStorage if available
  useEffect(() => {
    if (isOpen) {
      const existingPhone = userProfile?.phoneNumber || localStorage.getItem('seijo58_user_phone') || '';
      if (existingPhone && !paymentPhone) {
        setPaymentPhone(existingPhone);
      }
      // Check if there was already a pending request for this user
      try {
        const storedRequests: UserPaymentRequest[] = JSON.parse(
          localStorage.getItem('seijo58_payment_requests') || '[]'
        );
        const userPending = storedRequests.find(
          r => (userProfile?.phoneNumber && r.phoneNumber === userProfile.phoneNumber) ||
               (currentUser?.email && r.userEmail === currentUser.email)
        );
        if (userPending && userPending.status === 'pending') {
          setSubmissionSuccessMsg("Ombi lako limepokelewa! Admin anahakiki muamala wako ili kukutumia Code ya kuwezesha akaunti.");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen, userProfile, currentUser]);

  if (!isOpen) return null;

  const currentAmount = selectedTier === 'custom' 
    ? Math.max(3000, Number(customAmount) || 3000) 
    : selectedTier;

  const handleCopyPaymentNumber = () => {
    navigator.clipboard.writeText("0764220155");
    setCopiedNumber(true);
    showToast('✓ Namba ya malipo 0764220155 imenakiliwa!');
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleSubmitPaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = paymentPhone.trim().replace(/[\s-]/g, '');
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');

    if (digitsOnly.length < 9) {
      setFormError('Tafadhali weka namba sahihi ya simu uliyolipia (mfano: 0764220155 au 764220155).');
      return;
    }

    if (currentAmount < 3000) {
      setFormError('Kiwango cha chini cha malipo ya kuanzisha akaunti ni TSh 3,000.');
      return;
    }

    if (!transactionSms.trim() || transactionSms.trim().length < 5) {
      setFormError('Tafadhali weka au bandika ujumbe (SMS) wa muamala wa malipo uliopokea kutoka M-Pesa, Tigo Pesa au Airtel Money.');
      return;
    }

    // Verify user selected option matches SMS intent
    const smsLower = transactionSms.toLowerCase();
    const formattedAmt = currentAmount.toLocaleString();
    const rawAmt = currentAmount.toString();
    const containsAmt = smsLower.includes(rawAmt) || smsLower.includes(formattedAmt) || smsLower.includes(currentAmount.toString().slice(0, 3));
    if (!containsAmt && transactionSms.length > 25 && (smsLower.includes('tsh') || smsLower.includes('sh'))) {
      // Gentle warning to ensure user selected the option corresponding to their payment
      console.log(`Notice: SMS may have different amount from chosen option ${currentAmount}`);
    }

    setIsSubmitting(true);

    try {
      const userDisplayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Mteja Mpya';
      const userEmail = currentUser?.email || '';

      const newRequest: UserPaymentRequest = {
        id: 'REQ-' + Date.now(),
        phoneNumber: cleanPhone,
        amount: currentAmount,
        smsText: transactionSms.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending',
        userName: userDisplayName,
        userEmail: userEmail
      };

      // 1. Save to localStorage for Admin panel access
      try {
        const existing: UserPaymentRequest[] = JSON.parse(
          localStorage.getItem('seijo58_payment_requests') || '[]'
        );
        // Prepend new request
        existing.unshift(newRequest);
        localStorage.setItem('seijo58_payment_requests', JSON.stringify(existing));
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }

      // 2. Save user phone locally and in profile
      try {
        localStorage.setItem('seijo58_user_phone', cleanPhone);
        if (updatePhoneNumber) {
          await updatePhoneNumber(cleanPhone);
        }
      } catch (e) {
        console.warn(e);
      }

      // 3. Sync to Firestore if logged in
      try {
        if (submitPaymentVerification) {
          await submitPaymentVerification({
            transactionRef: transactionSms.trim().slice(0, 100),
            planId: currentAmount >= 5000 ? 'vip-booster' : 'min-entry',
            planName: `Malipo ya TSh ${currentAmount.toLocaleString()} - ${cleanPhone}`,
            amount: currentAmount,
            currency: 'TSh'
          });
        }
      } catch (err) {
        console.warn("Firestore sync optional error:", err);
      }

      // 4. Display confirmation message
      const successMessage = "Ombi lako limepokelewa! Admin anahakiki muamala wako ili kukutumia Code ya kuwezesha akaunti.";
      setSubmissionSuccessMsg(successMessage);
      showToast('✓ Ombi lako la Code limetumwa kwa Admin!');

    } catch (err: any) {
      setFormError(err?.message || 'Hitilafu wakati wa kutuma ombi. Tafadhali jaribu tena.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);

    const code = activationCode.trim().toUpperCase();
    if (!code) {
      setRedeemError('Tafadhali ingiza Activation Code uliyopokea kutoka kwa Admin.');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await redeemActivationCode(code);
      if (res.success) {
        showToast('🎉 HONGERA! Akaunti yako imewashwa rasmi! Furahia SEIJO58 BET.');
        if (onActivated) onActivated();
        onClose();
      } else {
        setRedeemError(res.message || 'Nambari ya code siyo sahihi au imekwisha muda wake.');
      }
    } catch (err: any) {
      setRedeemError(err?.message || 'Hitilafu ya uhakiki wa code.');
    } finally {
      setIsRedeeming(false);
    }
  };

  // WhatsApp Pre-filled URL for Admin Direct Contact
  const userDisplayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Mteja';
  const whatsappAdminMessage = encodeURIComponent(
    `Habari Admin SEIJO58,\nNimekamilisha malipo ya kuanzisha akaunti yangu.\n\n` +
    `👤 Jina: ${userDisplayName}\n` +
    `📱 Namba niliyolipia: ${paymentPhone || '0764220155'}\n` +
    `💰 Kiasi: TSh ${currentAmount.toLocaleString()}\n` +
    `📩 SMS ya Muamala: ${transactionSms.slice(0, 150) || 'Nimetuma malipo'}\n\n` +
    `Tafadhali nihakikishie malipo yangu na kunitumia Activation Code ya leo ya SEIJO58.`
  );
  const whatsappUrl = `https://wa.me/255764220155?text=${whatsappAdminMessage}`;

  return (
    <div id="post-registration-payment-modal" className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#05070d] border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-950/80 text-white my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Modal Header */}
        <div className="text-center space-y-1.5 pt-1 border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Usajili Umekamilika • Malipo ya Kuanzisha Akaunti</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            KUWEZESHA <span className="text-amber-400">AKAUNTI YAKO</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium max-w-md mx-auto">
            Ili kuanza kubeti na kucheza michezo ya kasino, lipia kuanzia <strong>TSh 3,000</strong> kisha tuma taarifa za muamala hapa chini kupokea Activation Code kutoka kwa Admin.
          </p>
        </div>

        {/* PAYMENT NUMBER DETAILS BOX */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold uppercase flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              Namba Rasmi ya Malipo ya Admin:
            </span>
            <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              M-Pesa / Tigo / Airtel
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400">Tuma Pesa Kwenda (Namba ya Simu):</div>
              <div className="font-mono font-black text-emerald-400 text-base sm:text-lg tracking-wider">
                {ADMIN_PAYMENT_DISPLAY}
              </div>
              <div className="text-[11px] text-slate-300">
                Jina la Akaunti: <strong className="text-white font-black">{ADMIN_ACCOUNT_NAME}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyPaymentNumber}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-amber-500/30"
            >
              {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNumber ? 'Imenakiliwa' : 'Nakili Namba'}</span>
            </button>
          </div>
          <div className="text-[11px] text-slate-400 text-center">
            Pia unaweza kutumia Vodacom M-Pesa, Tigo Pesa, Halopesa au Airtel Money kwenda namba hiyo.
          </div>
        </div>

        {/* PAYMENT FORM */}
        <form onSubmit={handleSubmitPaymentRequest} className="space-y-4">
          
          {/* 1. Payment Tier Selection (Minimum 3,000 TSh) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Chagua Kiasi Ulicholipa (Kiwango cha Chini TSh 3,000):</span>
              <span className="text-amber-400 font-mono font-black">
                TSh {currentAmount.toLocaleString()}
              </span>
            </label>
            
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTier(3000)}
                className={`py-2 px-1 text-center rounded-xl border font-bold text-xs transition-all ${
                  selectedTier === 3000 
                    ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400 font-black' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-amber-400">Kiwango Min</div>
                <div className="font-mono">3,000</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier(5000)}
                className={`py-2 px-1 text-center rounded-xl border font-bold text-xs transition-all ${
                  selectedTier === 5000 
                    ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400 font-black' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-amber-400">Standard</div>
                <div className="font-mono">5,000</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier(10000)}
                className={`py-2 px-1 text-center rounded-xl border font-bold text-xs transition-all ${
                  selectedTier === 10000 
                    ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400 font-black' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-emerald-400">VIP Pro</div>
                <div className="font-mono">10,000</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('custom')}
                className={`py-2 px-1 text-center rounded-xl border font-bold text-xs transition-all ${
                  selectedTier === 'custom' 
                    ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400 font-black' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] text-slate-400">Ingiza</div>
                <div>Custom</div>
              </button>
            </div>

            {selectedTier === 'custom' && (
              <div className="pt-1">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-amber-400 font-mono font-bold">
                    TSh
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Weka kiasi (mfano: 3000)"
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl pl-12 pr-3 py-2 text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Kiasi cha chini kabisa ni TSh 1,000.
                </p>
              </div>
            )}
          </div>

          {/* 2. Verification Details: Payment Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              Namba Yako ya Simu Uliyolipia (Payment Phone Number):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold text-xs">
                🇹🇿 +255
              </span>
              <input
                type="tel"
                required
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="0764 220 155 au 764220155"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-20 pr-3 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Namba ya simu uliyotumia kufanya muamala (Vodacom, Tigo, Airtel au Halo).
            </p>
          </div>

          {/* 3. Verification Details: Transaction SMS / Reference */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                SMS ya Muamala wa Malipo (Transaction SMS / Reference):
              </label>
              <button
                type="button"
                onClick={() => setTransactionSms(`Imethibitishwa. Umetuma TSh ${currentAmount.toLocaleString()} kwenda kwa SEIJO58 (0764220155) tarehe ${new Date().toLocaleDateString('sw-TZ')}. Kumbukumbu: TXN${Date.now().toString().slice(-7)}.`)}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono"
              >
                + Weka Mfano wa SMS ya TSh {currentAmount.toLocaleString()}
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={transactionSms}
              onChange={(e) => setTransactionSms(e.target.value)}
              placeholder={`Bandika (paste) hapa ujumbe wa SMS uliopokea baada ya kulipa. Mfano: Imethibitishwa. Umetuma TSh ${currentAmount.toLocaleString()} kwa SEIJO58 (0764220155)...`}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-xs text-white focus:outline-none transition-colors font-sans"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>* Hakikisha SMS inaakisi kiasi halisi ulicholipa cha <strong>TSh {currentAmount.toLocaleString()}</strong>.</span>
              <span className="text-emerald-400 font-bold">Kiasi hakitabadilishwa</span>
            </div>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="p-3 bg-red-950/80 border border-red-500/70 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-2xl text-xs sm:text-sm tracking-wide shadow-xl shadow-red-950/80 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Inatuma Ombi...' : 'TUMA OMBI LA CODE / SUBMIT FOR CODE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 4. Display Confirmation Message */}
        {submissionSuccessMsg && (
          <div className="p-4 bg-emerald-950/60 border-2 border-emerald-500/60 rounded-2xl text-xs text-emerald-200 space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-2 font-bold text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{submissionSuccessMsg}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Ukipokea Activation Code kutoka kwa Admin kupitia SMS au WhatsApp, ingiza hapa chini ili kuwasha akaunti yako papo hapo:
            </p>

            {/* Direct WhatsApp link to speed up admin review */}
            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>BONYEZA HAPA KUWASILIANA NA ADMIN WHATSAPP</span>
              </a>
            </div>
          </div>
        )}

        {/* 5. ACTIVATION CODE REDEEM INPUT */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-400" />
            INGIZA ACTIVATION CODE YA ADMIN (UKISHAIPOKEA):
          </label>
          
          <form onSubmit={handleRedeemCode} className="flex gap-2">
            <input
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              placeholder="Mfano: SEIJO58V"
              className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-center font-mono font-black text-sm text-amber-400 uppercase tracking-widest focus:outline-none"
            />
            <button
              type="submit"
              disabled={isRedeeming || !activationCode.trim()}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <span>{isRedeeming ? 'Inawasha...' : 'WASHA'}</span>
            </button>
          </form>

          {redeemError && (
            <p className="text-xs text-red-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{redeemError}</span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
