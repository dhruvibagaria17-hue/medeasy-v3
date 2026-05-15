import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { clearSearchHistory, deleteSearch, subscribeUserSearchHistory } from '../db/searchHistory.js';

const RecentSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsub = subscribeUserSearchHistory(
        user.uid,
        10,
        (docs) => {
          setSearches(docs.map((d) => ({ id: d.id, query: d.query })));
          setLoading(false);
        },
        (err) => {
          console.error('[Firestore] subscribeUserSearchHistory ERROR', err);
          setLoading(false);
        }
      );
      return () => unsub();
    }

    const saved = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    setSearches(saved.map((q) => ({ id: q, query: q })));
    setLoading(false);
  }, [user]);

  const clearSearches = () => {
    if (user) {
      clearSearchHistory(user.uid).catch(() => {});
      return;
    }
    localStorage.setItem('recent_searches', '[]');
    setSearches([]);
  };

  const removeSearch = (item) => {
    if (user) {
      deleteSearch(item.id).catch(() => {});
      return;
    }
    const updated = searches.filter((s) => s.query !== item.query).map((s) => s.query);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    setSearches(updated.map((q) => ({ id: q, query: q })));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-textPrimary mb-2 flex items-center gap-3">
            <History className="w-10 h-10 text-secondary" />
            Recent Searches
          </h1>
          <p className="text-textSecondary text-lg">Quickly access medications you've looked up lately.</p>
        </div>
        
        {!loading && searches.length > 0 && (
          <button 
            onClick={clearSearches}
            className="flex items-center gap-2 text-accent2 hover:bg-accent2/10 px-4 py-2 rounded-xl transition-all font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-accent1/20 text-center shadow-sm">
          <p className="text-textSecondary font-bold">Loading…</p>
        </div>
      ) : searches.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-accent1/20 text-center shadow-sm">
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-accent1" />
          </div>
          <h3 className="text-xl font-bold text-textPrimary mb-2">No recent searches yet</h3>
          <p className="text-textSecondary mb-8 max-w-sm mx-auto">Your search history will appear here once you start looking up medications.</p>
          <Link 
            to="/search" 
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-opacity-80 transition-all"
          >
            Start Searching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {searches.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
              className="group bg-white p-6 rounded-2xl border border-accent1/20 hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between"
            >
              <Link 
                to={`/drug/${encodeURIComponent(item.query)}`}
                className="flex items-center gap-4 flex-1"
              >
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Search className="w-5 h-5 text-textSecondary group-hover:text-primary" />
                </div>
                <span className="font-bold text-textPrimary text-lg group-hover:text-primary transition-colors capitalize">{item.query}</span>
              </Link>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => removeSearch(item)}
                  className="p-2 text-textSecondary hover:text-accent2 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/drug/${encodeURIComponent(item.query)}`} className="p-2 text-primary">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSearches;
