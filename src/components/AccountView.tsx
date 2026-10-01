import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User as UserIcon, 
  Crown, 
  ShieldCheck, 
  KeyRound, 
  Clock, 
  LogOut, 
  MessageCircle, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  PhoneCall
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PaymentRequest } from '../types';

interface AccountViewProps {
  onOpenActivationModal: () => void;
  onOpenPayment: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onOpenActivationModal,
  onOpenPayment,
  onOpenAdmin,
  onOpenAuth
}) => {
  const { currentUser, userProfile, isPremiumActive, isAdmin, logout } = useAuth();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setPaymentRequests([]);
      setLoadingHistory(false);
      return;
    }

    // Listen to user's payment verification requests in Firestore
    const q = query(
      collection(db, 'paymentRequests'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PaymentRequest[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as PaymentRequest);
      });
      // Sort client-side by submittedAt descending
      items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setPaymentRequests(items);
      setLoadingHistory(false);
    }, (err) => {
      console.error("Error fetching payment requests:", err);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border-2 border-red-600/40 text-red-400 flex items-center justify-center mx-auto shadow-xl shadow-red-950/60">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">MY SEIJO58 ACCOUNT</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log in with Google or Email to view your active VIP status, enter activation codes, and review payment requests.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-lg shadow-red-950 transition-transform active:scale-95"
        >
          Sign In / Create Free Account
        </button>
      </div>
    );
  }

  // Calculate days remaining
  let daysRemaining: number | null = null;
  if (userProfile?.premiumExpiresAt) {
    const diffTime = new Date(userProfile.premiumExpiresAt).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const whatsappSupport = '+255 764 220 155';
  const whatsappClean = '255764220155';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-100">
      
      {/* Account Header Banner */}
      <div className="bg-gradient-to-r from-[#0d162d] via-[#101e4a] to-[#250d18] border-2 border-red-600/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-950/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          {/* Avatar */}
          <div className="relative">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-2xl text-amber-400">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
            )}
            {isPremiumActive && (
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {userProfile?.name || 'Seijo Member'}
              </h2>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{userProfile?.email}</p>
            <p className="text-[11px] text-slate-500">
              Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '2026'}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-950 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          )}

          <button
            onClick={() => logout()}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Account Membership</span>
            <div className="flex items-center gap-2 mt-1">
              {isPremiumActive ? (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-amber-500/20 border border-amber-500/50 text-amber-300 font-black px-3 py-1.5 rounded-xl text-sm">
                  <Crown className="w-4 h-4 fill-amber-400 animate-pulse" />
                  <span>⭐ PREMIUM MEMBER</span>
                </div>
              ) : userProfile?.activationStatus === 'EXPIRED' ? (
                <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-500/50 text-red-300 font-black px-3 py-1.5 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>⭐ PREMIUM EXPIRED</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl text-sm">
                  <span>🔒 FREE ACCOUNT</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenActivationModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-transform active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Enter Activation Code</span>
            </button>

            <button
              onClick={onOpenPayment}
              className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-950/50 transition-transform active:scale-95"
            >
              <Crown className="w-4 h-4" />
              <span>{isPremiumActive ? 'Extend / Renew' : 'Unlock Premium'}</span>
            </button>
          </div>
        </div>

        {/* Subscription Meta Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Plan</span>
            <div className="font-extrabold text-sm text-white">
              {isPremiumActive ? (userProfile?.premiumPlanName || 'VIP Club Pass') : 'Free Predictions Tier'}
            </div>
            <p className="text-[10px] text-slate-400">
              {isPremiumActive ? 'Unlimited VIP predictions unlocked' : 'Limited to free daily banker signals'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Activation Date</span>
            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {userProfile?.premiumActivatedAt 
                  ? new Date(userProfile.premiumActivatedAt).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Date granted by Admin / Code</p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Expiry Date & Time</span>
            <div className="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {userProfile?.premiumExpiresAt
                  ? new Date(userProfile.premiumExpiresAt).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {daysRemaining !== null && isPremiumActive
                ? `${daysRemaining} days remaining on your VIP access`
                : 'No active countdown'}
            </p>
          </div>
        </div>
      </div>

      {/* Submitted Payment Requests History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>My Payment Verification Requests</span>
            </h3>
            <p className="text-xs text-slate-400">
              Track the status of your submitted Mobile Money transaction references.
            </p>
          </div>
        </div>

        {loadingHistory ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading requests...</div>
        ) : paymentRequests.length === 0 ? (
          <div className="py-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">No payment verification requests submitted yet.</p>
            <button
              onClick={onOpenPayment}
              className="text-xs text-amber-400 font-bold hover:underline"
            >
              Submit a payment reference now →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{req.planName}</span>
                    <span className="text-slate-400">({req.amount.toLocaleString()} {req.currency})</span>
                  </div>
                  <div className="font-mono text-slate-300 text-[11px]">
                    Ref: <strong className="text-amber-300">{req.transactionRef}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Submitted: {new Date(req.submittedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5">
                  {req.status === 'pending' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                  {req.status === 'approved' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </span>
                  )}

                  {req.generatedCode && (
                    <div className="text-[11px] bg-slate-900 border border-amber-500/30 px-2 py-0.5 rounded text-amber-300 font-mono font-bold">
                      Code: {req.generatedCode}
                    </div>
                  )}

                  {req.adminNote && (
                    <div className="text-[10px] text-slate-400 max-w-xs text-right">
                      Note: {req.adminNote}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white">Need Support or Code Inquiries?</div>
            <p className="text-xs text-slate-400">Our official WhatsApp customer desk is active 24/7 ({whatsappSupport})</p>
          </div>
        </div>

        <a
          href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent('Hello SEIJO58 Support, I need assistance with my account / activation code.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>

    </div>
  );
};
