import { deleteField, doc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../firebase.js';

const getProfilePhotoRef = (userId) => ref(storage, `profilePhotos/${userId}`);

export const uploadProfilePhoto = async (file) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not signed in');
    if (!file) throw new Error('Missing file');

    const storageRef = getProfilePhotoRef(userId);
    await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream'
    });

    const url = await getDownloadURL(storageRef);

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { profilePhotoURL: url }, { merge: true });

    return url;
  } catch (e) {
    throw e;
  }
};

export const deleteProfilePhoto = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not signed in');

    const storageRef = getProfilePhotoRef(userId);
    try {
      await deleteObject(storageRef);
    } catch (e) {
      const code = e?.code || e?.message || '';
      if (!String(code).includes('storage/object-not-found')) {
        throw e;
      }
    }

    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { profilePhotoURL: deleteField() });
    } catch (_) {}
  } catch (e) {
    throw e;
  }
};

