import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'login'
}) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; hint?: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseAuthError = (err: any): { message: string; code?: string; hint?: string } => {
    console.error("Firebase Authentication Error Details:", err);
    const code = err?.code || '';
    const rawMsg = err?.message || 'An unexpected error occurred.';

    switch (code) {
      case 'auth/operation-not-allowed':
        return {
          code,
          message: '⚠️ Usajili wa Google haujawashwa kwenye Firebase Console. Tafadhali tumia Namba ya Simu / Email au washa Google Auth kwenye Console.',
          hint: 'Tafadhali tumia fomu ya Namba ya Simu au Email hapo chini kujiandikisha au kuingia bila kukwama.'
        };
      case 'auth/unauthorized-domain':
        return {
          code,
          message: 'This domain is not authorized for OAuth/Google Sign-In.',
          hint: `To fix: Go to Firebase Console → Authentication → Settings → Authorized domains → Add '${window.location.hostname}'.`
        };
      case 'auth/email-already-in-use':
        return {
          code,
          message: 'This email address is already registered.',
          hint: 'Please switch to the "Sign In" tab above to log into your existing account.'
        };
      case 'auth/invalid-email':
        return {
          code,
          message: 'The email address format is invalid.',
          hint: 'Please check your email address and make sure it has no typos.'
        };
      case 'auth/weak-password':
        return {
          code,
          message: 'The password is too weak.',
          hint: 'Please enter a password with at least 6 characters.'
        };
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return {
          code,
          message: 'Invalid email or password.',
          hint: 'Please verify your credentials or click "Forgot password?" to reset.'
        };
      case 'auth/popup-closed-by-user':
        return {
          code,
          message: 'Google Sign-In was cancelled before completing.',
          hint: 'Click "Continue with Google" again to complete sign in.'
        };
      case 'auth/popup-blocked':
        return {
          code,
          message: 'The Google Sign-In popup was blocked by your browser.',
          hint: 'Please allow popups for this site in your browser settings.'
        };
      case 'auth/network-request-failed':
        return {
          code,
          message: 'Network connection error.',
          hint: 'Please verify your internet connection and try again.'
        };
      default:
        return {
          code: code || undefined,
          message: rawMsg,
          hint: code ? `Firebase Error Code: ${code}` : undefined
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) throw { message: 'Please fill in both email and password.' };
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!email.trim() || !password || !name.trim()) throw { message: 'Please fill in your name, email and password.' };
        if (password.length < 6) throw { code: 'auth/weak-password', message: 'Password must be at least 6 characters.' };
        await registerWithEmail(email, password, name);
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('seijo58-show-payment-modal'));
        }, 100);
      } else if (mode === 'forgot') {
        if (!email.trim()) throw { message: 'Please enter your registered email address.' };
        await sendPasswordReset(email.trim());
        setSuccessMsg('Password reset link sent to your email. Check your inbox or spam folder.');
      }
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      const isNotAllowed = 
        err?.code === 'auth/operation-not-allowed' || 
        err?.message?.includes('operation-not-allowed') ||
        err?.message?.includes('auth/operation-not-allowed');

      if (isNotAllowed) {
        setError({
          code: 'auth/operation-not-allowed',
          message: '⚠️ Usajili wa Google haujawashwa kwenye Firebase Console. Tafadhali tumia Namba ya Simu / Email au washa Google Auth kwenye Console.',
          hint: 'Tafadhali tumia Namba ya Simu au Barua Pepe kujiandikisha au kuingia moja kwa moja.'
        });
      } else {
        setError(parseAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#090d16] border-2 border-red-600/40 rounded-3xl p-6 shadow-2xl shadow-red-950/80 space-y-5 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 border border-red-400/40 flex items-center justify-center mx-auto shadow-lg shadow-red-950 font-teko text-2xl font-bold text-white">
            58
          </div>
          <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-wide">
            {mode === 'login' && 'LOGIN TO SEIJO58 BET'}
            {mode === 'register' && 'CREATE YOUR ACCOUNT'}
            {mode === 'forgot' && 'RESET YOUR PASSWORD'}
          </h3>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'Access VIP sports predictions & your account'}
            {mode === 'register' && 'Join SEIJO58 for elite sports predictions & analysis'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl transition-all ${mode === 'login' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl transition-all ${mode === 'register' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error / Success Banners */}
        {error && (
          <div className="p-3.5 bg-red-950/90 border border-red-500/60 rounded-2xl space-y-1.5 text-xs text-red-200 shadow-inner">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">{error.message}</p>
                {error.code && (
                  <span className="inline-block px-1.5 py-0.5 rounded bg-red-900/80 border border-red-700/60 font-mono text-[10px] text-red-300">
                    Code: {error.code}
                  </span>
                )}
                {error.hint && (
                  <p className="text-[11px] text-red-300/90 leading-relaxed pt-0.5">
                    💡 {error.hint}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google One-Click Login */}
        {mode !== 'forgot' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google / Gmail</span>
            </button>

            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <div className="flex-1 border-t border-slate-800"></div>
              <span>OR USE EMAIL</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Your Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">
              {mode === 'forgot' ? 'Barua Pepe (Email Address)' : 'Namba ya Simu au Email (Phone / Email)'}
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={mode === 'forgot' ? 'email' : 'text'}
                required
                placeholder={mode === 'forgot' ? 'name@example.com' : '0764XXXXXX au name@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[10px] text-red-400 hover:text-red-300 underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/80 active:scale-98 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Account'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        {mode === 'forgot' ? (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              ← Back to Sign In
            </button>
          </div>
        ) : (
          <div className="text-center text-[11px] text-slate-500 pt-1">
            Protected by Firebase Auth & 256-bit SSL Security.
          </div>
        )}

      </div>
    </div>
  );
};
