import { db } from '../lib/firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const getUserDocRef = (uid) => doc(db, 'users', uid);

export const ensureUserProfile = async ({ uid, email, displayName, photoURL }) => {
  const ref = getUserDocRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    name: displayName || email?.split('@')?.[0] || 'User',
    email: email || null,
    phoneNumber: null,
    profilePhotoURL: photoURL || null,
    createdAt: serverTimestamp()
  });
};

export const getUserProfile = async (uid) => {
  const ref = getUserDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { name: null, email: null, phoneNumber: null, profilePhotoURL: null };
  const data = snap.data();
  return {
    name: data.name ?? data.displayName ?? null,
    email: data.email ?? null,
    phoneNumber: data.phoneNumber ?? null,
    profilePhotoURL: data.profilePhotoURL ?? data.photoURL ?? null
  };
};

export const updateUserProfile = async (uid, updates) => {
  try {
    if (!uid) throw new Error('Missing userId');
    if (!updates || typeof updates !== 'object') throw new Error('Missing updates');
    if (import.meta?.env?.DEV) console.log('[Firestore] updateUserProfile uid=', uid, 'updates=', updates);

    const ref = getUserDocRef(uid);
    await setDoc(ref, updates, { merge: true });

    if (import.meta?.env?.DEV) console.log('[Firestore] updateUserProfile OK uid=', uid);
  } catch (e) {
    console.error('[Firestore] updateUserProfile ERROR', e);
    throw e;
  }
};
