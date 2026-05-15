import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as limitQuery,
  onSnapshot,
  query as buildQuery,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const subscribeUserSearchHistory = (userId, limit = 10, onData, onError) => {
  const q = buildQuery(
    collection(db, 'searchHistory'),
    where('userId', '==', userId),
    limitQuery(200)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => {
        const at = a?.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const bt = b?.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return bt - at;
      });
      const seen = new Set();
      const unique = [];
      for (const r of rows) {
        const key = String(r?.query || '').trim().toLowerCase();
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(r);
        if (unique.length >= limit) break;
      }
      onData(unique);
    },
    onError
  );
};

export const saveSearch = async (userId, query) => {
  try {
    if (!userId) throw new Error('Missing userId');

    const trimmed = (query || '').trim();
    if (!trimmed) return;
    if (import.meta?.env?.DEV) console.log('[Firestore] saveSearch userId=', userId, 'query=', trimmed);

    await addDoc(collection(db, 'searchHistory'), {
      userId,
      query: trimmed,
      timestamp: serverTimestamp()
    });
    if (import.meta?.env?.DEV) console.log('[Firestore] saveSearch OK userId=', userId);
  } catch (e) {
    console.error('[Firestore] saveSearch ERROR', e);
    throw e;
  }
};

export const getUserSearchHistory = async (userId, limit = 10) => {
  try {
    const q = buildQuery(
      collection(db, 'searchHistory'),
      where('userId', '==', userId),
      limitQuery(200)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      const at = a?.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
      const bt = b?.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
      return bt - at;
    });
    const seen = new Set();
    const unique = [];
    for (const r of rows) {
      const key = String(r?.query || '').trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(r);
      if (unique.length >= limit) break;
    }
    return unique;
  } catch (e) {
    throw e;
  }
};

export const clearSearchHistory = async (userId) => {
  try {
    if (!userId) throw new Error('Missing userId');
    if (import.meta?.env?.DEV) console.log('[Firestore] clearSearchHistory userId=', userId);
    const q = buildQuery(collection(db, 'searchHistory'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    if (import.meta?.env?.DEV) console.log('[Firestore] clearSearchHistory OK userId=', userId);
  } catch (e) {
    console.error('[Firestore] clearSearchHistory ERROR', e);
    throw e;
  }
};

export const deleteSearch = async (searchId) => {
  try {
    if (!searchId) return;
    await deleteDoc(doc(db, 'searchHistory', searchId));
  } catch (e) {
    console.error('[Firestore] deleteSearch ERROR', e);
    throw e;
  }
};
