import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import { createUserIfNotExists } from '../db/users.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const normalizedUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')?.[0] || 'User',
        email: firebaseUser.email || null,
        avatar: firebaseUser.photoURL || null
      };

      setUser(normalizedUser);
      try {
        await createUserIfNotExists(firebaseUser);
      } catch (_) {}
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const validatePassword = (password) => {
    const minLength = 12;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    if (password.length < minLength) return 'Password must be at least 12 characters long';
    if (!hasSymbol) return 'Password must contain at least one symbol';
    if (!hasUpper) return 'Password must contain at least one capital letter';
    return null;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async ({ email, password, name }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const signInWithEmail = async ({ email, password }) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      validatePassword,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      resetPassword,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
