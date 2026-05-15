import {
  addDoc,
  collection,
  getDocs,
  limit as limitQuery,
  onSnapshot,
  orderBy,
  query as buildQuery,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const logMedicineAction = async (userId, medicineName, action) => {
  try {
    if (!userId) throw new Error('Missing userId');
    if (!medicineName) throw new Error('Missing medicineName');
    if (!action) throw new Error('Missing action');
    if (import.meta?.env?.DEV) console.log('[Firestore] logMedicineAction userId=', userId, 'medicineName=', medicineName, 'action=', action);
    await addDoc(collection(db, 'medicineHistory'), {
      userId,
      medicineName,
      action,
      timestamp: serverTimestamp()
    });
    if (import.meta?.env?.DEV) console.log('[Firestore] logMedicineAction OK userId=', userId);
  } catch (e) {
    console.error('[Firestore] logMedicineAction ERROR', e);
    throw e;
  }
};

export const getUserMedicineHistory = async (userId, limit = 50) => {
  try {
    const q = buildQuery(
      collection(db, 'medicineHistory'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limitQuery(limit)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    throw e;
  }
};

export const subscribeUserMedicineHistory = (userId, limit = 50, onData, onError) => {
  const q = buildQuery(
    collection(db, 'medicineHistory'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limitQuery(limit)
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
};
