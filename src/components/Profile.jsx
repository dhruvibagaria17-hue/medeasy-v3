import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Bell, History, Trash2, Plus, User, ArrowRight, Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './AuthModal.jsx';
import { MEDICINE_DATA } from '../data/medicines.js';
import { getUserProfile, updateUserProfile } from '../services/userData.js';
import { addReminder as addReminderDoc, deleteReminder as deleteReminderDoc, subscribeUserReminders } from '../db/reminders.js';
import { deleteSearch, subscribeUserSearchHistory } from '../db/searchHistory.js';

const Profile = () => {
  const { user } = useAuth();
  const { tab } = useParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reminders, setReminders] = useState([]);
  const [historySearches, setHistorySearches] = useState([]);

  const medicineOptions = useMemo(() => {
    const keys = Object.keys(MEDICINE_DATA || {});
    return keys.map((k) => ({ key: k, name: MEDICINE_DATA[k]?.name || k }));
  }, []);

  const [newReminder, setNewReminder] = useState({
    medicineKey: '',
    dosage: '',
    frequency: 'Daily',
    time: '09:00',
    message: ''
  });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      setError('');
      try {
        const profile = await getUserProfile(user.uid);
        if (cancelled) return;
        setContactEmail(profile?.email || user.email || '');
        setPhoneNumber(profile?.phoneNumber || '');
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Could not load profile.');
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setReminders([]);
      setRemindersLoading(false);
      return;
    }
    setRemindersLoading(true);
    const unsub = subscribeUserReminders(
      user.uid,
      (data) => {
        setReminders(data);
        setRemindersLoading(false);
      },
      () => setRemindersLoading(false)
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setHistorySearches([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    const unsub = subscribeUserSearchHistory(
      user.uid,
      50,
      (docs) => {
        setHistorySearches(docs.map((d) => ({ id: d.id, query: d.query })));
        setHistoryLoading(false);
      },
      () => setHistoryLoading(false)
    );
    return () => unsub();
  }, [user]);

  const activeTab = tab === 'reminders' || tab === 'history' || tab === 'contact' ? tab : 'contact';

  useEffect(() => {
    setInfo('');
    setError('');
  }, [activeTab]);

  const saveContact = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await updateUserProfile(user.uid, {
        email: contactEmail || null,
        phoneNumber: phoneNumber || null
      });
      setInfo('Profile updated.');
      setTimeout(() => setInfo(''), 2000);
    } catch (e) {
      setError(e?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const addReminder = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setInfo('');

    const medicineKey = newReminder.medicineKey || '';
    if (!medicineKey) {
      setError('Select a medicine for the reminder.');
      return;
    }

    setSaving(true);
    try {
      const medicineName = MEDICINE_DATA?.[medicineKey]?.name || medicineKey;
      await addReminderDoc({
        userId: user.uid,
        medicineName,
        dosage: newReminder.dosage || null,
        time: newReminder.time,
        frequency: newReminder.frequency,
        message: newReminder.message || null
      });
      setNewReminder({ medicineKey: '', dosage: '', frequency: 'Daily', time: '09:00', message: '' });
      setInfo('Reminder added.');
      setTimeout(() => setInfo(''), 2000);
    } catch (e2) {
      setError(e2?.message || 'Could not add reminder.');
    } finally {
      setSaving(false);
    }
  };

  const deleteReminder = async (id) => {
    if (!user) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await deleteReminderDoc(id);
      setInfo('Reminder removed.');
      setTimeout(() => setInfo(''), 2000);
    } catch (e) {
      setError(e?.message || 'Could not remove reminder.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
          <User className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-textPrimary mb-3 tracking-tight">Profile</h1>
        <p className="text-textSecondary text-base sm:text-lg max-w-md mb-8 font-medium leading-relaxed">
          Sign in to add your phone number, email, reminders, and view your medicine history.
        </p>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          Sign in
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-10 sm:py-12 px-4"
    >
      <div className="mb-10">
        <h1 className="text-3xl sm:text-5xl font-black text-textPrimary tracking-tight">Profile</h1>
        <p className="text-textSecondary mt-2">Manage your account details, reminders, and history.</p>
      </div>

      {error && <div className="mb-6 bg-accent2/10 border border-accent2/20 text-accent2 p-4 rounded-2xl text-sm font-bold">{error}</div>}
      {info && (!info.toLowerCase().startsWith('reminder') || activeTab === 'reminders') && (
        <div className="mb-6 bg-secondary/10 border border-secondary/20 text-secondary p-4 rounded-2xl text-sm font-bold">{info}</div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/profile/contact"
          className={`px-4 py-2 rounded-2xl font-black text-sm transition-colors ${activeTab === 'contact' ? 'bg-primary text-white' : 'bg-white/70 text-textSecondary hover:text-textPrimary hover:bg-white border border-accent1/20'}`}
        >
          Contact details
        </Link>
        <Link
          to="/profile/reminders"
          className={`px-4 py-2 rounded-2xl font-black text-sm transition-colors ${activeTab === 'reminders' ? 'bg-primary text-white' : 'bg-white/70 text-textSecondary hover:text-textPrimary hover:bg-white border border-accent1/20'}`}
        >
          Reminders
        </Link>
        <Link
          to="/profile/history"
          className={`px-4 py-2 rounded-2xl font-black text-sm transition-colors ${activeTab === 'history' ? 'bg-primary text-white' : 'bg-white/70 text-textSecondary hover:text-textPrimary hover:bg-white border border-accent1/20'}`}
        >
          Medicine history
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'contact' && (
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-accent1/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">Contact details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-textPrimary flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent2" />
                  Email id
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-accent1/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-textPrimary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent2" />
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-accent1/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={saveContact}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-accent1/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-accent2/10 text-accent2 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">Reminders</h2>
            </div>

            <form onSubmit={addReminder} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select
                value={newReminder.medicineKey}
                onChange={(e) => setNewReminder((p) => ({ ...p, medicineKey: e.target.value }))}
                className="md:col-span-2 w-full px-4 py-3 rounded-2xl bg-background border border-accent1/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
              >
                <option value="">Select medicine</option>
                {medicineOptions.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newReminder.dosage}
                onChange={(e) => setNewReminder((p) => ({ ...p, dosage: e.target.value }))}
                placeholder="Dosage"
                className="w-full px-4 py-3 rounded-2xl bg-background border border-accent1/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
              />
              <select
                value={newReminder.frequency}
                onChange={(e) => setNewReminder((p) => ({ ...p, frequency: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-accent1/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
              >
                <option value="Daily">Daily</option>
                <option value="Every 12h">Every 12h</option>
                <option value="Every 8h">Every 8h</option>
                <option value="Weekly">Weekly</option>
              </select>
              <input
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder((p) => ({ ...p, time: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-accent1/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
              />

              <div className="md:col-span-4">
                <input
                  type="text"
                  value={newReminder.message}
                  onChange={(e) => setNewReminder((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Optional message"
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-accent1/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="md:col-span-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {remindersLoading ? (
                <div className="text-sm text-textSecondary font-medium">Loading reminders…</div>
              ) : reminders.length === 0 ? (
                <div className="text-sm text-textSecondary font-medium">No reminders yet.</div>
              ) : (
                reminders.map((r) => (
                  <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-background/60 border border-accent1/15 rounded-2xl p-4">
                    <div>
                      <div className="font-black text-textPrimary">
                        {r.medicineName}
                      </div>
                      <div className="text-xs text-textSecondary font-bold">
                        {r.frequency} • {r.time}{r.dosage ? ` • ${r.dosage}` : ''}{r.message ? ` • ${r.message}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteReminder(r.id)}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-textSecondary hover:text-accent2 hover:bg-white/70 transition-colors disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-accent1/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">Medicine history</h2>
            </div>

            {historyLoading ? (
              <div className="text-sm text-textSecondary font-medium">Loading history…</div>
            ) : historySearches.length === 0 ? (
              <div className="text-sm text-textSecondary font-medium">No history yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {historySearches.slice(0, 50).map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white p-6 rounded-2xl border border-accent1/20 hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <Link to={`/drug/${encodeURIComponent(item.query)}`} className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Search className="w-5 h-5 text-textSecondary group-hover:text-primary" />
                      </div>
                      <span className="font-bold text-textPrimary text-lg group-hover:text-primary transition-colors capitalize">
                        {item.query}
                      </span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => deleteSearch(item.id).catch((err) => console.error('[Firestore] deleteSearch ERROR', err))}
                        className="p-2 text-textSecondary hover:text-accent2 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link to={`/drug/${encodeURIComponent(item.query)}`} className="p-2 text-primary">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
