import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  AlertCircle, 
  ArrowRightLeft, 
  Activity, 
  Utensils, 
  ArrowLeft,
  BookmarkPlus,
  Bell,
  Check,
  FolderOpen,
  XCircle,
  SearchX,
  Plus,
  LogIn,
  Lock,
  AlertTriangle,
  Baby,
  Clock,
  ChevronDown,
  Info
} from 'lucide-react';
import SMSReminderPopup from './SMSReminderPopup.jsx';
import AuthModal from './AuthModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MEDICINE_DATA } from '../data/medicines.js';
import { getUserFolders, saveMedicineToFolder } from '../db/folders.js';
import { saveSearch } from '../db/searchHistory.js';
import { logMedicineAction } from '../db/medicineHistory.js';

const levenshtein = (a, b) => {
  const s = String(a || '');
  const t = String(b || '');
  if (s === t) return 0;
  if (!s) return t.length;
  if (!t) return s.length;

  const v0 = new Array(t.length + 1);
  const v1 = new Array(t.length + 1);

  for (let i = 0; i <= t.length; i += 1) v0[i] = i;

  for (let i = 0; i < s.length; i += 1) {
    v1[0] = i + 1;
    for (let j = 0; j < t.length; j += 1) {
      const cost = s[i] === t[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= t.length; j += 1) v0[j] = v1[j];
  }
  return v1[t.length];
};

const getSuggestion = (rawQuery) => {
  const q = String(rawQuery || '').trim().toLowerCase();
  if (q.length < 2) return null;

  const keys = Object.keys(MEDICINE_DATA || {});
  if (keys.length === 0) return null;

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const key of keys) {
    const name = String(MEDICINE_DATA?.[key]?.name || key).toLowerCase();
    const keyLc = String(key).toLowerCase();

    const exact = q === keyLc || q === name;
    if (exact) return null;

    const prefixScore = name.startsWith(q) || keyLc.startsWith(q) ? 0 : null;
    const score = prefixScore === null ? Math.min(levenshtein(q, name), levenshtein(q, keyLc)) : prefixScore;

    if (score < bestScore) {
      bestScore = score;
      best = { key, name: MEDICINE_DATA?.[key]?.name || key, score };
    }
  }

  const threshold = Math.max(2, Math.floor(q.length * 0.34));
  if (!best) return null;
  if (bestScore > threshold) return null;
  return best;
};

