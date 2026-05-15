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

export const subscribeUserFolders = (userId, onData, onError) => {
  const q = buildQuery(
    collection(db, 'folders'),
    where('userId', '==', userId),
    limitQuery(200)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => {
        const at = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bt = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bt - at;
      });
      onData(rows);
    },
    onError
  );
};

export const createFolder = async (userId, folderName) => {
  try {
    if (!userId) throw new Error('Missing userId');
    const trimmed = (folderName || '').trim();
    if (!trimmed) throw new Error('Folder name is required');
    if (import.meta?.env?.DEV) console.log('[Firestore] createFolder userId=', userId, 'name=', trimmed);

    const ref = await addDoc(collection(db, 'folders'), {
      userId,
      name: trimmed,
      createdAt: serverTimestamp()
    });

    if (import.meta?.env?.DEV) console.log('[Firestore] createFolder OK id=', ref.id);
    return { id: ref.id };
  } catch (e) {
    console.error('[Firestore] createFolder ERROR', e);
    throw e;
  }
};

export const getUserFolders = async (userId) => {
  try {
    const q = buildQuery(
      collection(db, 'folders'),
      where('userId', '==', userId),
      limitQuery(200)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      const at = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bt = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bt - at;
    });
    return rows;
  } catch (e) {
    throw e;
  }
};

export const deleteFolder = async (userId, folderId) => {
  try {
    if (!userId) throw new Error('Missing userId');
    if (!folderId) throw new Error('Missing folderId');
    if (import.meta?.env?.DEV) console.log('[Firestore] deleteFolder userId=', userId, 'folderId=', folderId);

    const batch = writeBatch(db);

    const savedQ = buildQuery(
      collection(db, 'savedMedicines'),
      where('userId', '==', userId),
      where('folderId', '==', folderId)
    );
    const savedSnap = await getDocs(savedQ);
    savedSnap.docs.forEach((d) => batch.delete(d.ref));

    batch.delete(doc(db, 'folders', folderId));
    await batch.commit();
    if (import.meta?.env?.DEV) console.log('[Firestore] deleteFolder OK folderId=', folderId);
  } catch (e) {
    console.error('[Firestore] deleteFolder ERROR', e);
    throw e;
  }
};

export const saveMedicineToFolder = async (userId, folderId, medicineName) => {
  try {
    if (!userId) throw new Error('Missing userId');
    if (!folderId) throw new Error('Missing folderId');
    const trimmed = (medicineName || '').trim();
    if (!trimmed) throw new Error('Medicine name is required');
    if (import.meta?.env?.DEV) console.log('[Firestore] saveMedicineToFolder userId=', userId, 'folderId=', folderId, 'medicineName=', trimmed);

    const existsQ = buildQuery(
      collection(db, 'savedMedicines'),
      where('userId', '==', userId),
      where('folderId', '==', folderId),
      where('medicineName', '==', trimmed),
      limitQuery(1)
    );
    const existsSnap = await getDocs(existsQ);
    if (!existsSnap.empty) {
      if (import.meta?.env?.DEV) console.log('[Firestore] saveMedicineToFolder exists savedId=', existsSnap.docs[0].id);
      return { id: existsSnap.docs[0].id, exists: true };
    }

    const ref = await addDoc(collection(db, 'savedMedicines'), {
      userId,
      folderId,
      medicineName: trimmed,
      createdAt: serverTimestamp()
    });

    if (import.meta?.env?.DEV) console.log('[Firestore] saveMedicineToFolder OK savedId=', ref.id);
    return { id: ref.id };
  } catch (e) {
    console.error('[Firestore] saveMedicineToFolder ERROR', e);
    throw e;
  }
};

export const subscribeMedicinesInFolder = (userId, folderId, onData, onError) => {
  const q = buildQuery(
    collection(db, 'savedMedicines'),
    where('userId', '==', userId),
    where('folderId', '==', folderId),
    limitQuery(500)
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => {
        const at = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bt = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bt - at;
      });
      onData(rows);
    },
    onError
  );
};

export const getMedicinesInFolder = async (userId, folderId) => {
  try {
    if (!userId) throw new Error('Missing userId');

    const q = buildQuery(
      collection(db, 'savedMedicines'),
      where('userId', '==', userId),
      where('folderId', '==', folderId),
      limitQuery(500)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      const at = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bt = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bt - at;
    });
    return rows;
  } catch (e) {
    console.error('[Firestore] getMedicinesInFolder ERROR', e);
    throw e;
  }
};

export const removeMedicine = async (userId, savedId) => {
  try {
    if (!userId) throw new Error('Missing userId');
    if (!savedId) throw new Error('Missing savedId');
    if (import.meta?.env?.DEV) console.log('[Firestore] removeMedicine userId=', userId, 'savedId=', savedId);
    await deleteDoc(doc(db, 'savedMedicines', savedId));
    if (import.meta?.env?.DEV) console.log('[Firestore] removeMedicine OK savedId=', savedId);
  } catch (e) {
    console.error('[Firestore] removeMedicine ERROR', e);
    throw e;
  }
};
