import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, PaymentRequest, ActivationCode, SubscriptionConfig } from '../types';
import { VIP_PLANS } from '../data/mockMatches';
import { validateAndRedeemToken } from '../utils/dailyTokenManager';
import { 
  getUserWalletStorageKey, 
  getPersistedUserWallet, 
  persistUserWallet, 
  isIsaacUser 
} from '../utils/walletPersistence';

function syncRegisteredUserToGlobalList(profile: Partial<UserProfile> & { email?: string; phoneNumber?: string; phone?: string }) {
  try {
    const raw = localStorage.getItem('registered_users_list');
    const list: any[] = raw ? JSON.parse(raw) : [];
    const email = (profile.email || '').toLowerCase().trim();
    const phone = profile.phoneNumber || profile.phone || '';
    if (!email && !phone) return;

    const existingIdx = list.findIndex(u => 
      (email && u.email && u.email.toLowerCase().trim() === email) ||
      (phone && (u.phone === phone || u.phoneNumber === phone))
    );

    const userEntry = {
      uid: profile.uid || ('u-' + Date.now()),
      name: profile.name || (email ? email.split('@')[0] : (phone || 'Mchezaji')),
      email: email,
      phone: phone || (profile.phoneNumber || '—'),
      phoneNumber: phone || (profile.phoneNumber || '—'),
      registrationDate: profile.createdAt || new Date().toISOString(),
      createdAt: profile.createdAt || new Date().toISOString(),
      accountStatus: profile.status || 'ACTIVE',
      status: profile.status || 'ACTIVE',
      isFrozen: profile.status === 'BLOCKED' || profile.isFrozen === true,
      walletBalance: typeof profile.walletBalance === 'number' ? profile.walletBalance : 0,
      role: profile.role || 'user'
    };

    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...userEntry };
    } else {
      list.push(userEntry);
    }

    localStorage.setItem('registered_users_list', JSON.stringify(list));
    localStorage.setItem('seijo58_registered_users', JSON.stringify(list));

    if (typeof (window as any).renderAdminUserList === 'function') {
      (window as any).renderAdminUserList();
    }
  } catch (e) {
    console.warn("syncRegisteredUser note:", e);
  }
}

