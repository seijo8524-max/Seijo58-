import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { VIPPlan } from '../types';
import { 
  Crown, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  MessageCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  KeyRound, 
  Layers,
  PhoneCall,
  Clock
} from 'lucide-react';

interface SubscriptionPageProps {
  onOpenActivationModal: () => void;
  onOpenAuthModal: () => void;
  onPaymentSubmitted?: () => void;
}

export const SUBSCRIPTION_PLANS: VIPPlan[] = [
  {
    id: 'plan-daily',
    name: 'Daily 2-5+ VIP Banker',
    price: '$5',
    priceTsh: '12,000 TSh',
    amountTsh: 12000,
    durationDays: 1,
    durationLabel: '24 Hours VIP Pass',
    badge: 'DAILY PASS',
    oddsTarget: '3.50 - 6.00 Odds',
    winRateTarget: '94% Win Rate',
    features: [
      '2 to 4 Super Safe Banker Matches',
      'Poisson Score Model Projections',
      'Over/Under & BTTS High Probability Picks',
      'Instant WhatsApp VIP Broadcast',
    ],
  },
  {
    id: 'plan-weekly',
    name: 'Weekly Mega Acca Pass',
    price: '$15',
    priceTsh: '35,000 TSh',
    amountTsh: 35000,
    durationDays: 7,
    durationLabel: '7 Days Full VIP',
    badge: 'MOST POPULAR',
    oddsTarget: '15.00 - 35.00 Odds / Day',
    winRateTarget: '92% Win Rate',
    isPopular: true,
    features: [
      'Daily 5-10+ Odds Accumulator Ticket',
      'Correct Score High Value Slips',
      'Half-Time / Full-Time (HT/FT) Picks',
      'Direct Private Telegram VIP Group Access',
      '24/7 Channel Admin Support Desk',
    ],
  },
  {
    id: 'plan-monthly',
    name: 'Monthly Platinum Roll',
    price: '$35',
    priceTsh: '85,000 TSh',
    amountTsh: 85000,
    durationDays: 30,
    durationLabel: '30 Days Complete VIP',
    badge: 'BEST VALUE',
    oddsTarget: '30.00 - 100.00 Mega Odds',
    winRateTarget: '95% Win Rate',
    features: [
      'All Daily + Weekend Mega Slips',
      'Fixed Draw & High Multiplier Combos',
      'Bankroll Management & Staking Plan',
      'Exclusive VIP Telegram VIP Lounge',
      '100% Replacement Guarantee on unexpected loss',
    ],
  },
  {
    id: 'plan-season',
    name: 'Season VIP Master Pass',
    price: '$80',
    priceTsh: '190,000 TSh',
    amountTsh: 190000,
    durationDays: 90,
    durationLabel: '90 Days VIP Access',
    badge: 'VIP ELITE',
    oddsTarget: 'All Major Leagues + Cups',
    winRateTarget: '96% Pro Accuracy',
    features: [
      'Full Champions League, EPL, La Liga coverage',
      'Direct 1-on-1 WhatsApp Senior Tipster contact',
      'Early access to high-yield betting market shifts',
      'Guaranteed VIP Activation Code renewals',
    ],
  }
];

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onOpenActivationModal,
  onOpenAuthModal,
  onPaymentSubmitted
}) => {
  const { currentUser, isPremiumActive, userProfile, submitPaymentVerification } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<VIPPlan>(SUBSCRIPTION_PLANS[1]);
  const [transactionRef, setTransactionRef] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const momoNumber = '0764220155';
  const momoAccountName = 'SEIJO58';
  const whatsappSupport = '+255 764 220 155';
  const whatsappNumberClean = '255764220155';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(momoNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (!transactionRef.trim()) {
      setSubmitResult({ success: false, message: 'Please enter your Mobile Money transaction reference number.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await submitPaymentVerification({
        transactionRef: transactionRef.trim(),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.amountTsh,
        currency: 'TSh'
      });

      if (res.success) {
        setSubmitResult({
          success: true,
          message: 'Payment reference submitted successfully! Admin will verify your transaction and issue your Activation Code.'
        });
        if (onPaymentSubmitted) onPaymentSubmitted();
      } else {
        setSubmitResult({ success: false, message: res.message || 'Error submitting payment.' });
      }
    } catch (err: any) {
      setSubmitResult({ success: false, message: err.message || 'Submission error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello SEIJO58 Support, I have submitted my Premium subscription payment reference ${transactionRef ? `"${transactionRef.trim()}"` : ''} for ${selectedPlan.name} (${selectedPlan.priceTsh}). Please verify my payment and issue my Activation Code.`
  );

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1736] via-[#101e4a] to-[#2b0c16] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-blue-950/80">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wider">
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span>SEIJO58 VIP CLUB & PREMIUM PASS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Unlock High-Value Sports Predictions & Banker Slips
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Gain unlimited access to 15.00 - 45.00+ odds accumulators, Poisson statistical distribution models, expected goals (xG) analysis, and daily VIP Banker tickets.
          </p>

          {isPremiumActive ? (
            <div className="pt-2 flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You currently have an active VIP Subscription ({userProfile?.premiumPlanName || 'VIP Active'})</span>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenActivationModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-transform active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>I have an Activation Code</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Plans Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Step 1: Choose Your Premium Plan</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select the VIP plan that best fits your betting horizon.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#132247] to-[#0d162d] border-amber-400 shadow-xl shadow-amber-950/50 scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{plan.name}</span>
                    <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {plan.durationLabel}
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-black text-white">{plan.priceTsh}</div>
                    <div className="text-xs text-slate-400 font-medium">({plan.price} USD)</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                    <div className="text-amber-300 font-bold flex items-center justify-between">
                      <span>Target Odds:</span>
                      <span>{plan.oddsTarget}</span>
                    </div>
                    <div className="text-emerald-400 font-bold flex items-center justify-between">
                      <span>Accuracy:</span>
                      <span>{plan.winRateTarget}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800">
                  <div className={`w-full py-2 rounded-xl text-xs font-extrabold text-center transition-colors ${
                    isSelected 
                      ? 'bg-amber-400 text-slate-950 shadow-md' 
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isSelected ? '✓ Plan Selected' : 'Select Plan'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Payment Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Instructions Card */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span>Payment Details & Instructions</span>
            </h3>
            <p className="text-xs text-slate-400">
              Send the exact amount for <strong className="text-amber-400">{selectedPlan.name}</strong> ({selectedPlan.priceTsh}) via Mobile Money.
            </p>
          </div>

          {/* Payment Account Details Box */}
          <div className="bg-gradient-to-br from-[#0c1427] to-[#070b16] border-2 border-red-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">TANZANIA MOBILE MONEY</span>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                OFFICIAL DESK
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Mobile Money Number</span>
                <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider">
                  {momoNumber}
                </div>
                <span className="text-xs text-slate-300 font-semibold">
                  Name: <strong className="text-amber-400 font-bold">{momoAccountName}</strong> (Tanzania +255)
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyNumber}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
              >
                {copiedNumber ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1 text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accepted Networks: <strong>Vodacom M-Pesa</strong>, <strong>Tigo Pesa</strong>, <strong>Airtel Money</strong>, <strong>Halopesa</strong>.</span>
              </p>
              <p className="text-[10px] text-slate-500">
                * Payment is strictly for accessing statistical analysis, expected goals projections, and premium sports predictions.
              </p>
            </div>
          </div>

          {/* Quick USSD Helper Codes */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
            <span className="font-bold text-slate-300 text-[11px]">Quick USSD Dial Codes (Tanzania):</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-red-400 font-bold">M-Pesa:</span> *150*00#
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-sky-400 font-bold">Tigo Pesa:</span> *150*01#
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-red-300 font-bold">Airtel Money:</span> *150*60#
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-orange-400 font-bold">Halopesa:</span> *150*88#
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reference Submission Form */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <span>Submit Payment Reference</span>
              </h3>
              <p className="text-xs text-slate-400">
                Have you completed your payment? Enter the transaction reference code received via SMS.
              </p>
            </div>

            {submitResult && (
              <div className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs ${
                submitResult.success
                  ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                  : 'bg-red-950/90 border-red-500/60 text-red-200'
              }`}>
                {submitResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-white mb-0.5">
                    {submitResult.success ? 'Verification Request Sent!' : 'Error'}
                  </div>
                  <div>{submitResult.message}</div>
                </div>
              </div>
            )}

            {!currentUser ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
                <p className="text-xs text-slate-300">
                  Please log in or register so we can link the payment verification directly to your account.
                </p>
                <button
                  onClick={onOpenAuthModal}
                  className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg"
                >
                  Log In / Create Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-3">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Selected Plan:</span>
                  <span className="font-bold text-amber-300">{selectedPlan.name} ({selectedPlan.priceTsh})</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>Transaction Reference / SMS Code</span>
                    <span className="text-[10px] text-slate-500">e.g. MP260831.1234.H09823</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter transaction reference code"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/80 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Submitting for Admin Review...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SUBMIT PAYMENT VERIFICATION</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* WhatsApp Direct Support Contact */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
            <div className="text-xs text-slate-400 font-medium text-center sm:text-left">
              Need instant activation or have questions?
            </div>
            
            <a
              href={`https://wa.me/${whatsappNumberClean}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>CONTACT SEIJO58 ON WHATSAPP ({whatsappSupport})</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
