import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MEDICINE_DATA } from '../data/medicines.js';
import { useAuth } from '../context/AuthContext.jsx';
import { saveSearch } from '../db/searchHistory.js';

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

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [commonSearches, setCommonSearches] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const saveGuestSearch = (q) => {
    const term = (q || '').trim();
    if (!term) return;
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    if (!recent.includes(term)) {
      const updated = [term, ...recent].slice(0, 10);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (MEDICINE_DATA) {
      // Get all available medicine keys
      const allKeys = Object.keys(MEDICINE_DATA);
      
      if (allKeys.length > 0) {
        // Shuffle and pick 2-3
        const shuffled = [...allKeys].sort(() => 0.5 - Math.random());
        const count = Math.min(allKeys.length, Math.floor(Math.random() * 2) + 2); // Returns 2 or 3
        setCommonSearches(shuffled.slice(0, count));
      }
    }
  }, []);

  useEffect(() => {
    setSuggestion(getSuggestion(query));
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (user) saveSearch(user.uid, q).catch((err) => console.error('[Firestore] saveSearch ERROR', err));
      else saveGuestSearch(q);
      navigate(`/drug/${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 text-center">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-textPrimary mb-3">
          How can we help you today?
        </h2>
        <p className="text-textSecondary text-base mb-8 max-w-md mx-auto">
          Enter the name of a medication to find reliable information about its contents, side effects, and more.
        </p>

        <form onSubmit={handleSearch} className="group">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a drug (e.g. Paracetamol)..."
              className="w-full px-6 py-4 pl-14 pr-6 sm:pr-28 rounded-2xl bg-white border-2 border-accent1/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-base shadow-sm group-hover:shadow-md"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary group-focus-within:text-primary transition-colors" />
            <button
              type="submit"
              className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white font-bold px-5 py-2 rounded-xl hover:bg-opacity-80 transition-all active:scale-95 text-sm"
            >
              Search
            </button>
          </div>

          <button
            type="submit"
            className="sm:hidden w-full mt-3 bg-primary text-white font-bold py-3 rounded-2xl hover:bg-opacity-80 transition-all active:scale-95 text-sm"
          >
            Search
          </button>
        </form>

        {suggestion ? (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-textSecondary font-bold">Did you mean:</span>
            <button
              type="button"
              onClick={() => {
                const key = suggestion.key;
                const name = suggestion.name;
                setQuery(name);
                if (user) saveSearch(user.uid, key).catch((err) => console.error('[Firestore] saveSearch ERROR', err));
                else saveGuestSearch(key);
                navigate(`/drug/${encodeURIComponent(key)}`);
              }}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-black hover:bg-primary/15 transition-colors active:scale-95"
            >
              {suggestion.name}
            </button>
          </div>
        ) : null}

        <div className="mt-6 flex gap-2 flex-wrap justify-center">
          <span className="text-xs text-textSecondary font-bold">Common searches:</span>
          {commonSearches.map((key) => (
            <button
              key={key}
              onClick={() => {
                const drugName = MEDICINE_DATA[key].name;
                setQuery(drugName);
                if (user) saveSearch(user.uid, key).catch((err) => console.error('[Firestore] saveSearch ERROR', err));
                else saveGuestSearch(key);
                navigate(`/drug/${encodeURIComponent(key)}`);
              }}
              className="text-[11px] px-3 py-1 bg-white border border-accent1/20 rounded-full hover:border-primary hover:text-primary transition-all font-semibold shadow-sm hover:shadow-md active:scale-95"
            >
              {MEDICINE_DATA[key].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
