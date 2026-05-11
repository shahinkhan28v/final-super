import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, AdminRecord, AdminPermission } from '../types';
import { processReferralOnSignup, getAdminByEmail, updateUserDeviceInfo } from './dataService';
import { getDeviceInfo } from './deviceUtils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  adminRecord: AdminRecord | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const SUPER_ADMIN_EMAIL = 'shahinkhan28dd@gmail.com';

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }

        setUser(user);
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userRef);
          } catch (err) {
            console.error("Profile fetch error:", err);
            setLoading(false);
            return;
          }
          
          // Check admin status (only if user has email)
          if (user.email) {
            const adminRec = await getAdminByEmail(user.email);
            setAdminRecord(adminRec);

            const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
            const isAdmin = isSuperAdmin || !!adminRec;
            
            if (userDoc.exists()) {
              const currentData = userDoc.data() as UserProfile;
              const targetRole = isSuperAdmin ? 'super_admin' : (adminRec ? 'admin' : 'user');
              
              if ((isAdmin !== currentData.isAdmin) || currentData.role !== targetRole) {
                 const { updateDoc } = await import('firebase/firestore');
                 await updateDoc(userRef, { 
                   isAdmin: isAdmin, 
                   role: targetRole
                 });
              }
            }
          }
          
          if (!userDoc.exists()) {
            const pendingReferral = sessionStorage.getItem('referralCode');
            let referredById = null;
            
            if (pendingReferral) {
               const { getUserIdByReferralCode } = await import('./dataService');
               referredById = await getUserIdByReferralCode(pendingReferral);
            }

            const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;

            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.phoneNumber || 'User',
              email: user.email || '',
              points: 0,
              totalEarnings: 0,
              referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
              referredBy: referredById,
              joinedAt: new Date().toISOString(),
              profilePic: user.photoURL,
              paymentInfo: { method: '', details: '' },
              streak: 0,
              lastCheckIn: null,
              spins: 0,
              isAdmin: isSuperAdmin,
              role: isSuperAdmin ? 'super_admin' : 'user'
            };
            await setDoc(userRef, newProfile);

            if (pendingReferral && referredById) {
              await processReferralOnSignup(user.uid, pendingReferral);
              sessionStorage.removeItem('referralCode');
            }

            setProfile(newProfile);
          }

          unsubProfile = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              setProfile(data);
              
              const needsUpdate = !sessionStorage.getItem(`device_updated_${user.uid}`) || 
                                 data.location?.city === 'Unknown' || 
                                 !data.location;

              if (needsUpdate) {
                getDeviceInfo().then(info => {
                  updateUserDeviceInfo(user.uid, info);
                  sessionStorage.setItem(`device_updated_${user.uid}`, 'true');
                });
              }
            }
            setLoading(false);
          }, (err) => {
            console.error("Profile snapshot error:", err);
            setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) (unsubProfile as any)();
    };
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/popup-blocked') {
        throw new Error('পপআপ ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজারে পপআপ অ্যালাউ করুন।');
      } else if (err.code === 'auth/unauthorized-domain') {
        throw new Error(`এই ডোমেইনটি (${window.location.hostname}) অনুমোদিত নয়। অনুগ্রহ করে Firebase Console > Authentication > Settings > Authorized domains-এ এই ইউআরএলটি যোগ করুন।`);
      } else if (err.code === 'auth/disallowed-useragent') {
        throw new Error('গুগল এই ব্রাউজারটি সমর্থন করে না। অনুগ্রহ করে ক্রোম (Chrome) বা অন্য কোনো স্ট্যান্ডার্ড ব্রাউজারে অ্যাপটি ওপেন করুন।');
      }
      throw err;
    }
  };

  const signInEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      }
      throw err;
    }
  };

  const signUpEmail = async (email: string, pass: string, name: string) => {
    try {
      const { updateProfile } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use.');
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    if (user?.email === SUPER_ADMIN_EMAIL) return true;
    if (!adminRecord) return false;
    if (adminRecord.role === 'super_admin') return true;
    return adminRecord.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, adminRecord, loading, 
      signIn, signInEmail, signUpEmail,
      logout, hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
