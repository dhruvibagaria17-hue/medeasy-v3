import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  FolderPlus, 
  Folder, 
  Trash2, 
  Plus, 
  MoreVertical, 
  Pill,
  ChevronRight,
  ChevronDown,
  Lock,
  LogIn
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './AuthModal.jsx';
import {
  createFolder as createFolderDoc,
  deleteFolder as deleteFolderDoc,
  removeMedicine as removeSavedMedicine,
  subscribeMedicinesInFolder,
  subscribeUserFolders
} from '../db/folders.js';

const SavedMedicines = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [medicinesByFolder, setMedicinesByFolder] = useState({});
  const [medicinesLoadingByFolder, setMedicinesLoadingByFolder] = useState({});
  const medicinesUnsubByFolderRef = useRef({});

  useEffect(() => {
    if (!user) {
      setFolders([]);
      setFoldersLoading(false);
      return;
    }
    setFoldersLoading(true);
    setError('');
    const unsub = subscribeUserFolders(
      user.uid,
      (data) => {
        setFolders(data);
        setFoldersLoading(false);
      },
      (err) => {
        console.error('[Firestore] subscribeUserFolders ERROR', err);
        setFoldersLoading(false);
        setError('Could not load folders. Please try again.');
      }
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const openFolderId = location.state?.openFolderId;
    if (!openFolderId || !user) return;
    setExpandedFolders((prev) => ({ ...prev, [openFolderId]: true }));
    if (!medicinesUnsubByFolderRef.current[openFolderId]) {
      setMedicinesLoadingByFolder((prev) => ({ ...prev, [openFolderId]: true }));
      medicinesUnsubByFolderRef.current[openFolderId] = subscribeMedicinesInFolder(
        user.uid,
        openFolderId,
        (docs) => {
          setMedicinesByFolder((prev) => ({ ...prev, [openFolderId]: docs }));
          setMedicinesLoadingByFolder((prev) => ({ ...prev, [openFolderId]: false }));
        },
        (err) => {
          console.error('[Firestore] subscribeMedicinesInFolder ERROR', err);
          setMedicinesLoadingByFolder((prev) => ({ ...prev, [openFolderId]: false }));
        }
      );
    }
    requestAnimationFrame(() => {
      const el = document.getElementById(`folder-${openFolderId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.state, user]);

  useEffect(() => {
    return () => {
      Object.values(medicinesUnsubByFolderRef.current).forEach((unsub) => {
        try {
          unsub?.();
        } catch (_) {}
      });
      medicinesUnsubByFolderRef.current = {};
    };
  }, []);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 text-primary">
          <Lock className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-textPrimary mb-4 tracking-tight">Sign in to view your folders</h1>
        <p className="text-textSecondary text-xl max-w-md mb-12 font-medium leading-relaxed">
          Keep your medication history safe and organized across all your devices.
        </p>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-4 bg-primary text-white font-black px-12 py-5 rounded-[2rem] text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <LogIn className="w-8 h-8" />
          Sign In Now
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    if (!user) return;
    try {
      setError('');
      await createFolderDoc(user.uid, newFolderName);
      setNewFolderName('');
      setIsNewFolderModalOpen(false);
    } catch (e2) {
      console.error('[Firestore] createFolder ERROR', e2);
      setError(e2?.message || 'Could not create folder.');
    }
  };

  const deleteFolder = async (id) => {
    if (!user) return;
    try {
      setError('');
      await deleteFolderDoc(user.uid, id);
      setMedicinesByFolder((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setMedicinesLoadingByFolder((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setExpandedFolders((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e2) {
      console.error('[Firestore] deleteFolder ERROR', e2);
      setError(e2?.message || 'Could not delete folder.');
    }
  };

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => {
      const nextExpanded = !prev[id];

      if (!user) return { ...prev, [id]: nextExpanded };

      if (nextExpanded) {
        if (!medicinesUnsubByFolderRef.current[id]) {
          setMedicinesLoadingByFolder((p) => ({ ...p, [id]: true }));
          medicinesUnsubByFolderRef.current[id] = subscribeMedicinesInFolder(
            user.uid,
            id,
            (docs) => {
              setMedicinesByFolder((p) => ({ ...p, [id]: docs }));
              setMedicinesLoadingByFolder((p) => ({ ...p, [id]: false }));
            },
            (err) => {
              console.error('[Firestore] subscribeMedicinesInFolder ERROR', err);
              setMedicinesLoadingByFolder((p) => ({ ...p, [id]: false }));
            }
          );
        }
      } else {
        try {
          medicinesUnsubByFolderRef.current[id]?.();
        } catch (_) {}
        delete medicinesUnsubByFolderRef.current[id];
      }

      return { ...prev, [id]: nextExpanded };
    });
  };

  const removeMedicine = async (folderId, savedId) => {
    try {
      if (!user) return;
      setError('');
      await removeSavedMedicine(user.uid, savedId);
      setMedicinesByFolder((prev) => ({
        ...prev,
        [folderId]: (prev[folderId] || []).filter((m) => m.id !== savedId)
      }));
    } catch (e2) {
      console.error('[Firestore] removeMedicine ERROR', e2);
      setError(e2?.message || 'Could not remove medicine.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-textPrimary mb-2 flex items-center gap-3">
            <Bookmark className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            Saved Medicines
          </h1>
          <p className="text-textSecondary text-lg">Organize your medications into custom folders for quick access.</p>
        </div>
        
        <button 
          onClick={() => setIsNewFolderModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-opacity-80 transition-all shadow-sm"
        >
          <FolderPlus className="w-5 h-5" />
          New Folder
        </button>
      </div>

      {error ? (
        <div className="mb-6 bg-accent2/10 border border-accent2/20 text-accent2 p-4 rounded-2xl text-sm font-bold">
          {error}
        </div>
      ) : null}

      <AnimatePresence>
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsNewFolderModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md"
            >
              <h3 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                <FolderPlus className="w-6 h-6 text-primary" />
                Create New Folder
              </h3>
              <form onSubmit={createFolder} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-textPrimary block">Folder Name</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g., Heart Medications, Daily Vitamins..."
                    className="w-full px-4 py-4 rounded-xl bg-background border border-accent1/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-textSecondary font-bold hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-opacity-80 transition-all shadow-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {foldersLoading ? (
        <div className="bg-white p-12 rounded-[3rem] border border-accent1/20 text-center shadow-sm">
          <p className="text-textSecondary font-bold">Loading folders…</p>
        </div>
      ) : folders.length === 0 ? (
        <div className="bg-white p-16 rounded-[3rem] border border-accent1/20 text-center shadow-sm">
          <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto mb-8">
            <Bookmark className="w-12 h-12 text-accent1" />
          </div>
          <h3 className="text-2xl font-bold text-textPrimary mb-4">Your medication library is empty</h3>
          <p className="text-textSecondary mb-10 max-w-md mx-auto">Create folders and save medications while you search to keep them organized here.</p>
          <button 
            onClick={() => setIsNewFolderModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-10 py-4 rounded-xl hover:bg-opacity-80 transition-all shadow-lg shadow-primary/20"
          >
            Create Your First Folder
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {folders.map((folder) => (
            <div id={`folder-${folder.id}`} key={folder.id} className="bg-white rounded-3xl border border-accent1/20 overflow-hidden transition-all shadow-sm hover:shadow-md scroll-mt-28">
              <div 
                className="p-6 flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleFolder(folder.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${expandedFolders[folder.id] ? 'bg-primary text-white' : 'bg-background text-textSecondary'}`}>
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-textPrimary group-hover:text-primary transition-colors">{folder.name}</h3>
                    <p className="text-sm text-textSecondary">
                      {(medicinesByFolder[folder.id]?.length || 0)} medication{(medicinesByFolder[folder.id]?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id);
                    }}
                    className="p-2 text-textSecondary hover:text-accent2 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="p-2 text-textSecondary">
                    {expandedFolders[folder.id] ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedFolders[folder.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-accent1/10 bg-background/30"
                  >
                    <div className="p-6 space-y-3">
                      {medicinesLoadingByFolder[folder.id] ? (
                        <div className="py-8 text-center">
                          <p className="text-textSecondary text-sm mb-4 italic">Loading medications…</p>
                        </div>
                      ) : (medicinesByFolder[folder.id]?.length || 0) === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-textSecondary text-sm mb-4 italic">No medications saved in this folder yet.</p>
                          <Link to="/search" className="text-primary text-sm font-bold hover:underline flex items-center justify-center gap-1">
                            Go to search <Plus className="w-4 h-4" />
                          </Link>
                        </div>
                      ) : (
                        medicinesByFolder[folder.id].map((med) => (
                          <div key={med.id} className="bg-white p-4 rounded-2xl border border-accent1/10 flex items-center justify-between group">
                            <Link 
                              to={`/drug/${encodeURIComponent(med.medicineName)}`}
                              className="flex items-center gap-4 flex-1"
                            >
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Pill className="w-5 h-5 text-primary" />
                              </div>
                              <span className="font-bold text-textPrimary text-lg group-hover:text-primary transition-colors capitalize">{med.medicineName}</span>
                            </Link>
                            <button 
                              onClick={() => removeMedicine(folder.id, med.id)}
                              className="p-2 text-textSecondary hover:text-accent2 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedMedicines;
