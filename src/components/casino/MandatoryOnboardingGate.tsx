import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  MessageCircle, 
  LogOut, 
  ArrowRight,
  Sparkles,
  Zap,
  Mail,
  User as UserIcon,
  CreditCard,
  FileText
} from 'lucide-react';
import { PostRegistrationPaymentModal, UserPaymentRequest } from './PostRegistrationPaymentModal';

interface GateProps {
  onActivated: () => void;
  showToast: (msg: string) => void;
}

export const MandatoryOnboardingGate: React.FC<GateProps> = ({ onActivated, showToast }) => {
  const { 
    currentUser, 
    userProfile, 
    isAdmin, 
    isAccountActive, 
    loginWithGoogle, 
    loginWithEmail,
    registerWithEmail,
    updatePhoneNumber, 
    redeemActivationCode, 
    submitPaymentVerification,
    logout 
  } = useAuth();

  // Mode tabs for authentication
  const [authMode, setAuthMode] = useState<'google' | 'email_login' | 'email_register'>('google');
  const [credentialType, setCredentialType] = useState<'phone' | 'email'>('phone');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone number step
  const [inputPhone, setInputPhone] = useState(userProfile?.phoneNumber || '');
  const [phoneError, setPhoneError] = useState('');

  // Activation code step
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Manual payment transaction submission
  const [transactionRef, setTransactionRef] = useState('');
  const [selectedPlanAmount, setSelectedPlanAmount] = useState<number | 'custom'>(1000);
  const [customTierAmount, setCustomTierAmount] = useState<string>('1000');
  const [paymentPhoneInput, setPaymentPhoneInput] = useState<string>('');
  const [txSubmittedMsg, setTxSubmittedMsg] = useState('');
  const [submittingTx, setSubmittingTx] = useState(false);
  const [step3Error, setStep3Error] = useState('');

  // Post-Registration Payment Modal State
  const [showPostRegPaymentModal, setShowPostRegPaymentModal] = useState(false);

  // Loading and generic errors
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDirectCodeInput, setShowDirectCodeInput] = useState(false);

  // If already active or admin, no gate needed
  if (isAccountActive || isAdmin) {
    return null;
  }

  const handleCopyPaymentNumber = () => {
    navigator.clipboard.writeText('+255764220155');
    setCopiedNumber(true);
    showToast('✓ Namba ya Malipo +255 764 220 155 imenakiliwa!');
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  // STEP 1: Google One-Click Login
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      showToast('✓ Umefanikiwa kuingia na akaunti ya Google!');
      setShowPostRegPaymentModal(true);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      const isNotAllowed = 
        err?.code === 'auth/operation-not-allowed' || 
        err?.message?.includes('operation-not-allowed') ||
        err?.message?.includes('auth/operation-not-allowed');

      if (isNotAllowed) {
        const errorMsg = "⚠️ Usajili wa Google haujawashwa kwenye Firebase Console. Tafadhali tumia Namba ya Simu / Email au washa Google Auth kwenye Console.";
        setAuthError(errorMsg);
        showToast(errorMsg);
      } else {
        setAuthError(err?.message || 'Haikuweza kuingia na Google. Tafadhali jaribu tena au tumia Namba ya Simu / Barua Pepe.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Fallback Phone / Email Login / Register
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const targetIdentifier = credentialType === 'phone' ? phoneNumberInput.trim() : email.trim();

      if (credentialType === 'phone') {
        const cleanDigits = targetIdentifier.replace(/[^0-9]/g, '');
        if (cleanDigits.length < 9) {
          throw new Error('Tafadhali weka namba sahihi ya simu ya Tanzania (mfano: 0764XXXXXX au 255764XXXXXX).');
        }
      } else {
        if (!targetIdentifier || !targetIdentifier.includes('@')) {
          throw new Error('Tafadhali weka barua pepe (email) sahihi.');
        }
      }

      if (authMode === 'email_login') {
        if (!targetIdentifier || !password) throw new Error('Weka namba ya simu / barua pepe na nywila yako.');
        await loginWithEmail(targetIdentifier, password);
        showToast('✓ Umefanikiwa kuingia!');
      } else if (authMode === 'email_register') {
        if (!targetIdentifier || !password || !name.trim()) throw new Error('Jaza taarifa zote kikamilifu.');
        if (password.length < 6) throw new Error('Nywila inapaswa kuwa na herufi angalau 6.');
        await registerWithEmail(targetIdentifier, password, name);
        showToast('✓ Akaunti imefunguliwa kikamilifu!');
        setShowPostRegPaymentModal(true);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Hitilafu wakati wa kuthibitisha.');
    } finally {
      setAuthLoading(false);
    }
  };

  // STEP 2: Phone Number Validation & Binding
  const handleSavePhoneNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    const clean = inputPhone.trim().replace(/[\s-]/g, '');
    const digitsOnly = clean.replace(/[^0-9]/g, '');

    if (digitsOnly.length < 9 || digitsOnly.length > 13) {
      setPhoneError('Tafadhali weka namba sahihi ya simu ya Tanzania (mfano: 0764220155 au +255764220155).');
      return;
    }

    try {
      await updatePhoneNumber(clean);
      showToast('✓ Namba ya simu imehifadhiwa kikamilifu!');
    } catch (err: any) {
      setPhoneError('Haikuweza kuhifadhi namba ya simu. Jaribu tena.');
    }
  };

  // STEP 3: Redeem Activation Code from Admin
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError('');
    if (!activationCode.trim()) {
      setActivationError('Tafadhali weka Activation Code uliyopokea kutoka kwa Admin.');
      return;
    }

    setIsActivating(true);
    try {
      const res = await redeemActivationCode(activationCode);
      if (res.success) {
        showToast('🎉 HONGERA! Akaunti yako imewashwa rasmi! Furahia SEIJO58 BET.');
        onActivated();
      } else {
        setActivationError(res.message || 'Nambari ya code siyo sahihi au imekwisha muda wake.');
      }
    } catch (err: any) {
      setActivationError(err?.message || 'Hitilafu ya uhakiki wa code.');
    } finally {
      setIsActivating(false);
    }
  };

  const currentStep3Amount = selectedPlanAmount === 'custom'
    ? Math.max(1000, Number(customTierAmount) || 1000)
    : selectedPlanAmount;

  // STEP 3: Submit Payment Verification & Code Request to Admin
  const handleSubmitStep3Payment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep3Error('');
    setTxSubmittedMsg('');

    const phoneToUse = (paymentPhoneInput || userProfile?.phoneNumber || inputPhone || '').trim().replace(/[\s-]/g, '');
    const digitsOnly = phoneToUse.replace(/[^0-9]/g, '');

    if (digitsOnly.length < 9) {
      setStep3Error('Tafadhali weka namba sahihi ya simu uliyolipia.');
      return;
    }

    if (currentStep3Amount < 1000) {
      setStep3Error('Kiwango cha chini cha malipo ni TSh 1,000.');
      return;
    }

    if (!transactionRef.trim() || transactionRef.trim().length < 5) {
      setStep3Error('Tafadhali weka ujumbe (SMS) wa muamala wa malipo au namba ya muamala.');
      return;
    }

    setSubmittingTx(true);
    try {
      const userDisplayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Mteja Mpya';
      const userEmail = currentUser?.email || '';

      const newRequest: UserPaymentRequest = {
        id: 'REQ-' + Date.now(),
        phoneNumber: phoneToUse,
        amount: currentStep3Amount,
        smsText: transactionRef.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending',
        userName: userDisplayName,
        userEmail: userEmail
      };

      // 1. Save to localStorage
      try {
        const existing: UserPaymentRequest[] = JSON.parse(
          localStorage.getItem('seijo58_payment_requests') || '[]'
        );
        existing.unshift(newRequest);
        localStorage.setItem('seijo58_payment_requests', JSON.stringify(existing));
      } catch (err) {
        console.error("Local storage error:", err);
      }

      // 2. Save user phone locally & in profile
      try {
        localStorage.setItem('seijo58_user_phone', phoneToUse);
        await updatePhoneNumber(phoneToUse);
      } catch (e) {}

      // 3. Sync to Firestore
      try {
        await submitPaymentVerification({
          transactionRef: transactionRef.trim().slice(0, 100),
          planId: currentStep3Amount >= 5000 ? 'vip-pro' : 'standard',
          planName: `Malipo TSh ${currentStep3Amount.toLocaleString()} - ${phoneToUse}`,
          amount: currentStep3Amount,
          currency: 'TSh'
        });
      } catch (e) {}

      // 4. Set exact confirmation message
      setTxSubmittedMsg("Ombi lako limepokelewa! Admin anahakiki muamala wako ili kukutumia Code ya kuwezesha akaunti.");
      showToast('✓ Ombi lako limetumwa kwa Admin!');
    } catch (err: any) {
      setStep3Error(err?.message || 'Hitilafu ya mtandao.');
    } finally {
      setSubmittingTx(false);
    }
  };

  // WhatsApp Pre-filled URL for Admin
  const userDisplayName = userProfile?.name || currentUser?.displayName || 'Mteja Mpya';
  const userContactPhone = userProfile?.phoneNumber || inputPhone || 'Haijawekwa';
  const userEmail = currentUser?.email || 'Akaunti ya Google';
  const whatsappAdminMessage = encodeURIComponent(
    `Habari Admin SEIJO58,\nNimekamilisha malipo ya kuwezesha akaunti yangu ya SEIJO58 BET.\n\n👤 Jina: ${userDisplayName}\n📧 Barua Pepe: ${userEmail}\n📱 Namba ya Simu: ${userContactPhone}\n💰 Kiasi Kilicholipwa: TSh ${selectedPlanAmount.toLocaleString()}\n\nTafadhali thibitisha malipo yangu na unitumie Activation Code ili akaunti yangu ianze kufanya kazi kikamilifu.`
  );
  const whatsappUrl = `https://wa.me/255764220155?text=${whatsappAdminMessage}`;

  // Determine current onboarding step:
  const isNeedsAuth = !currentUser;
  const isNeedsPhone = currentUser && (!userProfile?.phoneNumber || userProfile.phoneNumber.trim().length < 9);
  const isNeedsPayment = currentUser && !isNeedsPhone && !isAccountActive;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#05070d] border-2 border-red-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-red-950/90 text-white my-auto space-y-5">
        
        {/* TOP BRAND HEADER */}
        <div className="text-center space-y-1.5 pt-1 border-b border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-amber-500 p-0.5 mx-auto shadow-xl shadow-red-950 flex items-center justify-center">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <span className="font-teko text-3xl font-bold text-red-500">58</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center justify-center gap-2">
            SEIJO<span className="text-red-500">58</span> <span className="text-amber-400">BET</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium max-w-sm mx-auto">
            Jukwaa Rasmi la Kasino Mtandaoni Tanzania • Usajili, Nambari ya Simu na Malipo ya Lazima
          </p>

          {/* User Status Bar if Logged in */}
          {currentUser && (
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 mt-2 text-xs">
              <div className="flex items-center gap-2 truncate text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="truncate">{currentUser.displayName || currentUser.email}</span>
              </div>
              <button
                onClick={() => logout()}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold shrink-0 ml-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Badilisha
              </button>
            </div>
          )}
        </div>

        {/* STEP 1: FORCE REGISTRATION / GOOGLE SIGN-IN */}
        {isNeedsAuth && (
          <div className="space-y-4">
            <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 text-xs space-y-1 text-slate-200">
              <div className="font-black text-white flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-red-400" /> HATUA YA 1: USAJILI WA LAZIMA
              </div>
              <p>
                Kulingana na taratibu rasmi za usalama na udhibiti wa kasino mtandaoni, watumiaji wote lazima wajisajili kwa akaunti ya Google kabla ya kuingia kwenye jukwaa.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-900/40 border border-red-500 rounded-xl text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* PRIMARY: GOOGLE ONE-CLICK SIGN IN */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-3 shadow-xl active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{authLoading ? 'Inathibitisha...' : 'JISAJILI KWA AKAUNTI YA GOOGLE'}</span>
              </button>

              <div className="flex items-center gap-2 text-slate-500 text-[11px] py-1">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="font-bold text-slate-400">AU TUMIA NAMBA YA SIMU / EMAIL</span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              {/* Mode Toggle: Login vs Register */}
              <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('email_login'); setAuthError(null); }}
                  className={`py-1.5 rounded-lg transition-all ${authMode === 'google' || authMode === 'email_login' ? 'bg-red-600 text-white shadow' : 'text-slate-400'}`}
                >
                  Ingia
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('email_register'); setAuthError(null); }}
                  className={`py-1.5 rounded-lg transition-all ${authMode === 'email_register' ? 'bg-red-600 text-white shadow' : 'text-slate-400'}`}
                >
                  Fungua Akaunti (Jisajili)
                </button>
              </div>

              {/* Credential Selector: Phone vs Email */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCredentialType('phone')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    credentialType === 'phone'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Namba ya Simu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCredentialType('email')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    credentialType === 'email'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Barua Pepe (Email)</span>
                </button>
              </div>

              {/* Fallback Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
                {authMode === 'email_register' && (
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">Jina Kamili</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Mfano: John Juma"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {credentialType === 'phone' ? (
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1 mb-1">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Namba ya Simu (M-Pesa / Tigo Pesa / Airtel / Halo)</span>
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phoneNumberInput}
                        onChange={e => setPhoneNumberInput(e.target.value)}
                        placeholder="0764XXXXXX au 255764XXXXXX"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Inatumika kutuma Activation Code na kutoa/kuweka salio.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">Barua Pepe (Email)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="juma@gmail.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Nywila (Password)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{authMode === 'email_register' ? 'Kamilisha Usajili (Jisajili Sasa)' : 'Ingia kwenye Akaunti (Log In)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Direct Code / Admin Bypass on Step 1 */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setShowDirectCodeInput(!showDirectCodeInput)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  {showDirectCodeInput ? '✕ Funga sehemu ya kuingiza Code' : '🔑 Una Activation Code au PIN ya Admin tayari? Ingiza Hapa'}
                </button>
                {showDirectCodeInput && (
                  <form onSubmit={handleRedeemCode} className="mt-3 space-y-2 text-left bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-2xl">
                    <label className="text-[11px] font-bold text-amber-300 block">
                      Weka Activation Code au Master PIN (mfano: 4A2CDC58V):
                    </label>
                    {activationError && (
                      <div className="p-2 bg-red-950/80 border border-red-500/60 rounded-xl text-[11px] text-red-300">
                        {activationError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={activationCode}
                        onChange={e => setActivationCode(e.target.value.toUpperCase())}
                        placeholder="Ingiza Code / PIN..."
                        className="flex-1 bg-black border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-xs uppercase focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isActivating}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isActivating ? '...' : 'Washa'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MANDATORY PHONE NUMBER BINDING */}
        {isNeedsPhone && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-1 text-slate-200">
              <div className="font-black text-amber-400 flex items-center gap-1.5 text-sm">
                <Smartphone className="w-4 h-4" /> HATUA YA 2: THIBITISHA NAMBA YA SIMU
              </div>
              <p>
                Weka namba yako ya simu ya <strong>M-Pesa, Tigo Pesa, Airtel Money au Halopesa</strong>. Namba hii itatumika kupokea Activation Code kutoka kwa Admin na kulinda usalama wa kutoa na kuweka fedha.
              </p>
            </div>

            {phoneError && (
              <div className="p-3 bg-red-900/40 border border-red-500 rounded-xl text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{phoneError}</span>
              </div>
            )}

            <form onSubmit={handleSavePhoneNumber} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1.5">
                  Namba Yako ya Simu (Tanzania):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-mono font-bold text-xs">
                    🇹🇿 +255
                  </span>
                  <input
                    type="tel"
                    required
                    value={inputPhone}
                    onChange={e => setInputPhone(e.target.value)}
                    placeholder="764 220 155 au 0764220155"
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl pl-20 pr-4 py-3 text-sm text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Inakubali Vodacom M-Pesa, Tigo Pesa, Airtel Money na Halopesa
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 transition-all cursor-pointer"
              >
                <span>HIFADHI NA ENDELEA KWENYE MALIPO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: PAYMENT REQUIRED & ADMIN ACTIVATION CODE */}
        {isNeedsPayment && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500/20 via-red-500/10 to-transparent border border-amber-500/40 rounded-2xl p-4 text-xs space-y-1.5 text-slate-200">
              <div className="font-black text-amber-300 flex items-center gap-1.5 text-sm">
                <KeyRound className="w-4 h-4" /> HATUA YA 3: MALIPO NA ACTIVATION CODE KUTOKA KWA ADMIN
              </div>
              <p>
                Akaunti yako haijawashwa. Kulingana na kanuni za SEIJO58 BET, <strong>inahitajika malipo ya kuwezesha akaunti</strong> (kuanzia TSh 1,000) kabla ya kufungua michezo ya kasino na utoaji wa fedha.
              </p>
            </div>

            {/* PAYMENT INSTRUCTIONS BOX */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Namba ya Malipo ya Admin:</span>
                <span className="text-amber-400 font-bold">M-Pesa / Tigo Pesa / Airtel</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400">Tuma Malipo kwenda:</div>
                  <div className="font-mono font-black text-emerald-400 text-base sm:text-lg tracking-wider">
                    +255 764 220 155
                  </div>
                  <div className="text-[10px] text-slate-400">Jina la Akaunti: <strong className="text-white">SEIJO58</strong></div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPaymentNumber}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNumber ? 'Imenakiliwa' : 'Nakili Namba'}</span>
                </button>
              </div>

              {/* POST-REGISTRATION PAYMENT & CODE REQUEST FORM */}
              <form onSubmit={handleSubmitStep3Payment} className="space-y-3.5 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase">
                    1. Chagua Kiasi Ulicholipa (Kiwango cha Chini TSh 1,000):
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                    {[1000, 2000, 5000].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedPlanAmount(tier)}
                        className={`py-2 px-1 rounded-xl border font-bold text-center transition-all ${
                          selectedPlanAmount === tier
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {tier.toLocaleString()}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedPlanAmount('custom')}
                      className={`py-2 px-1 rounded-xl border font-bold text-center transition-all ${
                        selectedPlanAmount === 'custom'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {selectedPlanAmount === 'custom' && (
                    <div className="mt-2">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">TSh</span>
                        <input
                          type="number"
                          min="1000"
                          step="500"
                          value={customTierAmount}
                          onChange={(e) => setCustomTierAmount(e.target.value)}
                          placeholder="Mfano: 3000"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <span className="text-[10px] text-amber-400/90 mt-1 block">
                        * Kiwango cha chini ni TSh 1,000
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Phone Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1 uppercase">
                    2. Namba Uliyolipia (Payment Phone Number):
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={paymentPhoneInput}
                      onChange={(e) => setPaymentPhoneInput(e.target.value)}
                      placeholder="0764XXXXXX au 255764XXXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Transaction SMS / Reference */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1 uppercase">
                    3. SMS ya Muamala wa Malipo (Transaction SMS / Reference):
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={3}
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Weka SMS ya muamala uliyotumiwa na Vodacom M-Pesa / Tigo Pesa / Airtel Money baada ya kulipa..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {step3Error && (
                  <div className="p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{step3Error}</span>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{submittingTx ? 'Inatuma...' : 'TUMA OMBI LA CODE / SUBMIT FOR CODE'}</span>
                </button>

                {/* EXACT CONFIRMATION MESSAGE */}
                {txSubmittedMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-xs text-emerald-200 flex items-start gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{txSubmittedMsg}</span>
                  </div>
                )}
              </form>

              {/* 1-CLICK WHATSAPP ADMIN BUTTON */}
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/80 transition-all cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>POKEA ACTIVATION CODE KUTOKA KWA ADMIN (WHATSAPP)</span>
                </a>
              </div>

              <div className="text-center pt-1">
                <a
                  href="https://chat.whatsapp.com/HL87kuFZoeq2h2pHcYV8Qr?s=cl&p=a&mlu=0&ilr=4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Au Jiunge na Group Rasmi la Seijo58 Casino™ WhatsApp</span>
                </a>
              </div>
            </div>

            {/* ACTIVATION CODE REDEEM FORM */}
            <form onSubmit={handleRedeemCode} className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs text-white font-black block">
                INGIZA ACTIVATION CODE YA ADMIN (UKISHAIPOKEA):
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={activationCode}
                  onChange={e => setActivationCode(e.target.value.toUpperCase())}
                  placeholder="Mfano: SEIJO-XXXX-XXXX"
                  className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-center font-mono font-black text-base text-amber-400 uppercase tracking-widest focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isActivating}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isActivating ? 'Inawasha...' : 'WASHA'}</span>
                </button>
              </div>

              {activationError && (
                <div className="p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{activationError}</span>
                </div>
              )}
            </form>
          </div>
        )}

      </div>

      {/* POPUP MODAL IMMEDIATELY AFTER REGISTRATION */}
      <PostRegistrationPaymentModal
        isOpen={showPostRegPaymentModal}
        onClose={() => setShowPostRegPaymentModal(false)}
        onActivated={onActivated}
        showToast={showToast}
      />
    </div>
  );
};