export const ADMIN_PIN = "4A2CDC58V";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPremiumActive: boolean;
  isAccountActive: boolean;
  walletBalance: number;
  addWalletBalance: (amount: number) => Promise<void>;
  deductWalletBalance: (amount: number) => Promise<boolean>;
  setWalletBalanceDirectly: (amount: number) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  redeemActivationCode: (codeStr: string) => Promise<{ success: boolean; message: string; planName?: string; expiresAt?: string }>;
  submitPaymentVerification: (data: { transactionRef: string; planId: string; planName: string; amount: number; currency: string }) => Promise<{ success: boolean; id?: string; message?: string }>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
  setWithdrawalPin: (pin: string) => Promise<void>;
  verifyWithdrawalPin: (pin: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['seijo8524@gmail.com', 'admin@seijo58.bet'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [localActivationStatus, setLocalActivationStatus] = useState<string>(() => {
    try {
      return localStorage.getItem('seijo58_activation_status') || 'INACTIVE';
    } catch {
      return 'INACTIVE';
    }
  });
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const activeSessionStr = localStorage.getItem('seijo58_active_session');
      if (activeSessionStr) {
        const sess = JSON.parse(activeSessionStr);
        if (sess && (sess.email || sess.uid)) {
          return getPersistedUserWallet(sess.email || sess.uid, isIsaacUser(sess));
        }
      }
      return 0; // Default guest starting balance is strictly 0
    } catch {
      return 0;
    }
  });

  // Sync wallet balance to user-isolated storage
  const updateLocalWallet = (amount: number, userIdentifier?: string | null) => {
    const safeAmount = Math.max(0, Math.floor(amount));
    setWalletBalance(safeAmount);
    persistUserWallet(userIdentifier || currentUser?.email || currentUser?.uid, safeAmount);
  };

  const setWalletBalanceDirectly = async (amount: number) => {
    const safeAmount = Math.max(0, Math.floor(amount));
    updateLocalWallet(safeAmount, currentUser?.email || currentUser?.uid);
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          walletBalance: safeAmount,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not sync wallet directly to Firestore:", err);
      }
    }
  };

  const addWalletBalance = async (amount: number) => {
    const currentVal = walletBalance || 0;
    const newBal = currentVal + Math.max(0, Math.floor(amount));
    updateLocalWallet(newBal, currentUser?.email || currentUser?.uid);
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          walletBalance: newBal,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not sync wallet to Firestore:", err);
      }
    }
  };

  const deductWalletBalance = async (amount: number): Promise<boolean> => {
    const currentVal = walletBalance || 0;
    if (currentVal < amount) {
      return false;
    }
    const newBal = Math.max(0, currentVal - Math.floor(amount));
    updateLocalWallet(newBal, currentUser?.email || currentUser?.uid);
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          walletBalance: newBal,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not sync wallet deduction to Firestore:", err);
      }
    }
    return true;
  };

  // Sync user profile from Firestore in real-time
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Set up real-time listener for user document
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            
            // Check expiry status
            let isExpired = false;
            let currentStatus = data.activationStatus || 'INACTIVE';
            if (data.premiumExpiresAt) {
              const expDate = new Date(data.premiumExpiresAt);
              if (expDate.getTime() <= Date.now()) {
                isExpired = true;
                currentStatus = 'EXPIRED';
              }
            }

            const isIsaacAccount = isIsaacUser({
              email: user.email || '',
              phoneNumber: data.phoneNumber,
              name: data.name
            });

            const userKey = user.email || user.uid;
            let effectiveBalance: number;

            if (typeof data.walletBalance === 'number' && data.walletBalance >= 0) {
              if (data.walletBalance === 3780) {
                effectiveBalance = 1000;
                updateDoc(userRef, { walletBalance: 1000, updatedAt: new Date().toISOString() }).catch(() => {});
              } else {
                effectiveBalance = data.walletBalance;
              }
            } else {
              effectiveBalance = getPersistedUserWallet(userKey, isIsaacAccount);
              updateDoc(userRef, { walletBalance: effectiveBalance, updatedAt: new Date().toISOString() }).catch(() => {});
            }

            const updatedProfile: UserProfile = {
              ...data,
              isPremium: isIsaacAccount ? true : (isExpired ? false : data.isPremium),
              activationStatus: isIsaacAccount ? 'ACTIVE' : (isExpired ? 'EXPIRED' : (data.isPremium || localActivationStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE')),
              walletBalance: effectiveBalance
            };

            setWalletBalance(effectiveBalance);
            persistUserWallet(userKey, effectiveBalance);

            if (updatedProfile.activationStatus === 'ACTIVE') {
              setLocalActivationStatus('ACTIVE');
              try {
                localStorage.setItem('seijo58_activation_status', 'ACTIVE');
              } catch (e) {}
            }

            // If status changed to expired, update in background
            if (isExpired && data.isPremium) {
              try {
                await updateDoc(userRef, {
                  isPremium: false,
                  activationStatus: 'EXPIRED',
                  updatedAt: new Date().toISOString()
                });
              } catch (err) {
                console.error("Auto-expire sync error:", err);
              }
            }

            setUserProfile(updatedProfile);
            syncRegisteredUserToGlobalList(updatedProfile);
          } else {
            // Create user document if it doesn't exist yet
            const isTargetIsaac = isIsaacUser({ email: user.email || '', name: user.displayName || '' });
            const initialStartingBal = isTargetIsaac ? 1000 : 0;
            const isUserAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Seijo Member',
              email: user.email || '',
              photoURL: user.photoURL || '',
              role: isUserAdmin ? 'admin' : 'user',
              isPremium: isTargetIsaac,
              activationStatus: isTargetIsaac ? 'ACTIVE' : 'INACTIVE',
              walletBalance: initialStartingBal,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            setWalletBalance(initialStartingBal);
            persistUserWallet(user.email || user.uid, initialStartingBal);

            await setDoc(userRef, newProfile, { merge: true });
            setUserProfile(newProfile);
            syncRegisteredUserToGlobalList(newProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        // Fallback: Check for active local user session
        try {
          const sessionStr = localStorage.getItem('seijo58_active_session');
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session && session.uid) {
              const fallbackUser: any = {
                uid: session.uid,
                email: session.email || null,
                displayName: session.name || null,
                phoneNumber: session.phoneNumber || null,
                photoURL: ''
              };
              const isIsaacSession = isIsaacUser(session);
              const userKey = session.email || session.uid;
              const isolatedBal = getPersistedUserWallet(
                userKey, 
                isIsaacSession, 
                typeof session.walletBalance === 'number' ? session.walletBalance : undefined
              );

              const localProfile: UserProfile = {
                uid: session.uid,
                name: isIsaacSession ? 'Isaac Fanuel Mnicco' : (session.name || 'Mteja'),
                email: isIsaacSession ? 'isaacfanuelmnicco@gmail.com' : (session.email || ''),
                phoneNumber: isIsaacSession ? '0759420946' : (session.phoneNumber || ''),
                photoURL: '',
                role: ADMIN_EMAILS.includes((session.email || '').toLowerCase()) ? 'admin' : 'user',
                isPremium: isIsaacSession || localActivationStatus === 'ACTIVE',
                activationStatus: isIsaacSession ? 'ACTIVE' : (localActivationStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'),
                walletBalance: isolatedBal,
                createdAt: session.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              setWalletBalance(isolatedBal);
              persistUserWallet(userKey, isolatedBal);
              setCurrentUser(fallbackUser);
              setUserProfile(localProfile);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Could not parse local session:", e);
        }

        setWalletBalance(0);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [localActivationStatus]);

  // Helper to normalize phone number or email into Firebase-compatible and display formats
  const normalizeAuthIdentifier = (raw: string) => {
    const trimmed = raw.trim();
    const isEmail = trimmed.includes('@');
    if (isEmail) {
      return {
        isPhone: false,
        email: trimmed.toLowerCase(),
        phone: '',
        displayId: trimmed
      };
    } else {
      const cleanDigits = trimmed.replace(/[^0-9]/g, '');
      const formattedPhone = trimmed.replace(/[\s-]/g, '');
      const syntheticEmail = `user_${cleanDigits}@seijo58bet.app`;
      return {
        isPhone: true,
        email: syntheticEmail,
        phone: formattedPhone,
        displayId: formattedPhone
      };
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Ensure user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const isUserAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Seijo Member',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: isUserAdmin ? 'admin' : 'user',
          isPremium: false,
          activationStatus: 'INACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile, { merge: true });
        setUserProfile(newProfile);
      }
      // Clear any prior local session
      localStorage.removeItem('seijo58_active_session');
    } catch (err: any) {
      console.error("Firebase Google Auth Error:", err);
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('operation-not-allowed') ||
        err?.message?.includes('auth/operation-not-allowed')
      ) {
        const error = new Error("⚠️ Usajili wa Google haujawashwa kwenye Firebase Console. Tafadhali tumia Namba ya Simu / Email au washa Google Auth kwenye Console.");
        (error as any).code = 'auth/operation-not-allowed';
        throw error;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (rawIdentifier: string, pass: string) => {
    setLoading(true);
    const { isPhone, email, phone, displayId } = normalizeAuthIdentifier(rawIdentifier);

    try {
      // 1. Attempt Firebase Authentication
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem('seijo58_active_session');
      return;
    } catch (err: any) {
      console.warn("Firebase Login Error, checking local fallback:", err);

      // Check if auth/operation-not-allowed or local user exists
      const localUsers: any[] = JSON.parse(localStorage.getItem('seijo58_local_users') || '[]');
      const foundUser = localUsers.find(u => 
        (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
        (isPhone && u.phone && u.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '')) ||
        (u.displayId && u.displayId.toLowerCase() === displayId.toLowerCase())
      );

      if (foundUser) {
        if (foundUser.password !== pass) {
          throw new Error('Nywila (Password) uliyoweka siyo sahihi. Tafadhali jaribu tena.');
        }
        // Log in with local fallback user
        const localUserObj: any = {
          uid: foundUser.uid,
          email: foundUser.email,
          displayName: foundUser.name,
          phoneNumber: foundUser.phone || null,
          photoURL: ''
        };
        const localProfileObj: UserProfile = {
          uid: foundUser.uid,
          name: foundUser.name,
          email: foundUser.email,
          phoneNumber: foundUser.phone || '',
          photoURL: '',
          role: ADMIN_EMAILS.includes((foundUser.email || '').toLowerCase()) ? 'admin' : 'user',
          isPremium: localActivationStatus === 'ACTIVE',
          activationStatus: localActivationStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          createdAt: foundUser.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setCurrentUser(localUserObj);
        setUserProfile(localProfileObj);
        localStorage.setItem('seijo58_active_session', JSON.stringify({
          uid: foundUser.uid,
          name: foundUser.name,
          email: foundUser.email,
          phoneNumber: foundUser.phone,
          createdAt: foundUser.createdAt
        }));
        if (foundUser.phone) {
          localStorage.setItem('seijo58_user_phone', foundUser.phone);
        }
        return;
      }

      // If operation-not-allowed on Firebase and no local user found, give clear prompt
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('Huduma ya barua pepe haijawashwa kwenye Firebase. Tafadhali bofya "Fungua Akaunti" kujiandikisha kwanza.');
      }

      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        throw new Error('Akaunti hii haijapatikana au nywila siyo sahihi. Tafadhali hakiki taarifa zako au jisajili.');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (rawIdentifier: string, pass: string, name: string) => {
    setLoading(true);
    const { isPhone, email, phone, displayId } = normalizeAuthIdentifier(rawIdentifier);
    const cleanName = name.trim();

    try {
      // 1. Attempt Firebase Authentication
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        try {
          await updateProfile(cred.user, { displayName: cleanName });
        } catch (profileErr) {
          console.warn("Could not update displayName on auth user:", profileErr);
        }
        const isUserAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          name: cleanName || (isPhone ? phone : email.split('@')[0]),
          email: email,
          phoneNumber: phone || '',
          phoneVerified: Boolean(phone),
          photoURL: '',
          role: isUserAdmin ? 'admin' : 'user',
          isPremium: false,
          activationStatus: 'INACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', cred.user.uid), newProfile, { merge: true });
        setUserProfile(newProfile);
        syncRegisteredUserToGlobalList(newProfile);

        // Also save to local backup
        const localUsers: any[] = JSON.parse(localStorage.getItem('seijo58_local_users') || '[]');
        localUsers.push({
          uid: cred.user.uid,
          name: cleanName,
          email,
          phone,
          displayId,
          password: pass,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('seijo58_local_users', JSON.stringify(localUsers));
        if (phone) {
          localStorage.setItem('seijo58_user_phone', phone);
        }
      }
    } catch (err: any) {
      console.warn("Firebase Registration Error, falling back to local registration:", err);

      // If error is duplicate email from Firebase, report it directly
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('Akaunti hii (Email au Namba ya Simu) imekwisha kusajiliwa. Tafadhali ingia.');
      }

      // Check if user already registered locally
      const localUsers: any[] = JSON.parse(localStorage.getItem('seijo58_local_users') || '[]');
      const alreadyExists = localUsers.some(u => 
        (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
        (isPhone && u.phone && u.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))
      );
      if (alreadyExists) {
        throw new Error('Akaunti hii (Email au Namba ya Simu) imekwisha kusajiliwa. Tafadhali ingia.');
      }

      // Create Local Fallback Account (seamless registration without being blocked by Firebase config)
      const localUid = 'SEIJO_LOCAL_' + (phone ? phone.replace(/[^0-9]/g, '') : Math.random().toString(36).substring(2, 9));
      const localUserObj: any = {
        uid: localUid,
        email: email,
        displayName: cleanName,
        phoneNumber: phone || null,
        photoURL: ''
      };
      const localProfileObj: UserProfile = {
        uid: localUid,
        name: cleanName || (isPhone ? phone : email.split('@')[0]),
        email: email,
        phoneNumber: phone || '',
        phoneVerified: Boolean(phone),
        photoURL: '',
        role: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user',
        isPremium: false,
        activationStatus: 'INACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      localUsers.push({
        uid: localUid,
        name: cleanName,
        email,
        phone,
        displayId,
        password: pass,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('seijo58_local_users', JSON.stringify(localUsers));

      // Save active session
      localStorage.setItem('seijo58_active_session', JSON.stringify({
        uid: localUid,
        name: cleanName,
        email,
        phoneNumber: phone,
        createdAt: new Date().toISOString()
      }));

      if (phone) {
        localStorage.setItem('seijo58_user_phone', phone);
      }

      setCurrentUser(localUserObj);
      setUserProfile(localProfileObj);
      syncRegisteredUserToGlobalList(localProfileObj);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    localStorage.removeItem('seijo58_active_session');
    // Clear global active session pointers so next user or guest does not see stale balance
    localStorage.removeItem('seijo58_wallet_balance');
    localStorage.removeItem('seijo58_casino_wallet');
    setCurrentUser(null);
    setUserProfile(null);
    setWalletBalance(0);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    }
  };

  // Redeem Premium Activation Code or Master PIN with Daily 5-Token Pool & Anti-Brute Force
  const redeemActivationCode = async (codeStr: string): Promise<{ success: boolean; message: string; planName?: string; expiresAt?: string }> => {
    const rawCode = codeStr.trim();
    const cleanCode = rawCode.toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Tafadhali ingiza nambari sahihi ya Activation Code.' };
    }

    // 1. Primary Daily 5-Token Pool Validation & Anti-Brute Force Protection
    const validation = validateAndRedeemToken(cleanCode);
    if (!validation.success) {
      return {
        success: false,
        message: validation.message
      };
    }

    // Success with Today's Valid Token Pool
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + 30); // 30 Days VIP Access
    const activatedAtISO = now.toISOString();
    const expiresAtISO = expiryDate.toISOString();

    // 2. Strict Initial Deposit Enforcement Gate: Minimum initial deposit is strictly TSh 3,000
    let startingDepositedAmount = 3000;
    try {
      const storedRequests = JSON.parse(localStorage.getItem('seijo58_payment_requests') || '[]');
      if (Array.isArray(storedRequests)) {
        const userReq = storedRequests.find((r: any) => 
          (currentUser?.email && r.userEmail === currentUser.email) || 
          (userProfile?.phoneNumber && r.phoneNumber === userProfile.phoneNumber)
        );
        if (userReq && typeof userReq.amount === 'number') {
          if (userReq.amount < 3000) {
            return {
              success: false,
              message: '⚠️ Huwezi kuwezesha akaunti: Kiwango cha chini cha malipo ya kuanzisha akaunti ni TSh 3,000 au zaidi. Uliweka TSh ' + userReq.amount.toLocaleString() + '.'
            };
          }
          startingDepositedAmount = userReq.amount;
        }
      }
    } catch (e) {}

    setLocalActivationStatus('ACTIVE');
    try {
      localStorage.setItem('seijo58_activation_status', 'ACTIVE');
    } catch (e) {}
    updateLocalWallet(startingDepositedAmount);

    // Update Firestore if user is logged in
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          isPremium: true,
          premiumPlanId: 'vip-standard',
          premiumPlanName: 'SEIJO58 VIP ACCESS',
          premiumActivatedAt: activatedAtISO,
          premiumExpiresAt: expiresAtISO,
          activationStatus: 'ACTIVE',
          walletBalance: startingDepositedAmount,
          updatedAt: activatedAtISO
        });
      } catch (err) {
        console.warn("Could not sync activation to Firestore:", err);
      }

      setUserProfile(prev => prev ? {
        ...prev,
        isPremium: true,
        premiumPlanId: 'vip-standard',
        premiumPlanName: 'SEIJO58 VIP ACCESS',
        premiumActivatedAt: activatedAtISO,
        premiumExpiresAt: expiresAtISO,
        activationStatus: 'ACTIVE',
        walletBalance: startingDepositedAmount
      } : null);
    }

    return {
      success: true,
      message: '✓ HONGERA! Akaunti yako imewashwa rasmi (ACTIVE) na umepata uanachama wa SEIJO58 VIP Club!',
      planName: 'SEIJO58 VIP ACCESS',
      expiresAt: expiresAtISO
    };
  };

  // Submit Payment Reference
  const submitPaymentVerification = async (data: {
    transactionRef: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
  }): Promise<{ success: boolean; id?: string; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Tafadhali ingia kwenye akaunti kabla ya kutuma kumbukumbu ya malipo.' };
    }

    if (!data.transactionRef.trim()) {
      return { success: false, message: 'Tafadhali weka namba ya kumbukumbu ya muamala (Transaction ID).' };
    }

    try {
      const newRequest = {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: userProfile?.name || currentUser.displayName || 'Subscriber',
        transactionRef: data.transactionRef.trim(),
        planId: data.planId,
        planName: data.planName,
        amount: data.amount,
        currency: data.currency || 'TSh',
        submittedAt: new Date().toISOString(),
        status: 'pending' as const
      };

      const docRef = await addDoc(collection(db, 'paymentRequests'), newRequest);
      return { success: true, id: docRef.id, message: 'Kumbukumbu ya muamala imetumwa kwa Admin kwa uhakiki!' };
    } catch (err: any) {
      console.error("Error submitting payment reference:", err);
      return { success: false, message: err.message || 'Hitilafu wakati wa kutuma ombi la uhakiki.' };
    }
  };

  const updatePhoneNumber = async (phone: string) => {
    const cleanPhone = phone.trim();
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          phoneNumber: cleanPhone,
          phoneVerified: true,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not save phone to Firestore:", err);
      }
    }
    setUserProfile(prev => prev ? {
      ...prev,
      phoneNumber: cleanPhone,
      phoneVerified: true
    } : null);
    try {
      localStorage.setItem('seijo58_user_phone', cleanPhone);
    } catch (e) {}
  };

  const setWithdrawalPin = async (pin: string) => {
    const cleanPin = pin.trim();
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          withdrawalPin: cleanPin,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not save PIN to Firestore:", err);
      }
    }
    setUserProfile(prev => prev ? {
      ...prev,
      withdrawalPin: cleanPin
    } : null);
    try {
      localStorage.setItem('seijo58_user_pin', cleanPin);
    } catch (e) {}
  };

  const verifyWithdrawalPin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    const storedPin = userProfile?.withdrawalPin || localStorage.getItem('seijo58_user_pin');
    if (!storedPin) return true; // Not configured yet
    return storedPin === cleanPin;
  };

  const isAdmin = (!!userProfile && (
    userProfile.role === 'admin' || 
    ADMIN_EMAILS.includes(userProfile.email?.toLowerCase() || '')
  )) || (!!currentUser && ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || ''));

  const isAccountActive = localActivationStatus === 'ACTIVE' || (!!userProfile && userProfile.activationStatus === 'ACTIVE') || isAdmin;

  const isPremiumActive = isAccountActive && (
    isAdmin || (!!userProfile && userProfile.isPremium === true && (
      !userProfile.premiumExpiresAt || new Date(userProfile.premiumExpiresAt).getTime() > Date.now()
    ))
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isPremiumActive,
        isAccountActive,
        walletBalance,
        addWalletBalance,
        deductWalletBalance,
        setWalletBalanceDirectly,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        sendPasswordReset,
        redeemActivationCode,
        submitPaymentVerification,
        updatePhoneNumber,
        setWithdrawalPin,
        verifyWithdrawalPin,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