const DrugDetails = () => {
  const { user } = useAuth();
  const { name } = useParams();
  const navigate = useNavigate();
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotFoundOpen, setIsNotFoundOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [folders, setFolders] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const splitSentences = (rawText) => {
    const text = String(rawText || '').trim();
    if (!text) return [];
    const protectedText = text.replaceAll('St. ', 'St__DOT__ ');
    return protectedText
      .split('. ')
      .map((s) => s.replaceAll('St__DOT__', 'St.').trim())
      .filter(Boolean);
  };

  const formatDescription = (text, sectionId) => {
    if (!text) return null;

    // Special rendering for Side Effects and Contraindications
    if (sectionId === 'side-effects' || sectionId === 'contraindications') {
      const categories = [
        { key: 'Serious', color: 'bg-red-50 border-red-100 text-red-800', icon: AlertCircle },
        { key: 'Urgent', color: 'bg-red-50 border-red-100 text-red-800', icon: AlertCircle },
        { key: 'Very Common', color: 'bg-indigo-50 border-indigo-100 text-indigo-800', icon: Activity },
        { key: 'Common', color: 'bg-blue-50 border-blue-100 text-blue-800', icon: Check },
        { key: 'Uncommon', color: 'bg-amber-50 border-amber-100 text-amber-800', icon: Clock },
        { key: 'Rare', color: 'bg-slate-50 border-slate-100 text-slate-800', icon: Info },
        { key: 'Very Rare', color: 'bg-slate-50 border-slate-100 text-slate-800', icon: Info },
        { key: 'Not Known', color: 'bg-gray-50 border-gray-100 text-gray-800', icon: Info },
        { key: 'Allergic', color: 'bg-purple-50 border-purple-100 text-purple-800', icon: AlertTriangle }
      ];

      const sideEffectsHeaders = ['Serious', 'Urgent', 'Very Common', 'Common', 'Uncommon', 'Rare', 'Very Rare', 'Not Known', 'Allergic'];
      const contraindicationsHeaders = [
        'Allergic',
        'General',
        'History',
        'Medical Conditions',
        'Medical',
        'Age',
        'Pregnancy',
        'Breastfeeding',
        'Intolerance',
        'Viral',
        'Blood Pressure',
        'Infections',
        'Diabetes',
        'Type 1',
        'Sodium Restricted',
        'Potassium Restricted',
        'Calcium Controlled',
        'Serious Disease',
        'Cautions',
        'Interactions'
      ];

      const headers = sectionId === 'side-effects' ? sideEffectsHeaders : contraindicationsHeaders;
      const headerRegex = new RegExp(`\\b(${headers.map(h => h.replace(/\\s+/g, '\\\\s+')).join('|')})\\b\\s*:`, 'gi');

      const matches = [];
      let m;
      while ((m = headerRegex.exec(text)) !== null) {
        matches.push({ label: m[1], start: m.index, end: headerRegex.lastIndex });
      }

      if (matches.length > 0) {
        const sections = [];
        for (let i = 0; i < matches.length; i += 1) {
          const current = matches[i];
          const next = matches[i + 1];
          const header = `${current.label}:`;
          const content = text.slice(current.end, next ? next.start : text.length).trim();
          if (content) sections.push({ header, content });
        }

        const merged = new Map();
        for (const s of sections) {
          const normalized = s.header.replace(':', '').trim().toLowerCase();
          const prev = merged.get(normalized);
          if (prev) merged.set(normalized, { header: prev.header, content: `${prev.content} ${s.content}`.trim() });
          else merged.set(normalized, s);
        }

        const order = new Map(headers.map((h, idx) => [h.toLowerCase(), idx]));
        const orderedSections = Array.from(merged.values()).sort((a, b) => {
          const ai = order.has(a.header.replace(':', '').trim().toLowerCase()) ? order.get(a.header.replace(':', '').trim().toLowerCase()) : 999;
          const bi = order.has(b.header.replace(':', '').trim().toLowerCase()) ? order.get(b.header.replace(':', '').trim().toLowerCase()) : 999;
          return ai - bi;
        });

        const rendered = orderedSections.map((s, idx) => {
          const category = categories.find(c => s.header.toLowerCase().includes(c.key.toLowerCase())) || { color: 'bg-white border-accent1/10 text-textPrimary', icon: Info };

          return (
            <div key={idx} className={`p-5 rounded-2xl border ${category.color} shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <category.icon className="w-4 h-4 shrink-0" />
                <span className="font-black text-xs uppercase tracking-wider">{s.header.replace(':', '')}</span>
              </div>
              <div className="space-y-2">
                {splitSentences(s.content).map((sentence, sIdx) => (
                  <div key={sIdx} className="flex gap-2 items-start">
                    <div className="w-1 h-1 rounded-full bg-current mt-1.5 shrink-0 opacity-40" />
                    <p className="text-[13px] font-medium leading-relaxed opacity-90">
                      {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        });

        return <div className="space-y-3">{rendered}</div>;
      }
    }

    // Default bullet point rendering
    return splitSentences(text).map((sentence, index) => (
      <div key={index} className="flex gap-2 mb-1.5 items-start">
        <div className="w-1 h-1 rounded-full bg-current mt-1.5 shrink-0 opacity-40" />
        <p className="text-[13px] font-medium leading-relaxed opacity-80">
          {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
        </p>
      </div>
    ));
  };

  const decodedName = decodeURIComponent(name).toLowerCase();
  const drugInfo = MEDICINE_DATA[decodedName];
  const suggestion = !drugInfo ? getSuggestion(decodedName) : null;

  useEffect(() => {
    let cancelled = false;
    if (!drugInfo) {
      setIsNotFoundOpen(true);
      return;
    }

    if (!user) {
      const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      if (!recent.includes(decodedName)) {
        const updated = [decodedName, ...recent].slice(0, 10);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
      }
    }

    // Load folders for saving
    const run = async () => {
      if (!user) {
        setFolders([]);
        return;
      }
      try {
        const saved = await getUserFolders(user.uid);
        if (!cancelled) setFolders(saved);
      } catch (_) {
        if (!cancelled) setFolders([]);
      }

      saveSearch(user.uid, decodedName).catch((err) => console.error('[Firestore] saveSearch ERROR', err));
      logMedicineAction(user.uid, drugInfo?.name || decodedName, 'searched').catch(() => {});
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [name, drugInfo, decodedName, user]);

  const closeNotFound = () => {
    setIsNotFoundOpen(false);
    navigate('/search');
  };

  const handleSaveClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsSaveModalOpen(true);
    }
  };

  const saveToFolder = (folderId) => {
    const decodedName = decodeURIComponent(name).toLowerCase();
    if (user) {
      saveMedicineToFolder(user.uid, folderId, decodedName).catch((err) => console.error('[Firestore] saveMedicineToFolder ERROR', err));
      logMedicineAction(user.uid, drugInfo?.name || decodedName, 'saved').catch(() => {});
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaveModalOpen(false);
    }, 1500);
  };

  const sections = drugInfo ? [
    {
      id: 'how-to-take',
      title: "How to take it?",
      description: drugInfo.how_to_take,
      icon: Activity,
      color: "bg-accent1/10 text-accent1"
    },
    {
      id: 'side-effects',
      title: "Possible side effects",
      description: drugInfo.side_effects,
      icon: AlertCircle,
      color: "bg-accent2/10 text-accent2"
    },
    {
      id: 'contraindications',
      title: "Contraindications",
      description: drugInfo.contraindications,
      icon: XCircle,
      color: "bg-red-500/10 text-red-500"
    },
    {
      id: 'interactions-med',
      title: "Interaction with other drugs",
      description: drugInfo.interactions_med,
      icon: ArrowRightLeft,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      id: 'interactions-food',
      title: "Interaction with food",
      description: drugInfo.interactions_food,
      icon: Utensils,
      color: "bg-secondary/10 text-secondary"
    },
    ...(drugInfo.warnings ? [{
      id: 'warnings',
      title: "Important Warnings",
      description: drugInfo.warnings,
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-500"
    }] : []),
    ...(drugInfo.pregnancy ? [{
      id: 'pregnancy',
      title: "Pregnancy & Breastfeeding",
      description: drugInfo.pregnancy,
      icon: Baby,
      color: "bg-pink-500/10 text-pink-500"
    }] : []),
    ...(drugInfo.missed_dose ? [{
      id: 'missed-dose',
      title: "If you miss a dose",
      description: drugInfo.missed_dose,
      icon: Clock,
      color: "bg-indigo-500/10 text-indigo-500"
    }] : [])
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!drugInfo && isNotFoundOpen) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-center border-4 border-white"
          >
            <div className="w-24 h-24 bg-accent2/10 rounded-full flex items-center justify-center mx-auto mb-8 text-accent2">
              <SearchX className="w-12 h-12" />
            </div>
            
            <h3 className="text-2xl font-black text-textPrimary mb-4">Medicine Not Found</h3>
            <p className="text-textSecondary text-lg font-medium leading-relaxed mb-6">
              We couldn't find “{decodeURIComponent(name)}”.
            </p>

            {suggestion ? (
              <div className="mb-6">
                <div className="text-sm font-bold text-textSecondary mb-2">Did you mean:</div>
                <button
                  type="button"
                  onClick={() => navigate(`/drug/${encodeURIComponent(suggestion.key)}`)}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-xl"
                >
                  {suggestion.name}
                </button>
              </div>
            ) : null}
            
            <button
              onClick={closeNotFound}
              className="w-full py-4 rounded-2xl bg-textPrimary text-white font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              Back to Search
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  if (!drugInfo && !isNotFoundOpen) {
    return <div className="p-8 text-center text-textSecondary">Loading drug information...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-10 sm:py-12 px-4 sm:px-8">
      {/* Header with Search & Actions */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8 sm:mb-12">
        <div className="flex flex-col gap-4 max-w-2xl">
          <Link 
            to="/search" 
            className="flex items-center gap-2 text-textSecondary hover:text-primary transition-colors font-bold group w-fit"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-5xl font-black text-textPrimary capitalize tracking-tight">
              {drugInfo.name}
            </h1>
            <p className="text-textSecondary text-base sm:text-xl font-medium leading-relaxed max-w-xl">
              {drugInfo.used_for}
            </p>
          </div>
        </div>

        {drugInfo && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={handleSaveClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-accent1/20 px-4 py-2 rounded-xl text-textSecondary hover:text-primary hover:border-primary/30 transition-all font-semibold shadow-sm"
            >
              <BookmarkPlus className="w-4 h-4" />
              Save Medicine
            </button>
            <button 
              onClick={() => setIsReminderOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent2 text-white px-4 py-2 rounded-xl hover:bg-opacity-90 transition-all font-bold shadow-md shadow-accent2/20"
            >
              <Bell className="w-4 h-4" />
              Set Reminder
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Save to Folder Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsSaveModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md"
            >
              <h3 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-primary" />
                Save to Folder
              </h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {folders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-textSecondary mb-4">You don't have any folders yet.</p>
                    <Link to="/saved" className="text-primary font-bold hover:underline">Create a folder first</Link>
                  </div>
                ) : (
                  folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => saveToFolder(folder.id)}
                      className="w-full p-4 rounded-2xl border border-accent1/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
                    >
                      <span className="font-bold text-textPrimary group-hover:text-primary transition-colors">{folder.name}</span>
                      {saveSuccess ? <Check className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-textSecondary" />}
                    </button>
                  ))
                )}
              </div>
              
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="w-full py-3 rounded-xl text-textSecondary font-bold hover:bg-background transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SMS Reminder Popup */}
      {drugInfo && (
        <SMSReminderPopup 
          isOpen={isReminderOpen} 
          onClose={() => setIsReminderOpen(false)} 
          drugName={decodeURIComponent(name)}
        />
      )}

      {/* Main Sections Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4"
      >
        {sections.map((section) => (
          <motion.div
            key={section.id}
            variants={itemVariants}
            className="group"
          >
            <div 
              onClick={() => toggleSection(section.id)}
              className={`w-full text-left p-6 rounded-3xl border border-transparent transition-all duration-300 cursor-pointer ${
                expandedSection === section.id 
                ? 'bg-white shadow-xl border-accent1/20 scale-[1.01]' 
                : 'bg-white/50 hover:bg-white hover:shadow-lg border-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${section.color}`}>
                    <section.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-textPrimary tracking-tight">
                    {section.title}
                  </h3>
                </div>
                <div className={`p-2 rounded-full transition-all duration-300 ${expandedSection === section.id ? 'bg-primary/10 text-primary rotate-180' : 'bg-background text-textSecondary'}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 pb-2 px-1 border-t border-accent1/10 mt-6 text-textSecondary">
                      {formatDescription(section.description, section.id)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Notice Area */}
      {drugInfo && (
        <div className="mt-12 p-8 rounded-2xl bg-accent1/5 border border-dashed border-accent1/40 text-center">
          <p className="text-textSecondary italic text-sm">
            Disclaimer: Information for this drug is being updated. Please consult your healthcare provider for medical advice.
          </p>
        </div>
      )}
    </div>
  );
};

export default DrugDetails;
