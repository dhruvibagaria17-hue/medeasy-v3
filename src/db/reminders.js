import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const subscribeUserReminders = (userId, onData, onError) => {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
};

export const addReminder = async (data) => {
  try {
    if (!data?.userId) throw new Error('Missing userId');
    if (!data?.medicineName) throw new Error('Missing medicineName');
    if (!data?.time) throw new Error('Missing time');
    if (!data?.frequency) throw new Error('Missing frequency');
    if (import.meta?.env?.DEV) console.log('[Firestore] addReminder userId=', data.userId, 'medicineName=', data.medicineName);

    const payload = {
      userId: data.userId,
      medicineName: data.medicineName,
      dosage: data.dosage,
      time: data.time,
      frequency: data.frequency,
      message: data.message || null,
      createdAt: serverTimestamp()
    };

    const ref = await addDoc(collection(db, 'reminders'), payload);
    if (import.meta?.env?.DEV) console.log('[Firestore] addReminder OK id=', ref.id);
    return { id: ref.id };
  } catch (e) {
    console.error('[Firestore] addReminder ERROR', e);
    throw e;
  }
};

export const getUserReminders = async (userId) => {
  try {
    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    throw e;
  }
};

export const updateReminder = async (reminderId, updatedData) => {
  try {
    if (!reminderId) throw new Error('Missing reminderId');
    if (!updatedData || typeof updatedData !== 'object') throw new Error('Missing updatedData');
    if (import.meta?.env?.DEV) console.log('[Firestore] updateReminder id=', reminderId);
    const ref = doc(db, 'reminders', reminderId);
    await updateDoc(ref, { ...updatedData, updatedAt: serverTimestamp() });
    if (import.meta?.env?.DEV) console.log('[Firestore] updateReminder OK id=', reminderId);
  } catch (e) {
    console.error('[Firestore] updateReminder ERROR', e);
    throw e;
  }
};

export const deleteReminder = async (reminderId) => {
  try {
    if (!reminderId) return;
    if (import.meta?.env?.DEV) console.log('[Firestore] deleteReminder id=', reminderId);
    const ref = doc(db, 'reminders', reminderId);
    await deleteDoc(ref);
    if (import.meta?.env?.DEV) console.log('[Firestore] deleteReminder OK id=', reminderId);
  } catch (e) {
    console.error('[Firestore] deleteReminder ERROR', e);
    throw e;
  }
};
