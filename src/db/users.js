import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export const createUserIfNotExists = async (user) => {
  try {
    const uid = user?.uid;
    if (!uid) throw new Error('Missing user uid');
    if (import.meta?.env?.DEV) console.log('[Firestore] createUserIfNotExists uid=', uid);

    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      if (import.meta?.env?.DEV) console.log('[Firestore] createUserIfNotExists exists uid=', uid);
      return;
    }

    const name =
      user?.displayName ||
      user?.name ||
      user?.email?.split('@')?.[0] ||
      'User';

    await setDoc(ref, {
      name,
      email: user?.email || null,
      phoneNumber: user?.phoneNumber || null,
      profilePhotoURL: user?.photoURL || null,
      createdAt: serverTimestamp()
    });
    if (import.meta?.env?.DEV) console.log('[Firestore] createUserIfNotExists OK uid=', uid);
  } catch (e) {
    console.error('[Firestore] createUserIfNotExists ERROR', e);
    throw e;
  }
};
