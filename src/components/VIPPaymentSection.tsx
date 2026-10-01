import React, { useState } from 'react';
import { 
  Crown, 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  HelpCircle, 
  Send, 
  MessageCircle,
  AlertCircle,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { CHANNEL_CONFIG, VIP_PLANS } from '../data/mockMatches';
import { VIPSubscription, VIPPlan } from '../types';

interface VIPPaymentSectionProps {
  vipSub: VIPSubscription;
  onActivateVIP: (plan: VIPPlan, transactionRef: string, phone: string) => void;
  onCancelVIP: () => void;
}

export const VIPPaymentSection: React.FC<VIPPaymentSectionProps> = ({
  vipSub,
  onActivateVIP,
  onCancelVIP,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<VIPPlan>(VIP_PLANS[1]); // Default to Weekly
  const [transactionRef, setTransactionRef] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(CHANNEL_CONFIG.momoNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setSuccessMessage('');

    if (!transactionRef.trim()) {
      setVerificationError('Please enter your Mobile Money Transaction ID or Reference number.');
      return;
    }

    if (transactionRef.trim().length < 5) {
      setVerificationError('Transaction Reference must be at least 5 alphanumeric characters.');
      return;
    }

    setIsSubmitting(true);

    // Simulate verification check
    setTimeout(() => {
      setIsSubmitting(false);
      onActivateVIP(selectedPlan, transactionRef.trim().toUpperCase(), userPhone.trim() || 'Mobile Money');
      setSuccessMessage(`Payment reference ${transactionRef.trim().toUpperCase()} verified! VIP Access unlocked successfully for ${selectedPlan.name}.`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Active VIP Status Banner if already active */}
      {vipSub.isActive && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VIP ACCESS ACTIVE
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  {vipSub.planName || 'VIP Unlimited'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                All VIP Matches & Odds Are Unlocked!
              </h3>
              <p className="text-xs text-slate-300">
                Transaction Ref: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">{vipSub.transactionRef || 'OFFICIAL-PASS'}</code>
                {vipSub.expiresAt && ` • Expires on: ${vipSub.expiresAt}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={CHANNEL_CONFIG.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow"
              >
                <Send className="w-3.5 h-3.5" />
                VIP Telegram
              </a>
              <button
                onClick={onCancelVIP}
                className="bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset VIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Payment Checkout Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          Official SEIJO58 Mobile Money Gateway
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Activate Your VIP Winning Pass
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Follow the simple 2-step payment below using Mobile Money. Once sent, enter your transaction reference for instant automated unlocking.
        </p>
      </div>

      {/* STEP 1: Select Plan */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">1</span>
          Select Your VIP Package:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VIP_PLANS.map(plan => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-amber-500 ring-2 ring-amber-500/30 shadow-xl shadow-amber-950/30'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-sm text-white">{plan.name}</h4>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>

                <div className="text-xl font-black text-amber-400 mb-1">
                  {plan.priceUgx} <span className="text-xs text-slate-400 font-normal">({plan.price})</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{plan.durationLabel} • {plan.oddsTarget}</p>

                <ul className="space-y-1 text-[11px] text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Make Payment to Mobile Money Number */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0d1424] to-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">2</span>
          Send Mobile Money Payment:
        </h3>

        {/* Mobile Money Details Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Official Payment Mobile Money Number
            </span>
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-amber-400" />
              <span className="text-2xl sm:text-3xl font-black text-white tracking-wider font-mono">
                {CHANNEL_CONFIG.momoNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Account Name / Desk: <strong className="text-emerald-400">{CHANNEL_CONFIG.momoAccountName}</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Supported Networks: MTN Mobile Money • Airtel Money • M-Pesa
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <button
              id="copy-momo-number-btn"
              onClick={handleCopyNumber}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs transition-all ${
                copiedNumber
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-950/50 hover:scale-105 active:scale-95'
              }`}
            >
              {copiedNumber ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>COPIED NUMBER ({CHANNEL_CONFIG.momoNumber})</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>1-TAP COPY NUMBER</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-slate-400 text-center sm:text-right">
              Amount to send: <strong className="text-amber-300">{selectedPlan.priceUgx}</strong>
            </span>
          </div>
        </div>

        {/* Payment Guide Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs text-slate-300">
          <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="font-bold text-amber-400 block mb-0.5">1. Send Momo</span>
            <p className="text-[11px] text-slate-400">Send {selectedPlan.priceUgx} to {CHANNEL_CONFIG.momoNumber} on your phone.</p>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="font-bold text-amber-400 block mb-0.5">2. Copy Ref / Txn ID</span>
            <p className="text-[11px] text-slate-400">Copy the transaction SMS confirmation ID (e.g. MP24098 or TXN1902).</p>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="font-bold text-amber-400 block mb-0.5">3. Instant Unlock</span>
            <p className="text-[11px] text-slate-400">Paste below and submit to immediately view all VIP predictions.</p>
          </div>
        </div>
      </div>

      {/* STEP 3: Verification Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">3</span>
          Submit Payment Verification:
        </h3>

        <form onSubmit={handleVerifyPayment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Transaction ID / Reference Number <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-transaction-ref"
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g., MP84920491 or TXN-77319"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono transition-colors"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">From your MTN/Airtel/M-Pesa confirmation SMS</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Sender Phone Number (Optional)
              </label>
              <input
                id="input-user-phone"
                type="tel"
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                placeholder="e.g., 07XXXXXXXX"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Used to send duplicate VIP slip to WhatsApp</span>
            </div>
          </div>

          {verificationError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{verificationError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              id="submit-payment-verification-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs tracking-wide shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Reference...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>VERIFY & UNLOCK {selectedPlan.name.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick WhatsApp Support Link */}
            <a
              href={`https://wa.me/255764220155?text=Hello%20SEIJO58%20Admin,%20I%20have%20sent%20${selectedPlan.priceUgx}%20for%20${encodeURIComponent(selectedPlan.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors py-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Need help? Chat with Admin on WhatsApp ({CHANNEL_CONFIG.supportPhone})</span>
            </a>
          </div>
        </form>
      </div>

      {/* Transparency Guarantee & FAQs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Replacement Guarantee</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            In the rare event a VIP ticket loses, your subscription automatically extends for an extra day free of charge until a massive win is recorded.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Direct Channel Community</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            VIP subscribers get added to the exclusive private Telegram lounge where live in-play updates and high-odds rolling bets are shared.
          </p>
        </div>
      </div>
    </div>
  );
};
